#!/bin/bash

echo "🛠️  Iniciando script de correção e instalação de dependências..."

# sudo apt install golang-go

# 1. Verifica se a pasta inventario-api existe e entra nela
if [ -d "inventario-api" ]; then
    echo "📂 Entrando na pasta inventario-api..."
    cd inventario-api
else
    echo "📍 Você já está na pasta correta ou executando a partir dela."
fi

# 2. Garante que o arquivo go.mod seja criado agora que o Go está instalado
if [ ! -f "go.mod" ]; then
    echo "📦 Inicializando o módulo Go (go.mod)..."
    go mod init inventario-api
else
    echo "✅ Arquivo go.mod já existe."
fi

# 3. Baixa e instala as dependências modernas do ecossistema Go
echo "⚡ Baixando o Framework Fiber (Alta Performance)..."
go get github.com/gofiber/fiber/v2

echo "⚡ Baixando o Driver PGX v5 (PostgreSQL Moderno)..."
go get github.com/jackc/pgx/v5

echo "⚡ Baixando biblioteca Bcrypt (Criptografia de Senhas)..."
go get golang.org/x/crypto/bcrypt

# 4. Organiza e limpa o arquivo go.mod para garantir que tudo está linkado
echo "🧹 Organizando dependências com go mod tidy..."
go mod tidy

echo "--------------------------------------------------------"
echo "🎉 Tudo pronto! Os módulos internos e externos foram linkados."
echo "🚀 Para ligar o seu servidor agora, execute:"
echo "   go run main.go"
echo "--------------------------------------------------------"