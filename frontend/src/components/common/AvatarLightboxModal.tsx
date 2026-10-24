import React, { useEffect } from 'react';
import { X, BadgeCheck, ShieldCheck, User } from 'lucide-react';
import './AvatarLightboxModal.css';

export interface AvatarLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  name: string;
  role?: string;
  verified?: boolean;
  badgeText?: string;
}

export const AvatarLightboxModal: React.FC<AvatarLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  name,
  role = 'Thợ đối tác chuyên nghiệp',
  verified = true,
  badgeText = 'Nhận diện thợ',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="avatar-lightbox-backdrop" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      <div 
        className="avatar-lightbox-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="avatar-lightbox-topbar">
          <div className="avatar-lightbox-tag">
            <span className="lightbox-pulse-dot" />
            <span>{badgeText}</span>
          </div>

          <button
            type="button"
            className="avatar-lightbox-close-btn"
            onClick={onClose}
            aria-label="Đóng xem ảnh"
          >
            <X size={20} />
          </button>
        </div>

        {/* Big Avatar Image Frame */}
        <div className="avatar-lightbox-image-frame">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              className="avatar-lightbox-img" 
            />
          ) : (
            <div className="avatar-lightbox-fallback">
              <User size={80} strokeWidth={1.5} />
              <span>Chưa cập nhật ảnh đại diện</span>
            </div>
          )}
        </div>

        {/* Provider Details Footer */}
        <div className="avatar-lightbox-info">
          <div className="avatar-lightbox-name-row">
            <h3 id="lightbox-title" className="avatar-lightbox-name">{name}</h3>
            {verified && (
              <span className="avatar-lightbox-verified" title="Đối tác đã xác thực danh tính">
                <BadgeCheck size={20} />
              </span>
            )}
          </div>

          <p className="avatar-lightbox-role">{role}</p>

          <div className="avatar-lightbox-safety-notice">
            <ShieldCheck size={16} className="safety-icon" />
            <span>
              Quý khách vui lòng đối chiếu kỹ khuôn mặt thợ khi đến nhận việc để đảm bảo đúng người và an toàn tối đa.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
