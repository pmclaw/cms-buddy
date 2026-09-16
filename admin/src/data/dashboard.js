// ============================================================
// 运营看板 Mock 数据（buddy-admin）
// 数据自洽原则：
//  - 任务处理总次数 = 成功 + 失败；主动提问 + 自动化触发 = 任务总量
//  - 空间×渠道矩阵聚合 = 全部任务量；token 消耗与任务量正相关
//  - 资产增长按月累计，专家/Skill/MCP 工具数量与平台能力页一致量级
// ============================================================

// ---------- 维度常量 ----------
export const OPS_SPACES = ['小招Buddy', '营销Buddy', '财客Buddy'];
export const OPS_CHANNELS = ['智慧营销', '企业微信', '聚力', '财管平台', '渠道营销平台'];
export const OPS_DEPARTMENTS = ['数字化办公室', '财富管理部', '机构业务部', '托管业务部'];
export const OPS_BRANCHES = [
  '深圳福田营业部', '上海陆家嘴营业部', '北京金融街营业部', '广州天河营业部', '杭州钱江营业部',
  '成都春熙路营业部', '武汉光谷营业部', '南京新街口营业部', '重庆解放碑营业部', '厦门鹭江营业部',
];
export const OPS_USER_GROUPS = ['投顾团队', '营销团队', '公司管理', '运营支持', '风控合规'];

// ---------- 空间 × 渠道 任务处理总次数（近30天） ----------
// [空间][渠道] 索引：0 智慧营销 / 1 企业微信 / 2 聚力 / 3 财管平台 / 4 渠道营销平台
export const SPACE_CHANNEL_TASKS = {
  小招Buddy: [18520, 12680, 9840, 7230, 4650],
  营销Buddy: [22310, 15840, 10210, 5860, 7380],
  财客Buddy: [9640, 8420, 15230, 12480, 3920],
};
// 各空间自动化任务创建数（用于"自动化任务创建数"列）
export const SPACE_CHANNEL_AUTO_CREATED = {
  小招Buddy: [38, 52, 41, 26, 17],
  营销Buddy: [45, 61, 36, 22, 29],
  财客Buddy: [22, 30, 55, 47, 15],
};
// 各空间运行中的自动化任务
export const SPACE_CHANNEL_RUNNING = {
  小招Buddy: [96, 118, 87, 64, 41],
  营销Buddy: [112, 134, 82, 55, 68],
  财客Buddy: [54, 71, 128, 106, 36],
};

// ---------- 30 天时间序列（近30日） ----------
// 生成 30 个日期（2026-07-17 ~ 2026-08-15）
const D30 = [];
const d0 = new Date('2026-08-15');
for (let i = 29; i >= 0; i--) {
  const d = new Date(d0);
  d.setDate(d0.getDate() - i);
  D30.push(`${d.getMonth() + 1}/${d.getDate()}`);
}
// 任务量：以 5500 为基准，周末低、工作日高，整体缓升
const TASK_SERIES = [
  4920, 5380, 5610, 5480, 6240, 5210, 4690, 5120, 5680, 5890,
  5720, 6410, 5330, 4860, 5140, 5760, 5970, 5810, 6520, 5450,
  5020, 5290, 5880, 6090, 5920, 6650, 5560, 5180, 5460, 6120,
];
export const SERIES_30D = {
  dates: D30,
  tasks: TASK_SERIES,
  success: TASK_SERIES.map((n) => Math.round(n * 0.97)),
  fail: TASK_SERIES.map((n) => n - Math.round(n * 0.97)),
  proactive: TASK_SERIES.map((n) => Math.round(n * 0.64)),
  autoTrigger: TASK_SERIES.map((n) => Math.round(n * 0.36)),
  tokenIn: TASK_SERIES.map((n) => Math.round(n * 0.92 * 1180)),   // 每任务输入token约1180
  tokenOut: TASK_SERIES.map((n) => Math.round(n * 0.92 * 1820)),  // 每任务输出token约1820
  activeUsers: [ // 使用用户数（累计活跃，缓慢增长）
    1960, 2010, 2050, 2090, 2130, 2160, 2190, 2230, 2270, 2300,
    2340, 2380, 2410, 2440, 2480, 2520, 2550, 2580, 2620, 2650,
    2680, 2720, 2760, 2800, 2830, 2870, 2900, 2930, 2960, 3018,
  ],
  expertCall: TASK_SERIES.map((n) => Math.round(n * 0.82)),
  skillCall: TASK_SERIES.map((n) => Math.round(n * 1.42)),
  mcpCall: TASK_SERIES.map((n) => Math.round(n * 3.15)),
};

