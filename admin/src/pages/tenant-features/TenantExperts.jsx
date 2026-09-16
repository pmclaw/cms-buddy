// Buddy空间管理员 - Agent 专家
import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon, Empty, Tabs } from '../../components/Common.jsx';
import { Toggle } from '../../components/Toggle.jsx';
import { Tag } from '../../components/Tag.jsx';
import { ChatbotDialog } from '../../components/ChatbotDialog.jsx';

export function TenantExperts() {
  const { activeTenantId, user } = useRole();
  const { tenants, experts } = useStore();
  const toast = useToast();
  const tenant = tenants.find((t) => t.id === activeTenantId);
  const [tab, setTab] = useState('platform');
  const [detail, setDetail] = useState(null);
  const [chatbotExpert, setChatbotExpert] = useState(null);

  // 平台级专家 + 本Buddy空间的私有专家
  const platformExperts = experts.filter((e) => {
    if (e.status !== '已上架') return false;
    if (e.openScope === 'all') return true;
    if (e.openScope === 'tenant' && (e.openTenants || []).includes(activeTenantId)) return true;
    if (e.openScope === 'private' && e.creatorTenant === activeTenantId) return true;
    return false;
  });
  const tenantExperts = experts.filter((e) => e.brandOwner === activeTenantId);

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">Agent 专家</h1>
            <div className="page-desc">
              本Buddy空间可用的全部专家助理 · 平台级专家仅可查看，自建专家可创建与维护
            </div>
          </div>
          <div className="page-actions">
            <Tag color="brand">
              <Icon name="building" size={11} />
              当前Buddy空间：{tenant?.brandName}
            </Tag>
            <button className="btn btn-primary" onClick={() => toast.info('跳转新建专家助理')}>
              <Icon name="plus" size={14} />
              新建本Buddy空间专家
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
            {[
              { key: 'platform', label: `平台级专家 (${platformExperts.length})`, icon: 'spark' },
              { key: 'tenant', label: `本Buddy空间专家 (${tenantExperts.length})`, icon: 'building' },
            ].map((t) => (
              <div
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '12px 20px', cursor: 'pointer', fontSize: 13,
                  color: tab === t.key ? '#E89E57' : '#6B7280',
                  borderBottom: '2px solid ' + (tab === t.key ? '#E89E57' : 'transparent'),
                  marginBottom: -1,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontWeight: tab === t.key ? 500 : 400,
                }}
              >
                <Icon name={t.icon} size={12} />
                {t.label}
              </div>
            ))}
          </div>

          <div style={{ padding: 24 }}>
            {tab === 'platform' && (
              <PlatformExpertList experts={platformExperts} onClick={setDetail} onTest={setChatbotExpert} />
            )}
            {tab === 'tenant' && (
              <TenantExpertList tenant={tenant} experts={tenantExperts} onClick={setDetail} onTest={setChatbotExpert} />
            )}
          </div>
        </div>

        {detail && <ExpertDetailModal expert={detail} onClose={() => setDetail(null)} />}
        {chatbotExpert && <ChatbotDialog expert={chatbotExpert} onClose={() => setChatbotExpert(null)} />}
      </div>
    </div>
  );
}

function PlatformExpertList({ experts, onClick, onTest }) {
  if (experts.length === 0) {
    return <Empty icon="🤖" tip="暂无可用的平台级专家" />;
  }
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 16
    }}>
      {experts.map((e) => (
        <ExpertCard
          key={e.id}
          expert={e}
          readOnly
          onClick={() => onClick(e)}
          onTest={() => onTest(e)}
        />
      ))}
    </div>
  );
}

function TenantExpertList({ tenant, experts, onClick, onTest }) {
  if (experts.length === 0) {
    return (
      <div style={{
        background: '#F8F9FB', borderRadius: 8, padding: 40, textAlign: 'center',
        border: '1px dashed #E5E7EB'
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🤖</div>
        <div style={{ fontSize: 14, color: '#4B5563', marginBottom: 8 }}>本Buddy空间暂无自建专家</div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>基于已关联的 MCP 与 Skill 创建Buddy空间专属的专家助理</div>
        <button className="btn btn-primary">
          <Icon name="plus" size={14} />
          新建专家助理
        </button>
      </div>
    );
  }
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 16
    }}>
      {experts.map((e) => (
        <ExpertCard
          key={e.id}
          expert={e}
          brandColor={tenant?.themeColor}
          onClick={() => onClick(e)}
          onTest={() => onTest(e)}
        />
      ))}
    </div>
  );
}

