package com.seaport.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ParteProcedimento {
    ADM("Administração - Procedimentos Sistêmicos"),
    COM("Companhia - Procedimentos Sistêmicos"),
    EMB("Embarcação - Procedimentos Operacionais"),
    SMS("Segurança, Meio Ambiente e Saúde Ocupacional"),
    EME("Emergências - Procedimentos Operacionais");

    private final String descricao;
}
