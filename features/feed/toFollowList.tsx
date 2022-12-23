import { getUnfollowList } from 'hooks/useProfile'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  default_image,
  PINATA_SECONDARY_IMAGE_SIZE,
  PUBLIC_PINATA_URL,
} from 'util/constants'
import { controlFollow } from 'hooks/useProfile'
import { getReducedAddress } from 'util/conversion'
import {
  CardWrapper,
  FollowButton,
  StyledImage,
  UnFollowContentWrapper,
  UnfollowerAvatarWrapper,
  UnfollowerWrapper,
} from './styled'

const ToFollowList = ({ account, setRCount, rCount }) => {
  const [toFollowList, setToFollowList] = useState<any>([])
  useEffect(() => {
    ;(async () => {
      if (!account) return

      const _toFollowList = await getUnfollowList({
        user: account,
        skip: 0,
        limit: 5,
      })
      setToFollowList(_toFollowList)
    })()
  }, [account, rCount])
  const handleFollow = async (to) => {
    try {
      await controlFollow({
        from: account,
        to: to,
      })
      setRCount(rCount + 1)
    } catch (err) {
      return
    }
  }
  return (
    <CardWrapper>
      <UnFollowContentWrapper>
        <h1>Suggestions for you</h1>
        {toFollowList.map((_toFollow, index) => (
          <UnfollowerWrapper key={index}>
            <Link href={`/profile/${_toFollow.id}`} passHref>
              <UnfollowerAvatarWrapper>
                <StyledImage
                  src={
                    _toFollow.avatar
                      ? PUBLIC_PINATA_URL +
                        _toFollow.avatar +
                        PINATA_SECONDARY_IMAGE_SIZE
                      : default_image + PINATA_SECONDARY_IMAGE_SIZE
                  }
                  alt="img"
                />
                <p>{_toFollow.name || getReducedAddress(_toFollow.id)}</p>
              </UnfollowerAvatarWrapper>
            </Link>
            <FollowButton
              onClick={() => {
                handleFollow(_toFollow.id)
              }}
            >
              Follow
            </FollowButton>
          </UnfollowerWrapper>
        ))}
      </UnFollowContentWrapper>
    </CardWrapper>
  )
}

export default ToFollowList
