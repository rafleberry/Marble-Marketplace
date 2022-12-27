import { useState } from 'react'
import { ChakraProvider, Stack, HStack, LinkBox } from '@chakra-ui/react'
import Link from 'next/link'
import { NftCollection } from 'services/nft'
import { RoundedIconComponent } from 'components/RoundedIcon'
import Image from 'components/Img'
import { isClientMobie } from 'util/device'
import styled from 'styled-components'
import { GradientBackground } from 'styles/styles'
import {
  PINATA_PRIMARY_IMAGE_SIZE,
  PINATA_SECONDARY_IMAGE_SIZE,
  default_featured_image,
} from 'util/constants'

export default function NftCollectionCard({ collection }): JSX.Element {
  const [hover, setHover] = useState(false)
  return (
    <CollectionDiv>
      <ImgDiv className="nft-img-div">
        <StyledImage
          src={collection.image + PINATA_PRIMARY_IMAGE_SIZE}
          alt="NFT Image"
          defaultImage={default_featured_image}
        />
        <HoverDiv>
          <Title>{collection.name}</Title>

          <HStack justifyContent="flex-end">
            <Logo
              src={collection.banner_image + PINATA_SECONDARY_IMAGE_SIZE}
              alt="image"
              defaultImage={default_featured_image}
            />
            <RoundedIconComponent
              size="0px"
              address={collection.creator}
              font={isClientMobie ? '15px' : '15px'}
            />
          </HStack>
        </HoverDiv>
      </ImgDiv>
    </CollectionDiv>
  )
}

const ImgDiv = styled.div`
  width: 100%;
  padding-bottom: 100%;
  display: block;
  position: relative;
`

const StyledImage = styled(Image)`
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
  opacity: 0.5;
`
const Logo = styled(Image)`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  /* @media (max-width: 1550px) {
    width: 50px;
    height: 50px;
  } */
`
const Title = styled.div`
  font-size: 24px;
  overflow-wrap: anywhere;
`
const CollectionDiv = styled(GradientBackground)`
  &:before {
    border-radius: 20px;
    opacity: 0.2;
  }
  height: 100%;
  cursor: pointer;
  @media (max-width: 1024px) {
    width: 320px;
  }
`
const HoverDiv = styled.div<{ hover: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  padding: 50px 30px 30px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
