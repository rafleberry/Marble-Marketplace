import styled, { css } from 'styled-components'
import Image from 'components/Img'
import { GradientBackground, SecondGradientBackground } from 'styles/styles'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
`

// export const Container = styled.div<{ firstHeight?: number }>`
export const Container = styled.div`
  display: grid;
  grid-template-columns: 25% 50% 25%;
  /* position: sticky;
  top: 108px;
  z-index: 100; */
  @media (max-width: 1300px) {
    display: flex;
    flex-direction: column;
  }
`

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  width: 100%;
  /* height: 200vh;
  overflow: auto;
  ::-webkit-scrollbar {
    width: 0px;
  } */
  /* height: 100%; */
  /* position: relative; */
`
export const AbsoluteContentWrappper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  overflow: auto;
  ::-webkit-scrollbar {
    width: 0px;
  }
`
// export const CardWrapper = styled.div`

export const CardWrapper = styled(SecondGradientBackground)`
  padding: 10px 20px;
  height: fit-content;
  margin-inline: 10px;

  h1 {
    font-size: 20px;
  }
  &:before {
    opacity: 0.2;
    border-radius: 30px;
  }
`

export const AvatarCardWrapper = styled(SecondGradientBackground)`
  padding: 10px 20px;
  height: fit-content;
  margin-inline: 10px;

  h1 {
    font-size: 20px;
  }
  background: rgb(32, 35, 49);
  border-radius: 30px;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 8px rgba(0, 0, 0, 0.2);
  &:before {
    opacity: 0.2;
    border-radius: 30px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
  }
`

export const AvatarWrapper = styled.div`
  display: flex;
  gap: 20px;
  overflow: hidden;
  overflow-x: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
`

export const AvatarItemWrapper = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  opacity: ${({ active }) => (active ? 1 : 0.5)};
  p {
    font-size: 10px;
    width: 60px;
    text-align: center;
  }
`

export const StyledImage = styled(Image)`
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
    overflow-wrap: anywhere;
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
export const Logo = styled(Image)<{ size: string; border: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border: ${({ border }) => border};
  border-radius: 50%;
`
export const ProfileInfoWrapper = styled.div`
  h1 {
    font-size: 20px;
    contain: inline-size;
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
  cursor: pointer;
`

export const InputWrapper = styled(GradientBackground)`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  margin-block: 10px;
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
export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
`
export const IconGroup = styled.div`
  display: flex;
  column-gap: 30px;
`
export const UnfollowerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  p {
    font-size: 14px;
    max-width: 80px;
  }
`
export const UnfollowerAvatarWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
`
export const FollowButton = styled.div`
  border: 1px solid #ffffff;
  border-radius: 60px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 40px;
  cursor: pointer;
`
export const UnFollowContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  padding: 20px 0px;
`

export const LoadMoreButtonWrapper = styled.div`
  padding: 20px 0;
  display: flex;
  justify-content: center;
`

export const LoadMoreButton = styled(GradientBackground)`
  cursor: pointer;
  text-align: center;
  padding: 20px;
  width: fit-content;
  font-family: Mulish;
  &:before {
    opacity: 0.2;
    border-radius: 20px;
  }
`

export const CommentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  span {
    font-size: 14px;
    opacity: 0.5;
  }
  p {
    font-family: Mulish;
  }
`

export const StickyDiv = styled.div<{ height?: number }>`
  position: sticky;
  ${({ height }) => `top: calc(108px + ${height}px)`};
  z-index: 10000;
  @media (max-width: 1550px) {
    ${({ height }) => `top: calc(80px + ${height}px)`};
  }
  @media (max-width: 1300px) {
    position: relative;
    top: 0;
  }
`
export const CommentInfoWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`
