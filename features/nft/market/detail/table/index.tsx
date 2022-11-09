import React from 'react'
import styled from 'styled-components'
import { Stack, HStack, Text } from '@chakra-ui/react'
import { convertMicroDenomToDenom } from 'util/conversion'
import { RoundedIcon, RoundedBidIconComponent } from 'components/RoundedIcon'

const SimpleTable = ({ data, unit, paymentToken }) => {
  return (
    <Container>
      {data.map((element, index) => (
        <BidContainer key={index} isEnd={data.length - 1 === index}>
          <HStack style={{ display: 'flex'}} className="bid-content-col">
            <RoundedBidIconComponent
              size="56px"
              address={element.bidder_id}
              font="15px"
            />
          </HStack>
          <Text fontFamily="Mulish" fontSize="20px" fontWeight="500" className='payment-text'>
            {convertMicroDenomToDenom(element.price, unit).toFixed(2)}{' '}
            {paymentToken}
          </Text>
        </BidContainer>
      ))}
    </Container>
  )
}

const Container = styled.div`
  font-family: Mulish;
`
const BidContainer = styled.div<{ isEnd: boolean }>`
  display: flex;
  justify-content: space-between;
  ${({ isEnd }) => !isEnd && 'border-bottom: 1px solid #434960'};
  padding: 24px 0;
  align-items: center;
  &:nth-child(1) {
    padding-top:10px !important;
    padding-bottom:10px !important;
  }
  @media (max-width:576px) {
    width: 100% !important;
    // padding:0;
    // display:block !important;
  }
`
// const Text = styled.div`
//   @media (max-width:576px) {
//     text-align:right !important;
//   }
// `

export default SimpleTable
