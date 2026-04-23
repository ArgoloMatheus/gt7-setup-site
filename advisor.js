/*
 * advisor.js — Conselheiro de Setup do GT7 Setup Lab
 * Recebe um setup (gerado ou manual), o carro e a pista selecionados
 * e retorna uma lista de alertas com severidade e sugestão de correção.
 */

/**
 * Analisa o setup e retorna array de alertas.
 * @param {object} setup   - Objeto com todos os valores do setup
 * @param {object} car     - Objeto do carro (de data.js)
 * @param {object} track   - Objeto da pista (de data.js)
 * @returns {Array}        - Lista de { param, severity, message, suggestion }
 */
function analyzeSetup(setup, car, track) {
  const alerts = [];

  // ── Helper interno ────────────────────────────────────────────────────────
  function alert(param, severity, message, suggestion) {
    // severity: "error" | "warning" | "ok"
    alerts.push({ param, severity, message, suggestion });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ALTURA DE SUSPENSÃO × PISTA
  // ═══════════════════════════════════════════════════════════════════════════
  const rideAvg = (setup.rideHeightFront + setup.rideHeightRear) / 2;

  if (track.hasBumps && rideAvg < 80) {
    alert(
      "Altura de Suspensão",
      "error",
      `Altura média de ${rideAvg}mm está muito baixa para ${track.name}.`,
      "Esta pista tem zebras e irregularidades pesadas. Aumente a altura para pelo menos 88–95mm para evitar que o fundo do carro raspe no asfalto e desestabilize o carro nas zebras."
    );
  } else if (!track.hasBumps && rideAvg > 100) {
    alert(
      "Altura de Suspensão",
      "warning",
      `Altura média de ${rideAvg}mm está alta para uma pista lisa como ${track.name}.`,
      "Em pistas lisas, altura alta levanta o centro de gravidade e piora a aerodinâmica. Reduza para 75–85mm para ganhar eficiência."
    );
  } else {
    alert("Altura de Suspensão", "ok", "Altura adequada para este tipo de pista.", "");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. DOWNFORCE × PERFIL DA PISTA
  // ═══════════════════════════════════════════════════════════════════════════
  const dfRear = setup.downforceRear;

  const dfRanges = {
    LOW:    { min: 50,  max: 200, label: "baixo (50–200)" },
    MEDIUM: { min: 150, max: 400, label: "médio (150–400)" },
    HIGH:   { min: 350, max: 650, label: "alto (350–650)" }
  };
  const expected = dfRanges[track.downforce];

  if (dfRear < expected.min) {
    alert(
      "Downforce Traseiro",
      "error",
      `Downforce traseiro de ${dfRear} está muito baixo para ${track.name} (perfil ${track.downforce}).`,
      `${track.name} exige downforce ${expected.label}. Com o valor atual, o carro vai escorregar nas curvas rápidas — especialmente na traseira. Aumente para pelo menos ${expected.min}.`
    );
  } else if (dfRear > expected.max) {
    alert(
      "Downforce Traseiro",
      "warning",
      `Downforce traseiro de ${dfRear} está acima do ideal para ${track.name}.`,
      `Downforce excessivo em pistas de baixo perfil como ${track.name} cria resistência ao ar e reduz a velocidade máxima nas retas. Reduza para no máximo ${expected.max}.`
    );
  } else {
    alert("Downforce Traseiro", "ok", "Downforce dentro do ideal para o perfil desta pista.", "");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ARB × TIPO DE TRAÇÃO — Problemas clássicos
  // ═══════════════════════════════════════════════════════════════════════════

  // RR: ARB traseiro alto = snap oversteer (traseira escapa do nada)
  if (car.drivetrain === "RR" && setup.arbRear >= 6) {
    alert(
      "ARB Traseiro (Porsche/RR)",
      "error",
      `ARB traseiro ${setup.arbRear} está perigosamente alto para um carro RR como o ${car.name}.`,
      "Em carros com motor traseiro (RR), ARB traseiro alto + a massa do motor atrás = snap oversteer nas curvas de médio/alto速度. Mantenha o ARB traseiro entre 2–4. Coloque a rigidez na frente (ARB dianteiro 7–8)."
    );
  }

  // FF: ARB dianteiro alto = perda de tração dianteira
  if (car.drivetrain === "FF" && setup.arbFront >= 6) {
    alert(
      "ARB Dianteiro (FF)",
      "warning",
      `ARB dianteiro ${setup.arbFront} pode causar subviragem severa no ${car.name}.`,
      "Carros FF com ARB dianteiro alto travam a oscilação do eixo que traciona — o carro vai reto nas curvas. Reduza para 2–4 e aumente o ARB traseiro para melhorar a rotação."
    );
  }

  // 4WD: ARB muito assimétrico = comportamento imprevisível
  if (car.drivetrain === "4WD") {
    const arbDiff = Math.abs(setup.arbFront - setup.arbRear);
    if (arbDiff >= 4) {
      alert(
        "ARB (4WD)",
        "warning",
        `Diferença de ${arbDiff} pontos entre ARB dianteiro e traseiro é alta para um 4WD.`,
        "Em carros 4WD, ARBs muito assimétricos criam subviragem ou sobreviragem dependendo do eixo mais rígido. Mantenha a diferença em até 2–3 pontos para comportamento previsível."
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. LSD × TRAÇÃO — Erros clássicos
  // ═══════════════════════════════════════════════════════════════════════════

  // 4WD com LSD aceleração alto = sai muito de frente (understeer na saída)
  if (car.drivetrain === "4WD" && setup.lsdAccel >= 45) {
    alert(
      "LSD Aceleração (4WD)",
      "error",
      `LSD de aceleração ${setup.lsdAccel} está muito alto para um 4WD.`,
      "Um LSD travado em aceleração alta num 4WD força os 4 pneus a girar na mesma velocidade — perfeito para retas, mas o carro não consegue girar na saída das curvas (understeer crônico). Reduza para 25–35."
    );
  }

  // FF com LSD aceleração alto = tração perdida no eixo dianteiro
  if (car.drivetrain === "FF" && setup.lsdAccel >= 30) {
    alert(
      "LSD Aceleração (FF)",
      "warning",
      `LSD de aceleração ${setup.lsdAccel} está alto para um carro FF.`,
      "Em FFs, LSD alto na aceleração trava o eixo dianteiro (que também é o que vira) — na saída das curvas o carro vai reto em vez de seguir a trajetória. Mantenha entre 10–20."
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. EQUILÍBRIO DE DOWNFORCE (Frente × Traseiro)
  // ═══════════════════════════════════════════════════════════════════════════
  const dfRatio = setup.downforceFront / setup.downforceRear;

  if (dfRatio > 0.85) {
    alert(
      "Equilíbrio Aerodinâmico",
      "warning",
      `Downforce dianteiro (${setup.downforceFront}) está muito próximo do traseiro (${setup.downforceRear}).`,
      "O traseiro deve ter mais downforce que o dianteiro para estabilidade em alta velocidade. Uma boa proporção é ~65–70% do downforce dianteiro em relação ao traseiro. Reduza o dianteiro ou aumente o traseiro."
    );
  } else if (dfRatio < 0.45) {
    alert(
      "Equilíbrio Aerodinâmico",
      "warning",
      `Downforce dianteiro (${setup.downforceFront}) muito baixo em relação ao traseiro.`,
      "Downforce dianteiro muito baixo vs traseiro causa subviragem em alta velocidade — o nariz não tem aderência aerodinâmica suficiente. Aumente o downforce dianteiro para melhorar a entrada nas curvas."
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. MOLAS × TIPO DE PISTA
  // ═══════════════════════════════════════════════════════════════════════════
  const springAvg = (setup.springFront + setup.springRear) / 2;

  if (track.surface === "BUMPY" && springAvg > 9.0) {
    alert(
      "Dureza das Molas",
      "error",
      `Molas com média ${springAvg.toFixed(1)} N/mm estão rígidas demais para ${track.name}.`,
      "Em pistas com zebras/irregularidades, molas muito rígidas fazem o carro 'pular' sobre as imperfeições — a roda perde contato com o asfalto por frações de segundo, zerando a tração. Reduza para 4.5–6.5 N/mm."
    );
  } else if (track.surface === "SMOOTH" && springAvg < 5.0) {
    alert(
      "Dureza das Molas",
      "warning",
      `Molas com média ${springAvg.toFixed(1)} N/mm estão muito macias para ${track.name}.`,
      "Em pistas lisas, molas macias permitem que o carro balance excessivamente nas curvas rápidas, reduzindo a estabilidade aerodinâmica. Valores entre 7.0–10.0 N/mm são ideais para pistas lisas."
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. VELOCIDADE FINAL × COMPRIMENTO DA RETA
  // ═══════════════════════════════════════════════════════════════════════════
  const straightKm = track.longestStraightM / 1000;
  const estimatedTopSpeed = setup.finalGear;

  // Se a reta é muito curta mas a transmissão está longa (alta velocidade máxima)
  if (track.longestStraightM < 500 && estimatedTopSpeed > 320) {
    alert(
      "Transmissão — Velocidade Final",
      "warning",
      `Velocidade final configurada para ${estimatedTopSpeed} km/h, mas a maior reta de ${track.name} tem apenas ${track.longestStraightM}m.`,
      "Com marcha final tão longa, o carro nunca chegará à velocidade máxima — ficará sempre na faixa de subaceleração (RPM baixo). Reduza a velocidade final para 260–290 km/h para que o carro chegue na redline antes da frenagem."
    );
  }

  // Se a reta é muito longa mas a transmissão está curta
  if (track.longestStraightM > 1500 && estimatedTopSpeed < 280) {
    alert(
      "Transmissão — Velocidade Final",
      "error",
      `Velocidade final de ${estimatedTopSpeed} km/h está limitando o potencial em ${track.name} (reta de ${track.longestStraightM}m).`,
      "Com a reta mais longa do calendário, o carro vai bater na limitação de RPM muito antes de acabar a reta — perdendo segundos por volta. Aumente a velocidade final para pelo menos 340–380 km/h."
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. CÂMBER × ESTILO DE PISTA
  // ═══════════════════════════════════════════════════════════════════════════
  if (Math.abs(setup.camberFront) > 4.0) {
    alert(
      "Câmber Dianteiro",
      "warning",
      `Câmber dianteiro de ${setup.camberFront}° é extremo.`,
      "Câmber muito negativo melhora a curva mas destrói o desgaste do pneu nas retas — o contato do pneu com o asfalto fica apenas na borda interna. Valores entre -1.5° e -3.0° são o equilíbrio ideal para a maioria das pistas."
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCORE GERAL
  // ═══════════════════════════════════════════════════════════════════════════
  const errors   = alerts.filter(a => a.severity === "error").length;
  const warnings = alerts.filter(a => a.severity === "warning").length;
  const oks      = alerts.filter(a => a.severity === "ok").length;

  let score, scoreLabel;
  if (errors === 0 && warnings === 0) {
    score = 100; scoreLabel = "Setup Sólido";
  } else if (errors === 0 && warnings <= 2) {
    score = 80; scoreLabel = "Setup Bom";
  } else if (errors === 0) {
    score = 60; scoreLabel = "Precisa de Ajustes";
  } else if (errors === 1) {
    score = 40; scoreLabel = "Problemas Sérios";
  } else {
    score = 20; scoreLabel = "Setup Crítico";
  }

  return { alerts, score, scoreLabel, errors, warnings, oks };
}
