import { ChakraProvider } from '@chakra-ui/react'
import { AppLayout } from 'components/Layout/AppLayout'
import { Explore } from 'features/nft/market/explore'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
// import { getTotalPools } from 'util/pool'

export default function Explores() {
  const { countInfo } = useSelector((state: any) => state.uiData)

  return (
    <ChakraProvider>
      <AppLayout fullWidth={true}>
        <StyledTabList>
          <Link href="/explore" passHref>
            <StyledTab>{`NFTs(${countInfo.nft})`}</StyledTab>
          </Link>
          <Link href="/explore/collections" passHref>
            <StyledTab
              isActive={true}
            >{`Collections(${countInfo.collection})`}</StyledTab>
          </Link>
          <Link href="/explore/profiles" passHref>
            <StyledTab>{`Profiles(${countInfo.profile.profiles})`}</StyledTab>
          </Link>
        </StyledTabList>

        <Explore />
      </AppLayout>
    </ChakraProvider>
  )
}
const StyledTabList = styled.div`
  width: fit-content;
  border-bottom: 2px solid;
  border-color: rgba(255, 255, 255, 0.1) !important;
  font-weight: 400;
  display: flex;
`

const StyledTab = styled.div<{ isActive: boolean }>`
  font-size: 22px;
  font-weight: 400;
  padding: 20px;
  margin: 0 20px;
  cursor: pointer;
  ${({ isActive }) => isActive && 'border-bottom: 2px solid'};
`