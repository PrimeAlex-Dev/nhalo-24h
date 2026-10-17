import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  AlertCircle,
  Wrench
} from 'lucide-react';
import { PATHS } from '../../routes/paths';
import provider1Img from '../../assets/provider_1.png';
import provider2Img from '../../assets/provider_2.png';
import provider3Img from '../../assets/provider_3.png';
import { useAuth } from './useAuth';
import { ApiError } from '../../services/apiClient';
import './Auth.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email của bạn');
      return;
    }

    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    setIsLoading(true);

    try {
      const user = await login({
        email: identifier.trim(),
        password,
      });

      // Điều hướng thông minh theo vai trò
      if (user.role === 'ADMIN') {
        navigate(PATHS.ADMIN.USERS);
      } else if (user.role === 'PROVIDER') {
        navigate(PATHS.PROVIDER.ROOT);
      } else {
        navigate(PATHS.CUSTOMER.ROOT);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.details && err.details.length > 0) {
          setErrorMessage(err.details.map((d) => d.message).join('. '));
        } else {
          setErrorMessage(err.message || 'Email hoặc mật khẩu không chính xác');
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Đăng nhập thất bại, vui lòng kiểm tra lại thông tin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setErrorMessage('Chức năng đăng nhập Google đang được phát triển');
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
              <span>Dịch vụ gia đình chuẩn 5 sao</span>
            </div>

            <h2 className="auth-hero-title">
              Chăm sóc & sửa chữa ngôi nhà <span>thông minh 24/7</span>
            </h2>

            <p className="auth-hero-desc">
              Kết nối nhanh với thợ kỹ thuật lành nghề gần bạn nhất. Báo giá minh bạch, an tâm tuyệt đối với chính sách bảo hành chu đáo.
            </p>

            <div className="auth-hero-features">
              <div className="auth-feature-card">
                <div className="auth-feature-icon-wrapper">
                  <Zap size={20} />
                </div>
                <div className="auth-feature-text">
                  <h4>Có mặt siêu tốc sau 15–30 phút</h4>
                  <p>Hỗ trợ khẩn cấp điện, nước, điện lạnh mọi lúc</p>
                </div>
              </div>

              <div className="auth-feature-card">
                <div className="auth-feature-icon-wrapper">
                  <ShieldCheck size={20} />
                </div>
                <div className="auth-feature-text">
                  <h4>100% thợ xác minh lý lịch</h4>
                  <p>Được kiểm tra tay nghề và cam kết giá niêm yết</p>
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

        {/* Right Column: Sign In Form */}
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
            <h1 className="auth-form-title">Chào mừng trở lại! 👋</h1>
            <p className="auth-form-subtitle">
              Đăng nhập để đặt lịch và quản lý dịch vụ sửa chữa của bạn
            </p>
          </div>

          {errorMessage && (
            <div className="auth-alert auth-alert-error" role="alert" aria-live="assertive">
              <AlertCircle size={18} className="auth-alert-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Identifier input (Email) */}
            <div className="auth-field-group">
              <label htmlFor="login-identifier" className="auth-label">
                Địa chỉ Email
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-field-icon">
                  <Mail size={18} />
                </div>
                <input
                  id="login-identifier"
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div className="auth-field-group">
              <label htmlFor="login-password" className="auth-label">
                Mật khẩu
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-field-icon">
                  <Lock size={18} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoComplete="current-password"
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

            {/* Remember & Forgot Password */}
            <div className="auth-options-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>

              <Link to={PATHS.AUTH.FORGOT_PASSWORD} className="auth-forgot-link">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="auth-submit-btn" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="auth-btn-spinner" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
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

          {/* Google Login Button */}
          <button
            type="button"
            className="auth-social-btn"
            onClick={handleGoogleLogin}
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
            <span>Đăng nhập với Google</span>
          </button>

          {/* Switch to Register */}
          <div className="auth-switch-prompt">
            Chưa có tài khoản?
            <Link to={PATHS.AUTH.REGISTER} className="auth-switch-link">
              Đăng ký ngay
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
