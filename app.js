/* 
 * CONTROLADOR DA INTERFACE (APP.JS) - PRECISION DYNAMICS EDITION
 */

let selectedCar   = null;
let selectedTrack = null;
let driverStyle   = "balanced";

// ── NAVEGAÇÃO ENTRE PÁGINAS (VIEWS) ───────────────────
function navigateTo(viewId) {
  // Efeito de transição simples
  const views = document.querySelectorAll('.view');
  views.forEach(v => {
    v.classList.add('opacity-0');
    setTimeout(() => v.classList.add('hidden'), 300);
  });

  setTimeout(() => {
    const activeView = document.getElementById(viewId);
    if (activeView) {
      activeView.classList.remove('hidden');
      setTimeout(() => activeView.classList.remove('opacity-0'), 50);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 300);
}

// ── RENDERIZAR LISTAS ───────────────────────────
function renderCars() {
  const grid = document.getElementById("carGrid");
  grid.innerHTML = CARS.map(car => `
    <button class="car-card glass-panel rounded-xl p-4 flex flex-col gap-4 text-left group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 bg-cover bg-center min-h-[220px]" 
            style="background-image: url('${car.image}')"
            data-id="${car.id}" onclick="selectCar('${car.id}')">
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
      <div class="relative z-20 flex justify-between items-start w-full">
        <span class="px-3 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 font-mono text-[9px] text-race-red uppercase tracking-widest">${car.drivetrain}</span>
        <span class="check-icon material-symbols-outlined text-race-red opacity-0 transition-all duration-300 scale-50 group-[.glass-panel-active]:opacity-100 group-[.glass-panel-active]:scale-100 icon-fill">check_circle</span>
      </div>
      <div class="relative z-20 mt-auto">
        <h3 class="font-display text-lg text-white mb-1 uppercase italic font-black tracking-tighter group-hover:text-race-red transition-colors">${car.name}</h3>
        <p class="font-body text-[11px] text-on-surface-variant leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-500">${car.notes}</p>
      </div>
    </button>
  `).join("");
}

function renderTracks() {
  const grid = document.getElementById("trackGrid");
  grid.innerHTML = TRACKS.map(t => `
    <button class="track-card glass-panel rounded-xl p-4 flex flex-col sm:flex-row gap-6 text-left group transition-all duration-300 hover:bg-white/5" 
            data-id="${t.id}" onclick="selectTrack('${t.id}')">
      <div class="w-full sm:w-1/3 aspect-video sm:aspect-square rounded-lg overflow-hidden relative bg-cover bg-center"
           style="background-image: url('${t.image}')">
        <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
        <div class="check-overlay absolute inset-0 ring-2 ring-inset ring-race-red rounded-lg opacity-0 transition-opacity duration-300 group-[.glass-panel-active]:opacity-100"></div>
      </div>
      <div class="flex flex-col justify-center flex-grow py-2 relative">
        <span class="check-icon absolute top-2 right-2 material-symbols-outlined text-race-red opacity-0 group-[.glass-panel-active]:opacity-100 transition-opacity icon-fill">check_circle</span>
        <h3 class="font-display text-lg text-white mb-2 uppercase italic font-black group-hover:text-race-red transition-colors">${t.name}</h3>
        <div class="flex gap-6">
          <div class="flex flex-col">
            <span class="font-mono text-[8px] text-on-surface-variant uppercase tracking-widest">REGION</span>
            <span class="font-body text-[11px] text-white uppercase">${t.country}</span>
          </div>
          <div class="flex flex-col">
            <span class="font-mono text-[8px] text-on-surface-variant uppercase tracking-widest">AERO LOAD</span>
            <span class="font-body text-[11px] text-tech-blue uppercase">${t.downforce}</span>
          </div>
        </div>
      </div>
    </button>
  `).join("");
}

// ── SELEÇÃO ─────────────────────────────────────
function selectCar(id) {
  selectedCar = CARS.find(c => c.id === id);
  document.querySelectorAll(".car-card").forEach(el => el.classList.remove("glass-panel-active"));
  
  const card = document.querySelector(`.car-card[data-id="${id}"]`);
  card.classList.add("glass-panel-active");
  
  document.getElementById("statusCar").textContent = selectedCar.name.toUpperCase();
  document.getElementById("statusCar").classList.add("text-race-red");
  
  checkReady();
}

function selectTrack(id) {
  selectedTrack = TRACKS.find(t => t.id === id);
  document.querySelectorAll(".track-card").forEach(el => el.classList.remove("glass-panel-active"));
  
  const card = document.querySelector(`.track-card[data-id="${id}"]`);
  card.classList.add("glass-panel-active");
  
  document.getElementById("statusTrack").textContent = selectedTrack.name.toUpperCase();
  document.getElementById("statusTrack").classList.add("text-tech-blue");
  
  checkReady();
}

function checkReady() {
  const btn = document.getElementById("generateBtn");
  if (selectedCar && selectedTrack) {
    btn.disabled = false;
    btn.classList.add("animate-bounce-short");
  } else {
    btn.disabled = true;
  }
}

// Estilo de pilotagem
document.querySelectorAll(".style-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".style-btn").forEach(b => {
       b.classList.remove("active", "bg-race-red/10", "text-race-red", "border-race-red/30");
       b.classList.add("text-on-surface-variant", "border-white/5");
       b.querySelector(".material-symbols-outlined").classList.remove("icon-fill");
    });
    btn.classList.add("active", "bg-race-red/10", "text-race-red", "border-race-red/30");
    btn.classList.remove("text-on-surface-variant", "border-white/5");
    btn.querySelector(".material-symbols-outlined").classList.add("icon-fill");
    driverStyle = btn.dataset.style;
    document.getElementById("resultStyleName").textContent = driverStyle.toUpperCase();
  });
});

