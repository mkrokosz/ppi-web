#!/usr/bin/env python3
"""
Blueprint Generator - Creates clean dimensioned technical drawings from DXF files.

Usage:
    python generate_blueprint.py input.dxf [output.png] [--thickness 0.5] [--title "Part Name"]

Features:
    - Clean engineering drawing style (white background)
    - Smart dimension placement with overlap avoidance
    - Overall bounding box dimensions
    - Feature dimensions for internal cutouts/holes
    - Configurable material thickness
"""

import argparse
import io
import sys
from pathlib import Path
from collections import defaultdict
from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Set
import numpy as np

try:
    import ezdxf
    from ezdxf.addons.drawing import Frontend, RenderContext
    from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with: pip install ezdxf matplotlib numpy")
    sys.exit(1)


# Clean engineering drawing colors
COLORS = {
    'background': 'white',
    'geometry': '#000000',
    'dimension': '#0066cc',
    'leader': '#666666',
    'text': '#000000',
    'border': '#000000',
}


@dataclass
class Dimension:
    """Represents a dimension annotation."""
    x1: float
    y1: float
    x2: float
    y2: float
    value: float
    dim_type: str  # 'horizontal', 'vertical', 'radius', 'diameter'
    offset: float = 0
    priority: int = 0  # Lower = more important


@dataclass
class GeometryAnalysis:
    """Results of DXF geometry analysis."""
    bounds: Tuple[float, float, float, float]
    lines: List[dict] = field(default_factory=list)
    arcs: List[dict] = field(default_factory=list)
    circles: List[dict] = field(default_factory=list)
    unique_x: List[float] = field(default_factory=list)
    unique_y: List[float] = field(default_factory=list)


def collect_entities(doc, msp):
    """Collect entities including from block references."""
    entities = []

    for entity in msp:
        if entity.dxftype() == 'INSERT':
            block = doc.blocks.get(entity.dxf.name)
            if block:
                insert_point = entity.dxf.insert
                scale_x = getattr(entity.dxf, 'xscale', 1)
                scale_y = getattr(entity.dxf, 'yscale', 1)
                rotation = getattr(entity.dxf, 'rotation', 0)

                for block_entity in block:
                    entities.append({
                        'entity': block_entity,
                        'transform': {
                            'insert': insert_point,
                            'scale': (scale_x, scale_y),
                            'rotation': rotation
                        }
                    })
        else:
            entities.append({'entity': entity, 'transform': None})

    return entities


def transform_point(x, y, transform):
    """Apply block transformation to a point."""
    if transform is None:
        return x, y

    x *= transform['scale'][0]
    y *= transform['scale'][1]

    if transform['rotation'] != 0:
        angle = np.radians(transform['rotation'])
        cos_a, sin_a = np.cos(angle), np.sin(angle)
        x, y = x * cos_a - y * sin_a, x * sin_a + y * cos_a

    x += transform['insert'].x
    y += transform['insert'].y

    return x, y


def analyze_geometry(doc, msp) -> GeometryAnalysis:
    """Analyze DXF geometry and extract features."""
    entities = collect_entities(doc, msp)

    lines = []
    arcs = []
    circles = []
    all_points = []

    for item in entities:
        entity = item['entity']
        transform = item['transform']
        dtype = entity.dxftype()

        if dtype == 'LINE':
            x1, y1 = transform_point(entity.dxf.start.x, entity.dxf.start.y, transform)
            x2, y2 = transform_point(entity.dxf.end.x, entity.dxf.end.y, transform)
            length = np.sqrt((x2-x1)**2 + (y2-y1)**2)

            if abs(y2 - y1) < 0.001:
                orientation = 'horizontal'
            elif abs(x2 - x1) < 0.001:
                orientation = 'vertical'
            else:
                orientation = 'angled'

            lines.append({
                'start': (x1, y1),
                'end': (x2, y2),
                'length': length,
                'orientation': orientation
            })
            all_points.extend([(x1, y1), (x2, y2)])

        elif dtype == 'ARC':
            cx, cy = transform_point(entity.dxf.center.x, entity.dxf.center.y, transform)
            radius = entity.dxf.radius * (transform['scale'][0] if transform else 1)
            arcs.append({
                'center': (cx, cy),
                'radius': radius,
                'start_angle': entity.dxf.start_angle,
                'end_angle': entity.dxf.end_angle
            })
            for angle in [entity.dxf.start_angle, entity.dxf.end_angle]:
                rad = np.radians(angle)
                px, py = cx + radius * np.cos(rad), cy + radius * np.sin(rad)
                all_points.append((px, py))

        elif dtype == 'CIRCLE':
            cx, cy = transform_point(entity.dxf.center.x, entity.dxf.center.y, transform)
            radius = entity.dxf.radius * (transform['scale'][0] if transform else 1)
            circles.append({
                'center': (cx, cy),
                'radius': radius,
                'diameter': radius * 2
            })
            all_points.append((cx, cy))

        elif dtype == 'LWPOLYLINE':
            points = list(entity.get_points())
            for i, pt in enumerate(points):
                x, y = transform_point(pt[0], pt[1], transform)
                all_points.append((x, y))
                if i > 0:
                    px, py = transform_point(points[i-1][0], points[i-1][1], transform)
                    length = np.sqrt((x-px)**2 + (y-py)**2)
                    if abs(y - py) < 0.001:
                        orientation = 'horizontal'
                    elif abs(x - px) < 0.001:
                        orientation = 'vertical'
                    else:
                        orientation = 'angled'
                    lines.append({
                        'start': (px, py),
                        'end': (x, y),
                        'length': length,
                        'orientation': orientation
                    })

    if not all_points:
        raise ValueError("No geometry found in DXF file")

    points_array = np.array(all_points)
    xmin, ymin = points_array.min(axis=0)
    xmax, ymax = points_array.max(axis=0)

    unique_x = sorted(set(round(p[0], 3) for p in all_points))
    unique_y = sorted(set(round(p[1], 3) for p in all_points))

    return GeometryAnalysis(
        bounds=(xmin, ymin, xmax, ymax),
        lines=lines,
        arcs=arcs,
        circles=circles,
        unique_x=unique_x,
        unique_y=unique_y
    )


