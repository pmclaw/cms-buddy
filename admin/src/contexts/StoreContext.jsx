// 简易状态管理 - 使用 React Context 持久化 mock 数据
import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  tenants as initialTenants,
  experts as initialExperts,
  skills as initialSkills,
  mcpServices as initialMcp,
  taskTemplates as initialTemplates,
  userGroups as initialUserGroups,
  initialSystemSettings,
} from '../data/mock.js';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [tenants, setTenants] = useState(initialTenants);
  const [experts, setExperts] = useState(initialExperts);
  const [skills, setSkills] = useState(initialSkills);
  const [mcps, setMcps] = useState(initialMcp);
  const [templates, setTemplates] = useState(initialTemplates);
  const [userGroups, setUserGroups] = useState(initialUserGroups);
  // 系统初始化参数（Buddy参数管理页维护）：新建空间/专家助理的默认系统提示词
  const [systemSettings, setSystemSettings] = useState(initialSystemSettings);
  // 默认Buddy空间（空间管理员设置，全局单选）：管理空间相关内容时默认选中该空间
  const [defaultSpaceId, setDefaultSpaceId] = useState(
    () => initialTenants.find((t) => t.defaultSpace)?.id || null
  );

  const saveSystemSettings = useCallback((patch) => {
    setSystemSettings((prev) => ({ ...prev, ...patch, updateTime: now() }));
  }, []);

  // Buddy空间 CRUD
  const upsertTenant = useCallback((t) => {
    setTenants((prev) => {
      const idx = prev.findIndex((x) => x.id === t.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...t, updateTime: t.updateTime || now() };
        return next;
      }
      return [...prev, { ...t, createTime: now(), updateTime: now() }];
    });
  }, []);

  const deleteTenant = useCallback((id) => {
    setTenants((prev) => prev.filter((x) => x.id !== id));
    // 删除的是默认空间时同步清空默认设置，保证数据自洽
    setDefaultSpaceId((cur) => (cur === id ? null : cur));
  }, []);

  // 专家 CRUD
  const upsertExpert = useCallback((e) => {
    setExperts((prev) => {
      const idx = prev.findIndex((x) => x.id === e.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...e, updateTime: e.updateTime || now() };
        return next;
      }
      const id = 'E' + String(prev.length + 1).padStart(3, '0');
      return [...prev, { ...e, id, createTime: now(), updateTime: now() }];
    });
  }, []);

  const deleteExpert = useCallback((id) => {
    setExperts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // Skill CRUD
  const upsertSkill = useCallback((s) => {
    setSkills((prev) => {
      const idx = prev.findIndex((x) => x.id === s.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...s, updateTime: s.updateTime || now() };
        return next;
      }
      const id = s.id || 'S' + String(prev.length + 1).padStart(3, '0');
      return [...prev, { ...s, id, updateTime: now() }];
    });
  }, []);

  const deleteSkill = useCallback((id) => {
    setSkills((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const setSkillEnabled = useCallback((id, enabled) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled, updateTime: now() } : s))
    );
  }, []);

  // MCP CRUD
  const upsertMcp = useCallback((m) => {
    setMcps((prev) => {
      const idx = prev.findIndex((x) => x.id === m.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...m, updateTime: m.updateTime || now() };
        return next;
      }
      const id = m.id || 'M' + String(prev.length + 1).padStart(3, '0');
      return [...prev, { ...m, id, updateTime: now() }];
    });
  }, []);

  const deleteMcp = useCallback((id) => {
    setMcps((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // MCP 全局工具切换
  const setMcpEnabledGlobal = useCallback((mcpId, enabledToolsGlobal) => {
    setMcps((prev) =>
      prev.map((m) => (m.id === mcpId ? { ...m, enabledToolsGlobal } : m))
    );
  }, []);

  // 同时更新 MCP 的关联工具集合（enabledTools）与全局工具集合（enabledToolsGlobal）
  const setMcpToolConfig = useCallback((mcpId, enabledTools, enabledToolsGlobal) => {
    setMcps((prev) =>
      prev.map((m) => (m.id === mcpId ? { ...m, enabledTools, enabledToolsGlobal } : m))
    );
  }, []);

  // 工具切换
  const setToolGlobal = useCallback((mcpId, toolName, isGlobal) => {
    setMcps((prev) =>
      prev.map((m) => {
        if (m.id !== mcpId) return m;
        const set = new Set(m.enabledToolsGlobal || []);
        if (isGlobal) set.add(toolName);
        else set.delete(toolName);
        return { ...m, enabledToolsGlobal: Array.from(set) };
      })
    );
  }, []);

  // 任务模板 CRUD
  const upsertTemplate = useCallback((t) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((x) => x.id === t.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...t, updateTime: t.updateTime || now() };
        return next;
      }
      const id = t.id || 'TP' + String(prev.length + 1).padStart(3, '0');
      return [...prev, { ...t, id, updateTime: now() }];
    });
  }, []);

  const deleteTemplate = useCallback((id) => {
    setTemplates((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // 用户组 CRUD
  const upsertUserGroup = useCallback((g) => {
    setUserGroups((prev) => {
      const idx = prev.findIndex((x) => x.id === g.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...g, updateTime: g.updateTime || now() };
        return next;
      }
      const id = g.id || 'G' + String(prev.length + 1).padStart(3, '0');
      return [...prev, { ...g, id, createTime: now(), updateTime: now() }];
    });
  }, []);

  const deleteUserGroup = useCallback((id) => {
    setUserGroups((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const value = {
    tenants, upsertTenant, deleteTenant,
    defaultSpaceId, setDefaultSpaceId,
    experts, upsertExpert, deleteExpert,
    skills, upsertSkill, deleteSkill, setSkillEnabled,
    mcps, upsertMcp, deleteMcp, setToolGlobal, setMcpEnabledGlobal, setMcpToolConfig,
    templates, upsertTemplate, deleteTemplate,
    userGroups, upsertUserGroup, deleteUserGroup,
    systemSettings, saveSystemSettings,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

function now() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
