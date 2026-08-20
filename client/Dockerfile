# --- build stage -------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# These are baked into the static bundle at build time — Vite inlines
# import.meta.env.* values, so they must be present here, not just at
# container runtime.
ARG VITE_BACKEND_URL
ARG VITE_GITHUB_CLIENT_ID
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_GITHUB_CLIENT_ID=$VITE_GITHUB_CLIENT_ID
RUN npm run build

# --- runtime stage -------------------------------------------------------
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
