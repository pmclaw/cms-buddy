import React, { useEffect, useMemo, useState } from 'react';
import { Icon, Tabs } from '../../components/Common.jsx';
import { FilledIcon } from '../../components/FilledIcon.jsx';
import { Tooltip } from '../../components/Tooltip.jsx';
import { LineChart, fmtNum, TrendBadge } from '../../components/LineChart.jsx';
import html2canvas from 'html2canvas';
import {
  OPS_SPACES, OPS_CHANNELS, OPS_DEPARTMENTS,
  SPACE_CHANNEL_TASKS, SPACE_CHANNEL_AUTO_CREATED, SPACE_CHANNEL_RUNNING,
  SERIES_30D, OVERVIEW_TOP, OVERVIEW_BOTTOM,
  MONITOR_TOP, MONITOR_BOTTOM, MONITOR_TREND, MONITOR_LATENCY,
  AUTO_STATS, AUTO_TREND, TEMPLATE_TOP10,
  USAGE_BY_CHANNEL, USAGE_BY_SPACE, USAGE_BY_BRANCH, USAGE_BY_DEPT, USAGE_BY_GROUP, USAGE_BY_USER,
  ASSET_CURRENT, ASSET_TREND, SPACE_CAPABILITIES, SPACE_USAGE, USAGE_SUMMARY_TREND,
  RANK_EXPERT, RANK_SKILL, RANK_TOOL,
  RANK_SPACE, RANK_USER, BRANCH_USAGE,
} from '../../data/dashboard.js';

const TOTAL_TASKS = 168360;
const DEPT_TASKS = { 数字化办公室: 46820, 财富管理部: 52340, 机构业务部: 38650, 托管业务部: 27940 };
const TIME_RANGES = [
  { key: 'all', label: '全部' },
  { key: 'today', label: '今日' },
  { key: 'yesterday', label: '昨日' },
  { key: '7d', label: '近7日' },
  { key: '30d', label: '近30天' },
  { key: 'custom', label: '自定义' },
];
// 空间 / 渠道筛选时自动任务相关指标的缩放权重
const SPACE_AUTO_W = { 小招Buddy: 0.38, 营销Buddy: 0.35, 财客Buddy: 0.27 };

/* ============ 小工具 ============ */
// 当前筛选下的任务量（空间×渠道矩阵优先）
function tasksBySpaceChannel(space, channel) {
  if (space && channel) return SPACE_CHANNEL_TASKS[space][OPS_CHANNELS.indexOf(channel)] || 0;
  if (space) return SPACE_CHANNEL_TASKS[space].reduce((a, b) => a + b, 0);
  if (channel) {
    const idx = OPS_CHANNELS.indexOf(channel);
    return OPS_SPACES.reduce((s, sp) => s + (SPACE_CHANNEL_TASKS[sp][idx] || 0), 0);
  }
  return TOTAL_TASKS;
}
// 按时间范围切分 30 天序列
function sliceSeries(full, range, from, to) {
  const dates = full.dates || [];
  let idxs = dates.map((_, i) => i);
  if (range === 'today') idxs = [dates.length - 1];
  else if (range === 'yesterday') idxs = [dates.length - 2];
  else if (range === '7d') idxs = dates.map((_, i) => i).slice(-7);
  else if (range === 'custom' && from && to) {
    const a = new Date(2026, Number(from.slice(5, 7)) - 1, Number(from.slice(8, 10)));
    const b = new Date(2026, Number(to.slice(5, 7)) - 1, Number(to.slice(8, 10)));
    idxs = dates
      .map((_, i) => i)
      .filter((i) => {
        const [m, d] = dates[i].split('/').map(Number);
        const t = new Date(2026, m - 1, d);
        return t >= a && t <= b;
      });
  }
  const pick = (arr) => (arr || []).filter((_, i) => idxs.includes(i));
  const out = {};
  Object.keys(full).forEach((k) => { out[k] = pick(full[k]); });
  return out;
}

