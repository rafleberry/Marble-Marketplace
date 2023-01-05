import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { getCurrentWallet } from 'util/sender-wallet'
import Link from 'next/link'
import { getFollowers, getFollowInfo } from 'hooks/useProfile'
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
  getLongAddress,
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
import MyProfileCard from './myProfileCard'
import ToFollowList from './toFollowList'
import { isPC } from 'util/device'
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
  CardHeader,
  IconGroup,
  Wrapper,
  AbsoluteContentWrappper,
  StickyDiv,
  AvatarCardWrapper,
} from './styled'

const Feed = () => {
  const { getCommentsCnt, addComment, getFavoritesCnt, addFavorite } = useNft()
  const [followers, setFollowers] = useState([])
  const [comment, setComment] = useState<any>({})
  const [nftInfo, setNftInfo] = useState([])
  const [user, setUser] = useState<any>({})
  const [rCount, setRCount] = useState(0)
  const [thought, setThought] = useState('')
  const [userNft, setUserNft] = useState<any>([])
  const wallet = getCurrentWallet()
  const profile = useSelector((state: any) => state.profileData.profile_status)
  const [firstElement, setFirstElement] = useState<HTMLDivElement | null>(null)
  const firstHeight = useMemo(() => {
    return firstElement?.offsetHeight || 0
  }, [firstElement])
  const scrollRef = useHorizontalScroll()
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
    const _comments = await Promise.all(
      userNft.map(async (_nft) => {
        const [_commentCnt, _favorites] = await Promise.all([
          getCommentsCnt(_nft.token_id),
          getFavoritesCnt(_nft.token_id, wallet?.accountId),
        ])
        return { comments: _commentCnt, favorites: _favorites }
      })
    )
    setNftInfo(_comments)
  }, [userNft])
  useEffect(() => {
    ;(async () => {
      if (!wallet?.accountId) return
      const _followers = await getFollowers({
        owner: wallet?.accountId,
        skip: 0,
        limit: 100,
      })
      // const _followers = await getFollowers({
      //   owner: wallet?.accountId,
      //   skip: 0,
      //   limit: 8,
      // })
      if (_followers.length === 0) return
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
  // const handlePost = async () => {
  //   setThought('')
  // }
  const handleSaveFavorites = async (token_id) => {
    if (!wallet?.accountId) return
    const result = await addFavorite(token_id, wallet?.accountId)
    if (result) {
      await fetchComments()
    }
  }
  return (
    <Wrapper>
      <StickyDiv height={0}>
        <Container ref={(node) => setFirstElement(node)}>
          <div />
          <div>
            <AvatarCardWrapper>
              <AvatarWrapper ref={scrollRef}>
                {/* <AvatarWrapper> */}
                {followers.map((follower) => (
                  <AvatarItemWrapper
                    active={follower._id === user._id}
                    key={follower._id}
                    onClick={() => {
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
                    <p>{getReducedAddress(follower.name || follower.id)}</p>
                  </AvatarItemWrapper>
                ))}
              </AvatarWrapper>
              {followers.length === 0 && "You don't follow any users."}
            </AvatarCardWrapper>
          </div>
          <div />
        </Container>
      </StickyDiv>

      <Container>
        {/* <Container firstHeight={firstHeight}> */}
        {isPC() && (
          <div>
            <StickyDiv height={firstHeight}>
              <MyProfileCard rCount={rCount} account={wallet?.accountId} />
            </StickyDiv>
          </div>
        )}
        <ContentWrapper>
          {/* <AbsoluteContentWrappper> */}
          {userNft.map((element, index) => (
            <CardWrapper key={index}>
              <CardHeader>
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

                  <p>{getLongAddress(user.name || user.id)}</p>
                </UserAvatarWrapper>
                {/* <IconWrapper
                  onClick={async () => {
                    await handleSaveFavorites(element.token_id)
                  }}
                >
                  <Heart
                    fill={
                      nftInfo[index]?.favorites.isFavoriteOne ? 'white' : 'none'
                    }
                    width="30px"
                    height="30px"
                  />
                </IconWrapper> */}
              </CardHeader>

              <NFTImgDiv
                onDoubleClick={async () => {
                  await handleSaveFavorites(element.token_id)
                }}
              >
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
                <IconGroup>
                  <IconWrapper>
                    <Heart
                      fill={
                        nftInfo[index]?.favorites.isFavoriteOne
                          ? 'white'
                          : 'none'
                      }
                      width="30px"
                      height="30px"
                      onClick={async () => {
                        await handleSaveFavorites(element.token_id)
                      }}
                    />
                    {nftInfo[index]?.favorites?.cnt}
                  </IconWrapper>
                  <Link href={`/feed/${element.token_id}`} passHref>
                    <IconWrapper>
                      <Comment width="30px" height="30px" />
                      {nftInfo[index]?.comments}
                    </IconWrapper>
                  </Link>
                </IconGroup>
                {/* <IconWrapper
                onClick={async () => {
                  // await handleSaveComment(
                  //   element.token_id,
                  //   comment[element.token_id]
                  // )
                }}
              >
                <Bookmark width="30px" height="30px" />
              </IconWrapper> */}
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
                    setComment({
                      ...comment,
                      [element.token_id]: e.target.value,
                    })
                  }}
                  value={comment[element.token_id]}
                />
                <IconWrapper
                  style={{ transform: 'rotate(45deg)', cursor: 'pointer' }}
                  onClick={async () => {
                    await handleSaveComment(
                      element.token_id,
                      comment[element.token_id]
                    )
                  }}
                >
                  <Retweet width="30px" height="30px" />
                </IconWrapper>
              </InputWrapper>
            </CardWrapper>
          ))}
          {/* </AbsoluteContentWrappper> */}
        </ContentWrapper>
        {isPC() && (
          <div>
            <StickyDiv height={firstHeight}>
              <ToFollowList
                account={wallet?.accountId}
                setRCount={setRCount}
                rCount={rCount}
              />
            </StickyDiv>
          </div>
        )}
      </Container>
    </Wrapper>
  )
}
function useHorizontalScroll() {
  const elRef = useRef()
  useEffect(() => {
    const el: any = elRef.current
    if (el) {
      const onWheel = (e) => {
        if (e.deltaY == 0) return
        e.preventDefault()
        el.scrollTo({
          left: el.scrollLeft + e.deltaY,
          behavior: 'smooth',
        })
      }
      el.addEventListener('wheel', onWheel)
      return () => el.removeEventListener('wheel', onWheel)
    }
  }, [])
  return elRef
}

export default Feed
