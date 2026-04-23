package com.gt7.utils;

import com.gt7.driver.DriverManager;
import io.qameta.allure.Allure;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;

import java.io.ByteArrayInputStream;

/**
 * ReportUtils — Captura de evidências e logs para o relatório Allure.
 *
 * Em ambientes corporativos, todo teste que falha PRECISA de evidência.
 * O QA precisa mostrar para o desenvolvedor EXATAMENTE o que aconteceu.
 * Screenshots + logs estruturados = comunicação profissional de bugs.
 */
public class ReportUtils {

    /**
     * Captura screenshot e anexa ao relatório Allure.
     * Chamado no @AfterMethod do BaseTest quando um teste falha.
     *
     * @param screenshotName Nome identificador no relatório
     */
    public static void takeScreenshot(String screenshotName) {
        try {
            byte[] screenshot = ((TakesScreenshot) DriverManager.getDriver())
                    .getScreenshotAs(OutputType.BYTES);

            // Allure.addAttachment: adiciona a imagem diretamente no relatório HTML
            Allure.addAttachment(screenshotName,
                    "image/png",
                    new ByteArrayInputStream(screenshot),
                    "png");
        } catch (Exception e) {
            System.err.println("AVISO: Não foi possível capturar screenshot: " + e.getMessage());
        }
    }

    /**
     * Adiciona um passo descritivo no relatório Allure.
     * Uso: documentar cada ação importante do teste para facilitar análise de falhas.
     *
     * @param description Descrição da ação executada
     */
    public static void logStep(String description) {
        Allure.step(description);
        System.out.println("[STEP] " + description);
    }
}
