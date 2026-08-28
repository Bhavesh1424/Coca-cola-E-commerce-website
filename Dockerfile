# Use the official lightweight Nginx Alpine image
FROM nginx:alpine

# Copy the static site files into the Nginx container's serving directory
COPY . /usr/share/nginx/html/

# Expose port 80 to the host machine
EXPOSE 80
