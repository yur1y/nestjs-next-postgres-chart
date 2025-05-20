ARG NODEJS_DOCKER_IMAGE

FROM ${NODEJS_DOCKER_IMAGE} 

WORKDIR /app

COPY --chown=node:node package.json pnpm-lock.yaml ./

RUN npm install -g pnpm@$pnpm

RUN pnpm install

# Copy the rest of the application
COPY --chown=node:node . .

CMD [ "pnpm", "dev" ]