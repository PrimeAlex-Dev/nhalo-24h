import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle2, 
  Wrench, 
  Inbox, 
  Loader2, 
  AlertCircle,
  DollarSign,
  MessageSquare
} from 'lucide-react';
import { providerJobService } from '../../../services';
import type { ProviderJobItem } from '../../../types/order';
import type { ProviderContextType } from '../../../layouts/ProviderLayout';
import { JobDetailModal } from '../components/JobDetailModal';
import { SubmitQuotationModal } from '../components/SubmitQuotationModal';
import { CompleteJobModal } from '../components/CompleteJobModal';
import { RejectRequestModal } from '../components/RejectRequestModal';
import { OrderChatDrawer } from '../../order/components/OrderChatDrawer';
import { Pagination } from '../../../components/common/Pagination';
import './ProviderJobsPage.css';

type ProviderTab = 'requests' | 'in_progress' | 'completed';

export function ProviderJobsPage() {
  const { refreshIncomingRequestsCount } = useOutletContext<ProviderContextType>() || {};
  const [activeTab, setActiveTab] = useState<ProviderTab>('requests');
  const [jobs, setJobs] = useState<ProviderJobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Pagination State (5 jobs per page)
  const [page, setPage] = useState(0);
  const [pageSize] = useState(5);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });

  // Modals state
  const [selectedJob, setSelectedJob] = useState<ProviderJobItem | null>(null);
  const [quotingJob, setQuotingJob] = useState<ProviderJobItem | null>(null);
  const [completingJob, setCompletingJob] = useState<ProviderJobItem | null>(null);
  const [rejectingJob, setRejectingJob] = useState<ProviderJobItem | null>(null);
  const [chatJob, setChatJob] = useState<ProviderJobItem | null>(null);

  useEffect(() => {
    loadJobs(false, page);

    // Auto-poll jobs every 12 seconds
    const intervalTimer = setInterval(() => {
      loadJobs(true, page);
    }, 12000);

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        loadJobs(true, page);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(intervalTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [activeTab, page]);

  const loadJobs = async (silent = false, pageToLoad = page) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setErrorMsg(null);

      if (activeTab === 'requests') {
        const res = await providerJobService.getIncomingRequests(undefined, pageToLoad, pageSize);
        setJobs(res.content);
        setPageInfo({ totalPages: res.totalPages, totalElements: res.totalElements });
      } else if (activeTab === 'in_progress') {
        const res = await providerJobService.getAssignedOrders('IN_PROGRESS', pageToLoad, pageSize);
        setJobs(res.content);
        setPageInfo({ totalPages: res.totalPages, totalElements: res.totalElements });
      } else {
        const res = await providerJobService.getAssignedOrders('COMPLETED', pageToLoad, pageSize);
        setJobs(res.content);
        setPageInfo({ totalPages: res.totalPages, totalElements: res.totalElements });
      }
      if (refreshIncomingRequestsCount) {
        refreshIncomingRequestsCount();
      }
    } catch (err: any) {
      if (!silent) {
        setErrorMsg(err.message || 'Không thể tải danh sách công việc.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleTabChange = (newTab: ProviderTab) => {
    setActiveTab(newTab);
    setPage(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleOpenRejectModal = (job: ProviderJobItem) => {
    setSelectedJob(null);
    setRejectingJob(job);
  };

  const handleConfirmRejectRequest = async (job: ProviderJobItem, reason: string) => {
    await providerJobService.rejectRequest(job.requestId, { rejectReason: reason });
    showNotice('Đã từ chối yêu cầu nhận việc.');
    setRejectingJob(null);
    loadJobs();
    if (refreshIncomingRequestsCount) {
      refreshIncomingRequestsCount();
    }
  };

  const handleOpenCompleteModal = (job: ProviderJobItem) => {
    setSelectedJob(null);
    setCompletingJob(job);
  };

  const handleConfirmCompleteOrder = async (orderId: string) => {
    await providerJobService.completeOrder(orderId);
    showNotice('Chúc mừng bạn đã hoàn thành công việc và thu tiền thành công!');
    setCompletingJob(null);
    loadJobs();
  };

  return (
    <div className="provider-jobs-page">
      {/* Toast Alert */}
      {actionNotice && (
        <div className="action-notice-toast">
          <CheckCircle2 size={18} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
        {/* Header */}
        <div className="provider-jobs-header">
          <div className="header-info">
            <h1 className="header-title">Quản lý Công việc</h1>
            <p className="header-sub">
              Nhận các yêu cầu báo giá mới, theo dõi công việc đang làm và xem lịch sử thu nhập.
            </p>
          </div>
        </div>

        {/* Status Tab Navigation */}
        <div className="jobs-tab-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => handleTabChange('requests')}
          >
            <span>Yêu cầu mới / Báo giá</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'in_progress' ? 'active' : ''}`}
            onClick={() => handleTabChange('in_progress')}
          >
            <span>Việc đang làm</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => handleTabChange('completed')}
          >
            <span>Đã hoàn thành</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="jobs-error-alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Jobs Feed List */}
        {loading ? (
          <div className="jobs-loading-container">
            <Loader2 size={36} className="spin-icon text-blue" />
            <p>Đang tải danh sách công việc...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon-wrapper">
              <Inbox size={42} strokeWidth={1.5} />
            </div>
            <h3 className="empty-title">Không có công việc nào</h3>
            <p className="empty-desc">
              {activeTab === 'requests'
                ? 'Hiện tại chưa có yêu cầu báo giá mới nào được gửi tới bạn.'
                : activeTab === 'in_progress'
                ? 'Bạn không có công việc nào đang thực hiện.'
                : 'Bạn chưa hoàn thành công việc nào.'}
            </p>
          </div>
        ) : (
          <>
            <div className="jobs-list">
            {jobs.map((job) => {
              const isMyJobInProgress = job.requestStatus === 'ACCEPTED' && job.orderStatus === 'IN_PROGRESS';
              const isMyJobCompleted = job.requestStatus === 'ACCEPTED' && job.orderStatus === 'COMPLETED';
              const isAssignedToOther = job.requestStatus === 'CANCELED' && (job.orderStatus === 'IN_PROGRESS' || job.orderStatus === 'COMPLETED');
              const isOrderCanceled = job.orderStatus === 'CANCELED';
              const isRejected = job.requestStatus === 'REJECTED';
              const isQuoted = job.requestStatus === 'QUOTED' && job.orderStatus === 'PENDING_PROVIDER';
              const isPending = job.requestStatus === 'PENDING_RESPONSE' && job.orderStatus === 'PENDING_PROVIDER';

              return (
                <div key={job.requestId || job.orderId} className={`job-feed-card ${isAssignedToOther ? 'assigned-other-card' : ''}`}>
                  {/* Card Top: Category + Status Badge */}
                  <div className="card-top-row">
                    <div className="category-chip">
                      <Wrench size={13} />
                      <span>{job.categoryName || 'Sửa chữa'}</span>
                      <span className="job-code-chip">· {job.orderCode}</span>
                    </div>

                    {isMyJobInProgress ? (
                      <span className="urgency-badge in-progress">Đang làm</span>
                    ) : isMyJobCompleted ? (
                      <span className="urgency-badge completed">Đã xong</span>
                    ) : isAssignedToOther ? (
                      <span className="urgency-badge assigned-other">Đơn đã có người nhận</span>
                    ) : isOrderCanceled ? (
                      <span className="urgency-badge canceled">Đơn đã bị hủy</span>
                    ) : isRejected ? (
                      <span className="urgency-badge rejected">Đã từ chối</span>
                    ) : isQuoted ? (
                      <span className="urgency-badge quoted">Đã báo giá: {job.quotedPrice?.toLocaleString('vi-VN')} đ</span>
                    ) : (
                      <span className="urgency-badge pending">Chờ bạn báo giá</span>
                    )}
                  </div>

                  {/* Job Title & Description */}
                  <h3 className="card-job-title" onClick={() => setSelectedJob(job)}>
                    {job.title}
                  </h3>
                  <p className="card-desc-snippet">{job.description}</p>

                  {/* Customer & Address snippet */}
                  <div className="card-info-grid">
                    <div className="info-item">
                      <MapPin size={15} className="info-icon" />
                      <span className="info-text">{job.addressSnapshot}</span>
                    </div>

                    <div className="info-item">
                      <Clock size={15} className="info-icon" />
                      <span className="info-text">
                        {new Date(job.expectedScheduleTime).toLocaleDateString('vi-VN')} {new Date(job.expectedScheduleTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="info-item">
                      <Phone size={15} className="info-icon" />
                      <span className="info-text">Khách: {job.customerName} ({job.customerPhone || '***-***'})</span>
                    </div>
                  </div>

                  {/* Images preview if any */}
                  {job.images && job.images.length > 0 && (
                    <div className="card-images-strip">
                      {job.images.slice(0, 3).map((imgUrl, i) => (
                        <img key={i} src={imgUrl} alt="Ảnh sự cố" className="card-thumb" />
                      ))}
                      {job.images.length > 3 && (
                        <span className="card-thumb-more">+{job.images.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Card Bottom: Earnings + Action buttons */}
                  <div className="card-bottom-row">
                    <div className="price-estimate-block">
                      <span className="price-label">
                        {isMyJobInProgress || isMyJobCompleted
                          ? 'Giá chốt:'
                          : isAssignedToOther
                          ? (job.quotedPrice ? 'Giá bạn đã báo:' : 'Trạng thái:')
                          : isQuoted
                          ? 'Giá đã báo:'
                          : 'Báo giá:'}
                      </span>
                      <span className="price-number">
                        {isAssignedToOther && !job.quotedPrice
                          ? 'Yêu cầu đã đóng'
                          : job.quotedPrice
                          ? `${job.quotedPrice.toLocaleString('vi-VN')} đ`
                          : 'Chưa báo giá'}
                      </span>
                    </div>

                    <div className="action-buttons-group">
                      <button
                        type="button"
                        className="btn-chat-feed"
                        onClick={() => setChatJob(job)}
                        title="Chat với khách"
                      >
                        <MessageSquare size={16} />
                        <span>Chat</span>
                      </button>

                      {isPending && (
                        <button
                          type="button"
                          className="btn-quote-feed"
                          onClick={() => setQuotingJob(job)}
                        >
                          <DollarSign size={16} />
                          <span>Báo giá</span>
                        </button>
                      )}

                      {isMyJobInProgress && (
                        <button
                          type="button"
                          className="btn-finish-feed"
                          onClick={() => handleOpenCompleteModal(job)}
                        >
                          <CheckCircle2 size={16} />
                          <span>Hoàn thành</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-detail-feed"
                        onClick={() => setSelectedJob(job)}
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={page}
            totalPages={pageInfo.totalPages}
            totalElements={pageInfo.totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            itemName="công việc"
            disabled={loading}
          />
        </>
        )}
      </div>

      {/* Modal Chi tiết công việc */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onOpenQuoteModal={(job) => {
            setSelectedJob(null);
            setQuotingJob(job);
          }}
          onRejectRequest={handleOpenRejectModal}
          onOpenChat={(job) => {
            setChatJob(job);
          }}
          onCompleteOrder={handleOpenCompleteModal}
        />
      )}

      {/* Modal Hoàn thành công việc */}
      {completingJob && (
        <CompleteJobModal
          isOpen={!!completingJob}
          onClose={() => setCompletingJob(null)}
          job={completingJob}
          onConfirmComplete={handleConfirmCompleteOrder}
        />
      )}

      {/* Modal Từ chối yêu cầu nhận việc */}
      {rejectingJob && (
        <RejectRequestModal
          isOpen={!!rejectingJob}
          onClose={() => setRejectingJob(null)}
          job={rejectingJob}
          onConfirmReject={handleConfirmRejectRequest}
        />
      )}

      {/* Modal Gửi báo giá */}
      {quotingJob && (
        <SubmitQuotationModal
          isOpen={!!quotingJob}
          onClose={() => setQuotingJob(null)}
          requestId={quotingJob?.requestId || null}
          orderTitle={quotingJob?.title}
          onSuccess={() => {
            showNotice('Đã gửi báo giá thành công tới khách hàng!');
            loadJobs();
            if (refreshIncomingRequestsCount) {
              refreshIncomingRequestsCount();
            }
          }}
        />
      )}

      {/* Khung Chat với khách hàng */}
      <OrderChatDrawer
        isOpen={!!chatJob}
        onClose={() => setChatJob(null)}
        requestId={chatJob?.requestId || null}
        partnerName={chatJob?.customerName || 'Khách hàng'}
        orderTitle={chatJob?.title}
        quotedPrice={chatJob?.quotedPrice}
        currentUserRole="PROVIDER"
      />
    </div>
  );
}

export default ProviderJobsPage;
