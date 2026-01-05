# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY 02-end-to-end/client/package*.json 02-end-to-end/client/
COPY 02-end-to-end/server/package*.json 02-end-to-end/server/

RUN npm install

COPY . .
RUN npm run build -w 02-end-to-end/client
RUN npm prune --omit=dev

# Runtime stage
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV CLIENT_DIST=/app/02-end-to-end/client/dist

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/02-end-to-end/server ./02-end-to-end/server
COPY --from=builder /app/02-end-to-end/client/dist ./02-end-to-end/client/dist

EXPOSE 4000
CMD ["npm", "run", "start", "-w", "02-end-to-end/server"]
