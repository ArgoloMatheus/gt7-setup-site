/* 
 * ARQUIVO DE DADOS (DATABASE)
 * Este arquivo funciona como o "banco de dados" do nosso laboratório.
 * Aqui centralizamos todas as informações técnicas dos carros e das pistas.
 * Ter esses dados separados facilita a manutenção: se um novo carro for lançado no jogo,
 * basta adicioná-lo aqui sem precisar mexer na lógica de cálculo ou na interface.
 */

/* 
 * ARRAY DE CARROS (CARS)
 * Separamos os carros em um array de objetos para que possamos percorrer essa lista 
 * e criar os cards na tela automaticamente. Cada objeto contém "metadados" que o 
 * motor de cálculo (engine.js) usará para decidir a rigidez da suspensão e outros ajustes.
 */
const CARS = [
  {
    id: "porsche_911_rsr",
    name: "Porsche 911 RSR (991)",
    manufacturer: "Porsche",
    category: "Gr.3",
    // drivetrain: tipo de tração. "RR" = motor e tração traseira. 
    // Carros RR tendem a ser instáveis na entrada da curva (oversteer).
    drivetrain: "RR",        
    enginePos: "REAR",
    weightKg: 1200,
    // weightDistFront/Rear: porcentagem de distribuição de peso.
    // O Porsche tem 62% do peso atrás, o que exige molas traseiras mais fortes.
    weightDistFront: 38,     
    weightDistRear: 62,
    // ppBase: Pontos de Performance base. Útil para referência de balanceamento.
    ppBase: 550,
    notes: "Motor traseiro cria instabilidade no lift-off. Exige técnica de frenagem."
  },
  {
    id: "ferrari_458_gt3",
    name: "Ferrari 458 GT3",
    manufacturer: "Ferrari",
    category: "Gr.3",
    // "MR" = Motor Central, Tração Traseira. É o layout mais equilibrado para pista.
    drivetrain: "MR",
    enginePos: "MID",
    weightKg: 1220,
    weightDistFront: 43,
    weightDistRear: 57,
    ppBase: 548,
    notes: "Motor central = equilíbrio natural. Sensível ao camber traseiro."
  },
  {
    id: "amg_gt3",
    name: "Mercedes AMG GT3",
    manufacturer: "Mercedes",
    category: "Gr.3",
    // "FR" = Motor Dianteiro, Tração Traseira. Estilo clássico "nariz pesado".
    drivetrain: "FR",
    enginePos: "FRONT",
    weightKg: 1285,
    weightDistFront: 52,
    weightDistRear: 48,
    ppBase: 545,
    notes: "FR clássico. Subviragem crônica se mal configurado."
  },
  {
    id: "subaru_wrx_gr3",
    name: "Subaru WRX Gr.3",
    manufacturer: "Subaru",
    category: "Gr.3",
    // "4WD" = Tração nas 4 rodas. Muita tração na saída, mas tende a "espalhar" na curva.
    drivetrain: "4WD",
    enginePos: "FRONT",
    weightKg: 1300,
    weightDistFront: 50,
    weightDistRear: 50,
    ppBase: 542,
    notes: "4WD tem subviragem natural. Mover lastro para traseira ajuda a rotação."
  },
  {
    id: "megane_gr3",
    name: "Renault Sport Mégane Gr.3",
    manufacturer: "Renault",
    category: "Gr.3",
    // "FF" = Motor e Tração Dianteira. Desafio técnico para evitar desgaste de pneus frontais.
    drivetrain: "FF",
    enginePos: "FRONT",
    weightKg: 1175,
    weightDistFront: 62,
    weightDistRear: 38,
    ppBase: 535,
    notes: "FF se beneficia de trail braking. Não force o diferencial."
  },
  {
    id: "bmw_m6_gt3",
    name: "BMW M6 GT3",
    manufacturer: "BMW",
    category: "Gr.3",
    drivetrain: "FR",
    enginePos: "FRONT",
    weightKg: 1300,
    weightDistFront: 50,
    weightDistRear: 50,
    ppBase: 544,
    notes: "Equilibrado entre os FR. Responde bem a ajustes de diferencial."
  },
  {
    id: "aston_vantage_gt3",
    name: "Aston Martin Vantage GT3",
    manufacturer: "Aston Martin",
    category: "Gr.3",
    drivetrain: "FR",
    enginePos: "FRONT",
    weightKg: 1295,
    weightDistFront: 51,
    weightDistRear: 49,
    ppBase: 543,
    notes: "Similar ao AMG. Ligeiramente mais neutro na traseira."
  },
  {
    id: "lamborghini_huracan_gt3",
    name: "Lamborghini Huracán GT3",
    manufacturer: "Lamborghini",
    category: "Gr.3",
    drivetrain: "MR",
    enginePos: "MID",
    weightKg: 1252,
    weightDistFront: 40,
    weightDistRear: 60,
    ppBase: 547,
    notes: "Massa traseira elevada. Barra antirrolagem dianteira rígida é essencial."
  },
  {
    id: "mclaren_650s_gt3",
    name: "McLaren 650S GT3",
    manufacturer: "McLaren",
    category: "Gr.3",
    drivetrain: "MR",
    enginePos: "MID",
    weightKg: 1300,
    weightDistFront: 42,
    weightDistRear: 58,
    ppBase: 546,
    notes: "MR bem equilibrado. Downforce traseiro crítico em pistas técnicas."
  }
];

