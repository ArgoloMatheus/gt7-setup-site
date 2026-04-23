package com.gt7.utils;

import com.gt7.constants.AppConstants;
import com.gt7.driver.DriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.NoSuchElementException;

/**
 * WaitUtils — Centraliza todas as estratégias de espera.
 *
 * CONCEITO FUNDAMENTAL PARA QA:
 * Nunca use Thread.sleep() em automações de produção. Motivos:
 * 1. Tempo fixo: se o elemento aparecer em 1s mas você esperou 5s, perdeu 4s por teste.
 * 2. Se o ambiente estiver lento, 5s pode não ser suficiente — teste flaky (instável).
 *
 * Tipos de espera no Selenium:
 * - Implícita: espera global aplicada a todo findElement(). Configurada no DriverManager.
 * - Explícita (WebDriverWait): espera por uma CONDIÇÃO específica. RECOMENDADA.
 * - Fluente (FluentWait): espera com controle total de polling e exceções ignoradas.
 */
public class WaitUtils {

    /**
     * Espera até que um elemento seja visível na tela.
     * Uso: quando precisa que o elemento apareça ANTES de interagir.
     */
    public static WebElement waitForVisibility(WebElement element) {
        return new WebDriverWait(DriverManager.getDriver(),
                Duration.ofMillis(AppConstants.DEFAULT_WAIT_MS))
                .until(ExpectedConditions.visibilityOf(element));
    }

    /**
     * Espera até que um elemento seja clicável.
     * Uso: botões — um elemento pode ser visível mas ainda não estar habilitado.
     */
    public static WebElement waitForClickable(WebElement element) {
        return new WebDriverWait(DriverManager.getDriver(),
                Duration.ofMillis(AppConstants.DEFAULT_WAIT_MS))
                .until(ExpectedConditions.elementToBeClickable(element));
    }

    /**
     * Espera até que um elemento NÃO seja mais visível.
     * Uso: loaders, spinners, modais que precisam fechar antes de continuar.
     */
    public static void waitForInvisibility(By locator) {
        new WebDriverWait(DriverManager.getDriver(),
                Duration.ofMillis(AppConstants.DEFAULT_WAIT_MS))
                .until(ExpectedConditions.invisibilityOfElementLocated(locator));
    }

    /**
     * Espera até que o texto de um elemento contenha o valor esperado.
     * Uso: verificar feedback dinâmico como "Copiado!" após clique.
     */
    public static void waitForTextPresent(WebElement element, String text) {
        new WebDriverWait(DriverManager.getDriver(),
                Duration.ofMillis(AppConstants.DEFAULT_WAIT_MS))
                .until(ExpectedConditions.textToBePresentInElement(element, text));
    }

    /**
     * Espera até que uma seção com class "hidden" não tenha mais esse atributo.
     * Uso: seções de resultado, editor e advisor que ficam hidden até ação do usuário.
     */
    public static void waitForSectionVisible(By sectionLocator) {
        new WebDriverWait(DriverManager.getDriver(),
                Duration.ofMillis(AppConstants.DEFAULT_WAIT_MS))
                .until(driver -> {
                    WebElement el = driver.findElement(sectionLocator);
                    String classes = el.getAttribute("class");
                    // Retorna true quando a classe "hidden" não estiver mais presente
                    return classes != null && !classes.contains("hidden");
                });
    }

    /**
     * FluentWait: espera mais sofisticada com polling configurável.
     * Uso: elementos que aparecem de forma intermitente ou com animação.
     * ignoring(NoSuchElementException.class): não lança erro se não achar ainda.
     */
    public static WebElement fluentWait(By locator) {
        return new FluentWait<>(DriverManager.getDriver())
                .withTimeout(Duration.ofMillis(AppConstants.DEFAULT_WAIT_MS))
                .pollingEvery(Duration.ofMillis(AppConstants.POLLING_INTERVAL_MS))
                .ignoring(NoSuchElementException.class)
                .until(driver -> driver.findElement(locator));
    }
}
