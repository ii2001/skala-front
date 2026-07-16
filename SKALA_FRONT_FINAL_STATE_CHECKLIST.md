# SKALA Front 최종 상태 체크리스트

이 문서는 HTML, CSS, JavaScript 최종 상태의 정적 코드 검수 결과를 기록합니다.
정적 코드로 직접 확인한 항목만 완료로 표시하며, 브라우저 실행이나 외부 권한 확인이 필요한 항목은 완료로 표시하지 않습니다.

## 필수 파일

- [x] `html/index.html`
- [x] `html/holiday.html`
- [x] `html/myProfile.html`
- [x] `html/myClass.html`
- [x] `html/signUp.html`
- [x] `html/signUpResult.html`
- [x] `html/myTrip.html`
- [x] `css/style.css`
- [x] `script/upDown.js`
- [x] `script/grade.js`
- [x] `script/bag.js`
- [x] `script/weatherAPI.js`
- [x] `script/realtimeInfo.js`

## HTML 구조와 콘텐츠

- [x] 모든 페이지에 HTML5 문서 구조, 한국어 언어 설정, charset, viewport, description, title이 있다.
- [x] 모든 페이지에 의미 있는 `h1`이 하나씩 있고 제목 단계가 순서대로 작성되어 있다.
- [x] 모든 페이지에 공통 내비게이션, `main`, `footer`, `small`이 있다.
- [x] `holiday.html`에 `h1`, `h2`, `p`, `br`, `mark`, `ol`, `li`, `time`, `strong`, `aside`, `details`, `summary`가 있다.
- [x] `myProfile.html`에 `ul`, `ol`, `dl`, `dt`, `dd`와 자기소개 관련 시맨틱 요소가 있다.
- [x] `myClass.html`에 `table`, `caption`, `thead`, `tbody`, `rowspan`, `colspan`이 있다.
- [x] `signUp.html`에 필수 폼 요소와 submit/reset 버튼이 있다.
- [x] `signUpResult.html`에 정적 가입 완료 안내와 회원가입·메인 이동 링크가 있다.
- [x] `myTrip.html`에 이미지, figure, 오디오·비디오와 내부 source, 보조 콘텐츠가 있다.
- [x] `index.html`에서 모든 주요 페이지로 이동할 수 있다.
- [x] `index.html`에 세 JavaScript 실습 카드와 실시간 날씨 선택·결과 영역이 있다.

## HTML 품질

- [x] 명시적으로 작성한 HTML 태그의 시작·종료 중첩이 일치한다.
- [x] 페이지별 중복 `id`가 없다.
- [x] 회원가입 폼의 모든 제출 컨트롤에 `name`이 있다.
- [x] 회원가입 폼의 모든 `label[for]`가 해당 컨트롤 `id`와 연결된다.
- [x] 지정된 필수 폼 컨트롤에 `required`가 있다.
- [x] 시간표의 모든 행이 `rowspan`과 `colspan`을 포함해 논리적으로 6열이다.
- [x] 모든 여행 이미지에 비어 있지 않은 구체적인 `alt`가 있다.
- [x] 오디오와 비디오 source에 각각 `audio/mpeg`, `video/mp4`가 있다.
- [x] 로컬 이미지 3개, 오디오 1개, 동영상 1개가 비어 있지 않은 실제 파일로 존재한다.
- [x] 내부 링크와 미디어 상대경로가 실제 파일명 및 대소문자와 일치한다.
- [x] 인라인 style, 인라인 이벤트, 오래된 표현용 HTML 속성이 없다.

## CSS

- [x] 모든 HTML 페이지에 `../css/style.css`가 한 번씩 연결되어 있다.
- [x] 모든 HTML 페이지에 동일한 Noto Sans KR 공식 Google Fonts 링크가 한 번씩 연결되어 있다.
- [x] CSS 변수, 전역 Box Model, 공통 테마와 컨테이너가 구현되어 있다.
- [x] 폼, 표, 카드, 내비게이션의 공통 디자인이 구현되어 있다.
- [x] index 바로가기에 Flexbox가 적용되어 있다.
- [x] index 본문과 aside에 데스크톱 2열 레이아웃이 적용되어 있다.
- [x] 여행 카드에 데스크톱 3열 Grid가 적용되어 있다.
- [x] `@media (max-width: 786px)`와 모바일 1열 규칙이 있다.
- [x] 내비게이션과 폼 버튼에 transition이 있다.
- [x] 여행 카드 hover 이동·그림자 효과가 있다.
- [x] index `h1`에 한 번 실행되는 fade-in animation이 있다.
- [x] `prefers-reduced-motion` 대응이 있다.
- [x] 시간표 wrapper에 내부 가로 스크롤 규칙이 있다.
- [x] JavaScript 실습 카드와 결과 상태에 공통 디자인 및 모바일 1열 규칙이 있다.
- [x] 날씨 로딩·성공·오류 상태와 반응형 select·결과 영역 스타일이 있다.

## JavaScript 필수 과제

