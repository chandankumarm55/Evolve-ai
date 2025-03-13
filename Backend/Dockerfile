# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the backend source code into the container
COPY . .

# Expose the backend port (5000)
EXPOSE 5000

# Start the backend service
CMD ["npm", "start"]
