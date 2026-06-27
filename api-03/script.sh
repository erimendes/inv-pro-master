#!/bin/bash

echo "🚀 Iniciando a criação do projeto Go Modular (inventario-api)..."

# 1. Criação das pastas da estrutura
mkdir -p inventario-api/internal/database
mkdir -p inventario-api/internal/auth
mkdir -p inventario-api/internal/infra

cd inventario-api

# 2. Inicialização do módulo Go
go mod init inventario-api

# 3. Criando os arquivos do módulo DATABASE
echo "📦 Criando internal/database/postgres.go..."
cat << 'EOF' > internal/database/postgres.go
package database

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Pool global de conexões
var DB *pgxpool.Pool

func Conectar() {
	ctx := context.Background()
	connStr := "postgres://postgres:suasenha@localhost:5432/inventario?sslmode=disable"

	var err error
	// pgxpool gerencia múltiplas conexões concorrentes sozinho
	DB, err = pgxpool.New(ctx, connStr)
	if err != nil {
		log.Fatalf("Não foi possível criar o pool de conexões: %v", err)
	}

	if err := DB.Ping(ctx); err != nil {
		log.Fatalf("Banco de dados inacessível: %v", err)
	}

	fmt.Println("Conectado ao PostgreSQL com pgx com sucesso!")
	criarTabelas(ctx)
}

func criarTabelas(ctx context.Context) {
	schema := `
	CREATE TABLE IF NOT EXISTS usuarios (
		id SERIAL PRIMARY KEY,
		username VARCHAR(50) UNIQUE NOT NULL,
		password TEXT NOT NULL,
		role VARCHAR(20) NOT NULL
	);`

	_, err := DB.Exec(ctx, schema)
	if err != nil {
		log.Fatalf("Erro ao criar tabelas: %v", err)
	}
}
EOF

# 4. Criando os arquivos do módulo AUTH
echo "🔐 Criando internal/auth/model.go..."
cat << 'EOF' > internal/auth/model.go
package auth

import "golang.org/x/crypto/bcrypt"

type Role string

const (
	RoleAdmin Role = "ADMIN"
	RoleUser  Role = "USER"
)

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Role     Role   `json:"role"`
}

// HashPassword transforma a senha em texto limpo em uma hash segura
func (u *User) HashPassword() error {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedBytes)
	return nil
}

// CheckPassword compara a senha digitada com a hash do banco
func (u *User) CheckPassword(providedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(providedPassword))
	return err == nil
}
EOF

echo "🗄️ Criando internal/auth/repository.go..."
cat << 'EOF' > internal/auth/repository.go
package auth

import (
	"context"
	"inventario-api/internal/database"
)

func CriarUsuario(u User) error {
	query := `INSERT INTO usuarios (username, password, role) VALUES ($1, $2, $3)`
	_, err := database.DB.Exec(context.Background(), query, u.Username, u.Password, u.Role)
	return err
}

func BuscarPorUsername(username string) (User, error) {
	query := `SELECT id, username, password, role FROM usuarios WHERE username = $1`
	var u User
	err := database.DB.QueryRow(context.Background(), query, username).Scan(&u.ID, &u.Username, &u.Password, &u.Role)
	return u, err
}
EOF

echo "🧠 Criando internal/auth/service.go..."
cat << 'EOF' > internal/auth/service.go
package auth

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
)

func ServiceRegistrar(u User) error {
	if u.Role != RoleAdmin && u.Role != RoleUser {
		u.Role = RoleUser
	}
	
	// CRIPTOGRAFIA REAL: Nunca salve senha limpa
	if err := u.HashPassword(); err != nil {
		return err
	}
	
	return CriarUsuario(u)
}

func ServiceLogin(credentials User) (string, Role, error) {
	usuarioSalvo, err := BuscarPorUsername(credentials.Username)
	if err != nil || !usuarioSalvo.CheckPassword(credentials.Password) {
		return "", "", errors.New("credenciais inválidas")
	}

	// Gera o Token de Sessão Aleatório
	b := make([]byte, 32)
	rand.Read(b)
	token := base64.URLEncoding.EncodeToString(b)

	return token, usuarioSalvo.Role, nil
}
EOF

echo "🚦 Criando internal/auth/handler.go..."
cat << 'EOF' > internal/auth/handler.go
package auth

import (
	"time"
	"github.com/gofiber/fiber/v2"
)

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

func LoginHandler(c *fiber.Ctx) error {
	var user User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Requisição inválida"})
	}

	token, role, err := ServiceLogin(user)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": err.Error()})
	}

	// REGRA DE OURO MODERNA COM FIBER: Injetando Cookies de forma simples
	c.Cookie(&fiber.Cookie{
		Name:     "session_token",
		Value:    token,
		Expires:  time.Now().Add(8 * time.Hour),
		HTTPOnly: true, // Proteção contra roubo por JS
		Secure:   false, // Altere para TRUE em produção (HTTPS)
		SameSite: "Lax",
	})

	c.Cookie(&fiber.Cookie{
		Name:     "user_role",
		Value:    string(role),
		Expires:  time.Now().Add(8 * time.Hour),
		HTTPOnly: false, // Frontend lê para montar o menu
		SameSite: "Lax",
	})

	return c.JSON(fiber.Map{"message": "Logado com sucesso"})
}
EOF

# 5. Criando os arquivos do módulo INFRA
echo "🖥️ Criando internal/infra/handler.go..."
cat << 'EOF' > internal/infra/handler.go
package infra

import "github.com/gofiber/fiber/v2"

func DashboardHandler(c *fiber.Ctx) error {
	// Retorna exatamente os dados do seu painel corporativo
	return c.JSON(fiber.Map{
		"infraestrutura_ativos": 18,
		"sistemas_apps":          12,
		"datacenter_racks":       14,
		"acessos_users":          0,
	})
}
EOF

# 6. Criando o arquivo principal MAIN.GO
echo "🏁 Criando main.go..."
cat << 'EOF' > main.go
package main

import (
	"log"
	
	"inventario-api/internal/auth"
	"inventario-api/internal/database"
	"inventario-api/internal/infra"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

// Middleware moderno para checar Autenticação e Roles
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

		return c.Next() // Permite prosseguir para a rota real
	}
}

func main() {
	// 1. Conecta ao banco de dados usando pgx pool
	database.Conectar()

	// 2. Inicializa o App do Fiber
	app := fiber.New()

	// Middleware de Log integrado (mostra as requisições em tempo real no console)
	app.Use(logger.New())

	// 3. Rotas Públicas
	app.Post("/api/register", auth.RegisterHandler)
	app.Post("/api/login", auth.LoginHandler)

	// 4. Rotas Protegidas por Role (Exemplo: Dados do Datacenter)
	app.Get("/api/dashboard", RequererRole("ADMIN"), infra.DashboardHandler)

	// 5. Inicia o Servidor de Alta Performance
	log.Fatal(app.Listen(":8080"))
}
EOF

# 7. Baixando e arrumando todas as dependências necessárias
echo "⚡ Instalando as dependências do ecossistema Go..."
go get github.com/gofiber/fiber/v2
go get github.com/jackc/pgx/v5
go get golang.org/x/crypto/bcrypt

echo "🧹 Executando go mod tidy para limpar dependências..."
go mod tidy

echo "🎉 Projeto estruturado e dependências instaladas com sucesso!"
echo "👉 Para rodar a aplicação: cd inventario-api && go run main.go"