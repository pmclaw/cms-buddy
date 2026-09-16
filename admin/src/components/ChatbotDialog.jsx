import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Overlay.jsx';
import { Icon } from './Common.jsx';

/**
 * 专家助理 Chatbot 交互弹窗
 * 用户点击专家助理名称时弹出，可测试该专家助理的对话效果
 * showQuickQuestions/showTags/showGreeting 用于技能测试等场景隐藏对应区块
 */
export function ChatbotDialog({ expert, onClose, showQuickQuestions = true, showTags = true, showGreeting = true }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // 初始欢迎消息
  useEffect(() => {
    if (expert) {
      const greeting = showGreeting
        ? (expert.chatbotGreeting || `你好，我是${expert.name}（${expert.nickname}）。\n${expert.description || ''}\n\n请问我有什么可以帮您的？`)
        : `您正在测试技能「${expert.name}」。请直接输入问题开始体验。`;
      setMessages([{
        role: 'assistant',
        content: greeting,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, [expert, showGreeting]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // 自动聚焦输入框
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const generateReply = (userMsg) => {
    // 基于 expert 的 instruction / systemPrompt 生成模拟回复
    const name = expert.nickname || expert.name;
    const desc = expert.description || '';
    const tags = (expert.tags || []).join('、');

    // 简单的关键词匹配模拟
    if (/你好|您好|hi|hello/i.test(userMsg)) {
      return `您好！我是${name}，很高兴为您服务。${desc ? '我擅长' + desc.slice(0, 40) + '...' : ''}请问有什么可以帮您的吗？`;
    }
    if (/资产配置|投资建议|财富管理/i.test(userMsg)) {
      return `关于资产配置，我建议从以下三个维度来考虑：\n\n1. **风险偏好评估**：首先需要明确您的风险承受能力等级（C1-C5）。\n2. **资产类别分散**：建议在大类资产（权益、固收、另类、现金）间做合理分散，单一资产占比不宜超过40%。\n3. **动态再平衡**：建议每季度检视一次组合偏离度，偏离阈值±5%时进行再平衡。\n\n> ⚠️ 温馨提示：过往业绩不代表未来表现，投资有风险，入市需谨慎。\n\n请问您目前的风险偏好是保守型、稳健型还是积极型呢？`;
    }
    if (/研报|研究报告|行业分析/i.test(userMsg)) {
      return `我可以为您生成专业的研报内容。根据您关注的主题，研报将包含以下结构：\n\n**核心观点** — 一句话总结投资逻辑\n**关键数据** — 核心财务指标与估值数据\n**逻辑链条** — 驱动因素分析与推演\n**风险提示** — 潜在风险因素\n\n请提供您想研究的行业或公司名称，我来为您撰写。`;
    }
    if (/客户|客群|标签|营销|话术/i.test(userMsg)) {
      return `基于${tags || '我的专业领域'}，我可以为您提供以下支持：\n\n1. **客群画像分析** — 基于标签数据洞察客户特征\n2. **经营策略生成** — 针对激活/提升/挽回场景输出方案\n3. **营销话术生成** — 结合产品卖点与客户需求生成话术\n\n请告诉我您具体想了解哪个方面？`;
    }
    if (/盘面|行情|板块|热点/i.test(userMsg)) {
      return `当前市场要点速览：\n\n**板块异动**：今日早盘科技板块活跃，成交额环比放大15%。\n**资金流向**：北向资金净流入约23亿元，主要流向半导体、消费电子。\n**风险提示**：注意高位股回调风险，建议关注业绩确定性强的标的。\n\n> 以上为模拟数据，仅用于展示对话效果，不构成投资建议。`;
    }
    if (/谢谢|感谢|thanks/i.test(userMsg)) {
      return `不客气！如果还有其他问题，随时可以问我。我是${name}，随时为您服务。😊`;
    }
    if (/能力|功能|你能做什么/i.test(userMsg)) {
      const mcpCount = (expert.mcpIds || []).length;
      const skillCount = (expert.skillIds || []).length;
      return `我是${name}，${desc}\n\n我目前具备的能力：\n• 已关联 ${mcpCount} 个 MCP 工具\n• 已关联 ${skillCount} 个 Skill 技能\n• 能力标签：${tags || '通用'}\n\n您可以尝试问我关于${tags || '相关专业'}方面的问题。`;
    }

    // 默认回复
    return `您提到的「${userMsg.slice(0, 30)}${userMsg.length > 30 ? '...' : ''}」是一个很好的问题。\n\n作为${name}，${desc ? desc.slice(0, 60) + '...' : '我会尽力为您提供专业建议。'}\n\n> 💡 这是一个模拟对话回复，用于展示专家助理的交互效果。实际使用时，回复内容将基于该专家助理配置的系统提示词、关联的 MCP 工具与 Skill 技能动态生成。`;
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { role: 'user', content: text, time: now }]);
    setInput('');
    setIsTyping(true);

    // 模拟思考延迟 + 回复
    setTimeout(() => {
      const reply = generateReply(text);
      const replyTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, time: replyTime }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    const greeting = showGreeting
      ? (expert.chatbotGreeting || `对话已清空。您好，我是${expert.name}（${expert.nickname}），请问有什么可以帮您的？`)
      : `您正在测试技能「${expert.name}」。对话已清空，请输入问题继续测试。`;
    setMessages([{
      role: 'assistant',
      content: greeting,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  if (!expert) return null;

  const themeColor = '#E89E57';

  return (
    <Modal
      open
      title={expert.name}
      onClose={onClose}
      width="wide"
    >
      <div style={{ width: '100%' }}>
        {/* 专家助理信息条 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
          background: '#FBF1E5', borderRadius: 8, marginBottom: 16,
        }}>
          <img src={expert.avatar} alt={expert.name} style={{
            width: 48, height: 48, borderRadius: 10, background: '#fff',
            border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>
              {expert.name}
              {expert.nickname && (
                <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 400, marginLeft: 8 }}>昵称：{expert.nickname}</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              {expert.description || '暂无描述'}
            </div>
          </div>
          {showTags && (
            <div style={{ display: 'flex', gap: 8 }}>
              {(expert.tags || []).slice(0, 3).map((t) => (
                <span key={t} style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 10,
                  background: '#fff', color: themeColor, border: `1px solid ${themeColor}40`,
                }}>{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* 对话区域 */}
        <div
          ref={scrollRef}
          style={{
            height: 420, overflowY: 'auto', padding: '16px 12px',
            background: '#F8F9FB', borderRadius: 8, border: '1px solid #F2F4F7',
          }}
        >
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, marginBottom: 16,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}>
              {/* 头像 */}
              <img
                src={msg.role === 'user'
                  ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
                  : expert.avatar
                }
                alt=""
                style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: '#fff',
                }}
              />
              {/* 消息气泡 */}
              <div style={{
                maxWidth: '75%',
                display: 'flex', flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.7,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  background: msg.role === 'user' ? themeColor : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#1F2937',
                  border: msg.role === 'user' ? 'none' : '1px solid #E5E7EB',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 12,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, padding: '0 4px' }}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {/* 打字中动画 */}
          {isTyping && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <img src={expert.avatar} alt="" style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: '#fff',
              }} />
              <div style={{
                padding: '10px 16px', borderRadius: 12, borderBottomLeftRadius: 4,
                background: '#fff', border: '1px solid #E5E7EB',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{
                    width: 7, height: 7, borderRadius: '50%', background: '#D1D5DB',
                    animation: `chatTyping 1.2s ${d * 0.2}s infinite ease-in-out`,
                  }} />
                ))}
                <style>{`
                  @keyframes chatTyping {
                    0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
                    30% { opacity: 1; transform: translateY(-4px); }
                  }
                `}</style>
              </div>
            </div>
          )}
        </div>

        {/* 快捷问题 */}
        {showQuickQuestions && messages.length <= 1 && getQuickQuestions(expert).length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {getQuickQuestions(expert).map((q, i) => (
              <button
                key={i}
                onClick={() => { setInput(q); inputRef.current?.focus(); }}
                style={{
                  padding: '6px 14px', fontSize: 12, borderRadius: 16,
                  border: `1px solid ${themeColor}40`, background: '#FBF1E5',
                  color: themeColor, cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = themeColor; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FBF1E5'; e.currentTarget.style.color = themeColor; }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* 输入区域 */}
        <div style={{
          display: 'flex', gap: 10, marginTop: 12, alignItems: 'flex-end',
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`和 ${expert.nickname || expert.name} 对话，按 Enter 发送，Shift+Enter 换行`}
              rows={1}
              style={{
                width: '100%', minHeight: 42, maxHeight: 120, padding: '10px 14px',
                paddingRight: 40, fontSize: 13, lineHeight: 1.5,
                border: '1px solid #E5E7EB', borderRadius: 10, outline: 'none',
                resize: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = themeColor; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />
          </div>
          <button
            onClick={handleClear}
            style={{
              height: 42, padding: '0 14px', fontSize: 13,
              border: '1px solid #E5E7EB', borderRadius: 10,
              background: '#fff', color: '#6B7280', cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            title="清空对话"
          >
            清空
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            style={{
              height: 42, padding: '0 20px', fontSize: 13, fontWeight: 500,
              border: 'none', borderRadius: 10,
              background: (!input.trim() || isTyping) ? '#E5E7EB' : themeColor,
              color: (!input.trim() || isTyping) ? '#9CA3AF' : '#fff',
              cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}
          >
            发送
          </button>
        </div>
      </div>
    </Modal>
  );
}

// 根据专家配置生成快捷问题
function getQuickQuestions(expert) {
  // 优先使用专家助理配置的默认推荐问
  if (expert.defaultQuestions) {
    const lines = expert.defaultQuestions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length > 0) return lines.slice(0, 6);
  }
  // 兜底：根据标签推断
  const tags = (expert.tags || []).join('');
  if (/财富|资产|高净值/.test(tags)) {
    return ['你好', '如何进行资产配置？', '你能做什么？'];
  }
  if (/研报|研究|数据/.test(tags)) {
    return ['你好', '帮我写一份行业研报', '你能做什么？'];
  }
  if (/客群|客户|营销|话术/.test(tags)) {
    return ['你好', '帮我生成一段营销话术', '你能做什么？'];
  }
  if (/盘面|行情|热点/.test(tags)) {
    return ['你好', '今日盘面如何？', '你能做什么？'];
  }
  return ['你好', '你能做什么？', '介绍一下你的能力'];
}
