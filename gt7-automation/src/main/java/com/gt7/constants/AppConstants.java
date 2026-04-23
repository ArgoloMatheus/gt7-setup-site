package com.gt7.constants;

/**
 * AppConstants — Centraliza todos os valores fixos do projeto.
 *
 * POR QUÊ usar uma classe de constantes?
 * - Evita "magic strings": strings soltas no código sem contexto.
 * - Se um texto mudar no site, você corrige em UM lugar, não em 30 testes.
 * - Em code review corporativo, hardcode de strings é um red flag.
 *
 * Convenção de nomenclatura: SCREAMING_SNAKE_CASE para constantes.
 */
public final class AppConstants {

    // Construtor privado: impede que alguém crie uma instância desta classe.
    // Constantes não precisam de objeto — são acessadas diretamente: AppConstants.PAGE_TITLE
    private AppConstants() {}

    // ── TEXTOS ESPERADOS NA UI ──────────────────────────────────────────────

    /** Título principal exibido na hero section */
    public static final String HERO_TITLE_PARTIAL = "Setups";

    /** Texto do badge de downforce baixo nos cards de pista */
    public static final String BADGE_LOW_DOWNFORCE = "Baixo Downforce";

    /** Texto do badge de downforce alto */
    public static final String BADGE_HIGH_DOWNFORCE = "Alto Downforce";

    /** Texto padrão do botão de copiar setup */
    public static final String COPY_BTN_DEFAULT = "Copiar Setup";

    /** Texto do botão de copiar após sucesso */
    public static final String COPY_BTN_SUCCESS = "Copiado!";

    /** Nota de PP que deve aparecer em todo resultado */
    public static final String PP_NOTE_PARTIAL = "Ajuste ECU e Lastro";

    /** Texto da mensagem de tudo OK no Advisor */
    public static final String ADVISOR_ALL_OK_PARTIAL = "Setup sólido";

    // ── NOMES DE CARROS (usados nos testes parametrizados) ─────────────────

    public static final String CAR_PORSCHE_911   = "Porsche 911 RSR";
    public static final String CAR_FERRARI_458   = "Ferrari 458 GT3";
    public static final String CAR_MEGANE        = "Renault Sport Mégane";
    public static final String CAR_SUBARU_WRX    = "Subaru WRX Gr.3";
    public static final String CAR_LAMBORGHINI   = "Lamborghini Huracán GT3";

    // ── NOMES DE PISTAS ────────────────────────────────────────────────────

    public static final String TRACK_LE_MANS        = "Circuit de la Sarthe";
    public static final String TRACK_NURBURGRING     = "Nürburgring Nordschleife";
    public static final String TRACK_SARDEGNA        = "Sardegna Road Track A";
    public static final String TRACK_TRIAL_MOUNTAIN  = "Trial Mountain";
    public static final String TRACK_SPA             = "Circuit de Spa-Francorchamps";

    // ── TIMEOUTS ───────────────────────────────────────────────────────────

    /** Tempo de espera padrão para elementos aparecerem (ms) */
    public static final int DEFAULT_WAIT_MS = 10_000;

    /** Intervalo de polling para esperas fluentes (ms) */
    public static final int POLLING_INTERVAL_MS = 500;

    /** Pausa após scroll para o elemento estabilizar visualmente */
    public static final int SCROLL_PAUSE_MS = 300;

    // ── ADVISOR — TEXTOS DE ALERTAS ESPERADOS ─────────────────────────────

    /** Texto parcial esperado no alerta de ARB para carros RR */
    public static final String ADVISOR_ARB_RR_PARTIAL = "snap oversteer";

    /** Texto parcial esperado no alerta de LSD para 4WD */
    public static final String ADVISOR_LSD_4WD_PARTIAL = "understeer";

    /** Texto parcial no alerta de downforce baixo em pista de alto downforce */
    public static final String ADVISOR_DOWNFORCE_LOW_PARTIAL = "escorregar";
}
