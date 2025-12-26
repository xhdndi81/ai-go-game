package com.go.ai.dto;

public class AIResponse {
    private String move; // 바둑 좌표 (예: "A1", "K10" 등)
    private String comment; // 아이들을 위한 친절한 코멘트

    public AIResponse() {}

    public AIResponse(String move, String comment) {
        this.move = move;
        this.comment = comment;
    }

    public String getMove() { return move; }
    public void setMove(String move) { this.move = move; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}

