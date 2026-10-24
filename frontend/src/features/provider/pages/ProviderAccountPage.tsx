import { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  MapPin, 
  ChevronRight, 
  PhoneCall, 
  LogOut, 
  Repeat,
  Wrench,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  RotateCcw,
  Camera,
  Trash2,
  ZoomIn
} from 'lucide-react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import { useAuth } from '../../auth';
import type { ProviderContextType } from '../../../layouts/ProviderLayout';
import { 
  providerProfileService, 
  categoryService,
  type ProviderProfileData,
  type AdminCategoryItem
} from '../../../services';
import { ConfirmModal, AvatarLightboxModal } from '../../../components/common';
import './ProviderAccountPage.css';

export function ProviderAccountPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const outletCtx = useOutletContext<ProviderContextType | null>();
  const isAvailable = outletCtx?.isOnline ?? true;
  const toggleAvailable = outletCtx?.toggleOnline;
  const setParentProfile = outletCtx?.setProfile;

  // Profile data state
  const [profile, setProfile] = useState<ProviderProfileData | null>(null);
  const [availableCategories, setAvailableCategories] = useState<AdminCategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [deletingAvatar, setDeletingAvatar] = useState<boolean>(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [showAvatarLightbox, setShowAvatarLightbox] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form edit state
  const [headline, setHeadline] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [experienceYears, setExperienceYears] = useState<string>('');
  const [pricePerHour, setPricePerHour] = useState<string>('');
  const [serviceArea, setServiceArea] = useState<string>('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [profData, catData] = await Promise.all([
          providerProfileService.getMyProfile(),
          categoryService.getCategories({ status: 'ACTIVE', size: 50 }),
        ]);

        if (!ignore) {
          setProfile(profData);
          if (setParentProfile) {
            setParentProfile(profData);
          }
          setAvailableCategories(catData.content || []);

          // Sync initial form values
          setHeadline(profData.headline || '');
          setBio(profData.bio || '');
          setExperienceYears(
            profData.experienceYears !== null && profData.experienceYears !== undefined && profData.experienceYears > 0
              ? String(profData.experienceYears)
              : ''
          );
          setPricePerHour(
            profData.pricePerHour !== null && profData.pricePerHour !== undefined && profData.pricePerHour > 0
              ? String(profData.pricePerHour)
              : ''
          );
          setServiceArea(profData.serviceArea || '');
          setSelectedCategoryIds(profData.categories?.map((c) => c.id) || []);
        }
      } catch (err) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Không thể tải thông tin hồ sơ thợ.';
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [setParentProfile]);

  const handleCategoryToggle = (catId: string) => {
    setSelectedCategoryIds((prev) => 
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    max?: number
  ) => {
    const raw = e.target.value;
    if (raw === '') {
      setter('');
      return;
    }
    // Remove non-digit characters if any
    const digits = raw.replace(/\D/g, '');
    if (digits === '') {
      setter('');
      return;
    }
    // Remove leading zeros if followed by other digits (e.g. "01000" -> "1000")
    const sanitized = digits.replace(/^0+(?=\d)/, '');
    if (max !== undefined && Number(sanitized) > max) {
      e.target.value = String(max);
      setter(String(max));
      return;
    }
    e.target.value = sanitized;
    setter(sanitized);
  };

  const handleResetForm = () => {
    if (!profile) return;
    setHeadline(profile.headline || '');
    setBio(profile.bio || '');
    setExperienceYears(
      profile.experienceYears !== null && profile.experienceYears !== undefined && profile.experienceYears > 0
        ? String(profile.experienceYears)
        : ''
    );
    setPricePerHour(
      profile.pricePerHour !== null && profile.pricePerHour !== undefined && profile.pricePerHour > 0
        ? String(profile.pricePerHour)
        : ''
    );
    setServiceArea(profile.serviceArea || '');
    setSelectedCategoryIds(profile.categories?.map((c) => c.id) || []);
    setSuccessNotice(null);
    setError(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const updated = await providerProfileService.updateMyProfile({
        headline,
        bio,
        experienceYears: experienceYears === '' ? 0 : parseInt(experienceYears, 10) || 0,
        pricePerHour: pricePerHour === '' ? 0 : parseFloat(pricePerHour) || 0,
        serviceArea,
        isAvailable,
        categoryIds: selectedCategoryIds,
      });

      setProfile(updated);
      if (setParentProfile) {
        setParentProfile(updated);
      }
      setSuccessNotice('Hồ sơ nghề nghiệp đã được cập nhật thành công!');
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật hồ sơ thợ.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset value so user can re-select the same file if needed
    e.target.value = '';

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG hoặc WEBP.');
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      setError('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh có kích thước nhỏ hơn.');
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const updated = await providerProfileService.uploadAvatar(file);
      setProfile(updated);
      if (setParentProfile) {
        setParentProfile(updated);
      }
      setSuccessNotice('Ảnh đại diện đã được cập nhật thành công!');
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Tải lên ảnh đại diện thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleOpenDeleteModal = () => {
    if (!profile?.avatarUrl) return;
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDeleteAvatar = async () => {
    setDeletingAvatar(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const updated = await providerProfileService.deleteAvatar();
      setProfile(updated);
      if (setParentProfile) {
        setParentProfile(updated);
      }
      setShowDeleteConfirmModal(false);
      setSuccessNotice('Đã gỡ bỏ ảnh đại diện thành công!');
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gỡ ảnh đại diện thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setDeletingAvatar(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(PATHS.AUTH.LOGIN);
  };

  const displayAvatar = profile?.avatarUrl || '';
  const initialLetter = (profile?.fullName || user?.fullName || 'T').charAt(0).toUpperCase();

  return (
    <div className="provider-account-page">
      <div className="provider-account-header-row">
        <div>
          <h1 className="provider-account-title">Hồ sơ thợ & Cài đặt nghề nghiệp</h1>
          <p className="provider-account-sub">
            Xem và chỉnh sửa thông tin kỹ năng, chuyên môn và khu vực phục vụ của bạn.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="provider-account-alert success" role="alert">
          <CheckCircle2 size={18} />
          <span>{successNotice}</span>
        </div>
      )}

      {error && (
        <div className="provider-account-alert error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="provider-account-loading">
          <Loader2 size={32} className="spin-icon" />
          <p>Đang tải thông tin hồ sơ đối tác...</p>
        </div>
      ) : (
        <div className="provider-account-desktop-grid">
          {/* ==================================================================
              CỘT TRÁI: THÔNG TIN TÀI KHOẢN & LIÊN KẾT NHANH
              ================================================================== */}
          <div className="provider-account-left-col">
            {/* Thẻ hồ sơ đối tác */}
            <div className="provider-profile-card">
              <div className="provider-profile-avatar-box">
                {displayAvatar ? (
                  <div 
                    className="provider-profile-avatar-interactive"
                    onClick={() => setShowAvatarLightbox(true)}
                    title="Nhấp để phóng to xem rõ ảnh đại diện"
                  >
                    <img 
                      src={displayAvatar} 
                      alt={profile?.fullName || 'Avatar'} 
                      className="provider-profile-avatar-img"
                    />
                    <div className="avatar-hover-zoom-hint" title="Xem ảnh lớn">
                      <ZoomIn size={16} />
                    </div>
                  </div>
                ) : (
                  <div className="provider-profile-avatar-placeholder">
                    {initialLetter}
                  </div>
                )}

                {uploadingAvatar && (
                  <div className="avatar-loading-overlay">
                    <Loader2 size={24} className="spin-icon" />
                  </div>
                )}

                <button
                  type="button"
                  className="avatar-upload-trigger-btn"
                  title="Thay đổi ảnh đại diện (JPG, PNG, WEBP tối đa 5MB)"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  aria-label="Tải lên ảnh đại diện"
                >
                  <Camera size={14} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleAvatarFileChange}
                />
              </div>

              <div className="provider-profile-info">
                <div className="provider-profile-name-row">
                  <h2>{profile?.fullName || user?.fullName || 'Thợ đối tác'}</h2>
                  <span className="provider-verified-badge" title="Đối tác đã kích hoạt tài khoản">
                    <Check size={12} strokeWidth={3} />
                  </span>
                </div>
                <p className="provider-profile-role">
                  {headline || 'Thợ Kỹ Thuật Độc Lập'}
                </p>
                <div className="provider-profile-sub-row">
                  <div className="provider-profile-rating-pill">
                    <span>★ 5.0</span>
                    <span>(Mới tham gia)</span>
                  </div>
                  {displayAvatar && (
                    <button
                      type="button"
                      className="provider-avatar-remove-btn"
                      onClick={handleOpenDeleteModal}
                      disabled={uploadingAvatar || deletingAvatar}
                      title="Gỡ ảnh đại diện"
                    >
                      <Trash2 size={12} />
                      <span>Gỡ ảnh</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Thông tin tài khoản đăng nhập (Chỉ xem) */}
            <div className="provider-account-readonly-card">
              <h3 className="provider-card-subhead">Tài khoản xác thực</h3>
              <div className="provider-readonly-field">
                <span className="readonly-label">Email tài khoản</span>
                <span className="readonly-value">{profile?.email || user?.email}</span>
              </div>
              <div className="provider-readonly-field">
                <span className="readonly-label">Số điện thoại</span>
                <span className="readonly-value">{profile?.phone || user?.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="provider-readonly-field">
                <span className="readonly-label">Trạng thái nhận đơn</span>
                <span className={`readonly-badge ${isAvailable ? 'available' : 'busy'}`}>
                  {isAvailable ? '● Đang sẵn sàng nhận việc' : '○ Tạm ngưng nhận đơn'}
                </span>
              </div>
            </div>

            {/* Các liên kết hành động */}
            <div className="provider-account-actions-card">
              <Link to={PATHS.CUSTOMER.ROOT} className="provider-menu-btn">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Repeat size={18} color="#1D6AE5" />
                  <span>Chuyển sang giao diện Khách hàng</span>
                </div>
                <ChevronRight size={18} color="#94A3B8" />
              </Link>

              <a href="tel:19006868" className="provider-menu-btn">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PhoneCall size={18} color="#059669" />
                  <span>Tổng đài hỗ trợ đối tác (1900 6868)</span>
                </div>
                <ChevronRight size={18} color="#94A3B8" />
              </a>

              <button type="button" className="provider-menu-btn logout" onClick={handleLogout}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <LogOut size={18} color="#EF4444" />
                  <span>Đăng xuất tài khoản</span>
                </div>
                <ChevronRight size={18} color="#EF4444" />
              </button>
            </div>
          </div>

          {/* ==================================================================
              CỘT PHẢI: FORM CHỈNH SỬA THÔNG TIN NGHỀ NGHIỆP
              ================================================================== */}
          <div className="provider-account-right-col">
            <form onSubmit={handleSaveProfile} className="provider-edit-form-card">
              <div className="provider-form-header">
                <h2 className="provider-form-title">Cập nhật thông tin nghề nghiệp</h2>
                <p className="provider-form-desc">
                  Khách hàng sẽ nhìn thấy các thông tin này khi tìm kiếm và duyệt hồ sơ thợ của bạn.
                </p>
              </div>

              {/* Chức danh / Tiêu đề */}
              <div className="form-group">
                <label htmlFor="headline" className="form-label">
                  Chức danh / Tiêu đề ngắn <span className="text-danger">*</span>
                </label>
                <input
                  id="headline"
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Thợ sửa điện nước gia đình 5★, Chuyên sửa máy giặt & máy lạnh"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  maxLength={150}
                  required
                />
                <span className="form-help">Tiêu đề xuất hiện nổi bật trên thẻ thợ (tối đa 150 ký tự).</span>
              </div>

              {/* Hàng 2 cột: Năm kinh nghiệm & Đơn giá tham khảo */}
              <div className="form-row-grid">
                <div className="form-group">
                  <label htmlFor="experienceYears" className="form-label">
                    <Clock size={16} className="label-icon" />
                    <span>Số năm kinh nghiệm</span>
                  </label>
                  <input
                    id="experienceYears"
                    type="number"
                    min="0"
                    max="50"
                    className="form-input"
                    placeholder="0"
                    value={experienceYears}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleNumberChange(e, setExperienceYears, 50)}
                  />
                  <span className="form-help">
                    {experienceYears !== '' && Number(experienceYears) > 0
                      ? `${experienceYears} năm kinh nghiệm làm nghề.`
                      : 'Số năm làm nghề (năm).'}
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="pricePerHour" className="form-label">
                    <DollarSign size={16} className="label-icon" />
                    <span>Đơn giá tham khảo theo giờ (VNĐ)</span>
                  </label>
                  <input
                    id="pricePerHour"
                    type="number"
                    min="0"
                    step="any"
                    className="form-input"
                    placeholder="Ví dụ: 150000"
                    value={pricePerHour}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleNumberChange(e, setPricePerHour)}
                  />
                  <span className="form-help">
                    {pricePerHour !== '' && Number(pricePerHour) > 0
                      ? `Tương đương: ${Number(pricePerHour).toLocaleString('vi-VN')} đ/giờ`
                      : 'Mức giá tham khảo cho khách hàng.'}
                  </span>
                </div>
              </div>

              {/* Khu vực phục vụ */}
              <div className="form-group">
                <label htmlFor="serviceArea" className="form-label">
                  <MapPin size={16} className="label-icon" />
                  <span>Khu vực hoạt động</span>
                </label>
                <input
                  id="serviceArea"
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Quận Ninh Kiều & Cái Răng (Cần Thơ) hoặc Quận 1, 3, Bình Thạnh"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  maxLength={255}
                />
                <span className="form-help">Địa bàn Quận/Huyện bạn sẵn sàng nhận đơn.</span>
              </div>

              {/* Danh mục dịch vụ đảm nhận */}
              <div className="form-group">
                <label className="form-label">
                  <Wrench size={16} className="label-icon" />
                  <span>Danh mục dịch vụ bạn có thể đảm nhận</span>
                </label>
                <div className="provider-categories-selector">
                  {availableCategories.length === 0 ? (
                    <p className="text-muted">Đang tải danh mục dịch vụ từ hệ thống...</p>
                  ) : (
                    availableCategories.map((cat) => {
                      const isChecked = selectedCategoryIds.includes(cat.id);
                      return (
                        <label 
                          key={cat.id} 
                          className={`provider-category-chip ${isChecked ? 'active' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCategoryToggle(cat.id)}
                            className="chip-checkbox"
                          />
                          <span>{cat.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
                <span className="form-help">Chọn những dịch vụ bạn có tay nghề và trang thiết bị để làm.</span>
              </div>

              {/* Giới thiệu bản thân / Bio */}
              <div className="form-group">
                <label htmlFor="bio" className="form-label">
                  Giới thiệu bản thân & Cam kết dịch vụ
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  className="form-textarea"
                  placeholder="Mô tả kỹ năng, cam kết làm việc đúng giờ, trung thực, có bảo hành..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {/* Công tắc Bật/Tắt nhận việc */}
              <div className="provider-availability-toggle-box">
                <label className="toggle-switch-label">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={() => {
                      if (toggleAvailable) {
                        toggleAvailable();
                      }
                    }}
                    className="toggle-switch-input"
                  />
                  <span className="toggle-switch-slider" />
                </label>
                <div className="toggle-text-wrap">
                  <span className="toggle-main-title">
                    {isAvailable ? 'Đang sẵn sàng nhận việc' : 'Tạm ngưng nhận việc'}
                  </span>
                  <span className="toggle-sub-title">
                    {isAvailable 
                      ? 'Hồ sơ của bạn hiển thị công khai và sẵn sàng nhận đơn từ khách hàng.'
                      : 'Hồ sơ sẽ tạm ẩn hoặc hiển thị "Tạm bận", không nhận thông báo đơn mới.'}
                  </span>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="provider-form-actions">
                <button
                  type="button"
                  onClick={handleResetForm}
                  disabled={saving}
                  className="btn-form-secondary"
                >
                  <RotateCcw size={16} />
                  <span>Hoàn tác</span>
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-form-primary"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận gỡ ảnh chuyên nghiệp */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleConfirmDeleteAvatar}
        title="Gỡ bỏ ảnh đại diện"
        message="Bạn có chắc chắn muốn gỡ bỏ ảnh đại diện hiện tại? File ảnh sẽ được xóa hoàn toàn khỏi máy chủ và hồ sơ của bạn sẽ quay về chữ cái mặc định."
        confirmText="Xác nhận gỡ ảnh"
        cancelText="Hủy bỏ"
        confirmVariant="danger"
        icon="trash"
        loading={deletingAvatar}
      />

      {/* Modal phóng to xem ảnh đại diện đè lên trang hiện tại */}
      <AvatarLightboxModal
        isOpen={showAvatarLightbox}
        onClose={() => setShowAvatarLightbox(false)}
        imageUrl={displayAvatar}
        name={profile?.fullName || user?.fullName || 'Thợ đối tác'}
        role={headline || 'Thợ Kỹ Thuật Độc Lập'}
        verified={true}
        badgeText="Ảnh đại diện của bạn"
      />
    </div>
  );
}

export default ProviderAccountPage;
