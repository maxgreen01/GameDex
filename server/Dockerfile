# ===== Backend (Server) Dockerfile =====

# Use the official Node.js image (Alpine for a smaller footprint)
FROM node:25-alpine AS development

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the server source code
COPY server/ ./server/
COPY shared/ ./shared/
COPY scripts/ ./scripts/

# Expose the server port
EXPOSE 3000

# Seed the elasticsearch index, then start the server
CMD ["sh", "-c", "node ./scripts/seedElasticsearch && npm run server"]