// ── GERAR SETUP ─────────────────────────────────
document.getElementById("generateBtn").addEventListener("click", () => {
  const topSpeed = selectedTrack.targetSpeed;
  const setup = generateSetup(selectedCar, selectedTrack, topSpeed, driverStyle);
  
  renderResult(setup);
  openEditor(setup);
  runAdvisor(setup);
  updateTelemetry(setup);
  
  navigateTo('view-result');
});

// ── RENDERIZAR RESULTADO ────────────────────────
function renderResult(setup) {
  document.getElementById("resultCarName").textContent  = selectedCar.name;
  document.getElementById("resultTrackName").textContent = `${selectedTrack.name}`;
  document.getElementById("driverTipText").textContent  = setup.driverTip;

  function paramRow(label, frontVal, rearVal) {
    return `
      <div class="data-row flex justify-between py-3 border-b border-white/5 last:border-0 group">
        <span class="font-body text-xs text-on-surface-variant uppercase group-hover:text-white transition-colors">${label}</span>
        <div class="flex gap-4 font-mono text-[11px]">
          <span class="text-white"><span class="text-race-red/50 mr-1">F</span>${frontVal}</span>
          <span class="text-white"><span class="text-tech-blue/50 mr-1">R</span>${rearVal}</span>
        </div>
      </div>
    `;
  }

  function singleRow(label, val, colorClass = "text-white") {
    return `
      <div class="data-row flex justify-between py-3 border-b border-white/5 last:border-0 group">
        <span class="font-body text-xs text-on-surface-variant uppercase group-hover:text-white transition-colors">${label}</span>
        <span class="font-mono text-[11px] ${colorClass}">${val}</span>
      </div>
    `;
  }

  document.getElementById("suspensionParams").innerHTML = [
    paramRow("Ride Height (mm)", setup.rideHeightFront, setup.rideHeightRear),
    paramRow("Springs (N/mm)", setup.springFront.toFixed(1), setup.springRear.toFixed(1)),
    paramRow("Dampers Comp.", setup.damperCompFront, setup.damperCompRear),
    paramRow("Dampers Ext.", setup.damperExtFront, setup.damperExtRear),
  ].join("");

  document.getElementById("aeroParams").innerHTML = [
    paramRow("Downforce", setup.downforceFront, setup.downforceRear),
  ].join("");

  document.getElementById("transmissionParams").innerHTML = [
    singleRow("Top Speed", `${setup.finalGear} km/h`, "text-tech-blue"),
    singleRow("Brake Bias", `${setup.brakeBias}% Rear`),
  ].join("");

  document.getElementById("lsdParams").innerHTML = [
    singleRow("Initial Torque", setup.lsdInitial),
    singleRow("Acceleration", setup.lsdAccel),
    singleRow("Deceleration", setup.lsdDecel),
  ].join("");
}

