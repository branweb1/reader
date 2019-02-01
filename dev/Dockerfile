FROM nginx:latest

RUN mkdir -p /data/site
RUN mkdir -p /etc/ssl/certs
RUN mkdir -p /etc/ssl/private
COPY nginx.key /etc/ssl/private
COPY nginx.cert /etc/ssl/certs
COPY index.html /data/site
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]