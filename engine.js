/* 
 * MOTOR DE CÁLCULO (ENGINE)
 * Este arquivo é o cérebro do app — recebe um objeto de carro e um de pista
 * e devolve um objeto de setup com todos os parâmetros calculados.
 * A lógica aqui tenta simular as decisões que um engenheiro de pista real tomaria.
 */

/**
 * Função Principal: generateSetup
 * @param {Object} car - O objeto do carro selecionado (de data.js)
 * @param {Object} track - O objeto da pista selecionada (de data.js)
 * @param {number} topSpeedKmh - Valor vindo do slider de velocidade
 * @param {string} driverStyle - Estilo ("aggressive", "balanced", "conservative")
 */
function generateSetup(car, track, topSpeedKmh = 250, driverStyle = "balanced") {
  // O objeto 'setup' guardará todos os nossos resultados finais
  const setup = {};

  /*
   * ── SUSPENSÃO ───────────────────────────────────────────────
   * A altura do carro (Ride Height) afeta o centro de gravidade.
   * Carros mais baixos são mais estáveis, mas em pistas onduladas (BUMPY)
   * precisamos subir o carro para não bater o fundo no asfalto.
   */
  const baseRideHeight = track.surface === "BUMPY" ? 90 : 80;
  // Carros RR (Porsche) são baixados na frente para compensar o peso traseiro
  setup.rideHeightFront = baseRideHeight + (car.drivetrain === "RR" ? -5 : 0);
  // Se a pista tiver zebras altas (hasBumps), subimos a traseira para evitar saltos
  setup.rideHeightRear  = baseRideHeight + (track.hasBumps ? 8 : 0);

  /*
   * MOLAS (Spring Rate)
   * Controlam a dureza da suspensão. Em pistas de alta velocidade (LOW downforce),
   * usamos molas mais rígidas para o carro não "oscilar" nas retas.
   */
  const springBase = track.downforce === "LOW" ? 8.5 : track.downforce === "HIGH" ? 5.5 : 7.0;
  // Usamos uma função helper (weightBiasMod) para endurecer o lado que tem mais peso
  setup.springFront = clamp(springBase + weightBiasMod(car, "front"), 1.0, 20.0);
  setup.springRear  = clamp(springBase + weightBiasMod(car, "rear"),  1.0, 20.0);

  /*
   * AMORTECEDORES (Dampers)
   * Controlam a velocidade com que a mola sobe e desce.
   * Em pistas irregulares, usamos valores menores para a suspensão ser mais "rápida" em absorver impactos.
   */
  const dampBase = track.surface === "BUMPY" ? 4 : 5;
  setup.damperCompFront = clamp(dampBase, 1, 10);
  setup.damperCompRear  = clamp(dampBase - 1, 1, 10);
  setup.damperExtFront  = clamp(dampBase + 1, 1, 10);
  setup.damperExtRear   = clamp(dampBase, 1, 10);

  /*
   * ── BARRAS ANTIRROLAGEM (ARB) ────────────────────────────────
   * Controlam quanto o carro inclina lateralmente nas curvas.
   * Usamos a função calcARB para definir o equilíbrio baseado no tipo de tração.
   */
  const [arbFront, arbRear] = calcARB(car.drivetrain);
  setup.arbFront = arbFront;
  setup.arbRear  = arbRear;

  /*
   * ── GEOMETRIA (Camber & Toe) ────────────────────────────────
   * Camber negativo ajuda na aderência lateral em curvas.
   * Carros FF (tração dianteira) precisam de menos camber para não perder tração na aceleração.
   */
  setup.camberFront = car.drivetrain === "FF" ? -2.0 : -2.5;
  setup.camberRear  = car.drivetrain === "MR" ? -1.5 : -2.0;
  setup.toeFront    = car.drivetrain === "FF" ? -0.10 : 0.00;
  // Carros de motor traseiro/central (RR/MR) precisam de toe-in traseiro para estabilidade.
  setup.toeRear     = ["RR","MR"].includes(car.drivetrain) ? 0.15 : 0.10;

  /*
   * ── AERODINÂMICA ────────────────────────────────────────────
   * Downforce empurra o carro contra o chão usando o vento.
   * Pistas HIGH (Spa, Nürburgring) exigem valores máximos para fazer curvas rápidas.
   */
  const dfMap = { LOW: [80, 120], MEDIUM: [220, 300], HIGH: [420, 550] };
  [setup.downforceFront, setup.downforceRear] = dfMap[track.downforce];

  /*
   * ── FREIOS (Brake Bias) ──────────────────────────────────────
   * Define se a força de frenagem vai mais para a frente ou para trás.
   * Em carros FF, focamos na frente (60%) porque o motor está lá e o traseiro é leve.
   */
  setup.brakeBias = car.drivetrain === "FF" ? 60 : car.drivetrain === "RR" ? 52 : 55;

  /*
   * ── DIFERENCIAL LSD ─────────────────────────────────────────
   * Controla a diferença de rotação entre as rodas.
   * Um LSD bem ajustado evita que uma roda gire em falso na saída da curva.
   */
  const lsd = calcLSD(car.drivetrain, track.downforce);
  setup.lsdInitial = lsd.initial;
  setup.lsdAccel   = lsd.accel;
  setup.lsdDecel   = lsd.decel;

  /*
   * ── TRANSMISSÃO ─────────────────────────────────────────────
   * Ajustamos a relação de marchas final baseada na velocidade máxima da pista.
   * Cada tipo de tração tem um "multiplier" para compensar a perda de potência ou eficiência.
   * O 4WD tem o maior multiplier (1.05) devido ao peso extra do sistema de tração.
   */
  const multiplier = { RR: 1.04, MR: 1.03, FR: 1.02, "4WD": 1.05, FF: 1.03 };
  setup.finalGear = Math.round(topSpeedKmh * multiplier[car.drivetrain]);

  // Dicas contextuais que aparecem no final do resultado
  setup.driverTip = buildDriverTip(car, track);
  setup.ppNote = "⚠️ Ajuste ECU e Lastro de Peso até atingir o limite de PP do seu evento.";

  return setup;
}

