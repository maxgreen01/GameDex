# ===== Backend (Server) Dockerfile =====

# Use the official Node.js image (Alpine for a smaller footprint)
FROM node:25-alpine AS development

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files from root (monorepo setup)
COPY package*.json ./

# Copy server code
COPY server/ ./server/

# Copy shared if it exists
COPY shared/ ./shared/

# Install dependencies
RUN npm ci

# Expose the server port
EXPOSE 3000

# Command to run the application
CMD [ "npm", "run", "server" ]
