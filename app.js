/* 
 * CONTROLADOR DA INTERFACE (APP.JS)
 * Este arquivo é a cola entre o HTML e a lógica do app.
 * Ele captura o que o usuário clica, chama o motor de cálculo (engine.js)
 * e atualiza a tela com o resultado final.
 */

// ── ESTADO GLOBAL ─────────────────────────────────────
/* 
 * Definimos estas variáveis fora das funções para que elas guardem a memória do app.
 * Se selectedCar fosse definida dentro de uma função, ela morreria quando a função terminasse.
 * Como estão aqui no topo, qualquer função pode ler ou alterar qual carro ou pista está escolhido.
 */
let selectedCar   = null;
let selectedTrack = null;
let driverStyle   = "balanced";
let topSpeed      = 250;

// ── RENDERIZAR LISTAS ───────────────────────────
/* 
 * Estas funções criam o conteúdo visual dos carros e pistas baseando-se no data.js.
 */
function renderCars() {
  const grid = document.getElementById("carGrid");
  /* 
   * .map() percorre o array CARS e transforma cada objeto em uma string de HTML.
   * Usamos as crases (``) chamadas de Template Literals. Elas permitem quebrar linhas
   * e inserir variáveis diretamente no texto com ${car.name}.
   */
  grid.innerHTML = CARS.map(car => `
    <div class="car-card" data-id="${car.id}" onclick="selectCar('${car.id}')">
      <div class="car-card__drivetrain">${car.drivetrain}</div>
      <div class="car-card__name">${car.name}</div>
    </div>
  `).join(""); 
  // O .join("") é necessário porque o .map() retorna uma lista (array) e o innerHTML precisa de uma string única.
}

function renderTracks() {
  const grid = document.getElementById("trackGrid");
  const badgeClass = { LOW: "badge--low", MEDIUM: "badge--medium", HIGH: "badge--high" };
  const dfLabel    = { LOW: "Baixo Downforce", MEDIUM: "Médio Downforce", HIGH: "Alto Downforce" };
  grid.innerHTML = TRACKS.map(t => `
    <div class="track-card" data-id="${t.id}" onclick="selectTrack('${t.id}')">
      <div class="track-card__name">${t.name}</div>
      <div class="track-card__downforce">${t.country}</div>
      <span class="badge ${badgeClass[t.downforce]}">${dfLabel[t.downforce]}</span>
    </div>
  `).join("");
}

// ── SELEÇÃO ─────────────────────────────────────
function selectCar(id) {
  // .find() procura no array CARS o primeiro item que tenha o ID clicado.
  selectedCar = CARS.find(c => c.id === id);
  
  // Padrão Toggle Exclusivo:
  // 1. Removemos a classe "selected" de TODOS os cards.
  document.querySelectorAll(".car-card").forEach(el => el.classList.remove("selected"));
  // 2. Adicionamos a classe apenas no card que foi clicado.
  document.querySelector(`.car-card[data-id="${id}"]`).classList.add("selected");
  
  checkReady(); // Verifica se já podemos liberar o botão de gerar
}

function selectTrack(id) {
  selectedTrack = TRACKS.find(t => t.id === id);
  document.querySelectorAll(".track-card").forEach(el => el.classList.remove("selected"));
  document.querySelector(`.track-card[data-id="${id}"]`).classList.add("selected");
  checkReady();
}

/**
 * Habilita o botão de gerar apenas quando carro E pista estiverem escolhidos.
 */
function checkReady() {
  document.getElementById("generateBtn").disabled = !(selectedCar && selectedTrack);
}

// ── EVENTOS DE INPUT ────────────────────────────
/* 
 * O evento "input" dispara enquanto o usuário arrasta o slider (tempo real).
 * O evento "change" dispararia apenas quando o usuário soltasse o botão do mouse.
 */
document.getElementById("topSpeedSlider").addEventListener("input", e => {
  // e.target.value vem como texto (String), o parseInt() converte para número.
  topSpeed = parseInt(e.target.value);
  document.getElementById("topSpeedValue").textContent = `${topSpeed} km/h`;
});

// Estilo de pilotagem: percorre os botões e aplica o estado ativo
document.querySelectorAll(".style-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".style-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    driverStyle = btn.dataset.style; // Pega o valor do atributo data-style
  });
});

// ── GERAR SETUP ─────────────────────────────────
/*
 * Sobrescreve o listener do botão "Gerar Setup" para também:
 * 1. Abrir o editor com o setup gerado
 * 2. Rodar o Advisor automaticamente
 */
