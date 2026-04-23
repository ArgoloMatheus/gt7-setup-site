package com.gt7.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * ConfigReader — Lê o arquivo config.properties e expõe os valores.
 *
 * POR QUÊ usar um leitor de propriedades?
 * - Separa configuração de código (princípio de separação de responsabilidades).
 * - Em pipelines CI/CD, as propriedades são sobrescritas via variáveis de ambiente
 *   (ex: -Dbase.url=https://staging.site.com no comando mvn test).
 *
 * Padrão usado: Singleton — uma única instância do Properties para toda a execução.
 */
public class ConfigReader {

    private static Properties properties;

    // Bloco estático: executado UMA vez quando a classe é carregada pela JVM.
    // Garante que o arquivo seja lido apenas uma vez durante a execução dos testes.
    static {
        properties = new Properties();
        try (InputStream input = ConfigReader.class
                .getClassLoader()
                .getResourceAsStream("config.properties")) {

            if (input == null) {
                throw new RuntimeException(
                    "ERRO: config.properties não encontrado em src/test/resources/. " +
                    "Verifique se o arquivo existe."
                );
            }
            properties.load(input);

        } catch (IOException e) {
            throw new RuntimeException("Falha ao carregar config.properties: " + e.getMessage());
        }
    }

    /**
     * Retorna o valor de uma propriedade pelo nome da chave.
     * Lança exceção se a chave não existir — falha rápida é melhor que NullPointerException.
     */
    public static String get(String key) {
        String value = properties.getProperty(key);
        if (value == null || value.isEmpty()) {
            throw new RuntimeException(
                "Propriedade '" + key + "' não encontrada em config.properties."
            );
        }
        return value.trim();
    }

    public static String getBaseUrl()      { return get("base.url"); }
    public static String getBrowser()      { return get("browser"); }
    public static boolean isHeadless()     { return Boolean.parseBoolean(get("headless")); }
    public static int getExplicitWait()    { return Integer.parseInt(get("explicit.wait")); }
    public static int getBrowserWidth()    { return Integer.parseInt(get("browser.width")); }
    public static int getBrowserHeight()   { return Integer.parseInt(get("browser.height")); }
}