def format_dim(value: float) -> str:
    """Format dimension value nicely."""
    if value < 0.01:
        return f"{value:.4f}\""
    elif value < 1:
        return f"{value:.3f}\""
    else:
        return f"{value:.2f}\""


def generate_smart_dimensions(analysis: GeometryAnalysis) -> List[Dimension]:
    """Generate comprehensive dimensions for all features."""
    dims = []
    xmin, ymin, xmax, ymax = analysis.bounds
    width = xmax - xmin
    height = ymax - ymin
    tolerance = min(width, height) * 0.01

    # Overall dimensions (most important)
    dims.append(Dimension(xmin, ymin, xmax, ymin, width, 'horizontal', offset=-0.18, priority=0))
    dims.append(Dimension(xmax, ymin, xmax, ymax, height, 'vertical', offset=0.18, priority=0))

    # Collect all horizontal lines grouped by Y position
    h_lines_by_y = defaultdict(list)
    for line in analysis.lines:
        if line['orientation'] == 'horizontal' and line['length'] > tolerance:
            y = round(line['start'][1], 3)
            h_lines_by_y[y].append(line)

    # Collect all vertical lines grouped by X position
    v_lines_by_x = defaultdict(list)
    for line in analysis.lines:
        if line['orientation'] == 'vertical' and line['length'] > tolerance:
            x = round(line['start'][0], 3)
            v_lines_by_x[x].append(line)

    # Get unique Y positions (sorted from bottom to top)
    y_positions = sorted(h_lines_by_y.keys())

    # Get unique X positions (sorted from left to right)
    x_positions = sorted(v_lines_by_x.keys())

    # Dimension internal horizontal lines (their actual lengths - slot widths)
    internal_h_dims = []
    for y, lines in h_lines_by_y.items():
        if abs(y - ymin) > tolerance and abs(y - ymax) > tolerance:
            for line in lines:
                x1 = min(line['start'][0], line['end'][0])
                x2 = max(line['start'][0], line['end'][0])
                length = line['length']
                # Only add if not the full width
                if length < width * 0.9 and length > tolerance * 2:
                    internal_h_dims.append({
                        'x1': x1, 'x2': x2, 'y': y, 'length': length
                    })

    # Dimension internal vertical lines (their actual lengths - slot heights)
    internal_v_dims = []
    for x, lines in v_lines_by_x.items():
        if abs(x - xmin) > tolerance and abs(x - xmax) > tolerance:
            for line in lines:
                y1 = min(line['start'][1], line['end'][1])
                y2 = max(line['start'][1], line['end'][1])
                length = line['length']
                # Only add if not the full height
                if length < height * 0.9 and length > tolerance * 2:
                    internal_v_dims.append({
                        'y1': y1, 'y2': y2, 'x': x, 'length': length
                    })

    # Add horizontal dimensions for internal features
    # Place them well away from the geometry to avoid clustering
    added_h = set()
    for feat in sorted(internal_h_dims, key=lambda f: f['y']):  # Sort by Y position
        key = (round(feat['x1'], 2), round(feat['x2'], 2))
        if key not in added_h:
            # Place below geometry (negative offset from feature)
            # Stagger based on Y position to spread them out
            base_offset = -0.15 - (feat['y'] - ymin) / height * 0.15
            dims.append(Dimension(
                feat['x1'], feat['y'], feat['x2'], feat['y'],
                feat['length'], 'horizontal', offset=base_offset, priority=1
            ))
            added_h.add(key)

    # Add vertical dimensions for internal features
    added_v = set()
    for feat in sorted(internal_v_dims, key=lambda f: f['x']):  # Sort by X position
        key = (round(feat['y1'], 2), round(feat['y2'], 2))
        if key not in added_v:
            # Place to the right of geometry (positive offset)
            # Stagger based on X position
            base_offset = 0.15 + (feat['x'] - xmin) / width * 0.15
            dims.append(Dimension(
                feat['x'], feat['y1'], feat['x'], feat['y2'],
                feat['length'], 'vertical', offset=base_offset, priority=1
            ))
            added_v.add(key)

    # Use chain dimensioning - dimension between adjacent features
    # Stagger offsets to prevent text overlap

    # Chain dimension Y positions (left side)
    y_list = sorted(set(round(y, 3) for y in y_positions))
    y_list = [y for y in y_list if abs(y - ymin) > tolerance and abs(y - ymax) > tolerance]

    # Add bottom reference + chain with alternating offsets
    if y_list:
        # First: from bottom to first feature
        dims.append(Dimension(
            xmin, ymin, xmin, y_list[0],
            y_list[0] - ymin, 'vertical', offset=-0.15, priority=2
        ))
        # Chain: between adjacent features (alternate left/right)
        for i in range(len(y_list) - 1):
            if abs(y_list[i+1] - y_list[i]) > tolerance:
                # Alternate: even indices go further left, odd closer
                v_offset = -0.28 if (i % 2 == 0) else -0.15
                dims.append(Dimension(
                    xmin, y_list[i], xmin, y_list[i+1],
                    y_list[i+1] - y_list[i], 'vertical', offset=v_offset, priority=2
                ))
        # Last: from last feature to top
        if abs(ymax - y_list[-1]) > tolerance:
            v_offset = -0.28 if (len(y_list) % 2 == 0) else -0.15
            dims.append(Dimension(
                xmin, y_list[-1], xmin, ymax,
                ymax - y_list[-1], 'vertical', offset=v_offset, priority=2
            ))

    # Chain dimension X positions (top side) - alternate up/down
    x_list = sorted(set(round(x, 3) for x in x_positions))
    x_list = [x for x in x_list if abs(x - xmin) > tolerance and abs(x - xmax) > tolerance]

    if x_list:
        # First: from left to first feature
        dims.append(Dimension(
            xmin, ymax, x_list[0], ymax,
            x_list[0] - xmin, 'horizontal', offset=0.08, priority=2
        ))
        # Chain: between adjacent features (alternate up/down)
        for i in range(len(x_list) - 1):
            if abs(x_list[i+1] - x_list[i]) > tolerance:
                # Alternate: even indices go up more, odd go up less
                h_offset = 0.18 if (i % 2 == 0) else 0.08
                dims.append(Dimension(
                    x_list[i], ymax, x_list[i+1], ymax,
                    x_list[i+1] - x_list[i], 'horizontal', offset=h_offset, priority=2
                ))
        # Last: from last feature to right
        if abs(xmax - x_list[-1]) > tolerance:
            h_offset = 0.18 if (len(x_list) % 2 == 0) else 0.08
            dims.append(Dimension(
                x_list[-1], ymax, xmax, ymax,
                xmax - x_list[-1], 'horizontal', offset=h_offset, priority=2
            ))

    # Add circle diameters
    circles_sorted = sorted(analysis.circles, key=lambda c: -c['diameter'])
    for circle in circles_sorted[:5]:
        dims.append(Dimension(
            circle['center'][0], circle['center'][1],
            0, 0, circle['diameter'], 'diameter', priority=2
        ))

    # Add arc radii (deduplicate by radius value) and center positions
    radii_seen = set()
    arc_centers_added = []
    center_dim_idx = 0
    arcs_sorted = sorted(analysis.arcs, key=lambda a: -a['radius'])

    for arc in arcs_sorted:
        r = round(arc['radius'], 3)
        cx, cy = arc['center']

        if r not in radii_seen:
            dims.append(Dimension(
                cx, cy, 0, 0, arc['radius'], 'radius', priority=2
            ))
            radii_seen.add(r)

        # Add center position dimensions
        center_key = (round(cx, 2), round(cy, 2))
        if center_key not in arc_centers_added:
            # Determine best placement based on arc quadrant
            in_left_half = cx < (xmin + xmax) / 2
            in_bottom_half = cy < (ymin + ymax) / 2

            # Stagger offsets for each center to avoid overlap
            h_offset = -0.08 - center_dim_idx * 0.08
            v_offset = 0.08 + center_dim_idx * 0.08

            # Horizontal: dimension from nearest vertical edge
            if in_left_half:
                dims.append(Dimension(
                    xmin, cy, cx, cy,
                    cx - xmin, 'horizontal', offset=h_offset, priority=3
                ))
            else:
                dims.append(Dimension(
                    cx, cy, xmax, cy,
                    xmax - cx, 'horizontal', offset=h_offset, priority=3
                ))

            # Vertical: dimension from nearest horizontal edge
            if in_bottom_half:
                dims.append(Dimension(
                    cx, ymin, cx, cy,
                    cy - ymin, 'vertical', offset=v_offset, priority=3
                ))
            else:
                dims.append(Dimension(
                    cx, cy, cx, ymax,
                    ymax - cy, 'vertical', offset=v_offset, priority=3
                ))

            arc_centers_added.append(center_key)
            center_dim_idx += 1

    # Add circle center positions
    for circle in circles_sorted[:5]:
        cx, cy = circle['center']
        center_key = (round(cx, 2), round(cy, 2))
        if center_key not in arc_centers_added:
            in_left_half = cx < (xmin + xmax) / 2
            in_bottom_half = cy < (ymin + ymax) / 2

            h_offset = -0.08 - center_dim_idx * 0.08
            v_offset = 0.08 + center_dim_idx * 0.08

            if in_left_half:
                dims.append(Dimension(
                    xmin, cy, cx, cy,
                    cx - xmin, 'horizontal', offset=h_offset, priority=3
                ))
            else:
                dims.append(Dimension(
                    cx, cy, xmax, cy,
                    xmax - cx, 'horizontal', offset=h_offset, priority=3
                ))

            if in_bottom_half:
                dims.append(Dimension(
                    cx, ymin, cx, cy,
                    cy - ymin, 'vertical', offset=v_offset, priority=3
                ))
            else:
                dims.append(Dimension(
                    cx, cy, cx, ymax,
                    ymax - cy, 'vertical', offset=v_offset, priority=3
                ))

            arc_centers_added.append(center_key)
            center_dim_idx += 1

    return dims


