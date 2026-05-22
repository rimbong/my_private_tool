# 🛠️ 개발 보조 도구 포털 (Developer Assistant Tools)

효율적인 개발 업무를 위해 반복적인 작업들을 자동화하고 시각화해주는 경량 도구 모음입니다. 별도의 서버 설치 없이 웹 브라우저에서 바로 실행 가능합니다.

## 🚀 빠른 시작

1.  `index.html` 파일을 웹 브라우저로 엽니다.
2.  대시보드에서 원하는 도구를 선택합니다.
3.  상단 내비게이션 바를 통해 다른 도구로 즉시 전환할 수 있습니다.

## 🧰 주요 도구 (현재 활성화됨)

### ✅ TODO 관리 (`todo-manager.html`)
- 월간 달력 기반의 일정 및 태스크 관리 시스템입니다.
- IndexedDB를 사용한 로컬 데이터 영구 보존 및 백업/복구 기능을 제공합니다.
- 마크다운 내보내기 기능을 지원합니다.

### 📖 MD 뷰어 (`md-viewer.html`)
- 실시간 마크다운 렌더링 및 미리보기를 제공합니다.
- **주요 특징**: 라이트/다크 모드 전환, 실시간 데바운스(Debounce) 렌더링, 코드 구문 강조(Highlight.js).
- 오프라인 사용을 위해 필수 라이브러리가 로컬(`tools/lib/`)에 내장되어 있습니다.

### 🔗 URI 도구 (`uri-tool.html`)
- URL 인코딩, 디코딩 및 쿼리 파라미터를 분석합니다.
- 디코딩된 결과에서 `?key=value` 형태의 파라미터를 자동으로 추출하여 표 형식으로 제공합니다.

### 📄 XML 변환 (`xml-converter.html`)
- HTML 엔티티(`&lt;`, `&gt;` 등)로 치환된 XML 데이터를 실제 XML 구조로 복원하고 정리합니다.

### 📝 마크다운 클리너 (`markdown-cleaner.html`)
- 마크다운 문법을 제거하고 순수 텍스트만 추출하며, 글자 수 및 단어 수를 계산합니다.

### 📋 패치 내역 생성 (`svn-log-converter.html`)
- SVN 로그 데이터를 기반으로 배포용 패치 파일 목록을 자동 생성합니다.

---

## 🧪 실험적/임시 비활성 도구
*현재 주석 처리되어 대시보드에는 보이지 않지만, 코드는 유지되고 있는 기능들입니다.*

- **SQL문 변환**: 로그의 SQL 플레이스홀더(`?`)를 실제 값으로 치환합니다.
- **SVN 머지 도구**: 브랜치 간 코드 머지 작업을 시각적으로 보조합니다.
- **Config 설정**: 프로젝트 환경 설정 파일을 시각적으로 편집합니다.
- **Classpath/Maven 설정**: Eclipse 및 Maven 설정 파일을 효율적으로 관리합니다.

## 🛠️ 기술 스택 및 라이브러리
- **Core**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Library & Utils (Internalized)**: 
  - `marked.js`: 마크다운 파싱
  - `highlight.js`: 코드 구문 강조
  - `github-markdown-css`: GitHub 스타일 렌더링
  - `db-manager.js`: IndexedDB 공통 관리 모듈 (자체 개발)
  - `shared-utils.js`: 공통 유틸리티 함수 모음 (자체 개발)
- **Storage**: 브라우저 `IndexedDB`, `LocalStorage`

## 📁 디렉토리 구조
- `index.html`: 도구 포털 메인 대시보드
- `tool.html`: 개별 도구를 실행하는 프레임워크 (상단 내비게이션 포함)
- `tools/`: 개별 도구 소스 코드 (`.html`)
- `tools/lib/`: 외부 라이브러리 및 자체 개발 공통 JS 파일 보관소
  - 외부 라이브러리: `marked.min.js`, `highlight.min.js` 등
  - 공통 모듈: `db-manager.js`, `shared-utils.js`
