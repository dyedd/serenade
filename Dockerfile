# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true

RUN corepack enable


FROM base AS deps

ARG NPM_REGISTRY=https://registry.npmmirror.com
ENV npm_config_registry=$NPM_REGISTRY

COPY package.json pnpm-lock.yaml .npmrc ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile


FROM deps AS build

COPY . .
COPY --from=deps /app/node_modules /app/node_modules

RUN pnpm build


FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/app/lib/redirects.json ./app/lib/redirects.json 2>/dev/null || true

EXPOSE 3000

CMD ["sh", "-c", "node build/server/index.js"]
