# Stage 1: Build React app (Vite Frontend)
FROM node:20-alpine as frontend_builder

WORKDIR /app/otas-frontend

# Copy package.json and package-lock.json first to leverage Docker cache
COPY otas-frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY otas-frontend .

# Build the Vite frontend application
# Vite builds to 'dist' by default
RUN npm run build

# Stage 2: Build Node.js server and serve frontend
FROM node:20-alpine

WORKDIR /app

# Copy backend package.json and tsconfig.json first for caching
COPY package*.json tsconfig.json ./
RUN npm install

# Copy backend source code
COPY src ./src

# Build TypeScript backend code
RUN npx tsc

# Copy the built frontend static files from the frontend_builder stage
# IMPORTANT: Vite output is 'dist', not 'build'
# We copy it into a 'public' directory in the final image,
# which is a common convention for static file serving.
COPY --from=frontend_builder /app/otas-frontend/dist ./public

# Expose the port your Node.js server will listen on
EXPOSE 3000

# Command to run your Node.js server
CMD ["node", "dist/index.js"]
