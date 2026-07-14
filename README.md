# 🎢 Votação Beto Carrero

Lista compartilhada de quem vai ao Beto Carrero. Qualquer pessoa abre o link,
adiciona seu nome e o tipo de ingresso (**Adulto**, **Estudante** ou **PCD**),
e todo mundo vê a mesma lista. Sem login.

Monolito **Node + Express**. Os dados ficam no **Turso** (SQLite na nuvem,
grátis e persistente). Frontend **mobile-first** (feito para celular).

## Rodar localmente

```bash
npm install
npm start
```

Abra <http://localhost:3000>. Sem as variáveis do Turso, o app usa um banco
SQLite local em `data/local.db` (criado automaticamente) — ótimo para testar.

Para desenvolvimento com reload automático:

```bash
npm run dev
```

## Como funciona

- `server.js` — servidor Express: serve o frontend (`public/`) e a API, e fala
  com o banco (Turso/libSQL).
- `public/` — o site (HTML/CSS/JS puro, sem framework).
- Dados na tabela `pessoas` (Turso na nuvem; local vira `data/local.db`).

### API

| Método   | Rota                | O que faz                          |
| -------- | ------------------- | ---------------------------------- |
| `GET`    | `/api/pessoas`      | Lista todos                        |
| `POST`   | `/api/pessoas`      | Adiciona `{ nome, tipo }`          |
| `DELETE` | `/api/pessoas/:id`  | Remove pela id                     |

`tipo` deve ser `adulto`, `estudante` ou `pcd`.

## Publicar (para a família acessar pela internet)

> ⚠️ **GitHub Pages não serve para isto.** O Pages só hospeda site estático e
> não roda Node. Use um host que execute Node. O código fica no GitHub; o app
> roda no host.

O plano free do Render **não tem disco persistente**, por isso os dados ficam
no **Turso** (SQLite na nuvem, grátis). São dois passos: criar o banco no Turso
e subir o app no Render.

#### 1. Criar o banco no Turso

1. Crie conta em <https://turso.tech> (grátis, sem cartão).
2. Crie um banco (ex: `beto-carrero`).
3. Pegue os dois valores do banco:
   - **Database URL** (começa com `libsql://...`) → vira `TURSO_DATABASE_URL`
   - **Auth token** → vira `TURSO_AUTH_TOKEN`

> Pelo CLI do Turso: `turso db create beto-carrero`,
> `turso db show beto-carrero --url` e `turso db tokens create beto-carrero`.

#### 2. Subir no Render

1. Suba o repositório no GitHub (já está).
2. Crie conta em <https://render.com>.
3. **New + → Blueprint** e selecione este repositório.
4. Preencha as variáveis `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` com os
   valores do passo 1.
5. Confirme. Pegue a URL gerada (algo como
   `https://votacao-beto-carrero.onrender.com`) e mande no grupo da família.

> Obs.: no plano free do Render o serviço "dorme" após um tempo sem uso; o
> primeiro acesso depois disso demora alguns segundos a mais. Os dados ficam
> salvos no Turso normalmente.

### Persistência

A conexão vem de `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`. Sem essas variáveis
(dev local), o app usa um arquivo SQLite em `data/local.db`.
