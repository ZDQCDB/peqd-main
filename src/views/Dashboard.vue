<template>
  <div class="dashboard">
    <!-- 顶部导航栏 -->
    <header class="dashboard-header">
      <div class="header-container">
        <div class="header-left">
          <div class="logo-section">
            <div class="logo-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                <path d="M20 4L6 11v9l14 8 14-8v-9L20 4z" stroke="white" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
                <path d="M6 20l14 8 14-8" stroke="white" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
                <path d="M6 25l14 8 14-8" stroke="white" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
              </svg>
            </div>
            <div class="logo-text">
              <h1 class="system-title">校园体育管理系统</h1>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <div class="user-section">
            <span class="user-name-text">{{ username }}</span>
            <div class="user-avatar">
              <span>{{ username.charAt(0) }}</span>
            </div>
            <div class="user-menu">
              <button class="menu-item" @click="navigateTo('/profile')">
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/></svg>
                个人中心
              </button>
              <button 
                v-if="canAccessAdminManagement"
                class="menu-item" 
                @click="navigateTo('/admin')"
              >
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                管理员管理
              </button>
              <div class="menu-divider"></div>
              <button class="menu-item menu-item-danger" @click="logout">
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
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
          <div class="hero-inner">
            <div class="hero-text">
              <h2 class="hero-title">欢迎使用，{{ username }}</h2>
              <p class="hero-subtitle">校园体育教学与管理平台，请从下方功能模块开始使用</p>
            </div>
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
        </section>

        <!-- 功能模块网格 -->
        <section class="modules-section">
          <div class="section-header">
            <h3 class="section-title">功能模块</h3>
            <span class="section-subtitle">选择下方模块开始使用</span>
          </div>
          
          <div class="modules-grid">
            <div class="module-card" @click="navigateTo('/teaching')">
              <div class="module-header">
                <div class="module-icon teaching">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 4.5v15Z"/>
                    <path d="M9 10h6M9 14h6M9 6h6"/>
                  </svg>
                </div>
                <h4 class="module-title">教学管理</h4>
              </div>
              <div class="module-content">
                <p class="module-description">教学周历、教案管理、签到记录、视频学习等完整教学流程</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>

            <div class="module-card" @click="navigateTo('/group')">
              <div class="module-header">
                <div class="module-icon group">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h4 class="module-title">群体活动</h4>
              </div>
              <div class="module-content">
                <p class="module-description">PE校园、早操管理、课外活动、阳光跑等群体活动组织</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>

            <div class="module-card" @click="navigateTo('/training')">
              <div class="module-header">
                <div class="module-icon training">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M7.5 12.5l5 5L22 8"/>
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  </svg>
                </div>
                <h4 class="module-title">训练管理</h4>
              </div>
              <div class="module-content">
                <p class="module-description">训练计划制定、完成情况统计、PE分数管理等</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>

            <div class="module-card" @click="redirectToTice">
              <div class="module-header">
                <div class="module-icon test">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M3 3v18h18"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                  </svg>
                </div>
                <h4 class="module-title">体质测试</h4>
              </div>
              <div class="module-content">
                <p class="module-description">体质测试管理、成绩录入、结果分析查询</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>

            <div class="module-card" @click="navigateTo('/equipment')">
              <div class="module-header">
                <div class="module-icon equipment">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
                  </svg>
                </div>
                <h4 class="module-title">器材管理</h4>
              </div>
              <div class="module-content">
                <p class="module-description">体育器材库存管理、借用申请、归还记录</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>

            <div class="module-card" @click="navigateTo('/venue')">
              <div class="module-header">
                <div class="module-icon venue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <h4 class="module-title">场馆管理</h4>
              </div>
              <div class="module-content">
                <p class="module-description">场馆预约、使用安排、设施维护管理</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>

            <div v-if="canAccessListening" class="module-card" @click="navigateTo('/listening')">
              <div class="module-header">
                <div class="module-icon listening">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <h4 class="module-title">听课管理</h4>
              </div>
              <div class="module-content">
                <p class="module-description">听课记录、教学评价、课堂质量监控</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>

            <div class="module-card" @click="goToYouzanHealth">
              <div class="module-header">
                <div class="module-icon health">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <h4 class="module-title">健康讲堂</h4>
              </div>
              <div class="module-content">
                <p class="module-description">健康知识普及、讲座安排、保健指导</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>

            <div class="module-card" @click="navigateTo('/sports-equipment')">
              <div class="module-header">
                <div class="module-icon sports">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <circle cx="8" cy="21" r="1"/>
                    <circle cx="19" cy="21" r="1"/>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                  </svg>
                </div>
                <h4 class="module-title">运动装备</h4>
              </div>
              <div class="module-content">
                <p class="module-description">装备共享平台、商城购买、用品管理</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>

            <!-- 统计模块 (仅管理员可见) -->
            <div v-if="canAccessStatistics" class="module-card" @click="navigateTo('/statistics')">
              <div class="module-header">
                <div class="module-icon statistics">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M3 3v18h18"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                    <circle cx="18" cy="8" r="2"/>
                    <circle cx="11" cy="13" r="2"/>
                    <circle cx="7" cy="17" r="2"/>
                  </svg>
                </div>
                <h4 class="module-title">PE积分统计</h4>
              </div>
              <div class="module-content">
                <p class="module-description">PE积分指标设置、达标率统计、排名分析</p>
              </div>
              <div class="module-footer">
                <span class="module-action">进入模块
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 调试面板 -->
    <div v-if="showDebugPanel" class="debug-panel">
      <div class="debug-panel-header">
        <h4>权限调试信息</h4>
        <button @click="showDebugPanel = false" class="debug-close">×</button>
      </div>
      <div class="debug-info">
        <p><strong>当前用户角色：</strong> {{ currentUserRole || '未设置' }}</p>
        <p><strong>权限管理器已初始化：</strong> {{ permissionManagerInitialized ? '是' : '否' }}</p>
        <p><strong>是否为超级管理员：</strong> {{ isSuperAdminStatus ? '是' : '否' }}</p>
        <p><strong>是否为校级管理员：</strong> {{ isSchoolAdminStatus ? '是' : '否' }}</p>
        <p><strong>本地存储的userType：</strong> {{ localUserType || '未设置' }}</p>
      </div>
      <button @click="refreshPermissionStatus" class="btn btn-primary btn-small">刷新权限状态</button>
    </div>
    
    <button v-if="!showDebugPanel" @click="showDebugPanel = true" class="debug-toggle" title="调试信息">
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/></svg>
    </button>
  </div>
