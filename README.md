# 数据看板 · effie_databoard

一个数据大屏项目实践，分阶段构建可视化看板。

A data dashboard (big-screen) project, built incrementally for practice.

## 项目简介 / Overview

- 中文名：数据看板
- 英文名：effie_databoard
- 目标：练习并沉淀数据大屏（可视化看板）的开发能力
- 协议：MIT License

## 目录结构 / Structure

```
.
├── README.md      # 项目说明
├── LICENSE        # MIT 开源协议
└── src/           # 源码（后续分阶段补充）
```

## 开发计划 / Roadmap

- [ ] 阶段一：项目脚手架与基础布局
- [ ] 阶段二：数据接入与状态管理
- [ ] 阶段三：图表组件与可视化
- [ ] 阶段四：大屏自适应与主题
- [ ] 阶段五：部署与优化

## 本地开发 / Getting Started

零依赖纯静态大屏（ECharts 已本地内置），直接用浏览器打开即可：

```bash
# 方式一：双击 index.html
# 方式二：起一个本地静态服务（推荐，避免个别浏览器限制）
python -m http.server 8080
# 然后访问 http://localhost:8080
```

数据均为前端定时器模拟实时变化，无需后端。

### 当前模块
- 顶部 KPI：今日订单量 / 实时访问数 / 今日销售额 / 转化率
- 渠道占比（饼图）、地区订单 TOP（条形图）
- 订单量预测趋势（实际 + 未来 6 时段预测，折线图）
- 24 小时访问曲线、实时订单流、智能摘要

## 许可证 / License

[MIT](LICENSE) © effie
