FROM node:16

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

VOLUME [ "/usr/src/app/node_modules" ]

RUN pnpm run build

CMD [ "pnpm", "run", "dev" ]