/* ============ 指标卡 ============ */
function StatCard({ icon, color, label, value, unit, trend, sub, reverse, fmt, tip, hideTrend }) {
  return (
    <div
      className="card"
      style={{
        padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative',
        background: '#FFFFFF', border: '1px solid #EEF0F4', borderRadius: 10,
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 20px -10px ${color}55`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* 顶部行：圆形主题色图标 + 标签 + i */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: color + '15', color, flexShrink: 0,
        }}>
          <FilledIcon name={icon} size={15} />
        </div>
        <span style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.35, flex: 1, display: 'inline-flex', alignItems: 'flex-start', gap: 4 }}>
          {label}
          {tip && <Tooltip text={tip} />}
        </span>
      </div>
      {/* 数值行 */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: color, letterSpacing: -0.5, lineHeight: 1.1 }}>
          {fmt ? fmtNum(value) : (value ?? '—')}
        </span>
        {unit && <span style={{ fontSize: 13, fontWeight: 500, color: '#9CA3AF' }}>{unit}</span>}
        {trend != null && !hideTrend && <TrendBadge trend={trend} reverse={reverse} />}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: -4 }}>{sub}</div>}
    </div>
  );
}

function SectionCard({ title, tip, extra, children }) {
  return (
    <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid #F2F4F7',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>{title}</span>
          {tip && <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 8 }}>{tip}</span>}
        </div>
        {extra}
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

// 平铺趋势图卡片（带标题，用于趋势直铺展示）
function TrendCard({ title, tip, children }) {
  return (
    <div className="card" style={{ padding: '14px 16px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 10 }}>
        {title}
        {tip && <Tooltip text={tip} />}
      </div>
      {children}
    </div>
  );
}

// 漏斗图：按阶段展示指标体量（宽度按最大值比例，梯形收窄）
// 漏斗图 v2：居中递进梯形 + 转换率标注 + 并行分支分叉展示
function FunnelChart({ stages }) {
  const max = Math.max(...stages.flatMap((s) => (s.group ? s.children.map((c) => c.value) : [s.value])));
  const colors = ['#3B82F6', '#8B5CF6', '#E89E57', '#10B981'];
  // 上一环节基准值：若上一环节是并行组，取其"进入下一环节"分支值（推送卡片）
  const prevValue = (i) => {
    for (let j = i - 1; j >= 0; j--) {
      const p = stages[j];
      return p.group ? p.children[0].value : p.value;
    }
    return null;
  };
  const barStyle = (value, color, terminal) => ({
    height: 38, position: 'relative',
    background: `linear-gradient(180deg, ${color}cc, ${color})`,
    clipPath: 'polygon(4% 0, 96% 0, 100% 100%, 0 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: terminal ? 'none' : `0 6px 14px -8px ${color}88`,
    ...(terminal ? { outline: '1px dashed #CBD5E1', outlineOffset: -3 } : {}),
  });
  return (
    <div style={{ padding: '14px 6px', maxWidth: 780, margin: '0 auto' }}>
      {stages.map((s, i) => {
        const prev = prevValue(i);
        const rate = prev ? ((s.group ? s.children[0].value + s.children[1].value : s.value) / prev) * 100 : null;
        const arrow = i < stages.length - 1 && (
          <div style={{ textAlign: 'center', color: '#C7CED8', fontSize: 15, lineHeight: 1.5, letterSpacing: 2 }}>↓</div>
        );
        if (s.group) {
          return (
            <div key={s.group}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 150, fontSize: 13, color: '#4B5563', flexShrink: 0, textAlign: 'right' }}>{s.group}</span>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 14 }}>
                  {s.children.map((c) => (
                    <div key={c.label} style={{ width: `${Math.max((c.value / max) * 100 * 0.72, 15)}%`, minWidth: 110, textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: '#4B5563', marginBottom: 5, whiteSpace: 'nowrap' }}>
                        {c.label}
                      </div>
                      <div style={barStyle(c.value, colors[i], c.terminal)}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{c.value.toLocaleString('en-US')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <span style={{ width: 108, fontSize: 12, color: '#9CA3AF', flexShrink: 0 }}>{rate != null ? `转化率 ↓${rate.toFixed(1)}%` : ''}</span>
              </div>
              {arrow}
            </div>
          );
        }
        return (
          <div key={s.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ width: 150, fontSize: 13, color: '#4B5563', flexShrink: 0, textAlign: 'right' }}>{s.label}</span>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: `${Math.max((s.value / max) * 100 * 0.72, 12)}%`, ...barStyle(s.value, colors[i], false) }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{s.value.toLocaleString('en-US')}</span>
                </div>
              </div>
              <span style={{ width: 108, fontSize: 12, color: '#9CA3AF', flexShrink: 0 }}>{rate != null ? `转化率 ↓${rate.toFixed(1)}%` : ''}</span>
            </div>
            {arrow}
          </div>
        );
      })}
    </div>
  );
}

// 竖向柱状图：按分类展示分布（高度按最大值比例）
function BarChart({ data, color = '#E89E57' }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, padding: '8px 4px', height: 190 }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1F2937' }}>{d.value}</span>
          <div style={{
            width: '100%', maxWidth: 44, minHeight: 4,
            height: `${(d.value / max) * 120}px`,
            borderRadius: '5px 5px 0 0',
            background: `linear-gradient(180deg, ${color}, ${color}88)`,
          }} />
          <span style={{ fontSize: 11, color: '#6B7280', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// 多指标合并趋势卡：默认全览，点击图例可仅展示单个指标，再点恢复全览
function MultiTrendCard({ title, tip, series, labels, yFmt }) {
  const [active, setActive] = useState(null); // null=全览, key=单指标
  const shown = active ? series.filter((s) => s.key === active) : series;
  return (
    <div className="card" style={{ padding: '14px 16px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>
          {title}
        </span>
        {tip && <Tooltip text={tip} />}
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
          {series.map((s) => {
            const on = active === s.key;
            const single = active !== null;
            return (
              <button
                key={s.key}
                onClick={() => setActive(on ? null : s.key)}
                title={on ? '恢复全览' : `仅查看${s.name}`}
                style={{
                  padding: '2px 10px', borderRadius: 999, fontSize: 11, cursor: 'pointer',
                  border: '1px solid', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  ...(on
                    ? { background: s.color, borderColor: s.color, color: '#fff' }
                    : single
                      ? { background: '#F3F4F6', borderColor: '#E5E7EB', color: '#9CA3AF' }
                      : { background: s.color + '14', borderColor: s.color + '55', color: s.color }),
                }}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>
      <LineChart
        series={shown.map(({ name, data, color }) => ({ name, data, color }))}
        labels={labels} yFmt={yFmt}
      />
    </div>
  );
}

// Tab 区域靠左对齐（去掉左侧间距）
function FlushTabs(props) {
  return (
    <div className="tab-nav-flush">
      <Tabs {...props} />
    </div>
  );
}

const TABLE_TH = { padding: '9px 12px', fontSize: 12, color: '#6B7280', textAlign: 'left', borderBottom: '1px solid #F2F4F7', whiteSpace: 'nowrap' };
const TABLE_TD = { padding: '9px 12px', fontSize: 13, color: '#4B5563', borderBottom: '1px solid #F7F8FA', whiteSpace: 'nowrap' };

function DataTable({ columns, rows, empty = '暂无数据', pageable = false, pageSize = 10 }) {
  const [page, setPage] = useState(0);
  if (!rows || rows.length === 0) {
    return <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>{empty}</div>;
  }
  const total = rows.length;
  const pages = Math.max(Math.ceil(total / pageSize), 1);
  const cur = Math.min(page, pages - 1);
  const shown = pageable && pages > 1 ? rows.slice(cur * pageSize, (cur + 1) * pageSize) : rows;
  const pageBtn = (label, onClick, disabled) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '3px 12px', borderRadius: 6, fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
        border: '1px solid #E5E7EB', background: '#fff', color: disabled ? '#D1D5DB' : '#4B5563',
      }}
    >{label}</button>
  );
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key} width={c.width} style={TABLE_TH}>{c.title}</th>)}</tr>
        </thead>
        <tbody>
          {shown.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} style={TABLE_TD}>{c.render ? c.render(r, i) : r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pageable && pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '16px 0 8px' }}>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>共 {total} 条</span>
          {pageBtn('上一页', () => setPage(cur - 1), cur === 0)}
          <span style={{ fontSize: 12, color: '#6B7280' }}>{cur + 1} / {pages}</span>
          {pageBtn('下一页', () => setPage(cur + 1), cur === pages - 1)}
        </div>
      )}
    </div>
  );
}

// 数据排行榜各组表头列定义
const RANK_COLS = {
  // 专家 / 技能 / 工具
  expert: [
    { key: 'rank', title: '排名', width: 44 },
    { key: 'name', title: '专家助理名称', flex: true },
    { key: 'count', title: '召唤使用次数', width: 100, align: 'right' },
  ],
  skill: [
    { key: 'rank', title: '排名', width: 44 },
    { key: 'name', title: '技能名称', flex: true },
    { key: 'count', title: '调用次数', width: 84, align: 'right' },
  ],
  tool: [
    { key: 'rank', title: '排名', width: 44 },
    { key: 'name', title: '工具名称', flex: true },
    { key: 'count', title: '调用次数', width: 84, align: 'right' },
  ],
  // Buddy空间
  spaceUsers: [
    { key: 'rank', title: '排名', width: 44 },
    { key: 'name', title: '空间名称', flex: true },
    { key: 'count', title: '使用用户', width: 84, align: 'right' },
  ],
  spaceProactive: [
    { key: 'rank', title: '排名', width: 44 },
    { key: 'name', title: '空间名称', flex: true },
    { key: 'count', title: '主动提问次数', width: 96, align: 'right' },
  ],
  spaceTriggers: [
    { key: 'rank', title: '排名', width: 44 },
    { key: 'name', title: '空间名称', flex: true },
    { key: 'count', title: '任务触发次数', width: 96, align: 'right' },
  ],
  // 用户
  userProactive: [
    { key: 'rank', title: '排名', width: 44 },
    { key: 'name', title: '姓名', flex: true },
    { key: 'dept', title: '所属部门', width: 80 },
    { key: 'lastActive', title: '最近使用时间', width: 90 },
    { key: 'count', title: '使用次数', width: 80, align: 'right' },
  ],
  userCreated: [
    { key: 'rank', title: '排名', width: 44 },
    { key: 'name', title: '姓名', flex: true },
    { key: 'dept', title: '所属部门', width: 80 },
    { key: 'lastActive', title: '最近使用时间', width: 90 },
    { key: 'count', title: '创建数量', width: 80, align: 'right' },
  ],
  userTriggers: [
    { key: 'rank', title: '排名', width: 44 },
    { key: 'name', title: '姓名', flex: true },
    { key: 'dept', title: '所属部门', width: 80 },
    { key: 'lastActive', title: '最近使用时间', width: 90 },
    { key: 'count', title: '触发次数', width: 80, align: 'right' },
  ],
};

// 排名角标（前 3 名高亮）
function RankBadge({ n }) {
  const top = n <= 3;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 22, height: 22, borderRadius: 6,
      background: top ? '#E89E57' + '22' : '#F2F4F7',
      color: top ? '#E89E57' : '#9CA3AF',
      fontSize: 12, fontWeight: 600,
    }}>{n}</span>
  );
}

// 三个竖点下拉菜单（导出数据 / 导出为图片等）
function MoreMenu({ items, size = 15, color = '#6B7280' }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        title="更多操作"
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, color, display: 'inline-flex', alignItems: 'center' }}
      >
        <Icon name="more" size={size} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 50, minWidth: 132,
            background: '#fff', border: '1px solid #EEF0F4', borderRadius: 8,
            boxShadow: '0 8px 24px -10px rgba(0,0,0,0.2)', padding: 4,
          }}>
            {items.map((it) => (
              <div
                key={it.label}
                onClick={() => { setOpen(false); it.onClick && it.onClick(); }}
                style={{ padding: '8px 14px', fontSize: 13, color: '#4B5563', cursor: 'pointer', borderRadius: 6 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F7F8FA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >{it.label}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// 一级 Tab 导航（突出样式，区别于页面内二级 Tab）
function TopTabNav({ active, onChange, space, extra }) {
  const tabs = [
    { key: 'trend', label: '整体趋势概览', icon: 'monitor' },
    { key: 'auto', label: '自动化任务', icon: 'auto' },
    { key: 'asset', label: '资产与调用情况', icon: 'package' },
    { key: 'space', label: 'Buddy空间总览', icon: 'building' },
    { key: 'rank', label: '数据排行榜', icon: 'tasks' },
    // 选中具体空间时，空间总览为单空间视角，隐藏整体空间总览 Tab
  ].filter((t) => !(t.key === 'space' && space));
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      borderBottom: '1px solid #E5E7EB',
      background: '#fff',
      marginBottom: 16,
    }}>
      {tabs.map((t, i) => {
        const on = active === t.key;
        const color = on ? '#E89E57' : '#6B7280';
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '12px 28px', cursor: 'pointer',
              fontSize: 14, fontWeight: on ? 600 : 500, color,
              background: 'transparent', border: 'none',
              borderBottom: on ? '3px solid #E89E57' : '3px solid transparent',
              borderRight: i < tabs.length - 1 ? '1px solid #F2F4F7' : 'none',
              transition: 'all 0.15s',
              marginBottom: on ? '-1px' : 0, // 选中下划线对齐 Tab 行底线
            }}
            onMouseEnter={(e) => { if (!on) e.currentTarget.style.color = '#1F2937'; }}
            onMouseLeave={(e) => { if (!on) e.currentTarget.style.color = '#6B7280'; }}
          >
            <FilledIcon name={t.icon} size={14} />
            {t.label}
          </button>
        );
      })}
      {extra && <div style={{ marginLeft: 'auto', paddingRight: 8 }}>{extra}</div>}
    </div>
  );
}

/* ============ 主页面 ============ */
export function BuddyDashboard() {
  // ---- 一级 Tab ----
  const [topTab, setTopTab] = useState('trend');

  // ---- 顶部筛选 ----
  const [range, setRange] = useState('30d');
  const [customFrom, setCustomFrom] = useState('2026-07-17');
  const [customTo, setCustomTo] = useState('2026-08-15');
  const [space, setSpace] = useState('');
  const [dept, setDept] = useState('');

  // 细分页签状态

  // 累计口径：隐藏所有卡片指标上的同比
  const hideTrend = range === 'all';

  // 选中具体空间时，若停留在"Buddy空间总览"Tab，自动切回整体趋势概览
  useEffect(() => {
    if (topTab === 'space' && space) setTopTab('trend');
  }, [space, topTab]);

  // ---- 筛选联动计算 ----
  const view = useMemo(() => {
    const s = sliceSeries(SERIES_30D, range, customFrom, customTo);
    const taskN = tasksBySpaceChannel(space, '');
    const scale = (taskN / TOTAL_TASKS) * (dept ? DEPT_TASKS[dept] / TOTAL_TASKS : 1);
    const autoScale = space ? SPACE_AUTO_W[space] : 1;
    // 渠道列表：选空间时展示该空间各渠道；否则全量
    const byChannel = space
      ? OPS_CHANNELS.map((c, i) => ({
          name: c,
          tasks: SPACE_CHANNEL_TASKS[space][i],
          created: SPACE_CHANNEL_AUTO_CREATED[space][i],
          running: SPACE_CHANNEL_RUNNING[space][i],
          triggers: Math.round(SPACE_CHANNEL_TASKS[space][i] * 0.36),
        })).sort((a, b) => b.tasks - a.tasks)
      : USAGE_BY_CHANNEL;
    // 空间列表：选渠道时展示各空间该渠道；否则全量
    const bySpace = USAGE_BY_SPACE;
    // 其他列表按规模缩放
    const scaleRows = (rows, tKey = 'tasks', tKey2 = 'triggers') =>
      rows.map((r) => ({ ...r, [tKey]: Math.round(r[tKey] * scale), [tKey2]: Math.round(r[tKey2] * scale) }));
    return { s, scale, taskN, autoScale, byChannel, bySpace,
      byBranch: scaleRows(USAGE_BY_BRANCH),
      byDept: scaleRows(USAGE_BY_DEPT),
      byGroup: scaleRows(USAGE_BY_GROUP),
      byUser: scaleRows(USAGE_BY_USER) };
  }, [range, customFrom, customTo, space, dept]);

  // 概览指标（值 × scale）
  const ovTop = OVERVIEW_TOP.map((it) => ({ ...it, value: Math.round(it.value * view.scale) }));
  const ovBottom = OVERVIEW_BOTTOM.map((it) => ({ ...it, value: Math.round(it.value * view.scale) }));
  const autoStats = Object.fromEntries(Object.entries(AUTO_STATS['全部']).map(([kk, vv]) => [kk, Math.round(vv * view.autoScale)]));
  // 营业部使用次数主题：平台总次数口径（标题标注）
  const BRANCH_TOTAL_TASKS = 168360;

  // 空间关联能力（选空间时展示单个，否则全部）
  const caps = space ? SPACE_CAPABILITIES.filter((c) => c.space === space) : SPACE_CAPABILITIES;

  // ---- 导出 CSV ----
  const exportCsv = () => {
    const rows = [
      ['维度', '任务处理次数', '自动化任务创建数', '运行中的自动化任务', '自动化任务触发数'],
      ...view.byChannel.map((r) => ['渠道-' + r.name, r.tasks, r.created, r.running, r.triggers]),
      ...view.bySpace.map((r) => ['空间-' + r.name, r.tasks, r.created, r.running, r.triggers]),
      ...view.byDept.map((r) => ['部门-' + r.name, r.tasks, r.created, r.running, r.triggers]),
      ...view.byUser.map((r) => ['用户-' + r.name, r.tasks, r.created, r.running, r.triggers]),
    ];
    const csv = '\uFEFF' + rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `Buddy运营看板_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // ---- 导出为图片（html2canvas 截取页面主体） ----
  const exportImage = async () => {
    const el = document.querySelector('.page-body');
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#F7F8FA', useCORS: true, logging: false });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `Buddy运营看板_${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  };
  const exportMenu = [
    { label: '导出数据', onClick: exportCsv },
    { label: '导出为图片', onClick: exportImage },
  ];

  const filterSelect = (value, onChange, options, allLabel) => (
    <select className="select" style={{ minWidth: 128 }} value={value} onChange={(e) => { onChange(e.target.value); }}>
      <option value="">{allLabel}</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">Buddy运营看板</h1>
            <div className="page-desc">全方位了解 Buddy 平台的运行与运营情况，支持按时间、空间、部门多维度统计</div>
          </div>
          <div className="page-actions" />
        </div>

        {/* ============ 一、全局筛选区 ============ */}
        <div className="card" style={{ position: 'sticky', top: 0, zIndex: 40, marginBottom: 20, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto', boxShadow: '0 2px 8px -6px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
            {TIME_RANGES.map((t) => (
              <button
                key={t.key}
                className={range === t.key ? 'btn btn-primary' : 'btn btn-default'}
                style={{ minWidth: 0, padding: '4px 12px', fontSize: 12 }}
                onClick={() => setRange(t.key)}
              >{t.label}</button>
            ))}
          </div>
          {range === 'custom' && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#6B7280', flexShrink: 0 }}>
              <input type="date" className="input" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={{ width: 140, padding: '4px 8px' }} />
              <span>至</span>
              <input type="date" className="input" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={{ width: 140, padding: '4px 8px' }} />
            </div>
          )}
          <div style={{ width: 1, height: 24, background: '#E5E7EB', flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
            {filterSelect(space, setSpace, OPS_SPACES, '全部空间')}
            {filterSelect(dept, setDept, OPS_DEPARTMENTS, '全部部门')}
          </div>
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <button className="btn btn-default" onClick={exportImage} style={{ padding: '4px 12px', fontSize: 12 }}>
              <Icon name="copy" size={13} /> 导出为图片
            </button>
          </div>
        </div>

        {/* ============ 二、统计概览指标（始终展示，仅卡片） ============ */}
        <SectionCard title="Buddy运营统计" tip="按当前筛选维度统计（近30天为基准）" extra={<MoreMenu items={exportMenu} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
            {ovTop.map((it) => (
              <StatCard key={it.key} icon={it.icon} color={colorOf(it.key)} label={it.label} value={it.value} unit={it.unit} trend={it.trend} sub={it.sub} fmt={it.fmt} tip={it.tip} hideTrend={hideTrend} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {ovBottom.map((it) => (
              <StatCard key={it.key} icon={it.icon} color={colorOf(it.key)} label={it.label} value={it.value} unit={it.unit} trend={it.trend} fmt={it.fmt} tip={it.tip} hideTrend={hideTrend} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Buddy监控统计" tip="任务执行质量与响应耗时监测" extra={<MoreMenu items={exportMenu} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[...MONITOR_TOP, ...MONITOR_BOTTOM].map((it) => (
              <StatCard key={it.key} icon={iconOf(it.key)} color={monColor(it.key)} label={it.label} value={it.value} unit={it.unit} trend={it.trend} fmt={it.fmt} tip={it.tip} hideTrend={hideTrend} />
            ))}
          </div>
        </SectionCard>

        {/* ============ 三、一级 Tab 导航（始终展示） ============ */}
        <TopTabNav active={topTab} onChange={setTopTab} space={space} extra={<MoreMenu items={exportMenu} />} />

        {/* ============ Tab 一：整体趋势概览（趋势图直接平铺，一行两个） ============ */}
        {topTab === 'trend' && (
          <>
            <SectionCard title="Buddy运营统计趋势" tip="趋势图默认全览，点击图例可仅查看单个指标">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <MultiTrendCard
                  title="使用基本情况"
                  tip="点击图例可仅查看单个指标"
                  series={[
                    { key: 'users', name: '使用人数', data: view.s.activeUsers, color: '#3B82F6' },
                    { key: 'tasks', name: '使用总次数', data: view.s.tasks, color: '#E89E57' },
                  ]}
                  labels={view.s.dates} yFmt={fmtNum}
                />
                <MultiTrendCard
                  title="按使用方式统计"
                  tip="点击图例可仅查看单个指标"
                  series={[
                    { key: 'proactive', name: '主动提问次数', data: view.s.tasks.map((v) => Math.round(v * 0.63)), color: '#8B5CF6' },
                    { key: 'triggers', name: '自动化任务触发次数', data: view.s.tasks.map((v) => Math.round(v * 0.354)), color: '#EF4444' },
                  ]}
                  labels={view.s.dates} yFmt={fmtNum}
                />
              </div>
            </SectionCard>

            <SectionCard title="Buddy监控统计趋势" tip="趋势图默认全览，点击图例可仅查看单个指标">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <MultiTrendCard
                  title="任务执行成功率"
                  tip="点击图例可仅查看单个指标"
                  series={[
                    { key: 'completion', name: '任务完成率(%)', data: MONITOR_TREND.completionRate, color: '#10B981' },
                    { key: 'autoRate', name: '自动化任务触发率(%)', data: MONITOR_TREND.autoTriggerRate, color: '#E89E57' },
                  ]}
                  labels={MONITOR_TREND.dates}
                />
                <MultiTrendCard
                  title="token消耗趋势"
                  tip="输入/输出/总消耗，点击图例可仅查看单个指标"
                  series={[
                    { key: 'in', name: 'token 输入', data: view.s.tokenIn, color: '#3B82F6' },
                    { key: 'out', name: 'token 输出', data: view.s.tokenOut, color: '#8B5CF6' },
                    { key: 'total', name: 'token 总消耗', data: view.s.tokenIn.map((v, i) => v + (view.s.tokenOut[i] || 0)), color: '#E89E57' },
                  ]}
                  labels={view.s.dates} yFmt={fmtNum}
                />
                <MultiTrendCard
                  title="任务平均耗时"
                  tip="点击图例可仅查看单个指标"
                  series={[
                    { key: 'firstToken', name: '首token耗时(s)', data: MONITOR_TREND.firstToken, color: '#3B82F6' },
                    { key: 'done', name: '完成耗时(s)', data: MONITOR_TREND.doneLatency, color: '#8B5CF6' },
                  ]}
                  labels={MONITOR_TREND.dates}
                />
                <TrendCard title="任务平均用时分析" tip="横向条形图对比各环节平均用时，越短越好">
                  <div style={{ padding: '2px 2px' }}>
                    {MONITOR_LATENCY.map((it) => (
                      <div key={it.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                        <span style={{ width: 168, fontSize: 13, color: '#4B5563', flexShrink: 0 }}>{it.label}</span>
                        <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 5, height: 18, overflow: 'hidden' }}>
                          <div style={{
                            width: `${(it.value / Math.max(...MONITOR_LATENCY.map((x) => x.value))) * 100}%`,
                            background: `linear-gradient(90deg, ${it.color}77, ${it.color})`,
                            height: '100%', borderRadius: 5,
                            display: 'flex', alignItems: 'center',
                          }} />
                        </div>
                        <span style={{ width: 76, fontSize: 13, fontWeight: 600, color: '#1F2937', textAlign: 'right' }}>
                          {it.value}s
                    </span>
                  </div>
                ))}
                  </div>
                </TrendCard>
              </div>
            </SectionCard>
          </>
        )}

        {/* ============ Tab 二：自动化任务 ============ */}
        {topTab === 'auto' && (
          <>
            <SectionCard title="统计概览" tip="截止最新数据统计">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <StatCard key="templates" icon="package" color="#E89E57" label="累计模板数" value={autoStats.templates} unit="个" tip="平台已上架的自动化任务模板数量" hideTrend={hideTrend} />
                <StatCard key="created" icon="tasks" color="#3B82F6" label="创建的自动化任务" value={autoStats.created} unit="个" tip="平台累计创建的自动化任务数量" hideTrend={hideTrend} />
                <StatCard key="running" icon="refresh" color="#8B5CF6" label="运行中的任务数" value={autoStats.running} unit="个" tip="当前处于运行状态的自动化任务数量" hideTrend={hideTrend} />
                <StatCard key="subscribed" icon="subscribe" color="#10B981" label="模板订阅人次" value={autoStats.subscribed} unit="人次" tip="用户订阅任务模板的总人次" hideTrend={hideTrend} />
              </div>
            </SectionCard>

            <SectionCard title="任务执行漏斗统计" tip="漏斗各阶段按触发任务去重口径统计">
              <div style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginBottom: 14 }}>
                使用人数：<span style={{ color: '#E89E57', fontWeight: 600 }}>{fmtNum(autoStats.users)} 人</span>
              </div>
              <FunnelChart
                stages={[
                  { label: '触发数', value: autoStats.triggers },
                  {
                    group: '推送内容已读',
                    children: [
                      { label: '推送卡片', value: Math.round(autoStats.exposure * 0.686), terminal: false },
                      { label: '推送全文', value: Math.round(autoStats.exposure * 0.314), terminal: true },
                    ],
                  },
                  { label: '任务执行详情已阅', value: autoStats.views },
                ]}
              />
            </SectionCard>

            <SectionCard title="自动化任务趋势" tip="趋势图默认全览，点击图例可仅查看单个指标">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <MultiTrendCard
                  title="使用人数"
                  tip="使用总人数 / 模板订阅人数，点击图例可仅查看单个指标"
                  series={[
                    { key: 'users', name: '使用总人数', data: AUTO_TREND.users, color: '#10B981' },
                    { key: 'subscribed', name: '模板订阅人数', data: AUTO_TREND.users.map((v) => Math.round(v * 5.4)), color: '#3B82F6' },
                  ]}
                  labels={AUTO_TREND.dates} yFmt={fmtNum}
                />
                <MultiTrendCard
                  title="任务执行情况"
                  tip="运行中的任务 / 任务触发次数 / 任务创建数，点击图例可仅查看单个指标"
                  series={[
                    { key: 'running', name: '运行中的任务', data: AUTO_TREND.running, color: '#8B5CF6' },
                    { key: 'triggers', name: '任务触发次数', data: AUTO_TREND.triggers, color: '#EF4444' },
                    { key: 'created', name: '任务创建数', data: AUTO_TREND.triggers.map((v) => Math.round(v * (AUTO_STATS['全部'].created / AUTO_STATS['全部'].triggers))), color: '#3B82F6' },
                  ]}
                  labels={AUTO_TREND.dates} yFmt={fmtNum}
                />
              </div>
            </SectionCard>

            {/* 任务触发时段分析：柱状图展示各时段触发次数 */}
            <SectionCard title="任务触发时段分析" tip="按2小时时段统计自动化任务触发次数">
              <BarChart
                data={[
                  { label: '00-02', value: 620 },
                  { label: '02-04', value: 310 },
                  { label: '04-06', value: 280 },
                  { label: '06-08', value: 1890 },
                  { label: '08-10', value: 8940 },
                  { label: '10-12', value: 11240 },
                  { label: '12-14', value: 7280 },
                  { label: '14-16', value: 11250 },
                  { label: '16-18', value: 9540 },
                  { label: '18-20', value: 4860 },
                  { label: '20-22', value: 2260 },
                  { label: '22-24', value: 1164 },
                ]}
                color="#EF4444"
              />
            </SectionCard>

            {/* TOP10 模板 */}
            <SectionCard title="最受欢迎任务模板 TOP10" tip="按模板运行中的用户数排名">
                <DataTable
                  columns={[
                    { key: 'rank', title: '排名', width: 56, render: (_r, i) => <RankBadge n={i + 1} /> },
                    { key: 'name', title: '任务模板名称' },
                    {
                      key: 'source', title: '来源', width: 110,
                      render: (r) => r.source === 'Buddy系统'
                        ? <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: 4, fontSize: 12, background: '#FBF1E5', color: '#B87136' }}>Buddy系统</span>
                        : <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: 4, fontSize: 12, background: '#EFF6FF', color: '#2563EB' }}>{r.source}</span>,
                    },
                    { key: 'createTime', title: '创建时间', width: 110 },
                    { key: 'enabledUsers', title: '运行中用户数', width: 110 },
                    { key: 'subscribed', title: '订阅用户数', width: 110 },
                    { key: 'triggers', title: '触发总次数', width: 110 },
                  ]}
                  rows={TEMPLATE_TOP10}
                />
            </SectionCard>
          </>
        )}

        {/* ============ Tab 三：资产与调用情况 ============ */}
        {topTab === 'asset' && (
          <>
            <SectionCard title="Buddy资产与能力概览" tip="截止最新数据统计">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {ASSET_CURRENT.map((it) => (
                  <StatCard key={it.key} icon={it.icon} color={it.color} label={it.label} value={it.value} unit="个" tip={it.tip} hideTrend={hideTrend} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Skill技能分类分布" tip="截止最新数据统计，按分类统计各分类下的技能数量">
              <BarChart
                data={[
                  { label: '投顾服务', value: 42 },
                  { label: '投研服务', value: 36 },
                  { label: '营销服务', value: 28 },
                  { label: '综合服务', value: 24 },
                  { label: '系统工具', value: 18 },
                  { label: '财富管理', value: 10 },
                ]}
              />
            </SectionCard>

            <SectionCard title="调用情况趋势" tip="专家、技能与工具的调用趋势">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <TrendCard title="Skill 技能调用次数趋势" tip="统计期内技能被调用的总次数">
                  <LineChart series={[{ name: 'Skill 调用次数', data: USAGE_SUMMARY_TREND.skill, color: '#10B981' }]} labels={USAGE_SUMMARY_TREND.dates} yFmt={fmtNum} />
                </TrendCard>
                <TrendCard title="工具调用总次数趋势" tip="统计期内MCP工具被调用的总次数">
                  <LineChart series={[{ name: '工具调用次数', data: USAGE_SUMMARY_TREND.tool, color: '#E89E57' }]} labels={USAGE_SUMMARY_TREND.dates} yFmt={fmtNum} />
                </TrendCard>
                <TrendCard title="专家召唤总次数趋势" tip="统计期内专家助理被召唤的总次数">
                  <LineChart series={[{ name: '专家召唤次数', data: USAGE_SUMMARY_TREND.expert, color: '#3B82F6' }]} labels={USAGE_SUMMARY_TREND.dates} yFmt={fmtNum} />
                </TrendCard>
              </div>
            </SectionCard>
          </>
        )}

        {/* ============ Tab 四：Buddy 空间总览 ============ */}
        {topTab === 'space' && !space && (
          <>
            <SectionCard title="Buddy空间统计" tip="截止最新数据统计">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <StatCard key="spaces" icon="building" color="#3B82F6" label="Buddy空间总数" value={10} unit="个" tip="含上线与下线的全部Buddy空间数量" />
                <StatCard key="online" icon="refresh" color="#10B981" label="上线Buddy空间数" value={8} unit="个" tip="当前处于上线状态的Buddy空间数量" />
                <StatCard key="active" icon="users" color="#E89E57" label="活跃的Buddy空间数" value={5} unit="个" tip="指定时间区间内有用户使用的Buddy空间数量" />
                <StatCard key="added" icon="spark" color="#8B5CF6" label="新增Buddy空间数" value={2} unit="个" tip="统计期内新增的Buddy空间数量" />
              </div>
            </SectionCard>

            <SectionCard title="Buddy空间使用情况">
              <DataTable
                columns={[
                  { key: 'name', title: '空间名称' },
                  { key: 'tasks', title: '使用次数', width: 110 },
                  { key: 'triggers', title: '任务触发次数', width: 110 },
                  { key: 'uv', title: '使用人数', width: 90 },
                  { key: 'expertCalls', title: '专家助理召唤数', width: 120 },
                  { key: 'skillCalls', title: 'Skill技能调用数', width: 120 },
                  { key: 'mcpCalls', title: 'MCP工具调用数', width: 120 },
                ]}
                rows={SPACE_USAGE} pageable
              />
            </SectionCard>

            <SectionCard title={space ? `Buddy空间信息概览 · ${space}` : 'Buddy空间信息概览'}>
              <DataTable
                columns={[
                  { key: 'space', title: '空间名称' },
                  { key: 'createTime', title: '创建时间', width: 120 },
                  { key: 'admin', title: '空间管理员', width: 110 },
                  { key: 'experts', title: '专家助理', width: 120 },
                  { key: 'skills', title: 'Skill 技能', width: 120 },
                  { key: 'mcps', title: 'MCP 服务', width: 120 },
                  { key: 'tools', title: 'MCP 工具', width: 120 },
                ]}
                rows={caps} pageable
              />
            </SectionCard>
          </>
        )}

        {/* ============ Tab 五：数据排行榜 ============ */}
        {topTab === 'rank' && (
          <>
            <SectionCard title="专家/技能/工具使用排行榜" tip="专家、技能与工具调用次数排名">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 10 }}>专家召唤排名</div>
                  <RankList rows={RANK_EXPERT} columns={RANK_COLS.expert} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 10 }}>Skill 技能调用排名</div>
                  <RankList rows={RANK_SKILL} columns={RANK_COLS.skill} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 10 }}>工具调用排名</div>
                  <RankList rows={RANK_TOOL} columns={RANK_COLS.tool} />
                </div>
              </div>

            </SectionCard>

            <SectionCard title="营业部使用排行榜" tip="按营业部维度统计使用情况，占比为占平台总口径的比例">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 10 }}>营业部使用人数</div>
                  <DataTable
                    columns={[
                      { key: 'rank', title: '排名', width: 56, render: (_r, i) => <RankBadge n={i + 1} /> },
                      { key: 'name', title: '营业部' },
                      { key: 'users', title: '使用人数', width: 90 },
                      { key: 'totalUsers', title: '总人数', width: 90 },
                      {
                        key: 'rate', title: '覆盖率', width: 90,
                        render: (r) => <span style={{ color: '#E89E57', fontWeight: 600 }}>{r.rate}</span>,
                      },
                    ]}
                    rows={BRANCH_USAGE.map((r) => ({ ...r, rate: ((r.users / r.totalUsers) * 100).toFixed(1) + '%' }))}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 10 }}>
                    营业部使用次数<span style={{ fontSize: 12, fontWeight: 400, color: '#9CA3AF' }}> · 总次数 {BRANCH_TOTAL_TASKS.toLocaleString('en-US')}</span>
                  </div>
                  <DataTable
                    columns={[
                      { key: 'rank', title: '排名', width: 56, render: (_r, i) => <RankBadge n={i + 1} /> },
                      { key: 'name', title: '营业部' },
                      { key: 'tasks', title: '使用次数', width: 100 },
                      {
                        key: 'rate', title: '使用占比', width: 90,
                        render: (r) => <span style={{ color: '#E89E57', fontWeight: 600 }}>{r.rate}</span>,
                      },
                    ]}
                    rows={BRANCH_USAGE.map((r) => ({ ...r, rate: ((r.tasks / BRANCH_TOTAL_TASKS) * 100).toFixed(1) + '%' }))}
                  />
                </div>
              </div>

            </SectionCard>

            {!space && <SectionCard title="Buddy空间使用排行榜" tip="空间维度的使用情况排名">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 10 }}>用户数量排名</div>
                  <RankList rows={RANK_SPACE.users} columns={RANK_COLS.spaceUsers} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 10 }}>主动提问排名</div>
                  <RankList rows={RANK_SPACE.proactive} columns={RANK_COLS.spaceProactive} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 10 }}>自动化任务触发排名</div>
                  <RankList rows={RANK_SPACE.triggers} columns={RANK_COLS.spaceTriggers} />
                </div>
              </div>

            </SectionCard>}

            <SectionCard title="用户使用排行榜" tip="用户维度的使用情况排名">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 10 }}>主动提问排名</div>
                  <RankList rows={RANK_USER.proactive} columns={RANK_COLS.userProactive} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 10 }}>自动化任务创建排名</div>
                  <RankList rows={RANK_USER.created} columns={RANK_COLS.userCreated} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 10 }}>自动化任务触发排名</div>
                  <RankList rows={RANK_USER.triggers} columns={RANK_COLS.userTriggers} />
                </div>
              </div>

            </SectionCard>
          </>
        )}

      </div>
    </div>
  );
}

