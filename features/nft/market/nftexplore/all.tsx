import * as React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import InfiniteScroll from 'react-infinite-scroll-component'
import { ChakraProvider, Spinner, LinkBox, Button } from '@chakra-ui/react'
import DropDownButton from 'components/DrowdownButton'
import { default_image } from 'util/constants'
import {
  NFT_CONTRACT_NAME,
  nftViewFunction,
  marketplaceViewFunction,
  TOKEN_DENOMS,
} from 'util/near'
import { NftCard, NftCountsType } from 'components/NFT'
import { convertMicroDenomToDenom } from 'util/conversion'
import useAxios from 'hooks/useAxios'
import { useSelector } from 'react-redux'
import { nfts_per_page } from 'util/constants'
import {
  ExploreWrapper,
  Filter,
  FilterCard,
  CountWrapper,
  Container,
  FilterSortWrapper,
} from './styled'
const sortValue = {
  Newest: 'desc',
  Oldest: 'asc',
}
const Explore = () => {
  const [nfts, setNfts] = useState([])
  const [nftCounts, setNftCounts] = useState<NftCountsType>({
    buynow: 0,
    activeOffer: 0,
    auction: 0,
  })
  const [sort, setSort] = useState('Newest')
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const { countInfo } = useSelector((state: any) => state.uiData)
  const { getNftCounts, getAllNftIds } = useAxios()
  const fetchNfts = async (currentPage) => {
    let collectionNFTs = []
    let counts = { Auction: 0, 'Direct Sell': 0, NotSale: 0, Offer: 0 }
    const tokenIds = await getAllNftIds(
      currentPage,
      nfts_per_page,
      sortValue[sort]
    )
    if (tokenIds.length < 12) setHasMore(false)
    const info = await nftViewFunction({
      methodName: 'nft_tokens_by_ids',
      args: {
        token_ids: tokenIds.map((id) => id.id),
      },
    })

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
        let collection_data
        try {
          collection_data = await nftViewFunction({
            methodName: 'nft_get_series_single',
            args: {
              token_series_id: element.token_id.split(':')[0],
            },
          })
        } catch (error) {
          console.log('getCollectionError: ', error)
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
          // let ipfs_collection = await fetch(
          //   process.env.NEXT_PUBLIC_PINATA_URL + element.metadata.extra
          // )
          res_nft = await ipfs_nft.json()
          res_collection = await ipfs_collection.json()
        } catch (err) {}
        res_nft['tokenId'] = element.token_id.split(':')[1]
        // res_nft['title'] = res_collection.name
        res_nft['title'] = collection_data.metadata.title
        res_nft['owner'] = element.owner_id
        res_nft['image'] = process.env.NEXT_PUBLIC_PINATA_URL + res_nft.uri
        res_nft['collection_logo'] = res_collection.logo
          ? process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo
          : default_image
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
        console.log('res_nft: ', element)
        collectionNFTs.push(res_nft)
        counts[res_nft.saleType]++
      })
    )
    setNfts(nfts.concat(collectionNFTs))
    setPage(currentPage + 1)
  }

  useEffect(() => {
    ;(async () => {
      const nftCounts = await getNftCounts()
      setNftCounts(nftCounts)
      await fetchNfts(0)
    })()
  }, [sort])
  const getMoreNfts = async () => {
    await fetchNfts(page)
  }
  const handleSortChange = async (e) => {
    setSort(e)
    setPage(0)
    setNfts([])
  }
  return (
    <ExploreWrapper>
      <FilterSortWrapper>
        <Filter>
          <Link href="/explore/nfts" passHref>
            <FilterCard isActive={true}>
              <CountWrapper>{countInfo.nft}</CountWrapper>All
            </FilterCard>
          </Link>
          <Link href="/explore/nfts/buynow" passHref>
            <FilterCard>
              <CountWrapper>{nftCounts.buynow}</CountWrapper>Buy Now
            </FilterCard>
          </Link>
          <Link href="/explore/nfts/liveauction" passHref>
            <FilterCard>
              <CountWrapper>{nftCounts.auction}</CountWrapper>Live Auction
            </FilterCard>
          </Link>
          <Link href="/explore/nfts/activeoffer" passHref>
            <FilterCard>
              <CountWrapper>{nftCounts.activeOffer}</CountWrapper>Active Offers
            </FilterCard>
          </Link>
        </Filter>
        <DropDownButton
          menuList={['Newest', 'Oldest']}
          onChange={handleSortChange}
          current={sort}
        />
      </FilterSortWrapper>
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
          {nfts.map((nftInfo, index) => (
            <Link
              href={`/nft/${nftInfo.collectionId}/${nftInfo.tokenId}`}
              passHref
              key={index}
            >
              <LinkBox as="picture">
                <NftCard nft={nftInfo} id="" type="" />
              </LinkBox>
            </Link>
          ))}
        </Container>
      </InfiniteScroll>
    </ExploreWrapper>
  )
}

export default Explore
