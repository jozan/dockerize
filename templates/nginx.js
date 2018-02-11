function template({ port, url }) {
  return `\
# Proxy websockets
# https://nginx.org/en/docs/http/websocket.html
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;

    server_name ${url};
    root /var/www/html;

    index index.html;


    # Create React App uses websockets, you might want to
    # comment this out to enable Hot Module Replacement
    location /sockjs-node/ {
        proxy_pass http://frontend:${port}/sockjs-node/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 24h;
    }

    # Example proxy pass to service which is external to this application
    #
    # ${url}/api-prod -> productionapp.com/api

    # location /api-prod/ {
    #   proxy_pass https://productionapp.com/api/;
    # }

    # Proxy frontend development server
    location / {
        proxy_pass http://frontend:${port};
    }
}

`
}

module.exports = {
    path: './devops/docker/nginx',
    filename: 'site-nginx.conf',
    template
  }
  
