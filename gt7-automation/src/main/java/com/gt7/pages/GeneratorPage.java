package com.gt7.pages;

import com.gt7.utils.ScrollUtils;
import com.gt7.utils.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import java.util.List;

/**
 * GeneratorPage — Page Object da seção de geração de setup.
 *
 * Esta página contém elementos dinâmicos (cards de carro/pista)
 * gerados pelo JavaScript — por isso usamos findElements() em vez de @FindBy
 * para os cards individuais.
 *
 * @FindBy é ideal para elementos estáticos (sempre presentes no HTML).
 * findElements() é melhor para listas dinâmicas onde o número de elementos varia.
 */
public class GeneratorPage extends BasePage {

    @FindBy(id = "carGrid")
    private WebElement carGrid;

    @FindBy(id = "trackGrid")
    private WebElement trackGrid;

    @FindBy(id = "topSpeedSlider")
    private WebElement topSpeedSlider;

    @FindBy(id = "topSpeedValue")
    private WebElement topSpeedValueDisplay;

    @FindBy(id = "generateBtn")
    private WebElement generateButton;

    @FindBy(id = "generator")
    private WebElement generatorSection;

    // Botões de estilo de pilotagem
    @FindBy(css = ".style-btn[data-style='aggressive']")
    private WebElement btnAggressive;

    @FindBy(css = ".style-btn[data-style='balanced']")
    private WebElement btnBalanced;

    @FindBy(css = ".style-btn[data-style='conservative']")
    private WebElement btnConservative;

    /**
     * Seleciona um carro pelo nome parcial exibido no card.
     *
     * Por que buscar por texto e não por ID?
     * Os cards são gerados dinamicamente pelo JS. Buscar pelo texto visível
     * torna o teste mais próximo da perspectiva do usuário real.
     */
    public void selectCarByName(String carNamePartial) {
        WaitUtils.waitForVisibility(carGrid);

        List<WebElement> carCards = driver.findElements(By.cssSelector(".car-card"));

        WebElement targetCard = carCards.stream()
            .filter(card -> card.getText().contains(carNamePartial))
            .findFirst()
            .orElseThrow(() -> new RuntimeException(
                "Carro não encontrado: '" + carNamePartial + "'. " +
                "Verifique se o nome está correto e se os dados foram carregados."
            ));

        click(targetCard);
    }

    /**
     * Seleciona uma pista pelo nome parcial.
     * Mesma lógica do selectCarByName — busca por texto visível.
     */
    public void selectTrackByName(String trackNamePartial) {
        WaitUtils.waitForVisibility(trackGrid);

        List<WebElement> trackCards = driver.findElements(By.cssSelector(".track-card"));

        WebElement targetCard = trackCards.stream()
            .filter(card -> card.getText().contains(trackNamePartial))
            .findFirst()
            .orElseThrow(() -> new RuntimeException(
                "Pista não encontrada: '" + trackNamePartial + "'."
            ));

        click(targetCard);
    }

    /**
     * Ajusta o slider de velocidade máxima para o valor desejado.
     * Usa ScrollUtils.setSliderValue() que dispara o evento 'input' via JS.
     */
    public void setTopSpeed(int speedKmh) {
        ScrollUtils.scrollToElement(topSpeedSlider);
        ScrollUtils.setSliderValue(topSpeedSlider, String.valueOf(speedKmh));
    }

    /**
     * Retorna o valor atual exibido ao lado do slider.
     * Usado nas asserções para verificar se o slider atualizou corretamente.
     */
    public String getTopSpeedDisplayValue() {
        return getText(topSpeedValueDisplay);
    }

    public void selectDriverStyle(String style) {
        switch (style.toLowerCase()) {
            case "aggressive":   click(btnAggressive);   break;
            case "balanced":     click(btnBalanced);     break;
            case "conservative": click(btnConservative); break;
            default: throw new IllegalArgumentException("Estilo inválido: " + style);
        }
    }

    /**
     * Verifica se o botão "Gerar Setup" está habilitado.
     * Deve estar habilitado somente após selecionar carro E pista.
     */
    public boolean isGenerateButtonEnabled() {
        return generateButton.isEnabled() &&
               !generateButton.getAttribute("class").contains("disabled");
    }

    /**
     * Clica em "Gerar Setup" e aguarda a seção de resultado aparecer.
     */
    public void clickGenerate() {
        WaitUtils.waitForClickable(generateButton);
        click(generateButton);
        // Aguarda a seção #result remover a classe "hidden"
        WaitUtils.waitForSectionVisible(By.id("result"));
    }
}
