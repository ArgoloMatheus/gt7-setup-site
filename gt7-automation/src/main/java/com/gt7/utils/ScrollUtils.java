package com.gt7.utils;

import com.gt7.constants.AppConstants;
import com.gt7.driver.DriverManager;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;

/**
 * ScrollUtils — Ações de rolagem de página.
 *
 * POR QUÊ usar JavascriptExecutor para scroll?
 * O Selenium padrão não tem um método scrollTo direto.
 * O JavascriptExecutor permite executar JS no browser — mais confiável
 * que Actions.moveToElement() em páginas com layout complexo.
 */
public class ScrollUtils {

    /**
     * Rola a página até que o elemento fique visível.
     * Uso: elementos abaixo da dobra que precisam ser acessados.
     */
    public static void scrollToElement(WebElement element) {
        ((JavascriptExecutor) DriverManager.getDriver())
            .executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element);

        // Pausa para o scroll terminar — único uso aceitável de Thread.sleep()
        // em automação: aguardar animação CSS, não carregamento de rede.
        try {
            Thread.sleep(AppConstants.SCROLL_PAUSE_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Rola até o topo da página.
     * Uso: início de cada teste para garantir estado visual limpo.
     */
    public static void scrollToTop() {
        ((JavascriptExecutor) DriverManager.getDriver())
            .executeScript("window.scrollTo(0, 0);");
    }

    /**
     * Move o slider HTML para um valor específico via JavaScript.
     *
     * POR QUÊ JS e não .sendKeys()?
     * Sliders do tipo range têm comportamento imprevisível com sendKeys
     * entre sistemas operacionais. O JS é determinístico.
     */
    public static void setSliderValue(WebElement slider, String value) {
        JavascriptExecutor js = (JavascriptExecutor) DriverManager.getDriver();
        js.executeScript(
            "arguments[0].value = arguments[1]; " +
            // Dispara o evento 'input' manualmente — o app.js escuta este evento
            // para atualizar o estado. Sem disparar, o site não "enxerga" a mudança.
            "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
            slider, value
        );
    }
}
