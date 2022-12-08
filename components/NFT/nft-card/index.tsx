import {
  ChakraProvider,
  Stack,
  Text,
  Flex,
  HStack,
  Grid,
} from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import DateCountdown from 'components/DateCountdownMin'
import { useTokenInfoFromAddress } from 'hooks/useTokenInfo'
import { getSimpleProfileInfo } from 'hooks/useProfile'
import { getReducedAddress } from 'util/conversion'
import { RoundedIconComponent } from 'components/RoundedIcon'
import { GradientBackground } from 'styles/styles'
import {
  PINATA_PRIMARY_IMAGE_SIZE,
  PINATA_SECONDARY_IMAGE_SIZE,
} from 'util/constants'

const saleType = {
  NotSale: 'NOT ON SALE',
  Auction: 'START PRICE',
  'Direct Sell': 'BUY NOW',
  Offer: 'HIGHEST BID',
}

const backgroundColor = {
  NotSale: 'rgba(05, 06, 22, 0.2)',
  Auction: 'rgba(219, 115, 115, 0.5)',
  'Direct Sell': '#FFFFFF',
  Offer: 'rgba(219, 115, 115, 0.5)',
}

export function NftCard({ nft, id, type }): JSX.Element {
  const tokenInfo = useTokenInfoFromAddress(nft.ft_token_id)
  const [profile, setProfile] = useState<any>({})
  useEffect(() => {
    ;(async () => {
      const profile_info = await getSimpleProfileInfo(nft.owner)
      setProfile(profile_info)
    })()
  }, [nft])
  return (
    <NftCardDiv
      color={backgroundColor[nft.saleType]}
      revertColor={nft.saleType === 'Direct Sell'}
    >
      <ChakraProvider>
        <ImgDiv className="nft-img-url">
          <Image src={nft.image + PINATA_PRIMARY_IMAGE_SIZE} alt="NFT Image" />
        </ImgDiv>
        <Stack paddingTop="15px">
          <Grid gridTemplateColumns="3fr 2fr">
            <NFTName>{nft.name}</NFTName>
            <HStack>
              {/* <Logo
                src={
                  profile.avatar
                    ? `${
                        process.env.NEXT_PUBLIC_PINATA_URL + profile.avatar
                      }${PINATA_SECONDARY_IMAGE_SIZE}`
                    : '/default.png' + PINATA_SECONDARY_IMAGE_SIZE
                }
                alt="logo"
                size="34px"
              />
              <p>{profile.name || getReducedAddress(nft.owner)}</p> */}
              <RoundedIconComponent size="34px" address={nft.owner} />
            </HStack>
          </Grid>
          <Flex justifyContent="space-between" paddingTop="10px 0">
            <Stack>
              <Title>{saleType[nft.saleType]}</Title>
              {tokenInfo && (
                <Flex alignItems="center">
                  <Value>{nft.highest_bid || nft.price}</Value>
                  &nbsp;
                  <img
                    src={tokenInfo.logoURI + PINATA_SECONDARY_IMAGE_SIZE}
                    alt="token"
                    width="20px"
                    height="20px"
                    style={{ borderRadius: '50%' }}
                  />
                </Flex>
              )}
            </Stack>
            {(nft.saleType === 'Auction' || nft.saleType == 'Offer') && (
              <Stack>
                <Title>ENDS IN</Title>
                <Timetrack>
                  <DateCountdown
                    dateTo={Number(nft.ended_at) / 1000000 || Date.now()}
                    dateFrom={Number(nft.current_time) * 1000}
                    interval={0}
                    mostSignificantFigure="none"
                    numberOfFigures={3}
                  />
                </Timetrack>
              </Stack>
            )}
          </Flex>
        </Stack>
      </ChakraProvider>
    </NftCardDiv>
  )
}

const NftCardDiv = styled(GradientBackground)<{
  color: string
  revertColor: boolean
}>`
  &:before {
    border-radius: 20px;
    opacity: 0.2;
  }
  background: ${({ color }) => color};
  border-radius: 20px;
  padding: 30px;
  height: 100%;
  width: 100%;
  min-width: 320px;
  cursor: pointer;
  color: ${({ revertColor }) => (revertColor ? 'black' : 'white')};
  @media (max-width: 1550px) {
    padding: 20px;
  }
  p {
    font-size: 16px;
    font-family: Mulish;
    @media (max-width: 1550px) {
      font-size: 16px;
    }
  }
  @media (max-width: 800px) {
    width: 320px;
  }
`
const NFTName = styled.div`
  font-size: 20px;
`
const Title = styled.div`
  font-size: 14px;
  @media (max-width: 1550px) {
    font-size: 12px;
  }
`
const Value = styled.div`
  font-size: 18px;
  @media (max-width: 1550px) {
    font-size: 14px;
  }
`
const Timetrack = styled.div`
  .dcd-info {
    font-size: 14px;
    width: 100%;
    @media (max-width: 1550px) {
      font-size: 12px;
    }
  }
  .dcd-val {
    font-size: 18px;
    @media (max-width: 1550px) {
      font-size: 14px;
    }
  }
`

const ImgDiv = styled.div`
  width: 100%;
  padding-bottom: 100%;
  display: block;
  position: relative;
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
  border-radius: 20px;
`
const Logo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
`
