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
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">RSVP 참석 현황</h1>
        <p className="text-sm text-gray-400 mt-0.5">새로고침하면 최신 데이터를 가져옵니다</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm text-center border border-gray-100">
          <p className="text-3xl font-bold text-gray-800">{rsvps.length}</p>
          <p className="text-xs text-gray-400 mt-1">총 응답</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm text-center border border-gray-100">
          <p className="text-3xl font-bold text-green-600">{attending.length}</p>
          <p className="text-xs text-gray-400 mt-1">참석</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm text-center border border-gray-100">
          <p className="text-3xl font-bold text-blue-600">{totalGuests}</p>
          <p className="text-xs text-gray-400 mt-1">예상 총 인원</p>
        </div>
      </div>

      {/* 테이블 */}
      {rsvps.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center text-gray-400 shadow-sm border border-gray-100">
          아직 응답이 없습니다
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs">이름</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs">참석</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs">인원</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs">메시지</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs">청첩장</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs">제출</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                  <td className="px-4 py-3">
                    {r.attendance === "attending" ? (
                      <span className="text-green-600 font-medium text-xs">✓ 참석</span>
                    ) : (
                      <span className="text-gray-400 text-xs">불참</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 text-xs">
                    {r.attendance === "attending" ? `${r.guests}명` : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate text-xs">
                    {r.message || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {r.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(r.submittedAt).toLocaleString("ko-KR", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 text-xs text-gray-400 flex justify-between border-t border-gray-100">
            <span>불참: {notAttending}명</span>
            <span>참석 총 인원: {totalGuests}명</span>
          </div>
        </div>
      )}
    </div>
  );
}
