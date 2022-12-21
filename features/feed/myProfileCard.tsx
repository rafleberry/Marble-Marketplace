import { getFollowInfo } from 'hooks/useProfile'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  default_image,
  PINATA_SECONDARY_IMAGE_SIZE,
  PUBLIC_PINATA_URL,
} from 'util/constants'
import {
  CardWrapper,
  ContentWrapper,
  FollowItem,
  FollowWrapper,
  Logo,
  ProfileInfoWrapper,
} from './styled'

const MyProfileCard = ({ account, rCount }) => {
  const profile = useSelector((state: any) => state.profileData.profile_status)
  const [user, setUser] = useState<any>({})
  useEffect(() => {
    ;(async () => {
      if (!account) return

      const _user = await getFollowInfo(account, account)

      // const _followers = await getFollowers({
      //   owner: wallet?.accountId,
      //   skip: 0,
      //   limit: 8,
      // })
      // if (_followers.length === 0) return
      setUser(_user)
    })()
  }, [account, rCount])
  return (
    <ContentWrapper>
      <CardWrapper>
        <FollowWrapper>
          <FollowItem>
            <h1>{user.followers}</h1>
            <p>Followers</p>
          </FollowItem>
          <Logo
            src={
              profile.avatar
                ? PUBLIC_PINATA_URL +
                  profile.avatar +
                  PINATA_SECONDARY_IMAGE_SIZE
                : default_image + PINATA_SECONDARY_IMAGE_SIZE
            }
            size="40%"
            border="4px solid white"
            alt="logo"
          />

          <FollowItem>
            <h1>{user.followings}</h1>
            <p>Followings</p>
          </FollowItem>
        </FollowWrapper>
        <ProfileInfoWrapper>
          <h1>{profile.name || profile.id}</h1>
          {profile.bio && <p>{profile.bio}</p>}
        </ProfileInfoWrapper>
        {/* <InputWrapper>
        <TextArea
          value={thought}
          onChange={(e) => {
            setThought(e.target.value)
          }}
          placeholder="Post your thoughts"
        />
      </InputWrapper>
      <ButtonWrapper>
        <Button onClick={handlePost}>Post</Button>
      </ButtonWrapper> */}
      </CardWrapper>
    </ContentWrapper>
  )
}

export default MyProfileCard
