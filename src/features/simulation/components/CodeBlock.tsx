interface CodeBlockProps {
  readonly code: string;
  readonly variant: 'vulnerable' | 'secure';
  readonly githubUrl: string;
}

export function CodeBlock({ code, variant, githubUrl }: CodeBlockProps) {
  const isVulnerable = variant === 'vulnerable';

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-gray-950 ${
        isVulnerable ? 'border-red-500/15' : 'border-emerald-500/15'
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-800/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isVulnerable ? 'bg-red-400' : 'bg-emerald-400'
            }`}
          />
          <span className="text-xs font-medium text-gray-400">
            {isVulnerable ? 'Vulnerable' : 'Secure — CEI Pattern'}
          </span>
        </div>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full px-2.5 py-1 font-mono text-[11px] text-gray-600 transition-colors hover:bg-gray-800 hover:text-gray-300"
        >
          GitHub →
        </a>
      </div>

      <pre className="overflow-x-auto p-5">
        <code className="font-mono text-[13px] leading-relaxed text-gray-400">
          {code}
        </code>
      </pre>
    </div>
  );
}
