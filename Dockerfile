FROM node:22

RUN apt-get update \
    && apt-get install -y graphicsmagick ffmpeg \
    && rm -rf /var/lib/apt/lists/*

CMD ls -la
