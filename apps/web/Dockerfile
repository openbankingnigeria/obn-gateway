FROM node:16

WORKDIR /usr/src/web

COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN pnpm build

CMD ["pnpm", "start"]
