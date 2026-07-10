FROM node:22.16.0-bookworm-slim AS build

WORKDIR /app

ARG VITE_API_GATEWAY_URL=http://localhost:8000
ARG VITE_NOTIFICATIONS_API_URL=http://localhost:3004
ARG VITE_ANALYTICS_API_URL=http://localhost:3005
ARG VITE_API_KEY=campusconnect-dev-api-key

ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL
ENV VITE_NOTIFICATIONS_API_URL=$VITE_NOTIFICATIONS_API_URL
ENV VITE_ANALYTICS_API_URL=$VITE_ANALYTICS_API_URL
ENV VITE_API_KEY=$VITE_API_KEY

COPY package.json package-lock.json ./
RUN npm config set registry https://registry.npmjs.org/ \
    && npm config set strict-ssl false \
    && npm ci --no-audit --no-fund --prefer-online --fetch-timeout=300000 --fetch-retries=5

COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=5 --start-period=10s \
    CMD curl -f http://127.0.0.1/health || exit 1
