import * as React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import InfiniteScroll from 'react-infinite-scroll-component'
import { ChakraProvider, Spinner, Grid, LinkBox } from '@chakra-ui/react'
import styled from 'styled-components'
import {
  NFT_CONTRACT_NAME,
  nftViewFunction,
  marketplaceViewFunction,
  TOKEN_DENOMS,
} from 'util/near'
import { NftCard } from 'components/NFT/nft-card'
import { convertMicroDenomToDenom } from 'util/conversion'

const Explore = () => {
  const [nfts, setNfts] = useState([])
  const [nftCounts, setNftCounts] = useState({
    Auction: 0,
    'Direct Sell': 0,
    NotSale: 0,
    Offer: 0,
  })
  const [filtered, setFiltered] = useState([])
  const [filterTab, setFilterTab] = useState('all')
  const [hasMore, setHasMore] = useState(true)
  const fetchNfts = async () => {
    let collectionNFTs = []
    let counts = { Auction: 0, 'Direct Sell': 0, NotSale: 0, Offer: 0 }
    let info = []
    try {
      info = await nftViewFunction({
        methodName: 'nft_tokens',
        args: {
          from_index: nfts.length.toString(),
          limit: 12,
        },
      })
    } catch (error) {
      console.log('nft_tokens Error: ', error)
      setHasMore(false)
      return []
    }
    await Promise.all(
      info.map(async (element) => {
        let market_data
        // if (!element.metadata.extra) return
        try {
          market_data = await marketplaceViewFunction({
            methodName: 'get_market_data',
            args: {
              nft_contract_id: NFT_CONTRACT_NAME,
              token_id: element.token_id,
            },
          })
        } catch (error) {
          console.log('get_market_data error: ', error)
        }
        let res_nft: any = {}
        let res_collection: any = {}
        try {
          let ipfs_nft = await fetch(
            process.env.NEXT_PUBLIC_PINATA_URL + element.metadata.reference
          )
          let ipfs_collection = await fetch(
            process.env.NEXT_PUBLIC_PINATA_URL + element.metadata.extra
          )
          res_nft = await ipfs_nft.json()
          res_collection = await ipfs_collection.json()
        } catch (err) {}

        res_nft['tokenId'] = element.token_id.split(':')[1]
        res_nft['title'] = res_collection.name
        res_nft['owner'] = element.owner_id
        res_nft['image'] = process.env.NEXT_PUBLIC_PINATA_URL + res_nft.uri
        if (market_data) {
          res_nft['saleType'] = market_data.is_auction
            ? market_data.bids.length > 0
              ? 'Offer'
              : 'Auction'
            : 'Direct Sell'
          ;(res_nft['price'] = convertMicroDenomToDenom(
            market_data.price,
            TOKEN_DENOMS[market_data.ft_token_id]
          ).toFixed(2)),
            (res_nft['started_at'] = market_data.started_at)
          res_nft['ended_at'] = market_data.ended_at
          res_nft['current_time'] = market_data.current_time
          res_nft['ft_token_id'] = market_data.ft_token_id
          res_nft['highest_bid'] =
            market_data.bids &&
            market_data.bids.length > 0 &&
            convertMicroDenomToDenom(
              market_data.bids[market_data.bids.length - 1].price,
              TOKEN_DENOMS[market_data.ft_token_id]
            ).toFixed(2)
        } else res_nft['saleType'] = 'NotSale'
        collectionNFTs.push(res_nft)
        counts[res_nft.saleType]++
      })
    )
    setNfts(nfts.concat(collectionNFTs))
    // return { nftList: collectionNFTs, nft_counts: counts }
  }

  useEffect(() => {
    // fetchCollections()
    ;(async () => {
      await fetchNfts()
      // setNftCounts(nft_counts)
      // setLoading(false)
    })()
  }, [])
  useEffect(() => {
    const filteredNFTs =
      filterTab === 'all'
        ? nfts
        : nfts.filter((nft) => nft.saleType === filterTab)
    setFiltered(filteredNFTs)
  }, [nfts, filterTab])
  const handleFilter = (id: string) => {
    // const filteredNFTs = nfts.filter((nft) => nft.saleType === id)
    // setFiltered(filteredNFTs)
    setFilterTab(id)
  }
  const getMoreNfts = async () => {
    await fetchNfts()
  }
  return (
    <ExploreWrapper>
      <Filter>
        <FilterCard
          onClick={() => handleFilter('all')}
          isActive={filterTab === 'all'}
        >
          {/* <NumberWrapper isActive={filterTab === 'Direct Sell'}>
            {nftCounts['Direct Sell']}
          </NumberWrapper> */}
          All
        </FilterCard>
        <FilterCard
          onClick={() => handleFilter('Direct Sell')}
          isActive={filterTab === 'Direct Sell'}
        >
          {/* <NumberWrapper isActive={filterTab === 'Direct Sell'}>
            {nftCounts['Direct Sell']}
          </NumberWrapper> */}
          Buy Now
        </FilterCard>
        <FilterCard
          onClick={() => handleFilter('Auction')}
          isActive={filterTab === 'Auction'}
        >
          {/* <NumberWrapper isActive={filterTab === 'Auction'}>
            {nftCounts['Auction']}
          </NumberWrapper> */}
          Live Auction
        </FilterCard>
        <FilterCard
          onClick={() => handleFilter('Offer')}
          isActive={filterTab === 'Offer'}
        >
          {/* <NumberWrapper isActive={filterTab === 'Offer'}>
            {nftCounts['Offer']}
          </NumberWrapper> */}
          Active Offers
        </FilterCard>
      </Filter>

      <InfiniteScroll
        dataLength={nfts.length}
        next={getMoreNfts}
        hasMore={hasMore}
        loader={
          <ChakraProvider>
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                padding: '20px',
              }}
            >
              <Spinner size="xl" />
            </div>
          </ChakraProvider>
        }
        endMessage={<h4></h4>}
      >
        <Container>
          {filtered.map((nftInfo, index) => (
            <Link
              href={`/nft/${nftInfo.collectionId}/${nftInfo.tokenId}`}
              passHref
              key={index}
            >
              <LinkBox
                as="picture"
                transition="transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) 0s"
                _hover={{
                  transform: 'scale(1.05)',
                }}
              >
                <NftCard nft={nftInfo} id="" type="" />
              </LinkBox>
            </Link>
          ))}
        </Container>
      </InfiniteScroll>
    </ExploreWrapper>
  )
}

const ExploreWrapper = styled.div`
  width: 100%;
`
const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 20px 0;
  gap: 20px;
  overflow: auto;
  @media (max-width: 1550px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`
const Filter = styled.div`
  display: flex;
  column-gap: 20px;
  overflow: auto;
`
const FilterCard = styled.div<{ isActive: boolean }>`
  border-radius: 30px;

  border: 1px solid;

  border-image-source: linear-gradient(
    106.01deg,
    rgba(255, 255, 255, 0.2) 1.02%,
    rgba(255, 255, 255, 0) 100%
  );
  box-shadow: 0px 7px 14px 0px #0000001a, 0px 14px 24px 0px #11141d66 inset;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  padding: 15px 30px;
  cursor: pointer;
  text-align: center;
  font-family: Mulish;
  color: ${({ isActive }) => (isActive ? 'white' : 'rgba(255,255,255,0.5)')};
  @media (max-width: 480px) {
    width: 114px;
    font-size: 12px;
  }
`
export default Explore
