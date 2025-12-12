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
            elif ext in ['.step', '.stp', '.iges', '.igs']:
                generate_step_preview(input_path, output_path)
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


def generate_step_preview(input_path: str, output_path: str):
    """Generate preview from STEP/IGES file using OpenCASCADE (OCP)."""
    from OCP.STEPControl import STEPControl_Reader
    from OCP.IGESControl import IGESControl_Reader
    from OCP.IFSelect import IFSelect_RetDone
    from OCP.Bnd import Bnd_Box
    from OCP.BRepBndLib import BRepBndLib
    from OCP.BRepMesh import BRepMesh_IncrementalMesh
    from OCP.TopExp import TopExp_Explorer
    from OCP.TopAbs import TopAbs_FACE
    from OCP.TopoDS import TopoDS
    from OCP.BRep import BRep_Tool
    from OCP.TopLoc import TopLoc_Location
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection
    import numpy as np

    print("Generating STEP/IGES preview...")

    ext = Path(input_path).suffix.lower()

    # Read the file based on extension
    if ext in ['.step', '.stp']:
        reader = STEPControl_Reader()
        status = reader.ReadFile(input_path)
    else:  # IGES
        reader = IGESControl_Reader()
        status = reader.ReadFile(input_path)

    if status != IFSelect_RetDone:
        raise Exception(f"Failed to read {ext} file")

    reader.TransferRoots()
    shape = reader.OneShape()

    # Get bounding box for scale
    bbox = Bnd_Box()
    BRepBndLib.AddClose_s(shape, bbox)
    xmin, ymin, zmin, xmax, ymax, zmax = bbox.Get()

    # Calculate mesh deflection based on size
    max_dim = max(xmax - xmin, ymax - ymin, zmax - zmin)
    deflection = max_dim / 50.0  # Adjust for quality vs speed

    # Mesh the shape
    mesh = BRepMesh_IncrementalMesh(shape, deflection)
    mesh.Perform()

    # Extract triangles from all faces
    all_vertices = []
    all_faces = []
    vertex_offset = 0

    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    while explorer.More():
        face = TopoDS.Face_s(explorer.Current())
        location = TopLoc_Location()
        triangulation = BRep_Tool.Triangulation_s(face, location)

        if triangulation is not None:
            # Get vertices
            nodes = []
            for i in range(1, triangulation.NbNodes() + 1):
                node = triangulation.Node(i)
                if not location.IsIdentity():
                    node = node.Transformed(location.Transformation())
                nodes.append([node.X(), node.Y(), node.Z()])

            # Get triangles
            for i in range(1, triangulation.NbTriangles() + 1):
                tri = triangulation.Triangle(i)
                n1, n2, n3 = tri.Get()
                all_faces.append([
                    vertex_offset + n1 - 1,
                    vertex_offset + n2 - 1,
                    vertex_offset + n3 - 1
                ])

            all_vertices.extend(nodes)
            vertex_offset += len(nodes)

        explorer.Next()

    if not all_vertices:
        raise Exception("No geometry found in file")

    vertices = np.array(all_vertices)
    faces = np.array(all_faces)

    # Create matplotlib 3D plot
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection='3d')

    # Create polygon collection
    mesh_collection = Poly3DCollection(vertices[faces], alpha=0.8)
    mesh_collection.set_facecolor('steelblue')
    mesh_collection.set_edgecolor('darkblue')
    mesh_collection.set_linewidth(0.1)

    ax.add_collection3d(mesh_collection)

    # Set axis limits
    ax.set_xlim(xmin, xmax)
    ax.set_ylim(ymin, ymax)
    ax.set_zlim(zmin, zmax)

    # Set equal aspect ratio
    max_range = max(xmax - xmin, ymax - ymin, zmax - zmin) / 2.0
    mid_x = (xmax + xmin) / 2.0
    mid_y = (ymax + ymin) / 2.0
    mid_z = (zmax + zmin) / 2.0
    ax.set_xlim(mid_x - max_range, mid_x + max_range)
    ax.set_ylim(mid_y - max_range, mid_y + max_range)
    ax.set_zlim(mid_z - max_range, mid_z + max_range)

    # Style
    ax.set_facecolor(BACKGROUND_COLOR)
    fig.patch.set_facecolor(BACKGROUND_COLOR)
    ax.set_axis_off()

    # Save
    fig.savefig(output_path, format='png', bbox_inches='tight',
                facecolor=BACKGROUND_COLOR, dpi=100)
    plt.close(fig)

    print("STEP/IGES preview generated")


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
