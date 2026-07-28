FROM node:20-alpine

# Install OpenJDK 21 for Minecraft server jar execution
RUN apk add --no-cache openjdk21-jre bash

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend and Express bundled server
RUN npm run build

# Expose internal port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start compiled server
CMD ["npm", "start"]
