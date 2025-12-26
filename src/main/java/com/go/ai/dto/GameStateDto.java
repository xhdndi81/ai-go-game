package com.go.ai.dto;

public class GameStateDto {
    private String boardState; // 바둑 상태 (JSON 배열 또는 SGF 형식)
    private String turn; // 'b' (흑) 또는 'w' (백)
    private String status; // WAITING, PLAYING, FINISHED
    private Boolean isGameOver;
    private String winner; // 'b', 'w', 'draw', 또는 null
    private String hostName;
    private String guestName;
    private String message; // 선택적 메시지 전달용
    private Integer capturedBlack;
    private Integer capturedWhite;

    public GameStateDto() {}

    public GameStateDto(String boardState, String turn, String status, Boolean isGameOver, String winner, String hostName, String guestName) {
        this.boardState = boardState;
        this.turn = turn;
        this.status = status;
        this.isGameOver = isGameOver;
        this.winner = winner;
        this.hostName = hostName;
        this.guestName = guestName;
        this.message = null;
        this.capturedBlack = 0;
        this.capturedWhite = 0;
    }

    public GameStateDto(String boardState, String turn, String status, Boolean isGameOver, String winner, String hostName, String guestName, String message) {
        this.boardState = boardState;
        this.turn = turn;
        this.status = status;
        this.isGameOver = isGameOver;
        this.winner = winner;
        this.hostName = hostName;
        this.guestName = guestName;
        this.message = message;
        this.capturedBlack = 0;
        this.capturedWhite = 0;
    }

    public GameStateDto(String boardState, String turn, String status, Boolean isGameOver, String winner, String hostName, String guestName, String message, Integer capturedBlack, Integer capturedWhite) {
        this.boardState = boardState;
        this.turn = turn;
        this.status = status;
        this.isGameOver = isGameOver;
        this.winner = winner;
        this.hostName = hostName;
        this.guestName = guestName;
        this.message = message;
        this.capturedBlack = capturedBlack;
        this.capturedWhite = capturedWhite;
    }

    public String getBoardState() { return boardState; }
    public void setBoardState(String boardState) { this.boardState = boardState; }
    public String getTurn() { return turn; }
    public void setTurn(String turn) { this.turn = turn; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Boolean getIsGameOver() { return isGameOver; }
    public void setIsGameOver(Boolean isGameOver) { this.isGameOver = isGameOver; }
    public String getWinner() { return winner; }
    public void setWinner(String winner) { this.winner = winner; }
    public String getHostName() { return hostName; }
    public void setHostName(String hostName) { this.hostName = hostName; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Integer getCapturedBlack() { return capturedBlack; }
    public void setCapturedBlack(Integer capturedBlack) { this.capturedBlack = capturedBlack; }
    public Integer getCapturedWhite() { return capturedWhite; }
    public void setCapturedWhite(Integer capturedWhite) { this.capturedWhite = capturedWhite; }
}

