package com.musicapp.controller;

import com.musicapp.service.MusicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/music")
public class MusicController {

    private final MusicService musicService;

    public MusicController(MusicService musicService) {
        this.musicService = musicService;
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String q,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset) {

        Map<String, Object> data = musicService.searchTracks(q, limit, offset);
        return ResponseEntity.ok(buildSuccessResponse(data));
    }

    @GetMapping("/trending")
    public ResponseEntity<Map<String, Object>> trending(
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset) {

        Map<String, Object> data = musicService.getTrendingTracks(genre, limit, offset);
        return ResponseEntity.ok(buildSuccessResponse(data));
    }

    @GetMapping("/track/{id}")
    public ResponseEntity<Map<String, Object>> trackDetails(@PathVariable String id) {
        Map<String, Object> data = musicService.getTrackDetails(id);
        return ResponseEntity.ok(buildSuccessResponse(data));
    }

    @GetMapping("/track/{id}/stream")
    public ResponseEntity<Void> streamTrack(@PathVariable String id) {
        String streamUrl = musicService.getStreamUrl(id);
        return ResponseEntity.status(302)
                .header("Location", streamUrl)
                .build();
    }

    private Map<String, Object> buildSuccessResponse(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("error", null);
        return response;
    }
}
