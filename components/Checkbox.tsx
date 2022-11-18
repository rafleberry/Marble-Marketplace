import styled from 'styled-components'

const Checkbox = styled.input.attrs({ type: 'checkbox' })<{ size?: String }>`
  appearance: none;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  display: inline-block;
  height: ${({ size }) => size || '30px'};
  width: ${({ size }) => size || '30px'};
  vertical-align: middle;
  transition: background-color 0.2s ease-in-out;
  border-radius: 8px;
  background: white;
  &:after {
    content: '';
    position: absolute;
    border-bottom: 2px solid;
    border-left: 2px solid;
    border-color: transparent;
    top: 30%;
    left: 0;
    right: 0;
    width: 50%;
    height: 25%;
    margin: auto;
    transform: rotate(-50deg);
    transition: border-color 0.2s ease-in-out;
  }

  &:checked {
    &:after {
      border-color: black;
    }
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
`

export default Checkbox
