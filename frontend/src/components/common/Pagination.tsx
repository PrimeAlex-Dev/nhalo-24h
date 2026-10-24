import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

export interface PaginationProps {
  /** Trang hiện tại (chỉ số 0-indexed, bắt đầu từ 0) */
  currentPage: number;
  /** Tổng số trang */
  totalPages: number;
  /** Tổng số bản ghi (tùy chọn) */
  totalElements?: number;
  /** Số bản ghi trên mỗi trang (tùy chọn) */
  pageSize?: number;
  /** Callback khi người dùng chuyển trang (trả về page 0-indexed) */
  onPageChange: (page: number) => void;
  /** Tên danh từ hiển thị (ví dụ: "đơn hàng", "công việc", "tài khoản") */
  itemName?: string;
  /** Có hiển thị dòng text tóm tắt số lượng không (mặc định: true) */
  showItemCount?: boolean;
  /** Vô hiệu hóa thao tác bấm (ví dụ khi đang tải dữ liệu) */
  disabled?: boolean;
  /** Custom class bổ sung */
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  itemName = 'mục',
  showItemCount = true,
  disabled = false,
  className = '',
}) => {
  // Tính toán dải số trang hiển thị (kèm dấu ...)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 0 || (totalElements !== undefined && totalElements === 0)) {
      return [];
    }

    const pages: (number | '...')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0); // Trang đầu tiên

      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 2) {
        start = 1;
        end = 3;
      } else if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
        end = totalPages - 2;
      }

      if (start > 1) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages - 1); // Trang cuối cùng
    }

    return pages;
  }, [currentPage, totalPages, totalElements]);

  // Nếu không có bản ghi nào hoặc totalPages <= 0 -> Ẩn thanh phân trang
  if (totalPages <= 0 || (totalElements !== undefined && totalElements === 0)) {
    return null;
  }

  // Tính toán khoảng bản ghi đang hiển thị: ví dụ 1 - 15
  const fromRecord = pageSize !== undefined ? currentPage * pageSize + 1 : undefined;
  const toRecord =
    pageSize !== undefined && totalElements !== undefined
      ? Math.min((currentPage + 1) * pageSize, totalElements)
      : undefined;

  return (
    <nav 
      className={`app-pagination-container ${className}`} 
      aria-label="Phân trang dữ liệu"
    >
      {/* Thông tin số lượng bản ghi */}
      {showItemCount && totalElements !== undefined && (
        <div className="pagination-summary">
          {fromRecord !== undefined && toRecord !== undefined ? (
            <span>
              Đang xem <strong>{fromRecord}</strong> - <strong>{toRecord}</strong> trên tổng số{' '}
              <strong>{totalElements.toLocaleString('vi-VN')}</strong> {itemName}
            </span>
          ) : (
            <span>
              Tổng số <strong>{totalElements.toLocaleString('vi-VN')}</strong> {itemName}
            </span>
          )}
          <span className="pagination-page-tag">
            (Trang {currentPage + 1} / {totalPages})
          </span>
        </div>
      )}

      {/* Cụm nút chuyển trang */}
      <div className="pagination-button-group">
        {/* Nút lùi về trang trước */}
        <button
          type="button"
          className="btn-pagination-nav prev-btn"
          disabled={disabled || currentPage <= 0}
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          aria-label="Trang trước"
          title="Trang trước"
        >
          <ChevronLeft size={16} />
          <span className="btn-pagination-nav-text">Trước</span>
        </button>

        {/* Danh sách các số trang */}
        <div className="pagination-numbers-row">
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                  &hellip;
                </span>
              );
            }
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                className={`btn-pagination-number ${isActive ? 'active' : ''}`}
                disabled={disabled || isActive}
                onClick={() => onPageChange(p)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Trang ${p + 1}`}
              >
                {p + 1}
              </button>
            );
          })}
        </div>

        {/* Nút tiến tới trang sau */}
        <button
          type="button"
          className="btn-pagination-nav next-btn"
          disabled={disabled || currentPage >= totalPages - 1}
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          aria-label="Trang sau"
          title="Trang sau"
        >
          <span className="btn-pagination-nav-text">Sau</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};
