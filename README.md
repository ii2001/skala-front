# SKALA Front-End Portfolio

SKALA Full-Stack Engineering 학습 과정에서 제작한 개인 프런트엔드 포트폴리오입니다.

## 프로젝트 소개

- HTML, CSS, JavaScript로 구현한 학습 프로젝트와 인터랙티브 기능을 한곳에서 소개합니다.
- 개인 일정, 자기소개, 학습 계획, 여행 콘텐츠와 브라우저 기반 미니 프로젝트를 공통 내비게이션으로 연결했습니다.
- 외부 UI 프레임워크나 JavaScript 라이브러리 없이 직접 구현했습니다.

## 주요 기능

### HTML

- 시맨틱 HTML 구조와 페이지별 제목 계층
- 모든 주요 페이지를 연결하는 공통 내비게이션
- 시간 순서와 체크리스트로 구성한 휴일 일과
- 목록, 정의 목록과 학습 진행률을 활용한 자기소개
- `rowspan`과 `colspan`을 적용한 주간 학습 시간표
- 브라우저 기본 유효성 검사를 사용하는 회원가입 UI 데모와 정적 결과 페이지
- 로컬 이미지, 오디오, 비디오를 사용하는 제주도 여행 페이지

### CSS

- Google Fonts의 Noto Sans KR과 시스템 폰트 fallback
- CSS 변수로 구성한 라이트·다크 공통 디자인 시스템
- 히어로형 헤더, 방향성이 드러나는 카드와 페이지별 반응형 콘텐츠 배치
- Flexbox를 이용한 내비게이션과 포털 레이아웃
- Grid를 이용한 여행 및 JavaScript 미니 프로젝트 카드 레이아웃
- `786px` 이하 반응형 레이아웃
- hover와 transition 효과
- 메인 제목의 fade-in animation
- `prefers-reduced-motion` 접근성 대응
- 표, 폼, 카드와 동적 결과 영역 디자인

### JavaScript

- 1부터 50 사이의 수를 맞히는 Up-Down 숫자 맞추기
- HTML, CSS, JavaScript 점수로 총점, 평균, 등급과 합격 여부를 계산하는 성적 계산기
- 객체 배열과 DOM API를 활용한 내 가방 보기
- Open-Meteo API를 이용한 실시간 날씨 조회
- 입력값 검증, 취소와 오류 처리
- `fetch`와 `async`/`await`를 이용한 비동기 요청
- `weatherAPI.js`와 `realtimeInfo.js`의 ES Module 분리
- `AbortController`를 이용한 이전 날씨 요청 취소
- 시스템 설정과 사용자 선택을 반영하는 라이트·다크 테마 전환

## 페이지 구성

- `html/index.html`: 전체 프로젝트 포털, JavaScript 미니 프로젝트와 실시간 날씨
- `html/holiday.html`: 아침, 오후, 저녁 휴일 일과와 체크리스트
- `html/myProfile.html`: 자기소개, 목표, 성향과 현재 학습 기술
- `html/myClass.html`: 현재 학습 기술을 기준으로 구성한 주간 학습 일정
- `html/myTrip.html`: 제주도 여행 정보와 로컬 이미지·오디오·비디오
- `html/signUp.html`: 브라우저 기본 유효성 검사를 적용한 회원가입 UI 데모
- `html/signUpResult.html`: HTML GET 방식의 정적 폼 제출 결과 데모

## 폴더 구조

```text
skala-front/
├── css/
│   └── style.css
├── html/
│   ├── holiday.html
│   ├── index.html
│   ├── myClass.html
│   ├── myProfile.html
│   ├── myTrip.html
│   ├── signUp.html
│   └── signUpResult.html
├── script/
│   ├── bag.js
│   ├── grade.js
│   ├── realtimeInfo.js
│   ├── theme.js
│   ├── upDown.js
│   └── weatherAPI.js
├── media/
│   ├── audio/
│   │   └── trip-sound.mp3
│   ├── images/
│   │   ├── trip-food.jpg
│   │   ├── trip-main.jpg
│   │   └── trip-view.jpg
│   └── video/
│       └── trip-video.mp4
├── .gitignore
├── AGENTS.md
├── SKALA_FRONT_FINAL_STATE_CHECKLIST.md
└── README.md
```

## 실행 방법

1. 저장소를 복제합니다.

   ```bash
   git clone git@github.com:ii2001/skala-front.git
   ```

2. 프로젝트 폴더를 엽니다.

   ```bash
   cd skala-front
   code .
   ```

3. VS Code Live Server를 사용해 `html/index.html`을 실행합니다.

별도의 빌드 과정이나 npm 패키지 설치는 필요하지 않습니다. ES Module과 실시간 날씨 요청을 확인하려면 로컬 파일로 직접 여는 대신 Live Server와 같은 로컬 웹 서버를 사용합니다.

## 기술 스택

- HTML5
- CSS3
- Vanilla JavaScript와 브라우저 기본 API
- ES Modules
- Google Fonts
- Open-Meteo API

Bootstrap, Tailwind CSS, React, Vue, jQuery 등의 외부 UI 프레임워크나 JavaScript 라이브러리는 사용하지 않았습니다. Google Fonts와 Open-Meteo만 폰트와 날씨 데이터 제공을 위한 외부 리소스로 사용했습니다.

## 미디어 출처 및 라이선스

아래 플랫폼과 라이선스는 프로젝트 초기 자료에 제공된 정보 기준입니다. 현재 저장소와 Git 기록에서는 실제 작성자와 원본 페이지 URL을 확인할 수 없습니다.

- `trip-main.jpg`: Pexels / 작성자·원본 URL 확인 필요 / Pexels License
- `trip-food.jpg`: Pexels / 작성자·원본 URL 확인 필요 / Pexels License
- `trip-view.jpg`: Pexels / 작성자·원본 URL 확인 필요 / Pexels License
- `trip-sound.mp3`: Pixabay / 작성자·원본 URL 확인 필요 / Pixabay Content License
- `trip-video.mp4`: Pexels / 작성자·원본 URL 확인 필요 / Pexels License

공개 전에 각 파일의 작성자, 원본 URL, 사용 권한과 적용 라이선스를 다시 확인해야 합니다.

## 구현 특징

- 시맨틱 HTML과 논리적인 제목 구조, 레이블과 라이브 영역 등 웹 접근성을 고려한 마크업
- Flexbox와 Grid를 활용한 레이아웃 및 `786px` 이하 반응형 웹 디자인
- CSS transition, keyframe animation과 `prefers-reduced-motion` 대응
- `localStorage`에 선택을 저장하는 접근 가능한 라이트·다크 테마 전환
- Vanilla JavaScript 기반 DOM 조작, 사용자 입력 검증과 안전한 화면 출력
- Open-Meteo API 연동, ES Module 분리, 비동기 처리와 오류 처리
- `AbortController`를 활용한 중복 날씨 요청 관리

정적 코드 기준으로 위 기능을 구현했습니다. 브라우저별 화면 표시, `prompt`와 `alert` 흐름, 미디어 재생, 실제 Open-Meteo 응답과 빠른 도시 변경 동작은 대상 브라우저에서 직접 확인해야 합니다.
