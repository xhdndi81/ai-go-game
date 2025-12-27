package com.go.ai.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "go_game_data")
public class GoGameData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false, unique = true)
    private GameRoom room;

    @Column(columnDefinition = "TEXT")
    private String boardState; // 현재 게임 상태 (JSON 배열 또는 SGF 형식)

    @Column(length = 10)
    private String turn; // 'b' (흑) 또는 'w' (백)

    @Column(length = 10)
    private String winner; // 'b', 'w', 'draw' 또는 null

    private Integer capturedBlack = 0;
    private Integer capturedWhite = 0;

    public GoGameData() {
    }

    public GoGameData(GameRoom room, String boardState, String turn) {
        this.room = room;
        this.boardState = boardState;
        this.turn = turn;
        this.capturedBlack = 0;
        this.capturedWhite = 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public GameRoom getRoom() {
        return room;
    }

    public void setRoom(GameRoom room) {
        this.room = room;
    }

    public String getBoardState() {
        return boardState;
    }

    public void setBoardState(String boardState) {
        this.boardState = boardState;
    }

    public String getTurn() {
        return turn;
    }

    public void setTurn(String turn) {
        this.turn = turn;
    }

    public String getWinner() {
        return winner;
    }

    public void setWinner(String winner) {
        this.winner = winner;
    }

    public Integer getCapturedBlack() {
        return capturedBlack;
    }

    public void setCapturedBlack(Integer capturedBlack) {
        this.capturedBlack = capturedBlack;
    }

    public Integer getCapturedWhite() {
        return capturedWhite;
    }

    public void setCapturedWhite(Integer capturedWhite) {
        this.capturedWhite = capturedWhite;
    }
}