// ---------- 概览指标（当前区间汇总 + 同比） ----------
// 第一行：UV / PV / 使用部门数 / 任务处理总次数
export const OVERVIEW_TOP = [
  { key: 'depts', label: '使用人数', value: 1980, trend: 2.9, unit: '人', icon: 'user', tip: '统计期内有实际使用记录的人数' },
  { key: 'tasks', label: '使用总次数', value: 168360, trend: 12.6, unit: '次', icon: 'tasks', tip: '统计期内任务总处理量，含主动提问与自动化触发任务' },
  { key: 'proactive', label: '主动提问次数', value: 106016, trend: 9.8, unit: '次', icon: 'chat', tip: '用户主动发起对话的任务次数' },
  { key: 'auto', label: '任务触发次数', value: 59634, trend: 15.2, unit: '次', icon: 'auto', tip: '自动化任务按规则被触发的总次数' },
];
// 第二行：人均使用次数 / 专家召唤次数 / Skill调用次数 / MCP工具调用次数
export const OVERVIEW_BOTTOM = [
  { key: 'perUser', label: '人均使用次数', value: 85, trend: 3.2, unit: '次/人', icon: 'users', tip: '统计期内人均使用平台的总次数（使用总次数/使用人数）' },
  { key: 'expert', label: '专家召唤次数', value: 135833, trend: 11.4, unit: '次', icon: 'bot', tip: '统计期内专家助理被召唤的总次数' },
  { key: 'skill', label: 'Skill调用次数', value: 235223, trend: 14.7, unit: '次', icon: 'spark', tip: '统计期内平台技能被调用的总次数' },
  { key: 'mcp', label: 'MCP工具调用次数', value: 521798, trend: 16.9, unit: '次', icon: 'wrench', tip: '统计期内MCP工具被调用的总次数' },
];

// ---------- 任务执行监测指标 ----------
export const MONITOR_TOP = [
  { key: 'completion', label: '任务完成率', value: '97.0%', trend: 0.6, tip: '成功执行，无异常任务占任务总量的比例' },
  { key: 'autoTriggerRate', label: '自动化任务触发率', value: '98.6%', trend: 0.4, tip: '自动化任务按规则成功触发的比例' },
  { key: 'tokenIn', label: 'token 输入消耗', value: 179800000, trend: 18.3, unit: '', icon: 'tokenIn', fmt: 'w', tip: '大模型接收的用户与上下文输入token总量' },
];
export const MONITOR_BOTTOM = [
  { key: 'tokenOut', label: 'token 输出消耗', value: 277400000, trend: 21.5, unit: '', icon: 'tokenOut', fmt: 'w', tip: '大模型生成的回复token总量' },
];
// 任务平均用时（条形图展示）
export const MONITOR_LATENCY = [
  { key: 'llmLatency', label: '大模型响应平均耗时', value: 2.84, color: '#3B82F6', tip: '大模型单次响应的平均耗时' },
  { key: 'firstToken', label: '任务响应首token平均耗时', value: 1.18, color: '#8B5CF6', tip: '发起任务到收到首个token的平均时间' },
  { key: 'planLatency', label: '任务规划平均耗时', value: 0.92, color: '#10B981', tip: '任务规划阶段处理的平均耗时' },
  { key: 'doneLatency', label: '任务完成平均耗时', value: 8.64, color: '#E89E57', tip: '任务从开始到完成的平均时长' },
];
// 监测趋势（近30日，百分比/耗时）
export const MONITOR_TREND = {
  dates: D30,
  completionRate: [95.0, 95.6, 95.9, 95.7, 96.2, 95.8, 95.5, 96.0, 96.3, 96.4, 96.1, 96.6, 96.2, 95.9, 96.3, 96.7, 96.8, 96.5, 97.0, 96.7, 96.4, 96.8, 97.1, 96.9, 97.2, 97.4, 97.0, 96.8, 97.1, 97.0],
  autoTriggerRate: [97.6, 97.8, 98.0, 97.9, 98.1, 98.0, 97.8, 98.2, 98.3, 98.2, 98.1, 98.4, 98.2, 98.0, 98.3, 98.5, 98.4, 98.3, 98.6, 98.4, 98.2, 98.5, 98.6, 98.5, 98.7, 98.8, 98.6, 98.4, 98.7, 98.6],
  firstToken: [1.46, 1.42, 1.39, 1.41, 1.36, 1.38, 1.43, 1.35, 1.33, 1.34, 1.37, 1.31, 1.34, 1.38, 1.33, 1.30, 1.29, 1.32, 1.27, 1.29, 1.31, 1.26, 1.25, 1.27, 1.23, 1.22, 1.24, 1.26, 1.21, 1.18],
  doneLatency: [10.4, 10.1, 9.8, 9.9, 9.6, 9.7, 10.0, 9.5, 9.4, 9.5, 9.7, 9.3, 9.5, 9.8, 9.4, 9.2, 9.1, 9.3, 9.0, 9.1, 9.3, 8.9, 8.8, 9.0, 8.7, 8.6, 8.8, 8.9, 8.7, 8.64],
};

