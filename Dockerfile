FROM node:18 as build-stage
WORKDIR /app
# Copy backend files and install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend ./backend
# Copy frontend files (assuming they are static and don't require build tools)
COPY frontend ./frontend
FROM node:18 as production-stage
WORKDIR /app
# Copy backend and frontend files
COPY --from=build-stage /app/backend /backend
COPY --from=build-stage /app/frontend /frontend
# Install only production dependencies for backend
RUN cd /backend && npm ci --only=production
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "/backend/server.js"]
