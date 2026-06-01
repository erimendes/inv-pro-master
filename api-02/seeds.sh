


# Adiciona seed no package.json
sed -i 's/"scripts": {/"scripts": {\n    "db:seed": "ts-node prisma\/seed.ts",/' package.json


cat << 'EOF' > prisma.config.js
import "dotenv/config";
import { defineConfig, env } from "prisma/config";
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
EOF