// ---------- 自动化任务运营 ----------
// 渠道页签：全部 / 聚力 / 企业微信（曝光 > 卡片点击 > 详情浏览，自洽递减）
export const AUTO_STATS = {
  全部: { templates: 328, created: 1620, subscribed: 12680, users: 2350, running: 486, triggers: 59634, exposure: 45820, clicks: 18640, views: 12480 },
  聚力: { templates: 142, created: 720, subscribed: 5140, users: 980, running: 218, triggers: 24860, exposure: 18960, clicks: 7850, views: 5230 },
  企业微信: { templates: 186, created: 900, subscribed: 7540, users: 1370, running: 268, triggers: 34774, exposure: 26860, clicks: 10790, views: 7250 },
};
export const AUTO_TREND = {
  dates: D30,
  users: [2140, 2170, 2200, 2230, 2260, 2280, 2300, 2330, 2360, 2380, 2400, 2420, 2440, 2460, 2480, 2500, 2520, 2540, 2560, 2580, 2600, 2620, 2640, 2660, 2680, 2700, 2720, 2740, 2760, 2350],
  running: [402, 408, 415, 421, 428, 434, 439, 445, 451, 456, 460, 464, 468, 472, 476, 479, 482, 485, 487, 489, 491, 493, 495, 497, 499, 501, 502, 504, 505, 486],
  triggers: [1680, 1780, 1860, 1810, 2050, 1750, 1590, 1720, 1890, 1970, 1910, 2140, 1780, 1630, 1720, 1930, 2010, 1950, 2190, 1830, 1690, 1780, 1980, 2050, 1990, 2240, 1870, 1740, 1840, 2060],
};
// 最受欢迎任务模板 TOP10
export const TEMPLATE_TOP10 = [
  { name: '每日持仓诊断报告', source: 'Buddy系统', createTime: '2025-12-08', subscribed: 1246, enabledUsers: 892, triggers: 18640, spaceCount: 3 },
  { name: '盘后市场复盘推送', source: '小招Buddy', createTime: '2026-01-15', subscribed: 1082, enabledUsers: 764, triggers: 15320, spaceCount: 3 },
  { name: '基金净值异动提醒', source: '财客Buddy', createTime: '2026-02-03', subscribed: 968, enabledUsers: 703, triggers: 12840, spaceCount: 3 },
  { name: '客户生日关怀任务', source: '营销Buddy', createTime: '2026-03-11', subscribed: 847, enabledUsers: 612, triggers: 9860, spaceCount: 2 },
  { name: '早间财经资讯汇总', source: 'Buddy系统', createTime: '2025-11-20', subscribed: 796, enabledUsers: 558, triggers: 9240, spaceCount: 3 },
  { name: '持仓风险预警扫描', source: '财客Buddy', createTime: '2026-04-07', subscribed: 723, enabledUsers: 504, triggers: 8760, spaceCount: 2 },
  { name: '周度投资组合回顾', source: '小招Buddy', createTime: '2026-05-19', subscribed: 688, enabledUsers: 471, triggers: 6520, spaceCount: 2 },
  { name: '新客开户跟进提醒', source: '营销Buddy', createTime: '2026-06-02', subscribed: 614, enabledUsers: 430, triggers: 5380, spaceCount: 2 },
  { name: '研报观点提炼推送', source: '天启平台', createTime: '2026-06-28', subscribed: 572, enabledUsers: 398, triggers: 4920, spaceCount: 1 },
  { name: '月度服务报告生成', source: '财客Buddy', createTime: '2026-07-14', subscribed: 531, enabledUsers: 356, triggers: 4180, spaceCount: 1 },
];
// 自动化任务创建贡献榜单
// Buddy空间使用情况（按任务处理量降序）
export const SPACE_USAGE = [
  { name: '营销Buddy', tasks: 61600, triggers: 21806, uv: 620, pv: 5860, expertCalls: 28400, skillCalls: 49200, mcpCalls: 109200 },
  { name: '小招Buddy', tasks: 52920, triggers: 18734, uv: 580, pv: 5480, expertCalls: 26200, skillCalls: 45400, mcpCalls: 101600 },
  { name: '财客Buddy', tasks: 49690, triggers: 17590, uv: 520, pv: 4920, expertCalls: 24500, skillCalls: 42600, mcpCalls: 95200 },
  { name: '天启平台', tasks: 38200, triggers: 13523, uv: 460, pv: 4340, expertCalls: 18800, skillCalls: 32800, mcpCalls: 73200 },
  { name: '招小顾', tasks: 34800, triggers: 12319, uv: 420, pv: 3980, expertCalls: 17200, skillCalls: 29800, mcpCalls: 66800 },
  { name: '招小研', tasks: 29600, triggers: 10478, uv: 380, pv: 3580, expertCalls: 14600, skillCalls: 25400, mcpCalls: 56800 },
  { name: '招小数', tasks: 25400, triggers: 8992, uv: 340, pv: 3200, expertCalls: 12500, skillCalls: 21800, mcpCalls: 48600 },
  { name: '财富管家', tasks: 21500, triggers: 7611, uv: 300, pv: 2840, expertCalls: 10600, skillCalls: 18400, mcpCalls: 41200 },
  { name: '星罗Buddy', tasks: 18900, triggers: 6691, uv: 260, pv: 2460, expertCalls: 9300, skillCalls: 16200, mcpCalls: 36200 },
  { name: '智汇Buddy', tasks: 16300, triggers: 5770, uv: 230, pv: 2180, expertCalls: 8000, skillCalls: 14000, mcpCalls: 31300 },
  { name: '慧策Buddy', tasks: 14100, triggers: 4991, uv: 200, pv: 1900, expertCalls: 6900, skillCalls: 12100, mcpCalls: 27000 },
  { name: '数聚Buddy', tasks: 12000, triggers: 4248, uv: 170, pv: 1620, expertCalls: 5900, skillCalls: 10300, mcpCalls: 23000 },
];

