
FROM node:22-slim 
#The -slim variant strips out unneeded packages, saving valuable RAM during the build phase.

WORKDIR /app

# 1. Install Python, pip, and OS-level dependencies for OpenCV


#• libgl1 (Mesa OpenGL Library): This package provides the OpenGL graphics API layer. Even if you are processing videos headlessly (without an actual desktop screen running), underlying computer vision and deep learning packages like decord 
#or face-alignment still use OpenGL pathways to decode video frames, render textures, or run spatial model transformations. Without this package, your code throws the ImportError: libGL.so.1: cannot open shared object file exception.
# libglib2.0-0 (GLib Runtime Library): This is a fundamental low-level C library used by Linux systems. Core image libraries (like the compiled C++ components inside OpenCV and decord) use GLib for internal operations such as handling standard data types, 
# memory management, threads, and interacting with the system's operating kernel.
# library(libsm6 , libxext6 ,libxrender-dev) Just like libgl1, OpenCV (cv2) requires them to handle low-level image processing and rendering, even when running headlessly inside a Docker container.
# Without these libraries  , OpenCV will throw missing .so shared object file errors when you try to import it or process video frames.
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 2. Setup a Python Virtual Environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# 3. Cache and Install Python Dependencies
COPY AIModel/requirements.txt .
# The --extra-index-url forces pip to look at the CPU-only wheels for the exact versions you listed
#• --extra-index-url: When pip reads torch>=2.1.0 from your file, this flag redirects it to download the lightweight CPU wheel instead of the default CUDA wheel.
#• Prevents RAM Spikes: Combined with --no-cache-dir and --no-compile, it keeps the installation small enough to pass safely inside your 8GB RAM limits.

RUN pip install --no-cache-dir --no-compile \
    --extra-index-url https://pytorch.org \
    -r requirements.txt


# FORCE clean out any accidental hidden versions pulled by other packages and then installing version <5 but >=4.10
RUN pip uninstall -y opencv-python opencv-contrib-python opencv-python-headless opencv-contrib-python-headless \
 && pip install --no-cache-dir "opencv-python-headless>=4.10,<5" \
 && python3 -c "import cv2; assert hasattr(cv2, 'CascadeClassifier'), cv2.__version__; print('cv2 OK', cv2.__version__)"


# 4. Cache Node Dependencies
COPY package*.json ./
RUN npm install

# 5. Copy the rest of the application code
COPY . .

# 6. Start the server
EXPOSE 8000

CMD ["node", "app.js"]
