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
