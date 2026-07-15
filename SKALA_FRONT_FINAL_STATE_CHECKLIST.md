# SKALA Front 최종 상태 체크리스트

이 문서는 JavaScript 적용 전 단계의 정적 코드 검수 결과를 기록합니다.
브라우저 실행이나 외부 권한 확인이 필요한 항목은 완료로 표시하지 않습니다.

## 필수 파일

- [x] `html/index.html`
- [x] `html/holiday.html`
- [x] `html/myProfile.html`
- [x] `html/myClass.html`
- [x] `html/signUp.html`
- [x] `html/signUpResult.html`
- [x] `html/myTrip.html`
- [x] `css/style.css`

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

## 금지 사항과 저장소 품질

- [x] 금지된 CSS·JavaScript 프레임워크와 외부 UI 라이브러리가 없다.
- [x] Google Fonts 외 외부 CSS 리소스가 없다.
- [x] JavaScript 및 `script` 태그, JavaScript 파일이 없다.
- [x] npm 패키지, `package.json`, lockfile, CSS 전처리기 파일이 없다.
- [x] 외부 미디어 hotlink가 없다.
- [x] `.DS_Store` 등 불필요한 운영체제 파일이 없고 `.gitignore`에 제외 규칙이 있다.
- [x] README가 현재 HTML/CSS 구현 단계와 JavaScript 미사용 상태를 설명한다.
- [x] `git diff --check`를 통과한다.

## 브라우저 수동 확인

- [x] Google Fonts가 네트워크 환경에서 실제로 로드되는지 확인한다.
- [x] 공통 내비게이션과 버튼의 hover·키보드 focus 상태를 확인한다.
- [x] 786px 이하에서 모든 페이지가 문서 전체 가로 스크롤 없이 1열로 표시되는지 확인한다.
- [x] 모바일 시간표가 wrapper 내부에서만 가로 스크롤되는지 확인한다.
- [x] 회원가입 폼의 브라우저 기본 유효성 검사와 GET 이동을 확인한다.
- [x] 오디오와 비디오가 대상 브라우저에서 재생되는지 확인한다.
- [x] 운영체제 reduced-motion 설정에서 animation과 transition이 최소화되는지 확인한다.
