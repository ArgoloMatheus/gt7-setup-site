package com.gt7.data;

import com.gt7.constants.AppConstants;
import org.testng.annotations.DataProvider;

/**
 * SetupDataProvider — Fornece dados para testes parametrizados.
 *
 * POR QUÊ DataProvider?
 * - DRY (Don't Repeat Yourself): um método de teste, múltiplos cenários.
 * - Em times corporativos, novos cenários são adicionados aqui sem
 *   criar novos métodos de teste — manutenção centralizada.
 * - O relatório Allure mostra cada combinação de dados separadamente.
 *
 * Retorna Object[][]: cada Object[] interno é um conjunto de parâmetros
 * para uma execução do teste.
 */
public class SetupDataProvider {

    @DataProvider(name = "carTrackCombinations")
    public static Object[][] carTrackCombinations() {
        return new Object[][] {
            // { carro, pista }
            // Cobrir todos os tipos de tração com diferentes perfis de pista
            { AppConstants.CAR_PORSCHE_911,   AppConstants.TRACK_TRIAL_MOUNTAIN  }, // RR + MEDIUM
            { AppConstants.CAR_FERRARI_458,   AppConstants.TRACK_NURBURGRING     }, // MR + HIGH
            { AppConstants.CAR_MEGANE,        AppConstants.TRACK_SARDEGNA        }, // FF + LOW
            { AppConstants.CAR_SUBARU_WRX,    AppConstants.TRACK_SPA             }, // 4WD + HIGH
            { AppConstants.CAR_LAMBORGHINI,   AppConstants.TRACK_LE_MANS         }, // MR + LOW
        };
    }

    @DataProvider(name = "topSpeedValues")
    public static Object[][] topSpeedValues() {
        // Valores de velocidade para testar o slider
        return new Object[][] {
            { 150, "150" },   // Valor mínimo
            { 250, "250" },   // Valor padrão
            { 350, "350" },   // Alta velocidade
            { 400, "400" },   // Valor máximo
        };
    }
}
