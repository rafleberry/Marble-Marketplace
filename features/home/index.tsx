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

const Home = () => {
  const [nftcollections, setNftCollections] = useState<NftCollection[]>([])

  const fetchCollections = async () => {
    try {
      const data = await nftViewFunction({
        methodName: 'nft_get_series',
        args: {
          from_index: '0',
          limit: 3,
        },
      })
      return data
    } catch (error) {
      console.log('nft_get_series Error: ', error)
      return []
    }
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
            process.env.NEXT_PUBLIC_PINATA_URL + res_collection.featuredImage
          collection_info.banner_image =
            process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo
          collection_info.slug = res_collection.slug
          collection_info.creator = res_collection.owner ?? ''
          collection_info.cat_ids = categories[res_collection.category].name
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
                <Title>MARBLE DAO is for everyone</Title>
                <TextContent textAlign={isMobile() ? 'center' : 'left'}>
                  Join the millions of creators, collectors,
                  <br /> and curators who are on this journey with you.
                </TextContent>
                <StyledButton>Get Started</StyledButton>
              </Stack>
              <Stack>
                <img src="/images/doubleCardLogo.png" alt="cardlogo" />
              </Stack>
            </MarbleCardGrid>
          </Paper>
        </Flex>
        <Stack marginTop={isMobile() ? '50px' : '100px'} alignItems="center">
          <Stack spacing={isMobile() ? '10px' : 10}>
            <TextTitle>Our Amazing Partners</TextTitle>
            <StyledP>
              Lorem Ipsum is simply dummy text of the printing of and
              typesetting industry.
            </StyledP>
            <PartnerGrid>
              <PartnerPaper>
                <StyledImg src="/images/near.svg" alt="near" />
              </PartnerPaper>
              <PartnerPaper>
                <StyledImg src="/images/cosmos.svg" alt="cosmos" />
              </PartnerPaper>
              <PartnerPaper>
                <StyledImg src="/images/juno.svg" alt="juno" />
              </PartnerPaper>
              <PartnerPaper>
                <StyledImg src="/images/pinata.svg" alt="pinata" />
              </PartnerPaper>
            </PartnerGrid>
          </Stack>
        </Stack>
        <Stack marginTop="100px" alignItems="center">
          <Stack spacing={10}>
            <Stack margin="0 auto">
              <TextTitle>MARBLE DAO is a destination</TextTitle>
              <StyledP>
                We are laying the groundwork for MarbleDao - the next generation
                of the internet full of limitless possibilities. In MarbleDao,
                your creativity is valued and your digital objects belong to
                you.
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
                    Creative building blocks for MarbleDao
                  </TextContent>
                </Stack>
              </StyledPaper>
              <StyledPaper>
                <Round>
                  <StyledImg src="/images/collectIcon.svg" alt="collect" />
                </Round>
                <Stack spacing={isMobile() ? '5px' : 5}>
                  <h1>Collect</h1>
                  <TextContent>
                    Unearth NFTs for your growing collection
                  </TextContent>
                </Stack>
              </StyledPaper>
              <StyledPaper>
                <Round>
                  <StyledImg src="/images/sellIcon.svg" alt="sell" />
                </Round>
                <Stack spacing={isMobile() ? '5px' : 5}>
                  <h1>Sell</h1>
                  <TextContent>
                    Your NFTs will shine in our marketplace.
                  </TextContent>
                </Stack>
              </StyledPaper>
            </DestinationGrid>
          </Stack>
        </Stack>
      </ChakraProvider>
    </Container>
  )
}
const DestinationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 60px;
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
    width: 100vw;
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
  width: 700px;
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

const Paper = styled.div<{ width?: string }>`
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.06);
  border: rgba(255, 255, 255, 0.2);
  box-shadow: 0px 7px 14px 0px #0000001a;
  backdrop-filter: blur(30px);
  padding: 40px 80px;
  width: ${({ width }) => width || '100%'};
  display: flex;
  align-items: center;
  @media (max-width: 1450px) {
    padding: 20px;
  }
`
const PartnerPaper = styled(Paper)`
  @media (max-width: 1450px) {
    width: 120px;
    height: 50px;
  }
`
const StyledPaper = styled.div`
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.06);
  border: rgba(255, 255, 255, 0.2);
  box-shadow: 0px 7px 14px 0px #0000001a;
  backdrop-filter: blur(30px);
  justify-content: center;
  padding: 40px 80px;
  flex-direction: column;
  h1 {
    font-size: 36px;
    font-weight: 700;
    text-align: center;
  }
  @media (max-width: 1450px) {
    padding: 40px 40px;
  }
  @media (max-width: 480px) {
    display: flex;
    flex-direction: row;
    padding: 10px;
    align-items: center;
    column-gap: 10px;
    justify-content: start;
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
    font-size: 40px;
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
  font-weight: 700;
  @media (max-width: 1550px) {
    font-size: 40px;
  }
  @media (max-width: 480px) {
    font-size: 30px;
    text-align: center;
  }
`
export default Home
