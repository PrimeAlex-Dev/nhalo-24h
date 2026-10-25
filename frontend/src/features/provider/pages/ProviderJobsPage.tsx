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
  MessageSquare,
  ClipboardCheck,
  FilePlus2,
  Banknote
} from 'lucide-react';
import { providerJobService, providerWalletService } from '../../../services';
import type { ProviderWalletResponse } from '../../../types/wallet';
import type { ProviderJobItem, ConfirmCashPaymentPayload } from '../../../types/order';
import type { ProviderContextType } from '../../../layouts/ProviderLayout';
import { JobDetailModal } from '../components/JobDetailModal';
import { SubmitQuotationModal } from '../components/SubmitQuotationModal';
import { SurveyAndChangeQuoteModal } from '../components/SurveyAndChangeQuoteModal';
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
  const [wallet, setWallet] = useState<ProviderWalletResponse | null>(null);

  useEffect(() => {
    providerWalletService.getMyWallet().then(setWallet).catch(() => null);
  }, []);

  const handleOpenQuoting = (job: ProviderJobItem) => {
    if (wallet && !wallet.eligibleToAcceptOrders) {
      if (wallet.status === 'FROZEN_COOLING') {
        alert('Bạn đang trong thời hạn 20 ngày chờ rút ký quỹ rời sàn, hệ thống đã khóa gửi báo giá và nhận việc mới.');
        return;
      }
      if (wallet.status === 'DEPOSIT_DEFICIT') {
        alert('Số dư ký quỹ của bạn đang dưới định mức 2.000.000 đ. Vui lòng liên hệ Admin nạp bù cọc để tiếp tục nhận việc.');
        return;
      }
      alert('Tài khoản của bạn hiện đang bị khóa nhận đơn mới.');
      return;
    }
    setQuotingJob(job);
  };

  // Pagination State (5 jobs per page)
  const [page, setPage] = useState(0);
  const [pageSize] = useState(5);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });

  // Modals state
  const [selectedJob, setSelectedJob] = useState<ProviderJobItem | null>(null);
  const [quotingJob, setQuotingJob] = useState<ProviderJobItem | null>(null);
  const [surveyOrChangeModal, setSurveyOrChangeModal] = useState<{
    job: ProviderJobItem;
    mode: 'SURVEY_FINAL' | 'IN_PROGRESS_CHANGE';
  } | null>(null);
  const [completingJob, setCompletingJob] = useState<{
    job: ProviderJobItem;
    mode: 'COMPLETE_JOB' | 'CONFIRM_CASH';
  } | null>(null);
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
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleOpenRejectModal = (job: ProviderJobItem) => {
    setSelectedJob(null);
    setRejectingJob(job);
  };

  const handleConfirmRejectRequest = async (job: ProviderJobItem, reason: string) => {
    if (job.requestStatus === 'ACCEPTED') {
      await providerJobService.cancelOrder(job.orderId, reason);
      showNotice('Đã xác nhận hủy công việc theo thỏa thuận.');
    } else {
      await providerJobService.rejectRequest(job.requestId, { rejectReason: reason });
      showNotice('Đã từ chối yêu cầu nhận việc.');
    }
    setRejectingJob(null);
    loadJobs();
    if (refreshIncomingRequestsCount) {
      refreshIncomingRequestsCount();
    }
  };

  const handleOpenCompleteModal = (job: ProviderJobItem, mode: 'COMPLETE_JOB' | 'CONFIRM_CASH' = 'COMPLETE_JOB') => {
    setSelectedJob(null);
    setCompletingJob({ job, mode });
  };

  const handleConfirmCompleteOrder = async (orderId: string, completionNote?: string) => {
    await providerJobService.completeOrder(orderId, { completionNote });
    showNotice('Đã gửi yêu cầu nghiệm thu! Chờ khách hàng xác nhận và thanh toán.');
    setCompletingJob(null);
    loadJobs();
  };

  const handleConfirmCashPayment = async (orderId: string, payload: ConfirmCashPaymentPayload) => {
    await providerJobService.confirmCashPayment(orderId, payload);
    showNotice(
      payload.confirmed
        ? 'Đã xác nhận thu tiền mặt thành công! Đơn hàng đã hoàn tất.'
        : 'Đã gửi báo cáo chênh lệch tiền mặt lên Quản trị viên để đối soát.'
    );
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
              Nhận yêu cầu báo giá, thực hiện khảo sát thực tế, cập nhật vật tư và đối soát thu nhập minh bạch.
            </p>
          </div>
        </div>

        {wallet && !wallet.eligibleToAcceptOrders && (
          <div
            style={{
              padding: '0.85rem 1.15rem',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              background: wallet.status === 'FROZEN_COOLING' ? '#fef3c7' : '#fee2e2',
              border: `1px solid ${wallet.status === 'FROZEN_COOLING' ? '#fde68a' : '#fca5a5'}`,
              color: wallet.status === 'FROZEN_COOLING' ? '#92400e' : '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.86rem',
              fontWeight: 600,
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>
              {wallet.status === 'FROZEN_COOLING'
                ? 'Bạn đang trong thời hạn 20 ngày chờ rút ký quỹ rời sàn. Hệ thống tạm khóa nhận việc và gửi báo giá mới để đảm bảo nghĩa vụ bảo hành cho khách hàng.'
                : 'Số dư ký quỹ của bạn đang dưới định mức 2.000.000 đ. Vui lòng nạp bù cọc để tiếp tục nhận việc mới.'}
            </span>
          </div>
        )}

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
            <span>Việc đang xử lý (Khảo sát / Thi công / Thu tiền)</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => handleTabChange('completed')}
          >
            <span>Đã kết thúc</span>
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
                ? 'Bạn không có công việc nào đang khảo sát, thi công hoặc chờ thanh toán.'
                : 'Bạn chưa hoàn thành công việc nào.'}
            </p>
          </div>
        ) : (
          <>
            <div className="jobs-list">
            {jobs.map((job) => {
              const isAssignedToMe = job.requestStatus === 'ACCEPTED';
              const isAwaitingSurvey = isAssignedToMe && job.orderStatus === 'AWAITING_SURVEY';
              const isAwaitingCustomerApproval = isAssignedToMe && job.orderStatus === 'AWAITING_CUSTOMER_APPROVAL';
              const isMyJobInProgress = isAssignedToMe && job.orderStatus === 'IN_PROGRESS';
              const isAwaitingCompletionConfirm = isAssignedToMe && job.orderStatus === 'AWAITING_COMPLETION_CONFIRMATION';
              const isDeclinedAfterSurvey = isAssignedToMe && job.orderStatus === 'DECLINED_AFTER_SURVEY';
              const isMyJobCompleted = isAssignedToMe && job.orderStatus === 'COMPLETED';
              const isCashPendingConfirmation = isAssignedToMe && job.paymentStatus === 'CASH_PENDING_CONFIRMATION';
              const isPaymentDisputed = isAssignedToMe && job.paymentStatus === 'PAYMENT_DISPUTED';

              const isAssignedToOther =
                job.requestStatus === 'CANCELED' &&
                job.orderStatus !== 'CANCELED' &&
                job.orderStatus !== 'PENDING_PROVIDER';
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

                    {isCashPendingConfirmation ? (
                      <span className="urgency-badge quoted" style={{ background: '#fef08a', color: '#854d0e' }}>
                        Khách đã trả tiền mặt ({(job.customerDeclaredAmount ?? 0).toLocaleString('vi-VN')} đ) — Chờ bạn xác nhận
                      </span>
                    ) : isPaymentDisputed ? (
                      <span className="urgency-badge rejected">Đang chờ Admin đối soát thanh toán</span>
                    ) : isAwaitingSurvey ? (
                      <span className="urgency-badge in-progress">Chờ bạn khảo sát & gửi báo giá cuối</span>
                    ) : isAwaitingCustomerApproval ? (
                      <span className="urgency-badge quoted">Đã gửi báo giá khảo sát — Chờ khách duyệt</span>
                    ) : isMyJobInProgress ? (
                      <span className="urgency-badge in-progress">Đang thi công sửa chữa</span>
                    ) : isAwaitingCompletionConfirm ? (
                      <span className="urgency-badge quoted">Chờ khách nghiệm thu & Thanh toán</span>
                    ) : isDeclinedAfterSurvey ? (
                      <span className="urgency-badge assigned-other">
                        Dừng sau khảo sát (Phí KS/Di chuyển: {(job.quotedPrice ?? 0).toLocaleString('vi-VN')} đ)
                      </span>
                    ) : isMyJobCompleted ? (
                      <span className="urgency-badge completed">Đã hoàn thành & Quyết toán</span>
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
                        {isAssignedToMe
                          ? 'Tổng hóa đơn:'
                          : isAssignedToOther
                          ? (job.quotedPrice ? 'Giá bạn đã báo:' : 'Trạng thái:')
                          : isQuoted
                          ? 'Giá dự kiến đã báo:'
                          : 'Báo giá:'}
                      </span>
                      <span className="price-number">
                        {isAssignedToOther && !job.quotedPrice
                          ? 'Yêu cầu đã đóng'
                          : job.quotedPrice !== undefined && job.quotedPrice !== null
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenQuoting(job);
                          }}
                        >
                          <DollarSign size={16} />
                          <span>Báo giá</span>
                        </button>
                      )}

                      {(isAwaitingSurvey || isAwaitingCustomerApproval) && (
                        <button
                          type="button"
                          className="btn-quote-feed"
                          onClick={() => setSurveyOrChangeModal({ job, mode: 'SURVEY_FINAL' })}
                        >
                          <ClipboardCheck size={16} />
                          <span>{isAwaitingSurvey ? 'Báo giá khảo sát' : 'Cập nhật giá KS'}</span>
                        </button>
                      )}

                      {isMyJobInProgress && (
                        <>
                          <button
                            type="button"
                            className="btn-detail-feed"
                            onClick={() => setSurveyOrChangeModal({ job, mode: 'IN_PROGRESS_CHANGE' })}
                            title="Gửi yêu cầu phát sinh vật tư / công việc"
                          >
                            <FilePlus2 size={15} />
                            <span>Báo phát sinh</span>
                          </button>
                          <button
                            type="button"
                            className="btn-finish-feed"
                            onClick={() => handleOpenCompleteModal(job, 'COMPLETE_JOB')}
                          >
                            <CheckCircle2 size={16} />
                            <span>Báo hoàn thành</span>
                          </button>
                        </>
                      )}

                      {isCashPendingConfirmation && (
                        <button
                          type="button"
                          className="btn-finish-feed"
                          style={{ background: '#ca8a04' }}
                          onClick={() => handleOpenCompleteModal(job, 'CONFIRM_CASH')}
                        >
                          <Banknote size={16} />
                          <span>Xác nhận tiền mặt</span>
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
            handleOpenQuoting(job);
          }}
          onRejectRequest={handleOpenRejectModal}
          onOpenChat={(job) => {
            setChatJob(job);
          }}
          onCompleteOrder={(job) => handleOpenCompleteModal(job, 'COMPLETE_JOB')}
          onOpenSurveyOrChangeModal={(job, mode) => {
            setSelectedJob(null);
            setSurveyOrChangeModal({ job, mode });
          }}
          onOpenConfirmCashModal={(job) => handleOpenCompleteModal(job, 'CONFIRM_CASH')}
        />
      )}

      {/* Modal Hoàn thành công việc / Xác nhận tiền mặt */}
      {completingJob && (
        <CompleteJobModal
          isOpen={!!completingJob}
          onClose={() => setCompletingJob(null)}
          job={completingJob.job}
          mode={completingJob.mode}
          onConfirmComplete={handleConfirmCompleteOrder}
          onConfirmCash={handleConfirmCashPayment}
        />
      )}

      {/* Modal Báo giá sau khảo sát / Báo phát sinh vật tư */}
      {surveyOrChangeModal && (
        <SurveyAndChangeQuoteModal
          isOpen={!!surveyOrChangeModal}
          onClose={() => setSurveyOrChangeModal(null)}
          job={surveyOrChangeModal.job}
          mode={surveyOrChangeModal.mode}
          onSuccess={() => {
            showNotice(
              surveyOrChangeModal.mode === 'SURVEY_FINAL'
                ? 'Đã gửi báo giá cuối sau khảo sát! Chờ khách hàng xác nhận.'
                : 'Đã gửi yêu cầu phát sinh vật tư/công việc! Chờ khách hàng duyệt.'
            );
            loadJobs();
          }}
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

      {/* Modal Gửi báo giá ban đầu */}
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
