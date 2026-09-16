#!/usr/bin/env node
// 向站点根 404.html 注入 admin 深链接分发脚本。
// 背景：GitHub Pages 仅站点根 404.html 生效（目录级不生效）。主站深链接沿用主站
// index.html 的 SPA 恢复能力；admin 深链接（/cms-buddy/admin/**）则在此处拦截：
// 将目标子路径写入 sessionStorage('admin:redirect') 后跳转 /cms-buddy/admin/，
// 由 admin 应用启动时（Restore404Redirect）精确恢复到原路由。
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node inject-admin-404.mjs <path-to-404.html>');
  process.exit(1);
}

let html = readFileSync(file, 'utf8');
const inject = '<script>(function(){var p=location.pathname,m=p.match(/^\\/cms-buddy\\/admin(\\/.*)?$/);if(m){try{sessionStorage.setItem("admin:redirect",m[1]||"/")}catch(e){}location.replace("/cms-buddy/admin/")}})();</script>';

if (html.includes(inject)) {
  console.log('404.html 已包含 admin 分发脚本，跳过注入');
  process.exit(0);
}
if (!html.includes('</head>')) {
  console.error('404.html 缺少 </head>，注入中止');
  process.exit(1);
}
writeFileSync(file, html.replace('</head>', inject + '</head>'));
console.log('admin 404 分发脚本已注入:', file);
