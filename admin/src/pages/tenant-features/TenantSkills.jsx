// Buddy空间管理员 - Skill 技能（卡片视图）
import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useRole } from '../../contexts/RoleContext.jsx';
import { Icon, Empty } from '../../components/Common.jsx';
import { Toggle } from '../../components/Toggle.jsx';
import { Tag } from '../../components/Tag.jsx';
import { skillCategories } from '../../data/mock.js';

export function TenantSkills() {
  const { activeTenantId, user } = useRole();
  const { tenants, skills, setSkillEnabled } = useStore();
  const toast = useToast();
  const tenant = tenants.find((t) => t.id === activeTenantId);
  const [filters, setFilters] = useState({ category: '', keyword: '' });
  const [detail, setDetail] = useState(null);

  // 假定：所有技能都可被Buddy空间查看（演示）
  const associatedSkills = skills.slice(0, 10);

  const filtered = associatedSkills.filter((s) => {
    if (filters.category && s.category !== filters.category) return false;
    if (filters.keyword) {
      return (s.name + s.code + s.desc).toLowerCase().includes(filters.keyword.toLowerCase());
    }
    return true;
  });

  return (
    <div className="fade-enter">
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1 className="page-title">Skill 技能</h1>
            <div className="page-desc">
              查看与本Buddy空间关联的所有 Skill 技能 · 可启用或停用（停用后用户需到Skill技能库手动启用才能使用）
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
          如需关联新的 Skill 技能，请联系平台管理员在"Buddy空间管理 → 构建能力"中关联。
        </div>

        <div className="filter-bar">
          <div className="filter-item">
            <span className="filter-item-label">技能分类</span>
            <select
              className="select"
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="">全部</option>
              {skillCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <span className="filter-item-label">技能名称</span>
            <input
              className="input"
              placeholder="请输入"
              value={filters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
            />
          </div>
          <div className="filter-item">
            <button className="btn btn-primary"><Icon name="search" size={14} /> 查询</button>
            <button className="btn btn-default" onClick={() => setFilters({ category: '', keyword: '' })}>重置</button>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              已关联 <strong style={{ color: '#E89E57' }}>{filtered.length}</strong> / {associatedSkills.length} 个
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 8 }}>
            <Empty icon="🛠" tip="本Buddy空间暂未关联任何 Skill 技能" />
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16
          }}>
            {filtered.map((s) => (
              <SkillCard
                key={s.id}
                skill={s}
                onClick={() => setDetail(s)}
                onToggle={(checked) => {
                  setSkillEnabled(s.id, checked);
                  toast.success(`技能 ${s.name} 已${checked ? '启用' : '停用'}`);
                }}
              />
            ))}
          </div>
        )}

        {detail && (
          <DetailModal skill={detail} onClose={() => setDetail(null)} />
        )}
      </div>
    </div>
  );
}

function SkillCard({ skill, onClick, onToggle }) {
  const categoryColor = {
    '投顾服务': 'brand',
    '投研服务': 'info',
    '综合服务': 'success',
    '营销服务': 'warning',
    '系统工具': 'default',
  }[skill.category] || 'default';

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${skill.enabled ? '#F7E3CC' : '#E5E7EB'}`,
        borderRadius: 10, padding: 18,
        transition: 'all 0.2s',
        position: 'relative',
        opacity: skill.enabled ? 1 : 0.85,
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 20px -10px rgba(232, 158, 87, 0.4)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: skill.enabled ? 'linear-gradient(135deg, #FBF1E5, #E89E57)' : '#F2F4F7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 18,
        }}>
          <Icon name="spark" size={20} color={skill.enabled ? '#fff' : '#9CA3AF'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>{skill.name}</span>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: skill.enabled ? '#10B981' : '#D1D5DB'
            }} />
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>{skill.code}</div>
        </div>
        <Toggle
          checked={skill.enabled}
          onChange={onToggle}
        />
      </div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12, lineHeight: 1.6, minHeight: 38 }}>
        {skill.desc}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        <Tag color={categoryColor}>{skill.category}</Tag>
        {skill.tags?.map((t) => <Tag key={t}>{t}</Tag>)}
      </div>
      <div style={{
        paddingTop: 12, borderTop: '1px dashed #F2F4F7',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#9CA3AF'
      }}>
        <span>{skill.creator} · {skill.updateTime}</span>
        <button
          className="btn-text"
          style={{ background: 'none', border: 'none', padding: 0, color: '#E89E57', cursor: 'pointer' }}
          onClick={onClick}
        >查看详情 ›</button>
      </div>
    </div>
  );
}

function DetailModal({ skill, onClose }) {
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{skill.name} · 详情</h3>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 24, marginBottom: 20, alignItems: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 14,
              background: 'linear-gradient(135deg, #FBF1E5, #E89E57)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
            }}>
              <Icon name="spark" size={32} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{skill.name}</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'monospace' }}>{skill.code}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <Tag color={skill.status === '已上架' ? 'success' : 'default'}>{skill.status || '已上架'}</Tag>
                <Tag color="brand">{skill.category}</Tag>
                {skill.tags?.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
          </div>

          <div style={{
            background: '#F8F9FB', padding: 16, borderRadius: 8, marginBottom: 16
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>技能说明</div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>{skill.desc}</div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16
          }}>
            <Item label="创建人" value={skill.creator} />
            <Item label="创建时间" value={skill.createTime || '2025-08-04 10:15'} />
            <Item label="更新时间" value={skill.updateTime} />
            <Item label="调用方式" value="Agent runtime 自动加载" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>关闭</button>
          <button className="btn btn-primary">前往Skill技能库</button>
        </div>
      </div>
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div style={{ padding: 12, background: '#F8F9FB', borderRadius: 6 }}>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#1F2937' }}>{value}</div>
    </div>
  );
}
