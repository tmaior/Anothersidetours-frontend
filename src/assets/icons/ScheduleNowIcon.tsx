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
      d="M4.743 1.55a5.898 5.898 0 1 1 4.515 10.9 5.898 5.898 0 0 1-4.515-10.9"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.815 4.368v3.05l2.397 1.46"
    />
  </svg>
)
export default SvgComponent