// Buddy空间自动化任务排行榜（使用人数 / 自动化任务数 / 触发次数 / 模板数量）
export const SPACE_CONTRIBUTION = [
  { name: '小招Buddy', users: 850, created: 210, triggers: 24860, templates: 96 },
  { name: '营销Buddy', users: 790, created: 202, triggers: 23210, templates: 88 },
  { name: '财客Buddy', users: 710, created: 188, triggers: 19640, templates: 82 },
  { name: '天启平台', users: 560, created: 156, triggers: 14280, templates: 65 },
  { name: '招小顾', users: 495, created: 142, triggers: 11840, templates: 58 },
  { name: '招小研', users: 430, created: 128, triggers: 9640, templates: 52 },
  { name: '招小数', users: 375, created: 115, triggers: 7860, templates: 46 },
  { name: '财富管家', users: 320, created: 98, triggers: 6120, templates: 40 },
];
// 用户自动化任务排行榜（所属部门 / 自动化任务数 / 触发次数）
export const USER_CONTRIBUTION = [
  { name: '林依然', dept: '数字化办公室', created: 32, triggers: 4565 },
  { name: '江超', dept: '数字化办公室', created: 28, triggers: 4046 },
  { name: '王强', dept: '财富管理部', created: 26, triggers: 3550 },
  { name: '李雪', dept: '财富管理部', created: 23, triggers: 3211 },
  { name: '赵明', dept: '机构业务部', created: 21, triggers: 2750 },
  { name: '陈晨', dept: '财富管理部', created: 18, triggers: 2455 },
  { name: '周婷', dept: '营销部', created: 16, triggers: 2214 },
  { name: '吴迪', dept: '机构业务部', created: 14, triggers: 1973 },
];

