package com.musicapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(
    name = "playlist_tracks",
    uniqueConstraints = @UniqueConstraint(columnNames = {"playlist_id", "audius_track_id"}),
    indexes = {
        @Index(name = "idx_pt_playlist", columnList = "playlist_id"),
        @Index(name = "idx_pt_track", columnList = "audius_track_id")
    }
)
public class PlaylistTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false)
    @JsonIgnore
    private Playlist playlist;

    @Column(name = "audius_track_id", nullable = false, length = 100)
    private String audiusTrackId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "artist_name", nullable = false, length = 255)
    private String artistName;

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    @Column(name = "cover_art_url", length = 500)
    private String coverArtUrl;

    @Column(nullable = false)
    private Integer position;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Playlist getPlaylist() {
        return playlist;
    }

    public void setPlaylist(Playlist playlist) {
        this.playlist = playlist;
    }

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

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }
}
