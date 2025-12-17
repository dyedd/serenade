# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable


FROM base AS deps

ARG NPM_REGISTRY=https://registry.npmmirror.com
ENV npm_config_registry=$NPM_REGISTRY

COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install --frozen-lockfile


FROM deps AS build

COPY . .

RUN pnpm build


FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/.output ./.output
COPY --from=build /app/content ./content

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
