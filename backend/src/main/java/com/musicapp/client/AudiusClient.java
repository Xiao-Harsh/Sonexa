package com.musicapp.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Component
public class AudiusClient {

    private static final Logger log = LoggerFactory.getLogger(AudiusClient.class);
    private static final String REDIS_KEY = "audius:healthy-nodes";

    private final RestTemplate restTemplate;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Value("${audius.app-name:MyWebMusicPlayer}")
    private String appName;

    public AudiusClient(RestTemplate restTemplate, RedisTemplate<String, Object> redisTemplate) {
        this.restTemplate = restTemplate;
        this.redisTemplate = redisTemplate;
    }

    private List<String> getNodesPool() {
        List<String> nodes = new ArrayList<>();
        try {
            List<Object> rawNodes = redisTemplate.opsForList().range(REDIS_KEY, 0, -1);
            if (rawNodes != null && !rawNodes.isEmpty()) {
                for (Object obj : rawNodes) {
                    nodes.add(obj.toString());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to retrieve healthy nodes from Redis: {} - Using default bootstrap nodes", e.getMessage());
        }
        
        if (nodes.isEmpty()) {
            nodes.add("https://discoveryprovider.audius.co");
            nodes.add("https://creatornode2.audius.co");
            nodes.add("https://audius-dp.net.ua");
        }
        return nodes;
    }

    public <T> T get(String path, Class<T> responseType) {
        List<String> nodes = getNodesPool();
        String separator = path.contains("?") ? "&" : "?";
        String pathWithApp = path + separator + "app_name=" + appName;

        for (int i = 0; i < nodes.size(); i++) {
            String node = nodes.get(i);
            String url = node + pathWithApp;
            try {
                T result = restTemplate.getForObject(url, responseType);
                if (result != null) {
                    return result;
                }
            } catch (Exception e) {
                log.error("Failed to query Audius node [{}], error: {}. Attempting failover...", node, e.getMessage());
            }
        }

        throw new RuntimeException("All healthy Audius nodes failed to respond. Audius network is currently unreachable.");
    }

    public String getStreamUrl(String trackId) {
        List<String> nodes = getNodesPool();
        String node = nodes.get(0);
        return String.format("%s/v1/tracks/%s/stream?app_name=%s", node, trackId, appName);
    }
}
