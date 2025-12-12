# Preview Generator Lambda
# Generates preview images from CAD files (DXF, STL, STEP, IGES, PDF, images)

FROM public.ecr.aws/lambda/python:3.12

# Install system dependencies (Amazon Linux 2023 uses dnf)
# Additional libs needed for OpenCASCADE (STEP/IGES support)
RUN dnf install -y \
    mesa-libGL \
    mesa-libGLU \
    libXrender \
    libXext \
    libXmu \
    libXi \
    freetype \
    fontconfig \
    poppler-utils \
    && dnf clean all

# Install Python dependencies
# cadquery-ocp provides OpenCASCADE bindings for STEP/IGES support
RUN pip install --no-cache-dir \
    ezdxf \
    matplotlib \
    trimesh \
    numpy \
    pillow \
    pdf2image \
    cadquery-ocp

# Set matplotlib to use non-interactive backend
ENV MPLBACKEND=Agg

# Copy handler
COPY handler.py ${LAMBDA_TASK_ROOT}

CMD ["handler.lambda_handler"]
