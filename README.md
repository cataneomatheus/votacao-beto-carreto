# 🎢 Votação Beto Carrero

Lista compartilhada de quem vai ao Beto Carrero. Qualquer pessoa abre o link,
adiciona seu nome e o tipo de ingresso (**Adulto**, **Estudante** ou **PCD**),
e todo mundo vê a mesma lista. Sem login.

Monolito **Node + Express**, com os dados guardados num arquivo **JSON** no
servidor. Frontend **mobile-first** (feito para celular).

## Rodar localmente

```bash
npm install
npm start
```

Abra <http://localhost:3000>. Os dados ficam em `data/data.json`.

Para desenvolvimento com reload automático:

```bash
npm run dev
```

## Como funciona

- `server.js` — servidor Express: serve o frontend (`public/`) e a API.
- `public/` — o site (HTML/CSS/JS puro, sem framework).
- `data/data.json` — onde os nomes ficam salvos (criado automaticamente).

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

### Render (recomendado, plano free)

Este repo já vem com `render.yaml` configurado com **disco persistente** — é o
que garante que os dados **não somem** a cada deploy/restart.

1. Suba o repositório no GitHub.
2. Crie conta em <https://render.com>.
3. **New + → Blueprint** e selecione este repositório.
4. Confirme. O Render lê o `render.yaml`, cria o serviço e o disco.
5. Pronto: pegue a URL gerada (algo como `https://votacao-beto-carrero.onrender.com`)
   e mande no grupo da família.

> Obs.: no plano free do Render o serviço "dorme" após um tempo sem uso; o
> primeiro acesso depois disso demora alguns segundos a mais. Os dados ficam
> salvos no disco persistente normalmente.

### Persistência

O caminho onde o JSON é salvo vem da variável `DATA_DIR`. No Render ele aponta
para o disco persistente (`/var/data`). Localmente, sem essa variável, usa a
pasta `./data`.
