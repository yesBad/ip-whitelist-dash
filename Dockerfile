FROM node:20-alpine
WORKDIR /app
COPY index.js package.json style.css tailwind.config.js ./
COPY views ./views
COPY public ./public
RUN npm i
ENTRYPOINT ["npm", "start"]
