export type ContractId = 'bank' | 'attacker';

export type StepPhase =
  | 'idle'
  | 'victim-deposit'
  | 'attacker-deposit'
  | 'attacker-calls-withdraw'
  | 'bank-sends-eth'
  | 'receive-triggers'
  | 'reentrant-withdraw'
  | 'bank-sends-eth-reentrant'
  | 'drain-complete'
  | 'state-updated-too-late'
  | 'attack-finished';

export interface ContractState {
  readonly address: string;
  readonly balance: number;
  readonly label: string;
}

export interface BankState extends ContractState {
  readonly userBalances: Record<string, number>;
}

export interface CallStackFrame {
  readonly caller: ContractId;
  readonly target: ContractId;
  readonly functionName: string;
  readonly value?: number;
  readonly depth: number;
}

export interface SimulationStep {
  readonly phase: StepPhase;
  readonly bank: BankState;
  readonly attacker: ContractState;
  readonly callStack: readonly CallStackFrame[];
  readonly activeContract: ContractId | null;
  readonly activeCodeLine: ActiveCodeLine | null;
  readonly ethFlow: EthFlowAnimation | null;
  readonly description: string;
  readonly vulnerability: string | null;
  readonly reentrantDepth: number;
}

export interface ActiveCodeLine {
  readonly contract: ContractId;
  readonly lineHighlight: string;
  readonly code: string;
}

export interface EthFlowAnimation {
  readonly from: ContractId;
  readonly to: ContractId;
  readonly amount: number;
}

export interface SimulationState {
  readonly steps: readonly SimulationStep[];
  readonly currentStepIndex: number;
  readonly isPlaying: boolean;
  readonly isComplete: boolean;
}
