FROM node:lts-alpine3.13

WORKDIR /server
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "node", "index.js" ]
