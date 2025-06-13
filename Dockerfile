# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files and prisma schema
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app

# Add build arguments for TypeScript and memory settings
ARG NEXT_TELEMETRY_DISABLED=1
ARG NODE_OPTIONS="--max-old-space-size=8192"
ARG SWAP_SIZE=4G

# Install and configure swap
RUN apk add --no-cache util-linux && \
    dd if=/dev/zero of=/swapfile bs=1M count=4096 && \
    chmod 600 /swapfile && \
    mkswap /swapfile && \
    swapon /swapfile

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create public directory
RUN mkdir -p public

# Generate Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the application with optimized settings
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN npm run build

# Clean up swap
RUN swapoff /swapfile && rm /swapfile

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3200

CMD ["npm", "start"] 