import type { CharacterKey } from '@/data/assets'

export type HistoryItem = {
  id: string
  title: string
  time: string
  avatar: CharacterKey
  /** 点击后进入的回答详情页 */
  conversationId: string
}

/** 侧栏「历史对话」列表 */
export const historyChats: HistoryItem[] = [
  {
    id: 'h1',
    title: '细数那些曾经爆红却迅速消失的应用',
    time: '',
    avatar: 'zhaoxiaoju',
    conversationId: 'vanished-apps',
  },
  {
    id: 'h2',
    title: '用户流失背后的真相：APP热度骤降原因解析',
    time: '昨天',
    avatar: 'xiaoshu',
    conversationId: 'heat-drop',
  },
  {
    id: 'h3',
    title: '市场竞争加剧，APP如何保持长期活力？',
    time: '3天前',
    avatar: 'zhaoxiaogu',
    conversationId: 'competition',
  },
  {
    id: 'h4',
    title: '创新还是跟风？APP生命周期的关键转折点',
    time: '5天前',
    avatar: 'xiaoyan',
    conversationId: 'follow-trend',
  },
  {
    id: 'h5',
    title: '市场竞争加剧，APP如何保持长期活力？',
    time: '6天前',
    avatar: 'image17',
    conversationId: 'competition',
  },
]

export const historyCount = 23

/** 侧栏「自动化任务」列表，同样打开回答详情页 */
export const sidebarTasks = [
  { id: 's1', title: '每日热点资讯', time: '今天', conversationId: 'task-daily-hotspot' },
  { id: 's2', title: '每日A股新闻速递', time: '昨天', conversationId: 'task-a-share-news' },
  { id: 's3', title: '自动日报整理', time: '2天前', conversationId: 'task-auto-report' },
  { id: 's4', title: '每周任务自动总结', time: '5天前', conversationId: 'task-weekly-summary' },
  { id: 's5', title: '项目自动扫描', time: '6天前', conversationId: 'task-project-scan' },
]

export const sidebarTaskCount = 4

/** 首页推荐问法 */
export const suggestedPrompts = [
  '每个月客户触达情况怎么样？',
  '研究员的工作量是多少？',
  '今年累计研报数是多少？',
  '帮忙诊断一下招商证券',
  '帮我生成今日最新的盘前小结',
  '查询今日最热门的10条资讯',
  '寒武纪有什么异动，上市公司异动公告触发条件是什么',
  '帮我创建一个自动化任务，周一到周五每天早上8点半给我推送当日盘前小结',
]

export type StepIcon =
  | 'think'
  | 'plan'
  | 'skill'
  | 'tool'
  | 'subtask'
  | 'custom'
  | 'parse'

export type TimelineStep = {
  icon: StepIcon
  label: string
  badge?: string
  duration: string
  title: string
  chip?: string
}

export type AnswerBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'events'; items: { at: string; text: string }[] }

export type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | {
      id: string
      role: 'assistant'
      thinkingLabel: string
      duration: string
      steps?: TimelineStep[]
      blocks: AnswerBlock[]
      disclaimer?: boolean
    }

/** 「任务处理过程」折叠面板里的步骤（自动化任务类回答共用） */
export const longTimeline: TimelineStep[] = [
  {
    icon: 'think',
    label: '深度思考',
    duration: '9.6s',
    title:
      'AI通过5个步骤深入分析问题，调用4类技能，完成数据查询、清洗、分析和结论生成',
  },
  {
    icon: 'plan',
    label: '任务规划',
    badge: 'write_todos',
    duration: '9.6s',
    title: '根据你的意图，我将为你规划任务清单',
  },
  {
    icon: 'skill',
    label: '技能匹配',
    badge: 'read_file',
    duration: '9.6s',
    title: '我将为您匹配合适的技能。 匹配到技能',
    chip: '盘前小结',
  },
  {
    icon: 'tool',
    label: '工具执行',
    badge: 'get_current_time',
    duration: '9.6s',
    title: '获取当前系统最新时间信息',
  },
  {
    icon: 'tool',
    label: '工具执行',
    badge: 'official_secu_news',
    duration: '9.6s',
    title: '查询相关的社交媒体信息',
  },
  {
    icon: 'tool',
    label: '工具执行',
    badge: 'mktLatestSummary',
    duration: '9.6s',
    title: '查询最新的行情信息',
  },
  {
    icon: 'subtask',
    label: '执行子任务',
    badge: 'task',
    duration: '9.6s',
    title: '处理子任务',
  },
  {
    icon: 'custom',
    label: '自定义步骤',
    badge: 'temp',
    duration: '9.6s',
    title: '自定义任务处理步骤描述',
  },
  {
    icon: 'parse',
    label: '内容解析处理',
    badge: 'write_todos',
    duration: '9.6s',
    title: '大模型处理查询结果，为输出答案做准备',
  },
  {
    icon: 'parse',
    label: '内容解析处理',
    badge: 'write_todos',
    duration: '9.6s',
    title: '大模型整理所有数据，马上为您输出答案',
  },
]

