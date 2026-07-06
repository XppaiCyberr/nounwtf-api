const { resolveEns } = require('./lib/ens');

const GRAPHQL_URL = 'https://spirited-flexibility-production-3c30.up.railway.app/graphql';
const GRANT_LIMIT = 4;

const QUERY = `
  query LatestGrants {
    grants(limit: ${GRANT_LIMIT}, orderDirection: "DESC", where: {status_not: CANCELED}) {
      items {
        id
        description
        proposer
      }
    }
  }
`;

function getTitle(description) {
  if (typeof description !== 'string') {
    return null;
  }

  const match = description.match(/^([\s\S]*?)(?:\r?\n\r?\n|$)/);
  return match ? match[1].trim().replace(/^#\s*/, '') : null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ query: QUERY }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.errors?.[0]?.message || `GraphQL request failed with ${response.status}`);
    }

    if (result.errors?.length) {
      throw new Error(result.errors[0].message || 'GraphQL request failed');
    }

    const grants = result.data?.grants?.items || [];
    const data = await Promise.all(
      grants.map(async (grant) => ({
        id: grant.id,
        title: getTitle(grant.description),
        proposer: await resolveEns(grant.proposer),
      }))
    );

    res.status(200).json({
      success: true,
      limit: GRANT_LIMIT,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Unknown error',
    });
  }
};
