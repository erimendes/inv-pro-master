#!/bin/bash

set -e

# Força o uso de módulos modernos do Go
export GO111MODULE=on

echo "📦 Verificando diretório do projeto..."

# CORREÇÃO CRUCIAL: Se o script for executado de fora, ele entra na pasta antes do 'go get'
if [ -d "inventario-api" ]; then
    echo "📂 Entrando na pasta inventario-api..."
    cd inventario-api
elif [ ! -f "go.mod" ]; then
    echo "❌ Erro: Arquivo go.mod não encontrado!"
    echo "Certifique-se de rodar este script na mesma pasta ou um nível acima de inventario-api."
    exit 1
fi

echo "📦 Instalando ferramentas e dependências do Swagger para Go e Fiber..."

# Instala os pacotes do Swagger para o Fiber dentro do módulo correto
go get github.com/gofiber/swagger
go get github.com/swaggo/swag

# Instala o gerador Swag globalmente
go install github.com/swaggo/swag/cmd/swag@latest

# Descobre onde o Go instalou o executável do swag
GOBIN="$(go env GOBIN)"
if [ -z "$GOBIN" ]; then
    GOBIN="$(go env GOPATH)/bin"
fi

# Adiciona temporariamente ao PATH da sessão atual do terminal
export PATH="$PATH:$GOBIN"

# Adiciona ao PATH do usuário permanentemente se não existir
if ! grep -q 'go/bin' "$HOME/.bashrc"; then
    echo 'export PATH="$PATH:$HOME/go/bin"' >> "$HOME/.bashrc"
fi

# Verifica se o executável swag está respondendo
if ! command -v swag >/dev/null 2>&1; then
    echo "❌ Erro: o executável 'swag' não foi encontrado no PATH."
    echo "Tentando executar pelo caminho direto: $GOBIN/swag"
    SWAG_EXEC="$GOBIN/swag"
else
    SWAG_EXEC="swag"
fi

echo "✅ Versão do Swag detectada: $($SWAG_EXEC --version)"

# 3. Atualiza o main.go
echo "📝 Atualizando main.go com suporte ao Swagger..."
cat << 'EOF' > main.go
package main

import (
	"log"
	
	"inventario-api/internal/auth"
	"inventario-api/internal/database"
	"inventario-api/internal/infra"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/swagger"
	
	_ "inventario-api/docs" // Import obrigatório para carregar os arquivos gerados do Swagger
)

// @title           API de Inventário ProMaster
// @version         1.0
// @description     API modular de alta performance com autenticação "Regra de Ouro" (Cookies HttpOnly) e RBAC.
// @host            localhost:8080
// @BasePath        /api

func RequererRole(roleNecessaria string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		token := c.Cookies("session_token")
		role := c.Cookies("user_role")

		if token == "" {
			return c.Status(401).JSON(fiber.Map{"error": "Não autenticado"})
		}

		if role != roleNecessaria {
			return c.Status(403).JSON(fiber.Map{"error": "Acesso proibido para seu nível"})
		}

		return c.Next()
	}
}

func main() {
	database.Conectar()

	app := fiber.New()
	app.Use(logger.New())

	// Rota visual do Swagger
	app.Get("/swagger/*", swagger.HandlerDefault)

	// Rotas da API
	app.Post("/api/register", auth.RegisterHandler)
	app.Post("/api/login", auth.LoginHandler)
	app.Get("/api/dashboard", RequererRole("ADMIN"), infra.DashboardHandler)

	log.Fatal(app.Listen(":8080"))
}
EOF

# 4. Atualiza o handler.go de autenticação
echo "📝 Atualizando internal/auth/handler.go..."
cat << 'EOF' > internal/auth/handler.go
package auth

import (
	"time"
	"github.com/gofiber/fiber/v2"
)

// RegisterHandler godoc
// @Summary      Registrar um novo usuário
// @Description  Cria um usuário no banco PostgreSQL com senha criptografada em Bcrypt
// @Tags         Autenticação
// @Accept       json
// @Produce      json
// @Param        usuario  body      User  true  "Dados do Usuário"
// @Success      201      {object}  map[string]string
// @Failure      400      {object}  map[string]string
// @Failure      409      {object}  map[string]string
// @Router       /register [post]
func RegisterHandler(c *fiber.Ctx) error {
	var user User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "JSON inválido"})
	}

	if err := ServiceRegistrar(user); err != nil {
		return c.Status(409).JSON(fiber.Map{"error": "Usuário já existe"})
	}

	return c.Status(201).JSON(fiber.Map{"message": "Registrado com sucesso"})
}

// LoginHandler godoc
// @Summary      Fazer login no sistema
// @Description  Valida as credenciais e injeta os Cookies HttpOnly de Sessão e de Role (Regra de Ouro)
// @Tags         Autenticação
// @Accept       json
// @Produce      json
// @Param        credenciais  body      User  true  "Credenciais de Login"
// @Success      200          {object}  map[string]string
// @Failure      401          {object}  map[string]string
// @Router       /login [post]
func LoginHandler(c *fiber.Ctx) error {
	var user User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Requisição inválida"})
	}

	token, role, err := ServiceLogin(user)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": err.Error()})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "session_token",
		Value:    token,
		Expires:  time.Now().Add(8 * time.Hour),
		HTTPOnly: true,
		Secure:   false, 
		SameSite: "Lax",
	})

	c.Cookie(&fiber.Cookie{
		Name:     "user_role",
		Value:    string(role),
		Expires:  time.Now().Add(8 * time.Hour),
		HTTPOnly: false, 
		SameSite: "Lax",
	})

	return c.JSON(fiber.Map{"message": "Logado com sucesso"})
}
EOF

# 5. Atualiza o handler.go de infraestrutura
echo "📝 Atualizando internal/infra/handler.go..."
cat << 'EOF' > internal/infra/handler.go
package infra

import "github.com/gofiber/fiber/v2"

// DashboardHandler godoc
// @Summary      Obter dados do painel do Datacenter
// @Description  Retorna os ativos, racks e sistemas se o usuário possuir o cookie de ADMIN
// @Tags         Infraestrutura
// @Produce      json
// @Success      200  {object}  map[string]int
// @Failure      401  {object}  map[string]string
// @Failure      403  {object}  map[string]string
// @Router       /dashboard [get]
func DashboardHandler(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"infraestrutura_ativos": 18,
		"sistemas_apps":          12,
		"datacenter_racks":       14,
		"acessos_users":          0,
	})
}
EOF

# 6. Executa a geração limpa
echo "✨ Gerando arquivos de documentação do Swagger..."
$SWAG_EXEC init --parseDependency

# Organiza e limpa as dependências
echo "🧹 Sincronizando dependências do Go..."
go mod tidy

echo "--------------------------------------------------------"
echo "🎉 Swagger configurado e integrado com sucesso!"
echo "🚀 Execute para iniciar o servidor:"
echo "   cd inventario-api && GO111MODULE=on go run main.go"
echo "🌐 Acesse no seu navegador: http://localhost:8080/swagger/"
echo "--------------------------------------------------------"