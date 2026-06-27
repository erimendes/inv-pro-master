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
