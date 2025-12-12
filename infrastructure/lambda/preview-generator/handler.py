"""
Preview Generator Lambda

Generates preview images (PNG) from various CAD and document formats.
Supports: DXF, STL, STEP, STP, IGES, IGS, PDF, PNG, JPG, JPEG, TIFF, TIF
"""

import base64
import io
import json
import os
import tempfile
from pathlib import Path

import boto3

s3 = boto3.client('s3')

# Image settings
MAX_IMAGE_SIZE = (800, 600)  # Max preview dimensions
BACKGROUND_COLOR = 'white'
IMAGE_FORMAT = 'PNG'


def lambda_handler(event, context):
    """
    Generate a preview image from a file in S3.

    Input event:
    {
        "bucket": "bucket-name",
        "key": "quotes/file.step",
        "content_type": "application/step"  # optional, will guess from extension
    }

    Returns:
    {
        "success": true,
        "preview_content": "<base64-encoded PNG>",
        "preview_filename": "file_preview.png"
    }
    """
    print(f"Received event: {json.dumps(event)}")

    bucket = event.get('bucket')
    key = event.get('key')

    if not bucket or not key:
        return {
            'success': False,
            'error': 'Missing bucket or key in event'
        }

    # Determine file type from extension
    filename = os.path.basename(key)
    ext = Path(filename).suffix.lower()

    print(f"Processing {filename} (extension: {ext})")

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = os.path.join(tmpdir, filename)
        output_path = os.path.join(tmpdir, 'preview.png')

        # Download file from S3
        try:
            s3.download_file(bucket, key, input_path)
            print(f"Downloaded {key} ({os.path.getsize(input_path)} bytes)")
        except Exception as e:
            print(f"Failed to download from S3: {e}")
            return {
                'success': False,
                'error': f'Failed to download file: {str(e)}'
            }

        # Generate preview based on file type
        try:
            if ext == '.dxf':
                generate_dxf_preview(input_path, output_path)
            elif ext == '.stl':
                generate_stl_preview(input_path, output_path)
            elif ext in ['.step', '.stp']:
                generate_step_preview(input_path, output_path)
            elif ext in ['.iges', '.igs']:
                generate_iges_preview(input_path, output_path)
            elif ext == '.pdf':
                generate_pdf_preview(input_path, output_path)
            elif ext in ['.png', '.jpg', '.jpeg', '.tiff', '.tif']:
                generate_image_thumbnail(input_path, output_path)
            else:
                print(f"Unsupported file type: {ext}")
                return {
                    'success': False,
                    'error': f'Unsupported file type: {ext}'
                }

        except Exception as e:
            print(f"Preview generation failed: {e}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': f'Preview generation failed: {str(e)}'
            }

        # Read and return the preview
        if not os.path.exists(output_path):
            return {
                'success': False,
                'error': 'Preview file was not created'
            }

        with open(output_path, 'rb') as f:
            preview_content = f.read()

        preview_filename = Path(filename).stem + '_preview.png'
        print(f"Preview generated: {preview_filename} ({len(preview_content)} bytes)")

        return {
            'success': True,
            'preview_content': base64.b64encode(preview_content).decode('utf-8'),
            'preview_filename': preview_filename
        }


def generate_dxf_preview(input_path: str, output_path: str):
    """Generate preview from DXF file using ezdxf + matplotlib."""
    import ezdxf
    from ezdxf.addons.drawing import Frontend, RenderContext
    from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
    import matplotlib.pyplot as plt

    print("Generating DXF preview...")

    doc = ezdxf.readfile(input_path)
    msp = doc.modelspace()

    # Create figure
    fig = plt.figure(figsize=(10, 8), dpi=100)
    ax = fig.add_axes([0, 0, 1, 1])

    # Render DXF
    ctx = RenderContext(doc)
    out = MatplotlibBackend(ax)
    Frontend(ctx, out).draw_layout(msp, finalize=True)

    # Style
    ax.set_facecolor(BACKGROUND_COLOR)
    fig.patch.set_facecolor(BACKGROUND_COLOR)

    # Save
    fig.savefig(output_path, format='png', bbox_inches='tight',
                facecolor=BACKGROUND_COLOR, dpi=100)
    plt.close(fig)

    print("DXF preview generated")


