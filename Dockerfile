# Use a lightweight Node.js image
FROM node:20-alpine

# Create & set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the source code
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# Define the startup command
CMD ["npm", "start"]
