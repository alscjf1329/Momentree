# 마당(madang) 로고·아이콘 시안 (MOM-18, 1단계)

이름 "마당"은 상표 확인 전 잠정이다. 시안만 있고 앱 코드·기존 `public/` 아이콘은 그대로다. `compare.html`을 브라우저로 열어 비교한다.
청첩장·부고·돌잔치·파티를 모두 아우르므로 하트·반지·커플 같은 결혼 전용 상징은 쓰지 않았다.

| 안 | 컨셉 | 파일 |
|---|---|---|
| A 열린 문 | 둥근 아치 안의 빈 자리, 모이는 곳의 입구 (흰 타일) | `icon-a.svg`, `wordmark-a.svg` |
| B 둘러앉은 원 | 원형 마당에 추상 점 다섯이 둘러앉은 모양 (옅은 로즈 타일) | `icon-b.svg`, `wordmark-b.svg` |
| C 한글 마 | ㅁ(네모 마당)+ㅏ로 만든 한글 모노그램 (흰 타일) | `icon-c.svg`, `wordmark-c.svg` |

색: 타일은 흰색/옅은 로즈(#FDEEF3)에 #EBEBEB 테두리, 심볼은 로즈 #C2255C, 보조 점·글자는 sub #6B6B6B. ink #111은 쓰지 않았다.

## 글꼴 출처·라이선스
워드마크의 "마당"과 "madang"은 Noto Serif CJK KR Regular(브랜드 제목 글꼴 Noto Serif KR과 같은 글리프)를 path로 변환했다. SIL Open Font License 1.1이라 outline 포함이 허용된다. 원본 파일은 이 Mac의 Android Studio 번들(`NotoSerifCJK-Regular.ttc`)에서 가져왔으며 레포에는 넣지 않았다. SVG에 `<text>`나 폰트 참조는 없다. Apple 번들 한글 글꼴은 쓰지 않았다.

## 선택 후 교체 대상
- `public/icon.svg` (선택한 안의 icon-*.svg)
- `public/icon-192.png`, `public/icon-512.png`
- 필요 시 `public/apple-touch-icon.png`(180px), `favicon.ico` (현재 없음. `src/app/layout.tsx`의 icons 메타에 추가)
- theme-color 갱신 필요: `src/app/manifest.ts`의 `theme_color`와 `src/app/layout.tsx`의 `theme-color`가 아직 옛 갈색 `#5c4035`다. 밝은 팔레트에 맞게 바꾼다.
- 서비스명이 확정되면 manifest의 `name`/`short_name` 등 "Momentree" 표기도 함께 바꾼다.

## PNG 생성 (선택 후 실행)
macOS `sips`로 SVG 변환이 되는 것을 확인했다.

```
sips -s format png -z 512 512 docs/logo-proposals/icon-X.svg --out public/icon-512.png
sips -s format png -z 192 192 docs/logo-proposals/icon-X.svg --out public/icon-192.png
sips -s format png -z 180 180 docs/logo-proposals/icon-X.svg --out public/apple-touch-icon.png
```

512 PNG는 manifest에서 maskable이라 가장자리가 잘릴 수 있다. 선택 후 라운드 없는 정사각 변형이 필요한지 확인한다.
