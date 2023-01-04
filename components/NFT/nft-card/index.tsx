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
import Image from 'components/Img'
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
  Auction: 'rgba(43, 80, 200, 0.8)',
  'Direct Sell': '#FFFFFF',
  Offer: 'rgba(43, 80, 200, 0.8)',
}

export function NftCard({ nft, id, type }): JSX.Element {
  const tokenInfo = useTokenInfoFromAddress(nft.ft_token_id)
  const [profile, setProfile] = useState<any>({})
  const [hover, setHover] = useState(false)
  useEffect(() => {
    ;(async () => {
      const profile_info = await getSimpleProfileInfo(nft.owner)
      setProfile(profile_info)
    })()
  }, [nft])
  const handleClick = (e) => {
    e.preventDefault()
  }
  return (
    <NftCardDiv
      color={backgroundColor[nft.saleType]}
      revertColor={nft.saleType === 'Direct Sell'}
      onMouseEnter={() => {
        setHover(true)
      }}
      onMouseLeave={() => {
        setHover(false)
      }}
    >
      <ChakraProvider>
        <Stack padding="15px 20px">
          <HStack justifyContent="space-between">
            <NFTName>{nft.name}</NFTName>
            <HStack>
              <IconWrapper
                revertColor={nft.saleType === 'Direct Sell'}
                onClick={handleClick}
              >
                VR
              </IconWrapper>
              <IconWrapper
                revertColor={nft.saleType === 'Direct Sell'}
                onClick={handleClick}
              >
                AR
              </IconWrapper>
            </HStack>
          </HStack>
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
        <ImgDiv className="nft-img-url">
          <StyledImage
            src={nft.image + PINATA_PRIMARY_IMAGE_SIZE}
            hover={hover}
            alt="NFT Image"
          />
          {hover && (
            <HoverDivContent>
              <HStack>
                <Logo
                  src={`${
                    process.env.NEXT_PUBLIC_PINATA_URL + profile.avatar
                  }${PINATA_SECONDARY_IMAGE_SIZE}`}
                  alt="logo"
                  size="34px"
                />
                <p>{profile.name || nft.owner}</p>
              </HStack>
              {nft.collection_logo && (
                <HStack>
                  <Logo
                    src={nft.collection_logo + PINATA_SECONDARY_IMAGE_SIZE}
                    alt="logo"
                    size="34px"
                  />
                  <p style={{ fontSize: '25px', fontWeight: 'bold' }}>
                    {nft.title}
                  </p>
                </HStack>
              )}
            </HoverDivContent>
          )}
        </ImgDiv>
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
  height: 100%;
  width: 100%;
  min-width: 320px;
  cursor: pointer;
  color: ${({ revertColor }) => (revertColor ? 'black' : 'white')};
  display: flex;
  flex-direction: column;
  justify-content: space-between;

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
const HoverDivContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 10;
  padding: 30px;
  color: white;
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
  background: black;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`
const StyledImage = styled(Image)<{ hover: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  opacity: ${({ hover }) => (hover ? '0.6' : '1')};
`
const Logo = styled(Image)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
`
const IconWrapper = styled.div<{ revertColor: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ revertColor }) =>
    revertColor ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'};
  font-family: Mulish;
  font-size: 14px;
  border-radius: 50%;
  width: 34px;
  height: 34px;
`
