import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={14}
    fill="none"
    className="w-3.5 h-3.5 relative -top-0.25 inline-block"
    {...props}
  >
    <g
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      clipPath="url(#a)"
    >
      <path d="M5.14 12.48h-.006c3.017 1.217 6.455-.248 7.68-3.272A5.9 5.9 0 0 0 9.55 1.53a5.915 5.915 0 0 0-7.695 7.687" />
      <path d="m8.987 8.272.003-2.903-2.903.003m2.902-.002-5.81 5.81" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h14v14H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default SvgComponent
