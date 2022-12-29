import { ChakraProvider, Spinner, Stack, Text } from '@chakra-ui/react'
import { Button } from 'components/Button'
import { NftTable } from 'components/NFT'
import { RoundedIconComponent } from 'components/RoundedIcon'
import { getCollectionCategory } from 'hooks/useCollection'
import { More, ArrowDown } from 'icons'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import styled from 'styled-components'
import { SecondGradientBackground } from 'styles/styles'
import { default_featured_image, default_image } from 'util/constants'
import { convertMicroDenomToDenom } from 'util/conversion'
import { isMobile } from 'util/device'
import Image from 'components/Img'
import {
  marketplaceViewFunction,
  nftViewFunction,
  NFT_CONTRACT_NAME,
  TOKEN_DENOMS,
} from 'util/near'
import { getCurrentWallet } from 'util/sender-wallet'
import EditCollectionModal from './components/EditCollectionModal'

interface CollectionProps {
  readonly id: string
}

let pageCount = 10
export const Collection = ({ id }: CollectionProps) => {
  const router = useRouter()
  const wallet = getCurrentWallet()
  const [category, setCategory] = useState('Digital')
  const [collectionInfo, setCollectionInfo] = useState<any>({})
  const [pageNum, setPageNum] = useState(0)
  const [isCollapse, setCollapse] = useState(false)
  const [nfts, setNfts] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [filtered, setFiltered] = useState([])
  const [filterTab, setFilterTab] = useState('all')
  const fetchCollectionInfo = useCallback(async () => {
    let result: any = {}
    let collection_info: any = {}
    try {
      collection_info = await nftViewFunction({
        methodName: 'nft_get_series_single',
        args: {
          token_series_id: id,
        },
      })
    } catch (error) {
      console.log('collection_info: ', error)
      router.push('/404')
    }
    try {
      let ipfs_collection = await fetch(
        process.env.NEXT_PUBLIC_PINATA_URL + collection_info.metadata.reference
      )
      result = await ipfs_collection.json()
    } catch (err) {
      console.log('error: ', err)
    }

    result.logo = result.logo
      ? process.env.NEXT_PUBLIC_PINATA_URL + result.logo
      : default_image
    result.featuredImage = result.featuredImage
      ? process.env.NEXT_PUBLIC_PINATA_URL + result.featuredImage
      : default_featured_image
    result.creator = collection_info.creator_id
    result.name = collection_info.metadata.title
    result.symbol = collection_info.metadata.description
    result.token_series_id = collection_info.token_series_id
    setCategory(collection_info.metadata.description)
    setCollectionInfo(result)
    return result
  }, [id])
  const fetchTokensInfo = async () => {
    let collectionNFTs = []
    let info = []
    let res_collection = await fetchCollectionInfo()
    try {
      info = await nftViewFunction({
        methodName: 'nft_tokens_by_series',
        args: {
          token_series_id: id,
          from_index: (pageNum * 12).toString(),
          limit: 12,
        },
      })
      setPageNum(pageNum + 1)
    } catch (error) {
      setHasMore(false)
      return []
    }

    await Promise.all(
      info.map(async (element) => {
        let market_data
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
        let ipfs_nft = await fetch(
          process.env.NEXT_PUBLIC_PINATA_URL + element.metadata.reference
        )

        let res_nft = await ipfs_nft.json()
        res_nft['owner'] = element.owner_id
        res_nft['tokenId'] = element.token_id.split(':')[1]
        res_nft['title'] = res_collection.name
        res_nft['image'] = process.env.NEXT_PUBLIC_PINATA_URL + res_nft.uri
        if (market_data) {
          res_nft['saleType'] = market_data.is_auction
            ? 'Auction'
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
      })
    )
    return collectionNFTs
  }
  useEffect(() => {
    ;(async () => {
      if (id === undefined || id == '[name]') return false
      try {
        const num = await nftViewFunction({
          methodName: 'nft_supply_for_series',
          args: {
            token_series_id: id,
          },
        })
        const _category = await getCollectionCategory(id)

        setCategory(_category)
      } catch (err) {
        console.log('nft get counts error: ', err)
      }
    })()
  }, [id])
  useEffect(() => {
    ;(async () => {
      if (id === undefined || id == '[name]') return false

      const tokensInfo = await fetchTokensInfo()
      setNfts(tokensInfo)
    })()
  }, [id])
  const getMoreNfts = async () => {
    const _tokensInfo = await fetchTokensInfo()
    setNfts([...nfts, ..._tokensInfo])
  }
  const handleFilter = (id: string) => {
    // const filteredNFTs = nfts.filter((nft) => nft.saleType === id)
    // setFiltered(filteredNFTs)
    setFilterTab(id)
  }
  useEffect(() => {
    const filteredNFTs =
      filterTab === 'all'
        ? nfts
        : nfts.filter((nft: any) => nft.saleType === filterTab)
    setFiltered(filteredNFTs)
  }, [nfts, filterTab])
  return (
    <ChakraProvider>
      <CollectionWrapper>
        <Banner>
          <BannerImage
            src={collectionInfo.featuredImage}
            defaultImage={default_featured_image}
            alt="banner"
          />
          <Stack spacing={5}>
            <Logo
              src={collectionInfo.logo}
              defaultImage={default_image}
              alt="logo"
            />
            <LogoTitle>{collectionInfo.name}</LogoTitle>
            {wallet.accountId === collectionInfo.creator && (
              <Stack width="250px">
                <EditCollectionModal
                  collectionInfo={collectionInfo}
                  setCategory={(e) => {
                    setCategory(e)
                  }}
                  category={category}
                />
              </Stack>
            )}
            <ProfileInfo>
              <ProfileInfoItem>
                <ProfileInfoTitle>Creator</ProfileInfoTitle>
                <RoundedIconComponent
                  size="30px"
                  address={collectionInfo.creator}
                />
              </ProfileInfoItem>
              {!isMobile() && (
                <ProfileInfoItem>
                  <ProfileInfoTitle>Symbol</ProfileInfoTitle>
                  <ProfileInfoContent>NEAR</ProfileInfoContent>
                </ProfileInfoItem>
              )}
              {!isMobile() && (
                <ProfileInfoItem>
                  <ProfileInfoTitle>Collection Of</ProfileInfoTitle>
                  <ProfileInfoContent>{id}</ProfileInfoContent>
                </ProfileInfoItem>
              )}
              <ProfileInfoItem>
                <ProfileInfoTitle>Total Sales</ProfileInfoTitle>
                <ProfileInfoContent>10 NEAR</ProfileInfoContent>
              </ProfileInfoItem>
            </ProfileInfo>
          </Stack>
          <ReportWrapper>
            <More />
          </ReportWrapper>
        </Banner>
        <Heading>
          <Stack>
            <Text fontSize={isMobile() ? '24px' : '36px'} fontWeight="700">
              Description
            </Text>
            <DescriptionArea>{collectionInfo.description}</DescriptionArea>
          </Stack>

          {wallet.accountId === collectionInfo.creator && (
            <Link href={`/create`} passHref>
              <Button
                className="btn-buy btn-default"
                css={{
                  background: '$white',
                  color: '$black',
                  stroke: '$black',
                  width: 'fit-content',
                }}
                variant="primary"
                size="large"
              >
                Mint NFT
              </Button>
            </Link>
          )}
        </Heading>
        <Heading>
          <Text fontSize={isMobile() ? '24px' : '36px'} fontWeight="700">
            NFTs
          </Text>
        </Heading>
        <FilterWrapper>
          <Filter>
            <FilterCard
              onClick={() => handleFilter('all')}
              isActive={filterTab === 'all'}
            >
              All
            </FilterCard>
            <FilterCard
              onClick={() => handleFilter('Direct Sell')}
              isActive={filterTab === 'Direct Sell'}
            >
              Buy Now
            </FilterCard>
            <FilterCard
              onClick={() => handleFilter('Auction')}
              isActive={filterTab === 'Auction'}
            >
              Live Auction
            </FilterCard>
            <FilterCard
              onClick={() => handleFilter('Offer')}
              isActive={filterTab === 'Offer'}
            >
              Active Offers
            </FilterCard>
          </Filter>
          <Sort>
            Most Active <ArrowDown />
          </Sort>
        </FilterWrapper>
        <NftList>
          <InfiniteScroll
            dataLength={nfts.length}
            next={getMoreNfts}
            hasMore={hasMore}
            loader={
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
            }
            endMessage={<h4></h4>}
          >
            <NftTable data={filtered} id={id} type="buy" />
          </InfiniteScroll>
          {nfts.length === 0 && wallet.accountId === collectionInfo.creator && (
            <Stack
              spacing="50px"
              width={isMobile() ? '100%' : '50%'}
              alignItems="center"
              margin="0 auto"
              textAlign="center"
            >
              <Text fontSize="30px" fontWeight="700">
                Customize Your Collection
              </Text>
              <Text fontSize="18px" fontWeight="600">
                Before you mint an NFT to your collection, customize it by
                uploading a logo, cover image and description
              </Text>
              <EditCollectionModal
                collectionInfo={collectionInfo}
                setCategory={(e) => {
                  setCategory(e)
                }}
                category={category}
              />
            </Stack>
          )}
        </NftList>
      </CollectionWrapper>
    </ChakraProvider>
  )
}

const CollectionWrapper = styled.div``
const DescriptionArea = styled(SecondGradientBackground)`
  padding: 25px;
  font-family: Mulish;
  &:before {
    border-radius: 20px;
    opacity: 0.3;
  }
`
const Heading = styled.div`
  padding: 30px 30px 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 650px) {
    padding: 20px;
    flex-direction: column;
    row-gap: 20px;
    button {
      width: 100%;
    }
  }
`
const LogoTitle = styled.div`
  font-size: 96px;
  font-weight: 900;
  @media (max-width: 1550px) {
    font-size: 72px;
  }
  @media (max-width: 1024px) {
    font-size: 40px;
  }
  @media (max-width: 650px) {
    font-size: 30px;
  }
`
const Banner = styled.div`
  position: relative;
  height: 900px;
  width: 100%;
  display: block;
  padding: 200px 50px 50px 50px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  @media (max-width: 1550px) {
    height: 675px;
    padding: 150px 50px 50px 50px;
  }
  @media (max-width: 1024px) {
    height: 560px;
    padding: 50px 20px 20px 20px;
  }
`
const BannerImage = styled(Image)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: -1;
`
const Logo = styled(Image)`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 10px solid #ffffff21;
  @media (max-width: 1550px) {
    width: 135px;
    height: 135px;
  }
  @media (max-width: 650px) {
    width: 100px;
    height: 100px;
    border: 3px solid #ffffff21;
  }
`

const NftList = styled.div`
  padding: 40px;
  @media (max-width: 650px) {
    padding: 20px;
    width: 100%;
  }
`
const ProfileInfo = styled.div`
  padding: 20px;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 24px rgba(109, 109, 120, 0.38);
  backdrop-filter: blur(20px);
  background: linear-gradient(0deg, #050616, #050616) padding-box,
    linear-gradient(
        90.65deg,
        rgba(255, 255, 255, 0.13) 0.82%,
        rgba(255, 255, 255, 0.17) 98.47%
      )
      border-box;
  border: 1px solid;

  border-image-source: linear-gradient(
    90.65deg,
    rgba(255, 255, 255, 0.13) 0.82%,
    rgba(255, 255, 255, 0.17) 98.47%
  );
  position: absolute;
  bottom: 40px;
  border-radius: 20px;
  display: flex;
  width: fit-content;
  align-items: center;
  column-gap: 60px;
  @media (max-width: 1024px) {
    position: relative;
    column-gap: 20px;
    bottom: 0;
  }
`

const ReportWrapper = styled.div`
  position: absolute;
  right: 80px;
  bottom: 40px;
  border-radius: 50%;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 24px rgba(109, 109, 120, 0.38);
  backdrop-filter: blur(20px);
  background: linear-gradient(0deg, #050616, #050616) padding-box,
    linear-gradient(
        90.65deg,
        rgba(255, 255, 255, 0.13) 0.82%,
        rgba(255, 255, 255, 0.17) 98.47%
      )
      border-box;
  border: 1px solid;

  border-image-source: linear-gradient(
    90.65deg,
    rgba(255, 255, 255, 0.13) 0.82%,
    rgba(255, 255, 255, 0.17) 98.47%
  );
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  svg {
    width: 20px;
  }
  @media (max-width: 1024px) {
    right: 20px;
    bottom: 20px;
  }
`
const ProfileInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 5px;
`

const ProfileInfoTitle = styled.div`
  font-size: 14px;
  font-weight: 300;
`
const ProfileInfoContent = styled.div`
  font-family: Mulish;
  font-size: 20px;
  font-weight: 500;
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
`
const FilterWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 30px 30px 0 30px;
  @media (max-width: 1024px) {
    flex-direction: column;
    row-gap: 20px;
  }
`
const Sort = styled.div`
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  box-shadow: 0px 7px 14px rgba(0, 0, 0, 0.1),
    inset 0px 14px 24px rgba(17, 20, 29, 0.4);
  backdrop-filter: blur(15px);
  /* Note: backdrop-filter has minimal browser support */
  border: 1px solid #ffffff;

  border-radius: 30px;
  padding: 15px 30px;
  font-family: Mulish;
  display: flex;
  align-items: center;
  column-gap: 20px;
  cursor: pointer;
  width: fit-content;
  svg {
    width: 15px;
  }
`
