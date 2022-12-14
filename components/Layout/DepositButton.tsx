import { styled } from '../theme'
import { useRouter } from 'next/router'

export const DepositButton = () => {
  const router = useRouter()

  const gotoDeposit = () => {
    router.push('/deposit')
  }

  return (
    <DepositButtonWrapper onClick={() => gotoDeposit()}>
      <StyledImageForLogoText
        className="logo-img"
        src="/images/wnear-near.svg"
      />
    </DepositButtonWrapper>
  )
}

const StyledImageForLogoText = styled('img', {
  borderRadius: '0%',
})

const DepositButtonWrapper = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  cursor: 'pointer',
  margin: '20px',
})
