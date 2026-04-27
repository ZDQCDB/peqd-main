<template>
  <div class="group-module">
    <!-- 顶部导航栏 -->
    <header class="module-header">
      <div class="header-container">
        <div class="header-left">
          <button class="back-btn" @click="$router.push('/dashboard')">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            返回桌面
          </button>
          <div class="module-info">
            <h1 class="module-title">群体活动管理</h1>
            <p class="module-subtitle">Group Activities Management</p>
          </div>
        </div>
        
        <div class="header-actions">
          <div class="activity-stats">
            <div class="stat-item">
              <span class="stat-number">9</span>
              <span class="stat-label">功能模块</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">24/7</span>
              <span class="stat-label">全天服务</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="module-content">
      <div class="content-container">
        <!-- 功能模块网格 -->
        <section class="modules-section">
          <div class="section-header">
            <h2 class="section-title">选择功能模块</h2>
            <p class="section-subtitle">点击下方卡片进入相应的群体活动管理功能</p>
          </div>
          
          <div class="modules-grid">
            <div class="activity-card animate-slide-up" @click="$router.push('/group/morning-exercise')" style="animation-delay: 0.1s">
              <div class="card-header">
                <div class="activity-icon morning">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-badge active">运行中</span>
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">早操管理</h3>
                <p class="card-description">早操时间安排、考勤记录、出勤率统计分析</p>
                <div class="card-features">
                  <span class="feature-tag">考勤管理</span>
                  <span class="feature-tag">数据分析</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="action-text">进入模块</span>
                <div class="action-arrow">→</div>
              </div>
            </div>

            <div class="activity-card animate-slide-up" @click="$router.push('/group/sunshine-run')" style="animation-delay: 0.2s">
              <div class="card-header">
                <div class="activity-icon sunshine">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 3v5h-5" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 16a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 16H3v5" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-badge active">运行中</span>
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">校园阳光跑</h3>
                <p class="card-description">阳光跑路线规划、跑步记录、健康数据统计</p>
                <div class="card-features">
                  <span class="feature-tag">路线管理</span>
                  <span class="feature-tag">健康统计</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="action-text">进入模块</span>
                <div class="action-arrow">→</div>
              </div>
            </div>

            <div class="activity-card animate-slide-up" @click="$router.push('/group/homework')" style="animation-delay: 0.3s">
              <div class="card-header">
                <div class="activity-icon homework">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-badge active">运行中</span>
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">课后作业统计</h3>
                <p class="card-description">课后运动作业完成情况、班级排名、趋势分析</p>
                <div class="card-features">
                  <span class="feature-tag">完成统计</span>
                  <span class="feature-tag">班级排名</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="action-text">进入模块</span>
                <div class="action-arrow">→</div>
              </div>
            </div>

            <div class="activity-card animate-slide-up" @click="$router.push('/group/homework-assignment')" style="animation-delay: 0.35s" v-if="isTeacherOrAdmin">
              <div class="card-header">
                <div class="activity-icon homework-assign">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="12" y1="18" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <line x1="9" y1="15" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-badge active">运行中</span>
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">课后作业发布</h3>
                <p class="card-description">教师发布课后运动作业、选择班级项目、查看提交情况</p>
                <div class="card-features">
                  <span class="feature-tag">作业发布</span>
                  <span class="feature-tag">提交管理</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="action-text">进入模块</span>
                <div class="action-arrow">→</div>
              </div>
            </div>

            <div class="activity-card animate-slide-up" @click="$router.push('/group/homework-completion-dashboard')" style="animation-delay: 0.38s" v-if="isSchoolAdmin">
              <div class="card-header">
                <div class="activity-icon homework-track">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-badge admin">管理端</span>
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">作业完成追踪</h3>
                <p class="card-description">全校作业完成率大屏、教师班级维度追踪、导出报表</p>
                <div class="card-features">
                  <span class="feature-tag">完成追踪</span>
                  <span class="feature-tag">数据大屏</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="action-text">进入模块</span>
                <div class="action-arrow">→</div>
              </div>
            </div>

            <div class="activity-card animate-slide-up" @click="$router.push('/group/management')" style="animation-delay: 0.4s">
              <div class="card-header">
                <div class="activity-icon management">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-badge admin">管理端</span>
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">PE校园管理端</h3>
                <p class="card-description">PE校园活动管理、数据统计分析、权限设置</p>
                <div class="card-features">
                  <span class="feature-tag">权限管理</span>
                  <span class="feature-tag">数据统计</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="action-text">进入模块</span>
                <div class="action-arrow">→</div>
              </div>
            </div>

            <div class="activity-card animate-slide-up" @click="$router.push('/group/activity')" style="animation-delay: 0.5s">
              <div class="card-header">
                <div class="activity-icon activity">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M9 16h6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-badge active">运行中</span>
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">活动管理</h3>
                <p class="card-description">综合活动管理平台、活动发布、报名管理</p>
                <div class="card-features">
                  <span class="feature-tag">活动发布</span>
                  <span class="feature-tag">报名管理</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="action-text">进入模块</span>
                <div class="action-arrow">→</div>
              </div>
            </div>

            <div class="activity-card animate-slide-up" @click="$router.push('/group/race-results')" style="animation-delay: 0.6s">
              <div class="card-header">
                <div class="activity-icon race-results">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15 7a4 4 0 0 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M17.8 14a5 5 0 0 0-11.6 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-badge active">运行中</span>
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">比赛成绩</h3>
                <p class="card-description">运动员比赛成绩查询、完赛统计分析、成绩数据管理</p>
                <div class="card-features">
                  <span class="feature-tag">成绩查询</span>
                  <span class="feature-tag">数据统计</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="action-text">进入模块</span>
                <div class="action-arrow">→</div>
              </div>
            </div>

            <div class="activity-card animate-slide-up" @click="$router.push('/group/sports-management')" style="animation-delay: 0.7s" v-if="isSchoolAdmin">
              <div class="card-header">
                <div class="activity-icon sports-meeting">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7.5 4 8 5.5 8 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C16.5 4 16 5.5 16 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M4 22h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M10 14.66V17c0 2 -2 3.5 -2 5M14 14.66V17c0 2 2 3.5 2 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M8 6h8a4 4 0 0 1 4 4v1a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-1a4 4 0 0 1 4-4Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-badge admin">管理端</span>
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">运动会管理</h3>
                <p class="card-description">运动会在线编排、报名导入、成绩录入、团体积分排名</p>
                <div class="card-features">
                  <span class="feature-tag">编排管理</span>
                  <span class="feature-tag">成绩录入</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="action-text">进入模块</span>
                <div class="action-arrow">→</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  name: 'Group',
  data() {
    return {
      isSchoolAdmin: false,
      isTeacherOrAdmin: false
    }
  },
  async mounted() {
    try {
      const user = await authService.getCurrentUser()
      this.isSchoolAdmin = user && (user.userType === 'school_admin' || user.userType === 'super_admin')
      this.isTeacherOrAdmin = user && ['teacher', 'department_admin', 'school_admin', 'super_admin', 'counselor'].includes(user.userType)
    } catch (e) {
      this.isSchoolAdmin = false
      this.isTeacherOrAdmin = false
    }
  }
}
</script>

