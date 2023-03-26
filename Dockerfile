FROM node:18-alpine As development
RUN npm i -g pnpm
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm run build

CMD ["pnpm" , "run" , "start:debug"]
FROM node:18-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN pnpm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist
EXPOSE 5000
CMD ["pnpm" , "run" , "start:prod"]