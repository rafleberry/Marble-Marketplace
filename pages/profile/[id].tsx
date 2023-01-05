import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import {
  HStack,
  Stack,
  Text,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
} from '@chakra-ui/react'
import { AppLayout } from 'components/Layout/AppLayout'
import { Button } from 'components/Button'
import { MyCollectedNFTs } from 'features/nft/market/profile'
import CreatedNFTs from 'features/nft/market/profile/creatednfts'
import StakedNFTs from 'features/nft/market/profile/stakednfts'
import CreatedCollections from 'features/nft/market/profile/createdcollections'
import { Email, DiscordT } from 'icons'
import {
  getProfileInfo,
  setImage,
  setProfileInfo,
  controlFollow,
  getFollowInfo,
} from 'hooks/useProfile'
import { toast } from 'react-toastify'
import BannerImageUpload from 'components/BannerImageUpload'
import ProfilleLogoImageUpload from 'components/ProfileLogoImageUpload'
import EditProfileModal from 'features/profile/EditProfileModal'
import { getCurrentWallet } from 'util/sender-wallet'
import { getReducedAddress, getLongAddress } from 'util/conversion'
import { isMobile } from 'util/device'
import { GradientBackground } from 'styles/styles'

interface FollowInfoInterface {
  followers: number
  followings: number
  isFollowing: boolean
}