// ---------- 使用情况统计（6 个维度） ----------
// 渠道维度：5 个渠道
export const USAGE_BY_CHANNEL = OPS_CHANNELS.map((c, i) => {
  const tasks = SPACE_CHANNEL_TASKS[OPS_SPACES[0]][i] + SPACE_CHANNEL_TASKS[OPS_SPACES[1]][i] + SPACE_CHANNEL_TASKS[OPS_SPACES[2]][i];
  const created = SPACE_CHANNEL_AUTO_CREATED[OPS_SPACES[0]][i] + SPACE_CHANNEL_AUTO_CREATED[OPS_SPACES[1]][i] + SPACE_CHANNEL_AUTO_CREATED[OPS_SPACES[2]][i];
  const running = SPACE_CHANNEL_RUNNING[OPS_SPACES[0]][i] + SPACE_CHANNEL_RUNNING[OPS_SPACES[1]][i] + SPACE_CHANNEL_RUNNING[OPS_SPACES[2]][i];
  return { name: c, tasks, created, running, triggers: Math.round(tasks * 0.36) };
}).sort((a, b) => b.tasks - a.tasks);
// 空间维度：3 个空间
export const USAGE_BY_SPACE = OPS_SPACES.map((s) => {
  const arr = SPACE_CHANNEL_TASKS[s];
  const tasks = arr.reduce((x, y) => x + y, 0);
  const created = SPACE_CHANNEL_AUTO_CREATED[s].reduce((x, y) => x + y, 0);
  const running = SPACE_CHANNEL_RUNNING[s].reduce((x, y) => x + y, 0);
  return { name: s, tasks, created, running, triggers: Math.round(tasks * 0.36) };
}).sort((a, b) => b.tasks - a.tasks);
// 营业部 TOP10
export const USAGE_BY_BRANCH = OPS_BRANCHES.map((n, i) => ({
  name: n, tasks: 28640 - i * 2140 + (i % 3) * 480,
  created: 64 - i * 5 + (i % 2) * 3,
  running: 152 - i * 12,
  triggers: Math.round((28640 - i * 2140) * 0.36),
})).sort((a, b) => b.tasks - a.tasks);
// 部门 TOP10（职能部，4 个主部门 + 细分）
export const USAGE_BY_DEPT = [
  { name: '财富管理部', tasks: 52340, created: 96, running: 178, triggers: 18842 },
  { name: '数字化办公室', tasks: 46820, created: 128, running: 156, triggers: 16855 },
  { name: '机构业务部', tasks: 38650, created: 74, running: 112, triggers: 13914 },
  { name: '托管业务部', tasks: 27940, created: 30, running: 40, triggers: 10058 },
].sort((a, b) => b.tasks - a.tasks);
// 用户组 TOP5
export const USAGE_BY_GROUP = [
  { name: '投顾团队', tasks: 68420, created: 96, running: 168, triggers: 24631 },
  { name: '营销团队', tasks: 52680, created: 82, running: 142, triggers: 18965 },
  { name: '公司管理', tasks: 26840, created: 28, running: 66, triggers: 9662 },
  { name: '运营支持', tasks: 21360, created: 35, running: 58, triggers: 7690 },
  { name: '风控合规', tasks: 18620, created: 21, running: 52, triggers: 6703 },
].sort((a, b) => b.tasks - a.tasks);
// 用户 TOP10
export const USAGE_BY_USER = [
  { name: '林依然', dept: '数字化办公室', tasks: 12680, created: 32, running: 18, triggers: 4565, lastActive: '2026-08-20' },
  { name: '江超', dept: '数字化办公室', tasks: 11240, created: 28, running: 15, triggers: 4046, lastActive: '2026-08-19' },
  { name: '王强', dept: '财富管理部', tasks: 9860, created: 26, running: 14, triggers: 3550, lastActive: '2026-08-18' },
  { name: '李雪', dept: '财富管理部', tasks: 8920, created: 23, running: 12, triggers: 3211, lastActive: '2026-08-17' },
  { name: '赵明', dept: '机构业务部', tasks: 7640, created: 21, running: 11, triggers: 2750, lastActive: '2026-08-16' },
  { name: '陈晨', dept: '财富管理部', tasks: 6820, created: 18, running: 10, triggers: 2455, lastActive: '2026-08-15' },
  { name: '周婷', dept: '营销部', tasks: 6150, created: 16, running: 9, triggers: 2214, lastActive: '2026-08-14' },
  { name: '吴迪', dept: '机构业务部', tasks: 5480, created: 14, running: 8, triggers: 1973, lastActive: '2026-08-13' },
  { name: '孙悦', dept: '托管业务部', tasks: 4920, created: 12, running: 7, triggers: 1771, lastActive: '2026-08-12' },
  { name: '郑浩', dept: '托管业务部', tasks: 4380, created: 10, running: 6, triggers: 1577, lastActive: '2026-08-11' },
].sort((a, b) => b.tasks - a.tasks);

