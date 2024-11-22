FROM node:18 as build-stage
WORKDIR /app
# Copy and install dependencies for the backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend ./backend
# Copy and install dependencies for the frontend
COPY frontend ./frontend
FROM node:18 as production-stage
WORKDIR /app
# Copy backend and frontend build outputs
COPY --from=build-stage /app/backend /backend
COPY --from=build-stage /app/frontend/build /frontend/build
# Install only production dependencies for the backend
RUN cd /backend && npm ci --only=production
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "/backend/server.js"]
