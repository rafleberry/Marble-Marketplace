import styled from 'styled-components'
import { GradientBackground, SecondGradientBackground } from 'styles/styles'

export const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  column-gap: 20px;
`

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  width: 100%;
`

export const CardWrapper = styled(SecondGradientBackground)`
  padding: 10px 20px;

  &:before {
    opacity: 0.7;
    border-radius: 30px;
  }
`
export const AvatarWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  column-gap: 20px;
`

export const AvatarItemWrapper = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  opacity: ${({ active }) => (active ? 1 : 0.5)};
  p {
    font-size: 10px;
  }
`

export const StyledImage = styled.img`
  width: 56px;
  height: 56px;
  border: 1px solid white;
  border-radius: 16px;
`

export const UserAvatarWrapper = styled.div`
  display: flex;
  column-gap: 20px;
  align-items: center;
  padding: 10px 0 20px 0;
  p {
    font-size: 20px;
  }
`
export const NFTImgDiv = styled.div`
  width: 100%;
  padding-bottom: 100%;
  display: block;
  position: relative;
`
export const NFTImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 20px;
`
// export const CommentArea = styled.div`

// `

export const FollowWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
`
export const FollowItem = styled.div`
  * {
    text-align: center;
  }
  h1 {
    font-size: 20px;
  }
  p {
    font-size: 16px;
    font-family: Mulish;
    color: #a2adbc;
  }
`
export const Logo = styled.img`
  width: 130px;
  height: 130px;
  border: 4px solid white;
  border-radius: 50%;
`
export const ProfileInfoWrapper = styled.div`
  h1 {
    font-size: 20px;
  }
  * {
    text-align: center;
  }
  p {
    font-size: 16px;
    font-family: Mulish;
  }
`