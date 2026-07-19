# Reentrancy Attack Visualizer

An interactive 3D visualization of the most devastating smart contract vulnerability. Built as a portfolio piece to demonstrate deep understanding of blockchain security concepts and modern frontend engineering.

**[Live Demo →](https://reentrancy-attack-visualizer.vercel.app)**

---

## Overview

This project visualizes how a reentrancy attack drains a vulnerable smart contract, step by step. The user scrolls through the attack lifecycle while a real-time 3D scene shows ETH flowing between contracts, balances updating, and the recursive call stack growing — all driven by a deterministic simulation engine.

The smart contracts (Solidity + Foundry) are in a separate repository: [ReentrancyAttackExampleInFoundry](https://github.com/axie10/ReentrancyAttackExampleInFoundry).

## How the Attack Works

1. A legitimate user deposits 10 ETH into `SimpleBank`
2. The attacker deposits 1 ETH through the `Attack` contract
3. The attacker calls `withdraw()` — the bank sends ETH **before** updating the balance
4. The `receive()` function in `Attack` fires and re-enters `withdraw()`
5. This recursive loop repeats until the bank is completely drained
6. Only then does `userBalance[msg.sender] = 0` execute — too late

The fix is the **Checks-Effects-Interactions** pattern: update state before making external calls.

## Features

- **Scroll-driven 3D simulation** — the attack unfolds as the user scrolls, powered by React Three Fiber and drei's ScrollControls
- **Interactive contract nodes** — holographic-style 3D blocks with glass materials, orbiting rings, and wireframe edges. Hover to highlight, click to open the source code on GitHub
- **Particle beam ETH flow** — multi-stream animated particles show ETH moving between contracts, intensifying with each reentrancy depth level
- **Neural network background** — interconnected constellation of particles with dynamic connections, creating a blockchain-network atmosphere
- **Animated grid floor** — shader-based pulsing grid that adds depth to the scene
- **Mouse parallax** — the camera subtly follows cursor movement for an immersive feel
- **Real-time HUD** — fixed navbar displaying attack phase, contract balances, ETH stolen, reentrancy depth, and progress — fully responsive across devices
- **Syntax-highlighted code comparison** — side-by-side vulnerable vs secure code with direct GitHub links
- **Bloom post-processing** — real glow effects on emissive elements via post-processing pipeline

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite |
| 3D Engine | Three.js via React Three Fiber |
| 3D Helpers | @react-three/drei (ScrollControls, RoundedBox, Text, Html) |
| Post-Processing | @react-three/postprocessing (Bloom) |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |

## Architecture

```
src/
├── features/
│   ├── overlay/components/
│   │   └── ScrollOverlay.tsx         # HTML content that scrolls over the 3D scene
│   ├── scene/components/
│   │   ├── ContractNode.tsx          # Interactive 3D contract block (click → GitHub)
│   │   ├── EthBeam.tsx              # Multi-stream particle beam for ETH flow
│   │   ├── Experience.tsx           # Main scene orchestrator + camera rig
│   │   ├── GridFloor.tsx            # Shader-based animated grid
│   │   ├── HudOverlay.tsx           # Fixed responsive navbar with live stats
│   │   └── ParticleField.tsx        # Neural network constellation background
│   └── simulation/
│       ├── engine/
│       │   ├── simulation-engine.ts  # Pure TypeScript — generates all attack steps
│       │   └── types.ts             # Domain types (SimulationStep, ContractState, etc.)
│       ├── hooks/
│       │   └── useScrollSimulation.ts # Maps scroll offset → simulation step
│       ├── store/
│       │   └── simulation-store.ts   # External store (useSyncExternalStore) for HUD
│       └── constants.ts             # GitHub links, code snippets
├── App.tsx
├── index.css
└── main.tsx
```

**Key architectural decisions:**

- **Simulation engine is framework-agnostic** — pure TypeScript with zero React dependencies. Generates a deterministic array of steps modeling the exact attack flow. Could be consumed by any framework.
- **External store for cross-boundary state** — the 3D scene (inside R3F Canvas) and the HUD (outside Canvas) share simulation state through a lightweight store built with `useSyncExternalStore`. No external state library needed.
- **Feature-based structure** — code is organized by feature domain (scene, overlay, simulation), not by file type.
- **Separation of concerns** — the engine produces data, the hook maps scroll to steps, the components only render.

## Local Development

**Prerequisites:** Node.js 20.19+ 

```bash
# Clone
git clone https://github.com/axie10/reentrancy-attack-visualizer.git
cd reentrancy-attack-visualizer

# Install
npm install

# Dev server
npm run dev
```

Opens at `http://localhost:5173`

## Build & Deploy

```bash
# Production build
npm run build

# Preview locally
npm run preview
```

Deployed on Vercel — push to `main` triggers automatic deployment.

## Related Repository

The Solidity smart contracts visualized in this project:

| Contract | Description |
|---|---|
| [SimpleBank.sol](https://github.com/axie10/ReentrancyAttackExampleInFoundry/blob/master/src/SimpleBank.sol) | Vulnerable bank contract with the reentrancy bug + commented secure version |
| [Attack.sol](https://github.com/axie10/ReentrancyAttackExampleInFoundry/blob/master/src/Attack.sol) | Attacker contract that exploits the `receive()` callback |
| [SimpleBank.t.sol](https://github.com/axie10/ReentrancyAttackExampleInFoundry/blob/master/test/SimpleBank.t.sol) | Foundry test suite demonstrating the exploit |

## Author

**axie10** — [GitHub](https://github.com/axie10)

Built with React, Three.js, TypeScript, and Foundry.