document.getElementById("generateBtn").addEventListener("click", () => {
  const setup = generateSetup(selectedCar, selectedTrack, topSpeed, driverStyle);
  renderResult(setup);

  // Novos módulos:
  openEditor(setup);   // Abre editor com o setup gerado
  runAdvisor(setup);   // Roda o Advisor imediatamente

  document.getElementById("result").classList.remove("hidden");
  document.getElementById("result").scrollIntoView({ behavior: "smooth" });
});


// ── RENDERIZAR RESULTADO ────────────────────────
function renderResult(setup) {
  document.getElementById("resultCarName").textContent  = selectedCar.name;
  document.getElementById("resultTrackName").textContent = selectedTrack.name;
  document.getElementById("ppNote").textContent = setup.ppNote;
  document.getElementById("driverTipText").textContent  = setup.driverTip;

  /* 
   * Funções Internas (Helper): Criamos funções dentro de funções para evitar repetir 
   * o código de criação das linhas de parâmetros. Isso deixa o código mais limpo.
   */
  function paramRow(label, frontVal, rearVal, maxVal) {
    return `
      <div class="param-row">
        <span class="param-row__label">${label}</span>
        <div class="param-row__values">
          <span class="param-val param-val--front">${frontVal}</span>
          <span class="param-val param-val--rear">${rearVal}</span>
        </div>
      </div>
    `;
  }

  function singleRow(label, val) {
    return `
      <div class="param-row">
        <span class="param-row__label">${label}</span>
        <span class="param-val param-val--single">${val}</span>
      </div>
    `;
  }

  // Injetamos o conteúdo nos containers específicos definidos no index.html
  // Suspensão
  document.getElementById("suspensionParams").innerHTML = [
    paramRow("Altura (mm)",           setup.rideHeightFront, setup.rideHeightRear, 150),
    paramRow("Molas (N/mm)",          setup.springFront.toFixed(1), setup.springRear.toFixed(1), 20),
    paramRow("Amort. Compressão",     setup.damperCompFront, setup.damperCompRear, 10),
    paramRow("Amort. Extensão",       setup.damperExtFront,  setup.damperExtRear,  10),
  ].join("");

  // Controle
  document.getElementById("controlParams").innerHTML = [
    paramRow("ARB",         setup.arbFront, setup.arbRear, 10),
    paramRow("Camber (°)",  setup.camberFront, setup.camberRear, 5),
    paramRow("Convergência",setup.toeFront, setup.toeRear, 2),
  ].join("");

  // Aerodinâmica
  document.getElementById("aeroParams").innerHTML = [
    paramRow("Downforce", setup.downforceFront, setup.downforceRear, 650),
  ].join("");

  // Transmissão
  document.getElementById("transmissionParams").innerHTML = [
    singleRow("Vel. Máxima Final (km/h)", setup.finalGear),
  ].join("");

  // LSD
  document.getElementById("lsdParams").innerHTML = [
    singleRow("Inicial",       setup.lsdInitial),
    singleRow("Aceleração",    setup.lsdAccel),
    singleRow("Desaceleração", setup.lsdDecel),
  ].join("");

  // Freios
  document.getElementById("brakeParams").innerHTML = [
    singleRow("Equilíbrio (% traseiro)", `${setup.brakeBias}%`),
  ].join("");
}

// ── COPIAR SETUP (Área de Transferência) ─────────────────
document.getElementById("copyBtn").addEventListener("click", () => {
  const setup = generateSetup(selectedCar, selectedTrack, topSpeed, driverStyle);
  // Montamos uma string de texto puro formatada para o clipboard
  const text = `
GT7 SETUP — ${selectedCar.name} @ ${selectedTrack.name}
────────────────────────────────
SUSPENSÃO
Altura:         F ${setup.rideHeightFront} / R ${setup.rideHeightRear} mm
Molas:          F ${setup.springFront.toFixed(1)} / R ${setup.springRear.toFixed(1)} N/mm
Amort. Comp.:   F ${setup.damperCompFront} / R ${setup.damperCompRear}
Amort. Ext.:    F ${setup.damperExtFront} / R ${setup.damperExtRear}

CONTROLE
ARB:            F ${setup.arbFront} / R ${setup.arbRear}
Camber:         F ${setup.camberFront}° / R ${setup.camberRear}°
Convergência:   F ${setup.toeFront} / R ${setup.toeRear}

AERODINÂMICA
Downforce:      F ${setup.downforceFront} / R ${setup.downforceRear}

TRANSMISSÃO
Vel. Final:     ${setup.finalGear} km/h

LSD
Inicial:        ${setup.lsdInitial}
Aceleração:     ${setup.lsdAccel}
Desaceleração:  ${setup.lsdDecel}

FREIOS
Equilíbrio:     ${setup.brakeBias}% traseiro

${setup.ppNote}
  `.trim();

  /* 
   * navigator.clipboard é a API moderna para copiar textos.
   * Ela retorna uma Promise (promessa), por isso usamos .then() para saber quando terminou
   * e dar um feedback visual trocando o texto do botão por 2 segundos.
   */
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyBtn");
    btn.textContent = "✅ Copiado!";
    setTimeout(() => btn.textContent = "📋 Copiar Setup", 2000);
  });
});

