# Preview Generator Lambda
# Generates preview images from CAD files (DXF, STL, STEP, IGES, PDF, images)

FROM public.ecr.aws/lambda/python:3.11

# Install system dependencies
RUN dnf install -y \
    mesa-libGL \
    mesa-libGLU \
    libXrender \
    libXext \
    poppler-utils \
    && dnf clean all

# Install Python dependencies
# Note: Using cadquery which includes OCP (Open CASCADE Python bindings)
RUN pip install --no-cache-dir \
    cadquery-ocp \
    ezdxf \
    matplotlib \
    trimesh \
    numpy \
    pillow \
    pdf2image \
    svglib \
    reportlab

# Set matplotlib to use non-interactive backend
ENV MPLBACKEND=Agg

# Copy handler
COPY handler.py ${LAMBDA_TASK_ROOT}

CMD ["handler.lambda_handler"]
