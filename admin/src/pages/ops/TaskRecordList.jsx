// 任务执行记录：Tab（主动提问 / 自动化任务）+ 下拉筛选 + 关键词搜索 + 明细表格 + 双弹窗
// 列表字段：任务指令(40字/2行) / 操作用户 / 执行时间 / 完整回答(40字截断·2行) / 所属空间 / 执行渠道 /
//          技能与工具调用(调用步骤弹窗) / 用户所属部门 / 用户反馈(赞/踩+建议·截断展开) / 算力(云上·内网) / 执行状态 / 首token耗时 / 完整回答耗时
import React, { useMemo, useState } from 'react';
import { Icon, Empty, Tabs } from '../../components/Common.jsx';
import { Tag } from '../../components/Tag.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { Modal } from '../../components/Overlay.jsx';
import { qaRecords, autoTaskRecords, taskChannels, taskStatuses, tenants } from '../../data/mock.js';

const ANSWER_PREVIEW_LEN = 40;        // 完整回答：默认截取 40 字
const INSTRUCTION_PREVIEW_LEN = 40;   // 任务指令：默认截取 40 字

// 状态 → Tag 颜色
const STATUS_COLOR = { 正常: 'success', 超时: 'warning', 接口报错: 'danger', 已取消: 'default' };
// 调用步骤阶段 → Tag 颜色
const PHASE_COLOR = { 技能加载: 'brand', 工具调用: 'info', 模型生成: 'warning', 消息推送: 'success' };

// 用户反馈 → 下拉固定选项（与记录内 thumb 的映射）
const FEEDBACK_OPTIONS = [
  { label: '点赞', thumb: 'up' },
  { label: '点踩', thumb: 'down' },
  { label: '无反馈', thumb: '' },
];

// 组织架构（部门树）：内部节点为分组（分组名也可能是真实部门，如「托管业务部」）；选中任一节点按
// 「本部门及下属部门」语义匹配，即命中 = 节点自身名 + 全部后代节点名中与记录 userDept 相同者
const DEPT_GROUPS = [
  {
    name: '公司总部',
    children: [
      { name: '数字化办公室' },
      { name: '托管业务部', children: [{ name: '估值核算组' }, { name: '份额登记组' }] },
      { name: '财富管理事业部', children: [{ name: '零售财富中心' }, { name: '机构财富中心' }, { name: '机构销售组' }] },
    ],
  },
  {
    name: '分支机构',
    children: [
      { name: '北京分公司' },
      { name: '上海分公司', children: [{ name: '上海陆家嘴营业部' }] },
      { name: '深圳分公司', children: [{ name: '深圳科技园营业部' }, { name: '深圳深南大道营业部' }] },
    ],
  },
];

// 收集节点子树内全部节点名（自身 + 后代），作为该部门下拉项的可命中部门集合
function collectSubtreeNames(node, acc = []) {
  acc.push(node.name);
  (node.children || []).forEach((c) => collectSubtreeNames(c, acc));
  return acc;
}

// 扁平化为层级下拉选项：value = 节点名，label 按层级缩进，depts = 该节点可命中的部门集合
function flattenDeptOptions(nodes, depth = 0, acc = []) {
  nodes.forEach((n) => {
    acc.push({ key: n.name, label: (depth > 0 ? '　'.repeat(depth) + '· ' : '') + n.name, depts: collectSubtreeNames(n) });
    if (n.children && n.children.length > 0) flattenDeptOptions(n.children, depth + 1, acc);
  });
  return acc;
}
const DEPT_OPTIONS = flattenDeptOptions(DEPT_GROUPS);

// 记录执行时间（YYYY-MM-DD HH:mm:ss）→ 仅取日期部分；非日期型（如「每日定时 10:00」调度描述）返回 null
function execDate(r) {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(r.execTime || '');
  return m ? m[1] : null;
}

// 毫秒 → 可读耗时（<1s 显示 ms，否则显示 s）
function fmtMs(ms) {
  if (ms == null || ms === 0) return '—';
  if (ms < 1000) return ms + 'ms';
  const s = ms / 1000;
  return (s >= 100 ? s.toFixed(0) : s.toFixed(1)) + 's';
}

