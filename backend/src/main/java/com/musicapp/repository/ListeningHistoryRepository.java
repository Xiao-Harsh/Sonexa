package com.musicapp.repository;

import com.musicapp.entity.ListeningHistory;
import com.musicapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListeningHistoryRepository extends JpaRepository<ListeningHistory, Long> {
    List<ListeningHistory> findTop10ByUserOrderByPlayedAtDesc(User user);
    Optional<ListeningHistory> findFirstByUserAndAudiusTrackIdOrderByPlayedAtDesc(User user, String audiusTrackId);
}
