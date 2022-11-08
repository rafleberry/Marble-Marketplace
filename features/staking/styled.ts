import styled from 'styled-components'
import { GradientBackground } from 'styles/styles'

export const Container = styled.div`
  max-width: 70vw;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`
export const Header = styled.div`
  font-size: 50px;
  font-weight: 700;
`
export const StakingCardWrapper = styled(GradientBackground)`
  padding: 40px;
  width: 100%;
  border-radius: 20px;
  display: grid;
  grid-template-columns: 1fr 3fr;
`
export const CollectionCardWrapper = styled.div``

export const CollectionContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 30px;
  h1 {
    font-size: 42px;
    font-weight: 700;
  }
`

export const StakingInfoContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 20px;
`
export const InfoContent = styled.div`
  h2 {
    font-size: 28px;
    font-weight: 700;
  }
  h3 {
    font-size: 26px;
    font-weight: 700;
    opacity: 0.5;
  }
`

export const ButtonWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 50px;
`

export const OwnedNftsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  width: 100%;
  margin-top: 50px;
`
export const CountDownWrapper = styled.div`
  display: flex;
  align-items: center;
  font-size: 28px;
  font-weight: 700;
`
