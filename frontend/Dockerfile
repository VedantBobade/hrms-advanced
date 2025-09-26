# Stage 1 - Build React app
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2 - Serve with Nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Copy built files
COPY --from=build /app/build .

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script for runtime env replacement
COPY ./env.sh /docker-entrypoint.d/99-env.sh
RUN chmod +x /docker-entrypoint.d/99-env.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
