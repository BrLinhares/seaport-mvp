package com.seaport.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Turno {
    TURNO_1("Turno 1"),
    TURNO_2("Turno 2"),
    TURNO_3("Turno 3");

    private final String descricao;
}