- [x] `index.html`의 세 기초 기능 버튼과 결과 영역 ID가 스크립트의 DOM 조회 ID와 일치한다.
- [x] `upDown.js`, `grade.js`, `bag.js`는 `defer`로 한 번씩, `realtimeInfo.js`는 `type="module"`로 한 번 연결되어 있다.
- [x] Up-Down은 `Math.random()`과 `Math.floor()`로 1~50 정답을 만들고 `prompt` 반복, Up/Down, 유효 시도 횟수와 완료 출력을 구현한다.
- [x] Up-Down에는 취소, 빈 입력, 숫자가 아닌 값, 비정수와 범위 밖 입력을 시도 횟수에서 제외하는 분기가 있다.
- [x] 성적 계산기는 HTML, CSS, JavaScript 배열과 `for`문을 사용하고 과목별 0~100 입력 및 취소 분기를 구현한다.
- [x] 성적 계산기는 총점, 소수점 첫째 자리 평균, A~F 등급과 60점 기준 합격 여부를 `alert`와 화면에 출력한다.
- [x] 가방 보기는 `showMyBag` 함수와 물품 객체 배열을 사용하고 반복문으로 종류 수와 전체 수량을 계산한다.
- [x] 가방 결과는 기존 출력을 정리한 뒤 `createElement`, `textContent`, `append`로 안전하게 다시 만든다.
- [x] 날씨 UI에는 연결된 label, `city-select`, 네 도시의 위·경도와 `aria-live`·`aria-busy`가 있는 `weather-box`가 있다.
- [x] `weatherAPI.js`는 Open-Meteo 요청을 export하고 좌표, HTTP 상태, 온도·습도·단위·시간 응답을 검증한다.
- [x] `realtimeInfo.js`는 날씨 함수를 import하고 change 이벤트, 로딩·성공·오류 출력과 `try`/`catch`를 구현한다.
- [x] 날씨 요청은 `AbortController`, 요청 번호와 컨트롤러 동일성 검사로 이전 응답의 덮어쓰기를 방지한다.
- [x] 일반 스크립트는 IIFE로 격리되고 날씨 코드는 모듈 범위를 사용해 전역 이름 충돌을 방지한다.
- [x] 모든 이벤트는 요소 존재 확인 후 `addEventListener`로 한 번씩 연결되며 미사용 변수나 함수가 없다.
- [x] 동적 DOM 출력에 사용자·API 문자열을 `innerHTML`로 삽입하지 않고 `textContent` 또는 안전한 DOM 생성을 사용한다.

## 금지 사항과 저장소 품질

- [x] 금지된 CSS·JavaScript 프레임워크와 외부 UI 라이브러리가 없다.
- [x] Google Fonts 외 외부 CSS 리소스가 없다.
- [x] JavaScript는 Vanilla JavaScript와 브라우저 기본 API만 사용한다.
- [x] npm 패키지, `package.json`, lockfile, CSS 전처리기 파일이 없다.
- [x] API 키, 인증 토큰과 비밀정보가 없다.
- [x] 외부 미디어 hotlink가 없다.
- [x] `.DS_Store` 등 불필요한 운영체제 파일이 없고 `.gitignore`에 제외 규칙이 있다.
- [ ] README가 현재 HTML/CSS/JavaScript 구현 상태를 설명한다. (JavaScript 적용 전 문구 갱신 필요)
- [x] `git diff --check`를 통과한다.

## 브라우저 수동 확인

- [ ] Google Fonts가 네트워크 환경에서 실제로 로드되는지 확인한다.
- [ ] 공통 내비게이션과 버튼의 hover·키보드 focus 상태를 확인한다.
- [ ] 786px 이하에서 모든 페이지가 문서 전체 가로 스크롤 없이 1열로 표시되는지 확인한다.
- [ ] 모바일 시간표가 wrapper 내부에서만 가로 스크롤되는지 확인한다.
- [ ] 회원가입 폼의 브라우저 기본 유효성 검사와 GET 이동을 확인한다.
- [ ] 오디오와 비디오가 대상 브라우저에서 재생되는지 확인한다.
- [ ] 운영체제 reduced-motion 설정에서 animation과 transition이 최소화되는지 확인한다.
- [ ] Up-Down의 prompt 재입력, Up/Down, 취소와 정답 완료 흐름을 브라우저에서 확인한다.
- [ ] 성적 계산기의 경계 점수, 잘못된 입력 재요청, 취소, alert와 화면 결과를 확인한다.
- [ ] 가방 보기 버튼을 반복해서 눌러 목록이 중복되지 않고 합계가 올바르게 표시되는지 확인한다.
- [ ] 네 도시의 실제 Open-Meteo 응답에서 온도, 상대습도, 단위와 기준 시간이 표시되는지 확인한다.
- [ ] 도시를 빠르게 바꾸거나 네트워크를 차단했을 때 최신 결과와 오류 안내가 올바른지 확인한다.
- [ ] JavaScript 실행 중 브라우저 콘솔 오류와 누락된 리소스 요청이 없는지 확인한다.
