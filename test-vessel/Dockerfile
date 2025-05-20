ARG NODEJS_DOCKER_IMAGE

FROM ${NODEJS_DOCKER_IMAGE} 

# This is needed for Prisma to work with PostgreSQL
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY --chown=node:node package.json pnpm-lock.yaml ./

# Copy Prisma schema before generating client
COPY --chown=node:node prisma ./prisma/

RUN npm install -g pnpm@$pnpm

RUN pnpm install

# Generate Prisma client with explicit schema path
RUN pnpm exec prisma generate

# Copy the rest of the application
COPY --chown=node:node . .

CMD [ "pnpm", "start:dev" ]