# Use an official Node.js runtime as a parent image
FROM node:24.11.0

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# Install dependencies using npm ci
RUN npm ci

# Build the application
RUN npm run docker:setup

# Expose the port the app runs on
EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]