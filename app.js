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
document.getElementById("generateBtn").addEventListener("click", () => {
  /* 
   * Chamada da função IMPORTANTE: generateSetup vem do arquivo engine.js.
   * Ela faz toda a matemática pesada e nos devolve o objeto 'setup'.
   */
  const setup = generateSetup(selectedCar, selectedTrack, topSpeed, driverStyle);
  
  renderResult(setup); // Mostra os valores na tela
  
  // Remove a classe hidden para mostrar a seção de resultado e rola até ela
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
