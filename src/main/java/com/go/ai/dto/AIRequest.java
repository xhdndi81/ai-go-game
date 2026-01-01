package com.go.ai.dto;

public class AIRequest {
    private String boardState; // 바둑 상태 (JSON 배열 또는 SGF 형식)
    private String turn; // 'b' (흑) 또는 'w' (백)
    private String userName;
    private Boolean isImportantMove; // 중요한 수인지 (포획, 큰 그룹 형성 등)
    private Boolean hasCapture; // 포획이 발생했는지
    private Boolean isGameStart; // 게임 시작인지
    private Boolean isGameEnd; // 게임 종료인지

    public AIRequest() {}

    public String getBoardState() { return boardState; }
    public void setBoardState(String boardState) { this.boardState = boardState; }
    public String getTurn() { return turn; }
    public void setTurn(String turn) { this.turn = turn; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public Boolean getIsImportantMove() { return isImportantMove; }
    public void setIsImportantMove(Boolean isImportantMove) { this.isImportantMove = isImportantMove; }
    public Boolean getHasCapture() { return hasCapture; }
    public void setHasCapture(Boolean hasCapture) { this.hasCapture = hasCapture; }
    public Boolean getIsGameStart() { return isGameStart; }
    public void setIsGameStart(Boolean isGameStart) { this.isGameStart = isGameStart; }
    public Boolean getIsGameEnd() { return isGameEnd; }
    public void setIsGameEnd(Boolean isGameEnd) { this.isGameEnd = isGameEnd; }
}

