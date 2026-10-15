import { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Wrench, 
  Check, 
  Lock, 
  Unlock, 
  FileText,
  CheckCircle2
} from 'lucide-react';
import type { AdminUserItem } from '../types/admin';
import './UserDetailModal.css';

interface UserDetailModalProps {
  user: AdminUserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveUser?: (userId: string) => void;
  onToggleStatus?: (userId: string, newStatus: AdminUserItem['status']) => void;
}

export function UserDetailModal({
  user,
  isOpen,
  onClose,
  onApproveUser,
  onToggleStatus,
}: UserDetailModalProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const getRoleBadge = (role: AdminUserItem['role']) => {
    switch (role) {
      case 'admin':
        return <span className="user-role-badge role-admin">Quản trị viên</span>;
      case 'provider':
        return <span className="user-role-badge role-provider">Thợ kỹ thuật</span>;
      case 'customer':
        return <span className="user-role-badge role-customer">Khách hàng</span>;
    }
  };

  const getStatusBadge = (status: AdminUserItem['status']) => {
    switch (status) {
      case 'active':
        return <span className="user-status-pill status-active">Đang hoạt động</span>;
      case 'pending':
        return <span className="user-status-pill status-pending">Chờ duyệt hồ sơ</span>;
      case 'suspended':
        return <span className="user-status-pill status-suspended">Tạm khóa</span>;
    }
  };

  const handleApprove = () => {
    onApproveUser?.(user.id);
    setSuccessMsg('Đã phê duyệt hồ sơ thợ thành công! Tài khoản đã sẵn sàng nhận việc.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleToggleLock = () => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    onToggleStatus?.(user.id, nextStatus);
    setSuccessMsg(
      nextStatus === 'suspended' 
        ? 'Tài khoản đã được chuyển sang trạng thái Tạm khóa.' 
        : 'Đã mở khóa tài khoản thành công.'
    );
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="user-modal-backdrop" onClick={onClose}>
      <div 
        className="user-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-modal-title"
      >
        <div className="user-modal-header">
          <div className="user-modal-header-left">
            <h2 id="user-modal-title" className="user-modal-title">
              Hồ sơ người dùng
            </h2>
            <div className="user-badges-row">
              {getRoleBadge(user.role)}
              {getStatusBadge(user.status)}
            </div>
          </div>
          <button 
            type="button" 
            className="user-modal-close" 
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {successMsg && (
          <div className="user-success-notice">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        <div className="user-modal-body">
          {/* Top user profile card */}
          <div className="user-profile-hero">
            <img 
              src={user.avatarUrl} 
              alt={user.fullName} 
              className="user-hero-avatar" 
            />
            <div className="user-hero-info">
              <h3 className="user-hero-name">{user.fullName}</h3>
              <p className="user-hero-id">Mã ID: {user.id}</p>
              {user.profession && (
                <span className="user-hero-profession">
                  <Wrench size={14} /> {user.profession}
                </span>
              )}
            </div>
          </div>

          {/* Details list */}
          <div className="user-details-grid">
            <div className="user-field-card">
              <span className="user-field-label">
                <Mail size={14} /> Email
              </span>
              <span className="user-field-value">{user.email}</span>
            </div>

            <div className="user-field-card">
              <span className="user-field-label">
                <Phone size={14} /> Số điện thoại
              </span>
              <span className="user-field-value font-medium text-primary">
                {user.phoneNumber}
              </span>
            </div>

            <div className="user-field-card">
              <span className="user-field-label">
                <MapPin size={14} /> Khu vực hoạt động
              </span>
              <span className="user-field-value">{user.city}</span>
            </div>

            <div className="user-field-card">
              <span className="user-field-label">
                <Calendar size={14} /> Ngày tham gia
              </span>
              <span className="user-field-value">{user.joinedAt}</span>
            </div>

            <div className="user-field-card">
              <span className="user-field-label">
                <User size={14} /> Đơn hàng đã xử lý / đặt
              </span>
              <span className="user-field-value font-semibold">
                {user.totalOrders} đơn
              </span>
            </div>

            {user.rating !== undefined && user.rating > 0 && (
              <div className="user-field-card">
                <span className="user-field-label">
                  <Star size={14} /> Đánh giá đối tác
                </span>
                <span className="user-field-value text-amber-600 font-semibold">
                  {user.rating} / 5.0 ⭐
                </span>
              </div>
            )}

            {user.idCardNumber && (
              <div className="user-field-card col-span-2">
                <span className="user-field-label">
                  <ShieldCheck size={14} /> Số CCCD / Định danh
                </span>
                <span className="user-field-value font-mono">
                  {user.idCardNumber} (Đã xác minh hình chụp)
                </span>
              </div>
            )}
          </div>

          {user.bio && (
            <div className="user-bio-box">
              <span className="user-bio-title">
                <FileText size={14} /> Giới thiệu / Ghi chú hồ sơ:
              </span>
              <p className="user-bio-text">{user.bio}</p>
            </div>
          )}
        </div>

        {/* Modal actions */}
        <div className="user-modal-footer">
          <div className="user-footer-left">
            {user.role !== 'admin' && (
              <button 
                type="button" 
                className={`btn-action-lock ${user.status === 'suspended' ? 'btn-unlock' : ''}`}
                onClick={handleToggleLock}
              >
                {user.status === 'suspended' ? (
                  <>
                    <Unlock size={15} /> Mở khóa tài khoản
                  </>
                ) : (
                  <>
                    <Lock size={15} /> Tạm khóa tài khoản
                  </>
                )}
              </button>
            )}
          </div>

          <div className="user-footer-right">
            {user.status === 'pending' && user.role === 'provider' && (
              <button 
                type="button" 
                className="btn-action-approve" 
                onClick={handleApprove}
              >
                <Check size={15} /> Phê duyệt hồ sơ thợ
              </button>
            )}
            <button 
              type="button" 
              className="btn-user-close" 
              onClick={onClose}
            >
              Đóng lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
