import { SVGProps } from 'react'

export const Comment = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="34"
      height="33"
      viewBox="0 0 34 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12.3514 25.7478H11.6738C6.25325 25.7478 3.54297 24.3927 3.54297 17.617V10.8413C3.54297 5.42073 6.25325 2.71045 11.6738 2.71045H22.5149C27.9355 2.71045 30.6457 5.42073 30.6457 10.8413V17.617C30.6457 23.0375 27.9355 25.7478 22.5149 25.7478H21.8373C21.4172 25.7478 21.0107 25.9511 20.7532 26.2899L18.7205 29.0001C17.8261 30.1927 16.3626 30.1927 15.4682 29.0001L13.4355 26.2899C13.2187 25.9917 12.7173 25.7478 12.3514 25.7478Z"
        stroke="white"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.3164 10.8413H23.8678"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.3164 17.6165H18.4472"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
