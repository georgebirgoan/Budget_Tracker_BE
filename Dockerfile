FROM node:24

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx prisma generate && npm run build && npm run start"]