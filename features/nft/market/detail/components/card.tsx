import React from 'react'
import styled from 'styled-components'

const Card = ({ title, children }) => {
  return (
    <Container className="bg-border-linear">
      <Title>{title}</Title>
      <Content>{children}</Content>
    </Container>
  )
}

const Container = styled.div`
  padding: 30px 36px;
  width: 100%;
  @media (max-width: 480px) {
    padding: 15px 20px;
    margin-top:20px !important;
  }
`
const Title = styled.div`
  font-size: 20px;
  font-weight: 500;
  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom:10px;
  }
`

const Content = styled.div`
  // padding: 10px 0 0 0;

`
export default Card
