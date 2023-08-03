import yargs from 'yargs'
import fetch from 'node-fetch'

function loadConfig() {
  return yargs
    .env()
    .options({
      'blockscout-url': {
        type: 'string',
        default: 'https://rc1-blockscout.celo-testnet.org/mainnet',
      },
      'test-user-address': {
        type: 'string',
        demandOption: true,
      },
    })
    .parseSync()
}

// query from Valora blockchain-api https://github.com/valora-inc/blockchain-api/blob/9f7136f1e40e568197e1d75dfb41326cbec29faa/src/datasource/blockscout/BlockscoutDataSource.ts#L36
const MAX_RESULTS_PER_QUERY = 25
const MAX_TRANSFERS_PER_TRANSACTIONS = 40
const TRANSFERS_QUERY = `
query Transfers($address: AddressHash!, $afterCursor: String) {
  # TXs related to cUSD or cGLD transfers
  tokenTransferTxs(addressHash: $address, first: ${MAX_RESULTS_PER_QUERY}, after: $afterCursor) {
    edges {
      node {
        transactionHash
        blockNumber
        timestamp
        gasPrice
        gasUsed
        feeToken
        gatewayFee
        gatewayFeeRecipient
        input
        # Transfers associated with the TX
        tokenTransfer(first: ${MAX_TRANSFERS_PER_TRANSACTIONS}) {
          edges {
            node {
              fromAddressHash
              toAddressHash
              fromAccountHash
              toAccountHash
              value
              tokenAddress
              tokenType
              tokenId
            }
          }
        }
      }
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
`

export async function main() {
  const { blockscoutUrl, testUserAddress } = loadConfig()

  // token transfers
  const tokenTransfersResponse = await fetch(`${blockscoutUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      query: TRANSFERS_QUERY,
      variables: { address: testUserAddress },
    }),
  })

  return {
    tokenTransfersOk: tokenTransfersResponse.ok,
  }
}
