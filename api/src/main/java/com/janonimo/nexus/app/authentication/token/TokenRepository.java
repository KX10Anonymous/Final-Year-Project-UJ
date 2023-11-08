package com.janonimo.nexus.app.authentication.token;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TokenRepository extends JpaRepository<Token, Long> {

    @Query(value = """
      select t from Token t inner join User u\s
      on t.user.Id = u.Id\s
      where u.Id = :id and (t.expired = false or t.revoked = false)  and t.device =:device \s
      """)
    List<Token> findAllValidDeviceTokenByUser(int id, String device);

    @Query(value = """
      select t from Token t inner join User u\s
      on t.user.Id = u.Id\s
      where u.Id = :id and (t.expired = false or t.revoked = false)\s
      """)
    List<Token> findAllValidTokenByUser(int id);

    @Query("""
    select t from Token t where (t.device =:device and t.token =:token)
""")
    Optional<Token> findByDeviceToken(String device, String token);

    Optional<Token> findByToken(String token);

}