// ── TELEMETRIA SIMULADA ──────────────────────────
function updateTelemetry(setup) {
  // Cálculos baseados no setup para simular o comportamento
  const frontBias = (setup.rideHeightRear - setup.rideHeightFront) * 0.5 + 50;
  const aeroEff   = (setup.downforceFront + setup.downforceRear) / 10;
  
  document.getElementById("telemetryFront").textContent = `${frontBias.toFixed(0)}%`;
  document.getElementById("telemetryRear").textContent  = `${(100 - frontBias).toFixed(0)}%`;
  document.getElementById("telemetryAero").textContent  = `${aeroEff.toFixed(0)}%`;
  
  document.getElementById("barFront").style.width = `${frontBias}%`;
  document.getElementById("barRear").style.width  = `${100 - frontBias}%`;
  document.getElementById("barAero").style.width  = `${aeroEff}%`;
}

// ── COPIAR SETUP ─────────────────
document.getElementById("copyBtn").addEventListener("click", () => {
  const text = `PRECISION DYNAMICS CONFIG — ${selectedCar.name} @ ${selectedTrack.name}\n` +
               `SUSPENSION: F ${currentEditSetup.rideHeightFront} / R ${currentEditSetup.rideHeightRear}\n` +
               `SPRINGS: F ${currentEditSetup.springFront.toFixed(1)} / R ${currentEditSetup.springRear.toFixed(1)}\n` +
               `AERO: F ${currentEditSetup.downforceFront} / R ${currentEditSetup.downforceRear}\n` +
               `GEAR: ${currentEditSetup.finalGear} km/h`;
  
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyBtn");
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span> DATA EXPORTED';
    btn.classList.remove("bg-white", "text-black");
    btn.classList.add("bg-tech-blue", "text-white");
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.add("bg-white", "text-black");
      btn.classList.remove("bg-tech-blue", "text-white");
    }, 2000);
  });
});

// ── EDITOR ─────────────────
let currentEditSetup = null;
let originalGeneratedSetup = null;

function openEditor(setup) {
  currentEditSetup = { ...setup };
  originalGeneratedSetup = { ...setup };
  buildEditorSliders(currentEditSetup);
}

