package com.go.ai.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_rooms")
public class GameRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private User guest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status;

    @Column(columnDefinition = "TEXT")
    private String boardState; // 현재 게임 상태 (JSON 배열 또는 SGF 형식)

    @Column(length = 10)
    private String turn; // 'b' (흑) 또는 'w' (백)

    @Column(length = 10)
    private String winner; // 'b', 'w', 'draw' 또는 null

    private Integer capturedBlack = 0;
    private Integer capturedWhite = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime startedAt;

    public GameRoom() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getHost() { return host; }
    public void setHost(User host) { this.host = host; }
    public User getGuest() { return guest; }
    public void setGuest(User guest) { this.guest = guest; }
    public RoomStatus getStatus() { return status; }
    public void setStatus(RoomStatus status) { this.status = status; }
    public String getBoardState() { return boardState; }
    public void setBoardState(String boardState) { this.boardState = boardState; }
    public String getTurn() { return turn; }
    public void setTurn(String turn) { this.turn = turn; }
    public String getWinner() { return winner; }
    public void setWinner(String winner) { this.winner = winner; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public Integer getCapturedBlack() { return capturedBlack; }
    public void setCapturedBlack(Integer capturedBlack) { this.capturedBlack = capturedBlack; }
    public Integer getCapturedWhite() { return capturedWhite; }
    public void setCapturedWhite(Integer capturedWhite) { this.capturedWhite = capturedWhite; }

    public enum RoomStatus {
        WAITING,    // 대기 중
        PLAYING,    // 게임 진행 중
        FINISHED    // 게임 종료
    }
}

