// 하객 입력 폼(RSVP·방명록) 제출 버튼 위에 두는 아주 작은 개인정보 안내 링크 (새 탭).
export default function PrivacyNote() {
  return (
    <p className="text-[10px] text-center opacity-60 mb-2">
      <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">개인정보 수집·이용 안내</a>
    </p>
  );
}
