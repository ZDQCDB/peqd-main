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
/* CSS 变量定义 */
:root {
  /* 颜色系统 */
  --primary-color: #409eff;
  --accent-color: #ff6b35;
  --danger-color: #d32f2f;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --info-color: #909399;

  /* 渐变 */
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

  /* 背景颜色 */
  --bg-primary: #ffffff;
  --bg-secondary: rgba(255, 255, 255, 0.95);
  --bg-surface: rgba(255, 255, 255, 0.8);
  --bg-overlay: rgba(0, 0, 0, 0.5);

  /* 文字颜色 */
  --text-primary: #303133;
  --text-secondary: #606266;
  --text-tertiary: #909399;
  --text-inverse: #ffffff;

  /* 边框和分割线 */
  --border-color: #dcdfe6;
  --divider: rgba(0, 0, 0, 0.06);

  /* 间距系统 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  /* 字体重量 */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* 边界半径 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* 阴影 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

  /* 过渡动画 */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}

/* 基础重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 14px;
  line-height: 1.6;
}

body {
  font-family: 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
  color: var(--text-primary);
}

#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 通用工具类 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.card {
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--border-color);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-normal);
  text-decoration: none;
  white-space: nowrap;
  min-height: 36px;
}

.btn-primary {
  background: var(--primary-gradient);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-success {
  background-color: var(--success-color);
  color: var(--text-inverse);
}

.btn-success:hover {
  background-color: #529b2e;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--bg-secondary);
  transform: translateY(-2px);
}

.btn-small {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 12px;
  min-height: 28px;
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: all var(--transition-normal);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.form-input:disabled {
  background-color: var(--bg-surface);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

/* 文本对齐 */
.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

/* 间距工具类 */
.mt-20 {
  margin-top: var(--spacing-lg);
}

.mb-20 {
  margin-bottom: var(--spacing-lg);
}

.ml-auto {
  margin-left: auto;
}

.mr-auto {
  margin-right: auto;
}

/* 特殊状态 */
.under-construction {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  margin: var(--spacing-xl);
}

.under-construction h2 {
  font-size: 24px;
  margin-bottom: var(--spacing-md);
  color: var(--danger-color);
  font-weight: var(--font-weight-bold);
}

.under-construction p {
  font-size: 16px;
  color: var(--text-secondary);
}

/* 动画效果 */
.animate-slide-up {
  animation: slideUpFadeIn 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes slideUpFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式断点 */
@media (max-width: 768px) {
  html {
    font-size: 13px;
  }
  
  .container {
    padding: var(--spacing-md);
  }
  
  .card {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  html {
    font-size: 12px;
  }
  
  .btn {
    font-size: 13px;
    padding: var(--spacing-sm) var(--spacing-md);
  }
}
</style>