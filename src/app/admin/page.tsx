import fs from "fs/promises";
import path from "path";
import type { RsvpEntry } from "@/app/api/rsvp/route";

async function getRsvps(): Promise<RsvpEntry[]> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "data", "rsvp.json"),
      "utf-8"
    );
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const rsvps = await getRsvps();
  const attending = rsvps.filter((r) => r.attendance === "attending");
  const totalGuests = attending.reduce((sum, r) => sum + parseInt(r.guests || "1"), 0);
  const notAttending = rsvps.length - attending.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-5">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">RSVP 참석 현황</h1>
        <p className="text-xs text-gray-400 mt-0.5">새로고침하면 최신 데이터를 가져옵니다</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
          아직 응답이 없습니다
        </div>
      ) : (
        <>
          {/* 모바일: 카드 리스트 */}
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
                {r.message && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{r.message}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{r.slug}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(r.submittedAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크탑: 테이블 */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["이름", "참석", "인원", "메시지", "청첩장", "제출"].map(h => (
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
                          ? <span className="text-green-600 font-medium text-xs">✓ 참석</span>
                          : <span className="text-gray-400 text-xs">불참</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 text-xs">
                        {r.attendance === "attending" ? `${r.guests}명` : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate text-xs">{r.message || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{r.slug}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(r.submittedAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-xs text-gray-400 flex justify-between border-t border-gray-100">
              <span>불참: {notAttending}명</span>
              <span>참석 총 인원: {totalGuests}명</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
