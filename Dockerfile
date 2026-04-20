# Use official lightweight nginx image to serve static files
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy our application files
COPY index.html /usr/share/nginx/html/
COPY style.css  /usr/share/nginx/html/
COPY app.js     /usr/share/nginx/html/

# Custom nginx config for single-page app
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run requires listening on PORT env variable (default 8080)
ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