export const chartAnswer: ChatMessage = {
  id: 'a1',
  role: 'assistant',
  thinkingLabel: '已完成思考',
  duration: '18s.708ms',
  blocks: [
    { kind: 'heading', text: '一、核心看点' },
    {
      kind: 'bullets',
      items: [
        '**主营**：主营从事电子产品、通信设备及工业气体等制造与销售，涵盖计算机软硬件开发与进出口业务。',
        '**利润增长**：**公司最近三年的净利润分别为 38.37 亿、-6.93 亿、-22.29 亿，年复合增长率为 248.88%**',
        '**机构持仓**：**当前机构持仓比例为 52.38%，相比上期增加 0.88%**',
        '**慷慨大方**：**上市 24 年/分红 13 次，分红记录极好，慷慨大方**',
      ],
    },
    { kind: 'heading', text: '二、基本面分析' },
    {
      kind: 'paragraph',
      text:
        '公司 2025 年三季度营业收入 3545.48 亿元（+7.85%），营收较去年同期继续增長，经营质量有所改善；归母净利润 371.79 亿元（+37.75%），较去年同期增速有所放缓。根据通源所有板块，公司 2022 年~2024 年营业收入分别为 1784.14 亿元、1745.43 亿元、1983.81 亿元；公司 2022 年~2024 年归母净利润分别为 -22.29 亿元、-6.33 亿元、38.37 亿元。',
    },
    { kind: 'heading', text: '异动解析' },
    {
      kind: 'events',
      items: [
        {
          at: '2025-11-11 11:25:00',
          text: '上纬新材盘中大涨，截至 11:25 上涨 5.07%，消息面上，上纬新材将发布 1.8 米全尺寸机器人。',
        },
        {
          at: '2025-11-07 09:30:00',
          text: '上纬新材早盘大涨，截至 09:30 上涨 7.38%，消息面上，智元机器人研发的具身强化学习技术在智元机器人科技合作的认证产线中成功落地，首次实现工业应用，机器人可自主学习优化策略，新线训练周期将发展数十分。',
        },
      ],
    },
  ],
  disclaimer: true,
}

export type Conversation = {
  id: string
  title: string
  messages: ChatMessage[]
}

/** 自动化任务类回答：用户提问 + 任务处理过程 + 回答 */
function taskConversation(
  id: string,
  title: string,
  prompt: string,
  duration: string,
  blocks: AnswerBlock[]
): Conversation {
  return {
    id,
    title,
    messages: [
      { id: 'u1', role: 'user', text: prompt },
      {
        id: 'a1',
        role: 'assistant',
        thinkingLabel: '任务处理过程',
        duration,
        steps: longTimeline,
        blocks,
        disclaimer: true,
      },
    ],
  }
}

