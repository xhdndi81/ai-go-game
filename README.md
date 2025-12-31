# ⚫⚪ 꼬마 바둑 선생님 - AI와 함께하는 바둑 여행

> **아이들을 위한 친절한 AI 바둑 게임입니다.** OpenAI GPT를 활용하여 아이들이 바둑을 배우고 즐길 수 있도록 도와주는 웹 애플리케이션입니다.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-blue)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📖 프로젝트 소개

**꼬마 바둑 선생님**은 초등학생을 위한 교육용 바둑 게임입니다. AI가 아이의 이름을 부르며 격려하고 칭찬하는 친절한 멘트로 바둑을 가르칩니다. 싱글 플레이어 모드에서는 난이도별 AI와 대결할 수 있습니다.

### ✨ 주요 기능

- 🤖 **AI 바둑 상대**: 규칙 기반 AI와 OpenAI GPT를 결합한 지능형 바둑 상대
- 🎯 **난이도 조절**: 쉬움, 보통, 어려움, 마스터 4단계 난이도 선택
- 👶 **아이 친화적 UI**: 초등학생도 쉽게 사용할 수 있는 직관적이고 따뜻한 인터페이스
- 💬 **음성 격려 멘트**: Web Speech API(TTS)를 활용하여 AI가 아이의 이름을 부르며 친절하게 격려
- 📊 **자동 게임 기록**: 승패 결과를 DB에 자동 저장하여 아이의 성장 과정을 추적
- 🎮 **바둑 규칙 구현**: 자충수 방지, 코(ko) 규칙, 사석 처리 등 기본 바둑 규칙 완벽 구현
- 📱 **PWA 지원**: 스마트폰과 태블릿에서도 홈 화면에 추가하여 앱처럼 사용 가능

---

## 🛠️ 기술 스택

### Backend
- **Java 17 / Spring Boot 3.2.0**
- **Spring Data JPA**: 데이터베이스 ORM
- **Spring WebSocket**: STOMP 프로토콜 기반 실시간 통신
- **MariaDB**: 관계형 데이터베이스
- **Lombok**: 효율적인 Java 코드 작성

### Frontend
- **HTML5 / CSS3 / JavaScript (Vanilla JS + jQuery)**
- **Canvas API**: 바둑판 렌더링 (19x19)
- **SockJS / Stomp.js**: 웹소켓 클라이언트 라이브러리

### AI & Speech
- **OpenAI GPT-4o-mini**: 상황별 친절한 바둑 코멘트 생성
- **Web Speech API**: 시스템 TTS를 이용한 한국어 음성 출력
- **규칙 기반 AI**: 난이도별 전략 알고리즘 (로컬 실행)

---

## 📁 프로젝트 구조

모듈화된 구조로 유지보수가 용이하도록 설계되었습니다.

```
src/main/
├── java/com/go/ai/
│   ├── config/             # WebSocket, JPA 등 앱 설정
│   ├── controller/         # API 및 WebSocket 엔드포인트
│   ├── dto/                # 데이터 전송 객체
│   ├── entity/             # DB 테이블 매핑 (User, GameRoom, GameHistory)
│   ├── listener/           # WebSocket 연결/해제 이벤트 리스너
│   ├── repository/         # DB 접근 인터페이스
│   └── service/            # 핵심 비즈니스 로직 (AI 분석, 방 관리)
└── resources/
    ├── static/
    │   ├── js/
    │   │   ├── go-game.js          # 바둑 게임 로직 클래스
    │   │   ├── go-board.js          # 바둑판 UI 클래스
    │   │   ├── app.js               # 공통 로직 및 UI 제어
    │   │   ├── single-player.js     # 싱글 모드 (AI 대전) 로직
    │   │   └── multiplayer.js      # 멀티 모드 (WebSocket) 로직
    │   ├── css/
    │   │   └── style.css            # 스타일시트
    │   ├── index.html               # 메인 페이지
    │   ├── waiting-rooms.html       # 대기방 목록 조각 (동적 로드)
    │   └── manifest.json            # PWA 매니페스트
    └── application.yml              # 설정 파일
```

---

## 🚀 설치 및 실행 방법

### 1. 사전 요구사항
- **JDK 17 이상**
- **MariaDB** (또는 MySQL)
- **OpenAI API Key** (선택사항 - 코멘트 기능 사용 시)

### 2. 데이터베이스 설정
```sql
CREATE DATABASE go CHARACTER SET utf8mb4;
```

### 3. 설정 파일 수정
`src/main/resources/application.yml` 파일에서 데이터베이스 연결 정보를 수정합니다.

```yaml
spring:
  datasource:
    url: jdbc:mariadb://your-db-host:3306/your-database-schema
    username: your-username
    password: your-password
```

### 4. API 키 설정 (선택사항)
`src/main/resources/application-local.yml` 파일을 생성하고 OpenAI API 키를 입력합니다.

```yaml
openai:
  api:
    key: your-api-key-here
```

### 5. 실행
```bash
mvn spring-boot:run
```
접속 주소: `http://localhost:8080`

---

## 🎮 게임 모드 설명

### 🌱 혼자하기 (Single Mode)
- **난이도 선택**: 쉬움, 보통, 어려움, 마스터 4단계 조절 가능
- **AI 전략**:
  - 쉬움: 완전 랜덤
  - 보통: 중앙 선호 + 연결 선호
  - 어려움: 중앙 선호 + 연결 선호 + 끊기 선호
  - 마스터: 강한 전략 알고리즘
- **AI 코멘트**: 수를 둘 때마다 GPT가 친절하게 칭찬하거나 조언해줍니다 (30% 확률)
- **재촉 기능**: 아이가 고민에 빠지면 AI가 다정하게 말을 건넵니다

### 🤝 같이하기 (Multiplayer Mode)
- **대기방 목록**: 현재 대기 중인 친구의 방을 확인하고 입장합니다
- **실시간 대결**: 웹소켓을 통해 지연 없는 실시간 대결이 가능합니다
- **중도 이탈 처리**: 상대방이 게임 중 접속을 끊으면 자동으로 남은 사람이 승리 처리됩니다
- **승자 권한**: 게임 종료 후 승리자에게만 '새 게임' 시작 권한이 주어집니다

---

## 🎯 바둑 규칙 구현

- ✅ **착수 규칙**: 빈 교차점에만 돌 놓기
- ✅ **자충수 방지**: 자유도가 없으면 착수 불가
- ✅ **코(ko) 규칙**: 바로 이전에 포획한 위치에는 착수 불가
- ✅ **사석 처리**: 둘러싸인 돌 자동 제거
- ✅ **집계 계산**: 포획한 돌 수 기준 (간단한 버전)
- ✅ **게임 종료**: 양쪽 모두 패스 시 게임 종료

---

## 💰 AI 사용 비용

프로젝트는 비용 효율적으로 설계되었습니다:

- **바둑 수 계산**: 로컬 규칙 기반 AI 사용 (무료)
- **코멘트 생성**: OpenAI GPT-4o-mini 사용 (30% 확률로 호출)
- **예상 비용**: 게임당 약 0.3-1원, 월간 약 3,000-90,000원 (사용량에 따라)

---

## 👨‍👩‍👧‍👦 제작자
**소희, 선우 아빠 ❤️**  
아이들이 바둑을 통해 생각하는 즐거움을 배우길 바라는 마음으로 만들었습니다.

---

**즐거운 바둑 여행을 시작해보세요! ⚫⚪**

