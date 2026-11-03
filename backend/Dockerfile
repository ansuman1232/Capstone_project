
FROM node:22-slim 


WORKDIR /app





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


ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"


COPY AIModel/requirements.txt .

RUN pip install --no-cache-dir --no-compile \
    --extra-index-url https://pytorch.org \
    -r requirements.txt



RUN pip uninstall -y opencv-python opencv-contrib-python opencv-python-headless opencv-contrib-python-headless \
 && pip install --no-cache-dir "opencv-python-headless>=4.10,<5" \
 && python3 -c "import cv2; assert hasattr(cv2, 'CascadeClassifier'), cv2.__version__; print('cv2 OK', cv2.__version__)"



COPY package*.json ./
RUN npm install


COPY . .


EXPOSE 8000

CMD ["node", "app.js"]
