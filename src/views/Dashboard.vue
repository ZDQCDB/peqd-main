<template>
  <div class="dashboard">
    <!-- 顶部导航栏 -->
    <header class="dashboard-header">
      <div class="header-container">
        <div class="header-left">
          <div class="logo-section">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="logo-text">
              <h1 class="system-title">校园体育管理系统</h1>
              <span class="system-subtitle">Campus Sports Management</span>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <div class="user-section">
            <div class="welcome-text">
              <span class="greeting">欢迎回来</span>
              <span class="username">{{ username }}</span>
            </div>
            <div class="user-avatar">
              <span>{{ username.charAt(0) }}</span>
            </div>
            <div class="user-menu">
              <button class="menu-item" @click="navigateTo('/profile')">
                <span class="menu-icon">👤</span>
                个人中心
              </button>
              <button 
                v-if="canAccessAdminManagement"
                class="menu-item admin-item" 
                @click="navigateTo('/admin')"
              >
                <span class="menu-icon">⚙️</span>
                管理员管理
              </button>
              <button class="menu-item logout-item" @click="logout">
                <span class="menu-icon">🚪</span>
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <!-- 欢迎横幅 -->
        <section class="hero-section">
          <div class="hero-content">
            <div class="hero-text">
              <h2 class="hero-title">欢迎使用体育管理系统</h2>
              <p class="hero-subtitle">专业的校园体育教学与管理平台，助力提升体育教育质量</p>
              <div class="hero-stats">
                <div class="stat-item">
                  <span class="stat-number">9</span>
                  <span class="stat-label">功能模块</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-number">365</span>
                  <span class="stat-label">天全年服务</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-number">100%</span>
                  <span class="stat-label">数据安全</span>
                </div>
              </div>
            </div>
            <div class="hero-visual">
              <div class="floating-elements">
                <div class="float-element element-1">📚</div>
                <div class="float-element element-2">💪</div>
                <div class="float-element element-3">🏃‍♂️</div>
                <div class="float-element element-4">🏆</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 功能模块网格 -->
        <section class="modules-section">
          <div class="section-header">
            <h3 class="section-title">功能模块</h3>
            <p class="section-subtitle">选择下面的模块开始使用系统</p>
          </div>
          
          <div class="modules-grid">
            <div class="module-card animate-slide-up" @click="navigateTo('/teaching')" style="animation-delay: 0.1s">
              <div class="module-header">
                <div class="module-icon teaching">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M9 10h6M9 14h6M9 6h6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <span class="module-badge">教学</span>
              </div>
              <div class="module-content">
                <h4 class="module-title">教学管理</h4>
                <p class="module-description">教学周历、教案管理、签到记录、视频学习等完整教学流程</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块 →</span>
              </div>
            </div>

            <div class="module-card animate-slide-up" @click="navigateTo('/group')" style="animation-delay: 0.2s">
              <div class="module-header">
                <div class="module-icon group">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <span class="module-badge">群体</span>
              </div>
              <div class="module-content">
                <h4 class="module-title">群体活动</h4>
                <p class="module-description">PE校园、早操管理、课外活动、阳光跑等群体活动组织</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块 →</span>
              </div>
            </div>

            <div class="module-card animate-slide-up" @click="navigateTo('/training')" style="animation-delay: 0.3s">
              <div class="module-header">
                <div class="module-icon training">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 12.5l5 5L22 8" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <span class="module-badge">训练</span>
              </div>
              <div class="module-content">
                <h4 class="module-title">训练管理</h4>
                <p class="module-description">训练计划制定、完成情况统计、PE分数管理等</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块 →</span>
              </div>
            </div>

            <div class="module-card animate-slide-up" @click="redirectToTice" style="animation-delay: 0.4s">
              <div class="module-header">
                <div class="module-icon test">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3v18h18" stroke="currentColor" stroke-width="2"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <span class="module-badge">体测</span>
              </div>
              <div class="module-content">
                <h4 class="module-title">体质测试</h4>
                <p class="module-description">体质测试管理、成绩录入、结果分析查询</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块 →</span>
              </div>
            </div>

            <div class="module-card animate-slide-up" @click="navigateTo('/equipment')" style="animation-delay: 0.5s">
              <div class="module-header">
                <div class="module-icon equipment">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <span class="module-badge">器材</span>
              </div>
              <div class="module-content">
                <h4 class="module-title">器材管理</h4>
                <p class="module-description">体育器材库存管理、借用申请、归还记录</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块 →</span>
              </div>
            </div>

            <div class="module-card animate-slide-up" @click="navigateTo('/venue')" style="animation-delay: 0.6s">
              <div class="module-header">
                <div class="module-icon venue">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <span class="module-badge">场馆</span>
              </div>
              <div class="module-content">
                <h4 class="module-title">场馆管理</h4>
                <p class="module-description">场馆预约、使用安排、设施维护管理</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块 →</span>
              </div>
            </div>

            <div class="module-card animate-slide-up" @click="navigateTo('/listening')" style="animation-delay: 0.7s">
              <div class="module-header">
                <div class="module-icon listening">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="2"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <span class="module-badge">听课</span>
              </div>
              <div class="module-content">
                <h4 class="module-title">听课管理</h4>
                <p class="module-description">听课记录、教学评价、课堂质量监控</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块 →</span>
              </div>
            </div>

            <div class="module-card animate-slide-up" @click="goToYouzanHealth" style="animation-delay: 0.8s">
              <div class="module-header">
                <div class="module-icon health">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <span class="module-badge">健康</span>
              </div>
              <div class="module-content">
                <h4 class="module-title">健康讲堂</h4>
                <p class="module-description">健康知识普及、讲座安排、保健指导</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块 →</span>
              </div>
            </div>

            <div class="module-card animate-slide-up" @click="navigateTo('/sports-equipment')" style="animation-delay: 0.9s">
              <div class="module-header">
                <div class="module-icon sports">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="21" r="1" stroke="currentColor" stroke-width="2"/>
                    <circle cx="19" cy="21" r="1" stroke="currentColor" stroke-width="2"/>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <span class="module-badge">装备</span>
              </div>
              <div class="module-content">
                <h4 class="module-title">运动装备</h4>
                <p class="module-description">装备共享平台、商城购买、用品管理</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块 →</span>
              </div>
            </div>

            <!-- 统计模块 (仅管理员可见) -->
            <div 
              v-if="canAccessStatistics"
              class="module-card animate-slide-up" 
              @click="navigateTo('/statistics')" 
              style="animation-delay: 1.0s"
            >
              <div class="module-header">
                <div class="module-icon statistics">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3v18h18" stroke="currentColor" stroke-width="2"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" stroke-width="2"/>
                    <circle cx="18" cy="8" r="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="11" cy="13" r="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="7" cy="17" r="2" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <span class="module-badge">统计</span>
              </div>
              <div class="module-content">
                <h4 class="module-title">PE积分统计</h4>
                <p class="module-description">PE积分指标设置、达标率统计、排名分析</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块 →</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 调试面板 (可选显示) -->
    <div v-if="showDebugPanel" class="debug-panel">
      <h4>权限调试信息</h4>
      <div class="debug-info">
        <p><strong>当前用户角色：</strong> {{ currentUserRole || '未设置' }}</p>
        <p><strong>权限管理器已初始化：</strong> {{ permissionManagerInitialized ? '是' : '否' }}</p>
        <p><strong>是否为超级管理员：</strong> {{ isSuperAdminStatus ? '是' : '否' }}</p>
        <p><strong>是否为校级管理员：</strong> {{ isSchoolAdminStatus ? '是' : '否' }}</p>
        <p><strong>本地存储的userType：</strong> {{ localUserType || '未设置' }}</p>
      </div>
      <button @click="refreshPermissionStatus" class="btn btn-primary btn-small">刷新权限状态</button>
      <button @click="showDebugPanel = false" class="btn btn-secondary btn-small">关闭调试</button>
    </div>
    
    <!-- 调试面板切换按钮 -->
    <button v-if="!showDebugPanel" @click="showDebugPanel = true" class="debug-toggle">
      🐛
    </button>
  </div>
