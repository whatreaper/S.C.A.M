#Build the frontend
FROM node:14-alpine AS build_frontend
#Set working directory
WORKDIR /app/frontend
#Copy frontend package files
COPY frontend/package*.json ./
#Install frontend dependencies
RUN npm install
#Copy frontend source code
COPY frontend/ ./
#Build the frontend application
RUN npm run build
#Build the backend
FROM node:14-alpine
# Set working directory
WORKDIR /app
#Copy backend package files
COPY backend/package*.json ./
#Install backend dependencies
RUN npm install --only=production
#Copy backend source code
COPY backend/ ./
#Copy the frontend build artifacts to the backend's public directory
COPY --from=build_frontend /app/frontend/build ./public
#Expose port
EXPOSE 3000
#Set environment variables
ENV PORT=3000
ENV NODE_ENV=production
#Start the backend application
CMD [ "node", "server.js" ]
