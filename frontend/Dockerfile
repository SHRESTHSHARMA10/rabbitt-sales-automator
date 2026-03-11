# ─── Frontend Dockerfile (Multi-stage build) ───
# Stage 1: Build the React app
# Stage 2: Serve it with nginx (lightweight web server)

# ──────────────────────────────
# STAGE 1: Build
# ──────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first (Docker layer caching)
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build the React app (outputs to /app/dist)
RUN npm run build

# ──────────────────────────────
# STAGE 2: Serve with nginx
# ──────────────────────────────
FROM nginx:alpine

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from Stage 1 into nginx's serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (nginx default)
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
