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
  grid-template-columns: repeat(8, 1fr);
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
export const Logo = styled.img<{ size: string; border: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border: ${({ border }) => border};
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

  margin-bottom: 30px;
`

export const NFTInfoWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-block: 20px;
  div {
    display: flex;
  }
`
export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: 5px;
  margin-right: 20px;
`

export const InputWrapper = styled(GradientBackground)`
  display: flex;
  align-items: center;
  padding: 20px;
  &:before {
    opacity: 0.2;
    border-radius: 20px;
  }
`
export const VerticalDivider = styled.div`
  height: 35px;
  margin-inline: 20px;
  background: #d0dff3;
  width: 1px;
`
export const StyledInput = styled.input`
  font-family: Mulish;
`

export const TextArea = styled.textarea`
  font-family: Mulish;
  background: transparent;
  width: 100%;
  border: none;
  overflow: auto;
  outline: none;

  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
`

export const ButtonWrapper = styled.div`
  margin: 20px 0;
`