</template>

<script>
// 导入权限管理相关函数
import { isSuperAdmin, isSchoolAdmin, isDepartmentAdmin, getCurrentRole } from '@/utils/permissionManager'
import permissionManager from '@/utils/permissionManager'
import authService from '@/services/authService'

export default {
  name: 'Dashboard',
  data() {
    return {
      username: '',
      userRole: '',
      isAdmin: false,
      canAccessAdminManagement: false,
      currentUserRole: '',
      permissionManagerInitialized: false,
      isSuperAdminStatus: false,
      isSchoolAdminStatus: false,
      localUserType: '',
      showDebugPanel: false // 控制调试面板显示
    }
  },
  computed: {
    // 检查是否可以访问统计功能 (校级管理员和院级管理员)
    canAccessStatistics() {
      return isSchoolAdmin() || isDepartmentAdmin()
    }
  },
  async mounted() {
    const user = await authService.getCurrentUser()
    if (user) {
      this.username = user.realName || user.username
      this.userRole = user.userType
      this.isAdmin = isSuperAdmin() // 使用权限管理器而不是硬编码
      // 校级管理员、院级管理员和超级管理员都能访问管理员管理
      this.canAccessAdminManagement = isSuperAdmin() || isSchoolAdmin() || isDepartmentAdmin()
    } else {
      this.username = '用户'
    }
    await this.refreshPermissionStatus()
  },
  methods: {
    navigateTo(path) {
      this.$router.push(path)
    },
    redirectToTice() {
      window.location.href = 'https://tice.wuhuanfeng.com/teacher/login'
    },
    logout() {
      authService.logout()
      this.$router.push('/login')
    },

    goToYouzanHealth() {
      window.location.href = 'https://www.open-health.me/'
    },

    async refreshPermissionStatus() {
      try {
        // 获取当前用户信息
        const user = await authService.getCurrentUser()
        this.currentUserRole = user ? user.userType : ''
        
        // 检查权限管理器状态
        this.permissionManagerInitialized = permissionManager.initialized
        this.isSuperAdminStatus = isSuperAdmin()
        this.isSchoolAdminStatus = isSchoolAdmin()
        
        // 检查本地存储
        this.localUserType = localStorage.getItem('userType')
        
        console.log('权限状态调试信息:', {
          currentUserRole: this.currentUserRole,
          permissionManagerInitialized: this.permissionManagerInitialized,
          isSuperAdminStatus: this.isSuperAdminStatus,
          isSchoolAdminStatus: this.isSchoolAdminStatus,
          localUserType: this.localUserType,
          permissionManagerRole: getCurrentRole()
        })
      } catch (error) {
        console.error('获取权限状态失败:', error)
      }
    }
  }
}
</script>

