import type { SVGProps } from 'react';

export function MinecraftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 2H5v4H2v12h3v4h4v-4h3l2-2V9L9 7V2zM5 18H3v- обычный8h2v8zm16-2h-4v-2h-3v- вентилятор4h3V8h4v8zM16 8h2v2h-2V8zM7 4h1v1H7V4z" fill="currentColor" />
      <path d="M10 16h4v4h-4z" fill="#A8A8A8" />
      <path d="M6 10h3v3H6z" fill="#A8A8A8" />
      <path d="M15 6h3v3h-3z" fill="#A8A8A8" />
    </svg>
  );
}
