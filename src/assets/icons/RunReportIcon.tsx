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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 11.667A4.667 4.667 0 1 0 2.333 7v.359"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m.583 5.833 1.75 1.75 1.75-1.75"
    />
  </svg>
)
export default SvgComponent