<style scoped>
/* 主容器 */
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 顶部导航栏 */
.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: var(--shadow-sm);
}

.header-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logo-icon {
  width: 50px;
  height: 50px;
  background: var(--primary-gradient);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.logo-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.system-title {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.system-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  position: relative;
}

.welcome-text {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.greeting {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.username {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.user-avatar {
  width: 45px;
  height: 45px;
  background: var(--primary-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: var(--font-weight-bold);
  font-size: 18px;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-sm);
  min-width: 180px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-normal);
}

.user-section:hover .user-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: left;
}

.menu-item:hover {
  background: var(--bg-surface);
  color: var(--primary-color);
}

.menu-icon {
  font-size: 16px;
}

.admin-item:hover {
  background: rgba(255, 107, 53, 0.1);
  color: var(--accent-color);
}

.logout-item:hover {
  background: rgba(211, 47, 47, 0.1);
  color: var(--danger-color);
}

/* 主内容区域 */
.main-content {
  padding: var(--spacing-xl) 0;
}

.content-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
}

/* 英雄区域 */
.hero-section {
  margin-bottom: var(--spacing-2xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-gradient);
  opacity: 0.05;
  border-radius: var(--radius-xl);
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--spacing-2xl);
  align-items: center;
  position: relative;
  z-index: 2;
}

