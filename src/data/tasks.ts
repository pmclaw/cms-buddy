export type TaskStatus = 'running' | 'done'

export type AutomationTask = {
  id: string
  title: string
  status: TaskStatus
  desc: string
  createdAt: string
  schedule: string
  channel: string
  runs: number
  lastRun: string
  /** 创建/编辑弹窗里的字段 */
  skills: [string, string, string]
  prompt: string
  frequency: 'weekly' | 'daily' | 'once' | 'interval'
  weekdays: string[]
  time: string
  receivers: string[]
  messageMode: 'card' | 'full'
}

export const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export const taskSortOptions = [
  { id: 'all', label: '所有任务' },
  { id: 'running', label: '运行中' },
  { id: 'done', label: '已完成' },
] as const

export type TaskFilter = (typeof taskSortOptions)[number]['id']

const baseTask = {
  skills: ['技能', '选择技能', 'DeepSeek V4'] as [string, string, string],
  prompt: '例：查询今日最新的盘前小结',
  frequency: 'weekly' as const,
  weekdays: ['周一', '周五'],
  time: '9:00',
  receivers: ['聚力'],
  messageMode: 'card' as const,
}

export const initialTasks: AutomationTask[] = [
  {
    id: 't1',
    title: '每日热点推送每日热点推送每日热点推送每日热点推送每日热点推送每日热点推送每日热点推送每日热...',
    status: 'running',
    desc: '用户流失背后的真相：APP 热度骤降原因解析用户流失背后的真相：APP 热度骤降原因解析用户流失背后的真相：A...',
    createdAt: '2026-07-20',
    schedule: '每周一至周五，13:00推送',
    channel: '聚力',
    runs: 8,
    lastRun: '08-14 14:30',
    ...baseTask,
    weekdays: ['周一', '周二', '周三', '周四', '周五'],
    time: '13:00',
  },
  {
    id: 't2',
    title: '每日热点推送-下午',
    status: 'running',
    desc: '从大众到冷门，这些 APP 经历了什么',
    createdAt: '2026-07-20',
    schedule: '每周一至周五，13:00推送',
    channel: '聚力',
    runs: 5,
    lastRun: '08-14 14:30',
    ...baseTask,
    weekdays: ['周一', '周二', '周三', '周四', '周五'],
    time: '13:00',
  },
  {
    id: 't3',
    title: '每日热点推送-下午',
    status: 'running',
    desc: '创新还是跟风？APP 生命周期的关键转折点',
    createdAt: '2026-07-20',
    schedule: '每周一至周五，13:00推送',
    channel: '聚力',
    runs: 5,
    lastRun: '08-14 14:30',
    ...baseTask,
    weekdays: ['周一', '周二', '周三', '周四', '周五'],
    time: '13:00',
  },
  {
    id: 't4',
    title: '每日热点推送-下午',
    status: 'running',
    desc: '根据最新数据形成市场情绪与盘前报告',
    createdAt: '2026-07-20',
    schedule: '每周一至周五，13:00推送',
    channel: '聚力',
    runs: 5,
    lastRun: '08-14 14:30',
    ...baseTask,
    weekdays: ['周一', '周二', '周三', '周四', '周五'],
    time: '13:00',
  },
  {
    id: 't5',
    title: '每日热点推送-下午',
    status: 'running',
    desc: '推送当天热点资讯',
    createdAt: '2026-07-20',
    schedule: '每周一至周五，13:00推送',
    channel: '聚力',
    runs: 5,
    lastRun: '08-14 14:30',
    ...baseTask,
    weekdays: ['周一', '周二', '周三', '周四', '周五'],
    time: '13:00',
  },
  {
    id: 't6',
    title: '每日热点推送-下午',
    status: 'done',
    desc: '推送当天热点资讯',
    createdAt: '2026-07-20',
    schedule: '每周一至周五，13:00推送',
    channel: '聚力',
    runs: 5,
    lastRun: '08-14 14:30',
    ...baseTask,
    weekdays: ['周一', '周二', '周三', '周四', '周五'],
    time: '13:00',
  },
  {
    id: 't7',
    title: '每日热点推送-下午',
    status: 'done',
    desc: '推送当天热点资讯',
    createdAt: '2026-07-20',
    schedule: '每周一至周五，13:00推送',
    channel: '聚力',
    runs: 5,
    lastRun: '08-14 14:30',
    ...baseTask,
    weekdays: ['周一', '周二', '周三', '周四', '周五'],
    time: '13:00',
  },
]

/** 任务的历史执行记录（编辑弹窗右栏） */
export const taskRecords = [
  { at: '03-14 14:30', ok: true },
  { at: '03-14 09:00', ok: true },
  { at: '03-13 14:30', ok: true },
  { at: '03-13 13:00', ok: true },
  { at: '03-13 10:00', ok: true },
  { at: '03-13 10:20', ok: true },
  { at: '03-13 18:00', ok: true },
  { at: '03-13 20:00', ok: true },
]

export type Template = {
  id: string
  name: string
  desc: string
  uses: number
}

/** 「从模板创建」页的模板卡片 */
export const templates: Template[] = [
  {
    id: 'tp1',
    name: '筛选价值信息',
    desc: '关注垂直 AI 领域的重要动态，覆盖 AI coding 与具身智能方向，筛选 3-5 条有价值的推送，附解读。',
    uses: 4657,
  },
  {
    id: 'tp2',
    name: '新闻快讯整理',
    desc: '整理本报告要包含的 FPI 与 bonus 情况，并对影响、已关注重点做讨论，输出一份简报，语境更生动。',
    uses: 4657,
  },
  {
    id: 'tp3',
    name: '股市早盘提醒',
    desc: '监控早盘标数据与实时行情，生成动态趋势图表，辅助投资决策，支持多维度趋势判断。',
    uses: 4657,
  },
  {
    id: 'tp4',
    name: '会前资料准备',
    desc: '基于历史数据与新闻情绪，构建多维度神经网络模型，提升会议讨论的准确度。',
    uses: 4657,
  },
  {
    id: 'tp5',
    name: '每周工作简报',
    desc: '整理本周报告中的 FPI 与 bonus 情况，并对数据、已关注重点做讨论，输出一份简报，语境更生动。',
    uses: 4657,
  },
  {
    id: 'tp6',
    name: '日程预约',
    desc: '自动提取报表与利润表关键数据，提供重点解析与风险提示，适合初学者与小额企业。',
    uses: 4657,
  },
  {
    id: 'tp7',
    name: '每日推荐',
    desc: '支持多种因子模型构建与交易策略开发，内置回测系统，助力实现自动化交易。',
    uses: 4657,
  },
  {
    id: 'tp8',
    name: '每日推荐',
    desc: '支持多种因子模型构建与交易策略开发，内置回测系统，助力实现自动化交易。',
    uses: 4657,
  },
  {
    id: 'tp9',
    name: '投资者教育',
    desc: '提供金融基础知识与投资策略的在线课程，配合实际案例分析，提升投资者素养。',
    uses: 4657,
  },
  {
    id: 'tp10',
    name: '多资产配置',
    desc: '提供股票、债券、商品等多资产配置方案，实现风险与收益平衡。',
    uses: 4657,
  },
  {
    id: 'tp11',
    name: '财务健康监测',
    desc: '实时监控企业财务指标，便于快速响应财务风险。',
    uses: 4657,
  },
]
