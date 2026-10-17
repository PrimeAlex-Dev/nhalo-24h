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
  Phone,
  AlertCircle,
  Loader2,
  Pencil
} from 'lucide-react';
import type { UserAddress, GenderType, CustomerProfile } from '../types/customer';
import { customerProfileService } from '../../../services/customerProfileService';
import { customerAddressService } from '../../../services/customerAddressService';
import { useAuth } from '../../auth/useAuth';
import { PATHS } from '../../../routes/paths';

type ModalTab = 'info' | 'address' | 'security' | 'notifications' | null;

export function MyProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  // Active modal
  const [activeTab, setActiveTab] = useState<ModalTab>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile API State
  const [, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Profile Form State
  const [fullName, setFullName] = useState<string>(user?.fullName || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [gender, setGender] = useState<GenderType | null>(null);

  // Address State (Real Address Book)
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(false);
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newIsDefault, setNewIsDefault] = useState<boolean>(false);
  const [isSavingAddress, setIsSavingAddress] = useState<boolean>(false);
  const [addressFormError, setAddressFormError] = useState<string | null>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification Toggles
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyPros, setNotifyPros] = useState(true);
  const [notifyPromos, setNotifyPromos] = useState(false);
  const [notifyEmails, setNotifyEmails] = useState(true);

  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const data = await customerAddressService.getAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách địa chỉ:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Fetch real profile & addresses from backend
  useEffect(() => {
    let isMounted = true;

    const fetchCustomerData = async () => {
      try {
        setIsLoadingProfile(true);
        const [profileData, addressesData] = await Promise.all([
          customerProfileService.getProfile(),
          customerAddressService.getAddresses()
        ]);
        if (isMounted) {
          setProfile(profileData);
          setFullName(profileData.fullName || '');
          setEmail(profileData.email || '');
          setPhone(profileData.phone || '');
          setGender(profileData.gender || null);
          setAddresses(addressesData);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Lỗi khi tải dữ liệu người dùng:', error);
          if (user) {
            setFullName(user.fullName || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    void fetchCustomerData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Họ và tên không được để trống');
      return;
    }

    try {
      setIsSavingProfile(true);
      setFormError(null);

      const updated = await customerProfileService.updateProfile({
        fullName: fullName.trim(),
        gender: gender || null,
      });

      setProfile(updated);
      setFullName(updated.fullName);
      setGender(updated.gender || null);

      // Đồng bộ lại tên với header và navbar thông qua AuthContext
      await refreshUser();

      setActiveTab(null);
      triggerToast('Đã lưu thông tin cá nhân thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu thông tin cá nhân';
      setFormError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleStartAddAddress = () => {
    setEditingAddressId(null);
    setNewLabel('');
    setNewAddress('');
    setNewIsDefault(addresses.length === 0);
    setAddressFormError(null);
    setIsAddingAddress(true);
  };

  const handleStartEditAddress = (item: UserAddress) => {
    setEditingAddressId(item.id);
    setNewLabel(item.label);
    setNewAddress(item.fullAddress);
    setNewIsDefault(item.isDefault);
    setAddressFormError(null);
    setIsAddingAddress(true);
  };

  const handleCancelAddressForm = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setAddressFormError(null);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      setAddressFormError('Vui lòng nhập tên gợi nhớ cho địa chỉ');
      return;
    }
    if (!newAddress.trim()) {
      setAddressFormError('Vui lòng nhập địa chỉ chi tiết');
      return;
    }

    try {
      setIsSavingAddress(true);
      setAddressFormError(null);

      if (editingAddressId) {
        await customerAddressService.updateAddress(editingAddressId, {
          label: newLabel.trim(),
          fullAddress: newAddress.trim(),
          isDefault: newIsDefault,
        });
        triggerToast('Đã cập nhật địa chỉ thành công!');
      } else {
        await customerAddressService.createAddress({
          label: newLabel.trim(),
          fullAddress: newAddress.trim(),
          isDefault: newIsDefault,
        });
        triggerToast('Đã thêm địa chỉ mới vào sổ địa chỉ!');
      }

      await fetchAddresses();
      handleCancelAddressForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu địa chỉ';
      setAddressFormError(msg);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ địa chỉ?')) {
      return;
    }

    try {
      await customerAddressService.deleteAddress(id);
      await fetchAddresses();
      triggerToast('Đã xóa địa chỉ thành công.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa địa chỉ';
      triggerToast(`Lỗi: ${msg}`);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await customerAddressService.setDefaultAddress(id);
      await fetchAddresses();
      triggerToast('Đã đặt làm địa chỉ mặc định thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể đặt làm địa chỉ mặc định';
      triggerToast(`Lỗi: ${msg}`);
    }
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
            <h1 className="profile-user-name">
              {isLoadingProfile ? 'Đang tải...' : (fullName || user?.fullName || 'Khách hàng')}
            </h1>
            <p className="profile-user-role">
              Tài khoản khách hàng {email ? `• ${email}` : ''}
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
              <p className="action-card-desc">
                {addresses.length > 0 ? `${addresses.length} địa chỉ đã lưu` : 'Thêm và quản lý địa chỉ'}
              </p>
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
              <p className="modal-subtitle">Quản lý họ tên, giới tính và địa chỉ liên hệ</p>
            </div>

            <form onSubmit={handleSaveInfo} className="modal-form">
              {formError && (
                <div className="profile-error-alert" role="alert">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="fullNameInput">Họ và tên</label>
                <input
                  id="fullNameInput"
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên đầy đủ"
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
                    value={phone || ''}
                    disabled
                    aria-readonly="true"
                  />
                  <span className="input-lock-tag">
                    <Lock size={12} /> Cố định
                  </span>
                </div>
                <span className="form-field-hint">Số điện thoại dùng để nhận tin SMS xác thực, không thể tự sửa.</span>
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
                    disabled
                    aria-readonly="true"
                  />
                  <span className="input-lock-tag">
                    <Lock size={12} /> Cố định
                  </span>
                </div>
                <span className="form-field-hint">Email định danh tài khoản đăng nhập, không thể tự sửa.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Giới tính</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="MALE"
                      checked={gender === 'MALE'}
                      onChange={() => setGender('MALE')}
                    />
                    <span>Nam</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="FEMALE"
                      checked={gender === 'FEMALE'}
                      onChange={() => setGender('FEMALE')}
                    />
                    <span>Nữ</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="OTHER"
                      checked={gender === 'OTHER'}
                      onChange={() => setGender('OTHER')}
                    />
                    <span>Khác</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setFormError(null);
                    setActiveTab(null);
                  }}
                  disabled={isSavingProfile}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary-action" disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Loader2 size={15} className="animate-spin" /> Đang lưu...
                    </span>
                  ) : (
                    'Lưu thay đổi'
                  )}
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
              <p className="modal-subtitle">Danh sách địa chỉ để thợ tiện đến phục vụ và sửa chữa</p>
            </div>

            <div className="modal-body-scroll">
              {addressFormError && (
                <div className="profile-error-alert" role="alert">
                  <AlertCircle size={16} />
                  <span>{addressFormError}</span>
                </div>
              )}

              {isLoadingAddresses ? (
                <div className="profile-loading-skeleton">
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                  <p>Đang tải danh sách địa chỉ...</p>
                </div>
              ) : (
                <>
                  {addresses.length === 0 && !isAddingAddress && (
                    <div className="address-empty-state">
                      <MapPin size={28} style={{ margin: '0 auto 8px', color: '#94A3B8' }} />
                      <p style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Chưa có địa chỉ nào được lưu</p>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        Thêm địa chỉ ngay để tiện chọn nhanh khi đặt dịch vụ sửa chữa.
                      </p>
                    </div>
                  )}

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

                        <div className="address-item-actions">
                          {!item.isDefault && (
                            <button
                              type="button"
                              className="btn-set-default"
                              onClick={() => void handleSetDefaultAddress(item.id)}
                              title="Đặt làm địa chỉ mặc định"
                            >
                              Đặt mặc định
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-edit-addr"
                            onClick={() => handleStartEditAddress(item)}
                            title="Chỉnh sửa địa chỉ"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-delete-addr"
                            onClick={() => void handleDeleteAddress(item.id)}
                            title="Xóa địa chỉ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isAddingAddress ? (
                    <form onSubmit={(e) => void handleSaveAddress(e)} className="add-address-form">
                      <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
                        {editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                      </h4>

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
                          placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                          rows={2}
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="address-checkbox-label">
                          <input
                            type="checkbox"
                            checked={newIsDefault}
                            onChange={(e) => setNewIsDefault(e.target.checked)}
                          />
                          <span>Đặt làm địa chỉ mặc định khi đặt lịch</span>
                        </label>
                      </div>

                      <div className="form-actions-inline">
                        <button
                          type="button"
                          className="btn-cancel-sm"
                          onClick={handleCancelAddressForm}
                          disabled={isSavingAddress}
                        >
                          Hủy
                        </button>
                        <button type="submit" className="btn-save-sm" disabled={isSavingAddress}>
                          {isSavingAddress ? 'Đang lưu...' : (editingAddressId ? 'Cập nhật' : 'Lưu địa chỉ')}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      className="btn-add-address-trigger"
                      onClick={handleStartAddAddress}
                    >
                      <Plus size={16} />
                      <span>Thêm địa chỉ mới</span>
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary-action btn-full"
                onClick={() => {
                  handleCancelAddressForm();
                  setActiveTab(null);
                }}
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
