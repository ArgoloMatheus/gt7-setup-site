package com.gt7.pages;

import com.gt7.driver.DriverManager;
import com.gt7.utils.ScrollUtils;
import com.gt7.utils.WaitUtils;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.PageFactory;

/**
 * BasePage — Classe pai de todas as Page Objects.
 *
 * PADRÃO PAGE OBJECT MODEL (POM):
 * Cada página do site tem uma classe Java correspondente.
 * Esta classe contém:
 *  - Os localizadores dos elementos (@FindBy)
 *  - Os métodos de ação (clicar, digitar, verificar)
 *  - ZERO lógica de asserção (assert fica nos testes, não nas pages)
 *
 * POR QUÊ POM?
 * - Manutenção: se um elemento muda no site, você atualiza só na Page, não em 20 testes.
 * - Legibilidade: o teste lê como uma ação humana: generator.selectCar("Porsche 911");
 * - Reutilização: o mesmo método pode ser usado em múltiplos testes.
 */
public abstract class BasePage {

    protected WebDriver driver;

    public BasePage() {
        this.driver = DriverManager.getDriver();
        // PageFactory inicializa os @FindBy — linka os campos Java com os elementos HTML
        PageFactory.initElements(driver, this);
    }

    /**
     * Clica em um elemento com espera explícita + scroll automático.
     * Método centralizado para que TODA interação de clique passe por aqui.
     */
    protected void click(WebElement element) {
        ScrollUtils.scrollToElement(element);
        WaitUtils.waitForClickable(element).click();
    }

    /**
     * Verifica se um elemento contém um texto específico.
     * Retorna boolean — a asserção (assertTrue) é feita no teste.
     */
    protected boolean elementContainsText(WebElement element, String expectedText) {
        WaitUtils.waitForVisibility(element);
        return element.getText().contains(expectedText);
    }

    /**
     * Clica via JavaScript — fallback quando o click normal falha.
     * Uso: elementos atrás de overlays, fora da viewport ou com z-index problemático.
     */
    protected void jsClick(WebElement element) {
        ((JavascriptExecutor) driver)
            .executeScript("arguments[0].click();", element);
    }

    /**
     * Retorna o texto visível de um elemento após aguardar visibilidade.
     */
    protected String getText(WebElement element) {
        return WaitUtils.waitForVisibility(element).getText().trim();
    }
}