<style scoped>
/* 主容器 */
.group-module {
  min-height: 100vh;
  background: var(--bg-body);
}

/* 顶部导航栏 */
.module-header {
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
  padding: 0 var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: #000000d9;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  font-size: 14px;
  font-family: inherit;
}

.back-btn:hover {
  border-color: #1677ff;
  color: #1677ff;
}

.back-btn svg { width: 16px; height: 16px; }

.module-info {
  display: flex;
  flex-direction: column;
}

.module-title {
  font-size: 18px;
  font-weight: 600;
  color: #000000d9;
  margin: 0;
}

.module-subtitle {
  font-size: 12px;
  color: #00000073;
  margin-top: 2px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.activity-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-xs);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: var(--divider);
}

/* 主内容区域 */
.module-content {
  padding: var(--spacing-xl) 0;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
}

/* 模块区域 */
.modules-section {
  margin-bottom: var(--spacing-2xl);
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
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-xl);
}

/* 活动卡片 */
.activity-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 0;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.activity-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: #91caff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
}

.activity-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.activity-icon svg {
  width: 28px;
  height: 28px;
  color: white;
  z-index: 2;
}

/* 不同模块的图标颜色 */
.activity-icon.pe-campus       { background: #e6f4ff; color: #1677ff; }
.activity-icon.morning         { background: #fff7e6; color: #d46b08; }
.activity-icon.extracurricular { background: #e6fffb; color: #08979c; }
.activity-icon.sunshine        { background: #f6ffed; color: #389e0d; }
.activity-icon.homework        { background: #f0f5ff; color: #2f54eb; }
.activity-icon.management      { background: #fff0f6; color: #c41d7f; }
.activity-icon.activity        { background: #f0f5ff; color: #2f54eb; }
.activity-icon.race-results    { background: #fff2e8; color: #d4380d; }
.activity-icon.sports-meeting  { background: #f9f0ff; color: #722ed1; }
.activity-icon.homework-assign { background: #e6fffb; color: #08979c; }
.activity-icon.homework-track  { background: #fcffe6; color: #7cb305; }

.activity-icon svg { width: 22px; height: 22px; }

.card-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: rgba(46, 125, 50, 0.1);
  color: var(--success-color);
  border: 1px solid rgba(46, 125, 50, 0.2);
}

.status-badge.admin {
  background: rgba(255, 107, 53, 0.1);
  color: var(--accent-color);
  border: 1px solid rgba(255, 107, 53, 0.2);
}

.card-content {
  padding: 0 var(--spacing-xl) var(--spacing-lg);
}

.card-title {
  font-size: 20px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.card-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.card-features {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.feature-tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-surface);
  border: 1px solid var(--divider);
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid var(--border-light);
}

.action-text {
  font-size: 13px;
  color: #1677ff;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-arrow {
  font-size: 14px;
  color: #1677ff;
}

.activity-card:hover .action-text,
.activity-card:hover .action-arrow {
  color: #4096ff;
}



/* 响应式设计 */
@media (max-width: 1024px) {
  .header-container {
    padding: 0 var(--spacing-lg);
  }
  
  .content-container {
    padding: 0 var(--spacing-lg);
  }
  
  .modules-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .activity-stats {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .stat-number {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .header-container {
    height: 70px;
    padding: 0 var(--spacing-md);
    flex-direction: column;
    gap: var(--spacing-md);
    justify-content: center;
  }
  
  .header-left {
    width: 100%;
    justify-content: space-between;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .content-container {
    padding: 0 var(--spacing-md);
  }
  
  .module-title {
    font-size: 22px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .activity-card {
    margin-bottom: var(--spacing-md);
  }
  
  .activity-stats {
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .header-container {
    height: auto;
    padding: var(--spacing-md);
  }
  
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .back-btn {
    align-self: flex-start;
  }
  
  .activity-stats {
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
  }
  
  .stat-divider {
    width: 20px;
    height: 1px;
  }
  
  .card-features {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .feature-tag {
    text-align: center;
  }
}
</style> 