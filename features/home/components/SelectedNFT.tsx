import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { Stack, Text, HStack } from '@chakra-ui/react'
import {
  nftViewFunction,
  marketplaceViewFunction,
  NFT_CONTRACT_NAME,
} from 'util/near'
import { RoundedIconComponent } from 'components/RoundedIcon'
import { convertMicroDenomToDenom } from 'util/conversion'
import { useNearDollarValue } from 'hooks/useTokenDollarValue'
import { GradientBackground, SecondGradientBackground } from 'styles/styles'
import {
  PINATA_PRIMARY_IMAGE_SIZE,
  PINATA_SECONDARY_IMAGE_SIZE,
} from 'util/constants'

const SelectedNFT = () => {
  const [showData, setShowData] = useState<any>({})
  const nearValue = useNearDollarValue()
  const loadNft = useCallback(async () => {
    try {
      const [data, collection, marketData] = await Promise.all([
        nftViewFunction({
          methodName: 'nft_token',
          args: {
            token_id: `6:2`,
          },
        }),
        nftViewFunction({
          methodName: 'nft_get_series_single',
          args: {
            token_series_id: `6`,
          },
        }),
        marketplaceViewFunction({
          methodName: 'get_market_data',
          args: {
            nft_contract_id: NFT_CONTRACT_NAME,
            token_id: `6:2`,
          },
        }),
      ])
      setShowData({
        creator: collection.creator_id,
        collectionName: collection.metadata.title,
        collectionLogo:
          process.env.NEXT_PUBLIC_PINATA_URL +
          collection.metadata.media +
          PINATA_SECONDARY_IMAGE_SIZE,
        price:
          marketData.price && convertMicroDenomToDenom(marketData.price, 24),
        nftLogo:
          process.env.NEXT_PUBLIC_PINATA_URL +
          data.metadata.media +
          PINATA_PRIMARY_IMAGE_SIZE,
      })
    } catch (err) {
      console.log('NFT Contract Error: ', err)
    }
  }, [])
  useEffect(() => {
    loadNft()
  }, [])
  return (
    <IntroContainer>
      <IntroWrapper>
        <Title>
          {/* TILL DEATH DO US PART */}
          Till Death Do Us Part
        </Title>
        <HStack spacing={5}>
          <MiniInfoCard>
            <MiniInfoTitle>Created by</MiniInfoTitle>
            <RoundedIconComponent
              size="36px"
              address={showData.creator}
              font="16px"
            />
          </MiniInfoCard>
          <MiniInfoCard>
            <MiniInfoTitle>Collection</MiniInfoTitle>
            <Info>
              <Image src={showData.collectionLogo} alt="logo" />
              <Name>&nbsp;{showData.collectionName}</Name>
            </Info>
          </MiniInfoCard>
        </HStack>
        {showData.price && (
          <PriceArea>
            <p>Price</p>
            <HStack alignItems="center">
              <h1>{Number(showData.price.toFixed(2))} Near</h1>
              <h2>${Number(showData.price.toFixed(2)) * nearValue}</h2>
            </HStack>
          </PriceArea>
        )}
        <Stack>
          <Link href="/nft/6/2" passHref>
            <StyledButton>View Nft</StyledButton>
          </Link>
        </Stack>
      </IntroWrapper>
      <NFTPicture>
        <ImgDiv>
          <Img alt="logo" src={showData.nftLogo} />
        </ImgDiv>
      </NFTPicture>
    </IntroContainer>
  )
}
const StyledButton = styled.button`
  width: 326px;
  height: 68px;
  background: white;
  border-radius: 16px;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 8px rgba(0, 0, 0, 0.2);
  color: black;
  font-size: 18px;
  font-weight: bold;
  @media (max-width: 800px) {
    width: 100%;
  }
`
const IntroContainer = styled.div`
  display: flex;
  margin-top: 50px;
  justify-content: space-between;
  @media (max-width: 800px) {
    flex-direction: column-reverse;
    margin-top: 0px;
  }
`

const Title = styled.div`
  font-size: 50px;
  font-weight: 700;
  padding: 40px 0;
  @media (max-width: 1550px) {
    font-size: 40px;
  }
  @media (max-width: 800px) {
    font-size: 26px;
    text-align: center;
    margin-top: 20px;
    padding: 0 0 10px 0;
  }
`

const MiniInfoCard = styled(GradientBackground)`
  width: 40%;
  height: 110px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  &:before {
    border-radius: 20px;
    opacity: 0.2;
  }
  @media (max-width: 800px) {
    width: 100%;
  }
`

const MiniInfoTitle = styled.div`
  font-size: 20px;
  margin: 0 0 10px 0;
  @media (max-width: 1550px) {
    font-size: 16px;
  }
`
const Name = styled.div`
  font-size: 16px;
  font-weight: 600;
  font-family: Mulish;
`
const Image = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #ffffff;
`
const Info = styled.div`
  display: flex;
  align-items: center;
`
const NFTPicture = styled(SecondGradientBackground)`
  width: 40%;
  &:before {
    border-radius: 30px;
    opacity: 0.7;
  }
  padding: 37px;
  @media (max-width: 1550px) {
    padding: 30px;
  }
  @media (max-width: 800px) {
    width: 100%;
    padding: 20px;
  }
`
const ImgDiv = styled.div`
  width: 100%;
  height: 100%;
  padding-bottom: 100%;
  display: block;
  position: relative;
  border-radius: 20px;
`
const Img = styled.img`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 40px;
`
const IntroWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 40px;
  padding: 30px 0;
  @media (max-width: 1550px) {
    row-gap: 20px;
  }
`
const PriceArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  p {
    font-size: 20px;
  }
  h1 {
    font-size: 40px;
    font-family: Mulish;
    font-weight: 900;
  }
  h2 {
    font-size: 22px;
  }
  @media (max-width: 1550px) {
    p {
      font-size: 16px;
    }
    h1 {
      font-size: 30px;
      font-family: Mulish;
    }
    h2 {
      font-size: 16px;
    }
  }
  @media (max-width: 800px) {
    align-items: center;

    p {
      font-size: 14px;
    }
    h1 {
      font-size: 26px;
      font-family: Mulish;
    }
    h2 {
      font-size: 16px;
    }
  }
`

export default SelectedNFT