// HELPERS INTERNOS: Funções que resolvem problemas específicos para limpar a função principal.

/**
 * Modifica a rigidez da mola baseado na distribuição de peso do carro.
 */
function weightBiasMod(car, axle) {
  if (axle === "front") return (car.weightDistFront - 50) * 0.05;
  return (car.weightDistRear - 50) * 0.05;
}

/**
 * Função Clamp: Garante que um valor não saia de um limite mínimo e máximo.
 * Essencial para não gerar valores que o jogo não aceitaria (ex: mola negativa).
 */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Calcula o balanço das Barras Antirrolagem (ARB).
 * Carros FF precisam de traseira rígida para compensar o peso frontal.
 */
function calcARB(drivetrain) {
  const map = {
    "RR":  [7, 3],
    "MR":  [6, 4],
    "FR":  [5, 6],
    "FF":  [3, 7],
    "4WD": [5, 5]
  };
  return map[drivetrain] || [5, 5];
}

/**
 * Define os valores do Diferencial de Deslizamento Limitado (LSD).
 */
function calcLSD(drivetrain, downforce) {
  const base = {
    "RR":  { initial: 15, accel: 45, decel: 35 },
    "MR":  { initial: 15, accel: 30, decel: 25 },
    "FR":  { initial: 10, accel: 20, decel: 30 },
    "FF":  { initial: 10, accel: 15, decel: 15 },
    "4WD": { initial: 20, accel: 30, decel: 25 }
  };
  const lsd = { ...base[drivetrain] };
  // Em pistas de alta velocidade (LOW downforce), "travamos" mais o diferencial na aceleração.
  if (downforce === "LOW") lsd.accel = Math.min(lsd.accel + 10, 60);
  return lsd;
}

/**
 * Constrói a mensagem personalizada que o usuário lê no final.
 */
