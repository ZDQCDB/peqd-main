<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* ===== 设计系统 CSS 变量 ===== */
:root {
  /* 主色 - 企业蓝（与中国主流企业系统一致） */
  --primary-color: #1677ff;
  --primary-hover: #4096ff;
  --primary-active: #0958d9;
  --primary-light: #e6f4ff;
  --primary-border: #91caff;

  /* 功能色 */
  --success-color: #52c41a;
  --success-bg: #f6ffed;
  --warning-color: #faad14;
  --warning-bg: #fffbe6;
  --danger-color: #ff4d4f;
  --danger-bg: #fff2f0;
  --info-color: #1677ff;

  /* 背景层级 */
  --bg-body: #f0f2f5;
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --bg-tertiary: #f5f5f5;

  /* 文字层级 */
  --text-primary: #000000d9;
  --text-secondary: #00000073;
  --text-tertiary: #00000040;
  --text-inverse: #ffffff;
  --text-disabled: #00000026;

  /* 边框 */
  --border-color: #d9d9d9;
  --border-light: #f0f0f0;
  --divider: #f0f0f0;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.10);
  --shadow-card: 0 1px 4px rgba(0, 21, 41, 0.08);

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  /* 字体 */
  --font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* 过渡 */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;

  /* 侧栏宽度 */
  --sidebar-width: 220px;
  --header-height: 56px;
}

/* ===== 基础重置 ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 14px;
  line-height: 1.5715;
}

body {
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-body);
  color: var(--text-primary);
}

#app {
  min-height: 100vh;
  background-color: var(--bg-body);
}

/* ===== 通用容器 ===== */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

/* ===== 卡片 ===== */
.card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--divider);
}

.card-title {
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

/* ===== 按钮系统 ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: 5px 15px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 14px;
  font-weight: var(--font-weight-normal);
  font-family: var(--font-family);
  transition: all var(--transition-fast);
  text-decoration: none;
  white-space: nowrap;
  line-height: 1.5715;
  min-height: 32px;
  outline: none;
}

.btn:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--text-inverse);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
}

.btn-primary:active {
  background-color: var(--primary-active);
  border-color: var(--primary-active);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-default {
  background-color: var(--bg-primary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.btn-default:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-success {
  background-color: var(--success-color);
  border-color: var(--success-color);
  color: var(--text-inverse);
}

.btn-success:hover {
  background-color: #73d13d;
  border-color: #73d13d;
}

.btn-danger {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
  color: var(--text-inverse);
}

.btn-danger:hover {
  background-color: #ff7875;
  border-color: #ff7875;
}

.btn-secondary {
  background-color: var(--bg-primary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.btn-secondary:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-large {
  padding: 8px 20px;
  font-size: 16px;
  min-height: 40px;
  border-radius: var(--radius-md);
}

.btn-small {
  padding: 1px 8px;
  font-size: 12px;
  min-height: 24px;
}

/* ===== 表单系统（全局统一） ===== */
.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label,
label {
  display: block;
  margin-bottom: 6px;
  font-weight: var(--font-weight-normal);
  color: var(--text-primary);
  font-size: 13px;
}

/* 勿作用于 Element Plus 内部控件，否则会与组件自带边框叠加呈「双框」 */
.form-input,
input[type="text"]:not(.el-input__inner):not(.el-range-input),
input[type="email"]:not(.el-input__inner),
input[type="password"]:not(.el-input__inner),
input[type="tel"]:not(.el-input__inner),
input[type="number"]:not(.el-input__inner),
input[type="date"]:not(.el-input__inner),
input[type="search"]:not(.el-input__inner),
input[type="url"]:not(.el-input__inner),
select:not(.el-select__input):not(.el-input__inner),
textarea:not(.el-textarea__inner) {
  width: 100%;
  padding: 6px 11px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: var(--font-family);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5715;
  outline: none;
  height: 32px;
}

textarea:not(.el-textarea__inner) {
  height: auto;
  min-height: 60px;
  resize: vertical;
}

select:not(.el-select__input) {
  appearance: auto;
}

input[type="text"]:not(.el-input__inner):hover,
input[type="email"]:not(.el-input__inner):hover,
input[type="password"]:not(.el-input__inner):hover,
input[type="tel"]:not(.el-input__inner):hover,
input[type="number"]:not(.el-input__inner):hover,
input[type="date"]:not(.el-input__inner):hover,
input[type="search"]:not(.el-input__inner):hover,
input[type="url"]:not(.el-input__inner):hover,
select:not(.el-select__input):hover,
textarea:not(.el-textarea__inner):hover {
  border-color: var(--primary-hover);
}

input[type="text"]:not(.el-input__inner):focus,
input[type="email"]:not(.el-input__inner):focus,
input[type="password"]:not(.el-input__inner):focus,
input[type="tel"]:not(.el-input__inner):focus,
input[type="number"]:not(.el-input__inner):focus,
input[type="date"]:not(.el-input__inner):focus,
input[type="search"]:not(.el-input__inner):focus,
input[type="url"]:not(.el-input__inner):focus,
select:not(.el-select__input):focus,
textarea:not(.el-textarea__inner):focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

input:disabled:not(.el-input__inner),
select:disabled,
textarea:disabled:not(.el-textarea__inner) {
  background-color: var(--bg-tertiary);
  color: var(--text-disabled);
  cursor: not-allowed;
  border-color: var(--border-color);
}

input:not(.el-input__inner)::placeholder,
textarea:not(.el-textarea__inner)::placeholder {
  color: var(--text-tertiary);
}

/* ===== 表格系统 ===== */
.table-container {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-primary);
}

