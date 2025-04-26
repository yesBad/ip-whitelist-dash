FROM node:20-alpine
WORKDIR /app
COPY index.js package.json views/ public/ ./
RUN npm i
ENTRYPOINT ["npm", "start"]
