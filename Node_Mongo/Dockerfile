FROM node:10

RUN mkdir /app
ADD . /app

COPY package*.json ./

RUN npm install --only=production

COPY . ./

EXPOSE 8000

CMD [ "node", "server/index.js" ]