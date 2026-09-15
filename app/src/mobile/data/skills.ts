import type { CharacterKey } from '@/data/assets'

export type SkillCategory = {
  id: string
  label: string
}

/** 技能中心的分类导航 */
export const skillCategories: SkillCategory[] = [
  { id: 'knowledge-qa', label: '知识问答' },
  { id: 'market-news', label: '市场资讯' },
  { id: 'investment-research', label: '投资研究' },
  { id: 'fund-analysis', label: '基金分析' },
  { id: 'product-qa', label: '产品问答' },
  { id: 'customer-service', label: '客户服务' },
  { id: 'staff-growth', label: '员工成长' },
  { id: 'content-creation', label: '内容创作' },
  { id: 'daily-office', label: '日常办公' },
  { id: 'other', label: '其他' },
]

export function skillCategoryLabel(id: string) {
  return skillCategories.find((item) => item.id === id)?.label ?? '其他'
}

export type Skill = {
  id: string
  name: string
  /** 业务归属方 */
  owner: string
  desc: string
  version: string
  rating: string
  bookmarks: number
  downloads: number
  category: string
  featured?: boolean
  avatar: CharacterKey
}

export const skills: Skill[] = [
  {
    id: 'deep-research',
    name: 'Deep-research',
    owner: 'AI创新中心',
    desc: '使用 firecrawl 和 exa MCPs 进行多源深度研究。搜索网络、综合发现并交付带有来源引用的报告。适用于用户调研、竞品与行业趋势分析等场景。',
    version: 'v3.0.0',
    rating: '5.0',
    bookmarks: 23,
    downloads: 6,
    category: 'knowledge-qa',
    featured: true,
    avatar: 'zhaoxiaoju',
  },
  {
    id: 'market-trend',
    name: '市场趋势分析',
    owner: '研究发展中心',
    desc: '利用大数据分析工具监测行业动态，捕捉新兴市场机会，帮助团队制定精准营销策略。',
    version: 'v2.5.1',
    rating: '4.7',
    bookmarks: 37,
    downloads: 8,
    category: 'market-news',
    featured: true,
    avatar: 'xiaoshu',
  },
  {
    id: 'ux-research',
    name: '用户体验调研',
    owner: '客户服务中心',
    desc: '通过用户访谈和行为数据收集，识别痛点和需求，优化产品交互设计，提升客户满意度。',
    version: 'v1.8.4',
    rating: '4.9',
    bookmarks: 42,
    downloads: 7,
    category: 'product-qa',
    featured: true,
    avatar: 'zhaoxiaogu',
  },
  {
    id: 'competitor-monitor',
    name: '竞品监控',
    owner: '研究发展中心',
    desc: '实时跟踪竞争对手产品功能更新与市场活动，分析优劣势，辅助制定差异化竞争策略。',
    version: 'v3.1.2',
    rating: '4.8',
    bookmarks: 15,
    downloads: 5,
    category: 'market-news',
    avatar: 'xiaoyan',
  },
  {
    id: 'tech-docs',
    name: '技术文档整理',
    owner: '数据治理团队',
    desc: '系统归纳项目技术文档，确保知识共享与快速检索，提升团队协作效率。',
    version: 'v2.0.0',
    rating: '5.0',
    bookmarks: 29,
    downloads: 9,
    category: 'daily-office',
    featured: true,
    avatar: 'image17',
  },
  {
    id: 'data-visualization',
    name: '数据可视化',
    owner: '数据治理团队',
    desc: '借助图表和仪表盘工具，将复杂数据转化为易懂的视觉呈现，支持决策分析。',
    version: 'v1.4.7',
    rating: '4.6',
    bookmarks: 33,
    downloads: 3,
    category: 'daily-office',
    avatar: 'zhaoxiaoju',
  },
  {
    id: 'content-strategy',
    name: '内容策略规划',
    owner: '财富管理团队',
    desc: '制定多平台内容计划，提升品牌影响力和用户粘性，优化运营效率。',
    version: 'v2.3.1',
    rating: '4.5',
    bookmarks: 27,
    downloads: 4,
    category: 'content-creation',
    avatar: 'xiaoshu',
  },
  {
    id: 'user-behavior',
    name: '用户行为分析',
    owner: '数据治理团队',
    desc: '通过数据采集和技术分析用户行为，洞察用户偏好，提供和增强运营效果。',
    version: 'v3.3.6',
    rating: '5.0',
    bookmarks: 21,
    downloads: 6,
    category: 'customer-service',
    avatar: 'zhaoxiaogu',
  },
  {
    id: 'project-tracking',
    name: '项目进度跟踪',
    owner: '运营管理部',
    desc: '使用在线工具协助开发流程管理，及时识别风险点，确保项目按时交付。',
    version: 'v2.3.3',
    rating: '4.9',
    bookmarks: 18,
    downloads: 6,
    category: 'daily-office',
    avatar: 'xiaoyan',
  },
  {
    id: 'csat-survey',
    name: '客户满意度调查',
    owner: '托管团队',
    desc: '设计问卷调查并分析反馈数据，提升产品服务质量，增强客户忠诚度。',
    version: 'v1.9.5',
    rating: '4.7',
    bookmarks: 25,
    downloads: 7,
    category: 'customer-service',
    avatar: 'image17',
  },
  {
    id: 'brand-positioning',
    name: '品牌定位研究',
    owner: '财富管理团队',
    desc: '深度挖掘目标市场，研究品牌核心价值，制定差异化品牌策略。',
    version: 'v3.5.1',
    rating: '4.4',
    bookmarks: 30,
    downloads: 3,
    category: 'market-news',
    avatar: 'zhaoxiaoju',
  },
  {
    id: 'product-innovation',
    name: '创新产品设计',
    owner: 'AI创新中心',
    desc: '结合用户需求与最新技术，打造具有突破性的产品体验。',
    version: 'v2.1.4',
    rating: '5.0',
    bookmarks: 15,
    downloads: 6,
    category: 'product-qa',
    avatar: 'xiaoshu',
  },
  {
    id: 'social-media',
    name: '社交媒体运营',
    owner: '财富管理团队',
    desc: '策划和执行社交媒体活动，提升品牌曝光和用户互动。',
    version: 'v1.6.2',
    rating: '4.6',
    bookmarks: 22,
    downloads: 5,
    category: 'content-creation',
    avatar: 'zhaoxiaogu',
  },
  {
    id: 'competitive-assessment',
    name: '竞争优势评估',
    owner: '期货团队',
    desc: '分析行业市场与竞争环境，制定可持续的发展战略。',
    version: 'v2.8.0',
    rating: '4.8',
    bookmarks: 19,
    downloads: 4,
    category: 'investment-research',
    avatar: 'xiaoyan',
  },
  {
    id: 'sales-analytics',
    name: '销售数据分析',
    owner: '数据治理团队',
    desc: '追踪销售数据中的细粒度趋势，优化运营与营销策略。',
    version: 'v3.0.4',
    rating: '4.9',
    bookmarks: 26,
    downloads: 8,
    category: 'investment-research',
    avatar: 'image17',
  },
  {
    id: 'training-material',
    name: '培训材料开发',
    owner: '运营管理部',
    desc: '设计系统化培训内容，提升员工能力和团队执行力。',
    version: 'v1.2.9',
    rating: '4.7',
    bookmarks: 14,
    downloads: 3,
    category: 'staff-growth',
    avatar: 'zhaoxiaoju',
  },
  {
    id: 'high-dividend',
    name: '高股息选股',
    owner: '研究发展中心',
    desc: '高股息定性评分系统——「愿意分 / 分得出 / 分得久」三维框架 + 55/25/20 权重 + 多 agent 并行编排。在港股 34 支股息标的上完成框架沉淀，可跨市场（HK/A/US）复用。',
    version: 'v20260714.0708',
    rating: '—',
    bookmarks: 12,
    downloads: 0,
    category: 'investment-research',
    avatar: 'zhaoxiaoju',
  },
]

