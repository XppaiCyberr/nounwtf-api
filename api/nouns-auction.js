const { createPublicClient, http, formatEther, getAddress } = require('viem');
const { mainnet } = require('viem/chains');

const CONTRACT_ADDRESS = getAddress('0x830bd73e4184cef73443c15111a1df14e495c706');
const RPC_URL = 'https://eth.drpc.org';

const ABI = [
  {
    inputs: [],
    name: 'auction',
    outputs: [
      { internalType: 'uint96', name: 'nounId', type: 'uint96' },
      { internalType: 'uint128', name: 'amount', type: 'uint128' },
      { internalType: 'uint40', name: 'startTime', type: 'uint40' },
      { internalType: 'uint40', name: 'endTime', type: 'uint40' },
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

    const [nounId, amount, startTime, endTime, bidder, settled] = result;

    const data = {
      nounId: nounId.toString(),
      amount: amount.toString(),
      amountETH: formatEther(amount),
      startTime: startTime.toString(),
      endTime: endTime.toString(),
      timeLeft: formatTimeLeft(endTime),
      bidder,
      settled,
    };

    res.status(200).json({
      success: true,
      contract: CONTRACT_ADDRESS,
      function: 'auction()',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Unknown error',
    });
  }
};
