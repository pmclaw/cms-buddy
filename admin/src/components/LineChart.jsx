import React, { useMemo, useState } from 'react';

// 自研 SVG 折线趋势图（零依赖）
// props:
//   series: [{ name, data: number[], color }]
//   labels: string[]  x 轴标签
//   height: 默认 240
//   yFmt: (v) => string   y 轴数值格式化
//   showDots: 是否在数据点上画圆点（数据点少时开启）
export function LineChart({ series, labels = [], height = 240, yFmt, showDots = false }) {
  const [hover, setHover] = useState(null);

  const W = 720; // 绘图区宽度（viewBox 内）
  const H = height;
  const PAD = { top: 16, right: 16, bottom: 28, left: 52 };
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;

  // 计算 y 轴范围（取所有系列最大值的 1.15 倍，向上取整）
  const { maxY, ticks, tickVals } = useMemo(() => {
    const all = series.flatMap((s) => s.data);
    const max = Math.max(...all, 1);
    const nice = max * 1.18;
    const step = nice / 4;
    const vals = [0, 1, 2, 3, 4].map((i) => Math.round(i * step));
    return { maxY: nice, ticks: vals, tickVals: vals };
  }, [series]);

  const xAt = (i) => PAD.left + (series[0]?.data.length > 1 ? (i * iw) / (series[0].data.length - 1) : PAD.left);
  const yAt = (v) => PAD.top + ih - (v / maxY) * ih;

  // x 轴标签抽样（最多展示 8 个）
  const labelsN = series[0]?.data.length || 0;
  const labelStep = Math.max(1, Math.ceil(labelsN / 8));

  const pathOf = (data) =>
    data.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');

  // hover 提示
  const hoverX = hover != null && series[0] ? xAt(hover) : null;

  return (
    <div style={{ width: '100%' }}>
      {/* 图例 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        {series.map((s) => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
            <span style={{ width: 10, height: 3, borderRadius: 2, background: s.color, display: 'inline-block' }} />
            {s.name}
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
          {/* 网格 + y 轴 */}
          {tickVals.map((tv, i) => (
            <g key={i}>
              <line
                x1={PAD.left} x2={W - PAD.right}
                y1={yAt(tv)} y2={yAt(tv)}
                stroke={i === 0 ? '#E5E7EB' : '#F2F4F7'}
                strokeDasharray={i === 0 ? '' : '4 4'}
              />
              <text x={PAD.left - 8} y={yAt(tv) + 4} textAnchor="end" fontSize={11} fill="#9CA3AF">
                {yFmt ? yFmt(tv) : tv}
              </text>
            </g>
          ))}

          {/* x 轴标签 */}
          {labels.map((lb, i) =>
            i % labelStep === 0 ? (
              <text key={i} x={xAt(i)} y={H - 8} textAnchor="middle" fontSize={11} fill="#9CA3AF">
                {lb}
              </text>
            ) : null
          )}

          {/* 折线 */}
          {series.map((s) => (
            <g key={s.name}>
              <path d={pathOf(s.data)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" opacity={0.92} />
              {/* hover 竖线 */}
              {hoverX != null && (
                <line x1={hoverX} x2={hoverX} y1={PAD.top} y2={PAD.top + ih} stroke="#E5E7EB" strokeDasharray="4 4" />
              )}
              {/* 数据点 */}
              {s.data.map((v, i) => (
                <circle
                  key={i}
                  cx={xAt(i)} cy={yAt(v)} r={hover === i ? 4 : (showDots ? 2.5 : 0)}
                  fill={s.color}
                  stroke="#fff" strokeWidth={1.5}
                />
              ))}
            </g>
          ))}
        </svg>

        {/* hover 浮层 */}
        {hover != null && series[0] && (
          <div style={{
            position: 'absolute', top: 4, left: 0, right: 0, pointerEvents: 'none',
            display: 'flex', justifyContent: 'center',
          }}>
            <div style={{
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 4px 16px -6px rgba(0,0,0,0.15)',
              padding: '8px 12px', fontSize: 12,
            }}>
              <div style={{ fontWeight: 600, color: '#1F2937', marginBottom: 4 }}>{labels[hover]}</div>
              {series.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4B5563', lineHeight: 1.8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: s.color, display: 'inline-block' }} />
                  <span style={{ minWidth: 64 }}>{s.name}</span>
                  <strong style={{ color: '#1F2937' }}>{yFmt ? yFmt(s.data[hover]) : s.data[hover]}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* hover 捕获层 */}
        <div
          style={{ position: 'absolute', top: 0, bottom: 28, left: 0, right: 0, display: 'flex' }}
          onMouseLeave={() => setHover(null)}
        >
          {series[0]?.data.map((_, i) => (
            <div
              key={i}
              style={{ flex: 1, height: '100%' }}
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 通用数字格式化：万/亿
export function fmtNum(v) {
  if (v == null) return '—';
  if (Math.abs(v) >= 100000000) return (v / 100000000).toFixed(2) + '亿';
  if (Math.abs(v) >= 10000) return (v / 10000).toFixed(1) + '万';
  return String(v);
}

// 同比角标组件（红色涨 / 绿色跌，符合中文习惯反向用于耗时类）
export function TrendBadge({ trend, reverse = false }) {
  const up = trend >= 0;
  // reverse 时（耗时类）：数值下降为"好"，显示绿色
  const good = reverse ? trend < 0 : trend >= 0;
  const color = good ? '#10B981' : '#EF4444';
  const arrow = (reverse ? !up : up) ? '↑' : '↓';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      fontSize: 11, color, background: color + '14', borderRadius: 4, padding: '1px 6px',
    }}>
      {arrow} {Math.abs(trend)}%
    </span>
  );
}
