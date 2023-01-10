import styled from 'styled-components'
import { NavigationSidebar } from './NavigationSidebar'
import { useDispatch, useSelector } from 'react-redux'
import { FooterBar } from './FooterBar'
import { MobileFooterBar } from './MobileFooter'
import { useEffect, useState } from 'react'
import { isMobile, isPC } from 'util/device'
import TagManager from 'react-gtm-module'
import { Button } from 'components/Button'
import { FetchCoinInfo } from 'hooks/useTokenBalance'
import useExplorer from 'hooks/useExplorer'
import Checkbox from 'components/Checkbox'
import { GradientBackground, SecondGradientBackground } from 'styles/styles'
import { StyledCloseIcon } from 'components/Dialog'
import { setAgreed } from 'hooks/useProfile'
import {
  ChakraProvider,
  Modal,
  ModalOverlay,
  ModalContent,
  Stack,
  HStack,
  ModalCloseButton,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
const tagManagerArgs = {
  gtmId: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
}

export const AppLayout = ({
  footerBar = isPC() ? <FooterBar /> : <MobileFooterBar />,
  children,
  fullWidth,
  hasBanner = false,
}) => {
  const [openNav, setOpenNav] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [error, setError] = useState(false)
  const [original, setOriginal] = useState(false)
  const [creative, setCreative] = useState(false)
  const profile = useSelector((state: any) => state.profileData.profile_status)
  console.log('profile: ', profile)
  FetchCoinInfo()
  useExplorer()

  useEffect(() => {
    TagManager.initialize(tagManagerArgs)
  }, [])
  useEffect(() => {
    if (profile._id && !profile.isAgreed) onOpen()
  }, [profile])
  const handleAgree = async () => {
    if (!original || !creative) {
      setError(true)
      return
    }
    const result = await setAgreed(profile._id)
    if (result) onClose()
  }
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
        <ChakraProvider>
          <Modal
            blockScrollOnMount={false}
            isOpen={isOpen}
            onClose={onClose}
            isCentered
          >
            <ModalOverlay
              backdropFilter="blur(14px)"
              bg="rgba(0, 0, 0, 0.34)"
            />
            <ModalContainer>
              <StyledCloseIcon onClick={onClose} offset={20} size="40px" />
              {/* <ModalCloseButton /> */}
              <Card>
                <Stack spacing="70px">
                  <Stack>
                    <HStack>
                      <Checkbox
                        checked={original}
                        onChange={(e) => {
                          setOriginal(!original)
                        }}
                      />
                      <h3>Be Original</h3>
                    </HStack>
                    <Text>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry.{' '}
                    </Text>
                  </Stack>
                  <Stack>
                    <HStack>
                      <Checkbox
                        checked={creative}
                        onChange={(e) => setCreative(!creative)}
                      />
                      <h3>Be Creative And Have Fun</h3>
                    </HStack>
                    <Text>
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry.{' '}
                    </Text>
                  </Stack>
                </Stack>
                <Divider />
                <Stack spacing="50px" maxWidth="600px" margin="0 auto">
                  <Stack>
                    <p
                      style={{
                        visibility: error ? 'visible' : 'hidden',
                        color: 'red',
                      }}
                    >
                      Please select all conditions
                    </p>
                    <Button
                      className="btn-buy btn-default"
                      css={{
                        background: '$white',
                        color: '$black',
                        stroke: '$black',
                        width: '100%',
                      }}
                      variant="primary"
                      size="large"
                      onClick={handleAgree}
                    >
                      I Agree
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </ModalContainer>
          </Modal>
        </ChakraProvider>
      </StyledWrapper>
    </Container>
  )
}

const Divider = styled.div`
  height: 0px;
  border: 1px solid #363b4e;
  margin: 60px 0;
`
const Card = styled.div<{ fullWidth: boolean }>`
  /* &:before {
    opacity: 0.3;
    border-radius: 30px;
  } */
  padding: 40px;
  max-width: 1000px;
  width: 100%;
  @media (max-width: 1024px) {
    padding: 20px;
  }
`

const Container = styled.div`
  background: rgb(0, 0, 0);
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
  padding: ${({ hasBanner }) => (hasBanner ? '0' : '40px')};
  ${({ hasBanner }) => !hasBanner && 'max-width: 1700px'};
  width: 100%;
  @media (max-width: 1600px) {
  }
  @media (max-width: 1024px) {
    padding: 10px;
  }
  @media (max-width: 650px) {
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
const ModalContainer = styled(ModalContent)`
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border-radius: 30px !important;
  padding: 30px;
  color: white !important;
  max-width: 900px !important;
  @media (max-width: 1000px) {
    max-width: 90vw !important;
    padding: 5px;
  }
`