function buildDriverTip(car, track) {
  const tips = {
    "RR": "Evite soltar o acelerador bruscamente em curvas. O motor traseiro pode causar snap oversteer. Use frenagem suave antes da entrada.",
    "MR": "Carro equilibrado. Sensível ao camber traseiro. Ajuste -1.5° traseiro para máxima tração na saída.",
    "FR": "Se sentir nariz pesado, reduza a ARB dianteira em 1 ponto e aumente o downforce traseiro.",
    "FF": "Aplique trail braking para girar o carro. Não force o LSD — o FF perde tração dianteira facilmente.",
    "4WD": "O 4WD tem subviragem natural. Mover o lastro para trás e reduzir o downforce dianteiro melhora a rotação."
  };
  let tip = tips[car.drivetrain];
  if (track.hasBumps) tip += " Nesta pista, não rebaixe demais — as zebras podem desequilibrar o carro.";
  if (track.downforce === "LOW") tip += " Nas retas longas, mantenha downforce baixo para não perder velocidade máxima.";
  return tip;
}

/*
 * CONEXÃO COM APP.JS
 * O app.js chamará a função generateSetup() toda vez que o usuário clicar no botão principal,
 * passando os objetos de carro e pista que o usuário escolheu na interface.
 */

/*
 * LIMITES DOS PARÂMETROS DO GT7
 * Usados pelo editor manual para definir min/max de cada slider.
 * Refletem os limites reais do jogo.
 */
const PARAM_LIMITS = {
  rideHeightFront:  { min: 50,   max: 150,  step: 1,    unit: "mm",   label: "Altura Dianteira" },
  rideHeightRear:   { min: 50,   max: 150,  step: 1,    unit: "mm",   label: "Altura Traseira" },
  springFront:      { min: 1.0,  max: 20.0, step: 0.5,  unit: "N/mm", label: "Mola Dianteira" },
  springRear:       { min: 1.0,  max: 20.0, step: 0.5,  unit: "N/mm", label: "Mola Traseira" },
  damperCompFront:  { min: 1,    max: 10,   step: 1,    unit: "",     label: "Amort. Comp. Diant." },
  damperCompRear:   { min: 1,    max: 10,   step: 1,    unit: "",     label: "Amort. Comp. Tras." },
  damperExtFront:   { min: 1,    max: 10,   step: 1,    unit: "",     label: "Amort. Ext. Diant." },
  damperExtRear:    { min: 1,    max: 10,   step: 1,    unit: "",     label: "Amort. Ext. Tras." },
  arbFront:         { min: 1,    max: 10,   step: 1,    unit: "",     label: "ARB Dianteiro" },
  arbRear:          { min: 1,    max: 10,   step: 1,    unit: "",     label: "ARB Traseiro" },
  camberFront:      { min: -5.0, max: 0.0,  step: 0.1,  unit: "°",    label: "Câmber Dianteiro" },
  camberRear:       { min: -5.0, max: 0.0,  step: 0.1,  unit: "°",    label: "Câmber Traseiro" },
  toeFront:         { min: -2.0, max: 2.0,  step: 0.05, unit: "",     label: "Convergência Diant." },
  toeRear:          { min: -2.0, max: 2.0,  step: 0.05, unit: "",     label: "Convergência Tras." },
  downforceFront:   { min: 0,    max: 650,  step: 5,    unit: "",     label: "Downforce Dianteiro" },
  downforceRear:    { min: 0,    max: 650,  step: 5,    unit: "",     label: "Downforce Traseiro" },
  brakeBias:        { min: 40,   max: 70,   step: 1,    unit: "%",    label: "Equilíbrio de Freio" },
  lsdInitial:       { min: 5,    max: 60,   step: 1,    unit: "",     label: "LSD Inicial" },
  lsdAccel:         { min: 5,    max: 60,   step: 1,    unit: "",     label: "LSD Aceleração" },
  lsdDecel:         { min: 5,    max: 60,   step: 1,    unit: "",     label: "LSD Desaceleração" },
  finalGear:        { min: 150,  max: 420,  step: 5,    unit: "km/h", label: "Vel. Final (Trans.)" }
};

/*
 * Setup vazio — ponto de partida para criação do zero.
 * Usa os valores médios de cada parâmetro.
 */
function getBlankSetup() {
  const blank = {};
  for (const [key, limits] of Object.entries(PARAM_LIMITS)) {
    blank[key] = parseFloat(((limits.min + limits.max) / 2).toFixed(2));
  }
  blank.driverTip = "Setup criado manualmente. Use o Advisor para verificar a compatibilidade.";
  blank.ppNote = "⚠️ Ajuste ECU e Lastro de Peso até atingir o limite de PP do seu evento.";
  return blank;
}