function ExpertCard({ expert, readOnly, brandColor = '#E89E57', onClick, onTest }) {
  return (
    <div
      style={{
        background: '#fff', border: `1px solid ${readOnly ? '#E5E7EB' : '#F7E3CC'}`,
        borderRadius: 10, padding: 18, position: 'relative',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = brandColor;
        e.currentTarget.style.boxShadow = `0 6px 20px -10px ${brandColor}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = readOnly ? '#E5E7EB' : '#F7E3CC';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {readOnly && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: '#EFF6FF', color: '#1D4ED8',
          padding: '2px 8px', fontSize: 11, borderRadius: 4,
          border: '1px solid #BFDBFE',
        }}>
          <Icon name="eye" size={10} /> 只读
        </div>
      )}
      {!readOnly && expert.brandOwner && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: '#FBF1E5', color: '#B87136',
          padding: '2px 8px', fontSize: 11, borderRadius: 4,
          border: '1px solid #F7E3CC',
        }}>
          来自 {expert.brandOwnerName}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <img src={expert.avatar} alt={expert.name} style={{ width: 48, height: 48, borderRadius: 10 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{expert.name}</div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>昵称：{expert.nickname} · 业务归属方 {expert.businessOwner}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12, minHeight: 38, lineHeight: 1.6 }}>
        {expert.description}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {(expert.tags || []).slice(0, 4).map((t) => <Tag key={t} color="brand">{t}</Tag>)}
        {expert.tags?.length > 4 && <Tag>+{expert.tags.length - 4}</Tag>}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTop: '1px dashed #F2F4F7',
        fontSize: 12, color: '#9CA3AF'
      }}>
        <span>
          <Icon name="wrench" size={11} color="#9CA3AF" /> {expert.mcpIds?.length || 0} ·{' '}
          <Icon name="spark" size={11} color="#9CA3AF" /> {expert.skillIds?.length || 0}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-text"
            style={{ fontSize: 12, background: 'none', border: 'none', padding: 0, color: '#E89E57', cursor: 'pointer' }}
            onClick={onTest}
          >测试预览</button>
          <span style={{ color: '#E5E7EB' }}>|</span>
          {!readOnly && (
            <button className="btn btn-default btn-sm">
              <Icon name="edit" size={11} /> 编辑
            </button>
          )}
          <button
            className="btn btn-text"
            style={{ fontSize: 12 }}
            onClick={onClick}
          >查看详情 ›</button>
        </div>
      </div>
    </div>
  );
}

function ExpertDetailModal({ expert, onClose }) {
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>专家详情</h3>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
            <img src={expert.avatar} alt="" style={{ width: 72, height: 72, borderRadius: 14 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 600 }}>{expert.name}</div>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>昵称：{expert.nickname} · 业务归属方：{expert.businessOwner}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <Tag color={expert.status === '已上架' ? 'success' : 'default'}>{expert.status}</Tag>
                {(expert.tags || []).map((t) => <Tag key={t} color="brand">{t}</Tag>)}
              </div>
            </div>
          </div>

          <Detail title="能力描述" body={expert.description} />
          <Detail title="使用说明" body={expert.instruction} />
          <Detail title="成长记录" body={expert.growth} />
          <Detail title="备注" body={expert.remark || expert.generalDesc} />

          <div style={{
            background: '#F8F9FB', padding: 16, borderRadius: 8, marginTop: 16
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>系统提示词</div>
            <pre style={{
              background: '#1F2937', color: '#F7E3CC',
              padding: 14, borderRadius: 6, fontSize: 12,
              lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'monospace',
              maxHeight: 240, overflow: 'auto'
            }}>{expert.systemPrompt}</pre>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>关闭</button>
          <button className="btn btn-primary"><Icon name="send" size={12} /> 进入对话测试</button>
        </div>
      </div>
    </div>
  );
}

function Detail({ title, body }) {
  if (!body) return null;
  return (
    <div style={{
      background: '#F8F9FB', padding: 16, borderRadius: 8, marginBottom: 12,
    }}>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{body}</div>
    </div>
  );
}
