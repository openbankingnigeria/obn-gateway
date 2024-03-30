FROM node:16-alpine

WORKDIR /usr/src/server

COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN pnpm build

CMD ["sh", "-c", "pnpm start:prod"]
