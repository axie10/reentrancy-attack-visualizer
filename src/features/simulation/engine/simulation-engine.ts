import type {
  SimulationStep,
  BankState,
  ContractState,
  CallStackFrame,
} from './types';

const VICTIM_DEPOSIT = 10;
const ATTACKER_DEPOSIT = 1;
const VICTIM_ADDRESS = '0xVictim';
const ATTACKER_ADDRESS = '0xAttacker';

function createInitialBankState(): BankState {
  return {
    address: '0xBank',
    balance: 0,
    label: 'SimpleBank',
    userBalances: {},
  };
}

function createInitialAttackerState(): ContractState {
  return {
    address: ATTACKER_ADDRESS,
    balance: 0,
    label: 'Attack',
  };
}

export function generateSimulationSteps(): SimulationStep[] {
  const steps: SimulationStep[] = [];

  let bank = createInitialBankState();
  let attacker = createInitialAttackerState();

  steps.push({
    phase: 'idle',
    bank,
    attacker,
    callStack: [],
    activeContract: null,
    activeCodeLine: null,
    ethFlow: null,
    description: 'SimpleBank is deployed. Its withdraw() function has a critical vulnerability — it sends ETH before updating the user balance.',
    vulnerability: null,
    reentrantDepth: 0,
  });

  bank = {
    ...bank,
    balance: VICTIM_DEPOSIT,
    userBalances: { ...bank.userBalances, [VICTIM_ADDRESS]: VICTIM_DEPOSIT },
  };

  steps.push({
    phase: 'victim-deposit',
    bank,
    attacker,
    callStack: [
      { caller: 'attacker', target: 'bank', functionName: 'deposit', value: VICTIM_DEPOSIT, depth: 0 },
    ],
    activeContract: 'bank',
    activeCodeLine: {
      contract: 'bank',
      lineHighlight: 'deposit',
      code: 'userBalance[msg.sender] += msg.value;',
    },
    ethFlow: { from: 'attacker', to: 'bank', amount: VICTIM_DEPOSIT },
    description: `A legitimate user deposits ${VICTIM_DEPOSIT} ETH into SimpleBank.`,
    vulnerability: null,
    reentrantDepth: 0,
  });

  bank = {
    ...bank,
    balance: bank.balance + ATTACKER_DEPOSIT,
    userBalances: { ...bank.userBalances, [ATTACKER_ADDRESS]: ATTACKER_DEPOSIT },
  };
  attacker = { ...attacker, balance: 0 };

  steps.push({
    phase: 'attacker-deposit',
    bank,
    attacker,
    callStack: [
      { caller: 'attacker', target: 'bank', functionName: 'deposit', value: ATTACKER_DEPOSIT, depth: 0 },
    ],
    activeContract: 'bank',
    activeCodeLine: {
      contract: 'bank',
      lineHighlight: 'deposit',
      code: 'userBalance[msg.sender] += msg.value;',
    },
    ethFlow: { from: 'attacker', to: 'bank', amount: ATTACKER_DEPOSIT },
    description: `The attacker deposits just ${ATTACKER_DEPOSIT} ETH — enough to have a valid balance for withdraw().`,
    vulnerability: null,
    reentrantDepth: 0,
  });

  steps.push({
    phase: 'attacker-calls-withdraw',
    bank,
    attacker,
    callStack: [
      { caller: 'attacker', target: 'bank', functionName: 'attack', depth: 0 },
      { caller: 'attacker', target: 'bank', functionName: 'withdraw', depth: 1 },
    ],
    activeContract: 'bank',
    activeCodeLine: {
      contract: 'bank',
      lineHighlight: 'withdraw-call',
      code: '(bool success,) = msg.sender.call{value: balance}("");',
    },
    ethFlow: null,
    description: 'The attacker calls withdraw(). The bank sends ETH BEFORE updating the balance...',
    vulnerability: 'External call before state update',
    reentrantDepth: 0,
  });

  let depth = 1;

  while (bank.balance > ATTACKER_DEPOSIT) {
    const ethToSend = ATTACKER_DEPOSIT;
    bank = { ...bank, balance: bank.balance - ethToSend };
    attacker = { ...attacker, balance: attacker.balance + ethToSend };

    const callStack: CallStackFrame[] = Array.from(
      { length: depth + 1 },
      (_, i) => ({
        caller: 'attacker' as const,
        target: 'bank' as const,
        functionName: i === 0 ? 'attack' : 'withdraw',
        depth: i,
      }),
    );

    steps.push({
      phase: depth === 1 ? 'bank-sends-eth' : 'bank-sends-eth-reentrant',
      bank,
      attacker,
      callStack,
      activeContract: 'bank',
      activeCodeLine: {
        contract: 'bank',
        lineHighlight: 'withdraw-send',
        code: 'msg.sender.call{value: balance}("")',
      },
      ethFlow: { from: 'bank', to: 'attacker', amount: ethToSend },
      description: `Bank sends ${ethToSend} ETH → Attacker. Bank: ${bank.balance} ETH remaining. But userBalance still says ${ATTACKER_DEPOSIT} ETH.`,
      vulnerability: 'Balance not updated — attacker can withdraw again',
      reentrantDepth: depth,
    });

    if (bank.balance >= ATTACKER_DEPOSIT) {
      depth++;

      const reentrantCallStack: CallStackFrame[] = Array.from(
        { length: depth + 1 },
        (_, i) => ({
          caller: 'attacker' as const,
          target: 'bank' as const,
          functionName: i === 0 ? 'attack' : i === depth ? 'withdraw (reentrant)' : 'withdraw',
          depth: i,
        }),
      );

      steps.push({
        phase: 'receive-triggers',
        bank,
        attacker,
        callStack: reentrantCallStack,
        activeContract: 'attacker',
        activeCodeLine: {
          contract: 'attacker',
          lineHighlight: 'receive',
          code: 'simplebank.withDraw();',
        },
        ethFlow: null,
        description: `receive() fires → re-enters withdraw() at depth ${depth}. The bank still thinks the attacker has ${ATTACKER_DEPOSIT} ETH.`,
        vulnerability: `Reentrancy depth: ${depth}`,
        reentrantDepth: depth,
      });
    }
  }

  steps.push({
    phase: 'drain-complete',
    bank,
    attacker,
    callStack: [],
    activeContract: 'bank',
    activeCodeLine: {
      contract: 'bank',
      lineHighlight: 'balance-update',
      code: 'userBalance[msg.sender] = 0; // Too late',
    },
    ethFlow: null,
    description: `Bank drained. The recursive calls unwind. NOW userBalance is set to 0 — but the attacker already has ${attacker.balance} ETH.`,
    vulnerability: 'State update after all recursive calls — damage done',
    reentrantDepth: 0,
  });

  bank = {
    ...bank,
    userBalances: { ...bank.userBalances, [ATTACKER_ADDRESS]: 0 },
  };

  steps.push({
    phase: 'attack-finished',
    bank,
    attacker,
    callStack: [],
    activeContract: null,
    activeCodeLine: null,
    ethFlow: null,
    description: `Attack complete. Deposited ${ATTACKER_DEPOSIT} ETH, extracted ${attacker.balance} ETH. The victim lost everything.`,
    vulnerability: null,
    reentrantDepth: 0,
  });

  return steps;
}
