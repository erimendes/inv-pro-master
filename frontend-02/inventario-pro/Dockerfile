# --- Build Stage ---
FROM node:24-alpine3.22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# O truque para o Vite aceitar conexões na rede do Docker:
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]