// ---------- 资产与能力 ----------
// 平台资产（当前值）
export const ASSET_CURRENT = [
  { key: 'expert', label: '专家助理', value: 86, icon: 'bot', color: '#3B82F6', tip: '平台已上架的专家助理总数' },
  { key: 'skill', label: 'Skill 技能', value: 158, icon: 'spark', color: '#10B981', tip: '平台已上架的Skill技能总数' },
  { key: 'mcp', label: 'MCP 服务', value: 12, icon: 'wrench', color: '#8B5CF6', tip: '平台已接入的MCP服务总数' },
  { key: 'tool', label: 'MCP 工具', value: 96, icon: 'package', color: '#E89E57', tip: 'MCP服务提供的工具总数' },
];
// 资产月度增长（12 个月，2025-09 ~ 2026-08，累计值）
export const ASSET_TREND = {
  months: ['9月', '10月', '11月', '12月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'],
  expert: [41, 46, 52, 57, 61, 65, 70, 74, 78, 81, 84, 86],
  skill: [62, 74, 86, 97, 108, 116, 126, 135, 143, 149, 154, 158],
  mcp: [8, 8, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12],
  tool: [42, 48, 55, 61, 66, 72, 78, 83, 87, 91, 94, 96],
};
// 空间关联能力（当前）
export const SPACE_CAPABILITIES = [
  { space: '数聚Buddy', createTime: '2026-08-18', admin: '郑浩', experts: 3, skills: 6, mcps: 1, tools: 5 },
  { space: '慧策Buddy', createTime: '2026-08-12', admin: '孙悦', experts: 3, skills: 6, mcps: 1, tools: 5 },
  { space: '智汇Buddy', createTime: '2026-08-05', admin: '吴迪', experts: 3, skills: 7, mcps: 1, tools: 6 },
  { space: '星罗Buddy', createTime: '2026-07-28', admin: '陈晨', experts: 4, skills: 7, mcps: 1, tools: 7 },
  { space: '财富管家', createTime: '2026-07-20', admin: '林依然', experts: 4, skills: 8, mcps: 1, tools: 8 },
  { space: '招小数', createTime: '2026-06-15', admin: '周婷', experts: 5, skills: 9, mcps: 2, tools: 10 },
  { space: '招小研', createTime: '2026-05-08', admin: '王强', experts: 6, skills: 10, mcps: 2, tools: 12 },
  { space: '招小顾', createTime: '2026-04-12', admin: '李雪', experts: 7, skills: 12, mcps: 2, tools: 14 },
  { space: '天启平台', createTime: '2026-03-01', admin: '赵明', experts: 8, skills: 14, mcps: 2, tools: 16 },
  { space: '财客Buddy', createTime: '2025-11-18', admin: '陈晨', experts: 26, skills: 48, mcps: 8, tools: 61 },
  { space: '营销Buddy', createTime: '2025-10-06', admin: '王总', experts: 28, skills: 52, mcps: 9, tools: 66 },
  { space: '小招Buddy', createTime: '2025-08-25', admin: '江超', experts: 32, skills: 58, mcps: 10, tools: 78 },
];
// 专家技能工具使用统计
export const USAGE_SUMMARY = [
  { key: 'expert', label: '专家召唤总次数', value: 135833, trend: 11.4, unit: '次', icon: 'bot', color: '#3B82F6', tip: '统计期内专家助理被召唤的总次数' },
  { key: 'skill', label: 'Skill 技能调用次数', value: 235223, trend: 14.7, unit: '次', icon: 'spark', color: '#10B981', tip: '统计期内技能被调用的总次数' },
  { key: 'tool', label: '工具调用总次数', value: 521798, trend: 16.9, unit: '次', icon: 'wrench', color: '#E89E57', tip: '统计期内MCP工具被调用的总次数' },
];
export const USAGE_SUMMARY_TREND = {
  dates: D30,
  expert: SERIES_30D.expertCall,
  skill: SERIES_30D.skillCall,
  tool: SERIES_30D.mcpCall,
};
// 榜单：专家 / Skill / 工具
export const RANK_EXPERT = [
  { rank: 1, name: '招小顾（财富管家）', count: 28640 },
  { rank: 2, name: '招小研（投研助手）', count: 23180 },
  { rank: 3, name: '招小聚（基金研究）', count: 19860 },
  { rank: 4, name: '招小数（数据分析）', count: 16540 },
  { rank: 5, name: '研报女娲', count: 12860 },
  { rank: 6, name: '合规助手', count: 9860 },
  { rank: 7, name: '营销文案助手', count: 8640 },
  { rank: 8, name: '持仓诊断专家', count: 7520 },
  { rank: 9, name: '新股申购助手', count: 6230 },
  { rank: 10, name: '可转债分析助手', count: 4860 },
];
export const RANK_SKILL = [
  { rank: 1, name: '个股诊断', count: 48640 },
  { rank: 2, name: '研报解读', count: 42180 },
  { rank: 3, name: '基金对比分析', count: 35620 },
  { rank: 4, name: '市场热点追踪', count: 29840 },
  { rank: 5, name: '智能合规问答', count: 24680 },
  { rank: 6, name: '营销话术生成', count: 21360 },
  { rank: 7, name: '知识问答', count: 18650 },
  { rank: 8, name: '客户邀约话术', count: 15420 },
  { rank: 9, name: '持仓诊断报告', count: 12680 },
  { rank: 10, name: '舆情监测分析', count: 9860 },
];
export const RANK_TOOL = [
  { rank: 1, name: 'get_stock_quote（实时行情）', count: 98640 },
  { rank: 2, name: 'get_fund_info（基金信息）', count: 86420 },
  { rank: 3, name: 'search_research_report（研报检索）', count: 78260 },
  { rank: 4, name: 'list_dimensions（标签维度）', count: 65840 },
  { rank: 5, name: 'get_industry_data（行业数据）', count: 56820 },
  { rank: 6, name: 'get_index_quote（指数行情）', count: 49260 },
  { rank: 7, name: 'get_company_profile（公司概况）', count: 42380 },
  { rank: 8, name: 'get_macro_data（宏观数据）', count: 38640 },
  { rank: 9, name: 'get_announcement（公司公告）', count: 32560 },
  { rank: 10, name: 'get_rating_change（评级变动）', count: 26840 },
];

