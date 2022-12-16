import { useState, useEffect, useCallback } from 'react'
import { getCurrentWallet } from 'util/sender-wallet'
import { getFollowers } from 'hooks/useProfile'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  PINATA_SECONDARY_IMAGE_SIZE,
  PUBLIC_PINATA_URL,
  default_image,
  PINATA_PRIMARY_IMAGE_SIZE,
} from 'util/constants'
import {
  getReducedAddress,
  convertMicroDenomToDenom,
  emptyObject,
} from 'util/conversion'
import {
  marketplaceViewFunction,
  nftViewFunction,
  NFT_CONTRACT_NAME,
  TOKEN_DENOMS,
} from 'util/near'
import useNft from 'hooks/useNft'
import { Heart, Comment, Retweet, Bookmark } from 'icons'
import { Button } from 'styles/styles'
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
  NFTInfoWrapper,
  IconWrapper,
  InputWrapper,
  VerticalDivider,
  StyledInput,
  TextArea,
  ButtonWrapper,
} from './styled'

const Feed = () => {
  const { getCommentsCnt, addComment } = useNft()
  const [followers, setFollowers] = useState([])
  const [comment, setComment] = useState<any>({})
  const [commentCnt, setCommentCnt] = useState([])
  const [user, setUser] = useState<any>({})
  const [thought, setThought] = useState('')
  const [userNft, setUserNft] = useState<any>([])
  const wallet = getCurrentWallet()
  const profile = useSelector((state: any) => state.profileData.profile_status)
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
  }, [user])
  const fetchComments = useCallback(async () => {
    const comments = await Promise.all(
      userNft.map(async (_nft) => {
        const _commentCnt = await getCommentsCnt(_nft.token_id)
        return _commentCnt
      })
    )
    setCommentCnt(comments)
  }, [userNft])
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
  useEffect(() => {
    if (userNft.length === 0) return
    ;(async () => {
      await fetchComments()
    })()
  }, [userNft])
  const handleSaveComment = async (token_id, _comment) => {
    if (!wallet?.accountId) return
    if (!_comment) {
      toast.warning(`Please write your comment.`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }
    const result = await addComment(token_id, wallet?.accountId, _comment)
    if (result) {
      await fetchComments()
      setComment({ ...comment, [token_id]: '' })
    }
  }
  const handlePost = async () => {
    setThought('')
  }
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
            <NFTInfoWrapper>
              <div>
                <IconWrapper>
                  <Heart width="30px" height="30px" />0
                </IconWrapper>
                <IconWrapper>
                  <Comment width="30px" height="30px" />
                  {commentCnt[index]}
                </IconWrapper>
                <IconWrapper>
                  <Retweet width="30px" height="30px" />0
                </IconWrapper>
              </div>
              <div>
                <IconWrapper
                  style={{ cursor: 'pointer' }}
                  onClick={async () => {
                    await handleSaveComment(
                      element.token_id,
                      comment[element.token_id]
                    )
                  }}
                >
                  <Bookmark width="30px" height="30px" />
                </IconWrapper>
              </div>
            </NFTInfoWrapper>
            <InputWrapper>
              <Logo
                src={
                  profile.avatar
                    ? PUBLIC_PINATA_URL +
                      profile.avatar +
                      PINATA_SECONDARY_IMAGE_SIZE
                    : default_image + PINATA_SECONDARY_IMAGE_SIZE
                }
                size="40px"
                alt="logo"
                border="2px solid rgba(255,255,255,0.2)"
              />
              <VerticalDivider />
              <StyledInput
                placeholder="Write your comment"
                onChange={(e) => {
                  setComment({ ...comment, [element.token_id]: e.target.value })
                }}
                value={comment[element.token_id]}
              />
            </InputWrapper>
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
              size="130px"
              border="4px solid white"
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
          <InputWrapper>
            <TextArea
              value={thought}
              onChange={(e) => {
                setThought(e.target.value)
              }}
            />
          </InputWrapper>
          <ButtonWrapper>
            <Button onClick={handlePost}>Post</Button>
          </ButtonWrapper>
        </CardWrapper>
      </ContentWrapper>
    </Container>
  )
}

export default Feed
