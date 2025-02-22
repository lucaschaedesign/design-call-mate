import { LucideProps } from "lucide-react";

export function VideoIcon(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 8.13c0-.34-.45-.44-.65-.17l-2.79 3.85c-.12.17-.12.39 0 .56l2.79 3.85c.2.27.65.17.65-.17V8.13Z" />
      <rect width="14" height="14" x="2" y="5" rx="2" ry="2" />
    </svg>
  );
} 