package com.musicapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TrackRequest {

    @NotBlank(message = "audiusTrackId is required")
    private String audiusTrackId;

    @NotBlank(message = "title is required")
    private String title;

    @NotBlank(message = "artistName is required")
    private String artistName;

    @NotNull(message = "durationSeconds is required")
    private Integer durationSeconds;

    private String coverArtUrl;

    public String getAudiusTrackId() {
        return audiusTrackId;
    }

    public void setAudiusTrackId(String audiusTrackId) {
        this.audiusTrackId = audiusTrackId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getArtistName() {
        return artistName;
    }

    public void setArtistName(String artistName) {
        this.artistName = artistName;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public String getCoverArtUrl() {
        return coverArtUrl;
    }

    public void setCoverArtUrl(String coverArtUrl) {
        this.coverArtUrl = coverArtUrl;
    }
}
