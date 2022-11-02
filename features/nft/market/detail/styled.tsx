import styled from 'styled-components'

export const NFTName = styled.div`
  font-size: 60px;
  font-weight: 600;
  line-height: 75px;
  margin-top:20px;
  @media (max-width: 1550px) {
    font-size: 45px;
  }
  @media (max-width: 480px) {
    font-size: 24px;
    line-height:50px;
  }
`
export const MoreTitle = styled.div`
  font-size: 46px;
  font-weight: 500;
  // margin-top: -53px;
  margin:30px 0 35px;
  @media (max-width: 1550px) {
    font-size: 30px;
  }
  @media (max-width: 768px) {
    font-size: 24px;
    margin:30px 0 20px;

  }
  @media (max-width: 576px) {
    margin:30px 10px 20px;
  }
`

export const RoyaltyContainer = styled.div`
  display: flex;
  align-items: center;
  column-gap: 20px;
  @media (max-width: 480px) {
    // justify-content: space-between;
  }
`