def generate_stl_preview(input_path: str, output_path: str):
    """Generate preview from STL file using trimesh."""
    import trimesh
    import numpy as np
    from PIL import Image

    print("Generating STL preview...")

    # Load mesh
    mesh = trimesh.load(input_path)

    # Create a scene and render
    scene = trimesh.Scene(mesh)

    # Try to get a good camera angle
    try:
        # Render to image
        png = scene.save_image(resolution=(800, 600), visible=False)

        # Save
        with open(output_path, 'wb') as f:
            f.write(png)
    except Exception as e:
        print(f"Trimesh rendering failed: {e}, falling back to matplotlib")
        # Fallback: use matplotlib for a simpler 2D projection
        generate_stl_matplotlib_preview(mesh, output_path)

    print("STL preview generated")


def generate_stl_matplotlib_preview(mesh, output_path: str):
    """Fallback STL preview using matplotlib."""
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d import Axes3D
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection

    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection='3d')

    # Get mesh vertices and faces
    vertices = mesh.vertices
    faces = mesh.faces

    # Create polygon collection
    mesh_collection = Poly3DCollection(vertices[faces], alpha=0.7)
    mesh_collection.set_facecolor('steelblue')
    mesh_collection.set_edgecolor('darkblue')
    mesh_collection.set_linewidth(0.1)

    ax.add_collection3d(mesh_collection)

    # Auto-scale
    scale = vertices.flatten()
    ax.auto_scale_xyz(scale, scale, scale)

    ax.set_facecolor(BACKGROUND_COLOR)
    fig.patch.set_facecolor(BACKGROUND_COLOR)

    fig.savefig(output_path, format='png', bbox_inches='tight',
                facecolor=BACKGROUND_COLOR, dpi=100)
    plt.close(fig)


def generate_step_preview(input_path: str, output_path: str):
    """Generate preview from STEP file using CadQuery/OCP."""
    print("Generating STEP preview...")
    generate_cad_preview_ocp(input_path, output_path, 'step')


def generate_iges_preview(input_path: str, output_path: str):
    """Generate preview from IGES file using CadQuery/OCP."""
    print("Generating IGES preview...")
    generate_cad_preview_ocp(input_path, output_path, 'iges')


