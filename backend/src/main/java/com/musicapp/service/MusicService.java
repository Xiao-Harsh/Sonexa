package com.musicapp.service;

import com.musicapp.client.AudiusClient;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class MusicService {

    private final AudiusClient audiusClient;
    private final RedisTemplate<String, Object> redisTemplate;

    public MusicService(AudiusClient audiusClient, RedisTemplate<String, Object> redisTemplate) {
        this.audiusClient = audiusClient;
        this.redisTemplate = redisTemplate;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> searchTracks(String query, Integer limit, Integer offset) {
        int finalLimit = (limit != null) ? limit : 20;
        int finalOffset = (offset != null) ? offset : 0;
        String cacheKey = String.format("music:search:%s:%d:%d", query.trim().toLowerCase(), finalLimit, finalOffset);

        try {
            Map<String, Object> cachedData = (Map<String, Object>) redisTemplate.opsForValue().get(cacheKey);
            if (cachedData != null) {
                return cachedData;
            }
        } catch (Exception e) {
            // Redis error fallback
        }

        String path = String.format("/v1/tracks/search?query=%s&limit=%d&offset=%d", query, finalLimit, finalOffset);
        Map<String, Object> apiResponse = audiusClient.get(path, Map.class);
        
        if (apiResponse != null) {
            try {
                redisTemplate.opsForValue().set(cacheKey, apiResponse, 10, TimeUnit.MINUTES);
            } catch (Exception e) {
                // Redis error fallback
            }
        }

        return apiResponse;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getTrendingTracks(String genre, Integer limit, Integer offset) {
        int finalLimit = (limit != null) ? limit : 20;
        int finalOffset = (offset != null) ? offset : 0;
        String genreKey = (genre != null && !genre.isBlank()) ? genre.trim().toLowerCase() : "all";
        String cacheKey = String.format("music:trending:%s:%d:%d", genreKey, finalLimit, finalOffset);

        try {
            Map<String, Object> cachedData = (Map<String, Object>) redisTemplate.opsForValue().get(cacheKey);
            if (cachedData != null) {
                return cachedData;
            }
        } catch (Exception e) {
            // Redis error fallback
        }

        StringBuilder pathBuilder = new StringBuilder("/v1/tracks/trending?");
        if (genre != null && !genre.isBlank()) {
            try {
                String encodedGenre = java.net.URLEncoder.encode(genre, java.nio.charset.StandardCharsets.UTF_8.toString());
                pathBuilder.append("genre=").append(encodedGenre).append("&");
            } catch (Exception e) {
                pathBuilder.append("genre=").append(genre).append("&");
            }
        }
        pathBuilder.append("limit=").append(finalLimit).append("&offset=").append(finalOffset);

        Map<String, Object> apiResponse = audiusClient.get(pathBuilder.toString(), Map.class);

        if (apiResponse != null) {
            try {
                redisTemplate.opsForValue().set(cacheKey, apiResponse, 15, TimeUnit.MINUTES);
            } catch (Exception e) {
                // Redis error fallback
            }
        }

        return apiResponse;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getTrackDetails(String trackId) {
        String cacheKey = "music:track:" + trackId;

        try {
            Map<String, Object> cachedData = (Map<String, Object>) redisTemplate.opsForValue().get(cacheKey);
            if (cachedData != null) {
                return cachedData;
            }
        } catch (Exception e) {
            // Redis error fallback
        }

        String path = "/v1/tracks/" + trackId;
        Map<String, Object> apiResponse = audiusClient.get(path, Map.class);

        if (apiResponse != null) {
            try {
                redisTemplate.opsForValue().set(cacheKey, apiResponse, 60, TimeUnit.MINUTES);
            } catch (Exception e) {
                // Redis error fallback
            }
        }

        return apiResponse;
    }

    public String getStreamUrl(String trackId) {
        return audiusClient.getStreamUrl(trackId);
    }
}