export function findSkill(id: string) {
  return skills.find((item) => item.id === id)
}

/** 技能详情页（概览 Tab）的正文内容 */
export const highDividendDetail = {
  source: 'SKILL.md',
  heading: '/high-dividend-scoring — 高股息定性评分系统',
  definitionTitle: '一句话定义',
  definition:
    '把「高股息策略」从静态股息率筛选升级为主动选股框架：股息率只是入场券，真正的 alpha 来自识别「愿意分（治理）+ 分得出（财务）+ 分得久（护城河）」的优质资产。',
  callout: '高股息 ≠ 高分。当前静态股息率不是评分依据，警惕周期高点的「伪高息」。',
  tableTitle: '三维框架快照',
  table: [
    {
      dimension: '公司治理',
      score: '55',
      weight: '55%',
      concept: '愿意分 —— 股东回报文化',
      items: '股权/回报文化(25) + 管理层质量(20) + 资本配置(10)',
    },
    {
      dimension: '财务质量',
      score: '25',
      weight: '25%',
      concept: '分得出 —— 真实盈利与现金创造',
      items: '成长性(8) + 盈利质量(10) + 含金量(7)',
    },
    {
      dimension: '行业护城河',
      score: '20',
      weight: '20%',
      concept: '分得久 —— 长期竞争优势',
      items: '行业壁垒(6) + 竞争优势(7) + 竞争格局(7)',
    },
  ],
  thresholdTitle: '评级阈值',
  threshold: '≥80 优秀 / 60-79 良好 / 40-59 一般 / <40 不投。',
  stepsTitle: '6 步标准流程',
  steps: [
    { label: 'Step 1', text: '前置筛选：沪深港股通标的池（沪深 300 等核心指数）' },
    { label: 'Step 2', text: 'Universe 准备 + 定量硬性门槛（流动性 / 股息率 / ROE / 波动率 / 安全性 / FCF）' },
    { label: 'Step 3', text: '三维定性评分（5 agent 并行，每题 0-10 分）' },
    { label: 'Step 4', text: '加权汇总 + 评级阈值映射' },
    { label: 'Step 5', text: '行业中性化对比，剔除周期高点伪高息' },
    { label: 'Step 6', text: '输出标的清单 + 评分归因卡片' },
  ],
  files: {
    count: 22,
    folders: ['.mcp', 'output', 'prompts', 'templates'],
    items: [
      { name: 'case-studies.md', size: '20.1 KB' },
      { name: 'data-sources.md', size: '11.3 KB' },
      { name: 'governance-context.md', size: '9.3 KB' },
    ],
  },
  meta: [
    { label: '版本', value: 'v20260714.070802', tone: 'plain' as const },
    { label: '下载量', value: '0', tone: 'plain' as const },
    { label: '评分', value: '暂无', tone: 'plain' as const },
    { label: '命名空间', value: 'global', tone: 'tag' as const },
  ],
}