.data-table tr:hover td {
  background: var(--bg-secondary);
}

.data-table tr:last-child td {
  border-bottom: none;
}

/* ===== 标签/徽章 ===== */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: var(--font-weight-medium);
  border: 1px solid;
}

.tag-blue { background: #e6f4ff; color: #1677ff; border-color: #91caff; }
.tag-green { background: #f6ffed; color: #52c41a; border-color: #b7eb8f; }
.tag-orange { background: #fff7e6; color: #fa8c16; border-color: #ffd591; }
.tag-red { background: #fff2f0; color: #ff4d4f; border-color: #ffccc7; }
.tag-gray { background: #fafafa; color: #8c8c8c; border-color: #d9d9d9; }

/* ===== 通用页面布局 ===== */
.page-wrapper {
  min-height: 100vh;
  background: var(--bg-body);
}

.page-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 20px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.page-content {
  padding: var(--spacing-lg);
}

/* ===== 工具类 ===== */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.text-primary { color: var(--primary-color); }
.text-success { color: var(--success-color); }
.text-danger { color: var(--danger-color); }
.text-warning { color: var(--warning-color); }
.text-muted { color: var(--text-secondary); }
.mt-20 { margin-top: var(--spacing-md); }
.mb-20 { margin-bottom: var(--spacing-md); }
.ml-auto { margin-left: auto; }
.mr-auto { margin-right: auto; }
.d-flex { display: flex; }
.align-center { align-items: center; }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }

/* ===== 建设中状态 ===== */
.under-construction {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  color: var(--text-secondary);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  margin: var(--spacing-xl);
}

.under-construction h2 {
  font-size: 20px;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.under-construction p {
  font-size: 14px;
  color: var(--text-secondary);
}

/* ===== 动画 ===== */
.animate-slide-up {
  animation: slideUpFadeIn 0.3s ease-out forwards;
  opacity: 0;
  transform: translateY(16px);
}

@keyframes slideUpFadeIn {
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .animate-slide-up { animation: none; opacity: 1; transform: none; }
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .container { padding: var(--spacing-md); }
  .card { padding: var(--spacing-md); }
  .page-content { padding: var(--spacing-md); }
}

@media (max-width: 480px) {
  html { font-size: 13px; }
}
</style>