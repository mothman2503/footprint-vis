# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY . .
RUN npm install

# Build for production
RUN npm run build

# Serve with a lightweight server (if needed)
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
