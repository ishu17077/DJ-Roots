# Use Node 24 (Bookworm) as base image to ensure Python >= 3.11 for yt-dlp
FROM node:24-bookworm-slim

# Install Python 3, pip, and FFmpeg, then install yt-dlp via pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && pip3 install --no-cache-dir --break-system-packages yt-dlp \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Skip youtube-dl-exec post-install download (since we manually installed yt-dlp)
ENV YOUTUBE_DL_SKIP_DOWNLOAD=true

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port (Render automatically exposes the port specified in PORT env variable, defaulting to 10000)
ENV PORT=5000
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
