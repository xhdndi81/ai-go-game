// 바둑판 UI 클래스
class GoBoard {
    constructor(containerId, game, options = {}) {
        this.container = document.getElementById(containerId);
        this.game = game;
        this.cellSize = options.cellSize || 20;
        this.stoneRadius = options.stoneRadius || 8;
        this.onMove = options.onMove || null;
        this.canvas = null;
        this.ctx = null;
        this.init();
    }

    init() {
        // 기존 내용 제거
        this.container.innerHTML = '';
        
        // 캔버스 생성
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.touchAction = 'none';
        this.container.appendChild(this.canvas);
        
        // 컨텍스트 가져오기
        this.ctx = this.canvas.getContext('2d');
        
        // 리사이즈 이벤트
        window.addEventListener('resize', () => this.resize());
        this.resize();
        
        // 클릭 이벤트
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // 초기 렌더링
        this.draw();
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height);
        this.canvas.width = size;
        this.canvas.height = size;
        this.cellSize = size / 20; // 19x19 보드 + 여백
        this.stoneRadius = this.cellSize * 0.4;
        this.draw();
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const margin = this.cellSize;
        const boardSize = this.cellSize * 18;
        
        // 보드 영역 내인지 확인
        if (x < margin || x > margin + boardSize || y < margin || y > margin + boardSize) {
            return;
        }
        
        // 좌표를 보드 인덱스로 변환
        const col = Math.round((x - margin) / this.cellSize);
        const row = Math.round((y - margin) / this.cellSize);
        
        if (row >= 0 && row < 19 && col >= 0 && col < 19) {
            const color = this.game.currentTurn === 1 ? 1 : -1;
            if (this.game.placeStone(row, col, color)) {
                this.draw();
                if (this.onMove) {
                    this.onMove(row, col, color);
                }
            }
        }
    }

    draw() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // 배경
        ctx.fillStyle = '#dcb35c';
        ctx.fillRect(0, 0, width, height);
        
        const margin = this.cellSize;
        const boardSize = this.cellSize * 18;
        
        // 격자선 그리기
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 19; i++) {
            const pos = margin + i * this.cellSize;
            
            // 세로선
            ctx.beginPath();
            ctx.moveTo(pos, margin);
            ctx.lineTo(pos, margin + boardSize);
            ctx.stroke();
            
            // 가로선
            ctx.beginPath();
            ctx.moveTo(margin, pos);
            ctx.lineTo(margin + boardSize, pos);
            ctx.stroke();
        }
        
        // 별(星) 표시 (3-3, 3-15, 15-3, 15-15, 9-9)
        const stars = [[3, 3], [3, 15], [15, 3], [15, 15], [9, 9]];
        ctx.fillStyle = '#000';
        stars.forEach(([row, col]) => {
            const x = margin + col * this.cellSize;
            const y = margin + row * this.cellSize;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 돌 그리기
        for (let row = 0; row < 19; row++) {
            for (let col = 0; col < 19; col++) {
                const stone = this.game.board[row][col];
                if (stone !== 0) {
                    const x = margin + col * this.cellSize;
                    const y = margin + row * this.cellSize;
                    
                    // 돌 그림자
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    ctx.beginPath();
                    ctx.arc(x + 1, y + 1, this.stoneRadius, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // 돌
                    if (stone === 1) {
                        // 흑돌
                        const gradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, this.stoneRadius);
                        gradient.addColorStop(0, '#666');
                        gradient.addColorStop(1, '#000');
                        ctx.fillStyle = gradient;
                    } else {
                        // 백돌
                        const gradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, this.stoneRadius);
                        gradient.addColorStop(0, '#fff');
                        gradient.addColorStop(1, '#ddd');
                        ctx.fillStyle = gradient;
                    }
                    
                    ctx.beginPath();
                    ctx.arc(x, y, this.stoneRadius, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // 돌 테두리
                    ctx.strokeStyle = stone === 1 ? '#333' : '#999';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        
        // 마지막 수 표시
        if (this.game.lastMove) {
            const [row, col] = this.game.lastMove;
            const x = margin + col * this.cellSize;
            const y = margin + row * this.cellSize;
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    update() {
        this.draw();
    }
}

