const formatPercent = (n) => Number(n).toFixed(1) + '%';
const formatMb = (n) => Number(n).toFixed(0) + ' MB';
const formatCount = (n) => Math.round(n).toLocaleString('en-US');

const state = {
  data: DASHBOARD_DATA,
  metric: 'cpu_usage',
  paused: false,
};

const channelChart = echarts.init(document.getElementById('chartChannel'));
const regionChart = echarts.init(document.getElementById('chartRegion'));
const forecastChart = echarts.init(document.getElementById('chartForecast'));
const visitsChart = echarts.init(document.getElementById('chartVisits'));
const topoChart = echarts.init(document.getElementById('chartTopo'));
const radarChart = echarts.init(document.getElementById('chartRadar'));

function renderKpis() {
  document.getElementById('kpiHosts').textContent = formatCount(state.data.kpis.host_count);
  document.getElementById('kpiCpu').textContent = formatPercent(state.data.kpis.avg_cpu_usage);
  document.getElementById('kpiDisk').textContent = formatPercent(state.data.kpis.avg_disk_util);
  document.getElementById('kpiMem').textContent = formatMb(state.data.kpis.avg_mem_used);
  document.getElementById('kpiHostsSub').textContent = `共计 ${formatCount(state.data.kpis.host_count)} 台主机`;
  document.getElementById('kpiCpuSub').textContent = 'CPU 历史平均';
  document.getElementById('kpiDiskSub').textContent = '磁盘平均利用';
  document.getElementById('kpiMemSub').textContent = '采集周期内平均';
}

function renderChannels() {
  const data = state.data.channels.map((item, index) => ({
    ...item,
    itemStyle: { color: ['#e8c374', '#7fa8d6', '#4fd1a5', '#b8893f', '#5b6b82', '#9aa6bb'][index % 6] }
  }));
  channelChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    legend: { orient: 'vertical', left: 6, top: 'center', textStyle: { color: '#93a0b4', fontSize: 13 } },
    series: [{
      type: 'pie', radius: ['40%', '62%'], center: ['68%', '50%'], label: { show: false },
      labelLine: { show: false }, data
    }]
  });
}

