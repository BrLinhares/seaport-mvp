package com.seaport.config;

/**
 * @deprecated Substituído por {@link DataInitializer}.
 * O admin master é criado automaticamente pelo DataInitializer (seedAdminUser @Order(2)).
 * Esta classe foi esvaziada para evitar a criação de um segundo admin duplicado
 * (admin@seaport.com) que conflitava com o admin principal (admin@seaport.com.br).
 */
public class SetupDataLoader {
    // Intencionalmente vazio.
}
