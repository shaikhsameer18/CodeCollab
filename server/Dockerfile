# --- build stage -------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- runtime stage -------------------------------------------------------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# git is required at runtime: the GitHub commit/push feature shells out to
# the real `git` binary (server/src/routes/auth.ts)
RUN apk add --no-cache git

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "dist/server.js"]
