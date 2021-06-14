FROM node:12.15.0-alpine

EXPOSE 7080

WORKDIR /usr/server
COPY package.json ./

RUN npm install && npm install -g tsc

COPY . .
RUN npm run build

CMD [ "npm", "start" ]