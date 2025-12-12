"""
DWG to DXF Converter Lambda

Converts DWG files to DXF format using LibreDWG.
Invoked synchronously by the quote processor when a DWG file is uploaded.
"""

import subprocess
import tempfile
import os
import boto3
import base64
import json

s3 = boto3.client('s3')


def lambda_handler(event, context):
    """
    Convert a DWG file from S3 to DXF.

    Input event:
    {
        "bucket": "bucket-name",
        "key": "quotes/file.dwg"
    }

    Returns:
    {
        "success": true,
        "dxf_content": "<base64-encoded DXF>",
        "dxf_filename": "file.dxf"
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

    print(f"Converting s3://{bucket}/{key}")

    with tempfile.TemporaryDirectory() as tmpdir:
        dwg_path = os.path.join(tmpdir, 'input.dwg')
        dxf_path = os.path.join(tmpdir, 'output.dxf')

        # Download DWG from S3
        try:
            s3.download_file(bucket, key, dwg_path)
            file_size = os.path.getsize(dwg_path)
            print(f"Downloaded {key} ({file_size} bytes)")
        except Exception as e:
            print(f"Failed to download from S3: {e}")
            return {
                'success': False,
                'error': f'Failed to download file: {str(e)}'
            }

        # Convert DWG to DXF using LibreDWG
        try:
            result = subprocess.run(
                ['dwg2dxf', dwg_path, '-o', dxf_path],
                capture_output=True,
                text=True,
                timeout=60
            )

            # Log output for debugging
            if result.stdout:
                print(f"dwg2dxf stdout: {result.stdout}")
            if result.stderr:
                print(f"dwg2dxf stderr: {result.stderr}")

            if result.returncode != 0:
                print(f"Conversion failed with return code {result.returncode}")
                return {
                    'success': False,
                    'error': result.stderr or f'Conversion failed (exit code {result.returncode})'
                }

        except subprocess.TimeoutExpired:
            print("Conversion timed out after 60 seconds")
            return {
                'success': False,
                'error': 'Conversion timed out'
            }
        except Exception as e:
            print(f"Conversion error: {e}")
            return {
                'success': False,
                'error': f'Conversion error: {str(e)}'
            }

        # Verify output file exists
        if not os.path.exists(dxf_path):
            print("DXF output file not created")
            return {
                'success': False,
                'error': 'DXF output file not created'
            }

        # Read converted DXF
        with open(dxf_path, 'rb') as f:
            dxf_content = f.read()

        # Generate DXF filename from original
        original_filename = os.path.basename(key)
        dxf_filename = os.path.splitext(original_filename)[0] + '.dxf'

        print(f"Conversion successful: {dxf_filename} ({len(dxf_content)} bytes)")

        return {
            'success': True,
            'dxf_content': base64.b64encode(dxf_content).decode('utf-8'),
            'dxf_filename': dxf_filename
        }
