package com.gt7.base;

import com.gt7.driver.DriverManager;
import com.gt7.utils.ReportUtils;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

/**
 * BaseTest — Classe pai de todos os testes.
 *
 * Responsabilidades:
 * 1. Inicializar o WebDriver antes de cada teste (@BeforeMethod)
 * 2. Capturar screenshot e encerrar o driver após cada teste (@AfterMethod)
 *
 * POR QUÊ @BeforeMethod e não @BeforeSuite?
 * - @BeforeSuite roda 1x para todos os testes — o mesmo browser para tudo.
 *   Risco: estado sujo entre testes (cookies, histórico, estado da UI).
 * - @BeforeMethod cria um browser novo para cada teste.
 *   Cada teste é ISOLADO e INDEPENDENTE — padrão obrigatório em QA corporativo.
 */
public class BaseTest {

    @BeforeMethod(alwaysRun = true)
    public void setUp(java.lang.reflect.Method method) {
        // Loga o nome do teste iniciando — útil para análise de logs em CI
        System.out.println("\n====================================================");
        System.out.println("INICIANDO TESTE: " + method.getName());
        System.out.println("====================================================");

        DriverManager.initDriver();
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown(ITestResult result) {
        // ITestResult: objeto do TestNG com informações sobre o resultado do teste

        if (result.getStatus() == ITestResult.FAILURE) {
            // Teste FALHOU: captura screenshot como evidência
            String screenshotName = "FALHA_" + result.getName();
            ReportUtils.takeScreenshot(screenshotName);
            System.err.println("TESTE FALHOU: " + result.getName());
            System.err.println("Motivo: " + result.getThrowable().getMessage());
        } else if (result.getStatus() == ITestResult.SUCCESS) {
            System.out.println("TESTE PASSOU: " + result.getName());
        } else if (result.getStatus() == ITestResult.SKIP) {
            System.out.println("TESTE PULADO: " + result.getName());
        }

        // Encerra o driver SEMPRE — independente do resultado
        // alwaysRun = true no @AfterMethod garante execução mesmo após falha
        DriverManager.quitDriver();
    }
}
