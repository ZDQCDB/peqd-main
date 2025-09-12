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
              <span class="stat-number">6</span>
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
            <div class="activity-card animate-slide-up" @click="$router.push('/group/pe-campus')" style="animation-delay: 0.1s">
              <div class="card-header">
                <div class="activity-icon pe-campus">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="1" fill="currentColor"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-badge active">运行中</span>
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">PE校园</h3>
                <p class="card-description">举办体育比赛、参加校园竞技活动、赛事组织管理</p>
                <div class="card-features">
                  <span class="feature-tag">比赛管理</span>
                  <span class="feature-tag">成绩统计</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="action-text">进入模块</span>
                <div class="action-arrow">→</div>
              </div>
            </div>

            <div class="activity-card animate-slide-up" @click="$router.push('/group/morning-exercise')" style="animation-delay: 0.2s">
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

            <div class="activity-card animate-slide-up" @click="$router.push('/group/extracurricular')" style="animation-delay: 0.3s">
              <div class="card-header">
                <div class="activity-icon extracurricular">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="card-status">
                  <span class="status-badge active">运行中</span>
                </div>
              </div>
              <div class="card-content">
                <h3 class="card-title">课外活动</h3>
                <p class="card-description">课外体育活动安排、社团管理、兴趣小组组织</p>
                <div class="card-features">
                  <span class="feature-tag">活动安排</span>
                  <span class="feature-tag">社团管理</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="action-text">进入模块</span>
                <div class="action-arrow">→</div>
              </div>
            </div>

            <div class="activity-card animate-slide-up" @click="$router.push('/group/sunshine-run')" style="animation-delay: 0.4s">
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

            <div class="activity-card animate-slide-up" @click="$router.push('/group/management')" style="animation-delay: 0.5s">
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

            <div class="activity-card animate-slide-up" @click="$router.push('/group/activity')" style="animation-delay: 0.6s">
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
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Group'
}
</script>

<style scoped>
/* 主容器 */
.group-module {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 顶部导航栏 */
.module-header {
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
  gap: var(--spacing-lg);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--divider);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
}

.back-btn:hover {
  background: var(--bg-surface);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateX(-2px);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.module-info {
  display: flex;
  flex-direction: column;
}

.module-title {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.module-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-top: var(--spacing-xs);
}

.header-actions {
  display: flex;
  align-items: center;
}

.activity-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.8);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
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
  font-size: 32px;
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
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-xl);
}

/* 活动卡片 */
.activity-card {
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

.activity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
  transform: scaleX(0);
  transition: transform var(--transition-normal);
}

.activity-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.activity-card:hover::before {
  transform: scaleX(1);
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
.activity-icon.pe-campus {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.activity-icon.morning {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.activity-icon.extracurricular {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.activity-icon.sunshine {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.activity-icon.management {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.activity-icon.activity {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

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
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--divider);
  background: rgba(0, 0, 0, 0.02);
}

.action-text {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-normal);
}

.action-arrow {
  font-size: 16px;
  color: var(--primary-color);
  transition: all var(--transition-normal);
}

.activity-card:hover .action-text,
.activity-card:hover .action-arrow {
  color: var(--accent-color);
}

.activity-card:hover .action-arrow {
  transform: translateX(4px);
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