package com.musicapp.controller;

import com.musicapp.dto.PlaylistRequest;
import com.musicapp.dto.TrackRequest;
import com.musicapp.entity.Favorite;
import com.musicapp.entity.ListeningHistory;
import com.musicapp.entity.Playlist;
import com.musicapp.entity.PlaylistTrack;
import com.musicapp.entity.User;
import com.musicapp.repository.FavoriteRepository;
import com.musicapp.repository.ListeningHistoryRepository;
import com.musicapp.repository.PlaylistRepository;
import com.musicapp.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final PlaylistRepository playlistRepository;
    private final ListeningHistoryRepository listeningHistoryRepository;

    public LibraryController(UserRepository userRepository,
                             FavoriteRepository favoriteRepository,
                             PlaylistRepository playlistRepository,
                             ListeningHistoryRepository listeningHistoryRepository) {
        this.userRepository = userRepository;
        this.favoriteRepository = favoriteRepository;
        this.playlistRepository = playlistRepository;
        this.listeningHistoryRepository = listeningHistoryRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    private Map<String, Object> buildSuccessResponse(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("error", null);
        return response;
    }

    @GetMapping("/favorites")
    public ResponseEntity<Map<String, Object>> getFavorites() {
        User user = getCurrentUser();
        List<Favorite> favorites = favoriteRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(buildSuccessResponse(favorites));
    }

    @PostMapping("/favorites")
    @Transactional
    public ResponseEntity<Map<String, Object>> addFavorite(@Valid @RequestBody TrackRequest request) {
        User user = getCurrentUser();
        if (favoriteRepository.existsByUserAndAudiusTrackId(user, request.getAudiusTrackId())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", Map.of("message", "Track already favorited")));
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setAudiusTrackId(request.getAudiusTrackId());
        favorite.setTitle(request.getTitle());
        favorite.setArtistName(request.getArtistName());
        favorite.setDurationSeconds(request.getDurationSeconds());
        favorite.setCoverArtUrl(request.getCoverArtUrl());

        Favorite saved = favoriteRepository.save(favorite);
        return ResponseEntity.ok(buildSuccessResponse(saved));
    }

    @DeleteMapping("/favorites/{trackId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> removeFavorite(@PathVariable String trackId) {
        User user = getCurrentUser();
        favoriteRepository.deleteByUserAndAudiusTrackId(user, trackId);
        return ResponseEntity.ok(buildSuccessResponse("Favorite removed successfully"));
    }

    @GetMapping("/playlists")
    public ResponseEntity<Map<String, Object>> getPlaylists() {
        User user = getCurrentUser();
        List<Playlist> playlists = playlistRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(buildSuccessResponse(playlists));
    }

    @PostMapping("/playlists")
    @Transactional
    public ResponseEntity<Map<String, Object>> createPlaylist(@Valid @RequestBody PlaylistRequest request) {
        User user = getCurrentUser();
        Playlist playlist = new Playlist();
        playlist.setUser(user);
        playlist.setName(request.getName());

        Playlist saved = playlistRepository.save(playlist);
        return ResponseEntity.ok(buildSuccessResponse(saved));
    }

    @GetMapping("/playlists/{id}")
    public ResponseEntity<Map<String, Object>> getPlaylistDetails(@PathVariable Long id) {
        User user = getCurrentUser();
        Playlist playlist = playlistRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        return ResponseEntity.ok(buildSuccessResponse(playlist));
    }

    @PutMapping("/playlists/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> renamePlaylist(@PathVariable Long id, @Valid @RequestBody PlaylistRequest request) {
        User user = getCurrentUser();
        Playlist playlist = playlistRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        playlist.setName(request.getName());
        Playlist saved = playlistRepository.save(playlist);
        return ResponseEntity.ok(buildSuccessResponse(saved));
    }

    @DeleteMapping("/playlists/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deletePlaylist(@PathVariable Long id) {
        User user = getCurrentUser();
        Playlist playlist = playlistRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        playlistRepository.delete(playlist);
        return ResponseEntity.ok(buildSuccessResponse("Playlist deleted successfully"));
    }

    @PostMapping("/playlists/{id}/tracks")
    @Transactional
    public ResponseEntity<Map<String, Object>> addTrackToPlaylist(@PathVariable Long id, @Valid @RequestBody TrackRequest request) {
        User user = getCurrentUser();
        Playlist playlist = playlistRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        boolean alreadyExists = playlist.getTracks().stream()
                .anyMatch(t -> t.getAudiusTrackId().equals(request.getAudiusTrackId()));
        if (alreadyExists) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", Map.of("message", "Track already in playlist")));
        }

        PlaylistTrack track = new PlaylistTrack();
        track.setPlaylist(playlist);
        track.setAudiusTrackId(request.getAudiusTrackId());
        track.setTitle(request.getTitle());
        track.setArtistName(request.getArtistName());
        track.setDurationSeconds(request.getDurationSeconds());
        track.setCoverArtUrl(request.getCoverArtUrl());
        track.setPosition(playlist.getTracks().size() + 1);

        playlist.getTracks().add(track);
        Playlist saved = playlistRepository.save(playlist);
        return ResponseEntity.ok(buildSuccessResponse(saved));
    }

    @DeleteMapping("/playlists/{id}/tracks/{trackId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> removeTrackFromPlaylist(@PathVariable Long id, @PathVariable String trackId) {
        User user = getCurrentUser();
        Playlist playlist = playlistRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        boolean removed = playlist.getTracks().removeIf(t -> t.getAudiusTrackId().equals(trackId));
        if (removed) {
            for (int i = 0; i < playlist.getTracks().size(); i++) {
                playlist.getTracks().get(i).setPosition(i + 1);
            }
            playlistRepository.save(playlist);
            return ResponseEntity.ok(buildSuccessResponse("Track removed and playlist reordered"));
        }

        return ResponseEntity.badRequest().body(Map.of("success", false, "error", Map.of("message", "Track not found in playlist")));
    }

    // --- LISTENING HISTORY ---

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getHistory() {
        User user = getCurrentUser();
        List<ListeningHistory> history = listeningHistoryRepository.findTop10ByUserOrderByPlayedAtDesc(user);
        return ResponseEntity.ok(buildSuccessResponse(history));
    }

    @PostMapping("/history")
    @Transactional
    public ResponseEntity<Map<String, Object>> logHistory(@Valid @RequestBody TrackRequest request) {
        User user = getCurrentUser();
        ListeningHistory history = new ListeningHistory();
        history.setUser(user);
        history.setAudiusTrackId(request.getAudiusTrackId());
        history.setTitle(request.getTitle());
        history.setArtistName(request.getArtistName());
        history.setDurationSeconds(request.getDurationSeconds());
        history.setCoverArtUrl(request.getCoverArtUrl());

        ListeningHistory saved = listeningHistoryRepository.save(history);
        return ResponseEntity.ok(buildSuccessResponse(saved));
    }
}
