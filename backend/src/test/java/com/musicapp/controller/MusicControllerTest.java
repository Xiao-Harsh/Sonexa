package com.musicapp.controller;

import com.musicapp.service.MusicService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class MusicControllerTest {

    @MockBean
    private RedisConnectionFactory redisConnectionFactory;

    @MockBean
    private MusicService musicService;

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testStreamTrackRedirect() throws Exception {
        String trackId = "abc12345";
        String expectedRedirectUrl = "https://discoveryprovider.audius.co/v1/tracks/abc12345/stream?app_name=MyWebMusicPlayer";

        when(musicService.getStreamUrl(trackId)).thenReturn(expectedRedirectUrl);

        mockMvc.perform(get("/api/music/track/" + trackId + "/stream"))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", expectedRedirectUrl));
    }

    @Test
    public void testSearchTracks() throws Exception {
        java.util.Map<String, Object> mockData = java.util.Map.of("data", java.util.List.of());
        when(musicService.searchTracks("rock", 10, 0)).thenReturn(mockData);

        mockMvc.perform(get("/api/music/search").param("q", "rock").param("limit", "10").param("offset", "0"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.success").value(true));
    }

    @Test
    public void testTrendingTracks() throws Exception {
        java.util.Map<String, Object> mockData = java.util.Map.of("data", java.util.List.of());
        when(musicService.getTrendingTracks(null, null, null)).thenReturn(mockData);

        mockMvc.perform(get("/api/music/trending"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.success").value(true));
    }

    @Test
    public void testTrackDetails() throws Exception {
        java.util.Map<String, Object> mockData = java.util.Map.of("id", "track123", "title", "Test Song");
        when(musicService.getTrackDetails("track123")).thenReturn(mockData);

        mockMvc.perform(get("/api/music/track/track123"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.success").value(true))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.data.id").value("track123"));
    }
}
