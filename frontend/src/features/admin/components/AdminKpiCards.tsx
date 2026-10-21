import { Users, Wrench, Package, Clock, UserCheck, TrendingUp, TrendingDown } from 'lucide-react';
import type { AdminKpiMetric } from '../types/admin';
import './AdminKpiCards.css';

interface AdminKpiCardsProps {
  metrics: AdminKpiMetric[];
  onCardClick?: (metricId: string) => void;
}

export function AdminKpiCards({ metrics, onCardClick }: AdminKpiCardsProps) {
  const getIcon = (iconName: AdminKpiMetric['icon']) => {
    switch (iconName) {
      case 'users':
        return <Users size={22} className="kpi-icon" />;
      case 'wrench':
        return <Wrench size={22} className="kpi-icon" />;
      case 'package':
        return <Package size={22} className="kpi-icon" />;
      case 'clock':
        return <Clock size={22} className="kpi-icon" />;
      case 'user-check':
        return <UserCheck size={22} className="kpi-icon" />;
      default:
        return <Package size={22} className="kpi-icon" />;
    }
  };

  return (
    <div className="admin-kpi-grid">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className={`admin-kpi-card variant-${metric.statusVariant}`}
          onClick={() => onCardClick?.(metric.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onCardClick?.(metric.id);
            }
          }}
        >
          <div className="kpi-card-header">
            <span className="kpi-card-title">{metric.title}</span>
            <div className={`kpi-icon-bubble bubble-${metric.statusVariant}`}>
              {getIcon(metric.icon)}
            </div>
          </div>

          <div className="kpi-card-body">
            <div className="kpi-card-value-row">
              <span className="kpi-card-value">{metric.formattedValue}</span>
              {metric.unit && <span className="kpi-card-unit">{metric.unit}</span>}
            </div>

            <div className="kpi-card-trend-row">
              <span className={`kpi-trend-badge trend-${metric.changeType}`}>
                {metric.changeType === 'increase' ? (
                  <TrendingUp size={14} />
                ) : metric.changeType === 'decrease' ? (
                  <TrendingDown size={14} />
                ) : null}
                {metric.trendLabel 
                  ? metric.trendLabel 
                  : ((metric.changePercent ?? 0) > 0 ? `+${metric.changePercent}%` : `${metric.changePercent ?? 0}%`)}
              </span>
              <span className="kpi-compare-label">{metric.compareLabel}</span>
            </div>
          </div>

          <div className="kpi-card-footer">
            <span className={`kpi-status-pill pill-${metric.statusVariant}`}>
              <span className="kpi-status-dot" />
              {metric.statusLabel}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
