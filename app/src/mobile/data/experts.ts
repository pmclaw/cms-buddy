import type { CharacterKey } from '@/data/assets'

export type Expert = {
  id: string
  name: string
  tags: [string, string, string]
  desc: string
  uses: number
  likes: number
  downloads: number
  avatar: CharacterKey
  category: string
  featured?: boolean
}

/** 专家助理页顶部的分类导航（沿用设计稿的分类） */
export const expertCategories = [
  { id: 'devops', label: 'DevOps部署' },
  { id: 'efficiency', label: '效率工具' },
  { id: 'research', label: '研究与分析' },
  { id: 'content', label: '内容创作' },
  { id: 'design', label: '设计与UI' },
  { id: 'data', label: '数据与AI' },
  { id: 'docs', label: '文档与创作' },
]

export type SmartAssistant = {
  name: string
  avatar: CharacterKey
  /** chatbot 弹层里的欢迎语与标语 */
  title: string
  slogan: string
  /** 输入框占位文案 */
  placeholder: string
}

/** 移动端专家列表顶部的智能助理入口（头像 + 名称），点击打开各自的 chatbot 弹层 */
export const smartAssistants: SmartAssistant[] = [
  {
    name: '招小顾',
    avatar: 'zhaoxiaogu',
    title: 'Hi，我是招小顾！',
    slogan: '找服务、找助手，就找招小顾',
    placeholder: '问知识、问个股、问热点、问客户…',
  },
  {
    name: '招小数',
    avatar: 'xiaoshu',
    title: 'Hi，我是招小数！',
    slogan: '我是你的智能数据小助理，可以为您解答各种数据问题',
    placeholder: '找数据、找报表、找数据表、找数据标签、查数据口径',
  },
  {
    name: '招小聚',
    avatar: 'zhaoxiaoju',
    title: 'Hi，我是招小聚',
    slogan: '你的办公助手，通过 AI 助力你的高效办公！',
    placeholder: '输入 @ 或 / 选择技能，有问题尽管问我~',
  },
]