export const conversations: Conversation[] = [
  {
    id: 'chart-styles',
    title: '列举所有的图表样式',
    messages: [{ id: 'u1', role: 'user', text: '列举所有的图表样式' }, chartAnswer],
  },
  {
    id: 'pre-market',
    title: '帮我生成今日最新的盘前小结',
    messages: [
      { id: 'u1', role: 'user', text: '帮我生成今日最新的盘前小结' },
      {
        id: 'a1',
        role: 'assistant',
        thinkingLabel: '任务处理过程',
        duration: '5m39s',
        steps: longTimeline,
        blocks: [
          { kind: 'heading', text: '一、盘前要点' },
          {
            kind: 'bullets',
            items: [
              '**隔夜外盘**：美股三大指数集体收涨，纳指涨 1.2%，费城半导体指数涨 2.4%。',
              '**流动性**：央行公开市场净投放 1500 亿元，资金面维持平稳。',
              '**今日关注**：9:30 公布制造业 PMI 数据，10:00 国新办发布会。',
            ],
          },
          { kind: 'heading', text: '二、情绪与热点' },
          {
            kind: 'paragraph',
            text:
              '昨日两融余额环比增加 0.6%，市场情绪修复中；机器人、算力、创新药三条主线资金持续流入，其中机器人板块连续 3 日位居主力净流入首位，短线关注板块内高低切换的节奏。',
          },
          { kind: 'heading', text: '异动解析' },
          {
            kind: 'events',
            items: [
              {
                at: '2026-03-14 09:15:00',
                text: '隔夜美股半导体板块大涨，或对今日 A 股芯片方向形成映射。',
              },
              {
                at: '2026-03-13 15:00:00',
                text: '上纬新材公告获得 1.8 米全尺寸机器人订单，关注产业链扩散机会。',
              },
            ],
          },
        ],
        disclaimer: true,
      },
    ],
  },
  taskConversation(
    'task-daily-hotspot',
    '每日热点资讯',
    '每天推送当日热点资讯，覆盖政策、行业与市场三条线',
    '3m12s',
    [
      { kind: 'heading', text: '一、今日热点速览' },
      {
        kind: 'bullets',
        items: [
          '**政策面**：国常会部署新型基础设施投资，重点支持算力与数据要素。',
          '**行业面**：机器人产业链订单继续放量，人形机器人零部件环节关注度提升。',
          '**市场面**：两市成交额 1.28 万亿元，北向资金净买入 46 亿元。',
        ],
      },
      { kind: 'heading', text: '二、值得跟踪的三条线' },
      {
        kind: 'paragraph',
        text:
          '算力（液冷 / 光模块）、人形机器人（减速器 / 丝杠）、创新药（BD 出海）三条线资金连续三日净流入，建议按“事件驱动 + 业绩兑现”两条逻辑分别跟踪。',
      },
    ]
  ),
  taskConversation(
    'task-a-share-news',
    '每日A股新闻速递',
    '整理昨日 A 股收盘后的重要公告与新闻',
    '2m47s',
    [
      { kind: 'heading', text: '一、公告精选' },
      {
        kind: 'bullets',
        items: [
          '**并购重组**：3 家公司披露发行股份购买资产预案，2 家涉及半导体设备资产。',
          '**回购增持**：8 家公司公告回购计划，合计金额上限 21.6 亿元。',
          '**业绩预告**：5 家公司预告上半年净利同比翻倍，集中在电力设备与化工。',
        ],
      },
      { kind: 'heading', text: '二、今日关注' },
      {
        kind: 'paragraph',
        text: '中报预告披露进入密集期，关注业绩超预期且估值分位偏低的板块；同时留意高送转预期个股的异动风险。',
      },
    ]
  ),
  taskConversation(
    'task-auto-report',
    '自动日报整理',
    '把今天的会议纪要、数据看板整理成一份日报',
    '4m05s',
    [
      { kind: 'heading', text: '一、今日进展' },
      {
        kind: 'bullets',
        items: [
          '**产品**：技能中心 v2 完成灰度，卡片加载耗时下降 38%。',
          '**数据**：日活 12.4 万（+6.2%），人均使用时长 26 分钟。',
          '**风险**：两条自动化任务推送失败，已定位为渠道限流。',
        ],
      },
      { kind: 'heading', text: '二、明日计划' },
      {
        kind: 'paragraph',
        text: '补齐任务推送的失败重试机制；完成技能详情页埋点验收；同步下周版本排期。',
      },
    ]
  ),
  taskConversation(
    'task-weekly-summary',
    '每周任务自动总结',
    '总结本周所有自动化任务的执行情况',
    '6m18s',
    [
      { kind: 'heading', text: '一、执行概览' },
      {
        kind: 'bullets',
        items: [
          '本周共执行 42 次，成功率 95.2%，较上周提升 3.1 个百分点。',
          '最活跃任务：每日热点推送（12 次）、每日A股新闻速递（7 次）。',
          '失败 2 次，均为推送渠道限流导致，已自动重试成功。',
        ],
      },
      { kind: 'heading', text: '二、优化建议' },
      {
        kind: 'paragraph',
        text: '建议把早间任务错峰到 8:20—8:40 之间分散执行，降低同渠道并发；同时为长耗时任务增加失败告警。',
      },
    ]
  ),
  taskConversation(
    'task-project-scan',
    '项目自动扫描',
    '扫描项目里的待办与风险项',
    '1m56s',
    [
      { kind: 'heading', text: '一、扫描结果' },
      {
        kind: 'bullets',
        items: [
          '**待办**：14 项未关闭，其中 3 项已逾期超过 3 天。',
          '**依赖**：2 个上游接口仍未提供联调环境。',
          '**质量**：本周新增单测覆盖率 71%，低于目标 80%。',
        ],
      },
      { kind: 'heading', text: '二、处置建议' },
      {
        kind: 'paragraph',
        text: '优先清理逾期待办并同步责任人；接口联调环境需在本周三前确认；覆盖率缺口建议在灰度前补齐核心链路用例。',
      },
    ]
  ),
  {
    id: 'heat-drop',
    title: '用户流失背后的真相：APP热度骤降原因解析',
    messages: [
      { id: 'u1', role: 'user', text: '用户流失背后的真相：APP热度骤降原因解析' },
      {
        id: 'a1',
        role: 'assistant',
        thinkingLabel: '已完成思考',
        duration: '12s.032ms',
        blocks: [
          { kind: 'heading', text: '一、现象：热度曲线的三个阶段' },
          {
            kind: 'bullets',
            items: [
              '**爆发期**：买量驱动，新增用户在 2 周内见顶。',
              '**回落期**：DAU/MAU 从 0.48 掉到 0.21，留存断层出现在次日。',
              '**沉默期**：推送打开率低于 3%，召回成本高于 LTV。',
            ],
          },
          { kind: 'heading', text: '二、原因归因' },
          {
            kind: 'paragraph',
            text:
              '核心矛盾并不在产品功能，而在「首日价值感」缺失：用户在 90 秒内没有拿到可感知的结果，就会把应用归类为「可替代」。叠加同类产品的价格战，获客与留存同时承压。',
          },
        ],
        disclaimer: true,
      },
    ],
  },
  {
    id: 'competition',
    title: '市场竞争加剧，APP如何保持长期活力？',
    messages: [
      { id: 'u1', role: 'user', text: '市场竞争加剧，APP如何保持长期活力？' },
      {
        id: 'a1',
        role: 'assistant',
        thinkingLabel: '已完成思考',
        duration: '9s.415ms',
        blocks: [
          { kind: 'heading', text: '一、长期活力的三个支点' },
          {
            kind: 'bullets',
            items: [
              '**高频场景**：把功能塞进用户每天必做的动作里，而不是新增入口。',
              '**数据复利**：让每次使用都留下可复用的资产（模板、看板、订阅）。',
              '**生态位**：在竞品生态里找到「不可替代的一环」，避免正面同质化。',
            ],
          },
        ],
        disclaimer: true,
      },
    ],
  },
  {
    id: 'vanished-apps',
    title: '细数那些曾经爆红却迅速消失的应用',
    messages: [
      { id: 'u1', role: 'user', text: '细数那些曾经爆红却迅速消失的应用' },
      {
        id: 'a1',
        role: 'assistant',
        thinkingLabel: '已完成思考',
        duration: '21s.276ms',
        blocks: [
          { kind: 'heading', text: '一、爆红样本的共同特征' },
          {
            kind: 'bullets',
            items: [
              '**Clubhouse**：邀请码制造稀缺，但语音房的内容沉淀能力弱。',
              '**啵乐 / 音遇**：强依赖短视频流量红利，红利退潮后无自有场景。',
              '**Zao 换脸**：单点技术炫技，缺少可持续的使用理由。',
            ],
          },
          { kind: 'heading', text: '二、消失的四个开关' },
          {
            kind: 'paragraph',
            text:
              '爆红往往来自一次高效的分发，而消失来自四件事同时发生：缺少高频场景、内容无法沉淀、社群没有迁移成本、商业化过早伤害体验。任何一款产品只要同时踩中三点，生命周期通常不超过 9 个月。',
          },
        ],
        disclaimer: true,
      },
    ],
  },
  {
    id: 'follow-trend',
    title: '创新还是跟风？APP生命周期的关键转折点',
    messages: [
      { id: 'u1', role: 'user', text: '创新还是跟风？APP生命周期的关键转折点' },
      {
        id: 'a1',
        role: 'assistant',
        thinkingLabel: '已完成思考',
        duration: '14s.882ms',
        blocks: [
          { kind: 'heading', text: '一、转折点出现在「第一次功能复制」' },
          {
            kind: 'paragraph',
            text:
              '当团队开始以竞品的功能清单作为路线图时，产品的差异化就开始流失。真正安全的跟风是补齐「用户已经期待」的能力，而不是追热点式的堆功能。',
          },
          { kind: 'heading', text: '二、判断清单' },
          {
            kind: 'bullets',
            items: [
              '**是否服务于既有场景**：不服务的新功能默认砍掉。',
              '**是否降低使用门槛**：能减少一步操作的功能优先做。',
              '**是否形成数据资产**：能沉淀模板/看板/订阅的功能优先做。',
            ],
          },
        ],
        disclaimer: true,
      },
    ],
  },
]

export function findConversation(id: string | undefined) {
  return conversations.find((item) => item.id === id)
}