</template>

<script>
// 导入权限管理相关函数
import { isSuperAdmin, isSchoolAdmin, isDepartmentAdmin, isTeacher, getCurrentRole } from '@/utils/permissionManager'
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
    },
    canAccessListening() {
      return isTeacher() || isSchoolAdmin() || isDepartmentAdmin() || isSuperAdmin()
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
.dashboard {
  min-height: 100vh;
  background: var(--bg-body);
}

/* 顶部导航栏 */
.dashboard-header {
  background: #ffffff;
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: var(--shadow-sm);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: #1677ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.system-title {
  font-size: 17px;
  font-weight: 600;
  color: #000000d9;
  margin: 0;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  cursor: pointer;
}

.user-name-text {
  font-size: 14px;
  color: #000000d9;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #1677ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.user-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06);
  padding: 4px;
  min-width: 160px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: opacity 0.15s, transform 0.15s, visibility 0.15s;
}

.user-section:hover .user-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 12px;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 14px;
  color: #000000d9;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
  font-family: inherit;
}

.menu-item:hover {
  background: #f5f5f5;
  color: #1677ff;
}

.menu-item-danger:hover {
  background: #fff2f0;
  color: #ff4d4f;
}

.menu-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 8px;
}

/* 主内容区域 */
.main-content {
  padding: 24px 0;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 欢迎横幅 */
.hero-section {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-card);
}

.hero-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.hero-title {
  font-size: 20px;
  font-weight: 600;
  color: #000000d9;
  margin-bottom: 4px;
}

.hero-subtitle {
  font-size: 14px;
  color: #00000073;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.stat-number {
  font-size: 22px;
  font-weight: 700;
  color: #1677ff;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #00000073;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: var(--border-light);
}

/* 模块区域 */
.modules-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000d9;
}

.section-subtitle {
  font-size: 13px;
  color: #00000073;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.module-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 0;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.module-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: #91caff;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 20px 16px;
}

.module-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.module-icon svg {
  width: 22px;
  height: 22px;
}

.module-icon.teaching  { background: #e6f4ff; color: #1677ff; }
.module-icon.group     { background: #fff0f6; color: #c41d7f; }
.module-icon.training  { background: #e6fffb; color: #08979c; }
.module-icon.test      { background: #f6ffed; color: #389e0d; }
.module-icon.equipment { background: #fff7e6; color: #d46b08; }
.module-icon.venue     { background: #f0f5ff; color: #2f54eb; }
.module-icon.listening { background: #fff1f0; color: #cf1322; }
.module-icon.health    { background: #f9f0ff; color: #722ed1; }
.module-icon.sports    { background: #fffbe6; color: #d4b106; }
.module-icon.statistics{ background: #e6f4ff; color: #0958d9; }

.module-title {
  font-size: 15px;
  font-weight: 500;
  color: #000000d9;
}

.module-content {
  padding: 0 20px 16px;
}

.module-description {
  font-size: 13px;
  color: #00000073;
  line-height: 1.6;
}

.module-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.module-action {
  font-size: 13px;
  color: #1677ff;
  display: flex;
  align-items: center;
  gap: 4px;
}

.module-card:hover .module-action {
  color: #4096ff;
}

/* 调试面板 */
.debug-panel {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--border-light);
  max-width: 360px;
  z-index: 1001;
}

.debug-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.debug-panel h4 {
  margin: 0;
  color: #000000d9;
  font-size: 14px;
  font-weight: 600;
}

.debug-close {
  border: none;
  background: none;
  color: #00000073;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

.debug-info {
  margin-bottom: 12px;
}

.debug-info p {
  margin: 4px 0;
  font-size: 12px;
  color: #00000073;
}

.debug-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #1677ff;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.4);
  transition: background 0.15s;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.debug-toggle:hover {
  background: #4096ff;
}

/* 响应式 */
@media (max-width: 1024px) {
  .hero-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .hero-stats {
    align-self: stretch;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .content-container { padding: 0 16px; }
  .main-content { padding: 16px 0; }
  .system-title { font-size: 15px; }
  .user-name-text { display: none; }
  .modules-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  .user-menu {
    position: fixed;
    top: calc(var(--header-height) + 4px);
    right: 16px;
  }
}

@media (max-width: 480px) {
  .modules-grid { grid-template-columns: 1fr; }
  .hero-stats { gap: 16px; }
  .debug-panel { bottom: 16px; right: 16px; left: 16px; max-width: none; }
  .debug-toggle { bottom: 16px; right: 16px; }
}
</style> 