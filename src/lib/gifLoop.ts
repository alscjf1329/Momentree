// GIF89a의 반복 재생은 파일 안의 NETSCAPE2.0 Application Extension 블록으로
// 결정된다. 이 블록이 아예 없으면 뷰어는 딱 1회만 재생하고 마지막 프레임에서
// 멈춘다 — 이게 우리가 원하는 동작. 블록이 있으면(대부분 무한반복=0으로 박혀서
// 나옴) 계속 반복 재생돼버리므로, 업로드 시점에 그 블록을 통째로 제거해서
// "한 번만 재생하고 정지"를 강제한다.
export function forceGifPlayOnce(buf: Buffer): Buffer {
  try {
    if (buf.length < 13 || buf.toString("ascii", 0, 3) !== "GIF") return buf;

    const packed = buf[10];
    const gctSize = (packed & 0x80) !== 0 ? 3 * Math.pow(2, (packed & 0x07) + 1) : 0;
    let idx = 13 + gctSize; // Header(6) + Logical Screen Descriptor(7) + GCT

    while (idx < buf.length && buf[idx] === 0x21) {
      const label = buf[idx + 1];
      const blockStart = idx;

      // 확장 블록 하나의 끝 위치 계산: Introducer(1)+Label(1)+BlockSize(1)+데이터, 서브블록들을 0 터미네이터까지
      let cursor = idx + 2;
      const size = buf[cursor];
      cursor += 1 + size;
      while (cursor < buf.length && buf[cursor] !== 0x00) cursor += 1 + buf[cursor];
      cursor += 1;

      if (label === 0xff) {
        const appId = buf.subarray(idx + 3, idx + 3 + 11).toString("ascii");
        if (appId === "NETSCAPE2.0") {
          // 이 블록만 잘라내고 나머지는 그대로 이어붙임
          return Buffer.concat([buf.subarray(0, blockStart), buf.subarray(cursor)]);
        }
      }

      idx = cursor;
    }

    return buf; // NETSCAPE 확장이 원래 없었으면 이미 1회 재생 후 정지 — 손댈 것 없음
  } catch {
    return buf;
  }
}