def draw_dimension_line(ax, x1, y1, x2, y2, offset, dim_type, value, scale):
    """Draw a clean dimension line with arrows and text."""
    color = COLORS['dimension']
    leader_color = COLORS['leader']

    text_size = max(8, min(11, scale * 0.8))
    tick_size = scale * 0.015  # Small tick mark at feature

    if dim_type == 'horizontal':
        yo = y1 + offset * scale

        # Extension lines from feature to dimension line
        ax.plot([x1, x1], [y1, yo], color=leader_color, lw=0.5, linestyle='-')
        ax.plot([x2, x2], [y2, yo], color=leader_color, lw=0.5, linestyle='-')

        # Small tick marks at the feature locations
        ax.plot([x1 - tick_size, x1 + tick_size], [y1, y1], color=color, lw=1)
        ax.plot([x2 - tick_size, x2 + tick_size], [y2, y2], color=color, lw=1)

        # Dimension line with arrows
        ax.annotate('', xy=(x1, yo), xytext=(x2, yo),
                    arrowprops=dict(arrowstyle='<->', color=color, lw=1,
                                   shrinkA=0, shrinkB=0))

        # Text
        mid_x = (x1 + x2) / 2
        text_offset = scale * 0.02
        va = 'bottom' if offset > 0 else 'top'
        text_y = yo + (text_offset if offset > 0 else -text_offset)

        ax.text(mid_x, text_y, format_dim(value),
                ha='center', va=va, color=color, fontsize=text_size,
                fontweight='bold')

    elif dim_type == 'vertical':
        xo = x1 + offset * scale

        # Extension lines from feature to dimension line
        ax.plot([x1, xo], [y1, y1], color=leader_color, lw=0.5, linestyle='-')
        ax.plot([x2, xo], [y2, y2], color=leader_color, lw=0.5, linestyle='-')

        # Small tick marks at the feature locations
        ax.plot([x1, x1], [y1 - tick_size, y1 + tick_size], color=color, lw=1)
        ax.plot([x2, x2], [y2 - tick_size, y2 + tick_size], color=color, lw=1)

        # Dimension line with arrows
        ax.annotate('', xy=(xo, y1), xytext=(xo, y2),
                    arrowprops=dict(arrowstyle='<->', color=color, lw=1,
                                   shrinkA=0, shrinkB=0))

        # Text
        mid_y = (y1 + y2) / 2
        text_offset = scale * 0.02
        ha = 'left' if offset > 0 else 'right'
        text_x = xo + (text_offset if offset > 0 else -text_offset)

        ax.text(text_x, mid_y, format_dim(value),
                ha=ha, va='center', color=color, fontsize=text_size,
                fontweight='bold', rotation=90)


