const form = document.getElementById("form");
const btnAbrir = document.getElementById("btnAbrir");
const btnCancelar = document.getElementById("btnCancelar");
const inputNome = document.getElementById("nome");
const erroEl = document.getElementById("erro");
const listaEl = document.getElementById("lista");
const vazioEl = document.getElementById("vazio");
const contadorEl = document.getElementById("contador");
const modalEl = document.getElementById("modal");
const modalTextoEl = document.getElementById("modal-texto");
const modalCancelarEl = document.getElementById("modal-cancelar");
const modalConfirmarEl = document.getElementById("modal-confirmar");

const ROTULOS = {
  adulto: "Adulto",
  estudante: "Estudante",
  pcd: "PCD",
};

function mostrarErro(msg) {
  erroEl.textContent = msg;
  erroEl.hidden = !msg;
}

function abrirForm() {
  form.hidden = false;
  btnAbrir.hidden = true;
  inputNome.focus();
}

function fecharForm() {
  form.hidden = true;
  btnAbrir.hidden = false;
  form.reset();
  mostrarErro("");
}

// Renderiza a lista. `idNovo` (opcional) recebe a animação de entrada.
function render(pessoas, idNovo) {
  const total = pessoas.length;
  if (contadorEl.textContent !== String(total)) {
    contadorEl.classList.remove("pulsa");
    void contadorEl.offsetWidth; // reinicia a animação
    contadorEl.classList.add("pulsa");
  }
  contadorEl.textContent = String(total);
  vazioEl.hidden = total > 0;
  listaEl.innerHTML = "";

  for (const p of pessoas) {
    const li = document.createElement("li");
    li.className = "item";
    if (p.id === idNovo) li.classList.add("novo");

    const info = document.createElement("div");
    info.className = "item-info";

    const nome = document.createElement("div");
    nome.className = "item-nome";
    nome.textContent = p.nome;

    const badge = document.createElement("span");
    badge.className = `badge badge-${p.tipo}`;
    badge.textContent = ROTULOS[p.tipo] ?? p.tipo;

    info.append(nome, badge);

    const btnRemover = document.createElement("button");
    btnRemover.className = "btn-remover";
    btnRemover.type = "button";
    btnRemover.title = "Remover";
    btnRemover.setAttribute("aria-label", `Remover ${p.nome}`);
    btnRemover.textContent = "✕";
    btnRemover.addEventListener("click", () => remover(li, p.id, p.nome));

    li.append(info, btnRemover);
    listaEl.append(li);
  }
}

async function carregar(idNovo) {
  try {
    const res = await fetch("/api/pessoas");
    if (!res.ok) throw new Error();
    render(await res.json(), idNovo);
  } catch {
    mostrarErro("Não consegui carregar a lista. Tente recarregar a página.");
  }
}

async function adicionar(evento) {
  evento.preventDefault();
  mostrarErro("");

  const tipoSelecionado = form.querySelector('input[name="tipo"]:checked');
  const corpo = {
    nome: inputNome.value.trim(),
    tipo: tipoSelecionado ? tipoSelecionado.value : "",
  };

  if (!corpo.nome) {
    mostrarErro("Informe o nome.");
    return;
  }

  try {
    const res = await fetch("/api/pessoas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    if (!res.ok) {
      const dados = await res.json().catch(() => ({}));
      throw new Error(dados.erro || "Não consegui adicionar.");
    }
    const criado = await res.json();
    fecharForm();
    await carregar(criado.id);
    soltarConfete();
  } catch (e) {
    mostrarErro(e.message || "Não consegui adicionar.");
  }
}

// Modal de confirmação customizado. Retorna uma Promise<boolean>.
function confirmar(mensagem) {
  return new Promise((resolve) => {
    modalTextoEl.textContent = mensagem;
    modalEl.hidden = false;

    function fechar(resultado) {
      modalEl.hidden = true;
      modalConfirmarEl.removeEventListener("click", aoConfirmar);
      modalCancelarEl.removeEventListener("click", aoCancelar);
      modalEl.removeEventListener("click", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
      resolve(resultado);
    }
    function aoConfirmar() { fechar(true); }
    function aoCancelar() { fechar(false); }
    function aoClicarFora(e) { if (e.target === modalEl) fechar(false); }
    function aoTeclar(e) { if (e.key === "Escape") fechar(false); }

    modalConfirmarEl.addEventListener("click", aoConfirmar);
    modalCancelarEl.addEventListener("click", aoCancelar);
    modalEl.addEventListener("click", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    modalConfirmarEl.focus();
  });
}

async function remover(li, id, nome) {
  const ok = await confirmar(`Remover ${nome} da lista?`);
  if (!ok) return;
  try {
    const res = await fetch(`/api/pessoas/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) throw new Error();
    // anima a saída antes de recarregar
    li.classList.add("saindo");
    await new Promise((r) => setTimeout(r, 280));
    await carregar();
  } catch {
    mostrarErro("Não consegui remover. Tente de novo.");
  }
}

// Chuva de confete simples, sem bibliotecas.
function soltarConfete() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cores = ["#facc15", "#ec4899", "#f97316", "#2563eb", "#16a34a", "#6d28d9"];
  const qtd = 90;
  for (let i = 0; i < qtd; i++) {
    const c = document.createElement("div");
    c.className = "confete";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = cores[i % cores.length];
    const dur = 1.6 + Math.random() * 1.4;
    c.style.animationDuration = dur + "s";
    c.style.animationDelay = Math.random() * 0.3 + "s";
    c.style.transform = `scale(${0.7 + Math.random() * 0.8})`;
    document.body.append(c);
    setTimeout(() => c.remove(), (dur + 0.5) * 1000);
  }
}

btnAbrir.addEventListener("click", abrirForm);
btnCancelar.addEventListener("click", fecharForm);
form.addEventListener("submit", adicionar);

carregar();
