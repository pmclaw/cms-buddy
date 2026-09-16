// Buddy空间管理员 - MCP 工具（卡片视图）
import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon, Empty } from '../../components/Common.jsx';
import { Toggle } from '../../components/Toggle.jsx';
import { Tag } from '../../components/Tag.jsx';

export function TenantMCPs() {
  const { activeTenantId, user } = useRole();
  const { tenants, mcps, setToolGlobal } = useStore();
  const toast = useToast();
  const tenant = tenants.find((t) => t.id === activeTenantId);
  const [keyword, setKeyword] = useState('');
  const [detail, setDetail] = useState(null);

  const associatedMcps = mcps.slice(0, 4);

  const filtered = associatedMcps.filter((m) => {
    if (keyword) return (m.name + m.code + m.desc + m.provider).toLowerCase().includes(keyword.toLowerCase());
    return true;
  });

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">MCP 工具</h1>
            <div className="page-desc">
              查看与本Buddy空间关联的所有 MCP 工具详情，以及各个工具的"全局工具"开关 · 可针对每个工具单独启用或停用
            </div>
          </div>
          <div className="page-actions">
            <Tag color="brand">
              <Icon name="building" size={11} />
              当前Buddy空间：{tenant?.brandName}
            </Tag>
          </div>
        </div>

        <div style={{
          padding: '8px 12px', background: '#EFF6FF',
          border: '1px solid #BFDBFE', borderRadius: 6, marginBottom: 16,
          fontSize: 12, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: 6
        }}>
          <Icon name="doc" size={12} />
          如需关联新的 MCP 服务，请联系平台管理员在"Buddy空间管理 → 构建能力"中关联。
        </div>

        <div className="filter-bar">
          <div className="filter-item">
            <span className="filter-item-label">MCP 名称 / 供应商</span>
            <input
              className="input"
              placeholder="请输入关键字"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="filter-item">
            <button className="btn btn-primary"><Icon name="search" size={14} /> 查询</button>
            <button className="btn btn-default" onClick={() => setKeyword('')}>重置</button>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              共关联 <strong style={{ color: '#E89E57' }}>{filtered.length}</strong> 个服务，
              <strong style={{ color: '#E89E57' }}> {filtered.reduce((a, m) => a + (m.tools?.length || 0), 0)} </strong>
              个工具
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 8 }}>
            <Empty icon="🔌" tip="本Buddy空间暂未关联任何 MCP 工具" />
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16
          }}>
            {filtered.map((m) => (
              <MCPCard
                key={m.id}
                mcp={m}
                onClick={() => setDetail(m)}
                onToggleTool={(toolName, isGlobal) => {
                  setToolGlobal(m.id, toolName, isGlobal);
                  toast.success(`${m.name} · ${toolName} ${isGlobal ? '已设为全局' : '已取消全局'}`);
                }}
              />
            ))}
          </div>
        )}

        {detail && (
          <MCPDetailModal mcp={detail} onClose={() => setDetail(null)} />
        )}
      </div>
    </div>
  );
}

