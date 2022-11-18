import styled from 'styled-components'
import { NavigationSidebar } from './NavigationSidebar'
import { FooterBar } from './FooterBar'
import { MobileFooterBar } from './MobileFooter'
import { useEffect, useState } from 'react'
import { isMobile } from 'util/device'
import TagManager from 'react-gtm-module'
import { FetchCoinInfo } from 'hooks/useTokenBalance'
import useExplorer from 'hooks/useExplorer'
const tagManagerArgs = {
  gtmId: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
}

export const AppLayout = ({
  footerBar = isMobile() ? <MobileFooterBar /> : <FooterBar />,
  children,
  fullWidth,
  hasBanner = false,
}) => {
  const [openNav, setOpenNav] = useState(false)
  FetchCoinInfo()
  useExplorer()

  useEffect(() => {
    TagManager.initialize(tagManagerArgs)
  }, [])
  return (
    <Container>
      <StyledWrapper>
        <NavigationSidebar openNav={openNav} setOpenNav={setOpenNav} />

        <StyledContainer hasBanner={hasBanner}>
          <main>{children}</main>
        </StyledContainer>
        <StyledFooter>
          <StyledFooterWrapper>{footerBar}</StyledFooterWrapper>
        </StyledFooter>
      </StyledWrapper>
    </Container>
  )
}

const Container = styled.div`
  background-image: url('/images/background.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  justify-content: center;
  display: flex;
`
const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  color: white;
  width: 100%;
  align-items: center;
`

const StyledContainer = styled.div<{ hasBanner: boolean }>`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: ${({ hasBanner }) => (hasBanner ? '0' : '130px')};
  padding: ${({ hasBanner }) => (hasBanner ? '0' : '40px')};
  ${({ hasBanner }) => !hasBanner && 'max-width: 1700px'};
  width: 100%;
  @media (max-width: 1600px) {
    margin-top: 60px;
  }
  @media (max-width: 480px) {
    padding: 10px;
    margin-top: 0;
  }
`

const StyledFooter = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 0 0 0;
  width: 100%;
`

const StyledFooterWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
