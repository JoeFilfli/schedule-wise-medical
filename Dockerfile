# Stage 1: install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy everything and install dev dependencies
COPY . .
COPY package.json package-lock.json ./
RUN npm ci

# Generate Prisma client and build Next.js
RUN npx prisma generate
RUN npm run build

# Stage 3: production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy built assets and production dependencies (including generated Prisma client)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "start"] 