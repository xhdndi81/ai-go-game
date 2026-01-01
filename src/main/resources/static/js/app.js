let board = null;
let game = new GoGame();
let userId = null;
let userName = null;
let movesCount = 0;
let nudgeTimer = null;
let gameMode = 'single'; // 'single' 또는 'multi'
let lastCapturedBlack = 0; // 포획 감지를 위한 이전 포획 수
let lastCapturedWhite = 0; // 포획 감지를 위한 이전 포획 수

// 멀티플레이어 관련 변수 (multiplayer.js에서 사용)
let roomId = null;
let stompClient = null;
let myColor = 'w'; // 'w' (백) 또는 'b' (흑)
let isHost = false;
let opponentName = 'AI'; // 현재 게임의 상대방 이름
let lastSentBoardState = null; // 마지막으로 보낸 보드 상태 추적

// 싱글플레이어 관련 변수 (single-player.js에서 사용)
let currentSkillLevel = 5;

// 음성 출력 관리 변수
let lastSpokenText = "";
let lastSpokenTime = 0;

// 음성 출력 함수 (시스템 TTS 전용 - 에러 없음)
function speak(text) {
    if (typeof speechSynthesis === 'undefined' || !text) return;
    
    // 1. 짧은 시간 내에 동일한 텍스트 중복 재생 방지
    const now = Date.now();
    if (text === lastSpokenText && (now - lastSpokenTime) < 1000) return;
    
    lastSpokenText = text;
    lastSpokenTime = now;

    // 2. 기존 음성 취소 및 약간의 지연 후 재생 (브라우저 버그 방지)
    speechSynthesis.cancel();
    
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = speechSynthesis.getVoices();
        
        const preferredVoice = voices.find(v => v.lang === 'ko-KR' && (v.name.includes('Google') || v.name.includes('Natural'))) ||
                               voices.find(v => v.lang === 'ko-KR' && v.name.includes('Heami')) ||
                               voices.find(v => v.lang === 'ko-KR');

        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.lang = 'ko-KR';
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
    }, 50);
}

function handleMove(row, col, color) {
    if (gameMode === 'single') {
        stopNudgeTimer();
        movesCount++;
        
        // 포획 감지
        const hasCapture = (game.capturedBlack > lastCapturedBlack) || (game.capturedWhite > lastCapturedWhite);
        const isGameStart = movesCount <= 5;
        const isGameEnd = checkGameOver();
        const isImportantMove = hasCapture || isGameStart || isGameEnd;
        
        // 포획 수 업데이트
        lastCapturedBlack = game.capturedBlack;
        lastCapturedWhite = game.capturedWhite;
        
        updateStatus();
        
        // AI 코멘트 요청 (15% 확률 또는 중요한 수인 경우)
        if (isImportantMove || Math.random() < 0.15) { // 15% 확률로 코멘트 또는 중요한 수인 경우
            getAIComment(hasCapture, isGameStart, isGameEnd, isImportantMove);
        }
        
        if (!isGameEnd) {
            window.setTimeout(makeAIMove, 500);
        }
    } else {
        // 멀티플레이어 모드
        movesCount++;
        updateStatus();
        sendMoveToServer(row, col);
    }
}

