const REPO_BASE = 'https://github.com/axie10/ReentrancyAttackExampleInFoundry';
const BLOB_BASE = `${REPO_BASE}/blob/master`;

export const GITHUB_LINKS = {
  repo: REPO_BASE,
  simpleBank: `${BLOB_BASE}/src/SimpleBank.sol`,
  attack: `${BLOB_BASE}/src/Attack.sol`,
  test: `${BLOB_BASE}/test/SimpleBank.t.sol`,
  withdrawVulnerable: `${BLOB_BASE}/src/SimpleBank.sol#L27-L36`,
  withdrawSecure: `${BLOB_BASE}/src/SimpleBank.sol#L17-L25`,
  receiveFn: `${BLOB_BASE}/src/Attack.sol#L14-L18`,
} as const;

export const CODE_SNIPPETS = {
  vulnerable: `// ❌ VULNERABLE
function withDraw() external {
    uint256 balance = userBalance[msg.sender];

    (bool success,) = msg.sender.call{value: balance}("");
    require(success, TransactionFailed());

    userBalance[msg.sender] = 0; // ← TOO LATE
}`,

  secure: `// ✅ SECURE — CEI Pattern
function withDraw() external {
    uint256 balance = userBalance[msg.sender];
    userBalance[msg.sender] = 0; // ← FIRST

    (bool success,) = msg.sender.call{value: balance}("");
    require(success, TransactionFailed());
}`,
} as const;
