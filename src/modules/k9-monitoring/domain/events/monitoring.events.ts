export const MONITORING_EVENTS = {
  METRIC_RECORDED: 'monitoring.metric.recorded',
  ALERT_FIRED: 'monitoring.alert.fired',
  ALERT_ACKNOWLEDGED: 'monitoring.alert.acknowledged',
  ALERT_RESOLVED: 'monitoring.alert.resolved',
  HEALTH_CHECK_FAILED: 'monitoring.health.failed',
  HEALTH_CHECK_RECOVERED: 'monitoring.health.recovered',
} as const;
