<template>
  <div class="statistics-dashboard">
    <!-- 顶部标题栏 -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">PE校园统计大屏</h1>
      <div class="header-info">
        <span class="current-time">{{ currentTime }}</span>
        <span class="user-info">{{ userInfo.name || '管理员' }} | {{ userRoleText }}</span>
      </div>
    </div>

    <!-- 权限提示 -->
        <div v-if="!hasPermission" class="permission-denied">
      <div class="permission-message">
        <svg class="warning-icon" viewBox="0 0 24 24" fill="none" width="48" height="48" style="display:block;margin:0 auto 16px;">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#faad14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="12" y1="9" x2="12" y2="13" stroke="#faad14" stroke-width="2" stroke-linecap="round"/>
          <line x1="12" y1="17" x2="12.01" y2="17" stroke="#faad14" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <h2>访问受限</h2>
        <p>只有校级管理员和院级管理员才能访问统计功能</p>
      </div>
    </div>

    <!-- 统计内容 -->
    <div v-else class="dashboard-content">
      <!-- 紧凑型网格布局 -->
      <div class="compact-grid">
        <!-- 左侧面板 -->
        <div class="left-panel">
          <!-- 指标设置区域 (仅校级管理员可见) -->
          <div v-if="isSchoolAdmin" class="targets-compact">
            <div class="compact-card">
              <div class="card-header collapsible" @click="toggleTargetsPanel">
                <h3>PE积分指标</h3>
                <i class="toggle-icon" :class="{ 'rotated': !targetsCollapsed }">▼</i>
              </div>
              <div v-show="!targetsCollapsed" class="card-content">
                <div class="targets-mini-grid">
                  <div class="target-mini-item" v-for="(target, key) in targetItems" :key="key">
                    <div class="target-mini-label">{{ target.label }}</div>
                    <div class="target-mini-value" v-if="!editingTargets">
                      {{ targets?.[target.key] || '--' }}分
                    </div>
                    <input 
                      v-else
                      v-model.number="editTargets[target.key]"
                      type="number"
                      min="1"
                      class="target-mini-input"
                    />
                  </div>
                </div>
                <div class="targets-actions">
                  <button @click="toggleEditTargets" class="btn-mini" :disabled="targetsLoading">
                    {{ editingTargets ? '取消' : '编辑' }}
                  </button>
                  <button 
                    v-if="editingTargets" 
                    @click="saveTargets" 
                    class="btn-mini primary"
                    :disabled="targetsLoading"
                  >
                    {{ targetsLoading ? '保存中...' : '保存' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 概览卡片 -->
          <div class="overview-compact">
            <div class="compact-card">
              <div class="card-header">
                <h3>数据概览</h3>
              </div>
              <div class="card-content">
                <div class="overview-stats">
                  <div class="stat-mini">
                    <div class="stat-mini-value">{{ getOverviewData().school }}</div>
                    <div class="stat-mini-label">学校</div>
                  </div>
                  <div class="stat-mini">
                    <div class="stat-mini-value">{{ getOverviewData().totalStudents }}</div>
                    <div class="stat-mini-label">学生总数</div>
                  </div>
                  <div class="stat-mini">
                    <div class="stat-mini-value">{{ getOverviewData().avgCompliance }}%</div>
                    <div class="stat-mini-label">平均达标率</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="quick-actions">
            <div class="compact-card">
              <div class="card-header">
                <h3>快速操作</h3>
              </div>
              <div class="card-content">
                <button @click="refreshAllData" class="action-btn" :disabled="anyLoading">
                  <i class="icon">🔄</i>
                  {{ anyLoading ? '刷新中...' : '刷新数据' }}
                </button>
                <button @click="toggleCompactMode" class="action-btn">
                  <i class="icon">{{ isCompactMode ? '📖' : '📋' }}</i>
                  {{ isCompactMode ? '详细模式' : '紧凑模式' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧主要内容区域 -->
        <div class="main-content-area">
          <!-- 标签页导航 -->
          <div class="tab-navigation">
            <div 
              v-if="isSchoolAdmin"
              class="tab-item"
              :class="{ active: activeTab === 'school' }"
              @click="activeTab = 'school'"
            >
              <i class="icon">🏫</i>
              学校统计
            </div>
            <div 
              class="tab-item"
              :class="{ active: activeTab === 'college' }"
              @click="activeTab = 'college'"
            >
              <i class="icon">🏛️</i>
              {{ isSchoolAdmin ? '院系统计' : '本院统计' }}
            </div>
          </div>

          <!-- 标签页内容 -->
          <div class="tab-content">
            <!-- 学校统计标签页 -->
            <div v-if="activeTab === 'school' && isSchoolAdmin" class="tab-panel">
              <CompactSchoolStats 
                :data="schoolStats"
                :loading="schoolStatsLoading"
                :compact-mode="isCompactMode"
                @refresh="fetchSchoolStatistics"
              />
            </div>

            <!-- 院系统计标签页 -->
            <div v-if="activeTab === 'college'" class="tab-panel">
              <CompactCollegeStats 
                :data="collegeStats"
                :loading="collegeStatsLoading"
                :compact-mode="isCompactMode"
                @refresh="fetchCollegeStatistics"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-toast" :class="{ show: !!error }">
        <span style="color:#ff4d4f;font-size:16px">✕</span>
        <span>{{ error }}</span>
        <button @click="error = ''" class="close-btn">×</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import api from '@/services/api'
import authService from '@/services/authService'
import { isSchoolAdmin, isDepartmentAdmin } from '@/utils/permissionManager'
import CompactSchoolStats from '@/components/Statistics/CompactSchoolStats.vue'
import CompactCollegeStats from '@/components/Statistics/CompactCollegeStats.vue'

export default {
  name: 'Statistics',
  components: {
    CompactSchoolStats,
    CompactCollegeStats
  },
  setup() {
    // 响应式数据
    const currentTime = ref('')
    const userInfo = ref({})
    const targets = ref(null)
    const schoolStats = ref(null)
    const collegeStats = ref(null)
    const error = ref('')
    
    // 加载状态
    const targetsLoading = ref(false)
    const schoolStatsLoading = ref(false)
    const collegeStatsLoading = ref(false)
    
    // 交互状态
    const activeTab = ref('college') // 默认显示院系统计
    const isCompactMode = ref(true)
    const targetsCollapsed = ref(false)
    const editingTargets = ref(false)
    const editTargets = ref({
      weeklyTarget: 0,
      monthlyTarget: 0,
      totalTarget: 0
    })
    
    // 指标配置
    const targetItems = [
      { key: 'weeklyTarget', label: '周指标' },
      { key: 'monthlyTarget', label: '月指标' },
      { key: 'totalTarget', label: '总指标' }
    ]

    // 计算属性
    const hasPermission = computed(() => isSchoolAdmin() || isDepartmentAdmin())
    const userRoleText = computed(() => {
      if (isSchoolAdmin()) return '校级管理员'
      if (isDepartmentAdmin()) return '院级管理员'
      return '未知角色'
    })
    
    const anyLoading = computed(() => 
      targetsLoading.value || schoolStatsLoading.value || collegeStatsLoading.value
    )
    
    // 初始化时设置默认标签页
    if (isSchoolAdmin()) {
      activeTab.value = 'school'
    }

    // 时间更新
    let timeInterval = null
    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    // 获取用户信息
    const fetchUserInfo = async () => {
      try {
        userInfo.value = await authService.getCurrentUser() || {}
      } catch (err) {
        console.error('获取用户信息失败:', err)
      }
    }

    // 获取学校统计数据
    const fetchSchoolStatistics = async () => {
      if (!isSchoolAdmin()) return
      
      schoolStatsLoading.value = true
      try {
        const response = await api.peStatistics.getSchoolStatistics()
        
        // 检查响应数据结构
        if (response && response.data) {
          schoolStats.value = response.data
        } else {
          schoolStats.value = response
        }
      } catch (err) {
        error.value = err.message || '获取学校统计数据失败'
        console.error('获取学校统计数据失败:', err)
      } finally {
        schoolStatsLoading.value = false
      }
    }

    // 获取院系统计数据
    const fetchCollegeStatistics = async () => {
      collegeStatsLoading.value = true
      try {
        const response = await api.peStatistics.getCollegeStatistics()
        
        // 检查响应数据结构
        if (response && response.data) {
          collegeStats.value = response.data
        } else if (response && (response.collegeStats || response.classStats)) {
          // 如果响应直接包含统计数据
          collegeStats.value = response
        } else {
          collegeStats.value = response
        }
      } catch (err) {
        error.value = err.message || '获取院系统计数据失败'
        console.error('获取院系统计数据失败:', err)
      } finally {
        collegeStatsLoading.value = false
      }
    }

    // 更新指标
    const handleUpdateTargets = async (newTargets) => {
      targetsLoading.value = true
      try {
        await api.peStatistics.setTargets(newTargets)
        targets.value = newTargets
        
        // 更新指标后刷新统计数据
        if (isSchoolAdmin()) {
          await fetchSchoolStatistics()
        }
        await fetchCollegeStatistics()
        
        error.value = ''
      } catch (err) {
        error.value = err.message || '设置指标失败'
        console.error('设置指标失败:', err)
      } finally {
        targetsLoading.value = false
      }
    }

    // 重试加载
    const retryLoad = async () => {
      error.value = ''
      await Promise.all([
        fetchUserInfo(),
        isSchoolAdmin() ? fetchSchoolStatistics() : Promise.resolve(),
        fetchCollegeStatistics()
      ])
    }
    
    // 新增交互方法
    const toggleTargetsPanel = () => {
      targetsCollapsed.value = !targetsCollapsed.value
    }
    
    const toggleEditTargets = () => {
      if (editingTargets.value) {
        // 取消编辑，恢复原值
        if (targets.value) {
          editTargets.value = { ...targets.value }
        }
        editingTargets.value = false
      } else {
        // 开始编辑
        if (targets.value) {
          editTargets.value = { ...targets.value }
        } else {
          editTargets.value = {
            weeklyTarget: 10,
            monthlyTarget: 40,
            totalTarget: 100
          }
        }
        editingTargets.value = true
      }
    }
    
    const saveTargets = async () => {
      try {
        await api.peStatistics.setTargets(editTargets.value)
        targets.value = { ...editTargets.value }
        editingTargets.value = false
        
        // 刷新统计数据
        if (isSchoolAdmin()) {
          await fetchSchoolStatistics()
        }
        await fetchCollegeStatistics()
        
        error.value = ''
      } catch (err) {
        error.value = err.message || '设置指标失败'
      }
    }
    
    const refreshAllData = async () => {
      await Promise.all([
        isSchoolAdmin() ? fetchSchoolStatistics() : Promise.resolve(),
        fetchCollegeStatistics()
      ])
    }
    
    const toggleCompactMode = () => {
      isCompactMode.value = !isCompactMode.value
    }
    
    const getOverviewData = () => {
      const data = activeTab.value === 'school' ? schoolStats.value : collegeStats.value
      if (!data) return { school: '--', totalStudents: '--', avgCompliance: '--' }
      
      const avgCompliance = data.overallCompliance ? 
        ((data.overallCompliance.weeklyComplianceRate || 0) + 
         (data.overallCompliance.monthlyComplianceRate || 0) + 
         (data.overallCompliance.totalComplianceRate || 0)) / 3 : 0
      
      return {
        school: data.school || '--',
        totalStudents: data.totalStudents || '--',
        avgCompliance: avgCompliance.toFixed(1)
      }
    }

    // 初始化
    const initialize = async () => {
      if (!hasPermission.value) return

      updateTime()
      timeInterval = setInterval(updateTime, 1000)

      await Promise.all([
        fetchUserInfo(),
        isSchoolAdmin() ? fetchSchoolStatistics() : Promise.resolve(),
        fetchCollegeStatistics()
      ])
    }

    onMounted(() => {
      initialize()
    })

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })

    return {
      currentTime,
      userInfo,
      targets,
      schoolStats,
      collegeStats,
      error,
      targetsLoading,
      schoolStatsLoading,
      collegeStatsLoading,
      hasPermission,
      isSchoolAdmin: isSchoolAdmin(),
      userRoleText,
      anyLoading,
      activeTab,
      isCompactMode,
      targetsCollapsed,
      editingTargets,
      editTargets,
      targetItems,
      toggleTargetsPanel,
      toggleEditTargets,
      saveTargets,
      refreshAllData,
      toggleCompactMode,
      getOverviewData,
      fetchSchoolStatistics,
      fetchCollegeStatistics,
      retryLoad
    }
  }
}
</script>

<style scoped>
.statistics-dashboard {
  min-height: 100vh;
  background: var(--bg-body);
  color: var(--text-primary);
  font-family: var(--font-family);
}

/* 顶部标题栏 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: #ffffff;
  border-bottom: 1px solid var(--border-light);
  height: var(--header-height);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.dashboard-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #000000d9;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-time {
  font-size: 14px;
  font-weight: 500;
  color: #1677ff;
}

.user-info {
  font-size: 13px;
  color: #00000073;
}

/* 权限提示 */
.permission-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}

.permission-message {
  text-align: center;
  padding: 48px 40px;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-card);
  max-width: 400px;
}

