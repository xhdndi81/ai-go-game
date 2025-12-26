package com.go.ai.dto;

public class MoveDto {
    private Long roomId;
    private int row; // 바둑 좌표 (0-18)
    private int col; // 바둑 좌표 (0-18)
    private String boardState; // 이동 후의 바둑 상태
    private String turn; // 다음 차례 ('b' 또는 'w')

    public MoveDto() {}

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
    public int getRow() { return row; }
    public void setRow(int row) { this.row = row; }
    public int getCol() { return col; }
    public void setCol(int col) { this.col = col; }
    public String getBoardState() { return boardState; }
    public void setBoardState(String boardState) { this.boardState = boardState; }
    public String getTurn() { return turn; }
    public void setTurn(String turn) { this.turn = turn; }
}

