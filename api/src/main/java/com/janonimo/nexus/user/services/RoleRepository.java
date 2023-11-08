package com.janonimo.nexus.user.services;

import com.janonimo.nexus.user.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    @Override
    Optional<Role> findById(Long aLong);
    @Query(value="""
                   select r from Role
                   r where r.roleName = 'OWNER'
           """)
    Optional<Role> findOwner();

    @Query(value="""
                   select r from Role
                   r where r.roleName = 'CLERK'
           """)
    Optional<Role> findClerk();

    @Query(value="""
                   select r from Role
                   r where r.roleName = 'MANAGER'
           """)
    Optional<Role> findManager();

    @Query(value="""
                   select r from Role
                   r where r.roleName = 'GUEST'
           """)
    Optional<Role> findGuest();

}
