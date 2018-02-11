function template({ port, url }) {
  return `\
version: "3"
services:
  web:
    image: nginx
    volumes:
      - ./devops/docker/nginx/site-nginx.conf:/etc/nginx/conf.d/mysite.template
      - ./public:/var/www/html
    ports:
      - 8080:80
    environment:
      - VIRTUAL_HOST=${url}
    command: /bin/bash -c "envsubst '\$\${VIRTUAL_HOST}' < /etc/nginx/conf.d/mysite.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
    networks:
      default:
        aliases:
          - ${url}
      fraktiodocker_default:
    links:
      - frontend
  frontend:
    image: node:8-alpine
    volumes:
      - .:/app
      - front_node_modules:/app/node_modules
    ports:
      - 3000:3000
    command: ash -c "cd /app && yarn && yarn start"
    environment:
      - REACT_APP_API_URL=http://${url}/api
      - HOST=0.0.0.0

networks:
  default:
  fraktiodocker_default:
    external:
      name: fraktiodocker_default

volumes:
  front_node_modules:

`
}

module.exports = {
  path: './',
  filename: 'docker-compose.yml',
  template
}