function renderRegions() {
  const sorted = [...state.data.regions].sort((a, b) => b.value - a.value);
  regionChart.setOption({
    grid: { left: 8, right: 24, top: 10, bottom: 6, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', axisLabel: { color: '#6b86b3' }, splitLine: { lineStyle: { color: 'rgba(64,158,255,.1)' } } },
    yAxis: { type: 'category', data: sorted.map(d => d.name).reverse(), axisLabel: { color: '#cfe3ff' }, axisLine: { lineStyle: { color: 'rgba(64,158,255,.3)' } } },
    series: [{
      type: 'bar', data: sorted.map(d => d.value).reverse(), barWidth: '55%',
      itemStyle: { borderRadius: [0, 6, 6, 0], color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#1d4ed8' }, { offset: 1, color: '#22d3ee' }]) },
      label: { show: true, position: 'right', color: '#cfe3ff' }
    }]
  });
}

function renderForecast() {
  const list = state.data.forecast[state.metric];
  const x = list.map((_, idx) => idx < 12 ? `T-${11 - idx}` : `T+${idx - 11}`);
  const actual = list.map((v, i) => i < 6 ? v : null);
  const predicted = list.map((v, i) => i < 6 ? null : v);
  forecastChart.setOption({
    tooltip: { trigger: 'axis', formatter: params => params.map(p => `${p.seriesName}: ${p.value == null ? '-' : p.value}`).join('<br/>') },
    grid: { left: 10, right: 20, top: 20, bottom: 20, containLabel: true },
    xAxis: { type: 'category', data: x, axisLabel: { color: '#93a0b4' }, axisLine: { lineStyle: { color: 'rgba(154,166,187,.3)' } } },
    yAxis: { type: 'value', axisLabel: { color: '#93a0b4' }, splitLine: { lineStyle: { color: 'rgba(154,166,187,.12)' } } },
    series: [
      { name: '历史', type: 'line', data: actual, smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#7fa8d6', width: 3 }, itemStyle: { color: '#7fa8d6' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(127,168,214,.35)' }, { offset: 1, color: 'rgba(127,168,214,0)' }]) } },
      { name: '预测', type: 'line', data: predicted, smooth: true, symbol: 'emptyCircle', symbolSize: 6, lineStyle: { color: '#e8c374', width: 3, type: 'dashed' }, itemStyle: { color: '#e8c374' } }
    ]
  });
}

function renderVisits() {
  const data = state.data.visits24;
  visitsChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 6, right: 12, top: 14, bottom: 6, containLabel: true },
    xAxis: { type: 'category', data: data.map((_, i) => `${i}时`), axisLabel: { color: '#93a0b4', interval: 3 }, axisLine: { lineStyle: { color: 'rgba(154,166,187,.3)' } } },
    yAxis: { type: 'value', axisLabel: { color: '#93a0b4' }, splitLine: { lineStyle: { color: 'rgba(154,166,187,.12)' } } },
    series: [{ type: 'line', data, smooth: true, symbol: 'none', lineStyle: { color: '#7fa8d6', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(127,168,214,.4)' }, { offset: 1, color: 'rgba(127,168,214,0)' }]) } }]
  });
}

function renderTopo() {
  const w = Math.max(600, topoChart.getWidth());
  const h = Math.max(360, topoChart.getHeight());
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * 0.32;
  const nodes = [
    { name: '核心中枢', x: cx, y: cy, symbolSize: Math.min(w, h) * 0.14, itemStyle: { color: '#7fa8d6' }, label: { show: true, position: 'inside', color: '#fff', fontSize: 14, fontWeight: 'bold' } },
    { name: '采集节点', x: cx + R * Math.cos(-Math.PI/3), y: cy + R * Math.sin(-Math.PI/3), symbolSize: 70, category: 1, label: { show: true, position: 'bottom', color: '#cfe3ff', fontSize: 12 } },
    { name: '计算节点', x: cx + R * Math.cos(0), y: cy + R * Math.sin(0), symbolSize: 70, category: 2, label: { show: true, position: 'bottom', color: '#cfe3ff', fontSize: 12 } },
    { name: '存储节点', x: cx + R * Math.cos(Math.PI/3), y: cy + R * Math.sin(Math.PI/3), symbolSize: 70, category: 1, label: { show: true, position: 'bottom', color: '#cfe3ff', fontSize: 12 } },
    { name: '告警节点', x: cx + R * Math.cos(2*Math.PI/3), y: cy + R * Math.sin(2*Math.PI/3), symbolSize: 70, category: 1, label: { show: true, position: 'bottom', color: '#cfe3ff', fontSize: 12 } },
    { name: 'API 网关', x: cx + R * Math.cos(Math.PI), y: cy + R * Math.sin(Math.PI), symbolSize: 70, category: 2, label: { show: true, position: 'bottom', color: '#cfe3ff', fontSize: 12 } }
  ];
  topoChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'graph', layout: 'none', roam: false, symbol: ['circle', 'arrow'], symbolSize: 7,
      lineStyle: { color: '#5b6b82', width: 1.5, curveness: 0.08, opacity: 0.8 },
      categories: [{ name: '核心', itemStyle: { color: '#7fa8d6' } }, { name: '采集/存储', itemStyle: { color: '#4fd1a5' } }, { name: '计算/网关', itemStyle: { color: '#e8c374' } }],
      data: nodes,
      links: nodes.slice(1).map((node) => ({ source: '核心中枢', target: node.name })),
      focusNodeAdjacency: true,
      itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,.5)' },
      label: { show: true }
    }]
  });
}

