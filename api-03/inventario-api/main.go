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
