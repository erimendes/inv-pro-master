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
