FROM nginx:1.11.1-alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir /app
RUN mkdir -p /app/logs/nginx
RUN mkdir -p /app/app

COPY ./dist /app/app/dist
