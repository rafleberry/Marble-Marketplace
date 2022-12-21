import useNft from 'hooks/useNft'
import { getFollowers, getProfileInfo } from 'hooks/useProfile'
import { Comment, Heart, Retweet } from 'icons'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  default_image,
  PINATA_PRIMARY_IMAGE_SIZE,
  PINATA_SECONDARY_IMAGE_SIZE,
  PUBLIC_PINATA_URL,
} from 'util/constants'
import { getReducedAddress } from 'util/conversion'
import { nftViewFunction } from 'util/near'
import { getCurrentWallet } from 'util/sender-wallet'
import MyProfileCard from './myProfileCard'
import {
  AvatarItemWrapper,
  AvatarWrapper,
  CardHeader,
  CardWrapper,
  Container,
  ContentWrapper,
  IconGroup,
  IconWrapper,
  InputWrapper,
  Logo,
  NFTImage,
  NFTImgDiv,
  NFTInfoWrapper,
  StyledImage,
  StyledInput,
  UserAvatarWrapper,
  VerticalDivider,
  Wrapper,
  LoadMoreButtonWrapper,
  LoadMoreButton,
  CommentWrapper,
} from './styled'
import ToFollowList from './toFollowList'

const commentsPerPage = 5

const Feed = () => {
  const {
    getCommentsCnt,
    addComment,
    getFavoritesCnt,
    addFavorite,
    getComments,
  } = useNft()
  const { asPath } = useRouter()
  const token_id = asPath.split('feed/')[1].split('?')[0]
  const [page, setPage] = useState(0)
  const [profileInfo, setProfileInfo] = useState<any>({})
  const [comment, setComment] = useState('')
  const [commentsList, setCommentsList] = useState<any>([])
  const [nftInfo, setNftInfo] = useState<any>({})
  const [rCount, setRCount] = useState(0)
  const [userNft, setUserNft] = useState<any>({})
  const [hasMore, setHasMore] = useState(true)
  const wallet = getCurrentWallet()
  const profile = useSelector((state: any) => state.profileData.profile_status)
  const fetchOwnedNFTs = useCallback(async () => {
    try {
      const selectedNft = await nftViewFunction({
        methodName: 'nft_token',
        args: {
          token_id: token_id,
        },
      })
      setUserNft(selectedNft)
      const _profileInfo = await getProfileInfo(selectedNft.owner_id)
      setProfileInfo(_profileInfo)
    } catch (err) {
      console.log('fetchOwnedNFTs Error: ', err)
    }
  }, [token_id])
  const getCommentsList = async (_page) => {
    const _comments = await getComments(token_id, _page, commentsPerPage)
    if (_comments.length < commentsPerPage) {
      setHasMore(false)
    } else setHasMore(true)
    setPage(page + 1)
    setCommentsList(_comments)
  }
  const fetchComments = useCallback(async () => {
    if (token_id === '[id]') return
    const [_commentCnt, _favorites] = await Promise.all([
      getCommentsCnt(userNft.token_id),
      getFavoritesCnt(userNft.token_id, wallet?.accountId),
      getCommentsList(0),
    ])
    setNftInfo({ comments: _commentCnt, favorites: _favorites })
  }, [userNft])

  useEffect(() => {
    // if (!user._id) return
    if (!wallet?.accountId || token_id === '[id]') return
    ;(async () => {
      await fetchOwnedNFTs()
    })()
  }, [token_id, wallet?.accountId, token_id])
  useEffect(() => {
    ;(async () => {
      await fetchComments()
    })()
  }, [userNft, wallet?.accountId, token_id])
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
      setComment('')
    }
  }
  const getMoreComments = async () => {
    const _comments = await getComments(token_id, page, commentsPerPage)
    if (_comments.length < commentsPerPage) setHasMore(false)
    setPage(page + 1)
    setCommentsList(commentsList.concat(_comments))
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
      <Container>
        <div>
          <MyProfileCard rCount={rCount} account={wallet?.accountId} />
        </div>
        <ContentWrapper>
          <CardWrapper>
            <CardHeader>
              <UserAvatarWrapper>
                <StyledImage
                  src={
                    profileInfo.avatar
                      ? PUBLIC_PINATA_URL +
                        profileInfo.avatar +
                        PINATA_SECONDARY_IMAGE_SIZE
                      : default_image + PINATA_SECONDARY_IMAGE_SIZE
                  }
                  alt="img"
                />
                <p>{profileInfo.name || getReducedAddress(profileInfo.id)}</p>
              </UserAvatarWrapper>
              <IconWrapper
                onClick={async () => {
                  await handleSaveFavorites(userNft.token_id)
                }}
              >
                <Heart
                  fill={nftInfo?.favorites?.isFavoriteOne ? 'white' : 'none'}
                  width="30px"
                  height="30px"
                />
              </IconWrapper>
            </CardHeader>
            <NFTImgDiv>
              <NFTImage
                src={
                  PUBLIC_PINATA_URL +
                  userNft.metadata?.media +
                  PINATA_PRIMARY_IMAGE_SIZE
                }
                alt="NFT Image"
              />
            </NFTImgDiv>
            <NFTInfoWrapper>
              <IconGroup>
                <IconWrapper>
                  <Heart fill="white" width="30px" height="30px" />
                  {nftInfo?.favorites?.cnt}
                </IconWrapper>
                <Link href={`/feed/${userNft.token_id}`} passHref>
                  <IconWrapper>
                    <Comment width="30px" height="30px" />
                    {nftInfo?.comments}
                  </IconWrapper>
                </Link>
              </IconGroup>
            </NFTInfoWrapper>
            {commentsList.map((_comment, index) => (
              <InputWrapper key={index}>
                <Logo
                  src={
                    _comment.avatar
                      ? PUBLIC_PINATA_URL +
                        _comment.avatar +
                        PINATA_SECONDARY_IMAGE_SIZE
                      : default_image + PINATA_SECONDARY_IMAGE_SIZE
                  }
                  size="40px"
                  alt="logo"
                  border="2px solid rgba(255,255,255,0.2)"
                />
                <VerticalDivider />
                <CommentWrapper>
                  <span>{_comment.name || getReducedAddress(_comment.id)}</span>
                  <p>{_comment.content}</p>
                </CommentWrapper>
              </InputWrapper>
            ))}
            {hasMore && (
              <LoadMoreButtonWrapper>
                <LoadMoreButton onClick={getMoreComments}>
                  Load more comments...
                </LoadMoreButton>
              </LoadMoreButtonWrapper>
            )}
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
                  setComment(e.target.value)
                }}
                value={comment}
              />
              <IconWrapper
                style={{ transform: 'rotate(45deg)', cursor: 'pointer' }}
                onClick={async () => {
                  await handleSaveComment(userNft.token_id, comment)
                }}
              >
                <Retweet width="30px" height="30px" />
              </IconWrapper>
            </InputWrapper>
          </CardWrapper>
        </ContentWrapper>
        <ToFollowList
          account={wallet?.accountId}
          setRCount={setRCount}
          rCount={rCount}
        />
      </Container>
    </Wrapper>
  )
}

export default Feed
