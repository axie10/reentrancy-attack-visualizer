import type { SimulationStep } from '../../simulation/engine/types';
import { useSimulationSnapshot } from '../../simulation/storage/simulation-store';

function getPhaseLabel(step: SimulationStep): string {
  switch (step.phase) {
    case 'idle': return 'STANDBY';
    case 'victim-deposit':
    case 'attacker-deposit': return 'DEPOSITS';
    case 'attacker-calls-withdraw': return 'EXPLOIT INIT';
    case 'bank-sends-eth':
    case 'bank-sends-eth-reentrant': return 'DRAINING';
    case 'receive-triggers': return 'RE-ENTRY';
    case 'drain-complete': return 'DRAINED';
    case 'attack-finished': return 'COMPLETE';
    default: return 'ACTIVE';
  }
}

function getStatusColor(step: SimulationStep): string {
  if (step.phase === 'idle' || step.phase === 'victim-deposit') return '#10b981';
  if (step.phase === 'attacker-deposit' || step.phase === 'attacker-calls-withdraw') return '#f59e0b';
  if (step.phase === 'attack-finished') return '#6b7280';
  return '#ef4444';
}

export function HudOverlay() {
  const { step, stepIndex, totalSteps } = useSimulationSnapshot();

  const phase = getPhaseLabel(step);
  const statusColor = getStatusColor(step);
  const ethStolen = Math.max(0, step.attacker.balance - 1);
  const progress = (stepIndex / (totalSteps - 1)) * 100;
  const isAttacking = step.reentrantDepth > 0;

  return (
    <>
      <style>{`
        @keyframes hud-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .hud-root {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          pointer-events: none;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .hud-progress {
          height: 2px;
          background: rgba(75, 85, 99, 0.15);
        }

        .hud-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
          transition: width 0.3s ease;
        }

        .hud-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 24px;
          background: rgba(3, 7, 18, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(75, 85, 99, 0.15);
          gap: 12px;
        }

        .hud-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .hud-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .hud-phase {
          font-size: 10px;
          letter-spacing: 0.15em;
        }

        .hud-divider {
          width: 1px;
          height: 14px;
          background: rgba(75, 85, 99, 0.3);
          margin: 0 4px;
        }

        .hud-step {
          font-size: 9px;
          color: #4b5563;
        }

        .hud-center {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .hud-stat {
          display: flex;
          align-items: baseline;
          gap: 5px;
        }

        .hud-stat-label {
          font-size: 9px;
          color: #6b7280;
          letter-spacing: 0.1em;
        }

        .hud-stat-value {
          font-size: 14px;
          font-weight: 600;
        }

        .hud-stat-unit {
          font-size: 9px;
          color: #374151;
        }

        .hud-github {
          pointer-events: auto;
          font-size: 10px;
          color: #4b5563;
          text-decoration: none;
          letter-spacing: 0.05em;
          padding: 4px 12px;
          border-radius: 999px;
          border: 1px solid rgba(75, 85, 99, 0.2);
          transition: all 0.2s;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .hud-github:hover {
          border-color: rgba(75, 85, 99, 0.5);
          color: #9ca3af;
        }

        /* ---- Mobile ---- */
        @media (max-width: 768px) {
          .hud-bar {
            flex-wrap: wrap;
            padding: 8px 14px;
            gap: 6px;
          }

          .hud-left {
            order: 1;
            gap: 6px;
          }

          .hud-center {
            order: 3;
            width: 100%;
            gap: 0;
            justify-content: space-evenly;
            padding-top: 6px;
            border-top: 1px solid rgba(75, 85, 99, 0.1);
          }

          .hud-github {
            order: 2;
            margin-left: auto;
            padding: 3px 10px;
            font-size: 9px;
          }

          .hud-phase {
            font-size: 9px;
          }

          .hud-stat {
            flex-direction: column;
            align-items: center;
            gap: 1px;
          }

          .hud-stat-label {
            font-size: 7px;
          }

          .hud-stat-value {
            font-size: 13px;
          }

          .hud-stat-unit {
            font-size: 7px;
          }

          .hud-divider {
            display: none;
          }

          .hud-step {
            display: none;
          }
        }

        /* ---- Very small screens ---- */
        @media (max-width: 370px) {
          .hud-bar {
            padding: 6px 10px;
          }

          .hud-stat-value {
            font-size: 11px;
          }

          .hud-stat-label {
            font-size: 6px;
          }
        }
      `}</style>

      <div className="hud-root">
        {/* Progress bar */}
        <div className="hud-progress">
          <div className="hud-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Navbar */}
        <div className="hud-bar">
          {/* Left — Status */}
          <div className="hud-left">
            <div
              className="hud-dot"
              style={{
                backgroundColor: statusColor,
                boxShadow: `0 0 8px ${statusColor}`,
                animation: isAttacking ? 'hud-pulse 0.5s ease-in-out infinite' : 'none',
              }}
            />
            <span className="hud-phase" style={{ color: statusColor }}>
              {phase}
            </span>

            <div className="hud-divider" />

            <span className="hud-step">
              {stepIndex + 1} / {totalSteps}
            </span>
          </div>

          {/* Center — Balances */}
          <div className="hud-center">
            <div className="hud-stat">
              <span className="hud-stat-label">BANK</span>
              <span className="hud-stat-value" style={{ color: '#10b981' }}>
                {step.bank.balance}
              </span>
              <span className="hud-stat-unit">ETH</span>
            </div>

            <div className="hud-stat">
              <span className="hud-stat-label">ATTACKER</span>
              <span className="hud-stat-value" style={{ color: '#ef4444' }}>
                {step.attacker.balance}
              </span>
              <span className="hud-stat-unit">ETH</span>
            </div>

            <div className="hud-stat">
              <span className="hud-stat-label">STOLEN</span>
              <span
                className="hud-stat-value"
                style={{ color: ethStolen > 0 ? '#f59e0b' : '#374151' }}
              >
                {ethStolen}
              </span>
              <span className="hud-stat-unit">ETH</span>
            </div>

            {step.reentrantDepth > 0 && (
              <div className="hud-stat">
                <span className="hud-stat-label" style={{ color: '#ef4444' }}>
                  DEPTH
                </span>
                <span className="hud-stat-value" style={{ color: '#ef4444' }}>
                  {step.reentrantDepth}
                </span>
              </div>
            )}
          </div>

          {/* Right — GitHub */}
          <a
            className="hud-github"
            href="https://github.com/axie10/ReentrancyAttackExampleInFoundry"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub →
          </a>
        </div>
      </div>
    </>
  );
}
