package com.gt7.pages;

import com.gt7.utils.ScrollUtils;
import com.gt7.utils.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * EditorPage — Page Object do Editor Manual de Setup.
 */
public class EditorPage extends BasePage {

    @FindBy(id = "editor")
    private WebElement editorSection;

    @FindBy(id = "editorSaveBtn")
    private WebElement applyAndAnalyzeBtn;

    @FindBy(id = "editorResetBtn")
    private WebElement resetBtn;

    @FindBy(id = "tabFromScratch")
    private WebElement tabFromScratch;

    @FindBy(id = "tabEditGenerated")
    private WebElement tabEditGenerated;

    public boolean isVisible() {
        String classes = editorSection.getAttribute("class");
        return classes != null && !classes.contains("hidden");
    }

    /**
     * Define o valor de um parâmetro no editor pelo nome da chave.
     * Localiza o slider pelo id gerado dinamicamente pelo app.js: "slider_{key}"
     */
    public void setParameterValue(String paramKey, String value) {
        WebElement slider = WaitUtils.fluentWait(By.id("slider_" + paramKey));
        ScrollUtils.scrollToElement(slider);
        ScrollUtils.setSliderValue(slider, value);
    }

    /**
     * Retorna o valor atual exibido para um parâmetro.
     * O id do display é gerado como "val_{key}" pelo app.js.
     */
    public String getParameterDisplayValue(String paramKey) {
        WebElement display = WaitUtils.fluentWait(By.id("val_" + paramKey));
        return display.getText().trim();
    }

    public void clickApplyAndAnalyze() {
        click(applyAndAnalyzeBtn);
        WaitUtils.waitForSectionVisible(By.id("advisor"));
    }

    public void clickReset() {
        click(resetBtn);
    }

    public void switchToFromScratch() {
        click(tabFromScratch);
    }

    public void switchToEditGenerated() {
        click(tabEditGenerated);
    }

    public boolean isTabActive(String tabId) {
        WebElement tab = driver.findElement(By.id(tabId));
        return tab.getAttribute("class").contains("active");
    }
}
