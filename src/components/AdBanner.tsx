type AdBannerProps = {
  // ปรับให้ยืดหยุ่นขึ้นเพื่อไม่ให้หน้าขาว
  slot: string;
  className?: string;
};

const AD_CONFIG: Record<string, any> = {
  header: {
    label: "Advertisement",
    size: "h-24",
    text: "Google AdSense — Leaderboard (728×90)",
    subtext: 'data-ad-slot="HEADER_SLOT_ID"',
  },
  footer: {
    label: "Advertisement",
    size: "h-32",
    text: "Google AdSense — Bottom Banner",
    subtext: 'data-ad-slot="FOOTER_SLOT_ID"',
  },
  sidebar: {
    label: "Advertisement",
    size: "h-[300px]", // ลดจาก 600 เหลือ 300
    text: "Google AdSense — Vertical Ad",
    subtext: 'data-ad-slot="SIDEBAR_SLOT_ID"',
  },
  // ค่าเริ่มต้นถ้าหา slot ไม่เจอ
  default: {
    label: "Advertisement",
    size: "h-24",
    text: "Google AdSense — Display Ad",
    subtext: 'data-ad-slot="GENERAL_SLOT_ID"',
  },
};

export default function AdBanner({ slot, className = "" }: AdBannerProps) {
  // เลือก config ตาม slot ถ้าไม่เจอก็ใช้ default
  const config = AD_CONFIG[slot] || AD_CONFIG.default;

  return (
    <div className={`w-full ${className}`}>
      <p className="text-[10px] uppercase tracking-widest text-gray-400 text-center mb-1 font-medium">
        {config.label}
      </p>
      <div
        className={`w-full ${config.size} border border-dashed border-gray-300 bg-gray-50 rounded-xl flex flex-col items-center justify-center overflow-hidden`}
      >
        <span className="text-gray-400 text-xs font-semibold">
          {config.text}
        </span>
        <span className="text-gray-300 text-[9px] mt-1 font-mono">
          {config.subtext}
        </span>
      </div>
    </div>
  );
}