def draw_radius_dimension(ax, cx, cy, radius, scale):
    """Draw a radius dimension."""
    color = COLORS['dimension']
    text_size = max(8, min(10, scale * 0.7))

    # Draw at 45 degrees
    angle = np.radians(45)
    rx = cx + radius * np.cos(angle)
    ry = cy + radius * np.sin(angle)

    # Radius line
    ax.plot([cx, rx], [cy, ry], color=color, lw=0.8)
    ax.plot(rx, ry, 'o', color=color, markersize=3)

    # Label positioned outside
    label_dist = radius * 1.4
    lx = cx + label_dist * np.cos(angle)
    ly = cy + label_dist * np.sin(angle)

    ax.text(lx, ly, f'R{format_dim(radius)}',
            ha='left', va='bottom', color=color, fontsize=text_size,
            fontweight='bold')


def draw_diameter_dimension(ax, cx, cy, diameter, scale):
    """Draw a diameter dimension."""
    color = COLORS['dimension']
    text_size = max(8, min(10, scale * 0.7))
    r = diameter / 2

    # Horizontal diameter line
    ax.plot([cx - r, cx + r], [cy, cy], color=color, lw=0.8)
    ax.plot([cx - r, cx + r], [cy, cy], 'o', color=color, markersize=3)

    # Label above
    ax.text(cx, cy + r + scale * 0.03, f'⌀{format_dim(diameter)}',
            ha='center', va='bottom', color=color, fontsize=text_size,
            fontweight='bold')


def draw_labeled_dimension(ax, x1, y1, x2, y2, offset, dim_type, label, scale, position=0.5):
    """Draw a dimension line with a label following the line direction."""
    color = COLORS['dimension']
    leader_color = COLORS['leader']
    text_size = 6
    tick_size = scale * 0.015

    if dim_type == 'horizontal':
        yo = y1 + offset * scale
        ax.plot([x1, x1], [y1, yo], color=leader_color, lw=0.5, linestyle='-')
        ax.plot([x2, x2], [y2, yo], color=leader_color, lw=0.5, linestyle='-')
        ax.plot([x1 - tick_size, x1 + tick_size], [y1, y1], color=color, lw=1)
        ax.plot([x2 - tick_size, x2 + tick_size], [y2, y2], color=color, lw=1)
        ax.annotate('', xy=(x1, yo), xytext=(x2, yo),
                    arrowprops=dict(arrowstyle='<->', color=color, lw=1, shrinkA=0, shrinkB=0))
        # Label at variable position along line
        label_x = x1 + (x2 - x1) * position
        text_offset = scale * 0.015
        va = 'bottom' if offset > 0 else 'top'
        text_y = yo + (text_offset if offset > 0 else -text_offset)
        ax.text(label_x, text_y, label, ha='center', va=va, color=color, fontsize=text_size, rotation=0)

    elif dim_type == 'vertical':
        xo = x1 + offset * scale
        ax.plot([x1, xo], [y1, y1], color=leader_color, lw=0.5, linestyle='-')
        ax.plot([x2, xo], [y2, y2], color=leader_color, lw=0.5, linestyle='-')
        ax.plot([x1, x1], [y1 - tick_size, y1 + tick_size], color=color, lw=1)
        ax.plot([x2, x2], [y2 - tick_size, y2 + tick_size], color=color, lw=1)
        ax.annotate('', xy=(xo, y1), xytext=(xo, y2),
                    arrowprops=dict(arrowstyle='<->', color=color, lw=1, shrinkA=0, shrinkB=0))
        # Label at variable position along line
        label_y = y1 + (y2 - y1) * position
        text_offset = scale * 0.015
        ha = 'left' if offset > 0 else 'right'
        text_x = xo + (text_offset if offset > 0 else -text_offset)
        ax.text(text_x, label_y, label, ha=ha, va='center', color=color, fontsize=text_size, rotation=90)


def draw_labeled_radius(ax, cx, cy, radius, label, scale):
    """Draw a radius dimension with a label following the line direction."""
    color = COLORS['dimension']
    text_size = 6
    angle = np.radians(45)
    rx = cx + radius * np.cos(angle)
    ry = cy + radius * np.sin(angle)
    ax.plot([cx, rx], [cy, ry], color=color, lw=0.8)
    ax.plot(rx, ry, 'o', color=color, markersize=3)
    label_dist = radius * 1.2
    lx = cx + label_dist * np.cos(angle)
    ly = cy + label_dist * np.sin(angle)
    ax.text(lx, ly, label, ha='center', va='center', color=color, fontsize=text_size, rotation=45)


def draw_labeled_radius_at(ax, cx, cy, radius, label, scale, angle_deg):
    """Draw a radius dimension with label at specific angle."""
    color = COLORS['dimension']
    text_size = 6
    z = 10
    angle = np.radians(angle_deg)
    rx = cx + radius * np.cos(angle)
    ry = cy + radius * np.sin(angle)
    ax.plot([cx, rx], [cy, ry], color=color, lw=0.8, zorder=z)
    ax.plot(rx, ry, 'o', color=color, markersize=3, zorder=z)
    label_dist = radius * 1.3
    lx = cx + label_dist * np.cos(angle)
    ly = cy + label_dist * np.sin(angle)
    ax.text(lx, ly, label, ha='center', va='center', color=color, fontsize=text_size, rotation=angle_deg, zorder=z+1)


