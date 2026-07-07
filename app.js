const fmtInt = (n) => Math.round(n).toLocaleString('en-US');
const fmtMoney = (n) => '¥' + Math.round(n).toLocaleString('en-US');
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const state = {
  orders: 12860,
  ordersPrev: 11980,
  visits: 1024,
  visitsPrev: 1000,
  sales: 2384600,
  salesTarget: 5000000,
  conv: 3.6,
  channels: [
    { name: '直接访问', value: 38 },
    { name: '搜索引擎', value: 27 },
    { name: '社交媒体', value: 18 },
    { name: '广告投放', value: 12 },
    { name: '其他', value: 5 }
  ],
  regions: [
    { name: '华东', value: 4200 },
    { name: '华南', value: 3600 },
    { name: '华北', value: 3100 },
    { name: '西南', value: 1900 },
    { name: '华中', value: 1700 },
    { name: '东北', value: 1200 }
  ],
  visits24: Array.from({ length: 24 }, (_, h) => Math.round(200 + 600 * Math.sin((h - 6) / 24 * Math.PI * 2) + rand(-80, 80)))
};

const mkSeries = (base, amp) => Array.from({ length: 12 }, (_, i) => base + Math.round(rand(-amp, amp)) + i * Math.round(amp * 0.15));
state.forecasts = {
  orders: mkSeries(900, 200),
  visits: mkSeries(1000, 220),
  sales: mkSeries(238000, 40000)
};
state.forecastMetric = 'orders';
state.focusChannel = null;
state.paused = false;
const metricMeta = {
  orders: { name: '订单量', fmt: fmtInt },
  visits: { name: '访问数', fmt: fmtInt },
  sales: { name: '销售额', fmt: fmtMoney }
};

const channelChart = echarts.init(document.getElementById('chartChannel'));
const regionChart = echarts.init(document.getElementById('chartRegion'));
const forecastChart = echarts.init(document.getElementById('chartForecast'));
const visitsChart = echarts.init(document.getElementById('chartVisits'));
const topoChart = echarts.init(document.getElementById('chartTopo'));
const radarChart = echarts.init(document.getElementById('chartRadar'));

state.capability = [82, 76, 90, 88, 84];
state.services = [
  { name: '采集网关', status: 'online', load: 62 },
  { name: '实时计算', status: 'busy', load: 88 },
  { name: '指标仓库', status: 'online', load: 54 },
  { name: '告警中心', status: 'online', load: 41 },
  { name: 'API 边缘', status: 'busy', load: 79 }
];

function renderChannels() {
  const palette = ['#e8c374', '#b8893f', '#7fa8d6', '#5b6b82', '#9aa6bb'];
  const data = state.channels.map((c, i) => ({
    name: c.name,
    value: c.value,
    itemStyle: {
      color: palette[i % palette.length],
      borderColor: 'rgba(12,15,20,0.7)', borderWidth: 2,
      opacity: state.focusChannel && state.focusChannel !== c.name ? 0.25 : 1
    }
  }));
  channelChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    legend: { orient: 'vertical', left: 6, top: 'center', icon: 'circle', itemWidth: 9, itemHeight: 9, itemGap: 14, textStyle: { color: '#93a0b4', fontSize: 13 } },
    series: [{
      type: 'pie',
      radius: ['42%', '66%'],
      center: ['68%', '50%'],
      label: { show: false },
      labelLine: { show: false },
      data: data
    }]
  });
}

