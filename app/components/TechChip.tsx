export function TechChip({ label, icon }: { label: string; icon: string }) {
  return (
    <span className="tech-chip">
      <img src={icon} alt="" width={14} height={14} loading="lazy" decoding="async" />
      {label}
    </span>
  );
}