.warning-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 16px;
  color: #faad14;
}

.permission-message h2 {
  font-size: 20px;
  margin: 0 0 10px 0;
  color: #000000d9;
  font-weight: 500;
}

.permission-message p {
  font-size: 14px;
  color: #00000073;
  margin: 0;
}

/* 主要内容区域 */
.dashboard-content {
  padding: 20px 24px;
  height: calc(100vh - var(--header-height));
  overflow: hidden;
}

/* 紧凑型网格布局 */
.compact-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  height: 100%;
}

/* 左侧面板 */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

/* 卡片样式 */
.compact-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.card-header {
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header.collapsible {
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}

.card-header.collapsible:hover {
  background: #f0f0f0;
}

.card-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #000000d9;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-icon {
  transition: transform 0.2s;
  font-size: 11px;
  color: #00000073;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.card-content {
  padding: 14px 16px;
}

/* 指标设置 */
.targets-mini-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.target-mini-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid var(--border-light);
}

.target-mini-label { font-size: 13px; color: #00000073; }

.target-mini-value {
  font-size: 14px;
  font-weight: 600;
  color: #52c41a;
}

.target-mini-input {
  width: 72px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 3px 8px;
  color: #000000d9;
  font-size: 13px;
  font-family: inherit;
  outline: none;
}

.target-mini-input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
}

