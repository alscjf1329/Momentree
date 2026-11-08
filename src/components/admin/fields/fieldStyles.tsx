export const INPUT =
  "w-full min-h-[52px] px-4 py-3 text-base text-ink border border-[#d4d4d4] rounded-[14px] outline-none focus:border-ink bg-white transition-colors placeholder:text-[#9a9a9a]";

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[13px] text-sub mb-2">{children}</label>;
}
