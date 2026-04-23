package com.gt7.pages;

import com.gt7.constants.AppConstants;
import com.gt7.utils.WaitUtils;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * SetupResultPage — Page Object da seção de resultado do setup gerado.
 */
public class SetupResultPage extends BasePage {

    @FindBy(id = "result")
    private WebElement resultSection;

    @FindBy(id = "resultCarName")
    private WebElement resultCarName;

    @FindBy(id = "resultTrackName")
    private WebElement resultTrackName;

    @FindBy(id = "ppNote")
    private WebElement ppNote;

    @FindBy(id = "copyBtn")
    private WebElement copyButton;

    @FindBy(id = "driverTipText")
    private WebElement driverTipText;

    /** Verifica se a seção de resultado está visível (não tem classe "hidden"). */
    public boolean isVisible() {
        String classes = resultSection.getAttribute("class");
        return classes != null && !classes.contains("hidden");
    }

    public String getResultCarName()   { return getText(resultCarName); }
    public String getResultTrackName() { return getText(resultTrackName); }
    public String getPpNoteText()      { return getText(ppNote); }
    public String getDriverTip()       { return getText(driverTipText); }

    /** Verifica se a nota de PP contém o texto obrigatório. */
    public boolean hasPpNote() {
        return elementContainsText(ppNote, AppConstants.PP_NOTE_PARTIAL);
    }

    /** Clica em "Copiar Setup" e aguarda o texto de confirmação. */
    public void clickCopySetup() {
        click(copyButton);
        // Aguarda o texto mudar para "Copiado!" — confirmação visual ao usuário
        WaitUtils.waitForTextPresent(copyButton, AppConstants.COPY_BTN_SUCCESS);
    }

    public String getCopyButtonText() { return getText(copyButton); }
}