/* 
 * ARRAY DE PISTAS (TRACKS)
 * Assim como os carros, as pistas têm características que moldam o setup.
 * Pistas rápidas pedem aerodinâmica baixa, pistas onduladas pedem suspensão macia.
 */
const TRACKS = [
  {
    id: "sardegna_a",
    name: "Sardegna Road Track A",
    country: "Itália",
    // downforce: define a necessidade de pressão aerodinâmica. LOW = foco em velocidade final.
    downforce: "LOW",        
    // surface: tipo de asfalto. SMOOTH = asfalto liso, permite suspensão mais rígida e baixa.
    surface: "SMOOTH",       
    // longestStraightM: comprimento da maior reta em metros. Define o ajuste de marchas.
    longestStraightM: 1800,
    // hasBumps: indica se há zebras altas ou ondulações fortes que podem desestabilizar o carro.
    hasBumps: false,
    circuitType: "PERMANENT",
    description: "Pista de alta velocidade. Downforce baixo prioriza top speed."
  },
  {
    id: "le_mans",
    name: "Circuit de la Sarthe (Le Mans)",
    country: "França",
    downforce: "LOW",
    surface: "SMOOTH",
    longestStraightM: 5900,
    hasBumps: false,
    circuitType: "PERMANENT",
    description: "Maior reta do calendário. Máxima velocidade final."
  },
  {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    country: "Itália",
    downforce: "LOW",
    surface: "SMOOTH",
    longestStraightM: 1150,
    hasBumps: false,
    circuitType: "PERMANENT",
    description: "Templo da velocidade. Poucas curvas, muito foco em tração."
  },
  {
    id: "nurburgring_nordschleife",
    name: "Nürburgring Nordschleife",
    country: "Alemanha",
    // HIGH downforce e BUMPY surface: exigem um carro "alto e macio" para não saltar nas irregularidades.
    downforce: "HIGH",
    surface: "BUMPY",
    longestStraightM: 450,
    hasBumps: true,
    circuitType: "MIXED",
    description: "Inferno Verde. Suspensão macia e downforce alto são obrigatórios."
  },
  {
    id: "spa",
    name: "Circuit de Spa-Francorchamps",
    country: "Bélgica",
    downforce: "HIGH",
    surface: "MIXED",
    longestStraightM: 740,
    hasBumps: true,
    circuitType: "PERMANENT",
    description: "Curvas de alta velocidade exigem downforce e estabilidade."
  },
  {
    id: "mount_panorama",
    name: "Mount Panorama",
    country: "Austrália",
    downforce: "HIGH",
    surface: "MIXED",
    longestStraightM: 680,
    hasBumps: true,
    circuitType: "HILLCLIMB",
    description: "Subidas e descidas bruscas. Suspensão precisa absorver mudanças de elevação."
  },
  {
    id: "tokyo_expressway",
    name: "Tokyo Expressway",
    country: "Japão",
    downforce: "MEDIUM",
    surface: "SMOOTH",
    longestStraightM: 420,
    hasBumps: false,
    circuitType: "STREET",
    description: "Pista urbana técnica. Equilíbrio entre downforce e mobilidade."
  },
  {
    id: "trial_mountain",
    name: "Trial Mountain",
    country: "Japão",
    downforce: "MEDIUM",
    surface: "MIXED",
    longestStraightM: 380,
    hasBumps: true,
    circuitType: "PERMANENT",
    description: "Pista clássica do GT. Boa para testar equilíbrio geral do setup."
  },
  {
    id: "dragon_trail",
    name: "Dragon Trail Seaside",
    country: "Croácia",
    downforce: "MEDIUM",
    surface: "SMOOTH",
    longestStraightM: 510,
    hasBumps: false,
    circuitType: "PERMANENT",
    description: "Pista rápida e fluida. Setup equilibrado é o caminho certo."
  }
];

/*
 * COMO ESTES DADOS SÃO CONSUMIDOS?
 * O arquivo engine.js vai importar esses arrays. Quando o usuário clica em "Gerar",
 * o motor de cálculo olha, por exemplo, o "drivetrain" do carro e o "surface" da pista
 * para aplicar as fórmulas matemáticas e gerar os valores de suspensão e diferencial.
 */
