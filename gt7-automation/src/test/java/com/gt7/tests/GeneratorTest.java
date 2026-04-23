package com.gt7.tests;

import com.gt7.base.BaseTest;
import com.gt7.constants.AppConstants;
import com.gt7.data.SetupDataProvider;
import com.gt7.pages.*;
import com.gt7.utils.ReportUtils;
import io.qameta.allure.*;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * GeneratorTest — Testes funcionais completos do gerador.
 *
 * DIFERENÇA ENTRE SMOKE E FUNCIONAL:
 * - Smoke: "isso funciona?" (binário, rápido)
 * - Funcional: "isso funciona CORRETAMENTE em todos os cenários?" (detalhado)
 *
 * TESTES PARAMETRIZADOS com @DataProvider:
 * Em vez de escrever um teste por carro/pista, o DataProvider alimenta
 * o mesmo teste com múltiplas combinações de dados.
 * Isso é fundamental em QA corporativo — elimina duplicação de código.
 */
@Epic("GT7 Setup Lab")
@Feature("Gerador de Setup")
public class GeneratorTest extends BaseTest {

    /**
     * Testa o gerador com múltiplas combinações de carro + pista.
     * O @DataProvider "carTrackCombinations" fornece os dados.
     * TestNG executa este método uma vez para cada linha do DataProvider.
     */
    @Test(
        dataProvider = "carTrackCombinations",
        dataProviderClass = SetupDataProvider.class,
        description = "Verifica geração de setup para múltiplas combinações carro/pista"
    )
    @Story("Geração parametrizada por carro e pista")
    @Severity(SeverityLevel.NORMAL)
    public void shouldGenerateSetupForAllCombinations(String carName, String trackName) {
        ReportUtils.logStep("Testando: " + carName + " @ " + trackName);

        HomePage homePage = new HomePage();
        homePage.open();
        homePage.clickNavGenerator();

        GeneratorPage generatorPage = new GeneratorPage();
        generatorPage.selectCarByName(carName);
        generatorPage.selectTrackByName(trackName);
        generatorPage.clickGenerate();

        SetupResultPage resultPage = new SetupResultPage();

        Assert.assertTrue(resultPage.isVisible(),
            "Resultado não apareceu para: " + carName + " @ " + trackName);

        Assert.assertTrue(resultPage.hasPpNote(),
            "Nota de PP não encontrada para: " + carName + " @ " + trackName);
    }

    @Test(description = "Slider de velocidade deve atualizar o display em tempo real")
    @Story("Interação com slider de velocidade")
    @Severity(SeverityLevel.NORMAL)
    public void shouldUpdateSpeedDisplayOnSliderChange() {
        ReportUtils.logStep("Abrindo o gerador");
        new HomePage().open();

        GeneratorPage generatorPage = new GeneratorPage();

        ReportUtils.logStep("Ajustando slider para 350 km/h");
        generatorPage.setTopSpeed(350);

        ReportUtils.logStep("Verificando atualização do display");
        String displayValue = generatorPage.getTopSpeedDisplayValue();
        Assert.assertTrue(displayValue.contains("350"),
            "Display de velocidade não atualizou. Valor atual: " + displayValue);
    }

    @Test(description = "Setups de carro RR e FF devem ser diferentes na mesma pista")
    @Story("Diferenciação de setup por tipo de tração")
    @Severity(SeverityLevel.CRITICAL)
    public void rrAndFfCarsShouldProduceDifferentSetups() {
        // TESTE DE REGRA DE NEGÓCIO CRÍTICA:
        // Um setup "tamanho único" é o principal defeito que o app deve evitar.
        // Este teste garante que a lógica de cálculo diferencia os tipos de tração.

        GeneratorPage generatorPage = new GeneratorPage();
        SetupResultPage resultPage   = new SetupResultPage();

        ReportUtils.logStep("Gerando setup para carro RR (Porsche 911)");
        new HomePage().open();
        generatorPage.selectCarByName(AppConstants.CAR_PORSCHE_911);
        generatorPage.selectTrackByName(AppConstants.TRACK_TRIAL_MOUNTAIN);
        generatorPage.clickGenerate();
        String tipRR = resultPage.getDriverTip();

        ReportUtils.logStep("Gerando setup para carro FF (Mégane)");
        new HomePage().open();
        generatorPage.selectCarByName(AppConstants.CAR_MEGANE);
        generatorPage.selectTrackByName(AppConstants.TRACK_TRIAL_MOUNTAIN);
        generatorPage.clickGenerate();
        String tipFF = resultPage.getDriverTip();

        ReportUtils.logStep("Verificando que as dicas de pilotagem são diferentes");
        Assert.assertNotEquals(tipRR, tipFF,
            "DEFEITO CRÍTICO: Dicas de pilotagem para RR e FF são idênticas. " +
            "O engine.js não está diferenciando tipos de tração.");
    }

    @Test(description = "Botão 'Copiar Setup' deve mudar texto para confirmação")
    @Story("Feedback visual ao copiar setup")
    @Severity(SeverityLevel.MINOR)
    public void copyButtonShouldShowConfirmationText() {
        ReportUtils.logStep("Gerando um setup completo");
        new HomePage().open();

        GeneratorPage generatorPage = new GeneratorPage();
        generatorPage.selectCarByName(AppConstants.CAR_FERRARI_458);
        generatorPage.selectTrackByName(AppConstants.TRACK_SPA);
        generatorPage.clickGenerate();

        SetupResultPage resultPage = new SetupResultPage();
        ReportUtils.logStep("Clicando em Copiar Setup");
        resultPage.clickCopySetup();

        ReportUtils.logStep("Verificando texto de confirmação");
        Assert.assertTrue(
            resultPage.getCopyButtonText().contains(AppConstants.COPY_BTN_SUCCESS),
            "Texto de confirmação 'Copiado!' não apareceu após clique"
        );
    }
}
