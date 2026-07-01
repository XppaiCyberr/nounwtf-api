// Run with: node local.js
// Optionally update RPC_URL for a dedicated Ethereum mainnet RPC endpoint.

const { createPublicClient, http, formatEther, getAddress } = require('viem');
const { mainnet } = require('viem/chains');

const CONTRACT_ADDRESS = getAddress('0x9a6ddb16e23967d5482e5bfd7444a04a5d5145fc');
const RPC_URL = 'https://eth.drpc.org';

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

(async () => {
  try {
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'auction',
    });

    const [nounId, amount, startTime, endTime, bidder, settled] = result;

    console.log('auction() result:');
    console.log({
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
    });
  } catch (err) {
    console.error('Error reading contract:', err.message);
    process.exit(1);
  }
})();
