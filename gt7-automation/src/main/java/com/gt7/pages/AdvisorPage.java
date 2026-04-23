package com.gt7.pages;

import com.gt7.utils.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AdvisorPage — Page Object da seção do Setup Advisor.
 */
public class AdvisorPage extends BasePage {

    @FindBy(id = "advisor")
    private WebElement advisorSection;

    @FindBy(id = "scoreNumber")
    private WebElement scoreNumber;

    @FindBy(id = "scoreLabel")
    private WebElement scoreLabel;

    @FindBy(id = "advisorAllOk")
    private WebElement allOkMessage;

    @FindBy(id = "advisorAlerts")
    private WebElement alertsContainer;

    /** Retorna se o Advisor está visível na página. */
    public boolean isVisible() {
        String classes = advisorSection.getAttribute("class");
        return classes != null && !classes.contains("hidden");
    }

    public int getScore() {
        WaitUtils.waitForVisibility(scoreNumber);
        return Integer.parseInt(getText(scoreNumber).replaceAll("[^0-9]", ""));
    }

    public String getScoreLabel() { return getText(scoreLabel); }

    /** Verifica se a mensagem "tudo OK" está visível (setup sem problemas). */
    public boolean isAllOkVisible() {
        String classes = allOkMessage.getAttribute("class");
        return classes != null && !classes.contains("hidden");
    }

    /**
     * Retorna a lista de textos de todos os alertas de ERRO (❌) visíveis.
     * Uso: verificar se alertas esperados estão sendo gerados corretamente.
     */
    public List<String> getErrorAlertTexts() {
        return driver.findElements(By.cssSelector(".advisor-alert--error .alert-message"))
                     .stream()
                     .map(WebElement::getText)
                     .collect(Collectors.toList());
    }

    /**
     * Retorna a lista de textos de todos os alertas de AVISO (⚠️).
     */
    public List<String> getWarningAlertTexts() {
        return driver.findElements(By.cssSelector(".advisor-alert--warning .alert-message"))
                     .stream()
                     .map(WebElement::getText)
                     .collect(Collectors.toList());
    }

    /** Verifica se algum alerta (erro ou aviso) contém o texto esperado (case-insensitive). */
    public boolean hasAlertContaining(String textPartial) {
        String search = textPartial.toLowerCase();
        List<WebElement> allAlerts = driver.findElements(
            By.cssSelector(".advisor-alert .alert-message")
        );
        return allAlerts.stream()
                        .anyMatch(el -> el.getText().toLowerCase().contains(search));
    }
}
