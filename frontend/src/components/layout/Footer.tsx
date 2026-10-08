import './Footer.css';
import { Button } from '../common/Button';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <h3 className="footer-logo">Nhà Lo 24h</h3>
            <p className="footer-desc">
              Nền tảng kết nối dịch vụ tại nhà uy tín hàng đầu, giúp bạn giải quyết mọi sự cố nhanh chóng và an tâm.
            </p>
            <div className="footer-newsletter">
              <input type="email" placeholder="Nhập email nhận ưu đãi" className="newsletter-input" />
              <Button size="sm">Đăng ký</Button>
            </div>
          </div>
          
          <div className="footer-links-group">
            <h4 className="footer-title">Khám phá dịch vụ</h4>
            <ul className="footer-links">
              <li><a href="#">Sửa chữa điện nước</a></li>
              <li><a href="#">Bảo trì máy lạnh</a></li>
              <li><a href="#">Sửa khóa, thay khóa</a></li>
              <li><a href="#">Thông tắc nghẹt</a></li>
              <li><a href="#">Cứu hộ khẩn cấp</a></li>
            </ul>
          </div>
          
          <div className="footer-links-group">
            <h4 className="footer-title">Về Nhà Lo 24h</h4>
            <ul className="footer-links">
              <li><a href="#">Giới thiệu</a></li>
              <li><a href="#">Blog cẩm nang</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Điều khoản sử dụng</a></li>
            </ul>
          </div>
          
          <div className="footer-links-group">
            <h4 className="footer-title">Liên hệ</h4>
            <ul className="footer-links">
              <li><a href="#">Trở thành đối tác thợ</a></li>
              <li><a href="#">Hotline: 1900 xxxx</a></li>
              <li><a href="#">Email: hotro@nhalo24h.vn</a></li>
            </ul>
            <div className="footer-social">
              <a href="#" className="social-icon">F</a>
              <a href="#" className="social-icon">Z</a>
              <a href="#" className="social-icon">Y</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-giant-brand">Nhà Lo 24h</div>
          <p className="footer-copyright">
            &copy; {currentYear} Nhalo24h. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
