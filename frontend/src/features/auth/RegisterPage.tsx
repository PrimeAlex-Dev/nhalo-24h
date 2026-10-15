import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Wrench
} from 'lucide-react';
import { PATHS } from '../../routes/paths';
import provider1Img from '../../assets/provider_1.png';
import provider2Img from '../../assets/provider_2.png';
import provider3Img from '../../assets/provider_3.png';
import './Auth.css';

export function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của bạn');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật');
      return;
    }

    setIsLoading(true);

    // Simulate pleasant mock registration transition
    setTimeout(() => {
      setIsLoading(false);
      navigate(PATHS.CUSTOMER.ROOT);
    }, 600);
  };

  const handleGoogleSignup = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate(PATHS.CUSTOMER.ROOT);
    }, 500);
  };

  return (
    <div className="auth-page">
      {/* Decorative ambient background orbs */}
      <div className="auth-ambient-orb auth-orb-top-left" />
      <div className="auth-ambient-orb auth-orb-bottom-right" />

      {/* Floating Back to Home button */}
      <Link to={PATHS.HOME} className="auth-back-home" title="Trở về trang chủ">
        <ArrowLeft size={16} />
        <span>Trang chủ</span>
      </Link>

      <div className="auth-card">
        {/* Left Column: Visual Brand Hero Showcase */}
        <div className="auth-hero-side">
          <div className="auth-hero-glow-1" />
          <div className="auth-hero-glow-2" />

          <div className="auth-hero-top">
            <div className="auth-hero-badge">
              <Sparkles size={14} />
              <span>Gia nhập cộng đồng Nhà Lo 24h</span>
            </div>

            <h2 className="auth-hero-title">
              Trải nghiệm dịch vụ <span>sửa chữa an tâm 24/7</span>
            </h2>

            <p className="auth-hero-desc">
              Tạo tài khoản miễn phí để nhận ngay ưu đãi dịch vụ đầu tiên và trải nghiệm quản lý sửa chữa nhà cửa thông minh hàng đầu.
            </p>

            <div className="auth-hero-features">
              <div className="auth-feature-card">
                <div className="auth-feature-icon-wrapper">
                  <CheckCircle2 size={20} />
                </div>
                <div className="auth-feature-text">
                  <h4>Đặt lịch siêu tốc chỉ 30 giây</h4>
                  <p>Theo dõi thợ di chuyển trực tiếp & bảo hành điện tử</p>
                </div>
              </div>

              <div className="auth-feature-card">
                <div className="auth-feature-icon-wrapper">
                  <ShieldCheck size={20} />
                </div>
                <div className="auth-feature-text">
                  <h4>Cam kết bảo hành chu đáo</h4>
                  <p>Bảo hiểm công việc, hoàn tiền hoặc sửa lại nếu chưa hài lòng</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <div className="auth-hero-rating">
              <div className="auth-hero-stars">★★★★★</div>
              <div>
                <div className="auth-hero-rating-text">4.9 / 5 điểm tin cậy</div>
                <div className="auth-hero-rating-sub">từ 12.000+ hộ gia đình</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Register Form */}
        <div className="auth-form-side">
          {/* Top navigation row inside form */}
          <div className="auth-form-top-bar">
            <Link to={PATHS.HOME} className="auth-brand-badge">
              <div className="auth-brand-badge-icon">
                <Wrench size={12} />
              </div>
              <span>Nhà Lo 24h</span>
            </Link>

            <Link to={PATHS.HOME} className="auth-inline-back-btn" title="Trở về trang chủ">
              <ArrowLeft size={15} />
              <span>Trang chủ</span>
            </Link>
          </div>

          <div className="auth-form-header">
            <h1 className="auth-form-title">Tạo tài khoản mới 🚀</h1>
            <p className="auth-form-subtitle">
              Điền thông tin của bạn để bắt đầu trải nghiệm dịch vụ tiện lợi
            </p>
          </div>

          {errorMessage && (
            <div className="auth-alert auth-alert-error">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Grid row: Full Name & Phone */}
            <div className="auth-inputs-grid-2">
              <div className="auth-field-group">
                <label htmlFor="reg-name" className="auth-label">
                  Họ và tên
                </label>
                <div className="auth-input-wrapper">
                  <div className="auth-field-icon">
                    <User size={18} />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    className="auth-input"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label htmlFor="reg-phone" className="auth-label">
                  Số điện thoại
                </label>
                <div className="auth-input-wrapper">
                  <div className="auth-field-icon">
                    <Phone size={18} />
                  </div>
                  <input
                    id="reg-phone"
                    type="tel"
                    className="auth-input"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="auth-field-group">
              <label htmlFor="reg-email" className="auth-label">
                Địa chỉ Email
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-field-icon">
                  <Mail size={18} />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  className="auth-input"
                  placeholder="nhalo24h@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Grid row: Password & Confirm Password */}
            <div className="auth-inputs-grid-2">
              <div className="auth-field-group">
                <label htmlFor="reg-password" className="auth-label">
                  Mật khẩu
                </label>
                <div className="auth-input-wrapper">
                  <div className="auth-field-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-field-group">
                <label htmlFor="reg-confirm-password" className="auth-label">
                  Xác nhận lại
                </label>
                <div className="auth-input-wrapper">
                  <div className="auth-field-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Agreement Checkbox */}
            <label className="auth-terms-label">
              <input
                type="checkbox"
                className="auth-checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ marginTop: '2px' }}
              />
              <span>
                Tôi đồng ý với{' '}
                <a href="#terms" onClick={(e) => e.preventDefault()}>Điều khoản dịch vụ</a>{' '}
                và{' '}
                <a href="#privacy" onClick={(e) => e.preventDefault()}>Chính sách bảo mật</a>{' '}
                của Nhà Lo 24h.
              </span>
            </label>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="auth-submit-btn" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="auth-btn-spinner" />
                  <span>Đang khởi tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <span>Đăng ký tài khoản</span>
                  <ArrowRight size={18} className="auth-btn-icon" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">Hoặc tiếp tục với</span>
            <span className="auth-divider-line" />
          </div>

          {/* Google Register Button */}
          <button
            type="button"
            className="auth-social-btn"
            onClick={handleGoogleSignup}
            disabled={isLoading}
          >
            <svg className="auth-google-icon" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Đăng ký với Google</span>
          </button>

          {/* Switch to Login */}
          <div className="auth-switch-prompt">
            Đã có tài khoản?
            <Link to={PATHS.AUTH.LOGIN} className="auth-switch-link">
              Đăng nhập ngay
            </Link>
          </div>

          {/* Bottom Trust Badge */}
          <div className="auth-trust-pill">
            <div className="auth-avatar-stack">
              <img src={provider1Img} alt="Khách hàng" className="auth-avatar-img" />
              <img src={provider2Img} alt="Khách hàng" className="auth-avatar-img" />
              <img src={provider3Img} alt="Khách hàng" className="auth-avatar-img" />
            </div>
            <div className="auth-trust-text">
              Được tin chọn bởi <span className="auth-trust-highlight">50.000+</span> hộ gia đình
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
