import './ServicesSection.css';

const services = [
  {
    id: 1,
    title: 'Điện nước dân dụng',
    description: 'Khắc phục rò rỉ, chập điện, lắp đặt thiết bị',
    tag: 'Phổ biến',
    tagColor: 'primary'
  },
  {
    id: 2,
    title: 'Điện lạnh & Điện máy',
    description: 'Vệ sinh máy lạnh, sửa tủ lạnh, máy giặt',
    tag: 'Mùa nóng',
    tagColor: 'accent'
  },
  {
    id: 3,
    title: 'Bảo trì & Khóa cửa',
    description: 'Khóa thông minh, cửa cuốn, nhôm kính',
    tag: 'An ninh',
    tagColor: 'secondary'
  },
  {
    id: 4,
    title: 'Dọn Dẹp Vệ Sinh',
    description: 'Hỗ trợ Dọn Nhà, Vệ Sinh',
    tag: 'Vệ Sinh',
    tagColor: 'primary'
  }
];

export function ServicesSection() {
  return (
    <section id="services" className="section services-section">
      <div className="container">
        <div className="services-header">
          <h2 className="section-title">Danh mục dịch vụ đa dạng</h2>
          <p className="section-subtitle">Giải pháp toàn diện cho mọi vấn đề trong ngôi nhà của bạn</p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-image-placeholder">
                <span>Hình ảnh {service.title}</span>
              </div>
              <div className="service-content">
                <span className={`service-tag tag-${service.tagColor}`}>
                  {service.tag}
                </span>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
