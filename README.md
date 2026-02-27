<div align="center">

```
██████╗  █████╗ ████████╗██╗  ██╗███████╗██╗███╗   ██╗██████╗ ███████╗██████╗ 
██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██╔════╝██║████╗  ██║██╔══██╗██╔════╝██╔══██╗
██████╔╝███████║   ██║   ███████║█████╗  ██║██╔██╗ ██║██║  ██║█████╗  ██████╔╝
██╔═══╝ ██╔══██║   ██║   ██╔══██║██╔══╝  ██║██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗
██║     ██║  ██║   ██║   ██║  ██║██║     ██║██║ ╚████║██████╔╝███████╗██║  ██║
╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝
```

**경로 탐색 알고리즘 시각화 도구**

*사이버펑크 감성의 인터랙티브 그리드에서 알고리즘이 길을 찾는 과정을 실시간으로 목격하라*

![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6e9f18?style=flat-square&logo=vitest&logoColor=white)

</div>

---

## 개요

Pathfinder는 그래프 탐색 알고리즘을 시각적으로 학습할 수 있는 인터랙티브 웹 애플리케이션이다. 추상적인 의사코드 대신, 실제 알고리즘이 격자 위에서 어떻게 동작하는지를 프레임 단위로 관찰할 수 있다.

**Canvas API** 기반 렌더링으로 1,200개 이상의 셀을 60fps로 부드럽게 애니메이션하며, 방문 순서·최단경로·가중치 셀을 실시간으로 구분해서 표시한다.

---

## 기능

### 알고리즘

| 알고리즘 | 최단경로 보장 | 가중치 지원 | 특징 |
|---|:---:|:---:|---|
| **Dijkstra** | ✅ | ✅ | 가중치 그래프의 최단경로 표준 |
| **A\* Search** | ✅ | ✅ | 휴리스틱으로 Dijkstra보다 빠름 |
| **Breadth-First Search** | ✅ | ❌ | 비가중치 그래프에서 최적 |
| **Bellman-Ford** | ✅ | ✅ | 음수 가중치 처리 가능 |
| **Bidirectional BFS** | ✅ | ❌ | 양끝에서 동시 탐색, 탐색 범위 절반 |
| **Depth-First Search** | ❌ | ❌ | 최단경로 미보장, 깊이 우선 |
| **Greedy Best-First** | ❌ | ❌ | 휴리스틱만 사용, 빠르지만 부정확 |

### 인터랙션

```
마우스 클릭 / 드래그   →   벽 그리기
Shift + 드래그         →   벽 지우기
S 셀 드래그            →   시작점 이동
E 셀 드래그            →   도착점 이동
```

### 시각화 제어

- **시각화** / **일시정지** / **재개** / **중지**
- 속도 조절 — 빠름 / 보통 / 느림
- 경로 초기화 (벽 유지)
- 그리드 전체 초기화

### 완료 후 통계

알고리즘 종료 시 헤더에 자동으로 표시된다:

- 최단경로 보장 여부
- 방문한 셀 수
- 경로 길이 (칸)
- 실행 시간 (ms)

---

## 시작하기

### 요구사항

- Node.js 18+
- pnpm 10+

### 설치 및 실행

```bash
# 저장소 클론
git clone <repo-url>
cd Pathfinder

# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev
```

브라우저에서 `http://localhost:5173` 접속.

### 빌드

```bash
pnpm build      # 프로덕션 빌드
pnpm preview    # 빌드 결과 미리보기
```

### 테스트

```bash
pnpm test           # 감시 모드
pnpm test --run     # 1회 실행
pnpm test:coverage  # 커버리지 리포트
```

---

## 기술 스택

| 분류 | 기술 |
|---|---|
| 프레임워크 | React 19 |
| 언어 | TypeScript 5.9 |
| 빌드 | Vite 7 |
| 스타일 | Tailwind CSS 4 |
| 상태 관리 | Zustand 5 |
| 렌더링 | HTML5 Canvas API |
| 테스트 | Vitest 4 |

---

## 프로젝트 구조

```
src/
├── algorithms/               # 알고리즘 구현체
│   ├── astar.ts
│   ├── bfs.ts
│   ├── bellman-ford.ts
│   ├── bidirectional-bfs.ts
│   ├── dijkstra.ts
│   ├── dfs.ts
│   ├── greedy-bfs.ts
│   ├── utils.ts              # MinHeap, toKey, buildResult 등
│   ├── index.ts              # runAlgorithm 진입점
│   └── __tests__/
│       └── algorithms.test.ts
├── components/
│   ├── Board/
│   │   └── Board.tsx         # Canvas 렌더러 + 마우스 이벤트
│   ├── Header/
│   │   ├── Header.tsx        # 컨트롤 패널
│   │   └── CustomSelect.tsx  # 커스텀 드롭다운 컴포넌트
│   └── Legend/
│       └── Legend.tsx        # 색상 범례
├── hooks/
│   └── useVisualization.ts   # 시각화 루프 제어
├── store/
│   └── visualizer.ts         # Zustand 전역 상태
├── types/
│   └── index.ts              # 공유 타입 및 상수
├── App.tsx
└── index.css                 # Tailwind + CSS 변수
```

---

## 렌더링 아키텍처

DOM 대신 **Canvas API**를 직접 사용한다. 셀 1,200개(22×55)를 매 프레임 개별 DOM 노드로 관리하면 레이아웃 스래싱이 발생하기 때문이다.

```
Grid 상태 변경 (Zustand)
  → useEffect 감지
  → 변경된 셀에 CellAnim 등록 (startTime, duration, type)
  → requestAnimationFrame 루프 시작
  → 매 프레임: progress 계산 → easing 함수 적용 → Canvas 직접 그리기
  → 모든 애니메이션 완료 시 rAF 루프 자동 정지
```

셀 타입별 이징:
- `visited` — `easeOutElastic` (탄성 팝)
- `path` — `easeOutBack` (오버슈트)
- `wall` — `easeOutCubic` (부드러운 슬라이드)

---

## 색상 팔레트

```
배경     #080818   ████  어두운 네이비
빈 셀    #0a0a1a   ████  딥 다크
벽       #372d5a   ████  보라빛 슬레이트
시작     #00e676   ████  네온 그린
도착     #e040fb   ████  핫 마젠타
방문     #00e5ff   ████  네온 사이언
경로     #ffd600   ████  골든 옐로우
가중치   #5028dc   ████  사이버 퍼플
```

---

<div align="center">

*알고리즘은 아름답다. 그것이 길을 찾는 순간은 더욱.*

</div>
