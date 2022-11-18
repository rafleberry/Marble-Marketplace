import { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  ChakraProvider,
  Flex,
  Stack,
  HStack,
  Text,
  Grid,
  Button,
} from '@chakra-ui/react'
import { nftViewFunction } from 'util/near'
import { NftCollection } from 'services/nft'
import SelectedNFT from './components/SelectedNFT'
import Collection from './components/Collection'
import { isMobile } from 'util/device'
import { SecondGradientBackground } from 'styles/styles'

const collectionList = [27, 111, 112]

const Home = () => {
  const [nftcollections, setNftCollections] = useState<NftCollection[]>([])

  const fetchCollections = async () => {
    // const data = await nftViewFunction({
    //   methodName: 'nft_get_series',
    //   args: {
    //     from_index: '111',
    //     limit: 1,
    //   },
    // })
    const data = await Promise.all(
      collectionList.map(async (collection_id) => {
        try {
          const _collectionInfo = await nftViewFunction({
            methodName: 'nft_get_series_single',
            args: {
              token_series_id: collection_id.toString(),
            },
          })
          return _collectionInfo
        } catch (err) {
          return {}
        }
      })
    )
    return data
  }

  useEffect(() => {
    // fetchCollections()
    ;(async () => {
      let collections = []
      let res_categories = await fetch(process.env.NEXT_PUBLIC_CATEGORY_URL)
      let { categories } = await res_categories.json()
      const collectionList = await fetchCollections()
      for (let i = 0; i < collectionList.length; i++) {
        let res_collection: any = {}
        try {
          let ipfs_collection = await fetch(
            process.env.NEXT_PUBLIC_PINATA_URL +
              collectionList[i].metadata.reference
          )
          res_collection = await ipfs_collection.json()
          let collection_info: any = {}
          collection_info.id = collectionList[i].token_series_id
          collection_info.name = res_collection.name
          collection_info.description = res_collection.description
          collection_info.image =
            res_collection.featuredImage &&
            process.env.NEXT_PUBLIC_PINATA_URL + res_collection.featuredImage
          collection_info.banner_image =
            res_collection.logo &&
            process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo
          collection_info.slug = res_collection.slug
          collection_info.creator = collectionList[i].creator_id ?? ''
          collection_info.cat_ids = 'All'
          collections.push(collection_info)
        } catch (err) {
          console.log('err', err)
        }
      }
      setNftCollections(collections)
    })()
  }, [])
  return (
    <Container>
      <ChakraProvider>
        <SelectedNFT />
        <Collections>
          <TextTitle>Curated Collections</TextTitle>
          <Stack spacing="50px">
            {nftcollections.map((nftInfo, index) => (
              <Collection info={nftInfo} key={index} />
            ))}
          </Stack>
        </Collections>
        <Flex justifyContent="center">
          <Paper>
            <MarbleCardGrid>
              <Stack spacing={10}>
                <Title>
                  <span style={{ fontWeight: '500' }}>Discover</span> Phygital
                  NFTs
                </Title>
                <TextContent textAlign={isMobile() ? 'center' : 'left'}>
                  Here at Marble DAO, the future of NFTs is already here.
                  Collect Phygital NFTs which bring real Art to life in
                  spectacular 3D. Enjoy sculptures, paintings, and physical
                  artworks through Augmented Reality and Virtual Reality.
                </TextContent>
                <StyledButton>Get Started</StyledButton>
              </Stack>
              <Stack>
                <img src="/images/doubleCardLogo.png" alt="cardlogo" />
              </Stack>
            </MarbleCardGrid>
          </Paper>
        </Flex>
        <Stack marginTop="100px" alignItems="center">
          <Stack spacing={10}>
            <Stack margin="0 auto" alignItems="center" spacing="30px">
              <TextTitle>Marble - Where will you fit in?</TextTitle>
              <StyledP>
                Marble is an all-in-one platform hosting an NFT marketplace as
                well as a DeFi exchange with DAO Governance. NFT creators,
                collectors and DeFi fans make us a rock-solid community. Here
                your opinion counts. Your creativity is protected. And your
                digital objects belong to you alone.
              </StyledP>
            </Stack>
            <DestinationGrid>
              <StyledPaper>
                <Round>
                  <StyledImg src="/images/createIcon.svg" alt="create" />
                </Round>
                <Stack spacing={isMobile() ? '5px' : 5}>
                  <h1>Create</h1>
                  <TextContent>
                    Mint NFTs in stunning Augmented Reality (AR) and Virtual
                    Reality (VR).
                  </TextContent>
                </Stack>
              </StyledPaper>
              <StyledPaper>
                <Round>
                  <StyledImg src="/images/earnIcon.svg" alt="earn" />
                </Round>
                <Stack spacing={isMobile() ? '5px' : 5}>
                  <h1>Earn</h1>
                  <TextContent>
                    Accrue royalties on secondary NFT sales using our smart
                    contracts.
                  </TextContent>
                </Stack>
              </StyledPaper>
              <StyledPaper>
                <Round>
                  <StyledImg src="/images/followIcon.svg" alt="follow" />
                </Round>
                <Stack spacing={isMobile() ? '5px' : 5}>
                  <h1>Follow</h1>
                  <TextContent>
                    Keep an eye on your favourite NFT creators with Marble
                    SocialFi.
                  </TextContent>
                </Stack>
              </StyledPaper>
            </DestinationGrid>
          </Stack>
        </Stack>
        <Stack marginTop={isMobile() ? '50px' : '100px'} alignItems="center">
          <Stack spacing={isMobile() ? '10px' : 10} alignItems="center">
            <TextTitle>Marble is powered by</TextTitle>
            <StyledP>
              The Internet of Blockchains of Cosmos supports our journey from
              multi-chain to cross-chain. Our smart contracts are grounded in
              JUNO&apos;s versatile architecture and NEAR, one of the lean,
              powerful and fastest-growing blockchains. Then, as many top
              metaverses, Pinata offers a safe haven IPFS for NFT storage.
            </StyledP>
            <PartnerGrid>
              <PartnerPaper>
                <StyledImg src="/images/near.svg" alt="near" />
              </PartnerPaper>
              <PartnerPaper>
                <StyledImg src="/images/cosmos.svg" alt="cosmos" />
              </PartnerPaper>
              <PartnerPaper>
                <StyledImg
                  src="/images/juno.svg"
                  alt="juno"
                  style={{ width: '150px' }}
                />
              </PartnerPaper>
              <PartnerPaper>
                <StyledImg src="/images/pinata.svg" alt="pinata" />
              </PartnerPaper>
            </PartnerGrid>
          </Stack>
        </Stack>
      </ChakraProvider>
    </Container>
  )
}
const DestinationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 20px;
  @media (max-width: 480px) {
    display: flex;
    flex-direction: column;
    row-gap: 15px;
  }