export const experts: Expert[] = [
  {
    id: 'stock-qa',
    name: '个股综合问答',
    tags: ['数据', '编程', '图表分析'],
    desc: '使用 Firecrawl 和 exa MCPs 进行多源深度研究，搜索网络、综合发现并交付带有来源引用的报告，适用于日常个股跟踪。',
    uses: 4657,
    likes: 19,
    downloads: 6,
    avatar: 'zhaoxiaoju',
    category: 'data',
    featured: true,
  },
  {
    id: 'portfolio',
    name: '智能投资组合',
    tags: ['数据', '编程', '投资分析'],
    desc: '通过机器学习模型分析生产资产数据，实现风险控制与收益率最大化，支持多维度投资组合方案。',
    uses: 4657,
    likes: 20,
    downloads: 7,
    avatar: 'xiaoshu',
    category: 'data',
    featured: true,
  },
  {
    id: 'market-trend-expert',
    name: '市场趋势分析',
    tags: ['数据', '市场', '预警可视化'],
    desc: '结合行业数据与实时行情，生成动态趋势图表，辅助投资决策，支持多维度趋势判断。',
    uses: 4657,
    likes: 15,
    downloads: 4,
    avatar: 'zhaoxiaogu',
    category: 'research',
    featured: true,
  },
  {
    id: 'price-forecast',
    name: '股价预测模型',
    tags: ['数据', '预测', '深度学习'],
    desc: '基于历史数据与新闻情绪，构建多维度神经网络模型，提升股价趋势预测准确度。',
    uses: 4657,
    likes: 18,
    downloads: 5,
    avatar: 'xiaoyan',
    category: 'data',
  },
  {
    id: 'news-aggregator',
    name: '行业新闻聚合',
    tags: ['数据', '报告', '舆情监测'],
    desc: '实时跟踪并筛选行业相关新闻，自动摘要，并支持关键词订阅提醒，提升信息获取效率。',
    uses: 4657,
    likes: 12,
    downloads: 3,
    avatar: 'image17',
    category: 'content',
  },
  {
    id: 'financial-report',
    name: '财务报表解读',
    tags: ['数据', '入门', '文档解析'],
    desc: '自动提取资产负债表与利润表关键数据，提供重点解析与风险提示，适合初学者与小额企业。',
    uses: 4657,
    likes: 9,
    downloads: 2,
    avatar: 'zhaoxiaoju',
    category: 'docs',
    featured: true,
  },
  {
    id: 'quant-strategy',
    name: '量化交易策略',
    tags: ['数据', '图表', '实时数据'],
    desc: '支持多种因子模型构建与交易策略开发，内置回测系统，助力实现自动化交易。',
    uses: 4657,
    likes: 22,
    downloads: 5,
    avatar: 'xiaoshu',
    category: 'research',
  },
  {
    id: 'risk-assessment',
    name: '投资风险评估',
    tags: ['数据', '审计', '审计分析'],
    desc: '量化分析投资组合风险暴露，提供多维度风险测量及优化建议，帮助降低潜在损失。',
    uses: 4657,
    likes: 14,
    downloads: 6,
    avatar: 'zhaoxiaogu',
    category: 'data',
  },
  {
    id: 'macro-analysis',
    name: '宏观经济分析',
    tags: ['数据', '预测', '趋势预测'],
    desc: '聚合多维度宏观经济数据，构建经济指标预测模型，辅助宏观经济决策洞察。',
    uses: 4657,
    likes: 17,
    downloads: 4,
    avatar: 'xiaoyan',
    category: 'research',
  },
  {
    id: 'financial-health',
    name: '财务健康监测',
    tags: ['数据', '预测', '数据监控'],
    desc: '实时监控企业财务指标，自动预警异常波动，便于快速响应财务风险。',
    uses: 4657,
    likes: 11,
    downloads: 3,
    avatar: 'image17',
    category: 'data',
  },
  {
    id: 'investor-education',
    name: '投资者教育',
    tags: ['数据', '入门', '知识图谱'],
    desc: '提供金融基础知识与投资策略的在线课程，配合实际案例分析，提升投资者素养。',
    uses: 4657,
    likes: 7,
    downloads: 2,
    avatar: 'zhaoxiaoju',
    category: 'content',
  },
  {
    id: 'multi-asset',
    name: '多资产配置',
    tags: ['数据', '预测', '多元优化'],
    desc: '提供股票、债券、商品等多资产配置方案，实现风险与收益平衡。',
    uses: 4657,
    likes: 16,
    downloads: 5,
    avatar: 'xiaoshu',
    category: 'data',
  },
  {
    id: 'sentiment-analysis',
    name: '市场情绪分析',
    tags: ['数据', '舆情', '舆情分析'],
    desc: '通过社交媒体数据与文本情感分析，量化市场情绪变化，辅助投资决策。',
    uses: 4657,
    likes: 13,
    downloads: 4,
    avatar: 'zhaoxiaogu',
    category: 'research',
  },
  {
    id: 'industry-landscape',
    name: '行业竞争格局',
    tags: ['数据', '图表', '趋势洞察'],
    desc: '整理行业主要竞争数据，分析市场份额与动态，助力战略布局。',
    uses: 4657,
    likes: 10,
    downloads: 3,
    avatar: 'xiaoyan',
    category: 'research',
  },
  {
    id: 'esg',
    name: '可持续投资评估',
    tags: ['数据', '审计', 'ESG评估'],
    desc: '评估企业环保、社会与治理表现，筛选符合可持续发展标准的投资标的。',
    uses: 4657,
    likes: 21,
    downloads: 6,
    avatar: 'image17',
    category: 'data',
  },
  {
    id: 'tax-optimization',
    name: '税务优化建议',
    tags: ['数据', '财务', '规划优化'],
    desc: '根据最新税法，提供个性化税务规划与节税策略，提升税务效率。',
    uses: 4657,
    likes: 11,
    downloads: 3,
    avatar: 'zhaoxiaoju',
    category: 'efficiency',
  },
]

/** 专家详情弹窗里的「典型场景提问与问题示例」 */
export const expertExamples = [
  '事件查询：「招商银行最近有什么大事，帮我梳理一下」',
  '涨跌归因：「宁德时代上周为什么跌了 10%，有什么事件驱动？」',
  '复盘速览：「帮我复盘一下中际旭创最近 5 天的事件」',
  '公告解读：「比亚迪发布了什么公告，对股价有什么影响」',
  '财报分析：「分析一下贵州茅台最新发布的财报情况」',
  '异动分析：「XX 股票今天突然拉升是什么原因」',
  '持仓查询：「我持有的贵州茅台最近有什么重要消息」',
  '打板分析：「XX 股票今天涨停是因为什么概念」',
]

export const expertSorts = [
  { id: 'all', label: '全部' },
  { id: 'uses', label: '使用次数' },
  { id: 'users', label: '使用人数' },
  { id: 'likes', label: '点赞数' },
] as const

export type ExpertSort = (typeof expertSorts)[number]['id']