function renderRegions() {
  const sorted = [...state.regions].sort((a, b) => b.value - a.value);
  regionChart.setOption({
    grid: { left: 8, right: 24, top: 10, bottom: 6, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', axisLabel: { color: '#6b86b3' }, splitLine: { lineStyle: { color: 'rgba(64,158,255,.1)' } } },
    yAxis: { type: 'category', data: sorted.map(d => d.name).reverse(), axisLabel: { color: '#cfe3ff' }, axisLine: { lineStyle: { color: 'rgba(64,158,255,.3)' } } },
    series: [{
      type: 'bar', data: sorted.map(d => d.value).reverse(),
      barWidth: '55%',
      itemStyle: { borderRadius: [0, 6, 6, 0], color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#1d4ed8' }, { offset: 1, color: '#22d3ee' }]) },
      label: { show: true, position: 'right', color: '#cfe3ff' }
    }]
  });
}

function renderForecast() {
  const metric = state.forecastMetric;
  const meta = metricMeta[metric];
  const past = state.forecasts[metric];
  const future = past.slice(-1).concat(Array.from({ length: 6 }, () => Math.round(past[past.length - 1] * rand(0.98, 1.12))));
  const x = Array.from({ length: past.length }, (_, i) => 'T-' + (past.length - 1 - i))
    .concat(Array.from({ length: 6 }, (_, i) => 'T+' + (i + 1)));
  const actual = past.concat(Array(6).fill(null));
  const predicted = Array(past.length - 1).fill(null).concat(future);
  forecastChart.setOption({
    tooltip: { trigger: 'axis', valueFormatter: (v) => v == null ? '-' : meta.fmt(v) },
    grid: { left: 10, right: 20, top: 20, bottom: 20, containLabel: true },
    xAxis: { type: 'category', data: x, axisLabel: { color: '#93a0b4' }, axisLine: { lineStyle: { color: 'rgba(154,166,187,.3)' } } },
    yAxis: { type: 'value', name: meta.name, nameTextStyle: { color: '#93a0b4' }, axisLabel: { color: '#93a0b4', formatter: (v) => metric === 'sales' ? (v / 10000) + '万' : v }, splitLine: { lineStyle: { color: 'rgba(154,166,187,.12)' } } },
    series: [
      {
        name: '实际', type: 'line', data: actual, smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { color: '#7fa8d6', width: 3 }, itemStyle: { color: '#7fa8d6' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(127,168,214,.35)' }, { offset: 1, color: 'rgba(127,168,214,0)' }]) }
      },
      {
        name: '预测', type: 'line', data: predicted, smooth: true, symbol: 'emptyCircle', symbolSize: 6,
        lineStyle: { color: '#e8c374', width: 3, type: 'dashed' }, itemStyle: { color: '#e8c374' }
      }
    ]
  });
}

function renderVisits() {
  visitsChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 6, right: 12, top: 14, bottom: 6, containLabel: true },
    xAxis: { type: 'category', data: state.visits24.map((_, h) => h + '时'), axisLabel: { color: '#93a0b4', interval: 3 }, axisLine: { lineStyle: { color: 'rgba(154,166,187,.3)' } } },
    yAxis: { type: 'value', axisLabel: { color: '#93a0b4' }, splitLine: { lineStyle: { color: 'rgba(154,166,187,.12)' } } },
    series: [{
      type: 'line', data: state.visits24, smooth: true, symbol: 'none',
      lineStyle: { color: '#7fa8d6', width: 2 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(127,168,214,.4)' }, { offset: 1, color: 'rgba(127,168,214,0)' }]) }
    }]
  });
}

function renderTopo() {
  const w = topoChart.getWidth() || 600;
  const h = topoChart.getHeight() || 400;
  const cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) * 0.36;
  const sat = [
    { name: '采集网关', cat: 1 },
    { name: '指标仓库', cat: 1 },
    { name: '告警中心', cat: 1 },
    { name: '日志服务', cat: 1 },
    { name: '实时计算', cat: 2 },
    { name: 'API 边缘', cat: 2 }
  ];
  const nodes = [{
    name: '数据中枢', x: cx, y: cy, symbolSize: Math.min(w, h) * 0.16,
    itemStyle: { color: '#7fa8d6' },
    label: { show: true, position: 'inside', color: '#fff', fontSize: 14, fontWeight: 'bold' }
  }];
  sat.forEach((s, i) => {
    const ang = -Math.PI / 2 + i * (Math.PI * 2 / sat.length);
    nodes.push({
      name: s.name, x: cx + Math.cos(ang) * R, y: cy + Math.sin(ang) * R,
      symbolSize: Math.min(w, h) * 0.11, category: s.cat,
      label: { show: true, position: 'bottom', color: '#cfe3ff', fontSize: 12 }
    });
  });
  const links = sat.map(s => ({ source: '数据中枢', target: s.name }));
  topoChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'graph', layout: 'none', roam: false,
      categories: [
        { name: '中枢', itemStyle: { color: '#7fa8d6' } },
        { name: '采集', itemStyle: { color: '#4fd1a5' } },
        { name: '计算', itemStyle: { color: '#e8c374' } }
      ],
      lineStyle: { color: '#5b6b82', width: 1.5, type: [6, 4], opacity: 0.7, curveness: 0.08 },
      symbol: ['none', 'arrow'], symbolSize: 7,
      emphasis: { focus: 'adjacency', lineStyle: { opacity: 1, color: '#e8c374' } },
      label: { show: true },
      data: nodes,
      links: links,
      itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,.5)' }
    }]
  });
}

