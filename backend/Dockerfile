FROM node:20-alpine AS build

ENV NODE_ENV=development

# If you have troubles with node-gyp use should install these dependencies
RUN apk add g++ make

WORKDIR /app
COPY package*.json ./
COPY pnpm-*.yaml ./
COPY . ./

RUN corepack enable pnpm
RUN pnpm install

# build js & remove devDependencies from node_modules
RUN pnpm run build && pnpm prune --production

FROM node:20-alpine

ENV PORT=3000
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/build /app
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/links.txt /app/links.txt
RUN mkdir logs

RUN corepack enable pnpm

CMD [ "node", "app.cjs" ]