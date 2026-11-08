# 마당(madang) 로고·아이콘 시안 (MOM-18, 1단계)

**선택: B(흰 배경).** 아이콘은 `public/`에 적용했다(`icon-b.svg`의 타일은 흰색). A·C는 보관용이다.

이름 "마당"은 상표 확인 전 잠정이다. 시안만 있고 앱 코드·기존 `public/` 아이콘은 그대로다. `compare.html`을 브라우저로 열어 비교한다.
청첩장·부고·돌잔치·파티를 모두 아우르므로 하트·반지·커플 같은 결혼 전용 상징은 쓰지 않았다.

| 안 | 컨셉 | 파일 |
|---|---|---|
| A 열린 문 | 둥근 아치 안의 빈 자리, 모이는 곳의 입구 (흰 타일) | `icon-a.svg`, `wordmark-a.svg` |
| B 둘러앉은 원 | 원형 마당에 추상 점 다섯이 둘러앉은 모양 (흰 타일) | `icon-b.svg`, `wordmark-b.svg` |
| C 한글 마 | ㅁ(네모 마당)+ㅏ로 만든 한글 모노그램 (흰 타일) | `icon-c.svg`, `wordmark-c.svg` |

색: 타일은 흰색에 #EBEBEB 테두리, 심볼은 로즈 #C2255C, 보조 점·글자는 sub #6B6B6B. ink #111은 쓰지 않았다.

## 글꼴 출처·라이선스
워드마크의 "마당"과 "madang"은 Noto Serif CJK KR Regular(브랜드 제목 글꼴 Noto Serif KR과 같은 글리프)를 path로 변환했다. SIL Open Font License 1.1이라 outline 포함이 허용된다. 원본 파일은 이 Mac의 Android Studio 번들(`NotoSerifCJK-Regular.ttc`)에서 가져왔으며 레포에는 넣지 않았다. SVG에 `<text>`나 폰트 참조는 없다. Apple 번들 한글 글꼴은 쓰지 않았다.

## 적용 결과
- `public/icon.svg`: B 흰 타일(#EBEBEB 테두리, 둥근 모서리)
- `icon-192.png`, `icon-512.png`: 위와 같은 모양, manifest `purpose: "any"`
- `icon-512-maskable.png`: 테두리·모서리 없이 전체 흰색, 기호는 중앙 안전영역 안(반지름 172/256), `purpose: "maskable"`
- `apple-touch-icon.png`(180px): 전체 흰색 채움, `layout.tsx`의 link로 연결
- theme-color와 theme_color는 #ffffff로 변경. 서비스명(manifest name 등)은 상표 확인 후 바꾼다.

생성 명령(sips): `sips -s format png -z 512 512 public/icon.svg --out public/icon-512.png`, 마스카블·애플 아이콘은 icon-b.svg의 rect를 흰 전체 사각형으로 바꾼 SVG를 같은 방식으로 변환.
