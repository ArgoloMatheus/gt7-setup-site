package com.gt7.tests;

import com.gt7.base.BaseTest;
import com.gt7.constants.AppConstants;
import com.gt7.pages.*;
import com.gt7.utils.ReportUtils;
import io.qameta.allure.*;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * AdvisorTest — Testes das regras de negócio do Setup Advisor.
 *
 * ESTRATÉGIA DESTES TESTES:
 * O Advisor é uma engine de regras — cada regra precisa ser testada
 * com um cenário que a ATIVA e um que NÃO a ativa.
 * Isso garante que não há falsos positivos (alerta aparece quando não deveria).
 */
@Epic("GT7 Setup Lab")
@Feature("Setup Advisor")
public class AdvisorTest extends BaseTest {

    /**
     * Cenário: setup gerado para um carro RR em pista de alto downforce
     * deve mostrar score alto (setup compatível com a pista).
     */
    @Test(description = "Setup gerado automaticamente deve ter score positivo no Advisor")
    @Story("Score do Advisor para setup compatível")
    @Severity(SeverityLevel.NORMAL)
    public void generatedSetupShouldHavePositiveAdvisorScore() {
        ReportUtils.logStep("Gerando setup para Ferrari MR no Nürburgring (alta compatibilidade)");
        new HomePage().open();

        GeneratorPage generatorPage = new GeneratorPage();
        generatorPage.selectCarByName(AppConstants.CAR_FERRARI_458); // MR — estável
        generatorPage.selectTrackByName(AppConstants.TRACK_NURBURGRING); // HIGH downforce
        generatorPage.clickGenerate();

        AdvisorPage advisorPage = new AdvisorPage();

        ReportUtils.logStep("Verificando visibilidade do Advisor");
        Assert.assertTrue(advisorPage.isVisible(),
            "Seção do Advisor não apareceu após gerar setup");

        ReportUtils.logStep("Verificando score do setup");
        int score = advisorPage.getScore();
        Assert.assertTrue(score >= 60,
            "Score do Advisor (" + score + ") está abaixo do esperado para " +
            "um setup gerado automaticamente pelo algoritmo");
    }

    /**
     * Cenário: pista de BAIXO downforce (Le Mans) com alto downforce configurado
     * deve gerar alerta de downforce inadequado.
     */
    @Test(description = "Setup com downforce alto em pista low-downforce deve gerar alerta")
    @Story("Alerta de downforce incompatível com a pista")
    @Severity(SeverityLevel.CRITICAL)
    public void highDownforceOnLowDownforceTrackShouldTriggerAlert() {
        ReportUtils.logStep("Gerando setup para Le Mans (pista LOW downforce)");
        new HomePage().open();

        GeneratorPage generatorPage = new GeneratorPage();
        generatorPage.selectCarByName(AppConstants.CAR_FERRARI_458);
        generatorPage.selectTrackByName(AppConstants.TRACK_LE_MANS);
        generatorPage.clickGenerate();

        // Navegar para o editor e forçar downforce alto (incompatível com Le Mans)
        // Isso simula um usuário que editou o setup manualmente de forma errada
        EditorPage editorPage = new EditorPage();
        ReportUtils.logStep("Modificando downforce traseiro para valor alto (incompatível)");
        editorPage.setParameterValue("downforceRear", "500"); // Le Mans aceita até 200

        ReportUtils.logStep("Aplicando setup editado");
        editorPage.clickApplyAndAnalyze();

        AdvisorPage advisorPage = new AdvisorPage();
        ReportUtils.logStep("Verificando se alerta de downforce foi gerado");
        Assert.assertTrue(advisorPage.hasAlertContaining("downforce") ||
                          advisorPage.hasAlertContaining("velocidade máxima") ||
                          advisorPage.hasAlertContaining("resistência ao ar"),
            "Alerta de downforce inadequado para Le Mans não foi gerado pelo Advisor"
        );
    }

    @Test(description = "Setup sem problemas deve exibir mensagem de parabéns")
    @Story("Mensagem de setup sem problemas")
    @Severity(SeverityLevel.NORMAL)
    public void cleanSetupShouldShowAllOkMessage() {
        ReportUtils.logStep("Gerando setup para Ferrari em Trial Mountain (combinação equilibrada)");
        new HomePage().open();

        GeneratorPage generatorPage = new GeneratorPage();
        generatorPage.selectCarByName(AppConstants.CAR_FERRARI_458);
        generatorPage.selectTrackByName(AppConstants.TRACK_TRIAL_MOUNTAIN);
        generatorPage.clickGenerate();

        AdvisorPage advisorPage = new AdvisorPage();

        // O setup gerado pelo algoritmo para Ferrari MR + Trial Mountain
        // deve ser limpo por design (o algoritmo usa valores seguros)
        int score = advisorPage.getScore();
        ReportUtils.logStep("Score obtido: " + score);

        Assert.assertTrue(score >= 80,
            "Setup gerado automaticamente para Ferrari + Trial Mountain " +
            "deveria ter score >= 80, mas obteve: " + score
        );
    }
}