// ── INICIALIZAÇÃO (INIT) ────────────────────────
/* 
 * Chamamos as funções de renderização logo que o arquivo carrega.
 * Não precisamos de DOMContentLoaded aqui porque os scripts estão no final do <body>,
 * garantindo que o HTML já existe quando o JS for executado.
 */
renderCars();
renderTracks();

// ═══════════════════════════════════════════════════════════════════════════
// MÓDULO: EDITOR DE SETUP
// ═══════════════════════════════════════════════════════════════════════════

/*
 * currentEditSetup: cópia do setup que está sendo editado.
 * originalGeneratedSetup: backup do setup gerado para o botão "Restaurar".
 */
let currentEditSetup = null;
let originalGeneratedSetup = null;
let isFromScratch = false;

/*
 * Abre o editor com o setup gerado (ou um setup em branco).
 * Chamado após o botão "Gerar Setup" ou pela aba "Criar do Zero".
 */
function openEditor(setup) {
  currentEditSetup = { ...setup };
  originalGeneratedSetup = { ...setup };
  buildEditorSliders(currentEditSetup);
  document.getElementById("editor").classList.remove("hidden");
  document.getElementById("editor").scrollIntoView({ behavior: "smooth" });
}

/*
 * Constrói os sliders do editor dinamicamente.
 * Para cada parâmetro em PARAM_LIMITS, cria um slider com label e valor.
 */
