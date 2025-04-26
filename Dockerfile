FROM node:20-alpine
WORKDIR /app
COPY index.js package.json style.css tailwind.config.js views public ./
RUN npm i
ENTRYPOINT ["npm", "start"]
