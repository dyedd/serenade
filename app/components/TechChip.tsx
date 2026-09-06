// Brand-tinted tech chip: simple-icons mark + label.
const TECH: Record<string, { color: string; slug: string }> = {
  Python: { color: '#3776AB', slug: 'python' },
  CUDA: { color: '#76B900', slug: 'nvidia' },
  'C++': { color: '#00599C', slug: 'cplusplus' },
  JavaScript: { color: '#F7DF1E', slug: 'javascript' },
  HTML5: { color: '#E34F26', slug: 'html5' },
  HTML: { color: '#E34F26', slug: 'html5' },
  CSS: { color: '#1572B6', slug: 'css' },
  Vue: { color: '#4FC08D', slug: 'vuedotjs' },
  PHP: { color: '#777BB4', slug: 'php' },
  Docker: { color: '#2496ED', slug: 'docker' },
  Ubuntu: { color: '#E95420', slug: 'ubuntu' },
  Java: { color: '#007396', slug: 'openjdk' },
  React: { color: '#61DAFB', slug: 'react' },
  TypeScript: { color: '#3178C6', slug: 'typescript' },
  Linux: { color: '#FCC624', slug: 'linux' },
  Git: { color: '#F05032', slug: 'git' },
  Slurm: { color: '#1F1F1F', slug: 'linux' },
};

export function TechChip({ label }: { label: string }) {
  const meta = TECH[label];
  const color = meta?.color ?? 'var(--brand)';
  return (
    <span className="tech-chip" style={{ ['--chip' as string]: color }}>
      {meta ? (
        <img
          src={`https://cdn.simpleicons.org/${meta.slug}/${meta.color.replace('#', '')}`}
          alt=""
          width={14}
          height={14}
        />
      ) : (
        <span className="tech-chip-dot" aria-hidden />
      )}
      {label}
    </span>
  );
}
