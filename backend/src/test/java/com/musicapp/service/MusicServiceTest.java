package com.musicapp.service;

import com.musicapp.client.AudiusClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class MusicServiceTest {

    @Mock
    private AudiusClient audiusClient;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private MusicService musicService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testSearchTracksCacheHit() {
        String query = "test";
        String cacheKey = "music:search:test:20:0";

        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("success", true);

        when(valueOperations.get(cacheKey)).thenReturn(mockResponse);

        Map<String, Object> result = musicService.searchTracks(query, 20, 0);

        assertNotNull(result);
        assertEquals(mockResponse, result);
        verify(audiusClient, never()).get(anyString(), any());
    }

    @Test
    @SuppressWarnings("unchecked")
    public void testSearchTracksCacheMiss() {
        String query = "test";
        String cacheKey = "music:search:test:20:0";
        String apiPath = "/v1/tracks/search?query=test&limit=20&offset=0";

        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("success", true);

        when(valueOperations.get(cacheKey)).thenReturn(null);
        when(audiusClient.get(eq(apiPath), eq(Map.class))).thenReturn(mockResponse);

        Map<String, Object> result = musicService.searchTracks(query, 20, 0);

        assertNotNull(result);
        assertEquals(mockResponse, result);
        verify(audiusClient, times(1)).get(eq(apiPath), eq(Map.class));
        verify(valueOperations, times(1)).set(eq(cacheKey), eq(mockResponse), anyLong(), any());
    }
}
