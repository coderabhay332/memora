# 1. Use official Node.js image
FROM node:20.19.2-alpine

# 2. Set working directory
WORKDIR /app

# 3. Install pnpm
RUN npm install -g pnpm

# 4. Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN pnpm install

# 5. Copy the rest of your code
COPY . .

# 6. Build the TypeScript code
RUN npx tsc
# 7. Default command (can be overridden by docker-compose or Docker run)
CMD ["node", "dist/index.js"]
