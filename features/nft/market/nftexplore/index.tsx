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
} from 'util/near'
import { NftCard } from 'components/NFT/nft-card'

const Explore = () => {
  const [nfts, setNfts] = useState([])
  const [nftCounts, setNftCounts] = useState({
    Auction: 0,
    'Direct Sell': 0,
    NotSale: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filtered, setFiltered] = useState([])
  const [filterTab, setFilterTab] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const fetchNfts = async () => {
    let collectionNFTs = []
    let counts = { Auction: 0, 'Direct Sell': 0, NotSale: 0 }
    let info = []
    try {
      info = await nftViewFunction({
        methodName: 'nft_tokens',
        args: {
          // from_index: nfts.length.toString(),
          // limit: 20,
        },
      })
    } catch (error) {
      console.log('nft_tokens Error: ', error)
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
            ? 'Auction'
            : 'Direct Sell'
          res_nft['price'] = market_data.price
          res_nft['started_at'] = market_data.started_at
          res_nft['ended_at'] = market_data.ended_at
          res_nft['current_time'] = market_data.current_time
          res_nft['ft_token_id'] = market_data.ft_token_id
        } else res_nft['saleType'] = 'NotSale'
        collectionNFTs.push(res_nft)
        counts[res_nft.saleType]++
      })
    )
    return { nftList: collectionNFTs, nft_counts: counts }
  }

  useEffect(() => {
    // fetchCollections()
    ;(async () => {
      const { nftList, nft_counts }: any = await fetchNfts()
      setNfts(nftList)
      setFiltered(nftList)
      setNftCounts(nft_counts)
      setLoading(false)
    })()
  }, [])
  const handleFilter = (id: string) => {
    const filteredNFTs = nfts.filter((nft) => nft.saleType === id)
    setFiltered(filteredNFTs)
    setFilterTab(id)
  }
  const getMoreNfts = async () => {
    // await fetchNfts()
  }
  return (
    <ExploreWrapper>
      <Filter>
        <FilterCard onClick={() => handleFilter('Direct Sell')}>
          <NumberWrapper isActive={filterTab === 'Direct Sell'}>
            {nftCounts['Direct Sell']}
          </NumberWrapper>
          Buy Now
        </FilterCard>
        <FilterCard onClick={() => handleFilter('Auction')}>
          <NumberWrapper isActive={filterTab === 'Auction'}>
            {nftCounts['Auction']}
          </NumberWrapper>
          Live Auction
        </FilterCard>
        <FilterCard onClick={() => handleFilter('NotSale')}>
          <NumberWrapper isActive={filterTab === 'NotSale'}>
            {nftCounts['NotSale']}
          </NumberWrapper>
          Active Offers
        </FilterCard>
      </Filter>
      {loading ? (
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
      ) : (
        <InfiniteScroll
          dataLength={filtered.length}
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
      )}
    </ExploreWrapper>
  )
}

const ExploreWrapper = styled.div``
const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 20px 0;
  gap: 20px;
`
const Filter = styled.div`
  display: flex;
  column-gap: 20px;
  width: 800px;
`
const FilterCard = styled.div`
  border-radius: 30px;
  backdrop-filter: blur(30px);
  box-shadow: 0px 7px 14px rgba(0, 0, 0, 0.1),
    inset 0px 14px 24px rgba(17, 20, 29, 0.4);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  display: flex;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: Mulish;
  align-items: center;
  width: fit-content;
  padding: 10px;
`
const NumberWrapper = styled.div<{ isActive: boolean }>`
  height: 34px;
  background: ${({ isActive }) =>
    isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ isActive }) => (isActive ? 'black' : 'white')};
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  margin-right: 10px;
`
export default Explore
