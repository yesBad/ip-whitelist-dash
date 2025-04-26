FROM node:20-alpine
WORKDIR /app
COPY index.js package.json ./
RUN npm i
ENTRYPOINT ["npm", "start"]
