import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// GitHub Pages 深链接恢复：站点根 404.html 分发时会把目标子路径写入 sessionStorage，
// 这里在挂载后恢复到原路由（如 /experts），实现刷新/直链不丢页面
function Restore404Redirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const target = sessionStorage.getItem('admin:redirect');
    if (!target) return;
    sessionStorage.removeItem('admin:redirect');
    navigate(target, { replace: true });
  }, [navigate]);
  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  // basename 跟随 Vite base 配置（GitHub Pages 部署为 /cms-buddy/admin/，本地为 '/'）
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <Restore404Redirect />
    <App />
  </BrowserRouter>
);