// ---------- 数据排行榜 Tab（各维度使用排行） ----------
const CHANNEL_USERS = { 智慧营销: 780, 企业微信: 560, 聚力: 510, 财管平台: 380, 渠道营销平台: 240 };
const DEPT_USERS = { 数字化办公室: 720, 财富管理部: 680, 机构业务部: 450, 托管业务部: 300 };
const sortR = (rows) => rows.map((r, i) => ({ ...r, rank: i + 1 }));

// Buddy空间使用排行榜
export const RANK_SPACE = {
  users: sortR([...SPACE_USAGE].sort((a, b) => b.uv - a.uv).map((r) => ({ name: r.name, count: r.uv }))),
  proactive: sortR([...SPACE_USAGE].sort((a, b) => b.tasks - a.tasks).map((r) => ({ name: r.name, count: Math.round(r.tasks * 0.63) }))),
  triggers: sortR([...SPACE_USAGE].sort((a, b) => b.tasks - a.tasks).map((r) => ({ name: r.name, count: Math.round(r.tasks * 0.354) }))),
};
// 渠道使用排行榜
export const RANK_CHANNEL = {
  users: sortR([...USAGE_BY_CHANNEL].sort((a, b) => (CHANNEL_USERS[b.name] || 0) - (CHANNEL_USERS[a.name] || 0)).map((r) => ({ name: r.name, count: CHANNEL_USERS[r.name] || 0 }))),
  proactive: sortR([...USAGE_BY_CHANNEL].sort((a, b) => b.tasks - a.tasks).map((r) => ({ name: r.name, count: Math.round(r.tasks * 0.63) }))),
  triggers: sortR([...USAGE_BY_CHANNEL].sort((a, b) => b.tasks - a.tasks).map((r) => ({ name: r.name, count: Math.round(r.tasks * 0.354) }))),
};
// 部门使用排行榜
export const RANK_DEPT = {
  users: sortR([...USAGE_BY_DEPT].sort((a, b) => (DEPT_USERS[b.name] || 0) - (DEPT_USERS[a.name] || 0)).map((r) => ({ name: r.name, count: DEPT_USERS[r.name] || 0 }))),
  proactive: sortR([...USAGE_BY_DEPT].sort((a, b) => b.tasks - a.tasks).map((r) => ({ name: r.name, count: Math.round(r.tasks * 0.63) }))),
  triggers: sortR([...USAGE_BY_DEPT].sort((a, b) => b.tasks - a.tasks).map((r) => ({ name: r.name, count: Math.round(r.tasks * 0.354) }))),
};
// 用户使用排行榜
export const RANK_USER = {
  proactive: sortR([...USAGE_BY_USER].sort((a, b) => b.tasks - a.tasks).map((r) => ({ name: r.name, dept: r.dept, lastActive: r.lastActive, count: Math.round(r.tasks * 0.63) }))),
  created: sortR([...USAGE_BY_USER].sort((a, b) => b.created - a.created).map((r) => ({ name: r.name, dept: r.dept, lastActive: r.lastActive, count: r.created }))),
  triggers: sortR([...USAGE_BY_USER].sort((a, b) => b.triggers - a.triggers).map((r) => ({ name: r.name, dept: r.dept, lastActive: r.lastActive, count: r.triggers }))),
};

// 营业部使用情况（使用人数 / 使用次数；总人数为各营业部在职总人数，各不相同）
export const BRANCH_USAGE = [
  { name: '深圳福田营业部', users: 320, totalUsers: 480, tasks: 27680 },
  { name: '上海陆家嘴营业部', users: 300, totalUsers: 460, tasks: 25640 },
  { name: '北京金融街营业部', users: 270, totalUsers: 420, tasks: 22840 },
  { name: '广州天河营业部', users: 220, totalUsers: 360, tasks: 18640 },
  { name: '杭州钱江营业部', users: 190, totalUsers: 300, tasks: 16040 },
  { name: '成都春熙路营业部', users: 170, totalUsers: 280, tasks: 14280 },
  { name: '武汉光谷营业部', users: 150, totalUsers: 260, tasks: 12840 },
  { name: '南京新街口营业部', users: 130, totalUsers: 220, tasks: 10960 },
  { name: '重庆解放碑营业部', users: 120, totalUsers: 210, tasks: 10040 },
  { name: '厦门鹭江营业部', users: 110, totalUsers: 190, tasks: 9400 },
];
