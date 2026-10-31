import React from 'react';

export interface DongIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
}

/**
 * Icon biểu tượng đơn vị tiền tệ Việt Nam Đồng (Đ / ₫).
 * Thiết kế vector chuẩn phong cách Lucide icons (stroke, viewBox 24x24, currentColor).
 */
export function DongIcon({
  size = 20,
  strokeWidth = 2,
  className = '',
  ...props
}: DongIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Vòng tròn đồng xu chuẩn phong cách Lucide Circle Icons */}
      <circle cx="12" cy="12" r="9" />
      {/* Thân chữ D vector */}
      <path d="M10 7.5v9h2.5a4.5 4.5 0 0 0 0-9H10" />
      {/* Nét gạch ngang tạo chữ Đ (Việt Nam Đồng) */}
      <path d="M7.5 12h5" />
    </svg>
  );
}

export default DongIcon;
