/**
 * 设计稿资源（全部从 Figma 导出后落地到 src/assets/figma，勿手写替换）。
 */
import avatarImage17 from '@/assets/figma/avatar-image17.png'
import avatarXiaoshu from '@/assets/figma/avatar-xiaoshu.png'
import avatarXiaoyan from '@/assets/figma/avatar-xiaoyan.png'
import avatarZhaoxiaogu from '@/assets/figma/avatar-zhaoxiaogu.png'
import avatarZhaoxiaoju from '@/assets/figma/avatar-zhaoxiaoju.png'
import emptyState from '@/assets/figma/empty-state.png'
import heroMascot from '@/assets/figma/hero-mascot.png'
import iconAutomation from '@/assets/figma/icon-automation.svg'
import iconBookmark from '@/assets/figma/icon-bookmark.svg'
import iconDownload from '@/assets/figma/icon-download.svg'
import iconExpert from '@/assets/figma/icon-expert.svg'
import iconFeedback from '@/assets/figma/icon-feedback.png'
import iconJuli from '@/assets/figma/icon-juli.png'
import iconNewTask from '@/assets/figma/icon-newtask.svg'
import iconSkills from '@/assets/figma/icon-skills.svg'
import iconStar from '@/assets/figma/icon-star.svg'
import iconWechatwork from '@/assets/figma/icon-wechatwork.png'
import logo from '@/assets/figma/logo.svg'

export const assets = {
  logo,
  heroMascot,
  emptyState,
  iconFeedback,
  iconJuli,
  iconWechatwork,
} as const

/** 侧边栏导航图标 */
export const navIcons = {
  newTask: iconNewTask,
  skills: iconSkills,
  expert: iconExpert,
  automation: iconAutomation,
} as const

/** 技能卡片底部的小图标 */
export const cardIcons = {
  star: iconStar,
  bookmark: iconBookmark,
  download: iconDownload,
} as const

/**
 * 角色头像：设计稿用「纯色圆形底 + 人物图按固定窗口裁切」的方式合成。
 * 数值直接来自 Figma 图层（20px 头像下的尺寸/偏移），这里按头像直径等比换算。
 */
export type CharacterKey =
  | 'zhaoxiaoju'
  | 'xiaoshu'
  | 'zhaoxiaogu'
  | 'xiaoyan'
  | 'image17'

type CharacterSpec = {
  src: string
  /** 圆形底色 */
  bg: string
  /** 相对头像直径的尺寸与偏移 */
  w: number
  h: number
  x: number
  y: number
}

export const characters: Record<CharacterKey, CharacterSpec> = {
  zhaoxiaoju: {
    src: avatarZhaoxiaoju,
    bg: '#dfd5e5',
    w: 3.0384,
    h: 4.0693,
    x: -1.0278,
    y: -0.1643,
  },
  xiaoshu: {
    src: avatarXiaoshu,
    bg: '#e3edfe',
    w: 3.6538,
    h: 4.8935,
    x: -1.3128,
    y: -0.25,
  },
  zhaoxiaogu: {
    src: avatarZhaoxiaogu,
    bg: '#fbdad6',
    w: 3.2046,
    h: 4.2955,
    x: -1.1137,
    y: -0.1818,
  },
  xiaoyan: {
    src: avatarXiaoyan,
    bg: '#e3e6eb',
    w: 3.6818,
    h: 4.9318,
    x: -1.3409,
    y: -0.2728,
  },
  image17: {
    src: avatarImage17,
    bg: '#ffd8bd',
    w: 1.5724,
    h: 1.8,
    x: -0.275,
    y: 0,
  },
}

export const characterOrder: CharacterKey[] = [
  'zhaoxiaoju',
  'xiaoshu',
  'zhaoxiaogu',
  'xiaoyan',
  'image17',
]
