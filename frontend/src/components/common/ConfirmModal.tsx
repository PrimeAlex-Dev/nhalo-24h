import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, Info, Loader2, X } from 'lucide-react';
import './ConfirmModal.css';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  icon?: 'trash' | 'alert' | 'info' | 'warning';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  confirmVariant = 'danger',
  icon = 'trash',
  loading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (icon) {
      case 'alert':
      case 'warning':
        return <AlertTriangle size={24} className="confirm-modal-icon warning" />;
      case 'info':
        return <Info size={24} className="confirm-modal-icon info" />;
      case 'trash':
      default:
        return <Trash2 size={24} className="confirm-modal-icon danger" />;
    }
  };

  return (
    <div className="confirm-modal-backdrop" onClick={!loading ? onClose : undefined}>
      <div 
        className="confirm-modal-sheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <button
          type="button"
          className="confirm-modal-close-btn"
          onClick={onClose}
          disabled={loading}
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        <div className="confirm-modal-header">
          <div className={`confirm-modal-icon-badge ${icon || 'trash'}`}>
            {renderIcon()}
          </div>
          <h3 id="confirm-modal-title" className="confirm-modal-title">{title}</h3>
        </div>

        <p className="confirm-modal-message">{message}</p>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-btn cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirm-modal-btn confirm ${confirmVariant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