`
const PartnerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  column-gap: 10px;
  overflow: auto;
  @media (max-width: 480px) {
    width: 90vw;
  }
`
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
  @media (max-width: 480px) {
    width: 100%;
    height: 56px;
    font-size: 16px;
  }
`
const MarbleCardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  @media (max-width: 1550px) {
    padding: 0 30px;
  }
  @media (max-width: 480px) {
    display: flex;
    flex-direction: column-reverse;
  }
`
const StyledImg = styled.img`
  margin: 0 auto;
`

const Container = styled.div`
  color: white;
`
const StyledP = styled.div`
  color: white;
  font-size: 20px;
  opacity: 0.5;
  font-family: Mulish;
  text-align: center;
  width: 1000px;
  @media (max-width: 1450px) {
    font-size: 18px;
  }
  @media (max-width: 480px) {
    font-size: 16px;
    padding: 0 20px;
    width: 100%;
  }
`
const Collections = styled.div`
  padding: 50px 0;
`

const Paper = styled(SecondGradientBackground)<{ width?: string }>`
  &:before {
    border-radius: 30px;
    opacity: 0.3;
  }
  padding: 40px 80px;
  width: ${({ width }) => width || '100%'};
  display: flex;
  align-items: center;
  @media (max-width: 1450px) {
    padding: 20px;
  }
`
const PartnerPaper = styled(Paper)`
  @media (max-width: 480px) {
    width: 120px;
    height: 50px;
  }
`
const StyledPaper = styled(SecondGradientBackground)`
  &:before {
    opacity: 0.5;
    border-radius: 30px;
  }
  justify-content: center;
  padding: 40px 60px;
  flex-direction: column;
  h1 {
    font-size: 36px;
    font-weight: 700;
    text-align: center;
  }
  @media (max-width: 1450px) {
    padding: 40px 30px;
  }
  @media (max-width: 480px) {
    display: grid;
    grid-template-columns: auto auto;
    padding: 10px;
    align-items: center;
    column-gap: 10px;
    h1 {
      font-size: 20px;
      font-weight: 700;
      text-align: left;
    }
    div {
      text-align: left;
    }
  }
`

const TextTitle = styled.div`
  font-size: 46px;
  font-weight: 700;
  text-align: center;
  @media (max-width: 1550px) {
    font-size: 35px;
    font-weight: 500;
  }
  @media (max-width: 480px) {
    font-size: 24px;
  }
`

const TextContent = styled.div<{ textAlign?: string }>`
  font-size: 26px;
  text-align: ${({ textAlign }) => (textAlign ? textAlign : 'center')};
  font-weight: 300;
  opacity: 0.5;
  font-family: Mulish;
  @media (max-width: 1440px) {
    font-size: 20px;
  }
  @media (max-width: 480px) {
    font-size: 16px;
  }
`

const Round = styled.div`
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  border-radius: 50%;
  margin: 50px auto;
  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
    margin: 0;
    img {
      width: 30px;
      height: 30px;
    }
  }
`
const Title = styled.div`
  font-size: 65px;
  font-weight: 400;
  @media (max-width: 1550px) {
    font-size: 40px;
  }
  @media (max-width: 480px) {
    font-size: 30px;
    text-align: center;
  }
`
export default Home
