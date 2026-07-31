export function ZaloIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      height={size}
      viewBox="0 0 32 32"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.4 3.5h19.2A3.9 3.9 0 0 1 29.5 7.4v13.2a3.9 3.9 0 0 1-3.9 3.9H14.2l-6.8 4v-4H6.4a3.9 3.9 0 0 1-3.9-3.9V7.4a3.9 3.9 0 0 1 3.9-3.9Z"
        fill="currentColor"
      />
      <text
        fill="#fff"
        fontFamily="Arial, sans-serif"
        fontSize="9.6"
        fontWeight="700"
        textAnchor="middle"
        x="16"
        y="17.2"
      >
        Zalo
      </text>
    </svg>
  )
}
