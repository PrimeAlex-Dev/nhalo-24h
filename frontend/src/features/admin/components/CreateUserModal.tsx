import { useState } from 'react';
import { X, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type { CreateUserPayload, UserRole } from '../types/admin';
import './CreateUserModal.css';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: CreateUserPayload) => Promise<void>;
}

export function CreateUserModal({ isOpen, onClose, onCreate }: CreateUserModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName) {
      setErrorMsg('Vui lòng nhập họ và tên');
      return;
    }
    if (!trimmedEmail) {
      setErrorMsg('Vui lòng nhập địa chỉ email');
      return;
    }
    if (!trimmedPhone && !/^0[0-9]{9}$/.test(trimmedPhone)) {
      // no phone
    } else if (trimmedPhone && !/^0[0-9]{9}$/.test(trimmedPhone)) {
      setErrorMsg('Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0');
      return;
    }

    if (!trimmedPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu cho tài khoản');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,12}$/;
    if (!passwordRegex.test(trimmedPassword)) {
      setErrorMsg('Mật khẩu phải từ 8 đến 12 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường và một chữ số');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate({
        fullName: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone ? trimmedPhone : undefined,
        role,
        password: trimmedPassword,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tạo người dùng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-user-modal-backdrop" onClick={onClose}>
      <div 
        className="create-user-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-title"
      >
        <div className="create-user-modal-header">
          <div>
            <h2 id="create-user-title" className="create-user-modal-title">
              Tạo Người Dùng Mới
            </h2>
            <p className="create-user-modal-sub">
              Tạo tài khoản trực tiếp vào hệ thống cơ sở dữ liệu backend
            </p>
          </div>
          <button 
            type="button" 
            className="create-user-modal-close" 
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="create-user-error-banner">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-user-form">
          <div className="create-user-form-body">
            <div className="create-user-field">
              <label htmlFor="create-fullname" className="create-user-label">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                id="create-fullname"
                type="text"
                className="create-user-input"
                placeholder="VD: Nguyễn Văn An"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="create-user-field">
              <label htmlFor="create-email" className="create-user-label">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <input
                id="create-email"
                type="email"
                className="create-user-input"
                placeholder="nguyenvanan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
              />
            </div>

            <div className="create-user-field">
              <label htmlFor="create-password" className="create-user-label">
                Mật khẩu đăng nhập <span className="text-red-500">*</span>
              </label>
              <div className="create-user-password-wrap">
                <input
                  id="create-password"
                  type={showPassword ? 'text' : 'password'}
                  className="create-user-input"
                  placeholder="8-12 ký tự, gồm chữ hoa, thường và số"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={12}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span className="create-user-hint">Mật khẩu từ 8-12 ký tự, bắt buộc có chữ hoa, chữ thường và số</span>
            </div>

            <div className="create-user-grid-2">
              <div className="create-user-field">
                <label htmlFor="create-phone" className="create-user-label">
                  Số điện thoại (Tùy chọn)
                </label>
                <input
                  id="create-phone"
                  type="tel"
                  className="create-user-input"
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <span className="create-user-hint">10 chữ số, bắt đầu số 0</span>
              </div>

              <div className="create-user-field">
                <label htmlFor="create-role" className="create-user-label">
                  Vai trò (Role) <span className="text-red-500">*</span>
                </label>
                <select
                  id="create-role"
                  className="create-user-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                  <option value="PROVIDER">Thợ kỹ thuật (PROVIDER)</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="create-user-modal-footer">
            <button
              type="button"
              className="btn-create-user-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn-create-user-submit"
              disabled={isSubmitting}
            >
              <UserPlus size={16} /> {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
