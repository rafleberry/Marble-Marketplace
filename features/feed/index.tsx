import { useState, useEffect, useCallback } from 'react'
import { getCurrentWallet } from 'util/sender-wallet'
import { getFollowers } from 'hooks/useProfile'
import {
  PINATA_SECONDARY_IMAGE_SIZE,
  PUBLIC_PINATA_URL,
  default_image,
  PINATA_PRIMARY_IMAGE_SIZE,
} from 'util/constants'
import { getReducedAddress, convertMicroDenomToDenom } from 'util/conversion'
import {
  marketplaceViewFunction,
  nftViewFunction,
  NFT_CONTRACT_NAME,
  TOKEN_DENOMS,
} from 'util/near'
import {
  Container,
  ContentWrapper,
  CardWrapper,
  AvatarItemWrapper,
  StyledImage,
  AvatarWrapper,
  UserAvatarWrapper,
  NFTImage,
  NFTImgDiv,
  FollowWrapper,
  FollowItem,
  Logo,
  ProfileInfoWrapper,
} from './styled'

const Feed = () => {
  const [followers, setFollowers] = useState([])
  const [user, setUser] = useState<any>({})
  const [userNft, setUserNft] = useState<any>([])
  const wallet = getCurrentWallet()
  const fetchOwnedNFTs = useCallback(async () => {
    let ownedNFTs = []
    try {
      ownedNFTs = await nftViewFunction({
        methodName: 'nft_tokens_for_owner',
        args: {
          account_id: user.id,
        },
      })
    } catch (err) {
      console.log('fetchOwnedNFTs Error: ', err)
    }
    setUserNft(ownedNFTs)
  }, [user.id])
  useEffect(() => {
    ;(async () => {
      if (!wallet?.accountId) return
      const _followers = await getFollowers({ owner: wallet?.accountId })
      setFollowers(_followers)
      setUser(_followers[0])
    })()
  }, [wallet?.accountId])
  useEffect(() => {
    if (!user._id) return
    ;(async () => {
      await fetchOwnedNFTs()
    })()
  }, [user])
  return (
    <Container>
      <div />
      <ContentWrapper>
        <CardWrapper>
          <AvatarWrapper>
            {followers.map((follower) => (
              <AvatarItemWrapper
                active={follower._id === user._id}
                key={follower._id}
                onClick={() => {
                  console.log('follower: ', follower)
                  setUser(follower)
                }}
              >
                <StyledImage
                  src={
                    follower.avatar
                      ? PUBLIC_PINATA_URL +
                        follower.avatar +
                        PINATA_SECONDARY_IMAGE_SIZE
                      : default_image + PINATA_SECONDARY_IMAGE_SIZE
                  }
                  alt="img"
                />
                <p>{follower.name || getReducedAddress(follower.id)}</p>
              </AvatarItemWrapper>
            ))}
          </AvatarWrapper>
        </CardWrapper>
        {userNft.map((element, index) => (
          <CardWrapper key={index}>
            <UserAvatarWrapper>
              <StyledImage
                src={
                  user.avatar
                    ? PUBLIC_PINATA_URL +
                      user.avatar +
                      PINATA_SECONDARY_IMAGE_SIZE
                    : default_image + PINATA_SECONDARY_IMAGE_SIZE
                }
                alt="img"
              />
              <p>{user.name || getReducedAddress(user.id)}</p>
            </UserAvatarWrapper>
            <NFTImgDiv>
              <NFTImage
                src={
                  PUBLIC_PINATA_URL +
                  element.metadata.media +
                  PINATA_PRIMARY_IMAGE_SIZE
                }
                alt="NFT Image"
              />
            </NFTImgDiv>
          </CardWrapper>
        ))}
      </ContentWrapper>
      <ContentWrapper>
        <CardWrapper>
          <FollowWrapper>
            <FollowItem>
              <h1>{user.followers}</h1>
              <p>Followers</p>
            </FollowItem>
            <Logo
              src={
                user.avatar
                  ? PUBLIC_PINATA_URL +
                    user.avatar +
                    PINATA_SECONDARY_IMAGE_SIZE
                  : default_image + PINATA_SECONDARY_IMAGE_SIZE
              }
              alt="logo"
            />

            <FollowItem>
              <h1>{user.following}</h1>
              <p>Followings</p>
            </FollowItem>
          </FollowWrapper>
          <ProfileInfoWrapper>
            <h1>{user.name || user.id}</h1>
            {user.bio && <p>{user.bio}</p>}
          </ProfileInfoWrapper>
        </CardWrapper>
      </ContentWrapper>
    </Container>
  )
}

export default Feed
