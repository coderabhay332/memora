FROM node:20

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install
RUN npm uninstall sharp
RUN npm install sharp --platform=linux --arch=x64

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]
