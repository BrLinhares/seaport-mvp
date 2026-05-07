package com.seaport.repository;


import com.seaport.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByEmbarcacaoId(Long embarcacaoId);

    /**
     * Carrega o usuário junto com a embarcação (LEFT JOIN FETCH).
     * Necessário para acessar user.getEmbarcacao() fora de uma transação,
     * já que a associação é LAZY e open-in-view está desabilitado.
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.embarcacao WHERE u.email = :email")
    Optional<User> findByEmailFetchEmbarcacao(@Param("email") String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.embarcacao WHERE u.id = :id")
    Optional<User> findByIdFetchEmbarcacao(@Param("id") Long id);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.embarcacao ORDER BY u.createdAt ASC")
    List<User> findAllFetchEmbarcacao();
}
