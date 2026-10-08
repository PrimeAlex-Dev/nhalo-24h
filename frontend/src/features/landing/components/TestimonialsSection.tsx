import './TestimonialsSection.css';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import testimonialImg from '../../../assets/testimonial_image.jpg';

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="section testimonials-section">
      <div className="container">
        <div className="testimonials-header">
          <h2 className="section-title">Khách hàng nói gì về chúng tôi</h2>
        </div>
        
        <div className="testimonials-container">
          <div className="testimonials-proof">
            <div className="avatars-group">
              <div className="avatar"></div>
              <div className="avatar"></div>
              <div className="avatar"></div>
              <div className="avatar-more">+20k</div>
            </div>
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
              ))}
            </div>
            <p className="proof-text">
              Hơn <strong>20.000+</strong> hộ gia đình đã tin dùng
            </p>
          </div>
          
          <div className="testimonials-image">
            <img src={testimonialImg} alt="Khách hàng hài lòng" className="testimonial-image-actual" />
          </div>
          
          <div className="testimonials-content">
            <div className="quote-mark">"</div>
            <p className="testimonial-text">
              Thợ đến đúng hẹn, lịch sự, kiểm tra báo giá trước khi làm nên tôi rất an tâm. Quá trình làm việc nhanh gọn và sạch sẽ. Sẽ tiếp tục ủng hộ Nhà Lo 24h khi cần.
            </p>
            <div className="testimonial-author">
              <h4 className="author-name">Anh Minh Nguyễn</h4>
              <p className="author-role">Chủ nhà tại Quận 7, TP.HCM</p>
            </div>
            
            <div className="testimonial-controls">
              <button className="control-btn"><ChevronLeft size={20} /></button>
              <button className="control-btn active"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
