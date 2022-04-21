FROM node:16.14.0-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

RUN npm install -g @nestjs/cli

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
