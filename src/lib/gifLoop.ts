// GIF89a의 반복 횟수는 파일 안의 NETSCAPE2.0 Application Extension 블록에
// 박혀있다. 그 블록이 없으면 기본값이 "1회만 재생"이고, 있어도 인코더가
// 유한 횟수로 넣어두면 마지막 프레임에서 멈춘다. 업로드 시점에 그 값을
// 무한반복(0)으로 강제한다 — 없으면 새로 끼워넣고, 있으면 값만 덮어쓴다.
export function forceGifInfiniteLoop(buf: Buffer): Buffer {
  try {
    if (buf.length < 13 || buf.toString("ascii", 0, 3) !== "GIF") return buf;

    const packed = buf[10];
    const gctSize = (packed & 0x80) !== 0 ? 3 * Math.pow(2, (packed & 0x07) + 1) : 0;
    let idx = 13 + gctSize; // Header(6) + Logical Screen Descriptor(7) + GCT

    while (idx < buf.length && buf[idx] === 0x21) {
      const label = buf[idx + 1];

      if (label === 0xff) {
        const blockSize = buf[idx + 2];
        const appId = buf.subarray(idx + 3, idx + 3 + 11).toString("ascii");
        if (appId === "NETSCAPE2.0") {
          const subBlockStart = idx + 3 + blockSize;
          const subSize = buf[subBlockStart];
          if (subSize === 3 && buf[subBlockStart + 1] === 0x01) {
            buf[subBlockStart + 2] = 0x00;
            buf[subBlockStart + 3] = 0x00;
            return buf;
          }
        }
      }

      // 확장 블록 통째로 건너뛰기: Introducer(1)+Label(1)+BlockSize(1)+데이터, 이후 서브블록들을 0 터미네이터까지
      idx += 2;
      const size = buf[idx];
      idx += 1 + size;
      while (idx < buf.length && buf[idx] !== 0x00) idx += 1 + buf[idx];
      idx += 1;
    }

    // NETSCAPE 확장이 아예 없었던 경우 — 첫 블록(이미지/확장) 바로 앞에 새로 삽입
    const netscapeBlock = Buffer.concat([
      Buffer.from([0x21, 0xff, 0x0b]),
      Buffer.from("NETSCAPE2.0", "ascii"),
      Buffer.from([0x03, 0x01, 0x00, 0x00, 0x00]),
    ]);
    return Buffer.concat([buf.subarray(0, idx), netscapeBlock, buf.subarray(idx)]);
  } catch {
    return buf;
  }
}
