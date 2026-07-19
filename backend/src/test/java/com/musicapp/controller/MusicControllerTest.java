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
}