export default function Home() {
  const { asPath } = useRouter()
  const [profile, setProfile] = useState<any>({})
  const [followInfo, setFollowInfo] = useState<FollowInfoInterface>({
    followers: 0,
    followings: 0,
    isFollowing: false,
  })
  const id = asPath && asPath.split('/')[2].split('?')[0]
  const wallet = getCurrentWallet()
  useEffect(() => {
    ;(async () => {
      const _profile = await getProfileInfo(id)
      const _followInfo = await getFollowInfo(id, wallet.accountId)
      setFollowInfo(_followInfo)
      setProfile(_profile)
    })()
  }, [id, wallet.accountId])
  const handleSetHash = async (e) => {
    const newProfile = await setImage({ id, ...e })
    setProfile(newProfile)
  }
  const handleProfileEdit = async (e) => {
    try {
      const new_profile = await setProfileInfo({ ...profile, ...e, id })
      setProfile(new_profile)
      toast.success(`Success`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return true
    } catch (err) {
      toast.warning(`Failed. Please try again.`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return false
    }
  }
  const handleFollow = async () => {
    const new_followInfo = await controlFollow({
      from: wallet.accountId,
      to: id,
    })
    if (new_followInfo) {
      setFollowInfo(new_followInfo)
    } else {
      toast.warning(`Failed. Please try again.`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }
  return (
    <AppLayout fullWidth={true} hasBanner={true}>
      <Container>
        <Banner>
          <BannerImageUpload
            hash={profile.banner}
            setHash={handleSetHash}
            isActive={wallet.accountId === id}
          />
        </Banner>
        <ProfileContainer>
          <ProfileInfo>
            <LogoImage>
              <ProfilleLogoImageUpload
                isActive={wallet.accountId === id}
                hash={profile.avatar}
                setHash={handleSetHash}
              />
            </LogoImage>
            <Stack spacing="50px">
              <Stack spacing="50px">
                <h1>{getLongAddress(profile.name || id)}</h1>
                <HStack justifyContent="space-around">
                  <Stack>
                    <h1>{followInfo.followings}</h1>
                    <p>Following</p>
                  </Stack>
                  <VerticalDivider />
                  <Stack>
                    <h1>{followInfo.followers}</h1>
                    <p>Followers</p>
                  </Stack>
                </HStack>
                {wallet.accountId !== id && wallet.accountId && (
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
                    onClick={handleFollow}
                  >
                    {followInfo.isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </Stack>
              <div
                style={{
                  opacity: '0.5',
                  textAlign: 'center',
                  fontSize: isMobile() ? '16px' : '18px',
                  fontFamily: 'Mulish',
                }}
              >
                Not followed by anyone you follow
              </div>
              <Card>
                <h3>Bio</h3>
                <p>{profile.bio || 'Undefined'}</p>
              </Card>
              {(profile.mail || profile.discord) && (
                <Card>
                  <h3>Links</h3>
                  <Stack spacing="5px">
                    {profile.mail && (
                      <HStack>
                        <Email /> &nbsp; <p>{profile.mail}</p>
                      </HStack>
                    )}
                    {profile.discord && (
                      <HStack>
                        <DiscordT /> &nbsp; <p>{profile.discord}</p>
                      </HStack>
                    )}
                  </Stack>
                </Card>
              )}
            </Stack>
            {wallet.accountId === id && (
              <IconButtonWrapper>
                <EditProfileModal
                  profileInfo={profile}
                  onHandleSave={handleProfileEdit}
                />
              </IconButtonWrapper>
            )}
          </ProfileInfo>
          <ProfileNFTInfo>
            <Tabs>
              <StyledTabList>
                <StyledTab>{`Owned`}</StyledTab>
                <StyledTab>{`Created`}</StyledTab>
                <StyledTab>Staked</StyledTab>
                <StyledTab>Created Collections</StyledTab>
              </StyledTabList>
              <TabPanels>
                <TabPanel overflow="auto">
                  <MyCollectedNFTs id={id} />
                </TabPanel>
                <TabPanel overflow="auto">
                  <CreatedNFTs id={id} />
                </TabPanel>
                <TabPanel overflow="auto">
                  <StakedNFTs id={id} />
                </TabPanel>
                <TabPanel overflow="auto">
                  <CreatedCollections id={id} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ProfileNFTInfo>
        </ProfileContainer>
      </Container>
    </AppLayout>
  )
}

const Container = styled.div``
const Banner = styled.div`
  position: relative;
  height: 650px;
  width: 100%;
  display: block;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10;
  @media (max-width: 650px) {
    height: 216px;
  }
`
const LogoImage = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 7px solid #ffffff;
  position: absolute;
  top: -100px;
  left: calc(50% - 100px);
  z-index: 1000;
  @media (max-width: 1550px) {
    width: 150px;
    height: 150px;
    top: -75px;
    left: calc(50% - 75px);
  }
  @media (max-width: 650px) {
    width: 120px;
    height: 120px;
    top: -60px;
    left: calc(50% - 60px);
    border: 3px solid #ffffff;
  }
`
const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  padding: 0 50px;
  p {
    font-size: 18px;
    font-weight: 400;
    font-family: Mulish;
  }
  h3 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 5px;
  }
  h2 {
    font-size: 22px;
    font-weight: 600;
  }
  h1 {
    font-size: 40px;
    font-weight: 600;
    text-align: center;
  }
  @media (max-width: 1200px) {
    display: flex;
    flex-direction: column;
    padding: 0 20px;
    h1 {
      font-size: 24px;
    }
    p {
      font-size: 20px;
    }
    h3 {
      font-size: 16px;
    }
  }
`
const ProfileInfo = styled(GradientBackground)`
  padding: 120px 50px 50px 50px;

  &:before {
    border-radius: 0px 0px 20px 20px;
    opacity: 0.2;
  }
  height: fit-content;
  position: relative;
  @media (max-width: 1550px) {
    padding: 120px 30px 30px 30px;
  }
  @media (max-width: 650px) {
    padding: 80px 25px 25px 25px;
  }
  h1 {
    line-break: anywhere;
  }
`
const VerticalDivider = styled.div`
  border: 1px solid #5f5858;
  transform: rotate(90deg);
  width: 90px;
  height: 0px;
`
const Card = styled(GradientBackground)`
  backdrop-filter: blur(40px);
  &:before {
    border-radius: 20px;
    opacity: 0.2;
  }
  padding: 20px;
  @media (max-width: 650px) {
    p {
      font-size: 14px;
    }
  }
`
const ProfileNFTInfo = styled.div`
  padding: 10px 50px;
  @media (max-width: 1200px) {
    padding: 10px 10px;
  }
  @media (max-width: 650px) {
    padding: 10px 0px;
    width: 100%;
  }
`
const StyledTabList = styled(TabList)`
  border-bottom: 2px solid;
  border-color: rgba(255, 255, 255, 0.1) !important;
  font-weight: 400;
  display: flex;
  overflow: auto;
  width: fit-content;
  @media (max-width: 800px) {
    width: auto;
  }
  [aria-selected='true'] {
    border-color: #ffffff !important;
    border-bottom: 2px solid;
    font-weight: 600;
    color: white;
  }
`

const StyledTab = styled(Tab)`
  font-size: 22px;
  font-weight: 400;
  padding: 20px;
  margin: 0 20px;
  cursor: pointer;
  @media (max-width: 1550px) {
    font-size: 18px;
    margin: 0 15px;
    padding: 15px;
  }
`
const IconButtonWrapper = styled.div`
  position: absolute;
  right: 50px;
  top: 50px;
`
