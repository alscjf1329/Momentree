import { register } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
register("./alias-hooks.mjs", import.meta.url);
// 테스트가 실제 data/(개발 DB·메일 큐)를 건드리지 않게 기본 DATA_DIR을 임시 폴더로 둔다. 파일별로 따로 지정하면 그쪽이 우선.
process.env.DATA_DIR ||= fs.mkdtempSync(path.join(os.tmpdir(), "momentree-test-"));