function renderRadar() {
  radarChart.setOption({
    tooltip: {},
    radar: {
      indicator: [
        { name: '吞吐', max: 100 },
        { name: '稳定', max: 100 },
        { name: '安全', max: 100 },
        { name: '延迟', max: 100 },
        { name: '弹性', max: 100 }
      ],
      radius: '68%',
      axisName: { color: '#cfe3ff', fontSize: 13 },
      splitLine: { lineStyle: { color: 'rgba(154,166,187,.2)' } },
      splitArea: { areaStyle: { color: ['rgba(127,168,214,.05)', 'rgba(232,195,116,.05)'] } },
      axisLine: { lineStyle: { color: 'rgba(154,166,187,.2)' } }
    },
    series: [{
      type: 'radar',
      data: [{ value: state.data.capability, name: '平台能力', areaStyle: { color: 'rgba(232,195,116,.25)' }, lineStyle: { color: '#e8c374', width: 2 }, itemStyle: { color: '#e8c374' } }]
    }]
  });
}

function renderLoad() {
  const list = [
    { name: '采集网关', status: 'online', load: 54 },
    { name: '实时计算', status: 'busy', load: 78 },
    { name: '指标仓库', status: 'online', load: 60 },
    { name: '告警中心', status: 'online', load: 42 },
    { name: 'API 边缘', status: 'busy', load: 71 }
  ];
  document.getElementById('load').innerHTML = list.map(item => `
    <div class="load-row">
      <div>
        <div class="load-name">${item.name}</div>
        <div class="load-badge ${item.status}">${item.status}</div>
      </div>
      <div class="load-bar"><div class="load-fill ${item.status}" style="width:${item.load}%"></div></div>
    </div>
  `).join('');
}

function renderSummary() {
  const summary = state.data.summary;
  document.getElementById('summary').innerHTML = `
    <p>当前监控 ${summary.total_hosts} 台主机，机型中 <span class="hl">${summary.top_model}</span> 占比最高。</p>
    <p>平均 CPU 使用率 <span class="hl">${formatPercent(summary.avg_cpu)}</span>，平均磁盘利用率 <span class="hl">${formatPercent(summary.avg_disk)}</span>。</p>
    <p>已采集并计算指标，包括 CPU、内存、磁盘与网络层级数据。</p>
  `;
}

function renderFeed() {
  const events = state.data.top_hosts_cpu.slice(0, 6).map((item, idx) => ({
    time: `${8 + idx}:0${idx}`,
    text: `主机 ${item.hostname} CPU 平均 ${formatPercent(item.avg_cpu)}`,
    value: `${Math.round(item.avg_cpu)}%`
  }));
  document.getElementById('feed').innerHTML = events.map(event => `
    <div class="feed-row">
      <div class="feed-time">${event.time}</div>
      <div class="feed-info">${event.text}</div>
      <div class="feed-amt">${event.value}</div>
    </div>
  `).join('');
}

function renderAll() {
  renderKpis();
  renderChannels();
  renderRegions();
  renderForecast();
  renderVisits();
  renderTopo();
  renderRadar();
  renderLoad();
  renderSummary();
  renderFeed();
}

function setDateTime() {
  const now = new Date();
  document.getElementById('dateText').textContent = now.toLocaleDateString();
  document.getElementById('clockText').textContent = now.toLocaleTimeString();
}

document.getElementById('pauseBtn').addEventListener('click', () => {
  state.paused = !state.paused;
  document.getElementById('pauseBtn').classList.toggle('paused', state.paused);
  document.getElementById('pauseBtn').textContent = state.paused ? '▶ 继续' : '⏸ 暂停';
});

document.querySelectorAll('.seg').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    state.metric = btn.dataset.metric;
    renderForecast();
  });
});

window.addEventListener('resize', () => {
  channelChart.resize();
  regionChart.resize();
  forecastChart.resize();
  visitsChart.resize();
  topoChart.resize();
  radarChart.resize();
});

setDateTime();
renderAll();
setInterval(() => {
  if (!state.paused) setDateTime();
}, 1000);
