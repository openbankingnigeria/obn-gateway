FROM node:16

WORKDIR /usr/src/web

COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

ARG NEXT_PUBLIC_BASE_API_ENDPOINT
ENV NEXT_PUBLIC_BASE_API_ENDPOINT $NEXT_PUBLIC_BASE_API_ENDPOINT

RUN pnpm build

CMD ["pnpm", "start"]
