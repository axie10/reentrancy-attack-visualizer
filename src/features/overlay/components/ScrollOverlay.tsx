import { Scroll } from '@react-three/drei';
import { GITHUB_LINKS } from '../../simulation/constants';

const VULNERABLE_HTML = `<span style="color:#6b7280">// ❌ VULNERABLE</span>
<span style="color:#c084fc">function</span> <span style="color:#fbbf24">withDraw</span><span style="color:#9ca3af">()</span> <span style="color:#c084fc">external</span> {
  <span style="color:#93c5fd">uint256</span> balance =
    <span style="color:#d1d5db">userBalance</span>[<span style="color:#fbbf24">msg.sender</span>];

  <span style="color:#6b7280">// ⚠ Sends ETH FIRST</span>
  (<span style="color:#93c5fd">bool</span> success,) =
    <span style="color:#fbbf24">msg.sender</span>.<span style="color:#6ee7b7">call</span>{
      <span style="color:#c084fc">value</span>: balance
    }(<span style="color:#9ca3af">""</span>);
  <span style="color:#c084fc">require</span>(success);

  <span style="color:#f87171">// ← TOO LATE!</span>
  <span style="color:#d1d5db">userBalance</span>[<span style="color:#fbbf24">msg.sender</span>] = <span style="color:#fb923c">0</span>;
}`;

const SECURE_HTML = `<span style="color:#6b7280">// ✅ SECURE — CEI Pattern</span>
<span style="color:#c084fc">function</span> <span style="color:#fbbf24">withDraw</span><span style="color:#9ca3af">()</span> <span style="color:#c084fc">external</span> {
  <span style="color:#93c5fd">uint256</span> balance =
    <span style="color:#d1d5db">userBalance</span>[<span style="color:#fbbf24">msg.sender</span>];

  <span style="color:#34d399">// ← State updated FIRST</span>
  <span style="color:#d1d5db">userBalance</span>[<span style="color:#fbbf24">msg.sender</span>] = <span style="color:#fb923c">0</span>;

  (<span style="color:#93c5fd">bool</span> success,) =
    <span style="color:#fbbf24">msg.sender</span>.<span style="color:#6ee7b7">call</span>{
      <span style="color:#c084fc">value</span>: balance
    }(<span style="color:#9ca3af">""</span>);
  <span style="color:#c084fc">require</span>(success);
}`;

