import { SVGProps } from 'react'

export const Heart = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="31"
    height="27"
    viewBox="0 0 31 27"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M21.8706 0.583008C19.1948 0.583008 16.7999 1.88394 15.3068 3.87969C13.8137 1.88394 11.4188 0.583008 8.74297 0.583008C4.20449 0.583008 0.523438 4.27884 0.523438 8.84689C0.523438 10.6061 0.804321 12.2323 1.29217 13.7402C3.62794 21.1318 10.8274 25.5521 14.3902 26.7643C14.8928 26.9417 15.7207 26.9417 16.2233 26.7643C19.7861 25.5521 26.9856 21.1318 29.3214 13.7402C29.8092 12.2323 30.0901 10.6061 30.0901 8.84689C30.0901 4.27884 26.4091 0.583008 21.8706 0.583008Z"
      fill={props.fill || 'white'}
      stroke="white"
    />
  </svg>
)