// 排名列表（支持表头列配置：rank 徽章 / name 主列 / count 数值列 / 其余字段列）
function RankList({ rows, columns = [] }) {
  return (
    <div>
      {columns.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderBottom: '1px solid #E5E7EB', background: '#FAFAFA', borderRadius: '6px 6px 0 0' }}>
          {columns.map((c) => (
            <span key={c.key} style={{
              width: c.width, fontSize: 12, fontWeight: 600, color: '#6B7280',
              flexShrink: 0, textAlign: c.align || 'left',
              ...(c.flex ? { flex: 1, width: 'auto' } : {}),
            }}>{c.title}</span>
          ))}
        </div>
      )}
      {rows.map((r) => (
        <div key={r.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderBottom: '1px solid #F7F8FA' }}>
          {columns.map((c) => {
            if (c.key === 'rank') {
              return (
                <span key={c.key} style={{ width: c.width, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: r.rank <= 3 ? '#E89E57' + '22' : '#F2F4F7',
                    color: r.rank <= 3 ? '#E89E57' : '#9CA3AF',
                    fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{r.rank}</span>
                </span>
              );
            }
            if (c.key === 'count') {
              return <span key={c.key} style={{ width: c.width, fontSize: 13, fontWeight: 600, color: '#1F2937', textAlign: 'right' }}>{fmtNum(r.count)}</span>;
            }
            return (
              <span key={c.key} style={{
                ...(c.flex
                  ? { flex: 1, fontSize: 13, color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
                  : { width: c.width, fontSize: 12, color: '#9CA3AF', flexShrink: 0 }),
              }} title={c.flex ? r[c.key] : undefined}>{r[c.key]}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// 使用情况表格列定义
function usageColumns(nameTitle, noName) {
  const cols = [];
  if (nameTitle) cols.push({ key: 'name', title: nameTitle });
  cols.push(
    { key: 'tasks', title: '任务处理次数', width: 130 },
    { key: 'created', title: '自动化任务创建数', width: 130 },
    { key: 'running', title: '运行中的自动化任务', width: 140 },
    { key: 'triggers', title: '自动化任务触发数', width: 130 },
  );
  return cols;
}

// 更多明细弹窗
function MoreDetailModal({ tab, data, columns, title, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div className="card" style={{ width: 760, maxHeight: '80vh', overflow: 'auto', padding: 0 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
          <Icon name="close" size={16} color="#9CA3AF" style={{ cursor: 'pointer' }} />
        </div>
        <div style={{ padding: 20 }}>
          <DataTable columns={columns} rows={data} />
        </div>
      </div>
    </div>
  );
}

// 概览指标卡配色
function colorOf(key) {
  const map = {
    users: '#3B82F6', pv: '#10B981', depts: '#10B981', tasks: '#E89E57', perUser: '#3B82F6', proactive: '#8B5CF6', auto: '#EF4444',
    tokenIn: '#3B82F6', tokenOut: '#8B5CF6', expert: '#E89E57', skill: '#10B981', mcp: '#8B5CF6',
  };
  return map[key] || '#E89E57';
}
function iconOf(key) {
  const map = {
    completion: 'check', autoTriggerRate: 'refresh', tokenIn: 'tokenIn', tokenOut: 'tokenOut',
    llmLatency: 'clock', firstToken: 'clock', planLatency: 'clock', doneLatency: 'clock',
  };
  return map[key] || 'monitor';
}
// Buddy监控统计卡片配色（一行 4 卡）
function monColor(key) {
  const map = { completion: '#10B981', autoTriggerRate: '#E89E57', tokenIn: '#3B82F6', tokenOut: '#8B5CF6' };
  return map[key] || '#6B7280';
}
