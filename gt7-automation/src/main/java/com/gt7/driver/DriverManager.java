package com.gt7.driver;

import com.gt7.config.ConfigReader;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.time.Duration;

/**
 * DriverManager — Gerencia o ciclo de vida do WebDriver.
 *
 * POR QUÊ centralizar o WebDriver aqui?
 * - ThreadLocal<WebDriver>: cada thread de teste tem seu próprio driver.
 *   Isso é ESSENCIAL para execução paralela (vários testes ao mesmo tempo).
 *   Sem ThreadLocal, threads diferentes sobrescreveriam o driver uma da outra.
 *
 * - Factory Method Pattern: um método cria o driver certo baseado na config,
 *   sem que os testes precisem saber qual navegador está sendo usado.
 */
public class DriverManager {

    /*
     * ThreadLocal: armazena uma instância separada do WebDriver por thread.
     * Em execução paralela (3 testes ao mesmo tempo = 3 threads = 3 browsers).
     */
    private static final ThreadLocal<WebDriver> driverThreadLocal = new ThreadLocal<>();

    /**
     * Inicializa o WebDriver conforme o browser configurado.
     * Chamado uma vez por teste no @BeforeMethod do BaseTest.
     */
    public static void initDriver() {
        String browser = ConfigReader.getBrowser().toLowerCase();
        WebDriver driver;

        switch (browser) {
            case "chrome":
                driver = createChromeDriver();
                break;
            case "firefox":
                driver = createFirefoxDriver();
                break;
            default:
                throw new IllegalArgumentException(
                    "Browser '" + browser + "' não suportado. Use: chrome | firefox"
                );
        }

        // Configura timeouts globais do driver
        driver.manage().timeouts()
              .implicitlyWait(Duration.ofSeconds(ConfigReader.getExplicitWait()));

        // Maximiza a janela conforme config
        driver.manage().window().setSize(
            new org.openqa.selenium.Dimension(
                ConfigReader.getBrowserWidth(),
                ConfigReader.getBrowserHeight()
            )
        );

        // Armazena o driver na thread atual
        driverThreadLocal.set(driver);
    }

    private static WebDriver createChromeDriver() {
        // WebDriverManager baixa e configura o chromedriver automaticamente.
        // Em ambientes corporativos sem internet, o .driverVersion() pode apontar
        // para um driver local.
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();

        if (ConfigReader.isHeadless()) {
            // Headless: roda sem interface gráfica. Obrigatório em servidores CI.
            options.addArguments("--headless=new");
        }

        // Argumentos padrão para estabilidade em ambientes corporativos
        options.addArguments("--no-sandbox");              // Necessário em Docker/Linux
        options.addArguments("--disable-dev-shm-usage");  // Evita crash por falta de memória
        options.addArguments("--disable-gpu");            // Recomendado no headless
        options.addArguments("--window-size=1440,900");

        return new ChromeDriver(options);
    }

    private static WebDriver createFirefoxDriver() {
        WebDriverManager.firefoxdriver().setup();

        FirefoxOptions options = new FirefoxOptions();
        if (ConfigReader.isHeadless()) {
            options.addArguments("-headless");
        }

        return new FirefoxDriver(options);
    }

    /**
     * Retorna o WebDriver da thread atual.
     * Chamado pelas Pages e pelo BaseTest para interagir com o browser.
     */
    public static WebDriver getDriver() {
        WebDriver driver = driverThreadLocal.get();
        if (driver == null) {
            throw new IllegalStateException(
                "WebDriver não foi inicializado. " +
                "Certifique-se de que initDriver() foi chamado no @BeforeMethod."
            );
        }
        return driver;
    }

    /**
     * Encerra o WebDriver e remove da thread.
     * Chamado no @AfterMethod do BaseTest — SEMPRE, mesmo se o teste falhar.
     */
    public static void quitDriver() {
        WebDriver driver = driverThreadLocal.get();
        if (driver != null) {
            driver.quit();               // Fecha o browser e encerra o processo
            driverThreadLocal.remove();  // Limpa a referência — evita memory leak
        }
    }
}
