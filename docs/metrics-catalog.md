# Metrics Catalog Reference

jemon standardizes 46 metrics across 10 domains. Every entry is Zod-validated
at startup. Source: `packages/catalog/src/data/`.

Run `pnpm run test:e2e` to cross-check all entries automatically.

---

## Schema

```typescript
interface CatalogEntry {
  key:    string;           // dot-namespaced identifier
  domain: Domain;           // one of 10 domains below
  title:  string;           // human-readable label
  unit:   string;           // display unit (e.g. "bps", "%", "ms")
  source: {
    kind:    'snmp' | 'exporter' | 'log';
    oid?:    string;         // SNMP OID (snmp sources)
    metric?: string;         // PromQL metric name (exporter/log sources)
  };
  agg:   'avg'|'sum'|'max'|'min'|'rate'|'last';
  kpi?: {
    expr: string;            // PromQL expression for alerting
    warn?: number;
    crit?: number;
  };
  panel: 'line'|'gauge'|'stat'|'table'|'heatmap';
}
```

---

## Domain: `network` (5 entries)

SNMP-polled interface and system metrics.

| Key | Title | Unit | Source | Agg | Panel |
|---|---|---|---|---|---|
| `net.ifHCInOctets` | Interface Inbound Bandwidth | bps | SNMP `1.3.6.1.2.1.31.1.1.1.6` | rate | line |
| `net.ifHCOutOctets` | Interface Outbound Bandwidth | bps | SNMP `1.3.6.1.2.1.31.1.1.1.10` | rate | line |
| `net.ifOperStatus` | Interface Operational Status | — | SNMP `1.3.6.1.2.1.2.2.1.8` | last | stat |
| `net.ifInErrors` | Interface Inbound Errors | errors/s | SNMP `1.3.6.1.2.1.2.2.1.14` | rate | line |
| `net.sysUpTime` | System Uptime | timeticks | SNMP `1.3.6.1.2.1.1.3.0` | last | stat |

---

## Domain: `server` (5 entries)

Host Resource MIB (hrMIB) CPU, memory, and disk metrics.

| Key | Title | Unit | Source | Agg | KPI warn/crit | Panel |
|---|---|---|---|---|---|---|
| `srv.hrProcessorLoad` | CPU Utilization | % | SNMP `1.3.6.1.2.1.25.3.3.1.2` | avg | 80/90 | gauge |
| `srv.hrStorageUsed` | Disk Storage Used | KB | SNMP `1.3.6.1.2.1.25.2.3.1.6` | last | 80%/95% | gauge |
| `srv.hrStorageSize` | Disk Storage Total | KB | SNMP `1.3.6.1.2.1.25.2.3.1.5` | last | — | stat |
| `srv.hrMemorySize` | Total Physical Memory | KB | SNMP `1.3.6.1.2.1.25.2.2.0` | last | — | stat |
| `srv.sysUpTime` | Server Uptime | timeticks | SNMP `1.3.6.1.2.1.1.3.0` | last | — | stat |

---

## Domain: `virtualization` (5 entries)

VMware vSphere exporter metrics.

| Key | Title | Unit | Source | Agg | KPI warn/crit | Panel |
|---|---|---|---|---|---|---|
| `virt.cpu_usage_pct` | VM CPU Usage | % | exporter `vmware_vm_cpu_usage_average` | avg | 80/95 | gauge |
| `virt.mem_usage_bytes` | VM Memory Usage | bytes | exporter `vmware_vm_mem_usage_average` | avg | 0.85/0.95 | gauge |
| `virt.disk_io_kbps` | VM Disk I/O | KBps | exporter `vmware_vm_disk_io_rate` | avg | — | line |
| `virt.net_rx_bytes` | VM Network Receive | bps | exporter `vmware_vm_net_received_average` | rate | — | line |
| `virt.vm_power_state` | VM Power State | — | exporter `vmware_vm_power_state` | last | — | stat |

---

## Domain: `app` (6 entries)

Application exporter metrics (Prometheus-compatible). Includes JVM and Envoy.

| Key | Title | Unit | Source | Agg | KPI warn/crit | Panel |
|---|---|---|---|---|---|---|
| `app.http_2xx_rate` | HTTP 2xx Response Rate | req/s | exporter `http_requests_total{status=~"2.."}` | rate | — | line |
| `app.http_4xx_rate` | HTTP 4xx Error Rate | req/s | exporter `http_requests_total{status=~"4.."}` | rate | 10/50 | line |
| `app.http_5xx_rate` | HTTP 5xx Error Rate | req/s | exporter `http_requests_total{status=~"5.."}` | rate | 1/5 | line |
| `app.http_p95_latency` | HTTP p95 Latency | ms | exporter `http_request_duration_seconds` | max | 500/2000 | line |
| `app.jvm_heap_used` | JVM Heap Used | bytes | exporter `jvm_memory_bytes_used{area="heap"}` | avg | 0.8/0.95 | gauge |
| `app.envoy_upstream_rq_total` | Envoy Upstream Request Total | req/s | exporter `envoy_cluster_upstream_rq_total` | rate | — | line |

---

## Domain: `db` (4 entries)

