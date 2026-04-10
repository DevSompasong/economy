type AdBannerProps = {
  slot: 'header' | 'sidebar' | 'inline';
  className?: string;
};

const AD_CONFIG = {
  header: {
    label: 'Advertisement',
    size: 'h-24',
    text: 'Google AdSense — Leaderboard (728×90)',
    subtext: 'data-ad-slot="HEADER_SLOT_ID" data-ad-format="horizontal"',
  },
  sidebar: {
    label: 'Advertisement',
    size: 'h-64',
    text: 'Google AdSense — Rectangle (300×250)',
    subtext: 'data-ad-slot="SIDEBAR_SLOT_ID" data-ad-format="rectangle"',
  },
  inline: {
    label: 'Advertisement',
    size: 'h-28',
    text: 'Google AdSense — Banner (468×60)',
    subtext: 'data-ad-slot="INLINE_SLOT_ID" data-ad-format="fluid"',
  },
};

export default function AdBanner({ slot, className = '' }: AdBannerProps) {
  const config = AD_CONFIG[slot];

  return (
    <div className={`w-full ${className}`}>
      <p className="text-[10px] uppercase tracking-widest text-gray-400 text-center mb-1 font-medium">
        {config.label}
      </p>
      <div
        className={`w-full ${config.size} border border-dashed border-gray-300 bg-gray-50 rounded flex flex-col items-center justify-center gap-1`}
        aria-label="Advertisement placeholder"
      >
        <span className="text-xs font-semibold text-gray-400">{config.text}</span>
        <code className="text-[10px] text-gray-300 font-mono">{config.subtext}</code>
      </div>
    </div>
  );
}
