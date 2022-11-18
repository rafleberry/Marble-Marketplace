import {
  ChakraProvider,
  Spinner,
  Stack,
  Tab,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { Button } from 'components/Button'
import { IconWrapper } from 'components/IconWrapper'
import { NftTable } from 'components/NFT'
import { Activity, Grid } from 'icons'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useDispatch, useSelector } from 'react-redux'
import { NftInfo } from 'services/nft'
import { State } from 'store/reducers'
import { NFT_COLUMN_COUNT } from 'store/types'
import styled from 'styled-components'
import { default_image, default_featured_image } from 'util/constants'
import {
  marketplaceViewFunction,
  nftViewFunction,
  NFT_CONTRACT_NAME,
  TOKEN_DENOMS,
} from 'util/near'
import { convertMicroDenomToDenom } from 'util/conversion'
import { getCollectionCategory } from 'hooks/useCollection'
import { getCurrentWallet } from 'util/sender-wallet'
import EditCollectionModal from './components/EditCollectionModal'
import { RoundedIconComponent } from 'components/RoundedIcon'
import { isMobile } from 'util/device'
import { SecondGradientBackground } from 'styles/styles'

export const CollectionTab = ({ index }) => {
  return (
    <TabWrapper>
      <Tab>
        <Button
          className={`hide tab-link ${index == 0 ? 'active' : ''}`}
          as="a"
          variant="ghost"
          iconLeft={<IconWrapper icon={<Grid />} />}
        >
          Items
        </Button>
      </Tab>
      <Tab>
        <Button
          className={`hide tab-link ${index == 1 ? 'active' : ''}`}
          as="a"
          variant="ghost"
          iconLeft={<IconWrapper icon={<Activity />} />}
        >
          Activity
        </Button>
      </Tab>
    </TabWrapper>
  )
}

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
  const [nfts, setNfts] = useState<NftInfo[]>([])
  const [hasMore, setHasMore] = useState(true)
  const dispatch = useDispatch()

  const filterData = useSelector((state: State) => state.filterData)
  const { filter_status } = filterData
  const [searchVal, setSearchVal] = useState('')
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
      console.log('tokensInfo: ', tokensInfo)
      setNfts(tokensInfo)
    })()
  }, [id])
  const getMoreNfts = async () => {
    console.log('getMoreNfts: ')
    const _tokensInfo = await fetchTokensInfo()
    setNfts([...nfts, ..._tokensInfo])
  }

  return (
    <ChakraProvider>
      <CollectionWrapper>
        <Banner>
          <BannerImage src={collectionInfo.featuredImage} alt="banner" />
          <Stack spacing={5}>
            <Logo src={collectionInfo.logo} alt="logo" />
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
            <ProfileLogo>
              <RoundedIconComponent
                size="44px"
                address={collectionInfo.creator}
              />
            </ProfileLogo>
          </Stack>
        </Banner>
        <Heading>
          <Stack>
            <Text fontSize={isMobile() ? '24px' : '36px'} fontWeight="700">
              Description
            </Text>
            <DescriptionArea>{collectionInfo.description}</DescriptionArea>
          </Stack>

          {wallet.accountId === collectionInfo.creator && (
            <Link href={`/nft/${id}/create`} passHref>
              <Button
                className="btn-buy btn-default"
                css={{
                  background: '$white',
                  color: '$black',
                  stroke: '$black',
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
        <NftList
          className={`${isCollapse ? 'collapse-close' : 'collapse-open'}`}
        >
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
            <NftTable data={nfts} id={id} type="buy" />
          </InfiniteScroll>
          {nfts.length === 0 && wallet.accountId === collectionInfo.creator && (
            <Stack
              spacing="50px"
              width="50%"
              alignItems="center"
              margin="0 auto"
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
  @media (max-width: 480px) {
    padding: 20px;
  }
`
const LogoTitle = styled.div`
  font-size: 96px;
  font-weight: 900;
  @media (max-width: 1550px) {
    font-size: 72px;
  }
  @media (max-width: 480px) {
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
  @media (max-width: 480px) {
    height: 560px;
    padding: 150px 20px 20px 20px;
  }
`
const BannerImage = styled.img`
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
const Logo = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 10px solid #ffffff21;
  @media (max-width: 1550px) {
    width: 135px;
    height: 135px;
  }
  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
    border: 3px solid #ffffff21;
  }
`

const SelectOption = styled.div<{ isActive: boolean }>`
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0px 7px 14px 0px #0000001a, 0px 14px 24px 0px #11141d66 inset;
  border-radius: 30px;
  display: flex;
  padding: 15px;
  min-width: 170px;
  justify-content: center;
  cursor: pointer;
  color: ${({ isActive }) => (isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)')};
`

const TabWrapper = styled.div``

const NftList = styled.div`
  padding: 40px;
  @media (max-width: 480px) {
    padding: 20px;
    width: 100%;
  }
`
const ProfileLogo = styled.div`
  padding: 10px;
  border-radius: 60px;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  width: fit-content;
  align-items: center;
`