PostgreSQL exporter metrics.

| Key | Title | Unit | Source | Agg | KPI warn/crit | Panel |
|---|---|---|---|---|---|---|
| `db.connections` | DB Active Connections | connections | exporter `pg_stat_activity_count` | avg | 80/100 | gauge |
| `db.query_latency_p95` | Query Latency p95 | ms | exporter `pg_stat_statements_mean_exec_time` | max | 100/500 | line |
| `db.locks` | DB Lock Count | locks | exporter `pg_locks_count` | sum | 20/50 | line |
| `db.repl_lag` | Replication Lag | s | exporter `pg_replication_lag` | max | 30/120 | gauge |

---

## Domain: `cloud` (4 entries)

AWS CloudWatch exporter metrics (ELB + EC2 + billing).

| Key | Title | Unit | Source | Agg | KPI warn/crit | Panel |
|---|---|---|---|---|---|---|
| `cloud.cpu_utilization` | Cloud Instance CPU Utilization | % | exporter `aws_ec2_cpuutilization_average` | avg | 75/90 | gauge |
| `cloud.billing_cost` | Cloud Billing Cost | USD | exporter `aws_billing_estimated_charges` | max | 1000/5000 | stat |
| `cloud.lb_healthy_hosts` | LB Healthy Host Count | hosts | exporter `aws_alb_healthy_host_count_average` | min | 2/1 | stat |
| `cloud.lb_request_rate` | LB Request Rate | req/s | exporter `aws_alb_request_count_sum` | rate | — | line |

---

## Domain: `iot` (5 entries)

APC/Schneider PDU, UPS, and environmental SNMP sensors.

| Key | Title | Unit | Source | Agg | KPI warn/crit | Panel |
|---|---|---|---|---|---|---|
| `iot.temperature_c` | Ambient Temperature | °C | SNMP (APC env sensor) | avg | 28/35 | gauge |
| `iot.humidity_pct` | Relative Humidity | % | SNMP (APC env sensor) | avg | 70/85 | gauge |
| `iot.ups_load_pct` | UPS Output Load | % | SNMP (APC UPS MIB) | avg | 70/90 | gauge |
| `iot.pdu_power_w` | PDU Active Power | W | SNMP (APC PDU MIB) | avg | 3500/4500 | line |
| `iot.leak_detected` | Leak Sensor State | — | SNMP (APC leak sensor) | last | —/1 | stat |

---

## Domain: `security` (4 entries)

Log-sourced security events. All entries use `source.kind = 'log'`.

| Key | Title | Unit | Source | Agg | KPI warn/crit | Panel |
|---|---|---|---|---|---|---|
| `sec.syslog_rate` | Syslog Event Rate | events/s | log `syslog_messages_total` | rate | — | line |
| `sec.failed_logins` | Failed Login Rate | events/s | log `auth_failed_logins_total` | rate | 5/20 | line |
| `sec.fw_deny_rate` | Firewall Deny Rate | packets/s | log `firewall_denied_packets_total` | rate | 100/500 | line |
| `sec.ids_alerts` | IDS Alert Rate | alerts/s | log `ids_alerts_total` | rate | 1/10 | line |

---

## Domain: `flow` (4 entries)

NetFlow/IPFIX collector metrics.

| Key | Title | Unit | Source | Agg | KPI warn/crit | Panel |
|---|---|---|---|---|---|---|
| `flow.bytes_total` | NetFlow Total Bytes | bps | exporter `flow_bytes_total` | rate | — | line |
| `flow.flows_total` | NetFlow Total Flows | flows/s | exporter `flow_records_total` | rate | — | line |
| `flow.top_talker_bytes` | Top Talker Bytes | bps | exporter `flow_top_talker_bytes_total` | rate | 100M/500M | heatmap |
| `flow.top_talker_flows` | Top Talker Flow Count | flows/s | exporter `flow_top_talker_records_total` | rate | — | table |

---

## Domain: `synthetic` (4 entries)

Blackbox exporter (HTTP/TCP probe) synthetic monitoring.

| Key | Title | Unit | Source | Agg | KPI warn/crit | Panel |
|---|---|---|---|---|---|---|
| `synth.http_up` | HTTP Endpoint Up | — | exporter `probe_success{module="http"}` | last | —/0 | stat |
| `synth.http_resp_time` | HTTP Response Time | ms | exporter `probe_duration_seconds{module="http"}` | avg | 500/2000 | line |
| `synth.cert_expiry_days` | TLS Certificate Expiry | days | exporter `probe_ssl_earliest_cert_expiry` | min | 30/7 | gauge |
| `synth.port_up` | TCP Port Up | — | exporter `probe_success{module="tcp"}` | last | —/0 | stat |

---

## Summary

| Domain | Entries | Primary source |
|---|---|---|
| network | 5 | snmp |
| server | 5 | snmp |
| virtualization | 5 | exporter |
| app | 6 | exporter |
| db | 4 | exporter |
| cloud | 4 | exporter |
| iot | 5 | snmp |
| security | 4 | log |
| flow | 4 | exporter |
| synthetic | 4 | exporter |
| **Total** | **46** | |
