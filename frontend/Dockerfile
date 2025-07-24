################ DEV‑stage: Bun + Vite HMR ################
FROM oven/bun:1-alpine AS dev
WORKDIR /app

COPY bun.lock package.json ./
RUN bun install                         # быстрее npm ci
COPY . .

ENV HOST=0.0.0.0 \
    CHOKIDAR_USEPOLLING=true \
    CHOKIDAR_INTERVAL=300
EXPOSE 5173
CMD ["bun","run","dev","--","--host","0.0.0.0"]

################ BUILD‑stage (production) #################
FROM oven/bun:1-alpine AS build
WORKDIR /app
COPY bun.lockb package.json ./
RUN bun install --production
COPY . .
RUN bun run build                      # Vite build

FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