.targets-actions { display: flex; gap: 8px; }

.btn-mini {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  background: white;
  color: #000000d9;
  font-family: inherit;
}

.btn-mini:hover:not(:disabled) { border-color: #1677ff; color: #1677ff; }
.btn-mini.primary { background: #1677ff; border-color: #1677ff; color: white; }
.btn-mini.primary:hover:not(:disabled) { background: #4096ff; border-color: #4096ff; }
.btn-mini:disabled { opacity: 0.5; cursor: not-allowed; }

/* 概览统计 */
.overview-stats { display: grid; grid-template-columns: 1fr; gap: 8px; }

.stat-mini {
  text-align: center;
  padding: 10px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid var(--border-light);
}

.stat-mini-value {
  font-size: 18px;
  font-weight: 700;
  color: #1677ff;
  margin-bottom: 3px;
}

.stat-mini-label { font-size: 12px; color: #00000073; }

/* 快速操作 */
.action-btn {
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 6px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: #000000d9;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-family: inherit;
}

.action-btn:hover:not(:disabled) { border-color: #1677ff; color: #1677ff; }
.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 右侧主要内容区域 */
.main-content-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 标签页 */
.tab-navigation {
  display: flex;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  padding: 4px;
  margin-bottom: 12px;
  gap: 2px;
}

.tab-item {
  flex: 1;
  padding: 7px 12px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
  color: #00000073;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  user-select: none;
}

.tab-item:hover { background: #f5f5f5; color: #000000d9; }
.tab-item.active { background: #1677ff; color: #ffffff; }

/* 标签页内容 */
.tab-content { flex: 1; overflow: hidden; }
.tab-panel { height: 100%; overflow-y: auto; }

/* 错误提示 */
.error-toast {
  position: fixed;
  top: calc(var(--header-height) + 16px);
  right: 20px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  padding: 10px 14px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  transform: translateX(120%);
  transition: transform 0.2s ease;
  z-index: 1000;
  max-width: 400px;
  box-shadow: var(--shadow-md);
  font-size: 14px;
}

.error-toast.show { transform: translateX(0); }
.error-toast .error-icon { font-size: 14px; flex-shrink: 0; }

.error-toast .close-btn {
  background: none;
  border: none;
  color: #ff4d4f;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  line-height: 1;
}

/* 响应式 */
@media (max-width: 1200px) {
  .compact-grid { grid-template-columns: 240px 1fr; }
}

@media (max-width: 768px) {
  .dashboard-header { padding: 0 16px; }
  .header-info { gap: 8px; }
  .user-info { display: none; }
  .dashboard-content { padding: 12px 16px; height: calc(100vh - var(--header-height)); }
  .compact-grid { grid-template-columns: 1fr; grid-template-rows: auto 1fr; gap: 12px; }
  .left-panel { order: 2; flex-direction: row; overflow-x: auto; overflow-y: visible; }
  .left-panel > div { min-width: 200px; flex-shrink: 0; }
  .main-content-area { order: 1; }
  .error-toast { right: 10px; left: 10px; max-width: none; }
}
</style>
