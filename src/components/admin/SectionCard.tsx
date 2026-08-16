export default function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/60">
        <h2 className="text-xs font-semibold text-gray-500 tracking-widest uppercase">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}
