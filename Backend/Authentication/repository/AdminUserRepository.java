package org.mm.FinanceTracker.Authentication.repository;

import org.mm.FinanceTracker.Authentication.model.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    @Query("SELECT CASE WHEN COUNT(au) > 0 THEN true ELSE false END FROM AdminUser au WHERE au.userId = :userId")
    boolean isUserAdmin(@Param("userId") Long userId);
}
