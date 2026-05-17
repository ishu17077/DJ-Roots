# Use Node 20 as base image
FROM node:20-bullseye-slim

# Install Python 3, FFmpeg, and curl, then explicitly download yt-dlp globally
RUN apt-get update && apt-get install -y \
    python3 \
    ffmpeg \
    curl \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
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
