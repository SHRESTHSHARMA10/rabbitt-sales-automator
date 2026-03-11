# ─── Backend Dockerfile ───
# Uses Node 20 Alpine (small, production-ready base image)

FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (for better Docker layer caching)
# If dependencies don't change, Docker reuses the cached npm install layer
COPY package.json package-lock.json ./

# Install only production dependencies (no devDependencies like nodemon/eslint)
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose port (reads from ENV at runtime, default 5001)
EXPOSE 5001

# Start the server
CMD ["node", "src/app.js"]
