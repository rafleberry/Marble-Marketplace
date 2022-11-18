import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import {
  ChakraProvider,
  Flex,
  HStack,
  Text,
  Stack,
  Grid,
  LinkBox,
} from '@chakra-ui/react'
import { RoundedIconComponent } from 'components/RoundedIcon'
import { NftCard } from 'components/NFT/nft-card'
import {
  nftViewFunction,
  marketplaceViewFunction,
  NFT_CONTRACT_NAME,
  TOKEN_DENOMS,
} from 'util/near'
import { isClientMobie, isMobile } from 'util/device'
import {
  formatChakraDateToTimestamp,
  formatTimestampToDate,
  convertMicroDenomToDenom,
  formatNearToYocto,
  formatHera,
} from 'util/conversion'
import { SecondGradientBackground } from 'styles/styles'

const CollectionInfo = ({ info }) => {
  const [nfts, setNfts] = useState([])
  const fetchTokensInfo = useCallback(async () => {
    let collectionNFTs = []
    let nftInfo = []
    try {
      if (!info.id) return []
      nftInfo = await nftViewFunction({
        methodName: 'nft_tokens_by_series',
        args: {
          token_series_id: info.id,
          from_index: '0',
          limit: 10,
        },
      })
    } catch (error) {
      console.log('getNFTs error: ', error)
      return []
    }
    await Promise.all(
      nftInfo.map(async (element) => {
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
        let ipfs_collection = await fetch(
          process.env.NEXT_PUBLIC_PINATA_URL + element.metadata.extra
        )
        let res_nft = await ipfs_nft.json()
        let res_collection = await ipfs_collection.json()
        res_nft['tokenId'] = element.token_id.split(':')[1]
        res_nft['title'] = res_collection.name
        res_nft['owner'] = element.owner_id
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
  }, [info.id])
  useEffect(() => {
    ;(async () => {
      const tokensInfo = await fetchTokensInfo()
      setNfts(tokensInfo)
    })()
  }, [info])
  return (
    <Container>
      <ChakraProvider>
        <Flex justifyContent="space-between" padding="20px 20px 0 30px">
          <HStack>
            <ImgDiv>
              <Image src={info.image} alt="collection" />
            </ImgDiv>
            <Stack>
              <Title>{info.name}</Title>
              <SubTitle>{info.cat_ids}</SubTitle>
            </Stack>
          </HStack>
          {!isMobile() && (
            <CreatorInfo>
              <RoundedIconComponent
                size={isClientMobie ? '36px' : '48px'}
                address={info.creator}
                font={isClientMobie ? '15px' : '20px'}
              />
            </CreatorInfo>
          )}
        </Flex>
        <Grid
          templateColumns="repeat(3, 1fr)"
          gap={6}
          overflowX="auto"
          overflowY="unset"
          padding="30px"
        >
          {nfts.slice(0, 3).map((nftInfo, index) => (
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
        </Grid>
        {isMobile() && (
          <CreatorInfo>
            <RoundedIconComponent
              size={isClientMobie ? '36px' : '48px'}
              address={info.creator}
              font={isClientMobie ? '15px' : '20px'}
            />
          </CreatorInfo>
        )}
      </ChakraProvider>
    </Container>
  )
}

const Container = styled(SecondGradientBackground)`
  &:before {
    opacity: 0.3;
    border-radius: 30px;
  }
  backdrop-filter: blur(30px);
  margin: 10px 0;
  width: 100%;
`
const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
`
const ImgDiv = styled.div`
  width: 70px;
  padding-bottom: 70px;
  display: block;
  position: relative;
  border-radius: 50%;
  @media (max-width: 1550px) {
    padding-bottom: 55px;
    width: 55px;
  }
  @media (max-width: 480px) {
    width: 50px;
    padding-bottom: 50px;
  }
`
const CreatorInfo = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: rgba(255, 255, 255, 0.2);
  border-radius: 60px;
  display: flex;
  padding: 10px;
  align-items: center;
  height: 70px;
  width: 210px;
  justify-content: space-around;
  @media (max-width: 1550px) {
    height: 50px;
    width: 160px;
  }
  @media (max-width: 1550px) {
    height: 50px;
    width: fit-content;
    margin-top: 20px;
  }
`
const Title = styled.div`
  font-size: 30px;
  font-weight: 700;
  @media (max-width: 1550px) {
    font-size: 23px;
  }
  @media (max-width: 480px) {
    font-size: 16px;
  }
`
const SubTitle = styled.div`
  font-size: 20px;
  font-weight: 600;
  @media (max-width: 1550px) {
    font-size: 15px;
  }
`
export default CollectionInfo
