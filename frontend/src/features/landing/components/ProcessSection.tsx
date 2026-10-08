import './ProcessSection.css';
import { Button } from '../../../components/common/Button';
import { ArrowUpRight, Search, FileText, CheckCircle } from 'lucide-react';
import processImg from '../../../assets/process_image.jpg';

const processSteps = [
  {
    icon: <Search className="step-icon" size={24} />,
    title: 'Mô tả vấn đề',
    description: 'Chọn dịch vụ hoặc ghi ngắn gọn sự cố cần xử lý (vd: máy lạnh không mát, chập điện). Hệ thống sẽ tìm thợ phù hợp nhất.',
  },
  {
    icon: <FileText className="step-icon" size={24} />,
    title: 'Báo giá & Xác nhận',
    description: 'Nhận báo giá minh bạch trước khi làm. Bạn có thể xem hồ sơ, đánh giá thợ để an tâm lựa chọn.',
  },
  {
    icon: <CheckCircle className="step-icon" size={24} />,
    title: 'Nghiệm thu & Bảo hành',
    description: 'Chỉ thanh toán khi công việc hoàn tất và bạn hài lòng. Mọi dịch vụ đều đi kèm cam kết bảo hành rõ ràng.',
  }
];

export function ProcessSection() {
  return (
    <section id="process" className="section process-section">
      <div className="container process-container">
        <div className="process-intro">
          <h2 className="process-title">3 Bước đơn giản để ngôi nhà được chăm sóc chu đáo</h2>
          <p className="process-subtitle">
            Trải nghiệm gọi thợ chưa bao giờ dễ dàng, minh bạch và an tâm đến thế.
          </p>
          <Button icon={<ArrowUpRight size={18} />} variant="primary" className="process-btn">
            Đặt lịch kiểm tra
          </Button>
        </div>
        
        <div className="process-image-wrapper">
          <img src={processImg} alt="Quy trình đặt lịch" className="process-image-actual" />
        </div>
        
        <div className="process-steps">
          {processSteps.map((step, index) => (
            <div key={index} className="step-item">
              <div className="step-icon-wrapper">
                {step.icon}
              </div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
