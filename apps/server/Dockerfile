FROM node:18-alpine

RUN apk update && apk add --no-cache curl

WORKDIR /usr/src/server

COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN pnpm build

CMD ["sh", "-c", "pnpm start:prod"]
