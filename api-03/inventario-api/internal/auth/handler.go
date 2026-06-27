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
