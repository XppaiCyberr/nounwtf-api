const { createPublicClient, http, formatEther, getAddress } = require('viem');
const { mainnet } = require('viem/chains');

// Contract from the request — getAddress() normalizes casing/checksum
// automatically, so it doesn't matter if you paste it lowercase, uppercase,
// or with an incorrect checksum.
const CONTRACT_ADDRESS = getAddress('0x9a6ddb16e23967d5482e5bfd7444a04a5d5145fc');

// Public RPC by default — set ETH_RPC_URL in Vercel env vars for a dedicated
// endpoint (Alchemy / Infura / QuickNode) to avoid public-RPC rate limits.
const RPC_URL = 'https://eth.drpc.org';

// Minimal ABI — just the auction() read function (selector 0x7d9f6db5)
const ABI = [
  {
    inputs: [],
    name: 'auction',
    outputs: [
      { internalType: 'uint256', name: 'nounId', type: 'uint256' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'startTime', type: 'uint256' },
      { internalType: 'uint256', name: 'endTime', type: 'uint256' },
      { internalType: 'address', name: 'bidder', type: 'address' },
      { internalType: 'bool', name: 'settled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

const client = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
});

function formatTimeLeft(endTime) {
  const now = Math.floor(Date.now() / 1000);
  const totalSeconds = Math.max(Number(endTime) - now, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return [hours, minutes]
    .map((value) => value.toString().padStart(2, '0'))
    .join(':');
}

module.exports = async (req, res) => {
  // Allow simple CORS so this can be called from a browser/front-end too
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'auction',
    });

    // viem returns a tuple in output order: [nounId, amount, startTime, endTime, bidder, settled]
    const [nounId, amount, startTime, endTime, bidder, settled] = result;

    const data = {
      nounId: nounId.toString(),
      amount: amount.toString(),
      amountETH: formatEther(amount),
      startTime: startTime.toString(),
      startTimeISO: new Date(Number(startTime) * 1000).toISOString(),
      endTime: endTime.toString(),
      endTimeISO: new Date(Number(endTime) * 1000).toISOString(),
      timeLeft: formatTimeLeft(endTime),
      bidder,
      settled,
    };

    res.status(200).json({
      success: true,
      contract: CONTRACT_ADDRESS,
      function: 'auction()',
      selector: '0x7d9f6db5',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Unknown error',
    });
  }
};
