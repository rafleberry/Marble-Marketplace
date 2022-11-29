import { useEffect, useState } from 'react'
import styled from 'styled-components'
// import { CollectionFilter } from './filter'
import { NftCard } from 'components/NFT'
import {
  nearViewFunction,
  nftViewFunction,
  STAKING_CONTRACT_NAME,
} from 'util/near'
import { getCurrentWallet } from 'util/sender-wallet'

let nftCurrentIndex
const MyStakedNFTs = ({ id }) => {
  const [loading, setLoading] = useState(true)
  const [nfts, setNfts] = useState([])

  const wallet = getCurrentWallet()

  useEffect(() => {
    ;(async () => {
      try {
        const stakeInfo = await nearViewFunction({
          contractId: STAKING_CONTRACT_NAME,
          methodName: 'get_stake_info',
          args: {
            owner: wallet?.accountId,
          },
        })

        const nftInfos = await Promise.all(
          stakeInfo.token_ids.map(async (_token_id) => {
            const _nftInfo = await nftViewFunction({
              methodName: 'nft_token',
              args: {
                token_id: _token_id,
              },
            })
            const showData = {
              image:
                process.env.NEXT_PUBLIC_PINATA_URL + _nftInfo.metadata.media,
              name: _nftInfo.metadata.title,
              owner: wallet?.accountId,
              saleType: 'NotSale',
            }
            return showData
          })
        )
        setNfts(nftInfos)
      } catch (err) {
      } finally {
        setLoading(false)
      }
    })()
  }, [id, wallet?.accountId])
  return (
    <CollectionWrapper>
      <NftList>
        {nfts.map((_nft, index) => (
          <NftCard key={index} nft={_nft} id={id} type="" />
        ))}
      </NftList>
    </CollectionWrapper>
  )
}

const CollectionWrapper = styled.div`
  @media (max-width: 650px) {
    width: fit-content;
  }
`

const NftList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 30px;
`

export default MyStakedNFTs
