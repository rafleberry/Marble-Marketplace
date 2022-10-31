import {
  ChakraProvider,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react'
import { AppLayout } from 'components/Layout/AppLayout'
import { Explore } from 'features/nft/market/explore'
import NFTExplorer from 'features/nft/market/nftexplore'
import Profiles from 'features/nft/market/profile/allprofiles'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { nftViewFunction } from 'util/near'
import { fetchAllProfileCounts } from 'hooks/useProfile'
// import { getTotalPools } from 'util/pool'

export default function Explores() {
  const [nfts, setNfts] = useState('')
  const [collections, setCollections] = useState('')
  const [profiles, setProfiles] = useState<any>({})
  async function fetchAllNFTCounts() {
    const allNFTs = await nftViewFunction({
      methodName: 'nft_total_supply',
      args: {},
    })
    return allNFTs
  }
  async function fetchAllCollectionCounts() {
    const allCollections = await nftViewFunction({
      methodName: 'nft_get_series_supply',
      args: {},
    })
    return allCollections
  }

  useEffect(() => {
    // fetchCollections()
    ;(async () => {
      const [totalNFTs, totalCollections, totalProfiles] = await Promise.all([
        fetchAllNFTCounts(),
        fetchAllCollectionCounts(),
        fetchAllProfileCounts(),
      ])
      setNfts(totalNFTs)
      setCollections(totalCollections)
      setProfiles(totalProfiles)
    })()
  }, [])
  return (
    <ChakraProvider>
      <AppLayout fullWidth={true} hasBanner={true}>
        <Tabs overflow="auto" padding='20px 49px' className='browse-tab'>
          <StyledTabList>
            <StyledTab>{`NFTs(${nfts})`}</StyledTab>
            <StyledTab>{`Collections(${collections})`}</StyledTab>
            <StyledTab>{`Profiles(${profiles.profiles})`}</StyledTab>
          </StyledTabList>
          <TabPanels>
            <TabPanel style={{padding:"0px",paddingTop:'40px'}}>
              <NFTExplorer />
            </TabPanel>
            <TabPanel style={{padding:"0px"}}>
              <Explore />
            </TabPanel>
            <TabPanel style={{padding:"0px",paddingTop:"10px"}}>
              <Profiles profileCounts={profiles} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </AppLayout>
    </ChakraProvider>
  )
}
const StyledTabList = styled(TabList)`
  width: fit-content;
  border-bottom: 3px solid;
  border-color: rgba(255, 255, 255, 0.1) !important;
  font-weight: 400;
  font-size:22px;
  .css-1ltezim[aria-selected='true'] {
    border-color: #ffffff;
    font-weight: 400;
    color: white;
    font-size:22px;
  }
`

const StyledTab = styled(Tab)`
  font-size: 22px !important;
  font-weight: 300;
  // padding: 20px 70px 20px 0px;
  padding: 20px 0 !important;
  margin: 0 100px 0 0;
`
