FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY src ./src

ENV NODE_ENV=production
EXPOSE 5001

CMD ["node", "src/server.js"]