function updateStatus() {
    if (!game) return;

    let moveColor = game.getTurn() === 'b' ? '흑' : '백';
    const isOver = game.checkGameOver();
    
    let status = isOver ? '게임 종료!' : `${moveColor} 차례.`;
    $('#game-status').text(status);
    
    if (isOver) {
        const score = game.calculateScore();
        let message = '';
        let result = 'DRAW';
        
        if (score.winner === 'b') {
            message = gameMode === 'single' ? 'AI가 승리했습니다.' : 
                     (myColor === 'b' ? '승리했습니다! 🎉' : '패배했습니다.');
            result = gameMode === 'single' ? 'LOSS' : (myColor === 'b' ? 'WIN' : 'LOSS');
        } else {
            message = gameMode === 'single' ? '승리했습니다! 🎉' : 
                     (myColor === 'w' ? '승리했습니다! 🎉' : '패배했습니다.');
            result = gameMode === 'single' ? 'WIN' : (myColor === 'w' ? 'WIN' : 'LOSS');
        }
        
        $('#ai-message').text(message);
        speak(message);
        
        let currentOpponentName = 'AI';
        if (gameMode === 'multi' && opponentName && opponentName !== 'AI' && opponentName !== '상대방') {
            currentOpponentName = opponentName;
        }
        
        $.ajax({
            url: '/api/history/' + userId,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ result: result, movesCount: movesCount, opponentName: currentOpponentName }),
            success: function() { 
                alert('게임 종료! 결과가 저장되었습니다.');
                if (result === 'WIN' || result === 'DRAW') {
                    $('#btn-new-game').show();
                }
            }
        });
    } else {
        if (gameMode === 'multi') {
            const currentTurn = game.getTurn(); // 'b' 또는 'w'
            console.log('--- Nudge Button Check ---');
            console.log('Current Turn (from game):', currentTurn);
            console.log('My Color:', myColor);
            
            if (currentTurn === myColor) {
                // 내 차례
                console.log('Result: My Turn - Hiding Nudge Button');
                $('#ai-message').text('당신의 차례입니다. 멋진 수를 보여주세요! 😊');
                $('#btn-nudge').css('display', 'none');
            } else {
                // 상대방 차례
                console.log('Result: Opponent Turn - Showing Nudge Button');
                $('#ai-message').text('상대방이 생각 중입니다... ⏳');
                $('#btn-nudge').css('display', 'block');
            }
            console.log('---------------------------');
        } else {
            if (game.getTurn() === 'w') {
                $('#ai-message').text('어디로 두면 좋을까? 천천히 생각해보렴!');
            }
            $('#btn-nudge').hide();
        }
    }
    
    if (isOver) {
        $('#btn-nudge').hide();
    }
    
    updateCapturedStones();
}

function updateCapturedStones() {
    if (!game || !board) return;
    
    const blackCount = game.capturedBlack;
    const whiteCount = game.capturedWhite;
    
    // 포획된 돌 표시: x3 형태로 표시
    const blackHtml = blackCount > 0 
        ? `<div class="captured-stone black-stone"></div><span class="captured-count">×${blackCount}</span>`
        : '';
    
    const whiteHtml = whiteCount > 0 
        ? `<div class="captured-stone white-stone"></div><span class="captured-count">×${whiteCount}</span>`
        : '';
    
    $('#captured-black').html(blackHtml);
    $('#captured-white').html(whiteHtml);
}

