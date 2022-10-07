import styled from 'styled-components'

export const NFTName = styled.div`
  font-size: 60px;
  font-weight: 700;
  @media (max-width: 1550px) {
    font-size: 45px;
  }
  @media (max-width: 480px) {
    font-size: 24px;
  }
`
export const MoreTitle = styled.div`
  font-size: 46px;
  font-weight: 700;
  @media (max-width: 1550px) {
    font-size: 30px;
  }
  @media (max-width: 480px) {
    font-size: 24px;
  }
`

export const RoyaltyContainer = styled.div`
  display: flex;
  align-items: center;
  column-gap: 20px;
  @media (max-width: 480px) {
    justify-content: space-between;
  }
`
