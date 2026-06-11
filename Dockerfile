FROM node:20-alpine

WORKDIR /app

COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci

COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm ci

COPY . .

RUN cd client && npm run build

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "server/index.js"]
