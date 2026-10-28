package com.musicapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.musicapp.dto.PlaylistRequest;
import com.musicapp.dto.TrackRequest;
import com.musicapp.entity.Favorite;
import com.musicapp.entity.Playlist;
import com.musicapp.entity.User;
import com.musicapp.repository.FavoriteRepository;
import com.musicapp.repository.ListeningHistoryRepository;
import com.musicapp.repository.PlaylistRepository;
import com.musicapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class LibraryControllerTest {

    @MockBean
    private RedisConnectionFactory redisConnectionFactory;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private FavoriteRepository favoriteRepository;

    @MockBean
    private PlaylistRepository playlistRepository;

    @MockBean
    private ListeningHistoryRepository listeningHistoryRepository;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private User mockUser;

    @BeforeEach
    public void setup() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");
        mockUser.setEmail("test@example.com");
        mockUser.setPasswordHash("encodedHash");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
    }

    @Test
    public void testUnauthorizedWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/library/favorites"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testGetFavoritesEmpty() throws Exception {
        when(favoriteRepository.findByUserOrderByCreatedAtDesc(mockUser)).thenReturn(List.of());

        mockMvc.perform(get("/api/library/favorites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testAddFavoriteSuccess() throws Exception {
        TrackRequest request = new TrackRequest();
        request.setAudiusTrackId("track1");
        request.setTitle("Song 1");
        request.setArtistName("Artist 1");
        request.setDurationSeconds(200);

        when(favoriteRepository.existsByUserAndAudiusTrackId(mockUser, "track1")).thenReturn(false);
        when(favoriteRepository.save(any(Favorite.class))).thenAnswer(i -> i.getArgument(0));

        mockMvc.perform(post("/api/library/favorites")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.audiusTrackId").value("track1"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testDeleteFavorite() throws Exception {
        mockMvc.perform(delete("/api/library/favorites/track1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testCreatePlaylistSuccess() throws Exception {
        PlaylistRequest request = new PlaylistRequest();
        request.setName("My Favorites");

        when(playlistRepository.save(any(Playlist.class))).thenAnswer(i -> {
            Playlist p = i.getArgument(0);
            p.setId(10L);
            return p;
        });

        mockMvc.perform(post("/api/library/playlists")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(10L));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testCreatePlaylistValidation() throws Exception {
        PlaylistRequest request = new PlaylistRequest();
        request.setName(""); // Blank

        mockMvc.perform(post("/api/library/playlists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testGetPlaylistNotFoundReturns404() throws Exception {
        when(playlistRepository.findByIdAndUser(999L, mockUser)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/library/playlists/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testHistoryLogAndGet() throws Exception {
        TrackRequest request = new TrackRequest();
        request.setAudiusTrackId("historyTrack");
        request.setTitle("History Song");
        request.setArtistName("History Artist");
        request.setDurationSeconds(180);

        when(listeningHistoryRepository.findFirstByUserAndAudiusTrackIdOrderByPlayedAtDesc(mockUser, "historyTrack"))
                .thenReturn(Optional.empty());
        when(listeningHistoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        mockMvc.perform(post("/api/library/history")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        when(listeningHistoryRepository.findTop10ByUserOrderByPlayedAtDesc(mockUser)).thenReturn(List.of());
        mockMvc.perform(get("/api/library/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