function checkGameOver() {
    return game.checkGameOver();
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

// 사용자를 재촉하는 함수
function startNudgeTimer() {
    stopNudgeTimer();
    nudgeTimer = setTimeout(() => {
        if (game.getTurn() === 'w' && !game.checkGameOver()) {
            // 이름을 부르는 메시지 비율을 줄임 (5개 중 2개만 이름 포함)
            const nudges = [
                "어디로 둘지 결정했니? 😊",
                `${userName}야, 천천히 생각해도 돼!`,
                "선생님은 기다리고 있어!",
                `${userName}야, 어떤 전략을 세우고 있니?`,
                "선생님은 준비 다 됐어! 천천히 해봐~",
                "좋은 수를 찾고 있구나!",
                "천천히 생각해도 괜찮아요!",
                "바둑은 생각하는 게임이니까요 😊"
            ];
            const ment = nudges[Math.floor(Math.random() * nudges.length)];
            $('#ai-message').text(ment);
            speak(ment);
            startNudgeTimer();
        }
    }, 30000);
}

function stopNudgeTimer() {
    if (nudgeTimer) clearTimeout(nudgeTimer);
}

$(document).ready(function() {
    // 대기방 목록 HTML 로드
    $('#waiting-rooms-placeholder').load('/waiting-rooms.html');

    $('#btn-new-game').hide();
    
    const savedName = localStorage.getItem('go_username');
    if (savedName) $('#username').val(savedName);

    const savedDiff = localStorage.getItem('go_difficulty');
    if (savedDiff !== null) {
        $('#difficulty').val(savedDiff);
        currentSkillLevel = parseInt(savedDiff);
    }

    $('.mode-btn').on('click', function() {
        $('.mode-btn').css('background', '#fff');
        $(this).css('background', '#ffeb99');
        
        if ($(this).attr('id') === 'btn-single-mode') {
            gameMode = 'single';
            $('#single-mode-options').show();
            $('#btn-start').show();
            $('#btn-create-room').hide();
        } else {
            gameMode = 'multi';
            $('#single-mode-options').hide();
            $('#btn-start').hide();
            $('#btn-create-room').hide();
            
            const name = $('#username').val();
            if (!name) { alert('이름을 입력해주세요!'); return; }
            
            $.ajax({
                url: '/api/login',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ name: name }),
                success: function(user) {
                    userId = user.id;
                    userName = user.name;
                    localStorage.setItem('go_username', name);
                    
                    $('#login-container').hide();
                    $('#waiting-rooms-container').show();
                    loadWaitingRooms();
                    
                    if (window.roomRefreshInterval) clearInterval(window.roomRefreshInterval);
                    window.roomRefreshInterval = setInterval(loadWaitingRooms, 5000);
                }
            });
        }
    });
    
    $('#btn-single-mode').trigger('click');

    $('#btn-start').on('click', function() {
        const name = $('#username').val();
        if (!name) { alert('이름을 입력해주세요!'); return; }
        
        currentSkillLevel = parseInt($('#difficulty').val());
        localStorage.setItem('go_username', name);
        localStorage.setItem('go_difficulty', currentSkillLevel);

        const docEl = document.documentElement;
        if (docEl.requestFullscreen) docEl.requestFullscreen();

        $.ajax({
            url: '/api/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ name: name }),
            success: function(user) {
                userId = user.id; userName = user.name;
                $('#display-name').text(userName);
                $('#login-container').hide(); $('#game-container').show();
                // 포획 수 초기화
                lastCapturedBlack = 0;
                lastCapturedWhite = 0;
                movesCount = 0;
                initBoard();
                
                const welcome = `안녕, ${userName}야! 나는 너의 바둑 친구야. 우리 재미있게 놀아보자!`;
                const aiMessageEl = $('#ai-message');
                const speechBubble = $('.speech-bubble');
                const aiChatArea = $('.ai-chat-area');
                const aiCharacter = $('.ai-character');
                
                // 메시지 설정
                aiMessageEl.text(welcome);
                aiMessageEl.css({
                    'display': 'block !important',
                    'visibility': 'visible !important',
                    'opacity': '1 !important',
                    'color': '#333 !important'
                });
                
                // 말풍선 보이기
                speechBubble.css({
                    'display': 'flex !important',
                    'visibility': 'visible !important',
                    'opacity': '1 !important',
                    'min-height': '40px !important'
                });
                
                // AI 영역 보이기
                aiChatArea.css({
                    'display': 'flex !important',
                    'visibility': 'visible !important',
                    'min-height': '60px !important'
                });
                
                aiCharacter.css({
                    'display': 'flex !important',
                    'visibility': 'visible !important',
                    'min-height': '60px !important'
                });
                
                speak(welcome);
                
                // AI 메시지 업데이트 후 높이 재설정
                setTimeout(() => {
                    const speechBubbleEl = document.querySelector('.speech-bubble');
                    const aiMessage = document.getElementById('ai-message');
                    if (speechBubbleEl) {
                        const maxHeight = Math.min(window.innerHeight * 0.25 - 70, 200);
                        speechBubbleEl.style.setProperty('max-height', maxHeight + 'px', 'important');
                        speechBubbleEl.style.setProperty('min-height', '40px', 'important');
                        speechBubbleEl.style.setProperty('overflow-y', 'auto', 'important');
                        speechBubbleEl.style.setProperty('display', 'flex', 'important');
                        speechBubbleEl.style.setProperty('visibility', 'visible', 'important');
                        speechBubbleEl.style.setProperty('opacity', '1', 'important');
                    }
                    if (aiMessage) {
                        aiMessage.style.setProperty('display', 'block', 'important');
                        aiMessage.style.setProperty('visibility', 'visible', 'important');
                        aiMessage.style.setProperty('opacity', '1', 'important');
                        aiMessage.style.setProperty('color', '#333', 'important');
                    }
                }, 100);
                
                startNudgeTimer();
            }
        });
    });

    // 대기하기 화면 관련 이벤트 (이벤트 위임 사용)
    $(document).on('click', '#btn-back-to-login', function() {
        if (window.roomRefreshInterval) {
            clearInterval(window.roomRefreshInterval);
            window.roomRefreshInterval = null;
        }
        $('#waiting-rooms-container').hide();
        $('#login-container').show();
    });
    
    $(document).on('click', '#btn-refresh-rooms', function() {
        loadWaitingRooms();
    });
    
    $(document).on('click', '#btn-create-new-room', function() {
        if (!userId) { alert('먼저 이름을 입력하고 같이하기를 선택해주세요.'); return; }
        createRoom();
    });

    $('#btn-logout').on('click', () => {
        // 게임 상태 초기화
        if (typeof stompClient !== 'undefined' && stompClient && stompClient.connected) {
            stompClient.disconnect();
        }
        if (nudgeTimer) {
            clearTimeout(nudgeTimer);
            nudgeTimer = null;
        }
        if (window.roomRefreshInterval) {
            clearInterval(window.roomRefreshInterval);
            window.roomRefreshInterval = null;
        }
        
        // 게임 컨테이너 숨기고 로그인 화면 표시
        $('#game-container').hide();
        $('#waiting-rooms-container').hide();
        $('#login-container').show();
        
        // 게임 상태 초기화
        game.reset();
        board = null;
        movesCount = 0;
        gameMode = 'single';
        
        // 혼자하기 모드로 초기화
        $('#btn-single-mode').trigger('click');
    });

    $('#btn-history').on('click', () => {
        if (!userId) return;
        $.ajax({
            url: '/api/history/' + userId,
            method: 'GET',
            success: function(history) {
                const tbody = $('#history-table tbody').empty();
                history.forEach(h => {
                    const res = h.result === 'WIN' ? '승리 🏆' : h.result === 'LOSS' ? '패배' : '무승부';
                    const opponent = h.opponentName || 'AI';
                    tbody.append(`<tr><td>${new Date(h.playedAt).toLocaleDateString()}</td><td>${res}</td><td>${opponent}</td><td>${h.movesCount}</td></tr>`);
                });
                $('#history-modal').show();
            }
        });
    });
    
    $('#btn-new-game').on('click', () => {
        game.reset();
        movesCount = 0;
        lastCapturedBlack = 0;
        lastCapturedWhite = 0;
        if (typeof lastSentBoardState !== 'undefined') lastSentBoardState = null;
        $('#btn-new-game').hide();
        
        if (gameMode === 'multi') {
            // 같이하기 모드: 같은 방에서 새 게임 시작
            if (stompClient && stompClient.connected && roomId) {
                const headers = { userId: userId.toString() };
                const INITIAL_BOARD_STATE = game.toJSON();
                
                const isRematch = opponentName && opponentName !== '상대방' && opponentName !== 'AI';
                const nextStatus = isRematch ? 'PLAYING' : 'WAITING';
                const nextMessage = isRematch ? '재경기를 시작합니다! 즐거운 게임 되세요.' : '새 게임을 시작합니다! 상대방을 기다려주세요...';

                if (!isRematch) {
                    opponentName = '상대방';
                }

                stompClient.send('/app/game/' + roomId + '/state', headers, JSON.stringify({
                    boardState: INITIAL_BOARD_STATE,
                    turn: 'b',
                    status: nextStatus,
                    isGameOver: false,
                    winner: null,
                    message: nextMessage,
                    capturedBlack: 0,
                    capturedWhite: 0
                }));
            }
            
            initBoard();
            speak('새 게임을 시작합니다!');
        } else {
            initBoard();
            $('#ai-message').text('새 게임을 시작합니다!');
            speak('새 게임을 시작합니다!');
            startNudgeTimer();
        }
    });
    
    // 재촉하기 버튼 클릭 이벤트
    $('#btn-nudge').on('click', function() {
        if (gameMode === 'multi' && typeof sendNudgeToServer === 'function') {
            sendNudgeToServer();
        }
    });
    
    $('.close').on('click', () => $('#history-modal').hide());
});

function initBoard() {
    board = new GoBoard('myBoard', game, {
        onMove: handleMove
    });
    updateStatus();
    $('#btn-new-game').hide();
    // updateStatus에서 재촉하기 버튼 표시 여부를 결정하므로 여기서 강제로 숨기지 않음

    
    // AI 채팅 영역 높이 제한 설정
    function setChatAreaHeight() {
        const speechBubble = document.querySelector('.speech-bubble');
        if (speechBubble) {
            const maxHeight = Math.min(window.innerHeight * 0.25 - 70, 200);
            // !important를 사용하여 강제로 높이 설정
            speechBubble.style.setProperty('max-height', maxHeight + 'px', 'important');
            speechBubble.style.setProperty('height', maxHeight + 'px', 'important');
            speechBubble.style.setProperty('overflow-y', 'auto', 'important');
        }
    }
    
    setChatAreaHeight();
    $(window).on('resize', () => {
        if (board) board.resize();
        setChatAreaHeight();
    });
}

