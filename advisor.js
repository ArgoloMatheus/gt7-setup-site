/* 
 * MOTOR DE REGRAS (ADVISOR.JS) - PRECISION DYNAMICS ANALYTICS
 * Analisa o setup e identifica conflitos técnicos baseados em telemetria preditiva.
 */

function analyzeSetup(setup, car, track) {
  const result = {
    score: 100,
    scoreLabel: "OPTIMAL BALANCE",
    errors: 0,
    warnings: 0,
    alerts: []
  };

  const addAlert = (param, message, severity) => {
    result.alerts.push({ param, message, severity });
    if (severity === "error") {
      result.errors++;
      result.score -= 15;
    } else if (severity === "warning") {
      result.warnings++;
      result.score -= 5;
    }
  };

  // ── 1. EQUILÍBRIO DE ALTURA (RAKE ANGLE) ────────────────
  const rake = setup.rideHeightRear - setup.rideHeightFront;
  if (rake < 0) {
    addAlert("Chassis Geometry", "Rake negativo detectado. Isso causa instabilidade aerodinâmica e subviragem em alta velocidade.", "error");
  } else if (rake > 15) {
    addAlert("Chassis Geometry", "Rake excessivo. Risco de snap-oversteer em frenagens fortes.", "warning");
  }

  // ── 2. COMPATIBILIDADE DE PISTA (SURFACE) ───────────────
  if (track.surface === "BUMPY" && setup.rideHeightFront < 85) {
    addAlert("Ground Clearance", `${track.name} possui superfície irregular. Altura < 85mm causará 'bottoming out' nas ondulações.`, "error");
  }

  // ── 3. RIGIDEZ DE MOLAS (SUSPENSION FREQUENCY) ──────────
  const frontSpringWeight = setup.springFront - (car.weightDistFront / 10);
  if (frontSpringWeight < 2) {
    addAlert("Spring Rate", "Molas dianteiras muito macias para o peso do motor. O carro irá 'mergulhar' excessivamente ao frear.", "warning");
  }
  
  if (car.enginePos === "REAR" && setup.springRear < setup.springFront + 2) {
    addAlert("Spring Balance", "Carros de motor traseiro exigem molas traseiras significativamente mais rígidas para suportar a inércia.", "error");
  }

  // ── 4. EQUILÍBRIO DE BARRAS (ROLL STIFFNESS) ────────────
  if (car.drivetrain === "FF" && setup.arbFront >= setup.arbRear) {
    addAlert("Roll Control", "Em tração dianteira, a ARB traseira deve ser mais rígida que a dianteira para ajudar o carro a rotacionar.", "warning");
  }

  if (car.drivetrain === "RR" && setup.arbFront < 5) {
    addAlert("Roll Control", "Motor traseiro exige ARB dianteira rígida para evitar flutuação da frente em aceleração.", "warning");
  }

  // ── 5. AERODINÂMICA (AERO BALANCE) ──────────────────────
  const aeroRatio = setup.downforceRear / setup.downforceFront;
  if (aeroRatio > 2.5) {
    addAlert("Aero Balance", "Downforce traseiro desproporcional. O carro terá subviragem extrema em curvas de alta velocidade.", "error");
  } else if (aeroRatio < 1.1) {
    addAlert("Aero Balance", "Falta de estabilidade traseira. Risco de perda de controle em curvas rápidas.", "warning");
  }

  // ── 6. DIFERENCIAL (LSD TRACTION) ───────────────────────
  if (setup.lsdAccel > 50 && car.drivetrain !== "4WD") {
    addAlert("LSD Lockup", "Aceleração do LSD muito alta. Isso causará subviragem 'on-throttle'.", "warning");
  }

  // ── 7. TRANSMISSÃO (GEAR RATIO) ─────────────────────────
  if (setup.finalGear < track.targetSpeed - 20) {
    addAlert("Gearing", "Relação de marcha muito curta. O carro atingirá o limitador antes do fim da reta principal.", "error");
  } else if (setup.finalGear > track.targetSpeed + 60) {
    addAlert("Gearing", "Relação de marcha muito longa. O motor não terá torque suficiente para atingir a velocidade ideal.", "warning");
  }

  // ── 8. AMORTECEDORES (DAMPING RATIO) ────────────────────
  if (setup.damperExtFront <= setup.damperCompFront) {
    addAlert("Damping", "A extensão (Rebound) deve ser sempre superior à compressão para estabilizar a mola.", "warning");
  }

  // Ajuste Final do Score
  result.score = Math.max(result.score, 20);
  
  if (result.score > 90) result.scoreLabel = "OPTIMAL BALANCE";
  else if (result.score > 75) result.scoreLabel = "STABLE CONFIG";
  else if (result.score > 55) result.scoreLabel = "SUB-OPTIMAL";
  else result.scoreLabel = "CRITICAL INSTABILITY";

  return result;
}
