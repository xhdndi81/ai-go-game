package com.go.ai.dto;

public class AIRequest {
    private String boardState; // 바둑 상태 (JSON 배열 또는 SGF 형식)
    private String turn; // 'b' (흑) 또는 'w' (백)
    private String userName;

    public AIRequest() {}

    public String getBoardState() { return boardState; }
    public void setBoardState(String boardState) { this.boardState = boardState; }
    public String getTurn() { return turn; }
    public void setTurn(String turn) { this.turn = turn; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}