def generate_cad_preview_ocp(input_path: str, output_path: str, format_type: str):
    """Generate preview from STEP/IGES using Open CASCADE (via cadquery-ocp)."""
    from OCC.Core.STEPControl import STEPControl_Reader
    from OCC.Core.IGESControl import IGESControl_Reader
    from OCC.Core.IFSelect import IFSelect_RetDone
    from OCC.Core.BRepBndLib import brepbndlib
    from OCC.Core.Bnd import Bnd_Box
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d import Axes3D
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection
    import numpy as np

    # Read the CAD file
    if format_type == 'step':
        reader = STEPControl_Reader()
        status = reader.ReadFile(input_path)
    else:  # iges
        reader = IGESControl_Reader()
        status = reader.ReadFile(input_path)

    if status != IFSelect_RetDone:
        raise Exception(f"Failed to read {format_type.upper()} file")

    reader.TransferRoots()
    shape = reader.OneShape()

    # Get bounding box for scaling
    bbox = Bnd_Box()
    brepbndlib.Add(shape, bbox)
    xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()

    # Use tessellation to get triangles for visualization
    from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
    from OCC.Core.TopExp import TopExp_Explorer
    from OCC.Core.TopAbs import TopAbs_FACE
    from OCC.Core.BRep import BRep_Tool
    from OCC.Core.TopLoc import TopLoc_Location

    # Mesh the shape
    linear_deflection = max(xmax - xmin, ymax - ymin, zmax - zmin) / 50
    mesh = BRepMesh_IncrementalMesh(shape, linear_deflection)
    mesh.Perform()

    # Extract triangles
    vertices = []
    triangles = []

    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    while explorer.More():
        face = explorer.Current()
        location = TopLoc_Location()
        triangulation = BRep_Tool.Triangulation(face, location)

        if triangulation is not None:
            # Get transformation
            trsf = location.Transformation()

            # Get nodes
            nb_nodes = triangulation.NbNodes()
            nb_triangles = triangulation.NbTriangles()

            # Store vertex offset for this face
            vertex_offset = len(vertices)

            # Get vertices
            for i in range(1, nb_nodes + 1):
                node = triangulation.Node(i)
                # Apply transformation
                node = node.Transformed(trsf)
                vertices.append([node.X(), node.Y(), node.Z()])

            # Get triangles
            for i in range(1, nb_triangles + 1):
                tri = triangulation.Triangle(i)
                n1, n2, n3 = tri.Get()
                triangles.append([
                    vertex_offset + n1 - 1,
                    vertex_offset + n2 - 1,
                    vertex_offset + n3 - 1
                ])

        explorer.Next()

    if not vertices or not triangles:
        raise Exception("No geometry found in file")

    vertices = np.array(vertices)
    triangles = np.array(triangles)

    # Create matplotlib 3D plot
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection='3d')

    # Create polygon collection
    mesh_collection = Poly3DCollection(vertices[triangles], alpha=0.8)
    mesh_collection.set_facecolor('steelblue')
    mesh_collection.set_edgecolor('darkblue')
    mesh_collection.set_linewidth(0.1)

    ax.add_collection3d(mesh_collection)

    # Set axis limits
    ax.set_xlim(xmin, xmax)
    ax.set_ylim(ymin, ymax)
    ax.set_zlim(zmin, zmax)

    # Set equal aspect ratio
    max_range = max(xmax - xmin, ymax - ymin, zmax - zmin) / 2
    mid_x = (xmax + xmin) / 2
    mid_y = (ymax + ymin) / 2
    mid_z = (zmax + zmin) / 2
    ax.set_xlim(mid_x - max_range, mid_x + max_range)
    ax.set_ylim(mid_y - max_range, mid_y + max_range)
    ax.set_zlim(mid_z - max_range, mid_z + max_range)

    # Set viewing angle
    ax.view_init(elev=30, azim=45)

    ax.set_facecolor(BACKGROUND_COLOR)
    fig.patch.set_facecolor(BACKGROUND_COLOR)

    # Remove axis labels for cleaner look
    ax.set_xlabel('')
    ax.set_ylabel('')
    ax.set_zlabel('')

    fig.savefig(output_path, format='png', bbox_inches='tight',
                facecolor=BACKGROUND_COLOR, dpi=100)
    plt.close(fig)

    print(f"{format_type.upper()} preview generated")


def generate_pdf_preview(input_path: str, output_path: str):
    """Generate preview from PDF first page."""
    from pdf2image import convert_from_path
    from PIL import Image

    print("Generating PDF preview...")

    # Convert first page only
    images = convert_from_path(input_path, first_page=1, last_page=1, dpi=150)

    if not images:
        raise Exception("No pages found in PDF")

    img = images[0]

    # Resize if needed
    img.thumbnail(MAX_IMAGE_SIZE, Image.Resampling.LANCZOS)

    # Save
    img.save(output_path, 'PNG')

    print("PDF preview generated")


def generate_image_thumbnail(input_path: str, output_path: str):
    """Generate thumbnail from image file."""
    from PIL import Image

    print("Generating image thumbnail...")

    img = Image.open(input_path)

    # Convert to RGB if necessary (handles RGBA, palette modes, etc.)
    if img.mode not in ('RGB', 'L'):
        img = img.convert('RGB')

    # Resize
    img.thumbnail(MAX_IMAGE_SIZE, Image.Resampling.LANCZOS)

    # Save
    img.save(output_path, 'PNG')

    print("Image thumbnail generated")
