FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

# Run the application as the non-root Node user
USER node

EXPOSE 5000

CMD ["npm", "start"]