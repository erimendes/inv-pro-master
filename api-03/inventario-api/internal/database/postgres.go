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
	connStr := "postgres://postgres:postgres@localhost:5432/minha_api_02?sslmode=disable"

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