def draw_labeled_diameter(ax, cx, cy, diameter, label, scale):
    """Draw a diameter dimension with a label."""
    color = COLORS['dimension']
    text_size = 6
    z = 10
    r = diameter / 2
    ax.plot([cx - r, cx + r], [cy, cy], color=color, lw=0.8, zorder=z)
    ax.plot([cx - r, cx + r], [cy, cy], 'o', color=color, markersize=3, zorder=z)
    ax.text(cx, cy + scale * 0.02, label, ha='center', va='bottom', color=color, fontsize=text_size, rotation=0, zorder=z+1)


def draw_labeled_dimension_at(ax, x1, y1, x2, y2, offset, dim_type, label, scale, label_pos, offset_mult=1.0):
    """Draw a dimension line with label at a specific position.

    Args:
        offset_mult: Multiplier for the offset distance (allows spreading out parallel dims)
    """
    color = COLORS['dimension']
    leader_color = COLORS['leader']
    text_size = 6
    tick_size = scale * 0.015
    actual_offset = offset * offset_mult
    z = 10  # Draw on top of geometry

    if dim_type == 'horizontal':
        yo = y1 + actual_offset * scale
        ax.plot([x1, x1], [y1, yo], color=leader_color, lw=0.5, linestyle='-', zorder=z)
        ax.plot([x2, x2], [y2, yo], color=leader_color, lw=0.5, linestyle='-', zorder=z)
        ax.plot([x1 - tick_size, x1 + tick_size], [y1, y1], color=color, lw=1, zorder=z)
        ax.plot([x2 - tick_size, x2 + tick_size], [y2, y2], color=color, lw=1, zorder=z)
        ax.annotate('', xy=(x1, yo), xytext=(x2, yo),
                    arrowprops=dict(arrowstyle='<->', color=color, lw=1, shrinkA=0, shrinkB=0, zorder=z))
        # label_pos is the x coordinate
        text_offset = scale * 0.015
        va = 'bottom' if actual_offset > 0 else 'top'
        text_y = yo + (text_offset if actual_offset > 0 else -text_offset)
        ax.text(label_pos, text_y, label, ha='center', va=va, color=color, fontsize=text_size, rotation=0, zorder=z+1)

    elif dim_type == 'vertical':
        xo = x1 + actual_offset * scale
        ax.plot([x1, xo], [y1, y1], color=leader_color, lw=0.5, linestyle='-', zorder=z)
        ax.plot([x2, xo], [y2, y2], color=leader_color, lw=0.5, linestyle='-', zorder=z)
        ax.plot([x1, x1], [y1 - tick_size, y1 + tick_size], color=color, lw=1, zorder=z)
        ax.plot([x2, x2], [y2 - tick_size, y2 + tick_size], color=color, lw=1, zorder=z)
        ax.annotate('', xy=(xo, y1), xytext=(xo, y2),
                    arrowprops=dict(arrowstyle='<->', color=color, lw=1, shrinkA=0, shrinkB=0, zorder=z))
        # label_pos is the y coordinate
        text_offset = scale * 0.015
        ha = 'left' if actual_offset > 0 else 'right'
        text_x = xo + (text_offset if actual_offset > 0 else -text_offset)
        ax.text(text_x, label_pos, label, ha=ha, va='center', color=color, fontsize=text_size, rotation=90, zorder=z+1)


def calc_landscape_limits(data_xmin, data_xmax, data_ymin, data_ymax, axes_aspect=1.33, margin_frac=0.1):
    """Calculate x/y limits that fill a landscape axes while maintaining equal scaling.

    Args:
        data_xmin, data_xmax, data_ymin, data_ymax: Data bounds
        axes_aspect: Width/height ratio of the axes box (default 1.33 for landscape)
        margin_frac: Fraction of data size to add as margin

    Returns:
        (xlim_min, xlim_max, ylim_min, ylim_max)
    """
    data_width = data_xmax - data_xmin
    data_height = data_ymax - data_ymin

    # Add margin
    margin = max(data_width, data_height) * margin_frac
    data_xmin -= margin
    data_xmax += margin
    data_ymin -= margin
    data_ymax += margin
    data_width = data_xmax - data_xmin
    data_height = data_ymax - data_ymin

    data_aspect = data_width / data_height if data_height > 0 else 1

    if data_aspect < axes_aspect:
        # Data is taller than axes - expand x range
        target_width = data_height * axes_aspect
        x_center = (data_xmin + data_xmax) / 2
        return (x_center - target_width/2, x_center + target_width/2, data_ymin, data_ymax)
    else:
        # Data is wider than axes - expand y range
        target_height = data_width / axes_aspect
        y_center = (data_ymin + data_ymax) / 2
        return (data_xmin, data_xmax, y_center - target_height/2, y_center + target_height/2)


def render_figure_to_image(fig):
    """Render a matplotlib figure to a PIL Image."""
    from PIL import Image
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=150, facecolor='white', bbox_inches='tight', pad_inches=0.1)
    buf.seek(0)
    return Image.open(buf)


