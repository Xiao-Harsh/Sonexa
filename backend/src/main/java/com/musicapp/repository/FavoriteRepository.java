package com.musicapp.repository;

import com.musicapp.entity.Favorite;
import com.musicapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserOrderByCreatedAtDesc(User user);
    Optional<Favorite> findByUserAndAudiusTrackId(User user, String audiusTrackId);
    boolean existsByUserAndAudiusTrackId(User user, String audiusTrackId);
    void deleteByUserAndAudiusTrackId(User user, String audiusTrackId);
}