function renderRadar() {
  radarChart.setOption({
    tooltip: {},
    radar: {
      indicator: [
        { name: '吞吐', max: 100 }, { name: '弹性', max: 100 }, { name: '安全', max: 100 },
        { name: '延迟', max: 100 }, { name: '稳定', max: 100 }
      ],
      radius: '68%',
      axisName: { color: '#cfe3ff', fontSize: 13 },
      splitLine: { lineStyle: { color: 'rgba(154,166,187,.2)' } },
      splitArea: { areaStyle: { color: ['rgba(127,168,214,.05)', 'rgba(232,195,116,.05)'] } },
      axisLine: { lineStyle: { color: 'rgba(154,166,187,.2)' } }
    },
    series: [{
      type: 'radar',
      data: [{ value: state.capability, name: '平台能力',
        areaStyle: { color: 'rgba(232,195,116,.25)' },
        lineStyle: { color: '#e8c374', width: 2 },
        itemStyle: { color: '#e8c374' } }]
    }]
  });
}

function renderLoad() {
  const el = document.getElementById('load');
  el.innerHTML = state.services.map(s =>
    `<div class="load-row">` +
    `<span class="load-name">${s.name}</span>` +
    `<span class="load-badge ${s.status}">${s.status}</span>` +
    `<div class="load-bar"><div class="load-fill ${s.status}" style="width:${s.load}%"></div></div>` +
    `</div>`
  ).join('');
}

function animateValue(el, to, formatter) {
  const from = parseFloat(el.dataset.val || '0');
  const start = performance.now();
  const dur = 600;
  function step(now) {
    const t = Math.min(1, (now - start) / dur);
    const v = from + (to - from) * (1 - Math.pow(1 - t, 3));
    el.textContent = formatter(v);
    if (t < 1) requestAnimationFrame(step);
    else el.dataset.val = to;
  }
  requestAnimationFrame(step);
}

function renderKpis() {
  animateValue(document.getElementById('kpiOrders'), state.orders, fmtInt);
  animateValue(document.getElementById('kpiVisits'), state.visits, fmtInt);
  animateValue(document.getElementById('kpiSales'), state.sales, fmtMoney);
  document.getElementById('kpiConv').textContent = state.conv.toFixed(1) + '%';
  const ordUp = ((state.orders - state.ordersPrev) / state.ordersPrev * 100).toFixed(1);
  document.getElementById('kpiOrdersSub').textContent = '较昨日 ' + (ordUp >= 0 ? '+' : '') + ordUp + '%';
  const visUp = ((state.visits - state.visitsPrev) / state.visitsPrev * 100).toFixed(1);
  document.getElementById('kpiVisitsSub').textContent = '环比 ' + (visUp >= 0 ? '+' : '') + visUp + '%';
  const done = (state.sales / state.salesTarget * 100).toFixed(0);
  document.getElementById('kpiSalesSub').textContent = '目标完成 ' + done + '%';
}

function renderSummary() {
  const topChannel = [...state.channels].sort((a, b) => b.value - a.value)[0];
  const last6 = state.forecasts[state.forecastMetric].slice(-6);
  const trend = last6[last6.length - 1] - last6[0];
  const trendWord = trend >= 0 ? '<span class="up">上升</span>' : '<span class="down">回落</span>';
  const convWord = state.conv >= 3.1 ? '<span class="up">高于</span>' : '<span class="down">低于</span>';
  const focusTip = state.focusChannel
    ? `已聚焦 <span class="hl">${state.focusChannel}</span> 渠道（占比 ${state.channels.find(c => c.name === state.focusChannel).value}%），可针对性优化投放策略。<br>`
    : '';
  document.getElementById('summary').innerHTML =
    `当前实时访问 <span class="hl">${fmtInt(state.visits)}</span> 次/分，环比${trendWord}。<br>` +
    `今日订单已达 <span class="hl">${fmtInt(state.orders)}</span>，销售额 <span class="hl">${fmtMoney(state.sales)}</span>。<br>` +
    `<span class="hl">${topChannel.name}</span> 渠道占比最高（${topChannel.value}%），建议加大投放。<br>` +
    focusTip +
    `模型预测未来 6 个时段${metricMeta[state.forecastMetric].name}将<span class="hl">${trend >= 0 ? '持续走高' : '短暂回调'}</span>，请提前预备运力。<br>` +
    `转化率 ${state.conv.toFixed(1)}%，<span class="hl">${convWord}</span>行业均值，可优化落地页。`;
}