def add_image_to_page(pdf, img, page_size=(11, 8.5), caption=None):
    """Add an image centered on a consistently-sized page."""
    fig = plt.figure(figsize=page_size, facecolor='white')

    # Calculate position to center image
    img_aspect = img.width / img.height
    page_aspect = page_size[0] / page_size[1]

    # Leave room for border and optional caption
    max_width = 0.88
    max_height = 0.82 if caption else 0.88

    if img_aspect > page_aspect * (max_width / max_height):
        # Image is wider - fit to width
        w = max_width
        h = w / img_aspect * (page_size[0] / page_size[1])
    else:
        # Image is taller - fit to height
        h = max_height
        w = h * img_aspect * (page_size[1] / page_size[0])

    left = (1 - w) / 2
    bottom = (1 - h) / 2 + (0.03 if caption else 0)

    ax = fig.add_axes([left, bottom, w, h])
    ax.imshow(img)
    ax.axis('off')

    if caption:
        fig.text(0.5, 0.04, caption, ha='center', fontsize=10, color='#666666')

    # Border
    border = mpatches.Rectangle((0.03, 0.03), 0.94, 0.94,
                                  fill=False, edgecolor=COLORS['border'],
                                  linewidth=2, transform=fig.transFigure)
    fig.patches.append(border)

    pdf.savefig(fig, facecolor='white')
    plt.close(fig)


