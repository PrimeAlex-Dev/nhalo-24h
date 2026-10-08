import './BlogSection.css';
import { ArrowUpRight } from 'lucide-react';

const posts = [
  {
    id: 1,
    title: '5 Dấu hiệu nhận biết hệ thống điện quá tải cần gọi thợ ngay',
    category: 'An toàn điện',
  },
  {
    id: 2,
    title: 'Mẹo vệ sinh và bảo dưỡng máy lạnh tại nhà giúp tiết kiệm điện',
    category: 'Mẹo hay',
  },
  {
    id: 3,
    title: 'Cách tự kiểm tra và xử lý nhanh sự cố rò rỉ nước cơ bản',
    category: 'Hướng dẫn',
  }
];

export function BlogSection() {
  return (
    <section className="section blog-section">
      <div className="container">
        <div className="blog-header">
          <h2 className="section-title">Góc chia sẻ & Cẩm nang</h2>
          <p className="section-subtitle">Những kiến thức hữu ích giúp bạn chăm sóc ngôi nhà tốt hơn</p>
        </div>
        
        <div className="blog-grid">
          {posts.map((post) => (
            <a href={`#blog-${post.id}`} key={post.id} className="blog-card">
              <div className="blog-image-placeholder">
                <span>Hình minh họa bài viết</span>
              </div>
              <div className="blog-content">
                <h3 className="blog-title">{post.title}</h3>
                <div className="blog-footer">
                  <span className="blog-readmore">Đọc thêm</span>
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