const regions = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆'];
const channelNames = ['直接访问', '搜索引擎', '社交媒体', '广告投放', '扫码'];
function pushOrder() {
  const now = new Date();
  const t = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');
  const row = document.createElement('div');
  row.className = 'feed-row';
  row.innerHTML =
    `<span class="feed-time">${t}</span>` +
    `<span class="feed-info">${pick(regions)} · ${pick(channelNames)}下单</span>` +
    `<span class="feed-amt">${fmtMoney(rand(59, 2999))}</span>`;
  const feed = document.getElementById('feed');
  feed.prepend(row);
  while (feed.children.length > 12) feed.removeChild(feed.lastChild);
}

function tickFast() {
  state.visitsPrev = state.visits;
  state.visits = Math.max(600, Math.round(state.visits + rand(-60, 90)));
  state.orders += Math.round(rand(2, 18));
  state.sales += rand(800, 9000);
  state.conv = Math.min(6, Math.max(2, state.conv + rand(-0.15, 0.15)));
  const h = new Date().getHours();
  state.visits24[h] = Math.round(state.visits24[h] * rand(0.97, 1.03) + rand(0, 30));
  document.getElementById('onlineText').textContent = '在线访客 ' + fmtInt(Math.round(state.visits * rand(2.5, 4)));
  renderKpis();
  renderVisits();
  pushOrder();
}

function tickSlow() {
  state.channels.forEach(c => c.value = Math.max(2, c.value + Math.round(rand(-2, 2))));
  state.regions.forEach(r => r.value = Math.max(500, r.value + Math.round(rand(-120, 160))));
  Object.keys(state.forecasts).forEach(k => {
    const arr = state.forecasts[k];
    const last = arr[arr.length - 1];
    arr.push(Math.max(100, Math.round(last * rand(0.95, 1.12))));
    arr.shift();
  });
  state.capability = state.capability.map(v => Math.max(60, Math.min(99, v + Math.round(rand(-3, 3)))));
  state.services.forEach(s => {
    s.load = Math.max(20, Math.min(98, s.load + Math.round(rand(-6, 6))));
    if (Math.random() < 0.12) s.status = s.status === 'online' ? 'busy' : 'online';
  });
  renderChannels();
  renderRegions();
  renderForecast();
  renderRadar();
  renderLoad();
  renderSummary();
}

function tickClock() {
  const d = new Date();
  const w = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
  document.getElementById('dateText').textContent = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} 周${w}`;
  document.getElementById('clockText').textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');
}

renderChannels();
renderRegions();
renderForecast();
renderVisits();
renderTopo();
renderRadar();
renderLoad();
renderKpis();
renderSummary();
tickClock();

let fastTimer = setInterval(tickFast, 1000);
let slowTimer = setInterval(tickSlow, 4000);
let clockTimer = setInterval(tickClock, 1000);

document.querySelectorAll('.seg').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.forecastMetric = btn.dataset.metric;
    renderForecast();
    renderSummary();
  });
});

channelChart.on('click', (params) => {
  state.focusChannel = state.focusChannel === params.name ? null : params.name;
  renderChannels();
  renderSummary();
});

const pauseBtn = document.getElementById('pauseBtn');
pauseBtn.addEventListener('click', () => {
  if (state.paused) {
    fastTimer = setInterval(tickFast, 1000);
    slowTimer = setInterval(tickSlow, 4000);
    pauseBtn.textContent = '⏸ 暂停';
    pauseBtn.classList.remove('paused');
  } else {
    clearInterval(fastTimer);
    clearInterval(slowTimer);
    pauseBtn.textContent = '▶ 继续';
    pauseBtn.classList.add('paused');
  }
  state.paused = !state.paused;
});

function fitScreen() {
  const screen = document.getElementById('screen');
  const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  screen.style.transform = 'scale(' + scale + ')';
}
window.addEventListener('resize', fitScreen);
fitScreen();
