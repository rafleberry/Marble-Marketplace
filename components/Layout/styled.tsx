import styled from 'styled-components'

export const StyledWrapper = styled.div`
  color: #ffffff;
  height: 108px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #363b4e;
  background: rgba(8, 12, 28, 0.6);
  @media (max-width: 1550px) {
    height: 80px;
  }
`
export const StyledListForLinks = styled.div`
  display: flex;
  row-gap: 10px;
  flex-direction: row;
  align-items: center;
`
export const StyledLink = styled.div`
  font-size: 16px;
  margin: 0 40px;
  display: flex;
  align-items: center;
  @media (max-width: 1550px) {
    margin: 0 10px;
  }
`

export const StyledDivForLogo = styled.div`
  align-items: center;
  margin-right: 40px;
  @media (max-width: 1550px) {
    margin: 0 00px;
    img {
      width: 200px;
    }
  }
`

export const CreateButton = styled.div`
  background: #ffffff;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 8px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  cursor: pointer;
  color: black;
  width: 130px;
  text-align: center;
  margin-left: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  height: 75%;
  @media (max-width: 1550px) {
    width: 100px;
    border-radius: 10px;
    font-size: 12px;
  }
  @media (max-width: 480px) {
    height: 36px;
    font-size: 12px;
    width: 80px;
    border-radius: 14px;
    margin-left: 0px;
  }
`
export const StyledMenuItem = styled.div`
  background: linear-gradient(0deg, rgba(5, 6, 22, 0.2), rgba(5, 6, 22, 0.2))
      padding-box,
    linear-gradient(
        90.65deg,
        rgba(255, 255, 255, 0.2) 0.82%,
        rgba(0, 0, 0, 0) 98.47%
      )
      border-box;
  border: 1px solid;

  border-image: linear-gradient(
    90.65deg,
    #ffffff 0.82%,
    rgba(0, 0, 0, 0) 98.47%
  );

  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 24px rgba(103, 103, 120, 0.2);
  padding: 20px 25px;
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 20px;
`
