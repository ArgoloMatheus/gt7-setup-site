package com.gt7.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * HomePage — Page Object da página inicial do GT7 Setup Lab.
 *
 * @FindBy: anotação que mapeia um campo Java a um elemento HTML.
 * O PageFactory (inicializado no BasePage) resolve o mapeamento automaticamente.
 *
 * Estratégias de localização (do mais ao menos recomendado em ambientes corporativos):
 * 1. id         — mais rápido, mais estável
 * 2. css        — flexível, legível
 * 3. xpath      — poderoso mas frágil se o HTML mudar
 * 4. linkText   — apenas para links com texto exato
 * EVITAR: xpath com índices absolutos (/div[3]/span[1]) — quebra com qualquer mudança de layout
 */
public class HomePage extends BasePage {

    @FindBy(css = ".hero-title")
    private WebElement heroTitle;

    @FindBy(css = ".logo-gt")
    private WebElement logoGT;

    @FindBy(css = "a.cta-button[href='#generator']")
    private WebElement ctaButton;

    @FindBy(css = ".header-nav a[href='#generator']")
    private WebElement navGenerator;

    /**
     * Navega para a URL base do site.
     * Chamado no início de cada teste que começa pela Home.
     */
    public void open() {
        driver.get(com.gt7.config.ConfigReader.getBaseUrl());
    }

    /** Retorna o texto do título principal da hero section. */
    public String getHeroTitle() {
        return getText(heroTitle);
    }

    /** Verifica se o logo GT7 está visível. */
    public boolean isLogoVisible() {
        return logoGT.isDisplayed();
    }

    /** Clica no botão CTA e rola para a seção do gerador. */
    public void clickGenerateSetup() {
        click(ctaButton);
    }

    /** Clica no link "Gerador" na navegação do header. */
    public void clickNavGenerator() {
        click(navGenerator);
    }
}