function buildEditorSliders(setup) {
  const grid = document.getElementById("editorGrid");

  // Agrupar parâmetros em seções visuais
  const groups = [
    {
      title: "📐 Suspensão",
      keys: ["rideHeightFront","rideHeightRear","springFront","springRear",
             "damperCompFront","damperCompRear","damperExtFront","damperExtRear"]
    },
    {
      title: "🔧 Controle",
      keys: ["arbFront","arbRear","camberFront","camberRear","toeFront","toeRear"]
    },
    {
      title: "🌬️ Aerodinâmica",
      keys: ["downforceFront","downforceRear"]
    },
    {
      title: "⚡ Transmissão & Freios",
      keys: ["finalGear","brakeBias"]
    },
    {
      title: "🔁 Diferencial (LSD)",
      keys: ["lsdInitial","lsdAccel","lsdDecel"]
    }
  ];

  grid.innerHTML = groups.map(group => `
    <div class="editor-group">
      <h4 class="editor-group-title">${group.title}</h4>
      <div class="editor-group-params">
        ${group.keys.map(key => {
          const limits = PARAM_LIMITS[key];
          const value  = setup[key] !== undefined ? setup[key] : limits.min;
          return `
            <div class="editor-param" data-key="${key}">
              <div class="editor-param-header">
                <span class="editor-param-label">${limits.label}</span>
                <span class="editor-param-value" id="val_${key}">
                  ${Number(value).toFixed(limits.step < 1 ? 2 : 0)} ${limits.unit}
                </span>
              </div>
              <input
                type="range"
                class="editor-slider"
                id="slider_${key}"
                min="${limits.min}"
                max="${limits.max}"
                step="${limits.step}"
                value="${value}"
                oninput="onSliderChange('${key}', this.value)"
              >
              <div class="editor-slider-range">
                <span>${limits.min} ${limits.unit}</span>
                <span>${limits.max} ${limits.unit}</span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `).join("");
}

/*
 * Chamada a cada movimento de slider.
 * Atualiza o valor visual e o objeto currentEditSetup.
 */
function onSliderChange(key, rawValue) {
  const limits = PARAM_LIMITS[key];
  const value  = parseFloat(rawValue);
  currentEditSetup[key] = value;

  // Atualiza o display de valor
  const displayEl = document.getElementById(`val_${key}`);
  if (displayEl) {
    displayEl.textContent = `${value.toFixed(limits.step < 1 ? 2 : 0)} ${limits.unit}`;
  }
}

// Botão "Aplicar e Analisar"
document.getElementById("editorSaveBtn").addEventListener("click", () => {
  if (!selectedCar || !selectedTrack) {
    alert("Selecione um carro e uma pista antes de analisar o setup.");
    return;
  }
  // Renderiza o resultado com o setup editado
  renderResult(currentEditSetup);
  // Roda o Advisor
  runAdvisor(currentEditSetup);
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("result").scrollIntoView({ behavior: "smooth" });
});

// Botão "Restaurar Original"
document.getElementById("editorResetBtn").addEventListener("click", () => {
  if (!originalGeneratedSetup) return;
  currentEditSetup = { ...originalGeneratedSetup };
  buildEditorSliders(currentEditSetup);
  // Re-roda o advisor com o setup original
  if (selectedCar && selectedTrack) runAdvisor(currentEditSetup);
});

// Abas do Editor: "Editar Gerado" / "Criar do Zero"
document.getElementById("tabEditGenerated").addEventListener("click", () => {
  setActiveTab("tabEditGenerated");
  isFromScratch = false;
  document.getElementById("editorSubtitle").textContent =
    "Ajuste os valores do setup gerado. O Advisor atualiza ao aplicar.";
  if (originalGeneratedSetup) {
    currentEditSetup = { ...originalGeneratedSetup };
    buildEditorSliders(currentEditSetup);
  }
});

document.getElementById("tabFromScratch").addEventListener("click", () => {
  setActiveTab("tabFromScratch");
  isFromScratch = true;
  document.getElementById("editorSubtitle").textContent =
    "Construa seu setup do zero. Todos os parâmetros começam no valor médio.";
  currentEditSetup = getBlankSetup();
  originalGeneratedSetup = { ...currentEditSetup };
  buildEditorSliders(currentEditSetup);
  document.getElementById("editor").classList.remove("hidden");
});

function setActiveTab(activeId) {
  ["tabEditGenerated","tabFromScratch"].forEach(id => {
    document.getElementById(id).classList.toggle("active", id === activeId);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MÓDULO: SETUP ADVISOR
// ═══════════════════════════════════════════════════════════════════════════

/*
 * runAdvisor: chama analyzeSetup() do advisor.js e renderiza os resultados.
 */
function runAdvisor(setup) {
  if (!selectedCar || !selectedTrack) return;

  const result = analyzeSetup(setup, selectedCar, selectedTrack);

  // Score visual
  document.getElementById("scoreNumber").textContent = result.score;
  document.getElementById("scoreLabel").textContent  = result.scoreLabel;
  document.getElementById("scoreSub").textContent    =
    `${result.errors} problema(s) • ${result.warnings} aviso(s) • ${result.oks} ok`;

  // Cor do anel de score
  const ring = document.getElementById("scoreRing");
  ring.className = "score-ring";
  if (result.score >= 80)      ring.classList.add("score-ring--good");
  else if (result.score >= 50) ring.classList.add("score-ring--warn");
  else                         ring.classList.add("score-ring--bad");

  // Alertas
  const alertsEl = document.getElementById("advisorAlerts");
  const allOkEl  = document.getElementById("advisorAllOk");

  const nonOkAlerts = result.alerts.filter(a => a.severity !== "ok");

  if (nonOkAlerts.length === 0) {
    alertsEl.innerHTML = "";
    allOkEl.classList.remove("hidden");
  } else {
    allOkEl.classList.add("hidden");
    // Ordenar: errors primeiro, depois warnings
    const sorted = nonOkAlerts.sort((a, b) => {
      const order = { error: 0, warning: 1, ok: 2 };
      return order[a.severity] - order[b.severity];
    });

    alertsEl.innerHTML = sorted.map(al => `
      <div class="advisor-alert advisor-alert--${al.severity}">
        <div class="alert-header">
          <span class="alert-icon">${al.severity === "error" ? "❌" : "⚠️"}</span>
          <span class="alert-param">${al.param}</span>
          <span class="alert-badge alert-badge--${al.severity}">
            ${al.severity === "error" ? "Problema" : "Atenção"}
          </span>
        </div>
        <p class="alert-message">${al.message}</p>
        ${al.suggestion ? `
          <div class="alert-suggestion">
            <span class="alert-suggestion-label">💡 Sugestão:</span>
            <p>${al.suggestion}</p>
          </div>
        ` : ""}
      </div>
    `).join("");
  }

  // Mostrar seção do Advisor
  document.getElementById("advisor").classList.remove("hidden");
  document.getElementById("advisor").scrollIntoView({ behavior: "smooth" });
}

