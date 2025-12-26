// 혼자하기(AI) 관련 로직

function makeAIMove() {
    if (game.checkGameOver()) return;
    
    stopNudgeTimer();
    $('#ai-message').text('음... 어디로 두면 좋을까? 🤔');
    
    // 난이도에 따라 AI 수준 결정
    setTimeout(() => {
        const move = getAIMove(currentSkillLevel);
        if (move) {
            const [row, col] = move;
            const color = game.currentTurn === 1 ? 1 : -1;
            if (game.placeStone(row, col, color)) {
                board.update();
                updateStatus();
                movesCount++;
                
                // AI 코멘트 요청
                if (Math.random() < 0.3) {
                    getAIComment();
                } else {
                    const casualMents = [
                        "음, 제 차례군요.",
                        "어디로 두면 좋을까?",
                        "선생님도 집중하고 있어요!"
                    ];
                    const ment = casualMents[Math.floor(Math.random() * casualMents.length)];
                    $('#ai-message').text(ment);
                    speak(ment);
                }
                
                checkGameOver();
                startNudgeTimer();
            } else {
                // 유효하지 않은 수인 경우 다시 시도
                makeAIMove();
            }
        }
    }, 500);
}

function getAIMove(difficulty) {
    const validMoves = [];
    
    // 유효한 수 찾기
    for (let row = 0; row < 19; row++) {
        for (let col = 0; col < 19; col++) {
            if (!game.hasStone(row, col)) {
                // 임시로 돌을 놓아서 유효한지 확인
                const testGame = new GoGame();
                testGame.fromJSON(game.toJSON());
                testGame.currentTurn = game.currentTurn;
                testGame.lastMove = game.lastMove;
                testGame.passCount = game.passCount;
                
                const color = game.currentTurn === 1 ? 1 : -1;
                if (testGame.placeStone(row, col, color)) {
                    validMoves.push([row, col]);
                }
            }
        }
    }
    
    if (validMoves.length === 0) {
        // 유효한 수가 없으면 패스
        game.pass();
        return null;
    }
    
    // 난이도별 AI 로직
    if (difficulty === 0) {
        // 쉬움: 완전 랜덤
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    } else if (difficulty <= 8) {
        // 보통: 약간의 전략 (중앙 선호)
        return getStrategicMove(validMoves, 0.3);
    } else if (difficulty <= 15) {
        // 어려움: 중간 전략 (연결, 끊기 고려)
        return getStrategicMove(validMoves, 0.6);
    } else {
        // 마스터: 강한 전략 (사석, 연결, 끊기 모두 고려)
        return getStrategicMove(validMoves, 0.9);
    }
}

function getStrategicMove(validMoves, strategyLevel) {
    // 전략 점수 계산
    const scoredMoves = validMoves.map(move => {
        const [row, col] = move;
        let score = 0;
        
        // 중앙 선호
        const centerDist = Math.abs(row - 9) + Math.abs(col - 9);
        score += (36 - centerDist) * 0.1;
        
        // 인접한 돌 확인
        const neighbors = game.getNeighbors(row, col);
        let friendCount = 0;
        let enemyCount = 0;
        
        neighbors.forEach(([nr, nc]) => {
            const stone = game.board[nr][nc];
            if (stone === game.currentTurn) {
                friendCount++;
            } else if (stone === -game.currentTurn) {
                enemyCount++;
            }
        });
        
        // 연결 선호
        score += friendCount * 2;
        
        // 끊기 선호 (전략 수준이 높을 때)
        if (strategyLevel > 0.5) {
            score += enemyCount * 1.5;
        }
        
        // 랜덤 요소 추가
        score += Math.random() * strategyLevel * 10;
        
        return { move, score };
    });
    
    // 점수 순으로 정렬
    scoredMoves.sort((a, b) => b.score - a.score);
    
    // 상위 30% 중에서 선택 (전략 수준에 따라)
    const topCount = Math.max(1, Math.floor(scoredMoves.length * (1 - strategyLevel * 0.7)));
    const topMoves = scoredMoves.slice(0, topCount);
    
    return topMoves[Math.floor(Math.random() * topMoves.length)].move;
}

function getAIComment() {
    $.ajax({
        url: '/api/ai/comment',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ 
            boardState: game.toJSON(), 
            turn: game.getTurn(),
            userName: userName
        }),
        success: function(response) {
            $('#ai-message').text(response.comment);
            speak(response.comment);
        }
    });
}

