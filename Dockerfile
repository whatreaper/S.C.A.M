FROM node:18 as build-stage
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend ./backend
COPY frontend /frontend
RUN cd frontend && npm install
RUN cd frontend && npm run build
FROM node:18 as production-stage
WORKDIR /app
COPY --from=build-stage /app/backend /backend
COPY --from=build-stage /app/frontend/build /frontend/build
RUN cd /backend && npm ci --only=production
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "/backend/server.js"]