export function ScrollOverlay() {
  return (
    <Scroll html style={{ width: '100%' }}>
      {/* Page 1: Hero */}
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center px-6">
          <div className="flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/60 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="font-mono text-xs text-gray-400">
              Smart Contract Security
            </span>
          </div>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl">
            Reentrancy
            <br />
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Attack
            </span>
          </h1>

          <p className="max-w-lg text-lg text-gray-500">
            Scroll to watch how a single misplaced line of code drains an
            entire smart contract.
          </p>

          <div className="mt-4 flex items-center gap-4">
            <a
              href={GITHUB_LINKS.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-gray-800 px-6 py-3 font-medium text-gray-400 transition-all hover:border-gray-600 hover:text-gray-200"
            >
              View Source →
            </a>
          </div>

          <div className="mt-12 animate-bounce text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Page 2: Deposits phase */}
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="mx-auto max-w-md px-6">
          <div className="rounded-2xl border border-gray-800/60 bg-gray-950/80 p-8 backdrop-blur-md">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-emerald-400/70">
              Phase 1
            </p>
            <h2 className="mb-4 text-2xl font-bold text-white">
              Setting the trap
            </h2>
            <p className="text-sm leading-relaxed text-gray-400">
              A legitimate user deposits 10 ETH into SimpleBank. The attacker
              then deposits just 1 ETH through the Attack contract — enough to
              pass the balance check in withdraw().
            </p>
            <a
              href={GITHUB_LINKS.simpleBank}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block font-mono text-xs text-gray-600 transition-colors hover:text-gray-300"
            >
              SimpleBank.sol →
            </a>
          </div>
        </div>
      </div>

      {/* Page 3: Attack begins */}
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="mx-auto max-w-md px-6">
          <div className="rounded-2xl border border-red-500/20 bg-gray-950/80 p-8 backdrop-blur-md">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-red-400/70">
              Phase 2
            </p>
            <h2 className="mb-4 text-2xl font-bold text-white">
              The exploit
            </h2>
            <p className="text-sm leading-relaxed text-gray-400">
              The attacker calls withdraw(). SimpleBank sends 1 ETH via{' '}
              <code className="text-amber-400">msg.sender.call</code> — but the{' '}
              <code className="text-red-400">userBalance</code> hasn't been
              updated yet.
            </p>
            <div className="mt-4 rounded-lg bg-gray-900/80 px-4 py-3">
              <code className="font-mono text-xs text-red-400/80">
                ⚠ External call before state update
              </code>
            </div>
            <a
              href={GITHUB_LINKS.withdrawVulnerable}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block font-mono text-xs text-gray-600 transition-colors hover:text-gray-300"
            >
              View vulnerable code →
            </a>
          </div>
        </div>
      </div>

      {/* Page 4: Reentrancy loop */}
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="mx-auto max-w-md px-6">
          <div className="rounded-2xl border border-red-500/30 bg-gray-950/80 p-8 backdrop-blur-md">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-red-400">
              Phase 3
            </p>
            <h2 className="mb-4 text-2xl font-bold text-white">
              Recursive drain
            </h2>
            <p className="text-sm leading-relaxed text-gray-400">
              The Attack contract's{' '}
              <code className="text-amber-400">receive()</code> function fires
              and immediately calls withdraw() again. The bank still thinks the
              attacker has 1 ETH. This loops until the bank is empty.
            </p>
            <div className="mt-4 rounded-lg bg-gray-900/80 px-4 py-3 font-mono text-xs text-gray-500">
              <span className="text-red-400">receive()</span> → withdraw() →{' '}
              <span className="text-red-400">receive()</span> → withdraw() → ...
            </div>
            <a
              href={GITHUB_LINKS.receiveFn}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block font-mono text-xs text-gray-600 transition-colors hover:text-gray-300"
            >
              Attack.sol → receive() →
            </a>
          </div>
        </div>
      </div>

      {/* Page 5: Code comparison */}
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="mx-auto w-full max-w-4xl px-6">
          <div className="mb-6 text-center">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60">
              The Fix
            </p>
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              One line changes everything.
            </h2>
            <p className="mt-2 text-sm text-gray-500" style={{ textAlign: 'center' }}>
              The Checks-Effects-Interactions pattern — update state before
              making external calls.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Vulnerable */}
            <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-gray-950/90 backdrop-blur-md">
              <div className="pointer-events-none absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

              <div className="flex items-center justify-between border-b border-red-500/10 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-red-400"
                    style={{ boxShadow: '0 0 6px rgba(239,68,68,0.6)' }}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-red-400/70">
                    Vulnerable
                  </span>
                </div>
                <a
                  href={GITHUB_LINKS.withdrawVulnerable}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-gray-700 transition-colors hover:text-red-400/70"
                >
                  GitHub →
                </a>
              </div>

              <pre
                style={{
                  padding: '16px',
                  margin: 0,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '11px',
                  lineHeight: '1.7',
                  whiteSpace: 'pre',
                  overflowX: 'auto',
                }}
                dangerouslySetInnerHTML={{ __html: VULNERABLE_HTML }}
              />

              <div className="pointer-events-none absolute bottom-2 left-2 h-2 w-2 border-b border-l border-red-500/20" />
              <div className="pointer-events-none absolute bottom-2 right-2 h-2 w-2 border-b border-r border-red-500/20" />
            </div>

            {/* Secure */}
            <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gray-950/90 backdrop-blur-md">
              <div className="pointer-events-none absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

              <div className="flex items-center justify-between border-b border-emerald-500/10 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                    style={{ boxShadow: '0 0 6px rgba(16,185,129,0.6)' }}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/70">
                    Secure — CEI Pattern
                  </span>
                </div>
                <a
                  href={GITHUB_LINKS.withdrawSecure}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-gray-700 transition-colors hover:text-emerald-400/70"
                >
                  GitHub →
                </a>
              </div>

              <pre
                style={{
                  padding: '16px',
                  margin: 0,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '11px',
                  lineHeight: '1.7',
                  whiteSpace: 'pre',
                  overflowX: 'auto',
                }}
                dangerouslySetInnerHTML={{ __html: SECURE_HTML }}
              />

              <div className="pointer-events-none absolute bottom-2 left-2 h-2 w-2 border-b border-l border-emerald-500/20" />
              <div className="pointer-events-none absolute bottom-2 right-2 h-2 w-2 border-b border-r border-emerald-500/20" />
            </div>
          </div>

          {/* Source links */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              { label: 'SimpleBank.sol', url: GITHUB_LINKS.simpleBank },
              { label: 'Attack.sol', url: GITHUB_LINKS.attack },
              { label: 'Tests', url: GITHUB_LINKS.test },
              { label: 'Full Repo', url: GITHUB_LINKS.repo },
            ].map(({ label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gray-800/40 bg-gray-950/50 px-4 py-1.5 font-mono text-[10px] text-gray-600 backdrop-blur-sm transition-all hover:border-gray-600 hover:text-gray-300"
              >
                {label} →
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Page 6: Footer */}
      <div className="flex h-screen w-screen items-end justify-center pb-16">
        <p className="text-center text-[11px] text-gray-800">
          Built with React · Three.js · TypeScript · Foundry
        </p>
      </div>
    </Scroll>
  );
}
