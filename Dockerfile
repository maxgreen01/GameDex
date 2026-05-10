# ===== Frontend (Client) Dockerfile =====

# Use the official Node.js image (Alpine for a smaller footprint)
FROM node:25-alpine AS development

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . /usr/src/app

# Expose the client port
EXPOSE 5173

# Command to run the application
CMD ["npm", "run", "dev"]