function MCPCard({ mcp, onClick, onToggleTool }) {
  const globalSet = new Set(mcp.enabledToolsGlobal || []);
  return (
    <div
      style={{
        background: '#fff', border: '1px solid #E5E7EB',
        borderRadius: 10, padding: 18, transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#F7E3CC';
        e.currentTarget.style.boxShadow = '0 6px 20px -10px rgba(232, 158, 87, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <img
          src={`https://api.dicebear.com/7.x/icons/svg?seed=${mcp.code}`}
          className="avatar lg"
          style={{ background: '#FBF1E5', borderRadius: 10 }}
          alt={mcp.code}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{mcp.name}</span>
            <Tag color={mcp.status === '已上架' ? 'success' : 'default'}>{mcp.status}</Tag>
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>供应商：{mcp.provider}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12, lineHeight: 1.6, minHeight: 38 }}>
        {mcp.desc}
      </div>
      <div style={{
        background: '#F8F9FB', borderRadius: 6, padding: 12, marginBottom: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#4B5563' }}>工具列表 <span style={{ color: '#9CA3AF' }}>({mcp.tools?.length || 0})</span></span>
          <button
            className="btn-text"
            style={{ background: 'none', border: 'none', padding: 0, color: '#E89E57', cursor: 'pointer', fontSize: 12 }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >查看全部 ›</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(mcp.tools || []).slice(0, 4).map((tool) => {
            const isGlobal = globalSet.has(tool.name);
            return (
              <div
                key={tool.name}
                style={{
                  padding: '4px 10px', fontSize: 12,
                  border: '1px solid ' + (isGlobal ? '#E89E57' : '#E5E7EB'),
                  background: isGlobal ? '#FBF1E5' : '#fff',
                  color: isGlobal ? '#B87136' : '#4B5563',
                  borderRadius: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4
                }}
                onClick={(e) => { e.stopPropagation(); onToggleTool(tool.name, !isGlobal); }}
                title={isGlobal ? '已是全局工具，点击取消' : '点击设为全局工具'}
              >
                {isGlobal && <Icon name="check" size={10} color="#B87136" />}
                {tool.label}
              </div>
            );
          })}
          {mcp.tools && mcp.tools.length > 4 && (
            <div style={{ padding: '4px 8px', fontSize: 12, color: '#9CA3AF' }}>+{mcp.tools.length - 4}</div>
          )}
        </div>
      </div>
      <div style={{
        paddingTop: 12, borderTop: '1px dashed #F2F4F7',
        fontSize: 12, color: '#9CA3AF', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span><Icon name="user" size={11} /> {mcp.creator}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#10B981' }}>{globalSet.size} 个全局工具</span>
          <button
            className="btn-text"
            style={{ background: 'none', border: 'none', padding: 0, color: '#E89E57', cursor: 'pointer' }}
            onClick={onClick}
          >详情</button>
        </div>
      </div>
    </div>
  );
}

function MCPDetailModal({ mcp, onClose }) {
  const globalSet = new Set(mcp.enabledToolsGlobal || []);
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{mcp.name} · 工具详情</h3>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
            <img src={`https://api.dicebear.com/7.x/icons/svg?seed=${mcp.code}`} className="avatar lg"
              style={{ background: '#FBF1E5', borderRadius: 10 }} alt="" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{mcp.name}</div>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>{mcp.code}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <Tag color={mcp.status === '已上架' ? 'success' : 'default'}>{mcp.status}</Tag>
                <Tag color="brand">供应商：{mcp.provider}</Tag>
              </div>
            </div>
          </div>

          <div style={{
            background: '#F8F9FB', padding: 16, borderRadius: 8, marginBottom: 20
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>服务说明</div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>{mcp.desc}</div>
          </div>

          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
            工具清单 <span style={{ color: '#9CA3AF', fontWeight: 'normal' }}>· {mcp.tools?.length || 0} 个工具</span>
          </div>
          <div style={{
            padding: '8px 12px', background: '#FFFBEB',
            border: '1px solid #FCD34D', borderRadius: 6,
            marginBottom: 12, fontSize: 12, color: '#92400E'
          }}>
            ⓘ 启用为「全局工具」后，Agent runtime 平台运行时将自动加载该工具，无需用户在会话中显式启用。
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(mcp.tools || []).map((tool) => {
              const isGlobal = globalSet.has(tool.name);
              return (
                <div
                  key={tool.name}
                  style={{
                    padding: 14, border: '1px solid ' + (isGlobal ? '#E89E57' : '#E5E7EB'),
                    background: isGlobal ? '#FFFCF8' : '#fff',
                    borderRadius: 8, display: 'flex', alignItems: 'center', gap: 16,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: isGlobal ? '#FBF1E5' : '#F2F4F7',
                    color: isGlobal ? '#E89E57' : '#9CA3AF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="wrench" size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{tool.label}</span>
                      {isGlobal && <Tag color="brand">全局工具</Tag>}
                    </div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace' }}>{tool.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}
