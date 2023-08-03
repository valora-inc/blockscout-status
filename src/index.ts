import yargs from 'yargs'
import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'
import got from 'got'

function loadConfig() {
  return yargs
    .env()
    .options({
      'blockscout-url': {
        type: 'string',
        default: 'https://rc1-blockscout.celo-testnet.org/mainnet',
      },
      'test-token-address': {
        type: 'string',
        default: '0x765de816845861e75a25fca122bb6898b8b1282a', // cusd mainnet
        description:
          'address of token to check blockscout can find recent transfers for. Should have high transfer ' +
          'volume to make the test effective (if latest transfers are several blocks back, blockscout could be behind ' +
          'and still pass the test)',
      },
      'max-blocks-behind': {
        type: 'number',
        default: 3,
        description: 'maximum number of blocks behind blockscout should be',
      },
      'rpc-url': {
        type: 'string',
        description:
          'URL of the Celo RPC node to use. Should not be blockscout because we use this to cross-check blockscout results',
        default: 'https://forno.celo.org',
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
  const { blockscoutUrl, rpcUrl, maxBlocksBehind } = loadConfig()

  const client = createPublicClient({
    chain: celo,
    transport: http(rpcUrl),
  })

  // get recent transfers from the RPC node
  const lastBlockNumber = await client.getBlockNumber()
  const fromBlock = lastBlockNumber - BigInt(maxBlocksBehind + 1) // note: this relies on the contract having transfers every block. might need to rethink that.
  const transferLogs = await client.getLogs({
    toBlock: lastBlockNumber - BigInt(maxBlocksBehind),
    fromBlock,
    event: {
      anonymous: false,
      inputs: [
        { indexed: true, name: 'from', type: 'address' },
        { indexed: true, name: 'to', type: 'address' },
        { indexed: false, name: 'value', type: 'uint256' },
      ],
      name: 'Transfer',
      type: 'event',
    },
  })
  if (!transferLogs.length) {
    throw new Error(`No transfers found in block ${fromBlock}`)
  }
  const transferLog = transferLogs[0]

  // verify blockscout can find recent transfers
  const tokenTransfersResponse = await got
    .post(`${blockscoutUrl}/graphql`, {
      // method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      json: {
        query: TRANSFERS_QUERY,
        variables: { address: transferLog.args.from },
      },
    })
    .json()

  console.log(
    `tokenTransfersResponse json: ${JSON.stringify(
      await tokenTransfersResponse,
    )}`,
  )

  return {
    ok: true, // TODO
  }
}

main()
  .then(() => {
    console.log('done')
    process.exit(0)
  })
  .catch(console.error)
