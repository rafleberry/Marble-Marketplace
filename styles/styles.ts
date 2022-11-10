import styled from 'styled-components'

export const GradientBackground = styled.div`
  background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.01) 0%,
        rgba(255, 255, 255, 0.01) 100%
      )
      padding-box,
    linear-gradient(
        106.01deg,
        rgba(255, 255, 255, 0.2) 1.02%,
        rgba(255, 255, 255, 0) 100%
      )
      border-box;
  border: 1px solid;

  border-image: linear-gradient(
    90.65deg,
    #ffffff 0.82%,
    rgba(0, 0, 0, 0) 98.47%
  );
  &:before {
    opacity: 0.7;
  }
  box-shadow: 0px 7px 14px 0px #0000001a, inset 0px 14px 24px 0px #11141d66;
`
