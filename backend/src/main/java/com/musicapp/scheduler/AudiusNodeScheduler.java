package com.musicapp.scheduler;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class AudiusNodeScheduler {

    private static final Logger log = LoggerFactory.getLogger(AudiusNodeScheduler.class);
    private static final String BOOTSTRAP_URL = "https://api.audius.co";
    private static final String REDIS_KEY = "audius:healthy-nodes";

    private final RestTemplate restTemplate;
    private final RedisTemplate<String, Object> redisTemplate;

    public AudiusNodeScheduler(RestTemplate restTemplate, RedisTemplate<String, Object> redisTemplate) {
        this.restTemplate = restTemplate;
        this.redisTemplate = redisTemplate;
    }

    @PostConstruct
    public void init() {
        refreshNodePool();
    }

    @Scheduled(fixedRate = 1800000)
    public void refreshNodePool() {
        log.info("Refreshing Audius healthy node pool...");
        try {
            Map<String, Object> response = restTemplate.getForObject(BOOTSTRAP_URL, Map.class);
            if (response != null && response.containsKey("data")) {
                @SuppressWarnings("unchecked")
                List<String> rawNodes = (List<String>) response.get("data");
                List<String> httpsNodes = new ArrayList<>();

                for (String node : rawNodes) {
                    if (node.startsWith("https://")) {
                        httpsNodes.add(node);
                    }
                }

                if (!httpsNodes.isEmpty()) {
                    try {
                        redisTemplate.delete(REDIS_KEY);
                        redisTemplate.opsForList().rightPushAll(REDIS_KEY, httpsNodes.toArray());
                        log.info("Successfully updated Redis with {} healthy HTTPS discovery nodes", httpsNodes.size());
                        if (httpsNodes.size() < 3) {
                            log.warn("ALERT: Low healthy Audius discovery nodes pool count ({} healthy nodes). Monitoring recommended.", httpsNodes.size());
                        }
                    } catch (Exception re) {
                        log.error("Failed to update Redis list: {}", re.getMessage());
                    }
                } else {
                    log.error("CRITICAL ALERT: Bootstrap returned ZERO healthy HTTPS discovery nodes. Network connection compromised.");
                }
            } else {
                log.error("ALERT: Received null or invalid response from Audius bootstrap URL");
            }
        } catch (Exception e) {
            log.error("ALERT: Failed to query Audius bootstrap URL. Network check failed: {}", e.getMessage());
            try {
                Long size = redisTemplate.opsForList().size(REDIS_KEY);
                if (size == null || size == 0) {
                    log.error("CRITICAL ALERT: Audius node network completely unreachable! Populating fallback Bootstrap Nodes in Redis.");
                    List<String> fallbacks = List.of(
                            "https://discoveryprovider.audius.co",
                            "https://creatornode2.audius.co",
                            "https://audius-dp.net.ua"
                    );
                    redisTemplate.opsForList().rightPushAll(REDIS_KEY, fallbacks.toArray());
                } else {
                    log.warn("ALERT: Failed to update node list. Using existing {} cached nodes in Redis.", size);
                }
            } catch (Exception re) {
                log.error("CRITICAL ALERT: Failed to check or populate fallback in Redis: {}", re.getMessage());
            }
        }
    }
}
