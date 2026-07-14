import express from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
const TIPOS_VALIDOS = ["adulto", "estudante", "pcd"];

// --- Banco (Turso / libSQL) -------------------------------------------------
// Em produção: defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN (do painel do Turso).
// Sem essas variáveis (dev local), usa um arquivo SQLite em ./data/local.db.
let url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
  url = "file:" + path.join(__dirname, "data", "local.db");
}

const db = createClient({ url, authToken });

await db.execute(`
  CREATE TABLE IF NOT EXISTS pessoas (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    criado_em TEXT NOT NULL
  )
`);

// --- App --------------------------------------------------------------------

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function paraJson(row) {
  return { id: row.id, nome: row.nome, tipo: row.tipo, criadoEm: row.criado_em };
}

app.get("/api/pessoas", async (req, res) => {
  try {
    const rs = await db.execute("SELECT * FROM pessoas ORDER BY criado_em ASC");
    res.json(rs.rows.map(paraJson));
  } catch {
    res.status(500).json({ erro: "Erro ao ler a lista." });
  }
});

app.post("/api/pessoas", async (req, res) => {
  const nome = String(req.body?.nome ?? "").trim();
  const tipo = String(req.body?.tipo ?? "").trim().toLowerCase();

  if (!nome) return res.status(400).json({ erro: "Informe o nome." });
  if (nome.length > 80) {
    return res.status(400).json({ erro: "Nome muito longo (máx. 80 caracteres)." });
  }
  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ erro: "Tipo de ingresso inválido." });
  }

  const pessoa = {
    id: crypto.randomUUID(),
    nome,
    tipo,
    criadoEm: new Date().toISOString(),
  };

  try {
    await db.execute({
      sql: "INSERT INTO pessoas (id, nome, tipo, criado_em) VALUES (?, ?, ?, ?)",
      args: [pessoa.id, pessoa.nome, pessoa.tipo, pessoa.criadoEm],
    });
    res.status(201).json(pessoa);
  } catch {
    res.status(500).json({ erro: "Erro ao salvar." });
  }
});

app.delete("/api/pessoas/:id", async (req, res) => {
  try {
    const rs = await db.execute({
      sql: "DELETE FROM pessoas WHERE id = ?",
      args: [req.params.id],
    });
    if (rs.rowsAffected === 0) {
      return res.status(404).json({ erro: "Pessoa não encontrada." });
    }
    res.status(204).end();
  } catch {
    res.status(500).json({ erro: "Erro ao remover." });
  }
});

app.listen(PORT, () => {
  console.log(`Beto Carrero rodando em http://localhost:${PORT}`);
  console.log(`Banco: ${url.startsWith("file:") ? url : "Turso (remoto)"}`);
});
