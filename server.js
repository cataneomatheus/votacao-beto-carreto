import express from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
// DATA_DIR permite apontar para um disco persistente no host (ex: Render/Fly).
// Se não definido, usa a pasta ./data local.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "data.json");

const TIPOS_VALIDOS = ["adulto", "estudante", "pcd"];

// --- Armazenamento em arquivo JSON -----------------------------------------

function garantirArquivo() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ pessoas: [] }, null, 2));
  }
}

function lerDados() {
  garantirArquivo();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const dados = JSON.parse(raw);
    if (!Array.isArray(dados.pessoas)) dados.pessoas = [];
    return dados;
  } catch {
    return { pessoas: [] };
  }
}

// Escrita atômica: grava num arquivo temporário e renomeia, evitando corromper
// o JSON se o processo cair no meio de uma escrita.
function salvarDados(dados) {
  garantirArquivo();
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(dados, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

// --- App --------------------------------------------------------------------

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/pessoas", (req, res) => {
  const { pessoas } = lerDados();
  res.json(pessoas);
});

app.post("/api/pessoas", (req, res) => {
  const nome = String(req.body?.nome ?? "").trim();
  const tipo = String(req.body?.tipo ?? "").trim().toLowerCase();

  if (!nome) {
    return res.status(400).json({ erro: "Informe o nome." });
  }
  if (nome.length > 80) {
    return res.status(400).json({ erro: "Nome muito longo (máx. 80 caracteres)." });
  }
  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ erro: "Tipo de ingresso inválido." });
  }

  const dados = lerDados();
  const pessoa = {
    id: crypto.randomUUID(),
    nome,
    tipo,
    criadoEm: new Date().toISOString(),
  };
  dados.pessoas.push(pessoa);
  salvarDados(dados);

  res.status(201).json(pessoa);
});

app.delete("/api/pessoas/:id", (req, res) => {
  const dados = lerDados();
  const antes = dados.pessoas.length;
  dados.pessoas = dados.pessoas.filter((p) => p.id !== req.params.id);

  if (dados.pessoas.length === antes) {
    return res.status(404).json({ erro: "Pessoa não encontrada." });
  }
  salvarDados(dados);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Beto Carrero rodando em http://localhost:${PORT}`);
  console.log(`Dados em: ${DATA_FILE}`);
});