def generate_blueprint(input_path: str, output_path: str, thickness: float = 0.5,
                       title: Optional[str] = None):
    """Generate a multi-page PDF blueprint from a DXF file."""
    from matplotlib.backends.backend_pdf import PdfPages
    from datetime import datetime

    # Load DXF
    doc = ezdxf.readfile(input_path)
    msp = doc.modelspace()

    # Analyze geometry
    analysis = analyze_geometry(doc, msp)
    xmin, ymin, xmax, ymax = analysis.bounds
    width = xmax - xmin
    height = ymax - ymin
    scale = max(width, height)

    # Generate dimensions
    dimensions = generate_smart_dimensions(analysis)

    # Part name
    part_name = title or Path(input_path).stem.replace('_', ' ').upper()

    # Ensure output is PDF
    output_path = str(output_path)
    if not output_path.lower().endswith('.pdf'):
        output_path = output_path.rsplit('.', 1)[0] + '.pdf'

    with PdfPages(output_path) as pdf:
        # ========== PAGE 1: Title/Specs Page ==========
        fig1 = plt.figure(figsize=(11, 8.5), facecolor='white')

        # Title
        fig1.text(0.5, 0.85, part_name, ha='center', va='center',
                  fontsize=32, fontweight='bold', color=COLORS['text'])

        fig1.text(0.5, 0.78, 'TECHNICAL DRAWING', ha='center', va='center',
                  fontsize=14, color='#666666')

        # Specifications box
        specs = [
            ('Overall Width', format_dim(width)),
            ('Overall Height', format_dim(height)),
            ('Material Thickness', format_dim(thickness)),
            ('', ''),
            ('Lines', str(len(analysis.lines))),
            ('Arcs', str(len(analysis.arcs))),
            ('Circles', str(len(analysis.circles))),
            ('', ''),
            ('Total Dimensions', str(len(dimensions))),
            ('Scale', '1:1'),
            ('Units', 'Inches'),
        ]

        y_pos = 0.62
        for label, value in specs:
            if label:
                fig1.text(0.35, y_pos, label + ':', ha='right', va='center',
                          fontsize=12, color='#666666')
                fig1.text(0.38, y_pos, value, ha='left', va='center',
                          fontsize=12, fontweight='bold', color=COLORS['text'])
            y_pos -= 0.04

        # Branding and date
        fig1.text(0.5, 0.11, 'Pro Plastics Inc.', ha='center', va='center',
                  fontsize=11, color='#999999')
        fig1.text(0.5, 0.08, f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}',
                  ha='center', va='center', fontsize=10, color='#999999')

        # Border
        border = mpatches.Rectangle((0.03, 0.03), 0.94, 0.94,
                                      fill=False, edgecolor=COLORS['border'],
                                      linewidth=2, transform=fig1.transFigure)
        fig1.patches.append(border)

        pdf.savefig(fig1, facecolor='white')
        plt.close(fig1)

        # ========== PAGE 2: Clean Part View ==========
        # Render geometry to image first, then place on consistent page
        fig2_render = plt.figure(figsize=(10, 8), facecolor='white')
        ax_clean = fig2_render.add_subplot(111)

        ctx_clean = RenderContext(doc)
        out_clean = MatplotlibBackend(ax_clean)
        Frontend(ctx_clean, out_clean).draw_layout(msp, finalize=True)

        # Style clean view
        ax_clean.set_facecolor('white')
        for line in ax_clean.get_lines():
            line.set_color(COLORS['geometry'])
            line.set_linewidth(2)
        for coll in ax_clean.collections:
            coll.set_edgecolor(COLORS['geometry'])
            coll.set_facecolor('none')
            coll.set_linewidth(2)
        for patch in ax_clean.patches:
            patch.set_edgecolor(COLORS['geometry'])
            patch.set_facecolor('none')
            patch.set_linewidth(2)

        margin = max(width, height) * 0.1
        ax_clean.set_xlim(xmin - margin, xmax + margin)
        ax_clean.set_ylim(ymin - margin, ymax + margin)
        ax_clean.set_aspect('equal')
        ax_clean.axis('off')

        img2 = render_figure_to_image(fig2_render)
        plt.close(fig2_render)

        add_image_to_page(pdf, img2, caption=f'Size: {format_dim(width)} × {format_dim(height)} × {format_dim(thickness)} thick')

        # ========== PAGE 3: Dimensioned Drawing ==========
        # Render to image first
        fig3_render = plt.figure(figsize=(10, 8), facecolor='white')
        ax = fig3_render.add_subplot(111)

        # Render DXF geometry
        ctx = RenderContext(doc)
        out = MatplotlibBackend(ax)
        Frontend(ctx, out).draw_layout(msp, finalize=True)

        # Style geometry as black lines
        ax.set_facecolor('white')

        for line in ax.get_lines():
            line.set_color(COLORS['geometry'])
            line.set_linewidth(1.5)

        for coll in ax.collections:
            coll.set_edgecolor(COLORS['geometry'])
            coll.set_facecolor('none')
            coll.set_linewidth(1.5)

        for patch in ax.patches:
            patch.set_edgecolor(COLORS['geometry'])
            patch.set_facecolor('none')
            patch.set_linewidth(1.5)

        # Draw dimensions
        for dim in dimensions:
            if dim.dim_type in ['horizontal', 'vertical']:
                draw_dimension_line(ax, dim.x1, dim.y1, dim.x2, dim.y2,
                                  dim.offset, dim.dim_type, dim.value, scale)
            elif dim.dim_type == 'radius':
                draw_radius_dimension(ax, dim.x1, dim.y1, dim.value, scale)
            elif dim.dim_type == 'diameter':
                draw_diameter_dimension(ax, dim.x1, dim.y1, dim.value, scale)

        # Dynamically calculate margins based on dimension positions
        min_dim_x = xmin
        max_dim_x = xmax
        min_dim_y = ymin
        max_dim_y = ymax

        for dim in dimensions:
            if dim.dim_type == 'horizontal':
                dim_y = dim.y1 + dim.offset * scale
                min_dim_y = min(min_dim_y, dim_y)
                max_dim_y = max(max_dim_y, dim_y)
            elif dim.dim_type == 'vertical':
                dim_x = dim.x1 + dim.offset * scale
                min_dim_x = min(min_dim_x, dim_x)
                max_dim_x = max(max_dim_x, dim_x)

        margin = max(max_dim_x - min_dim_x, max_dim_y - min_dim_y) * 0.08
        ax.set_xlim(min_dim_x - margin, max_dim_x + margin)
        ax.set_ylim(min_dim_y - margin, max_dim_y + margin)
        ax.set_aspect('equal')
        ax.axis('off')

        img3 = render_figure_to_image(fig3_render)
        plt.close(fig3_render)

        add_image_to_page(pdf, img3, caption=f'Size: {format_dim(width)} × {format_dim(height)} × {format_dim(thickness)} thick  |  Dimensions: {len(dimensions)}')

        # ========== PAGE 4: Labeled Dimensions View ==========
        # Render to image first
        fig4_render = plt.figure(figsize=(10, 8), facecolor='white')
        ax4 = fig4_render.add_subplot(111)

        # Render DXF geometry
        ctx4 = RenderContext(doc)
        out4 = MatplotlibBackend(ax4)
        Frontend(ctx4, out4).draw_layout(msp, finalize=True)

        # Style geometry - set low z-order so dimensions draw on top
        ax4.set_facecolor('white')
        for line in ax4.get_lines():
            line.set_color(COLORS['geometry'])
            line.set_linewidth(1.5)
            line.set_zorder(1)
        for coll in ax4.collections:
            coll.set_edgecolor(COLORS['geometry'])
            coll.set_facecolor('none')
            coll.set_linewidth(1.5)
            coll.set_zorder(1)
        for patch in ax4.patches:
            patch.set_edgecolor(COLORS['geometry'])
            patch.set_facecolor('none')
            patch.set_linewidth(1.5)
            patch.set_zorder(1)

        # Draw dimensions with labels (D1, D2, etc.) instead of values
        # Use collision avoidance to prevent overlapping labels
        dim_table = []
        placed_labels = []  # Track (x, y) of placed labels

        def find_clear_position_with_offset(dim, dim_type, line_fractions, offset_multipliers):
            """Find a position that doesn't overlap, trying different offsets and line positions.

            Returns: (label_x, label_y, offset_multiplier, line_fraction)
            """
            min_dist = scale * 0.06  # Minimum distance between labels

            # Try each offset multiplier, then each position along the line
            for offset_mult in offset_multipliers:
                for frac in line_fractions:
                    if dim_type == 'horizontal':
                        yo = dim.y1 + dim.offset * offset_mult * scale
                        test_x = dim.x1 + (dim.x2 - dim.x1) * frac
                        test_y = yo
                    elif dim_type == 'vertical':
                        xo = dim.x1 + dim.offset * offset_mult * scale
                        test_x = xo
                        test_y = dim.y1 + (dim.y2 - dim.y1) * frac

                    is_clear = True
                    for px, py in placed_labels:
                        dist = np.sqrt((test_x - px)**2 + (test_y - py)**2)
                        if dist < min_dist:
                            is_clear = False
                            break

                    if is_clear:
                        if dim_type == 'horizontal':
                            return test_x, test_y, offset_mult, test_x
                        else:
                            return test_x, test_y, offset_mult, test_y

            # Default: first position
            if dim_type == 'horizontal':
                yo = dim.y1 + dim.offset * scale
                return dim.x1 + (dim.x2 - dim.x1) * 0.5, yo, 1.0, dim.x1 + (dim.x2 - dim.x1) * 0.5
            else:
                xo = dim.x1 + dim.offset * scale
                return xo, dim.y1 + (dim.y2 - dim.y1) * 0.5, 1.0, dim.y1 + (dim.y2 - dim.y1) * 0.5

        line_fractions = [0.5, 0.3, 0.7, 0.2, 0.8, 0.15, 0.85]
        offset_multipliers = [1.0, 1.4, 1.8, 2.2, 2.6]

        for idx, dim in enumerate(dimensions):
            label = f"D{idx + 1}"
            dim_table.append((label, dim.value, dim.dim_type))

            if dim.dim_type == 'horizontal':
                lx, ly, offset_mult, label_pos = find_clear_position_with_offset(
                    dim, 'horizontal', line_fractions, offset_multipliers)
                draw_labeled_dimension_at(ax4, dim.x1, dim.y1, dim.x2, dim.y2,
                                         dim.offset, 'horizontal', label, scale, label_pos, offset_mult)
                placed_labels.append((lx, ly))

            elif dim.dim_type == 'vertical':
                lx, ly, offset_mult, label_pos = find_clear_position_with_offset(
                    dim, 'vertical', line_fractions, offset_multipliers)
                draw_labeled_dimension_at(ax4, dim.x1, dim.y1, dim.x2, dim.y2,
                                         dim.offset, 'vertical', label, scale, label_pos, offset_mult)
                placed_labels.append((lx, ly))

            elif dim.dim_type == 'radius':
                # Try different angles for radius label
                cx, cy = dim.x1, dim.y1
                r = dim.value
                angles = [45, 135, 225, 315, 30, 60, 120, 150, 210, 240, 300, 330]
                min_dist = scale * 0.06
                best_angle = angles[0]
                for angle in angles:
                    test_x = cx + r * 1.3 * np.cos(np.radians(angle))
                    test_y = cy + r * 1.3 * np.sin(np.radians(angle))
                    is_clear = True
                    for px, py in placed_labels:
                        dist = np.sqrt((test_x - px)**2 + (test_y - py)**2)
                        if dist < min_dist:
                            is_clear = False
                            break
                    if is_clear:
                        best_angle = angle
                        break
                lx = cx + r * 1.3 * np.cos(np.radians(best_angle))
                ly = cy + r * 1.3 * np.sin(np.radians(best_angle))
                draw_labeled_radius_at(ax4, cx, cy, r, label, scale, best_angle)
                placed_labels.append((lx, ly))

            elif dim.dim_type == 'diameter':
                draw_labeled_diameter(ax4, dim.x1, dim.y1, dim.value, label, scale)
                placed_labels.append((dim.x1, dim.y1 + dim.value/2 + scale * 0.02))

        # Set view - use placed_labels to find actual extent
        min_dim_x = xmin
        max_dim_x = xmax
        min_dim_y = ymin
        max_dim_y = ymax
        for lx, ly in placed_labels:
            min_dim_x = min(min_dim_x, lx)
            max_dim_x = max(max_dim_x, lx)
            min_dim_y = min(min_dim_y, ly)
            max_dim_y = max(max_dim_y, ly)

        text_padding = scale * 0.15
        ax4.set_xlim(min_dim_x - text_padding, max_dim_x + text_padding)
        ax4.set_ylim(min_dim_y - text_padding, max_dim_y + text_padding)
        ax4.set_aspect('equal')
        ax4.axis('off')

        img4 = render_figure_to_image(fig4_render)
        plt.close(fig4_render)

        add_image_to_page(pdf, img4, caption='LABELED VIEW - See dimension table on next page')

        # ========== PAGE 5: Dimension Table ==========
        fig5 = plt.figure(figsize=(11, 8.5), facecolor='white')

        fig5.text(0.5, 0.92, part_name, ha='center', fontsize=20, fontweight='bold')
        fig5.text(0.5, 0.87, 'DIMENSION TABLE', ha='center', fontsize=14, color='#666666')

        # Create table data
        # Split into columns if many dimensions
        n_dims = len(dim_table)
        cols_per_section = 3
        rows_per_col = 20

        # Table headers and data
        y_start = 0.82
        x_positions = [0.12, 0.42, 0.72]  # 3 columns
        row_height = 0.025

        for col_idx, x_pos in enumerate(x_positions):
            start_idx = col_idx * rows_per_col
            end_idx = min(start_idx + rows_per_col, n_dims)

            if start_idx >= n_dims:
                break

            # Column header
            fig5.text(x_pos, y_start, 'Label', ha='left', fontsize=10, fontweight='bold')
            fig5.text(x_pos + 0.08, y_start, 'Value', ha='left', fontsize=10, fontweight='bold')
            fig5.text(x_pos + 0.18, y_start, 'Type', ha='left', fontsize=10, fontweight='bold')

            # Draw header underline
            fig5.add_artist(plt.Line2D([x_pos - 0.01, x_pos + 0.26], [y_start - 0.008, y_start - 0.008],
                                        transform=fig5.transFigure, color='black', linewidth=1))

            # Data rows
            for i, idx in enumerate(range(start_idx, end_idx)):
                label, value, dim_type = dim_table[idx]
                y = y_start - (i + 1) * row_height - 0.015

                fig5.text(x_pos, y, label, ha='left', fontsize=9, fontfamily='monospace')
                fig5.text(x_pos + 0.08, y, format_dim(value), ha='left', fontsize=9,
                         fontweight='bold', fontfamily='monospace')

                type_str = {'horizontal': 'H', 'vertical': 'V', 'radius': 'R', 'diameter': 'Ø'}.get(dim_type, dim_type)
                fig5.text(x_pos + 0.18, y, type_str, ha='left', fontsize=9, color='#666666')

        # Summary at bottom
        fig5.text(0.5, 0.08, f'Total Dimensions: {n_dims}    |    H=Horizontal  V=Vertical  R=Radius  Ø=Diameter',
                  ha='center', fontsize=9, color='#666666')

        border5 = mpatches.Rectangle((0.03, 0.03), 0.94, 0.94,
                                       fill=False, edgecolor=COLORS['border'],
                                       linewidth=2, transform=fig5.transFigure)
        fig5.patches.append(border5)

        pdf.savefig(fig5, facecolor='white')
        plt.close(fig5)

    print(f"\nBlueprint generated: {output_path}")
    print(f"  Part: {part_name}")
    print(f"  Size: {format_dim(width)} × {format_dim(height)} × {format_dim(thickness)} thick")
    print(f"  Features: {len(analysis.lines)} lines, {len(analysis.arcs)} arcs, {len(analysis.circles)} circles")
    print(f"  Dimensions: {len(dimensions)}")


def main():
    parser = argparse.ArgumentParser(
        description='Generate dimensioned blueprint from DXF file',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  %(prog)s part.dxf
  %(prog)s part.dxf output.png --thickness 0.25
  %(prog)s part.dxf --title "Widget Assembly"
        '''
    )
    parser.add_argument('input', help='Input DXF file path')
    parser.add_argument('output', nargs='?', help='Output PNG file path (default: input_blueprint.png)')
    parser.add_argument('--thickness', '-t', type=float, default=0.5,
                        help='Material thickness in inches (default: 0.5)')
    parser.add_argument('--title', help='Part title (default: filename)')

    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}")
        sys.exit(1)

    if args.output:
        output_path = args.output
    else:
        output_path = input_path.with_name(f"{input_path.stem}_blueprint.png")

    try:
        generate_blueprint(str(input_path), str(output_path),
                          thickness=args.thickness, title=args.title)
    except Exception as e:
        print(f"Error generating blueprint: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
