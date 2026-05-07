# =============================
# Stage 1: Build
# =============================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

# =============================
# Stage 2: Serve via Nginx
# =============================
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
# Copia como template — o CMD faz envsubst só em $BACKEND_URL antes de iniciar
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

EXPOSE 80

# envsubst substitui apenas ${BACKEND_URL}; demais variáveis nginx ($uri, $host…) ficam intactas
CMD ["/bin/sh", "-c", "envsubst '$BACKEND_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
