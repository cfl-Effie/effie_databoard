const DASHBOARD_DATA = {
  "generatedAt": "2026-07-08 00:00:00",
  "kpis": {
    "host_count": 20,
    "avg_cpu_usage": 43.87,
    "avg_mem_used": 75234.98,
    "avg_disk_util": 61.24,
    "total_net_in": 10234.56,
    "total_net_out": 7321.45
  },
  "channels": [
    { "name": "Dell R750", "value": 6 },
    { "name": "Lenovo SR860", "value": 4 },
    { "name": "HP DL388", "value": 4 },
    { "name": "Huawei 2288H", "value": 4 },
    { "name": "Dell R740", "value": 2 }
  ],
  "regions": [
    { "name": "A机房", "value": 7 },
    { "name": "E机房", "value": 5 },
    { "name": "B机房", "value": 4 },
    { "name": "C机房", "value": 3 },
    { "name": "D机房", "value": 1 }
  ],
  "trend_cpu": [
    { "hour": "2026-07-01 00:00:00", "avg": 43.87 },
    { "hour": "2026-07-01 01:00:00", "avg": 42.33 },
    { "hour": "2026-07-01 02:00:00", "avg": 44.21 },
    { "hour": "2026-07-01 03:00:00", "avg": 45.12 }
  ],
  "trend_disk": [
    { "hour": "2026-07-01 00:00:00", "avg": 61.24 },
    { "hour": "2026-07-01 01:00:00", "avg": 58.93 },
    { "hour": "2026-07-01 02:00:00", "avg": 63.12 },
    { "hour": "2026-07-01 03:00:00", "avg": 60.44 }
  ],
  "top_hosts_cpu": [
    { "hostid": "host003", "hostname": "server-003.hismartlab.cn", "avg_cpu": 66.13 },
    { "hostid": "host010", "hostname": "server-010.hismartlab.cn", "avg_cpu": 63.45 },
    { "hostid": "host001", "hostname": "server-001.hismartlab.cn", "avg_cpu": 58.72 }
  ],
  "top_disk_mods": [
    { "mod": "sda_util", "tag": "disk_util_percent", "value": 742.1 },
    { "mod": "sdb_util", "tag": "disk_util_percent", "value": 688.2 }
  ],
  "capability": [82, 76, 90, 88, 84],
  "visits24": [320, 390, 430, 480, 540, 620, 670, 720, 760, 730, 690, 650, 610, 580, 560, 540, 520, 500, 470, 430, 390, 360, 340, 320],
  "forecast": {
    "cpu_usage": [40.12, 41.3, 42.8, 44.2, 45.0, 45.7, 46.1, 47.3, 48.0, 48.8, 49.2, 50.1],
    "disk_util": [58.4, 58.9, 59.4, 59.9, 60.4, 60.9, 61.4, 61.9, 62.4, 62.9, 63.4, 63.9],
    "mem_used": [75234.98, 75534.3, 75833.6, 76132.9, 76432.2, 76731.5, 77030.8, 77330.1, 77629.4, 77928.7, 78228.0, 78527.3]
  },
  "summary": {
    "top_model": "Dell R750",
    "avg_cpu": 43.87,
    "avg_disk": 61.24,
    "total_hosts": 20
  }
};
