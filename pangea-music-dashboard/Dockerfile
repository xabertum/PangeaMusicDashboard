# --- Etapa 1: build de la aplicación Angular ---
FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependencias primero para aprovechar la cache de capas de Docker.
COPY package.json package-lock.json ./
RUN npm ci

# Copiar el resto del código fuente y construir en modo producción.
COPY . .
RUN npm run build -- --configuration production

# --- Etapa 2: servir los archivos estáticos con Nginx ---
FROM nginx:1.27-alpine AS runtime

# Configuración de Nginx (gzip, cache de assets, fallback SPA a index.html).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar únicamente los artefactos compilados de la etapa de build.
COPY --from=build /app/dist/pangea-music-dashboard/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
