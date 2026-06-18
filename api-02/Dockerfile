FROM node:24-alpine
WORKDIR /app

# Copia tudo da pasta api-02 para dentro de /app
COPY . .

# Entra na subpasta onde o seu projeto Node realmente está
WORKDIR /app/minha-api-02

# Agora sim, o package.json estará aqui e o comando funcionará!
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start:dev"]