const GRAPHQL_URL = 'https://spirited-flexibility-production-3c30.up.railway.app/graphql';

const QUERY = `
  query LatestGrant {
    grants(limit: 1, orderDirection: "DESC", where: {status_not: CANCELED}) {
      items {
        description
        status
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

    const grant = result.data?.grants?.items?.[0] || null;
    const data = grant
      ? {
          title: getTitle(grant.description),
          proposer: grant.proposer,
        }
      : null;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Unknown error',
    });
  }
};
