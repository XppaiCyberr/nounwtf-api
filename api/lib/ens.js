const ENS_CACHE_URL = 'https://cdn.jsdelivr.net/gh/xppaicyberr/nounsProposals/ens-cache.json';
const ENS_IDEAS_URL = 'https://api.ensideas.com/ens/resolve';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

async function fetchJson(url) {
  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return result;
}

async function resolveEns(address) {
  if (typeof address !== 'string' || !address) {
    return address;
  }

  const normalizedAddress = address.toLowerCase();

  if (normalizedAddress === ZERO_ADDRESS) {
    return null;
  }

  try {
    const ensCache = await fetchJson(ENS_CACHE_URL);
    const cachedName = ensCache[normalizedAddress];

    if (cachedName) {
      return cachedName;
    }
  } catch (err) {
    // Optional cache failures should not fail API responses.
  }

  try {
    const resolved = await fetchJson(`${ENS_IDEAS_URL}/${normalizedAddress}`);
    return resolved.displayName || resolved.name || address;
  } catch (err) {
    return address;
  }
}

function nullIfZeroAddress(address) {
  if (typeof address !== 'string') {
    return address;
  }

  return address.toLowerCase() === ZERO_ADDRESS ? null : address;
}

module.exports = {
  ENS_CACHE_URL,
  ENS_IDEAS_URL,
  nullIfZeroAddress,
  resolveEns,
};
