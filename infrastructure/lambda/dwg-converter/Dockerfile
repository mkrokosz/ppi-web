FROM public.ecr.aws/lambda/python:3.12

# Install build dependencies
RUN dnf install -y gcc make tar xz && dnf clean all

# Download and build LibreDWG
RUN curl -L https://github.com/LibreDWG/libredwg/releases/download/0.12.5/libredwg-0.12.5.tar.xz | tar -xJ && \
    cd libredwg-0.12.5 && \
    ./configure --prefix=/opt && \
    make -j$(nproc) && \
    make install && \
    cd .. && rm -rf libredwg-0.12.5

# Add LibreDWG to path
ENV PATH="/opt/bin:${PATH}"
ENV LD_LIBRARY_PATH="/opt/lib:${LD_LIBRARY_PATH}"

# Copy handler
COPY handler.py ${LAMBDA_TASK_ROOT}

CMD ["handler.lambda_handler"]
