import './StatsSection.css';

const statsData = [
  {
    value: '15+',
    label: 'Phút',
    description: 'Thời gian thợ phản hồi trung bình',
  },
  {
    value: '5.000+',
    label: 'Thợ & Đối tác',
    description: 'Đã được xác minh danh tính và tay nghề',
  },
  {
    value: '98.6%',
    label: 'Hài lòng',
    description: 'Tỷ lệ khách hàng đánh giá 5 sao',
  }
];

export function StatsSection() {
  return (
    <section className="section stats-section">
      <div className="container">
        <div className="stats-header">
          <h2 className="stats-title">Nền tảng dịch vụ tại nhà tin cậy cho hàng triệu gia đình</h2>
        </div>
        
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value-group">
                <span className="stat-number">{stat.value}</span>
                {stat.label !== 'Phút' && <span className="stat-label-text">{stat.label}</span>}
                {stat.label === 'Phút' && <span className="stat-label-inline">{stat.label}</span>}
              </div>
              <p className="stat-description">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