.hero-text {
  max-width: 600px;
}

.hero-title {
  font-size: 42px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  line-height: 1.2;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-xl);
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-xs);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--divider);
}

.hero-visual {
  position: relative;
  width: 200px;
  height: 200px;
}

.floating-elements {
  position: relative;
  width: 100%;
  height: 100%;
}

.float-element {
  position: absolute;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: var(--shadow-md);
  animation: heroFloat 6s ease-in-out infinite;
}

.element-1 {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.element-2 {
  top: 10%;
  right: 10%;
  animation-delay: 1.5s;
}

.element-3 {
  bottom: 30%;
  left: 10%;
  animation-delay: 3s;
}

.element-4 {
  bottom: 10%;
  right: 20%;
  animation-delay: 4.5s;
}

@keyframes heroFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(180deg);
  }
}

/* 模块区域 */
.modules-section {
  margin-bottom: var(--spacing-2xl);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: 36px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.section-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: var(--spacing-xl);
}

.module-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 0;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
}

.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-gradient);
  transform: scaleX(0);
  transition: transform var(--transition-normal);
}

.module-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.module-card:hover::before {
  transform: scaleX(1);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
}

.module-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.module-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  border-radius: var(--radius-md);
}

.module-icon svg {
  width: 28px;
  height: 28px;
  color: white;
  z-index: 2;
}

.module-icon.teaching {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.module-icon.group {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.module-icon.training {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.module-icon.test {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.module-icon.equipment {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.module-icon.venue {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.module-icon.listening {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.module-icon.health {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
}

.module-icon.sports {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.module-icon.statistics {
  background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
}

.module-badge {
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
}

.module-content {
  padding: 0 var(--spacing-xl) var(--spacing-lg);
}

.module-title {
  font-size: 20px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.module-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.module-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--divider);
  text-align: right;
}

.module-action {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-normal);
}

.module-card:hover .module-action {
  color: var(--accent-color);
}

/* 调试面板 */
.debug-panel {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--divider);
  max-width: 400px;
  z-index: 1001;
}

.debug-panel h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: 16px;
}

.debug-info {
  margin-bottom: var(--spacing-md);
}

.debug-info p {
  margin: var(--spacing-xs) 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.debug-toggle {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: var(--primary-gradient);
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
  z-index: 1000;
}

.debug-toggle:hover {
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header-container {
    padding: 0 var(--spacing-lg);
  }
  
  .content-container {
    padding: 0 var(--spacing-lg);
  }
  
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .modules-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .hero-visual {
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .header-container {
    height: 70px;
    padding: 0 var(--spacing-md);
  }
  
  .content-container {
    padding: 0 var(--spacing-md);
  }
  
  .logo-section {
    gap: var(--spacing-sm);
  }
  
  .logo-icon {
    width: 40px;
    height: 40px;
  }
  
  .logo-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .system-title {
    font-size: 18px;
  }
  
  .system-subtitle {
    font-size: 10px;
  }
  
  .welcome-text {
    display: none;
  }
  
  .user-avatar {
    width: 35px;
    height: 35px;
    font-size: 14px;
  }
  
  .hero-section {
    padding: var(--spacing-lg);
  }
  
  .hero-title {
    font-size: 24px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .stat-divider {
    width: 40px;
    height: 1px;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .user-menu {
    position: fixed;
    top: 70px;
    right: var(--spacing-md);
    left: auto;
    min-width: auto;
    width: 200px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: var(--spacing-lg) 0;
  }
  
  .hero-visual {
    width: 150px;
    height: 150px;
  }
  
  .float-element {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .debug-panel {
    bottom: var(--spacing-md);
    right: var(--spacing-md);
    left: var(--spacing-md);
    max-width: none;
  }
  
  .debug-toggle {
    bottom: var(--spacing-md);
    right: var(--spacing-md);
  }
}
</style> 