function buildEditorSliders(setup) {
  const grid = document.getElementById("editorGrid");
  const groups = [
    { title: "Chassis", keys: ["rideHeightFront","rideHeightRear","springFront","springRear"] },
    { title: "Control", keys: ["arbFront","arbRear","camberFront","camberRear"] },
    { title: "Aerodynamics", keys: ["downforceFront","downforceRear"] },
    { title: "Drive", keys: ["finalGear","brakeBias"] }
  ];

  grid.innerHTML = groups.map(group => `
    <section class="glass-panel rounded-xl overflow-hidden flex flex-col">
      <div class="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 class="font-display text-[10px] text-white uppercase tracking-[0.2em] font-bold">${group.title}</h3>
      </div>
      <div class="p-6 space-y-8 flex-grow">
        ${group.keys.map(key => {
          const limits = PARAM_LIMITS[key];
          const value = setup[key];
          return `
            <div class="flex flex-col gap-3 group/slider">
              <div class="flex justify-between items-end">
                <label class="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest group-hover/slider:text-white transition-colors">${limits.label}</label>
                <div class="font-mono text-[11px] text-tech-blue" id="val_${key}">
                  ${Number(value).toFixed(limits.step < 1 ? (limits.step < 0.1 ? 2 : 1) : 0)}<span class="text-[9px] ml-1 text-on-surface-variant">${limits.unit}</span>
                </div>
              </div>
              <input type="range" class="w-full" 
                     min="${limits.min}" max="${limits.max}" step="${limits.step}" value="${value}"
                     oninput="onSliderChange('${key}', this.value)">
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `).join("");
}

function onSliderChange(key, rawValue) {
  const limits = PARAM_LIMITS[key];
  const value  = parseFloat(rawValue);
  currentEditSetup[key] = value;
  
  const displayEl = document.getElementById(`val_${key}`);
  if (displayEl) displayEl.innerHTML = `${value.toFixed(limits.step < 1 ? (limits.step < 0.1 ? 2 : 1) : 0)}<span class="text-[9px] ml-1 text-on-surface-variant">${limits.unit}</span>`;
  
  // Mostrar barra de ação
  document.getElementById("editorStickyBar").classList.remove("translate-y-full");
  
  // Update Live Preview
  runAdvisor(currentEditSetup);
  updateTelemetry(currentEditSetup);
}

document.getElementById("editorSaveBtn").addEventListener("click", () => {
  renderResult(currentEditSetup);
  document.getElementById("editorStickyBar").classList.add("translate-y-full");
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById("editorResetBtn").addEventListener("click", () => {
  currentEditSetup = { ...originalGeneratedSetup };
  buildEditorSliders(currentEditSetup);
  runAdvisor(currentEditSetup);
  updateTelemetry(currentEditSetup);
  document.getElementById("editorStickyBar").classList.add("translate-y-full");
});

// Abas do Editor
document.getElementById("tabEditGenerated").addEventListener("click", () => {
  setActiveTab("tabEditGenerated");
  currentEditSetup = { ...originalGeneratedSetup };
  buildEditorSliders(currentEditSetup);
});

document.getElementById("tabFromScratch").addEventListener("click", () => {
  setActiveTab("tabFromScratch");
  currentEditSetup = getBlankSetup();
  buildEditorSliders(currentEditSetup);
});

function setActiveTab(activeId) {
  document.querySelectorAll(".mode-tab").forEach(btn => {
    btn.classList.remove("bg-white", "text-black");
    btn.classList.add("text-on-surface-variant");
  });
  const active = document.getElementById(activeId);
  active.classList.add("bg-white", "text-black");
  active.classList.remove("text-on-surface-variant");
}

// ── ADVISOR ─────────────────
function runAdvisor(setup) {
  if (!selectedCar || !selectedTrack) return;
  const result = analyzeSetup(setup, selectedCar, selectedTrack);
  
  const scoreEl = document.getElementById("scoreNumber");
  // Animação de contagem
  const startScore = parseInt(scoreEl.textContent) || 0;
  animateValue("scoreNumber", startScore, result.score, 500);

  document.getElementById("scoreLabel").textContent  = result.scoreLabel;
  document.getElementById("scoreSub").textContent    = `${result.errors} CRITICAL • ${result.warnings} WARNINGS`;

  const alertsEl = document.getElementById("advisorAlerts");
  const allOkEl  = document.getElementById("advisorAllOk");
  const nonOkAlerts = result.alerts.filter(a => a.severity !== "ok");

  if (nonOkAlerts.length === 0) {
    alertsEl.innerHTML = "";
    allOkEl.classList.remove("hidden");
  } else {
    allOkEl.classList.add("hidden");
    alertsEl.innerHTML = nonOkAlerts.map(al => `
      <div class="bg-white/5 p-4 rounded-lg border-l-2 ${al.severity === 'error' ? 'border-race-red' : 'border-yellow-500'} group hover:bg-white/10 transition-colors">
        <div class="flex items-center gap-2 mb-1">
          <span class="material-symbols-outlined text-[14px] ${al.severity === 'error' ? 'text-race-red' : 'text-yellow-500'}">${al.severity === 'error' ? 'cancel' : 'warning'}</span>
          <span class="font-mono text-[9px] uppercase font-bold text-white tracking-widest">${al.param}</span>
        </div>
        <p class="text-[11px] text-on-surface-variant leading-tight">${al.message}</p>
      </div>
    `).join("");
  }
}

function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  const range = end - start;
  const minTimer = 50;
  let stepTime = Math.abs(Math.floor(duration / range));
  stepTime = Math.max(stepTime, minTimer);
  const startTime = new Date().getTime();
  const endTime = startTime + duration;
  let timer;

  function run() {
    const now = new Date().getTime();
    const remaining = Math.max((endTime - now) / duration, 0);
    const value = Math.round(end - (remaining * range));
    obj.innerHTML = value;
    if (value == end) {
      clearInterval(timer);
    }
  }

  timer = setInterval(run, stepTime);
  run();
}

// Inicialização
renderCars();
renderTracks();