// 完整回答：默认截取 N 个字
function previewAnswer(text, len = ANSWER_PREVIEW_LEN) {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '…' : text;
}

const FEEDBACK_PREVIEW_LEN = 25; // 用户反馈-建议：默认截取 25 字，超出可点「更多」展开

// 用户反馈单元格：赞/踩徽标 + 建议文本（超出截断，点「更多」行内展开全文，「收起」恢复）
function FeedbackCell({ fb }) {
  const [expanded, setExpanded] = useState(false);
  // 无反馈
  if (!fb || !fb.thumb) {
    return <td style={{ fontSize: 12, color: '#9CA3AF' }}>—</td>;
  }
  const isUp = fb.thumb === 'up';
  const comment = fb.comment || '';
  const needMore = comment.length > FEEDBACK_PREVIEW_LEN;
  const text = expanded ? comment : (needMore ? comment.slice(0, FEEDBACK_PREVIEW_LEN) + '…' : comment);
  return (
    <td>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, maxWidth: 240 }}>
        <span style={{ flexShrink: 0, marginTop: 1 }}>
          <Tag color={isUp ? 'success' : 'danger'}>{isUp ? '赞' : '踩'}</Tag>
        </span>
        {comment && (
          <span style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.7, wordBreak: 'break-word', minWidth: 0, flex: 1 }}>
            {text}
            {needMore && (
              <span
                className="link"
                style={{ marginLeft: 4, whiteSpace: 'nowrap' }}
                onClick={() => setExpanded(!expanded)}
              >{expanded ? '收起' : '更多'}</span>
            )}
          </span>
        )}
      </div>
    </td>
  );
}

