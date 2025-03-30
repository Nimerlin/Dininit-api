# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy necessary files and folders
COPY server.js .
COPY app/ app/


# Set environment variable for production
ENV NODE_ENV=production

# Expose the port Next.js runs on
EXPOSE 3001

# Command to start the app
CMD ["node", "server.js"]
