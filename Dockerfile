# Base image already includes Node.js 22, all browsers, and required OS deps.
# Pinned to the Playwright version that matches package.json's @playwright/test
# AND to its content-addressable digest — guarantees reproducibility and
# protects against tag re-pointing in the registry.
FROM mcr.microsoft.com/playwright:v1.59.1-noble@sha256:b0ab6f3cb99aa7803adbc14d9027ec1785fc6e433b97e134e0f8fe61683b6b53

# Quiet npm and disable lifecycle hooks that have no purpose inside the container
# (no .git, no editor tooling). Keeps build logs clean and predictable.
ENV CI=true \
    HUSKY=0 \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app

# Lockfile first — this layer is reused across code changes,
# so npm ci re-runs only when dependencies actually change.
COPY package.json package-lock.json ./
RUN npm ci

# Source last — filtered by .dockerignore.
COPY . .

CMD ["npx", "playwright", "test"]
