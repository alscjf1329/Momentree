import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import type { RsvpEntry } from "@/app/api/rsvp/route";

const RSVP_DIR = path.join(process.cwd(), "data", "rsvp");

async function getSlugs(): Promise<string[]> {
  try {
    const files = await fs.readdir(RSVP_DIR);
    return files.filter(f => f.endsWith(".json")).map(f => f.replace(".json", "")).sort();
  } catch {
    return [];
  }
}

async function getRsvps(slug: string): Promise<RsvpEntry[]> {
  try {
    const raw = await fs.readFile(path.join(RSVP_DIR, `${slug}.json`), "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ file?: string }>;
}) {
  const { file } = await searchParams;
  const slugs = await getSlugs();
  const rsvps = file ? await getRsvps(file) : [];
  const attending = rsvps.filter(r => r.attendance === "attending");
  const totalGuests = attending.reduce((sum, r) => sum + parseInt(r.guests || "1"), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-5">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">RSVP 참석 현황</h1>
        <p className="text-xs text-gray-400 mt-0.5">고객을 선택하면 해당 청첩장의 응답을 확인합니다</p>
      </div>

      {/* 클라이언트 셀렉터 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-3">고객 선택</p>
        {slugs.length === 0 ? (
          <p className="text-xs text-gray-400">아직 RSVP 응답이 없습니다</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slugs.map(s => (
              <Link key={s} href={`/admin?file=${s}`}
                className={`px-3 py-1.5 text-xs font-mono rounded-full border transition-colors ${
                  file === s
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}>
                {s}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 선택된 고객의 RSVP */}
      {file ? (
        <>
          {/* 요약 */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            {[
              { label: "총 응답", value: rsvps.length, color: "text-gray-800" },
              { label: "참석", value: attending.length, color: "text-green-600" },
              { label: "예상 인원", value: totalGuests, color: "text-blue-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl p-4 sm:p-5 shadow-sm text-center border border-gray-100">
                <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {rsvps.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
              <p className="text-sm">아직 응답이 없습니다</p>
              <p className="text-xs mt-1 font-mono text-gray-300">{file}</p>
            </div>
          ) : (
            <>
              {/* 모바일: 카드 */}
              <div className="space-y-3 sm:hidden">
                {rsvps.map((r, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{r.name}</span>
                      {r.attendance === "attending"
                        ? <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">✓ 참석 {r.guests}명</span>
                        : <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">불참</span>
                      }
                    </div>
                    {r.message && <p className="text-xs text-gray-500 mb-2">{r.message}</p>}
                    <p className="text-[10px] text-gray-400">
                      {new Date(r.submittedAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>

              {/* 데스크탑: 테이블 */}
              <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["이름", "참석", "인원", "메시지", "제출 시각"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps.map((r, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                        <td className="px-4 py-3">
                          {r.attendance === "attending"
                            ? <span className="text-green-600 text-xs font-medium">✓ 참석</span>
                            : <span className="text-gray-400 text-xs">불참</span>}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600 text-xs">
                          {r.attendance === "attending" ? `${r.guests}명` : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-[240px] truncate text-xs">{r.message || "-"}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(r.submittedAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 bg-gray-50 text-xs text-gray-400 flex justify-between border-t border-gray-100">
                  <span>불참: {rsvps.length - attending.length}명</span>
                  <span>참석 총 인원: {totalGuests}명</span>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
          <p className="text-sm">위에서 고객을 선택하세요</p>
        </div>
      )}
    </div>
  );
}
