// 혼자하기(AI) 관련 로직

function makeAIMove() {
    if (game.checkGameOver()) return;
    
    stopNudgeTimer();
    const aiMessageEl = $('#ai-message');
    aiMessageEl.text('음... 어디로 두면 좋을까? 🤔');
    aiMessageEl.css({
        'display': 'block',
        'visibility': 'visible',
        'opacity': '1'
    });
    
    // 포획 감지를 위한 이전 포획 수 저장
    const prevCapturedBlack = game.capturedBlack;
    const prevCapturedWhite = game.capturedWhite;
    
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
                
                // 포획 감지
                const hasCapture = (game.capturedBlack > prevCapturedBlack) || (game.capturedWhite > prevCapturedWhite);
                const isGameStart = movesCount <= 5;
                const isGameEnd = checkGameOver();
                const isImportantMove = hasCapture || isGameStart || isGameEnd;
                
                // AI 코멘트 요청 (20% 확률 또는 중요한 수인 경우)
                if (isImportantMove || Math.random() < 0.2) {
                    // 20% 확률로 AI 코멘트 요청 또는 중요한 수인 경우
                    getAIComment(hasCapture, isGameStart, isGameEnd, isImportantMove);
                } else {
                    // 80% 확률로 간단한 메시지 표시
                    const casualMents = [
                        "음, 제 차례군요.",
                        "어디로 두면 좋을까?",
                        "선생님도 집중하고 있어요!",
                        "좋은 수를 두고 있네요!",
                        "바둑판이 점점 흥미로워지고 있어요!"
                    ];
                    const ment = casualMents[Math.floor(Math.random() * casualMents.length)];
                    const aiMessageEl = $('#ai-message');
                    aiMessageEl.text(ment);
                    aiMessageEl.css({
                        'display': 'block',
                        'visibility': 'visible',
                        'opacity': '1'
                    });
                    speak(ment);
                }
                
                if (!isGameEnd) {
                    checkGameOver();
                    startNudgeTimer();
                }
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

function getAIComment(hasCapture, isGameStart, isGameEnd, isImportantMove) {
    // 기본값 설정 (인자가 없을 경우)
    hasCapture = hasCapture || false;
    isGameStart = isGameStart || false;
    isGameEnd = isGameEnd || false;
    isImportantMove = isImportantMove || false;
    
    $.ajax({
        url: '/api/ai/comment',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ 
            boardState: game.toJSON(), 
            turn: game.getTurn(),
            userName: userName,
            hasCapture: hasCapture,
            isGameStart: isGameStart,
            isGameEnd: isGameEnd,
            isImportantMove: isImportantMove
        }),
        success: function(response) {
            const aiMessageEl = $('#ai-message');
            if (response && response.comment) {
                aiMessageEl.text(response.comment);
                aiMessageEl.css({
                    'display': 'block',
                    'visibility': 'visible',
                    'opacity': '1'
                });
                speak(response.comment);
            } else {
                // 응답이 없거나 형식이 잘못된 경우 기본 메시지 표시
                const fallbackMents = [
                    "좋은 수를 두고 있네요!",
                    "바둑판이 점점 흥미로워지고 있어요!",
                    "계속 집중해서 좋은 수를 찾아보세요!"
                ];
                const ment = fallbackMents[Math.floor(Math.random() * fallbackMents.length)];
                aiMessageEl.text(ment);
                aiMessageEl.css({
                    'display': 'block',
                    'visibility': 'visible',
                    'opacity': '1'
                });
                speak(ment);
            }
        },
        error: function(xhr, status, error) {
            console.error('AI 코멘트 요청 실패:', error);
            // 에러 발생 시 기본 메시지 표시
            const aiMessageEl = $('#ai-message');
            const errorMents = [
                "음, 제 차례군요.",
                "어디로 두면 좋을까?",
                "선생님도 집중하고 있어요!"
            ];
            const ment = errorMents[Math.floor(Math.random() * errorMents.length)];
            aiMessageEl.text(ment);
            aiMessageEl.css({
                'display': 'block',
                'visibility': 'visible',
                'opacity': '1'
            });
            speak(ment);
        }
    });
}

