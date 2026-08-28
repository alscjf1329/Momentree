const locks = new Map<string, Promise<unknown>>();

// 같은 key(슬러그)에 대한 읽기→수정→쓰기 전체를 순서대로 직렬화.
// 파일 전체를 읽고 다시 쓰는 라우트에서 동시 요청이 겹치면 나중에 쓴 쪽이
// 앞선 쓰기를 통째로 덮어써서 데이터가 조용히 사라지는(lost update) 문제를 막음.
// 주의: 프로세스 내부 메모리 락이라 인스턴스가 1개일 때만 완전히 유효함.
export function withFileLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const run = (locks.get(key) ?? Promise.resolve()).then(fn, fn);
  locks.set(key, run.catch(() => {}));
  run.finally(() => {
    if (locks.get(key) === run) locks.delete(key);
  });
  return run;
}
