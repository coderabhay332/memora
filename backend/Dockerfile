# Use Node.js 20 base image
FROM node:20

# Install system dependencies for native module compilation
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy dependency files first for better layer caching
COPY package.json ./

# Install dependencies using npm
RUN npm install

# Remove and reinstall sharp specifically for Linux
RUN npm uninstall sharp
RUN npm install sharp --platform=linux --arch=x64

# Copy source code (excluding node_modules and dist via .dockerignore)
COPY . .

# Build the TypeScript code
RUN npm run build

# Create a non-root user for security

# Expose your desired port
EXPOSE 5000

# Run the app
CMD ["node", "dist/index.js"]
