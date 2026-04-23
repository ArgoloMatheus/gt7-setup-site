package com.gt7.tests;

import com.gt7.base.BaseTest;
import com.gt7.pages.GeneratorPage;
import com.gt7.pages.HomePage;
import com.gt7.pages.SetupResultPage;
import com.gt7.constants.AppConstants;
import com.gt7.utils.ReportUtils;
import io.qameta.allure.*;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * SmokeTest — Testes de sanidade básica.
 *
 * O QUE É UM SMOKE TEST?
 * São os testes mais críticos e rápidos do sistema.
 * Devem responder: "O site está de pé e funcionando minimamente?"
 * Se um Smoke Test falha, não adianta rodar os outros testes.
 * Em CI/CD, o Smoke roda em cada deploy antes dos demais testes.
 *
 * Características:
 * - Rápido (< 2 minutos para toda a suíte smoke)
 * - Cobre apenas o happy path (caminho feliz) mais crítico
 * - Se falhar, bloqueia o pipeline de entrega
 *
 * Anotações Allure:
 * @Epic     → Área de negócio (ex: "Gerador de Setup")
 * @Feature  → Funcionalidade dentro do Epic
 * @Story    → Cenário de usuário específico
 * @Severity → Impacto do teste: BLOCKER > CRITICAL > NORMAL > MINOR > TRIVIAL
 */
@Epic("GT7 Setup Lab")
@Feature("Smoke Tests")
public class SmokeTest extends BaseTest {

    @Test(description = "Verifica se a página carrega e o título está correto", groups = "smoke")
    @Story("Carregamento inicial do site")
    @Severity(SeverityLevel.BLOCKER)
    public void shouldLoadHomePage() {
        ReportUtils.logStep("Abrindo a página inicial");
        HomePage homePage = new HomePage();
        homePage.open();

        ReportUtils.logStep("Verificando visibilidade do logo GT7");
        Assert.assertTrue(homePage.isLogoVisible(),
            "Logo GT7 não está visível — possível falha no carregamento da página");

        ReportUtils.logStep("Verificando texto do título principal");
        String heroTitle = homePage.getHeroTitle();
        Assert.assertTrue(heroTitle.contains(AppConstants.HERO_TITLE_PARTIAL),
            "Título esperado '" + AppConstants.HERO_TITLE_PARTIAL +
            "' não encontrado. Título atual: '" + heroTitle + "'");
    }

    @Test(description = "Fluxo completo: selecionar carro + pista + gerar setup", groups = "smoke")
    @Story("Geração de setup — happy path")
    @Severity(SeverityLevel.BLOCKER)
    public void shouldGenerateSetupSuccessfully() {
        ReportUtils.logStep("Abrindo a página inicial");
        HomePage homePage = new HomePage();
        homePage.open();

        ReportUtils.logStep("Navegando para o gerador");
        homePage.clickNavGenerator();

        ReportUtils.logStep("Selecionando carro: " + AppConstants.CAR_FERRARI_458);
        GeneratorPage generatorPage = new GeneratorPage();
        generatorPage.selectCarByName(AppConstants.CAR_FERRARI_458);

        ReportUtils.logStep("Selecionando pista: " + AppConstants.TRACK_TRIAL_MOUNTAIN);
        generatorPage.selectTrackByName(AppConstants.TRACK_TRIAL_MOUNTAIN);

        ReportUtils.logStep("Verificando que o botão Gerar Setup está habilitado");
        Assert.assertTrue(generatorPage.isGenerateButtonEnabled(),
            "Botão 'Gerar Setup' deve estar habilitado após selecionar carro e pista");

        ReportUtils.logStep("Clicando em Gerar Setup");
        generatorPage.clickGenerate();

        ReportUtils.logStep("Verificando que o resultado está visível");
        SetupResultPage resultPage = new SetupResultPage();
        Assert.assertTrue(resultPage.isVisible(),
            "Seção de resultado não apareceu após clicar em Gerar Setup");

        ReportUtils.logStep("Verificando nota de PP no resultado");
        Assert.assertTrue(resultPage.hasPpNote(),
            "Nota de PP obrigatória não encontrada no resultado");

        ReportUtils.logStep("Verificando nome do carro no resultado");
        Assert.assertTrue(
            resultPage.getResultCarName().contains("Ferrari") ||
            resultPage.getResultCarName().contains("458"),
            "Nome do carro no resultado não corresponde ao selecionado"
        );
    }

    @Test(description = "Botão Gerar Setup deve estar desabilitado sem seleção", groups = "smoke")
    @Story("Validação de estado do botão")
    @Severity(SeverityLevel.CRITICAL)
    public void generateButtonShouldBeDisabledWithoutSelection() {
        ReportUtils.logStep("Abrindo a página e navegando para o gerador");
        HomePage homePage = new HomePage();
        homePage.open();
        homePage.clickNavGenerator();

        ReportUtils.logStep("Verificando que o botão está desabilitado sem seleção");
        GeneratorPage generatorPage = new GeneratorPage();
        Assert.assertFalse(generatorPage.isGenerateButtonEnabled(),
            "Botão 'Gerar Setup' não deveria estar habilitado sem carro e pista selecionados");
    }
}
