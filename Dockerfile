# Tahap 1: Install dependensi dan Build aplikasi
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
# Install dengan npm install (termasuk legacy peer deps jika dibutuhkan)
RUN npm install --legacy-peer-deps

COPY . .
# Build Remix app
RUN npm run build

# Tahap 2: Runner (Hanya membawa file production)
FROM node:20-alpine AS runner

WORKDIR /app

# Atur environment variable
ENV NODE_ENV=production
ENV PORT=3000

# Copy file build dan node_modules yang dibutuhkan
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
# Install production dependencies saja
RUN npm install --omit=dev --legacy-peer-deps

EXPOSE 3000
CMD ["npm", "run", "start"]
