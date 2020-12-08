FROM node:12.15.0

WORKDIR /usr/server

COPY package.json ./

RUN npm install
RUN npm install -g tsc

COPY . .
RUN npm run build

EXPOSE 7080

CMD [ "npm", "start" ]