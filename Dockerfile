FROM node:12-alpine AS base

ENV ELASTICIO_OTEL_SERVICE_NAME=COMPONENT:GRAPHQL

RUN apk --no-cache add \
    python3 \
    make \
    g++ \
    libc6-compat

WORKDIR /usr/src/app

COPY package.json /usr/src/app

RUN npm install

COPY . /usr/src/app

RUN npm run compile

RUN npm prune --production

RUN chown -R node:node .

USER node
ENTRYPOINT ["node", "./node_modules/@openintegrationhub/ferryman/runGlobal.js"]