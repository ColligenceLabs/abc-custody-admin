# 사이드바 메뉴 스타일 대안들

## 현재 적용된 스타일 (VS Code)
```css
border-l-3 border-l-sapphire-600 bg-gray-50 text-gray-900
```

## 대안 1: GitHub 스타일 (더 간단함)
```css
font-semibold text-sapphire-600 (배경 변경 없음)
```

## 대안 2: Material Design 스타일
```css
bg-gray-50/50 text-gray-900 (보더 없음)
```

## 대안 3: Minimal 스타일 (최소)
```css
(텍스트 그대로, 아이콘만 text-sapphire-600)
```

## 각 스타일을 적용하려면:

### GitHub 스타일로 변경:
```tsx
active ? 'font-semibold text-sapphire-600 dark:text-sapphire-400' : '...'
```

### Material Design 스타일로 변경:
```tsx
active ? 'bg-gray-50/50 text-gray-900 dark:bg-gray-800/30 dark:text-gray-100' : '...'
```

### Minimal 스타일로 변경:
```tsx
// 배경/텍스트 스타일은 그대로, 아이콘만 색상 변경
active ? '' : '...' // 아이콘: text-sapphire-600
```

현재 VS Code 스타일이 가장 무난하고 널리 사용되는 패턴입니다.