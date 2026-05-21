**✅ 좋은 질문입니다.** 

마우스 이벤트 순서는 꽤 중요하고, 특히 **드래그 + 클릭 + 더블클릭**이 같이 있는 경우에는 반드시 이해해야 하는 부분입니다.

### 1. 기본적인 마우스 이벤트 발생 순서

하나의 **일반 클릭**일 때 순서:

1. `mousedown`
2. `mouseup`
3. `click`

**빠른 더블클릭**일 때:

1. `mousedown`
2. `mouseup`
3. `click` ← 첫 번째 클릭
4. `mousedown`
5. `mouseup`
6. `click` ← 두 번째 클릭
7. `dblclick`

---

### 2. **드래그**를 했을 때의 이벤트 순서 (가장 중요)

사용자가 드래그를 하는 경우:

1. `mousedown` (드래그 시작)
2. `mouseover` (여러 번 발생)
3. `mouseup` (드래그 종료)
4. **`click`** ← **여기서 중요!**  
   → 브라우저는 **mouseup 직후에 click 이벤트를 발생**시킵니다.  
   (드래그를 했더라도 click 이벤트가 발생함)

→ 즉, **드래그를 해도 `click` 이벤트는 거의 항상 발생**합니다.

---

### 3. 당신 코드에서 현재 일어나는 일

```js
mousedown → (isDragging = true)

mouseover → (dragEnd 업데이트, wasDragged = true)

mouseup → (isDragging = false, 모달 열림, setTimeout으로 wasDragged 초기화)

→ click 이벤트 발생 → if (wasDragged || isDragging) return;  // 이 조건으로 차단
```

이 구조는 **대체로 잘 작동**하지만, 타이밍에 따라 약간 불안정할 수 있습니다.

### 이벤트 발생 순서 정리 (실제 상황별)

| 상황                  | 이벤트 발생 순서                              | wasDragged | click 실행 여부 |
|-----------------------|---------------------------------------------|------------|-----------------|
| 일반 단일 클릭        | mousedown → mouseup → click                 | false      | 실행            |
| 빠른 더블클릭        | mousedown → up → click → mousedown → up → click → dblclick | false      | 첫 click 실행   |
| 드래그 후 mouseup     | mousedown → mouseover → mouseup → **click** | true       | **차단**        |
| 드래그 후 dblclick    | (거의 발생 안 함)                           | true       | 차단            |

---

### 개선 제안 (더 안정적으로 만들기)

현재 `wasDragged`를 `mouseover`에서 설정하는 방식은 조금 불안정합니다. 아래처럼 수정하는 것을 추천합니다:

```js
// mouseup 핸들러
window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    
    isDragging = false;
    
    const isActualDrag = dragStart !== dragEnd;
    
    if (isActualDrag) {
        wasDragged = true;
        // 범위 선택 모달 열기
        if (dragStart && dragEnd) {
            const start = dragStart < dragEnd ? dragStart : dragEnd;
            const end = dragStart < dragEnd ? dragEnd : dragStart;
            document.getElementById('modalStartInput').value = start;
            document.getElementById('modalEndInput').value = end;
            openRangeModal();
        }
    }

    setTimeout(() => {
        wasDragged = false;
        dragStart = null;
        dragEnd = null;
        updateCalendarClasses();
    }, 120);   // 조금 더 여유롭게
});
```

그리고 `click` 이벤트에서는:

```js
grid.addEventListener('click', (e) => {
    if (wasDragged) return;   // 드래그였으면 무시
    
    // ... 나머지 코드
});
```

---

**요약**

- `mousedown` → `mouseup` → `click` 은 **거의 항상** 이 순서로 옵니다.
- 드래그를 해도 `click` 이벤트는 발생합니다. (브라우저 기본 동작)
- 그래서 `wasDragged` 같은 플래그로 **"이번 click은 드래그 때문에 생긴 거야"** 라고 명시적으로 알려줘야 합니다.

필요하면 이벤트 순서를 실시간으로 콘솔에 찍어볼 수 있는 디버깅 코드도 만들어 드릴 수 있어요.