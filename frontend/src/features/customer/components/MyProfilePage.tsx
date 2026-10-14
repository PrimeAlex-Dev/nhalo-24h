import { useState, useEffect } from 'react';
import './MyProfilePage.css';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  ShieldCheck,
  Bell,
  ChevronRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Plus,
  Trash2,
  Lock,
  Smartphone,
  Mail,
  Phone
} from 'lucide-react';
import { mockCurrentUser } from '../data/customerMockData';
import type { UserAddress } from '../types/customer';
import { PATHS } from '../../../routes/paths';

type ModalTab = 'info' | 'address' | 'security' | 'notifications' | null;

export function MyProfilePage() {
  const navigate = useNavigate();

  // Active modal
  const [activeTab, setActiveTab] = useState<ModalTab>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Form State
  const [fullName, setFullName] = useState(mockCurrentUser.name);
  const [phone, setPhone] = useState(mockCurrentUser.phone || '0912 345 678');
  const [email, setEmail] = useState(mockCurrentUser.email || 'nguyenvana@gmail.com');
  const [gender, setGender] = useState('male');

  // Address State
  const [addresses, setAddresses] = useState<UserAddress[]>(mockCurrentUser.addresses || []);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification Toggles
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyPros, setNotifyPros] = useState(true);
  const [notifyPromos, setNotifyPromos] = useState(false);
  const [notifyEmails, setNotifyEmails] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab(null);
    triggerToast('Đã lưu thông tin cá nhân thành công!');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    const item: UserAddress = {
      id: `addr-${Date.now()}`,
      label: newLabel.trim() || 'Địa chỉ khác',
      fullAddress: newAddress.trim(),
      isDefault: addresses.length === 0
    };
    setAddresses([...addresses, item]);
    setNewLabel('');
    setNewAddress('');
    setIsAddingAddress(false);
    triggerToast('Đã thêm địa chỉ mới vào sổ địa chỉ!');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    triggerToast('Đã xóa địa chỉ thành công.');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không trùng khớp.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setActiveTab(null);
    triggerToast('Đổi mật khẩu bảo mật thành công!');
  };

  const handleSaveNotifications = () => {
    setActiveTab(null);
    triggerToast('Đã cập nhật tùy chọn nhận tin thông báo!');
  };

  return (
    <div className="my-profile-page">
      <div className="container profile-container">
        {/* Navigation Breadcrumb */}
        <div className="profile-navigation-bar">
          <button
            type="button"
            className="profile-back-link"
            onClick={() => navigate(PATHS.CUSTOMER.ROOT)}
            aria-label="Quay lại"
          >
            <ArrowLeft size={16} />
            <span>Quay lại trang chủ</span>
          </button>
        </div>

        {/* Success Alert Toast */}
        {toastMessage && (
          <div className="profile-toast-alert" role="alert">
            <CheckCircle2 size={18} className="toast-icon" />
            <span className="toast-text">{toastMessage}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setToastMessage(null)}
              aria-label="Đóng"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* User Profile Header Card */}
        <div className="profile-user-card">
          <div className="profile-avatar-wrapper">
            <User size={30} strokeWidth={2.3} className="profile-avatar-icon" />
          </div>

          <div className="profile-user-meta">
            <h1 className="profile-user-name">{fullName}</h1>
            <p className="profile-user-role">
              {mockCurrentUser.role || 'Tài khoản khách hàng'}
            </p>
          </div>
        </div>

        {/* 2x2 Grid Options Cards (from Wireframe) */}
        <div className="profile-grid">
          {/* Card 1: Thông tin cá nhân */}
          <div
            className="profile-action-card"
            onClick={() => setActiveTab('info')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('info');
              }
            }}
          >
            <div className="action-card-header">
              <div className="action-card-icon-box">
                <User size={22} strokeWidth={2} />
              </div>
              <ChevronRight size={18} className="action-card-chevron" />
            </div>

            <div className="action-card-body">
              <h3 className="action-card-title">Thông tin cá nhân</h3>
              <p className="action-card-desc">Họ tên, điện thoại, email</p>
            </div>
          </div>

          {/* Card 2: Sổ địa chỉ */}
          <div
            className="profile-action-card"
            onClick={() => setActiveTab('address')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('address');
              }
            }}
          >
            <div className="action-card-header">
              <div className="action-card-icon-box">
                <MapPin size={22} strokeWidth={2} />
              </div>
              <ChevronRight size={18} className="action-card-chevron" />
            </div>

            <div className="action-card-body">
              <h3 className="action-card-title">Sổ địa chỉ</h3>
              <p className="action-card-desc">Địa chỉ đã lưu</p>
            </div>
          </div>

          {/* Card 3: Bảo mật */}
          <div
            className="profile-action-card"
            onClick={() => setActiveTab('security')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('security');
              }
            }}
          >
            <div className="action-card-header">
              <div className="action-card-icon-box">
                <ShieldCheck size={22} strokeWidth={2} />
              </div>
              <ChevronRight size={18} className="action-card-chevron" />
            </div>

            <div className="action-card-body">
              <h3 className="action-card-title">Bảo mật</h3>
              <p className="action-card-desc">Mật khẩu, xác minh</p>
            </div>
          </div>

          {/* Card 4: Thông báo */}
          <div
            className="profile-action-card"
            onClick={() => setActiveTab('notifications')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('notifications');
              }
            }}
          >
            <div className="action-card-header">
              <div className="action-card-icon-box">
                <Bell size={22} strokeWidth={2} />
              </div>
              <ChevronRight size={18} className="action-card-chevron" />
            </div>

            <div className="action-card-body">
              <h3 className="action-card-title">Thông báo</h3>
              <p className="action-card-desc">Tùy chọn nhận tin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Thông tin cá nhân */}
      {activeTab === 'info' && (
        <div className="profile-modal-overlay" onClick={() => setActiveTab(null)}>
          <div
            className="profile-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveTab(null)}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Thông tin cá nhân</h2>
              <p className="modal-subtitle">Quản lý họ tên, số điện thoại và email liên hệ</p>
            </div>

            <form onSubmit={handleSaveInfo} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="fullNameInput">Họ và tên</label>
                <input
                  id="fullNameInput"
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phoneInput">Số điện thoại</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-inner-icon" />
                  <input
                    id="phoneInput"
                    type="tel"
                    className="form-input has-icon"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emailInput">Địa chỉ Email</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-inner-icon" />
                  <input
                    id="emailInput"
                    type="email"
                    className="form-input has-icon"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Giới tính</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={gender === 'male'}
                      onChange={() => setGender('male')}
                    />
                    <span>Nam</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={gender === 'female'}
                      onChange={() => setGender('female')}
                    />
                    <span>Nữ</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={gender === 'other'}
                      onChange={() => setGender('other')}
                    />
                    <span>Khác</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setActiveTab(null)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary-action">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Sổ địa chỉ */}
      {activeTab === 'address' && (
        <div className="profile-modal-overlay" onClick={() => setActiveTab(null)}>
          <div
            className="profile-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveTab(null)}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Sổ địa chỉ</h2>
              <p className="modal-subtitle">Danh sách địa chỉ nhà để thợ tiện đến sửa chữa</p>
            </div>

            <div className="modal-body-scroll">
              <div className="address-list">
                {addresses.map((item) => (
                  <div key={item.id} className="address-card-item">
                    <div className="address-item-left">
                      <div className="address-item-title-row">
                        <MapPin size={16} className="address-pin-icon" />
                        <span className="address-label">{item.label}</span>
                        {item.isDefault && (
                          <span className="default-badge">Mặc định</span>
                        )}
                      </div>
                      <p className="address-full-text">{item.fullAddress}</p>
                    </div>

                    <button
                      type="button"
                      className="btn-delete-addr"
                      onClick={() => handleDeleteAddress(item.id)}
                      title="Xóa địa chỉ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {isAddingAddress ? (
                <form onSubmit={handleAddAddress} className="add-address-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="newLabelInput">Tên gợi nhớ</label>
                    <input
                      id="newLabelInput"
                      type="text"
                      className="form-input"
                      placeholder="Ví dụ: Nhà riêng, Căn hộ chung cư, Công ty..."
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="newAddressInput">Địa chỉ chi tiết</label>
                    <textarea
                      id="newAddressInput"
                      className="form-textarea"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      rows={2}
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-actions-inline">
                    <button
                      type="button"
                      className="btn-cancel-sm"
                      onClick={() => setIsAddingAddress(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn-save-sm">
                      Lưu địa chỉ
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className="btn-add-address-trigger"
                  onClick={() => setIsAddingAddress(true)}
                >
                  <Plus size={16} />
                  <span>Thêm địa chỉ mới</span>
                </button>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary-action btn-full"
                onClick={() => setActiveTab(null)}
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Bảo mật */}
      {activeTab === 'security' && (
        <div className="profile-modal-overlay" onClick={() => setActiveTab(null)}>
          <div
            className="profile-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveTab(null)}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Bảo mật tài khoản</h2>
              <p className="modal-subtitle">Đổi mật khẩu và quản lý phương thức xác minh</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="modal-form">
              {/* 2FA Status Box */}
              <div className="security-status-box">
                <div className="status-box-header">
                  <Smartphone size={18} className="text-green" />
                  <div>
                    <span className="status-box-title">Xác minh qua số điện thoại</span>
                    <span className="status-box-sub">Đã kích hoạt cho {phone}</span>
                  </div>
                </div>
                <span className="status-tag-active">Bảo vệ</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="currentPasswordInput">Mật khẩu hiện tại</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-inner-icon" />
                  <input
                    id="currentPasswordInput"
                    type="password"
                    className="form-input has-icon"
                    placeholder="Nhập mật khẩu đang dùng"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newPasswordInput">Mật khẩu mới</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-inner-icon" />
                  <input
                    id="newPasswordInput"
                    type="password"
                    className="form-input has-icon"
                    placeholder="Tối thiểu 8 ký tự"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPasswordInput">Xác nhận mật khẩu mới</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-inner-icon" />
                  <input
                    id="confirmPasswordInput"
                    type="password"
                    className="form-input has-icon"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setActiveTab(null)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary-action">
                  Đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Thông báo */}
      {activeTab === 'notifications' && (
        <div className="profile-modal-overlay" onClick={() => setActiveTab(null)}>
          <div
            className="profile-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveTab(null)}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Tùy chọn thông báo</h2>
              <p className="modal-subtitle">Kiểm soát tin tức và cập nhật bạn muốn nhận</p>
            </div>

            <div className="notification-toggles-list">
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-title">Cập nhật tiến độ đơn sửa chữa</span>
                  <span className="toggle-desc">Nhận thông báo khi thợ nhận việc, xuất phát và hoàn thành</span>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={notifyOrders}
                    onChange={(e) => setNotifyOrders(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-title">Tin nhắn &amp; Cuộc gọi từ thợ</span>
                  <span className="toggle-desc">Cho phép thợ nhắn tin và trao đổi trực tiếp qua ứng dụng</span>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={notifyPros}
                    onChange={(e) => setNotifyPros(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-title">Khuyến mãi &amp; Ưu đãi Nhà Lo 24h</span>
                  <span className="toggle-desc">Nhận voucher giảm giá định kỳ và dịch vụ bảo dưỡng mùa nóng</span>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={notifyPromos}
                    onChange={(e) => setNotifyPromos(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-title">Hóa đơn &amp; Biên lai qua Email</span>
                  <span className="toggle-desc">Tự động gửi hóa đơn điện tử về {email}</span>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={notifyEmails}
                    onChange={(e) => setNotifyEmails(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setActiveTab(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-primary-action"
                onClick={handleSaveNotifications}
              >
                Lưu tùy chọn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProfilePage;