export function TaskRecordList() {
  const [tab, setTab] = useState('qa'); // qa 主动提问 | auto 自动化任务
  const [space, setSpace] = useState('');
  const [channel, setChannel] = useState('');
  const [status, setStatus] = useState('');
  const [timeStart, setTimeStart] = useState(''); // 执行时间区间-起（YYYY-MM-DD）
  const [timeEnd, setTimeEnd] = useState('');     // 执行时间区间-止（YYYY-MM-DD）
  const [dept, setDept] = useState('');           // 组织架构-部门
  const [feedback, setFeedback] = useState('');   // 用户反馈：点赞/点踩/无反馈
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [answerDlg, setAnswerDlg] = useState(null); // 完整回答弹窗
  const [stepsDlg, setStepsDlg] = useState(null);   // 技能与工具调用步骤弹窗

  const source = tab === 'qa' ? qaRecords : autoTaskRecords;

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const deptSet = dept ? (DEPT_OPTIONS.find((o) => o.key === dept)?.depts || []) : null;
    return source.filter((r) => {
      if (space && r.tenantName !== space) return false;
      if (channel && r.channel !== channel) return false;
      if (status && r.status !== status) return false;
      // 时间区间：记录须为真实日期，且落在 [timeStart, timeEnd] 内；调度描述型（无日期）在区间筛选时不匹配
      if (timeStart || timeEnd) {
        const d = execDate(r);
        if (!d) return false;
        if (timeStart && d < timeStart) return false;
        if (timeEnd && d > timeEnd) return false;
      }
      // 组织架构部门：命中 = 记录部门属于该下拉节点自身 + 后代部门集合
      if (deptSet && !deptSet.includes(r.userDept)) return false;
      // 用户反馈：点赞(up) / 点踩(down) / 无反馈(无 thumb)
      if (feedback === '点赞' && r.feedback?.thumb !== 'up') return false;
      if (feedback === '点踩' && r.feedback?.thumb !== 'down') return false;
      if (feedback === '无反馈' && r.feedback?.thumb) return false;
      if (k) {
        const hay = (r.user + ' ' + r.userDept + ' ' + r.instruction + ' ' + (r.taskName || '')).toLowerCase();
        if (!hay.includes(k)) return false;
      }
      return true;
    });
  }, [source, space, channel, status, timeStart, timeEnd, dept, feedback, keyword]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const abnormalCount = filtered.filter((r) => r.status !== '正常').length;

  const switchTab = (key) => { setTab(key); setPage(1); };
  const resetFilters = () => { setSpace(''); setChannel(''); setStatus(''); setTimeStart(''); setTimeEnd(''); setDept(''); setFeedback(''); setKeyword(''); setPage(1); };

  const isAuto = tab === 'auto';

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">任务执行记录</h1>
            <div className="page-desc">
              查看所有任务执行的明细记录，覆盖主动提问与自动化任务两类场景，可按空间、渠道、执行状态、执行时间区间、组织架构部门与用户反馈筛选，并可追溯完整回答与技能工具调用链路。
            </div>
          </div>
        </div>

        {/* Tab 页签 */}
        <div className="tab-nav-flush">
          <Tabs
            active={tab}
            onChange={switchTab}
            items={[
              { key: 'qa', label: '主动提问记录' },
              { key: 'auto', label: '自动化任务记录' },
            ]}
          />
        </div>

        {/* 筛选条 */}
        <div className="filter-bar" style={{ flexWrap: 'wrap', borderRadius: '0 8px 8px 8px', marginTop: 12 }}>
          <div className="filter-item">
            <span className="label-inline">Buddy空间</span>
            <select
              className="select"
              value={space}
              onChange={(e) => { setSpace(e.target.value); setPage(1); }}
            >
              <option value="">全部空间</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.brandName}>{t.brandName}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <span className="label-inline">会话渠道</span>
            <select
              className="select"
              value={channel}
              onChange={(e) => { setChannel(e.target.value); setPage(1); }}
            >
              <option value="">全部渠道</option>
              {taskChannels.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <span className="label-inline">执行状态</span>
            <select
              className="select"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">全部状态</option>
              {taskStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {/* 时间：按区间（日期粒度）筛选 */}
          <div className="filter-item">
            <span className="label-inline">时间</span>
            <input
              type="date"
              className="input"
              style={{ width: 148, padding: '6px 8px' }}
              title="开始日期"
              value={timeStart}
              max={timeEnd || undefined}
              onChange={(e) => { setTimeStart(e.target.value); setPage(1); }}
            />
            <span style={{ color: '#9CA3AF', fontSize: 12 }}>至</span>
            <input
              type="date"
              className="input"
              style={{ width: 148, padding: '6px 8px' }}
              title="结束日期"
              value={timeEnd}
              min={timeStart || undefined}
              onChange={(e) => { setTimeEnd(e.target.value); setPage(1); }}
            />
          </div>
          {/* 部门：按组织架构层级筛选（选中节点匹配其整棵子树的叶部门） */}
          <div className="filter-item">
            <span className="label-inline">部门</span>
            <select
              className="select"
              value={dept}
              onChange={(e) => { setDept(e.target.value); setPage(1); }}
              style={{ maxWidth: 220 }}
            >
              <option value="">全部部门</option>
              {DEPT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
          {/* 用户反馈：固定选项 */}
          <div className="filter-item">
            <span className="label-inline">用户反馈</span>
            <select
              className="select"
              value={feedback}
              onChange={(e) => { setFeedback(e.target.value); setPage(1); }}
            >
              <option value="">全部反馈</option>
              {FEEDBACK_OPTIONS.map((f) => (
                <option key={f.label} value={f.label}>{f.label}</option>
              ))}
            </select>
          </div>
          <div className="filter-item" style={{ flex: 1, maxWidth: 320 }}>
            <Icon name="search" size={14} color="#9CA3AF" />
            <input
              className="input"
              placeholder={isAuto ? '搜索用户 / 任务指令' : '搜索用户 / 用户问题'}
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            />
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6B7280', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            共 <strong style={{ color: '#E89E57' }}>{filtered.length}</strong> 条记录
            <span style={{ color: abnormalCount > 0 ? '#DC2626' : '#9CA3AF' }}>
              异常 {abnormalCount} 条
            </span>
          </span>
        </div>

        {/* 明细表格 */}
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: 1610, borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="sticky-col" style={{ minWidth: 220 }}>任务指令</th>
                <th style={{ minWidth: 90 }}>操作用户</th>
                <th style={{ minWidth: 150 }}>{isAuto ? '执行时间' : '提问时间'}</th>
                <th style={{ minWidth: 250 }}>完整回答</th>
                <th style={{ minWidth: 100 }}>所属空间</th>
                <th style={{ minWidth: 100 }}>{isAuto ? '执行渠道' : '提问渠道'}</th>
                <th style={{ minWidth: 100 }}>技能与工具调用</th>
                <th style={{ minWidth: 110 }}>用户所属部门</th>
                <th style={{ minWidth: 240 }}>用户反馈</th>
                <th style={{ minWidth: 100 }}>算力通道</th>
                <th style={{ minWidth: 100 }}>token总消耗</th>
                <th style={{ minWidth: 90 }}>执行状态</th>
                <th style={{ minWidth: 95 }}>首token耗时</th>
                <th style={{ minWidth: 105 }}>完整回答耗时</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr>
                  <td colSpan={14}>
                    <Empty icon="🗒️" tip={keyword || space || channel || status || timeStart || timeEnd || dept || feedback ? '未匹配到执行记录，可调整筛选条件' : '暂无执行记录'} />
                  </td>
                </tr>
              )}
              {paged.map((r) => (
                <tr key={r.id}>
                  {/* 任务指令（固定列） */}
                  <td className="sticky-col">
                    {isAuto && r.taskName && (
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>{r.taskName}</div>
                    )}
                    <div
                      style={{
                        maxWidth: 220,
                        fontSize: 13,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                      title={r.instruction}
                    >{previewAnswer(r.instruction, INSTRUCTION_PREVIEW_LEN)}</div>
                  </td>
                  {/* 操作用户 */}
                  <td style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>{r.user}</td>
                  {/* 提问时间 / 执行时间 */}
                  <td style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.execTime}</td>
                  {/* 完整回答（30字截断 + 详情） */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: 250 }}>
                      <span
                        style={{
                          flex: 1, minWidth: 0,
                          fontSize: 12, color: '#4B5563',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                        title={r.answer}
                      >{previewAnswer(r.answer)}</span>
                      <span className="link" style={{ whiteSpace: 'nowrap', fontSize: 12, flexShrink: 0 }} onClick={() => setAnswerDlg(r)}>
                        查看详情
                      </span>
                    </div>
                  </td>
                  {/* 所属空间 */}
                  <td><span className="tag tag-brand">{r.tenantName}</span></td>
                  {/* 提问渠道 / 执行渠道 */}
                  <td style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.channel}</td>
                  {/* 使用技能与工具：统一查看详情 */}
                  <td>
                    <span className="link" style={{ fontSize: 12, whiteSpace: 'nowrap' }} onClick={() => setStepsDlg(r)}>
                      查看详情
                    </span>
                  </td>
                  {/* 用户所属部门 */}
                  <td style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{r.userDept}</td>
                  {/* 用户反馈：赞/踩 + 建议（截断可展开） */}
                  <FeedbackCell fb={r.feedback} />
                  {/* 算力通道 */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <Tag color={r.computeChannel === '内网算力' ? 'default' : 'info'}>{r.computeChannel}</Tag>
                  </td>
                  {/* token总消耗 */}
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }} title={r.tokenCount + ' Tokens'}>
                    {r.tokenCount.toLocaleString()}
                  </td>
                  {/* 执行状态 */}
                  <td>
                    <Tag color={STATUS_COLOR[r.status] || 'default'}>{r.status}</Tag>
                  </td>
                  {/* 首token耗时 */}
                  <td style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{fmtMs(r.firstTokenMs)}</td>
                  {/* 完整回答耗时 */}
                  <td style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{fmtMs(r.totalTimeMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 10 }}>
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={(p, size) => {
            if (size) setPageSize(size);
            setPage(p);
          }} />
        </div>
      </div>

      {/* 完整回答弹窗 */}
      {answerDlg && <AnswerDialog record={answerDlg} onClose={() => setAnswerDlg(null)} />}
      {/* 技能与工具调用步骤弹窗 */}
      {stepsDlg && <StepsDialog record={stepsDlg} onClose={() => setStepsDlg(null)} />}
    </div>
  );
}

// ========== 完整回答弹窗 ==========
function AnswerDialog({ record: r, onClose }) {
  const metaItems = [
    { label: '操作用户', value: r.user },
    { label: '所属部门', value: r.userDept },
    { label: '执行时间', value: r.execTime },
    { label: '所属空间', value: r.tenantName },
    { label: '执行渠道', value: r.channel },
    { label: '执行状态', value: r.status },
    { label: 'Token消耗', value: r.tokenCount + ' Tokens' },
    { label: '首token耗时', value: fmtMs(r.firstTokenMs) },
    { label: '完整回答耗时', value: fmtMs(r.totalTimeMs) },
  ];

  return (
    <Modal open title="完整回答" onClose={onClose} width="wide" footer={<button className="btn btn-primary" onClick={onClose}>关闭</button>}>
      <div>
        {/* 任务指令 */}
        <div style={{
          padding: '12px 14px', background: '#FBFCFD', border: '1px solid #E5E7EB',
          borderRadius: 8, marginBottom: 14, fontSize: 13, color: '#374151', lineHeight: 1.6,
        }}>
          <span style={{ color: '#9CA3AF', marginRight: 6 }}>任务指令：</span>
          {r.instruction}
        </div>

        {/* 执行信息 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 16px', marginBottom: 14 }}>
          {metaItems.map((m) => (
            <div key={m.label} style={{ fontSize: 12, color: '#6B7280', display: 'flex', gap: 6 }}>
              <span style={{ color: '#9CA3AF', whiteSpace: 'nowrap' }}>{m.label}</span>
              <span style={{ color: '#1F2937', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(m.value)}>
                {m.value}
              </span>
            </div>
          ))}
        </div>

        {/* 错误信息提示 */}
        {r.errorMsg && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C',
            padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 14, lineHeight: 1.6,
          }}>
            <strong>异常信息：</strong>{r.errorMsg}
          </div>
        )}

        {/* 完整回答正文 */}
        <div style={{
          border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid #F2F4F7', background: '#F8F9FB',
            fontSize: 13, fontWeight: 600, color: '#374151',
          }}>
            完整回答
          </div>
          <div style={{
            padding: '14px 16px', fontSize: 13, color: '#1F2937', lineHeight: 1.8,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 420, overflow: 'auto',
          }}>
            {r.answer}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ========== 技能与工具调用详情弹窗 ==========
function StepsDialog({ record: r, onClose }) {
  return (
    <Modal open title="技能与工具调用详情" onClose={onClose} width="wide" footer={<button className="btn btn-primary" onClick={onClose}>关闭</button>}>
      <div>
        {/* 概览：任务指令 + 执行状态 + 总耗时 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', background: '#FBFCFD', border: '1px solid #E5E7EB',
          borderRadius: 8, marginBottom: 14,
        }}>
          <span
            style={{
              fontSize: 13, fontWeight: 600, color: '#1F2937',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 420,
            }}
            title={r.instruction}
          >{r.instruction}</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>执行状态</span>
          <Tag color={STATUS_COLOR[r.status] || 'default'}>{r.status}</Tag>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF' }}>
            总耗时 {fmtMs(r.totalTimeMs)}
          </span>
        </div>

        {/* 调用工具明细清单 */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
          {r.toolSteps.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 16px', borderBottom: i < r.toolSteps.length - 1 ? '1px solid #F2F4F7' : 'none',
                background: i % 2 === 1 ? '#FBFCFD' : '#fff',
              }}
            >
              {/* 序号 */}
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: s.status === '正常' ? '#FBF1E5' : '#FEF2F2',
                color: s.status === '正常' ? '#B87136' : '#B91C1C',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600,
              }}>{i + 1}</div>
              {/* 步骤内容 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Tag color={PHASE_COLOR[s.phase] || 'default'}>{s.phase}</Tag>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{s.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{s.cost}</span>
                  <Tag color={STATUS_COLOR[s.status] || 'default'}>{s.status}</Tag>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
