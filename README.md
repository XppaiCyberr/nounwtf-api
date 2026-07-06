# noun.wtf API Endpoints

Small Vercel/Node.js endpoints for reading current auction state from Ethereum
mainnet.

This endpoint is part of the [XPP hackathon grant](https://noun.wtf/grants/34).
For the broader project, including firmware notes and step-by-step DIY
instructions, see the
[nounwtf-xpp repository](https://github.com/XppaiCyberr/nounwtf-xpp).

Live demo: https://nounv2api.vercel.app/

## Endpoints

### `GET /`

Serves a compact landing page that documents the available API routes.

### `GET /api/auction`

noun.wtf v2 auction endpoint. Calls the contract's read-only `auction()`
function and returns JSON.

- Contract: `0x9A6DDb16e23967D5482E5BfD7444A04a5D5145fC`
- Function: `auction()`
- CORS: enabled for browser clients

### `GET /api/nouns-auction`

nouns.wtf auction endpoint. Calls the contract's read-only `auction()`
function and returns JSON.

- Contract: `0x830BD73E4184ceF73443C15111a1DF14e495C706`
- Function: `auction()`
- CORS: enabled for browser clients

Example auction response:

```json
{
  "success": true,
  "contract": "0x9A6DDb16e23967D5482E5BfD7444A04a5D5145fC",
  "function": "auction()",
  "data": {
    "nounId": "52",
    "amount": "0",
    "amountETH": "0",
    "startTime": "1782862595",
    "endTime": "1782948995",
    "timeLeft": "00:00",
    "bidder": "0x0000000000000000000000000000000000000000",
    "settled": false
  }
}
```

`timeLeft` is calculated from `endTime` and the current server time, formatted
as `HH:MM`. Expired auctions return `00:00`.

### `GET /api/grant`

noun.wtf v2 grant endpoint. Reads the latest non-canceled grant from the
noun.wtf GraphQL API and returns the grant `id`, parsed `title`, and `proposer`.
`title` is parsed from `description` before the first blank line, with a
leading Markdown `#` removed. `proposer` is resolved to an ENS name when
available, first from the local ENS cache and then from ENS Ideas. If neither
source has a name, the endpoint returns the proposer address.

- Source: `https://spirited-flexibility-production-3c30.up.railway.app/graphql`
- Query: `grants(limit: 1, orderDirection: "DESC", where: {status_not: CANCELED})`
- ENS cache: `https://cdn.jsdelivr.net/gh/xppaicyberr/nounsProposals/ens-cache.json`
- ENS fallback: `https://api.ensideas.com/ens/resolve/:address`
- CORS: enabled for browser clients

Before compacting, the grant response included source/query metadata and the
full GraphQL fields:

```json
{
  "success": true,
  "source": "https://spirited-flexibility-production-3c30.up.railway.app/graphql",
  "query": "grants(limit: 1, orderDirection: \"DESC\", where: {status_not: CANCELED})",
  "data": {
    "title": "NOUN.WTF://PHYSICALART",
    "description": "# NOUN.WTF://PHYSICALART\n\nHI, IT'S ME XPP.\n\n...",
    "status": "EXECUTED",
    "proposer": "0xe11018c82d4405bdbc7414ec988fd08351666666"
  }
}
```

Current compact grant response:

```json
{
  "success": true,
  "data": {
    "id": "34",
    "title": "NOUN.WTF://PHYSICALART",
    "proposer": "xppaicyber.eth"
  }
}
```

Errors return HTTP 500:

```json
{
  "success": false,
  "error": "..."
}
```

## Project Files

- `index.html` - static landing page served at `/`
- `api/auction.js` - Vercel serverless function served at `/api/auction`
- `api/nouns-auction.js` - Vercel serverless function served at `/api/nouns-auction`
- `api/grant.js` - Vercel serverless function served at `/api/grant`
- `package.json` - dependencies and npm scripts
- `pnpm-lock.yaml` - locked dependency versions

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the local contract reader:

```bash
pnpm local
```

Equivalent direct command:

```bash
node local.js
```

Check the API file syntax:

```bash
node --check api/auction.js
node --check api/grant.js
```

## Deploy to Vercel

Install the Vercel CLI if needed:

```bash
npm i -g vercel
```

Deploy from the project directory:

```bash
vercel
```

After deployment:

- Landing page: `https://<your-project>.vercel.app/`
- noun.wtf v2 API: `https://<your-project>.vercel.app/api/auction`
- nouns.wtf API: `https://<your-project>.vercel.app/api/nouns-auction`
- noun.wtf v2 grant API: `https://<your-project>.vercel.app/api/grant`

## RPC Endpoint

The current API code uses the public Ethereum RPC endpoint
`https://eth.drpc.org`.

Public RPCs can be rate-limited or temporarily unavailable. For production use,
prefer a dedicated Ethereum mainnet RPC provider such as Alchemy, Infura,
QuickNode, or DRPC.

## Reusing the Pattern

To read a different contract function, update `CONTRACT_ADDRESS` and the
minimal `ABI` in the relevant API file. Keep `bigint` values converted to
strings so the JSON response remains browser-safe.
