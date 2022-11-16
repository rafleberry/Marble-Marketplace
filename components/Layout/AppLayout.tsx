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
    <>
      <StyledWrapper>
        <NavigationSidebar openNav={openNav} setOpenNav={setOpenNav} />
        <div
          className={`main-section ${fullWidth ? 'fullWidth' : ''} ${
            hasBanner ? 'hasBanner' : ''
          }`}
        >
          <StyledContainer hasBanner={hasBanner}>
            <main>{children}</main>
          </StyledContainer>
        </div>
        <StyledFooter className="footer">
          <StyledFooterWrapper className="container">
            <StyledContainer>{footerBar}</StyledContainer>
          </StyledFooterWrapper>
        </StyledFooter>
      </StyledWrapper>
    </>
  )
}

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-image: url('/images/background.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  color: white;
`

const StyledContainer = styled.div<{ hasBanner: boolean }>`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const StyledFooter = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  margin-top: 100px;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 0 0 0;
`

const StyledFooterWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
