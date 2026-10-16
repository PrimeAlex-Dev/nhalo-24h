import { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  Unlock, 
  CheckCircle2,
  AlertCircle,
  Edit2,
  Save
} from 'lucide-react';
import type { AdminUserItem, UpdateUserPayload } from '../types/admin';
import './UserDetailModal.css';

interface UserDetailModalProps {
  user: AdminUserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveUser?: (userId: string) => Promise<void> | void;
  onUpdateUser?: (userId: string, payload: UpdateUserPayload) => Promise<void> | void;
  onToggleStatus?: (userId: string, newStatus: AdminUserItem['status']) => Promise<void> | void;
}

interface UserModalContentProps {
  user: AdminUserItem;
  onClose: () => void;
  onUpdateUser?: (userId: string, payload: UpdateUserPayload) => Promise<void> | void;
  onToggleStatus?: (userId: string, newStatus: AdminUserItem['status']) => Promise<void> | void;
}

function UserModalContent({ user, onClose, onUpdateUser, onToggleStatus }: UserModalContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const getRoleBadge = (role: AdminUserItem['role']) => {
    switch (role) {
      case 'ADMIN':
        return <span className="user-role-badge role-admin">Quản trị viên</span>;
      case 'PROVIDER':
        return <span className="user-role-badge role-provider">Thợ kỹ thuật</span>;
      case 'CUSTOMER':
      default:
        return <span className="user-role-badge role-customer">Khách hàng</span>;
    }
  };

  const getStatusBadge = (status: AdminUserItem['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="user-status-pill status-active">Đang hoạt động</span>;
      case 'DISABLED':
        return <span className="user-status-pill status-suspended">Đã vô hiệu hóa</span>;
    }
  };

  const handleToggleLock = async () => {
    if (!onToggleStatus) return;
    const nextStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onToggleStatus(user.id, nextStatus);
      setSuccessMsg(
        nextStatus === 'DISABLED' 
          ? 'Đã vô hiệu hóa tài khoản thành công.' 
          : 'Đã kích hoạt lại tài khoản thành công.'
      );
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateUser) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onUpdateUser(user.id, {
        fullName: fullName.trim(),
        phone: phone.trim() ? phone.trim() : undefined,
      });
      setIsEditing(false);
      setSuccessMsg('Đã cập nhật thông tin người dùng thành công!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi cập nhật thông tin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

      {errorMsg && (
        <div className="user-error-notice">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      <div className="user-modal-body">
        {/* Top user profile card */}
        <div className="user-profile-hero">
          <div className="user-hero-avatar-placeholder">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-hero-info">
            <h3 className="user-hero-name">{user.fullName}</h3>
            <p className="user-hero-id">UUID: {user.id}</p>
            <span className="user-hero-profession">
              <User size={14} /> Vai trò: {user.role}
            </span>
          </div>
          {!isEditing && (
            <button
              type="button"
              className="btn-edit-user-profile"
              onClick={() => setIsEditing(true)}
              title="Chỉnh sửa họ tên & số điện thoại"
            >
              <Edit2 size={15} /> Sửa hồ sơ
            </button>
          )}
        </div>

        {/* Edit Form or Details View */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="user-edit-form">
            <div className="user-details-grid">
              <div className="user-field-card">
                <label htmlFor="user-fullname-input" className="user-field-label">
                  <User size={14} /> Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  id="user-fullname-input"
                  type="text"
                  className="user-edit-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="user-field-card">
                <label htmlFor="user-phone-input" className="user-field-label">
                  <Phone size={14} /> Số điện thoại (10 số, bắt đầu 0)
                </label>
                <input
                  id="user-phone-input"
                  type="text"
                  className="user-edit-input"
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="^$|^0[0-9]{9}$"
                />
              </div>

              <div className="user-field-card">
                <span className="user-field-label">
                  <Mail size={14} /> Email (Không thể đổi)
                </span>
                <span className="user-field-value text-slate-500 font-mono text-sm">{user.email}</span>
              </div>

              <div className="user-field-card">
                <span className="user-field-label">
                  <ShieldCheck size={14} /> Xác thực Email
                </span>
                <span className="user-field-value text-sm font-medium">
                  {user.isEmailVerified ? '✅ Đã xác minh' : '⚠️ Chưa xác minh'}
                </span>
              </div>
            </div>

            <div className="user-edit-actions">
              <button
                type="button"
                className="btn-user-cancel-edit"
                onClick={() => {
                  setIsEditing(false);
                  setFullName(user.fullName);
                  setPhone(user.phone || '');
                  setErrorMsg(null);
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn-user-save-edit"
                disabled={isSubmitting}
              >
                <Save size={15} /> {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        ) : (
          <div className="user-details-grid">
            <div className="user-field-card">
              <span className="user-field-label">
                <Mail size={14} /> Email đăng nhập
              </span>
              <span className="user-field-value font-mono">{user.email}</span>
            </div>

            <div className="user-field-card">
              <span className="user-field-label">
                <Phone size={14} /> Số điện thoại
              </span>
              <span className="user-field-value font-medium text-primary">
                {user.phone ? user.phone : 'Chưa cập nhật'}
              </span>
            </div>

            <div className="user-field-card">
              <span className="user-field-label">
                <ShieldCheck size={14} /> Trạng thái xác thực Email
              </span>
              <span className="user-field-value font-medium">
                {user.isEmailVerified ? (
                  <span className="text-emerald-600">Đã kích hoạt & xác thực</span>
                ) : (
                  <span className="text-amber-600">Chưa xác thực email</span>
                )}
              </span>
            </div>

            <div className="user-field-card">
              <span className="user-field-label">
                <Calendar size={14} /> Thời điểm tạo tài khoản
              </span>
              <span className="user-field-value">
                {new Date(user.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>

            <div className="user-field-card col-span-2">
              <span className="user-field-label">
                <Calendar size={14} /> Thời điểm cập nhật gần nhất
              </span>
              <span className="user-field-value">
                {new Date(user.updatedAt).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal actions */}
      <div className="user-modal-footer">
        <div className="user-footer-left">
          <button 
            type="button" 
            className={`btn-action-lock ${user.status === 'DISABLED' ? 'btn-unlock' : ''}`}
            onClick={handleToggleLock}
            disabled={isSubmitting}
          >
            {user.status === 'DISABLED' ? (
              <>
                <Unlock size={15} /> Kích hoạt lại tài khoản
              </>
            ) : (
              <>
                <Lock size={15} /> Vô hiệu hóa tài khoản
              </>
            )}
          </button>
        </div>

        <div className="user-footer-right">
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
  );
}

export function UserDetailModal({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  onToggleStatus,
}: UserDetailModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="user-modal-backdrop" onClick={onClose}>
      <UserModalContent
        key={user.id}
        user={user}
        onClose={onClose}
        onUpdateUser={onUpdateUser}
        onToggleStatus={onToggleStatus}
      />
    </div>
  );
}
