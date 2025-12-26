// 바둑 게임 로직 클래스
class GoGame {
    constructor() {
        this.boardSize = 19;
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(0));
        // 0 = 빈칸, 1 = 흑, -1 = 백
        this.currentTurn = 1; // 1 = 흑, -1 = 백
        this.moveHistory = [];
        this.capturedBlack = 0;
        this.capturedWhite = 0;
        this.lastMove = null; // 코(ko) 규칙을 위한 마지막 수
        this.passCount = 0; // 연속 패스 횟수
        this.isGameOver = false;
    }

    // 보드 상태를 JSON 문자열로 변환
    toJSON() {
        return JSON.stringify(this.board);
    }

    // JSON 문자열에서 보드 상태 복원
    fromJSON(jsonStr) {
        if (!jsonStr) return;
        try {
            this.board = JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to parse board state:", e);
        }
    }

    // 좌표가 유효한지 확인
    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }

    // 해당 위치에 돌이 있는지 확인
    hasStone(row, col) {
        return this.board[row][col] !== 0;
    }

    // 돌 놓기
    placeStone(row, col, color) {
        if (!this.isValidPosition(row, col)) return false;
        if (this.hasStone(row, col)) return false;
        if (color !== this.currentTurn) return false;

        // 임시로 돌을 놓아서 테스트
        this.board[row][col] = color;

        // 자충수 확인
        const captured = this.captureStones(row, col, color === 1 ? -1 : 1);
        const hasLiberties = this.hasLiberties(row, col, color);

        // 자충수인 경우 되돌림
        if (captured.length === 0 && !hasLiberties) {
            this.board[row][col] = 0;
            return false;
        }

        // 코(ko) 규칙 확인
        if (this.lastMove && captured.length === 1) {
            const [capturedRow, capturedCol] = captured[0];
            if (capturedRow === this.lastMove[0] && capturedCol === this.lastMove[1]) {
                // 코 규칙 위반 - 되돌림
                this.board[row][col] = 0;
                // 포획한 돌 복원
                captured.forEach(([r, c]) => {
                    this.board[r][c] = color === 1 ? -1 : 1;
                });
                return false;
            }
        }

        // 포획한 돌 제거
        captured.forEach(([r, c]) => {
            this.board[r][c] = 0;
            if (color === 1) {
                this.capturedWhite++;
            } else {
                this.capturedBlack++;
            }
        });

        // 차례 변경
        this.currentTurn = -this.currentTurn;
        this.lastMove = [row, col];
        this.passCount = 0;
        this.moveHistory.push([row, col, color]);

        return true;
    }

    // 연결된 그룹의 자유도 확인
    hasLiberties(row, col, color) {
        const visited = new Set();
        const stack = [[row, col]];

        while (stack.length > 0) {
            const [r, c] = stack.pop();
            const key = `${r},${c}`;
            if (visited.has(key)) continue;
            visited.add(key);

            // 인접한 빈 칸이 있으면 자유도 있음
            const neighbors = this.getNeighbors(r, c);
            for (const [nr, nc] of neighbors) {
                if (this.board[nr][nc] === 0) {
                    return true;
                }
                if (this.board[nr][nc] === color) {
                    stack.push([nr, nc]);
                }
            }
        }

        return false;
    }

    // 포획할 돌 찾기
    captureStones(row, col, opponentColor) {
        const captured = [];
        const visited = new Set();
        const neighbors = this.getNeighbors(row, col);

        for (const [nr, nc] of neighbors) {
            if (this.board[nr][nc] === opponentColor) {
                const group = this.getGroup(nr, nc, opponentColor);
                if (!this.hasGroupLiberties(group)) {
                    group.forEach(([r, c]) => {
                        const key = `${r},${c}`;
                        if (!visited.has(key)) {
                            visited.add(key);
                            captured.push([r, c]);
                        }
                    });
                }
            }
        }

        return captured;
    }

    // 연결된 그룹 가져오기
    getGroup(row, col, color) {
        const group = [];
        const visited = new Set();
        const stack = [[row, col]];

        while (stack.length > 0) {
            const [r, c] = stack.pop();
            const key = `${r},${c}`;
            if (visited.has(key)) continue;
            visited.add(key);

            if (this.board[r][c] === color) {
                group.push([r, c]);
                const neighbors = this.getNeighbors(r, c);
                for (const [nr, nc] of neighbors) {
                    if (this.board[nr][nc] === color) {
                        stack.push([nr, nc]);
                    }
                }
            }
        }

        return group;
    }

    // 그룹의 자유도 확인
    hasGroupLiberties(group) {
        for (const [r, c] of group) {
            const neighbors = this.getNeighbors(r, c);
            for (const [nr, nc] of neighbors) {
                if (this.board[nr][nc] === 0) {
                    return true;
                }
            }
        }
        return false;
    }

    // 인접한 위치 가져오기
    getNeighbors(row, col) {
        const neighbors = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
            const nr = row + dr;
            const nc = col + dc;
            if (this.isValidPosition(nr, nc)) {
                neighbors.push([nr, nc]);
            }
        }
        return neighbors;
    }

    // 패스
    pass() {
        this.passCount++;
        this.currentTurn = -this.currentTurn;
        this.lastMove = null;
        
        if (this.passCount >= 2) {
            this.isGameOver = true;
        }
    }

    // 게임 종료 확인
    checkGameOver() {
        return this.isGameOver || this.passCount >= 2;
    }

    // 집계 계산 (간단한 버전)
    calculateScore() {
        // 실제 집계 계산은 복잡하므로 간단히 포획한 돌 수로 계산
        const blackScore = this.capturedWhite;
        const whiteScore = this.capturedBlack + 6.5; // 덤
        
        return {
            black: blackScore,
            white: whiteScore,
            winner: blackScore > whiteScore ? 'b' : 'w'
        };
    }

    // 현재 차례 가져오기
    getTurn() {
        return this.currentTurn === 1 ? 'b' : 'w';
    }

    // 보드 상태 초기화
    reset() {
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(0));
        this.currentTurn = 1;
        this.moveHistory = [];
        this.capturedBlack = 0;
        this.capturedWhite = 0;
        this.lastMove = null;
        this.passCount = 0;
        this.isGameOver = false;
    }
}

