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
        <i class="warning-icon">⚠</i>
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
                <h3><i class="icon">🎯</i> PE积分指标</h3>
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
                <h3><i class="icon">📊</i> 数据概览</h3>
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
                <h3><i class="icon">⚡</i> 快速操作</h3>
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
        <i class="error-icon">❌</i>
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
  background: linear-gradient(135deg, #0c1022 0%, #1a1f3a 50%, #2d3561 100%);
  color: #ffffff;
  font-family: 'Microsoft YaHei', sans-serif;
}

/* 顶部标题栏 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dashboard-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(45deg, #64b5f6, #42a5f5, #2196f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.current-time {
  font-size: 18px;
  font-weight: bold;
  color: #64b5f6;
}

.user-info {
  font-size: 14px;
  color: #b0bec5;
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
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.warning-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 20px;
}

.permission-message h2 {
  font-size: 24px;
  margin: 0 0 15px 0;
  color: #ff9800;
}

.permission-message p {
  font-size: 16px;
  color: #b0bec5;
  margin: 0;
}

/* 主要内容区域 */
.dashboard-content {
  padding: 15px 20px;
  height: calc(100vh - 100px);
  overflow: hidden;
}

/* 紧凑型网格布局 */
.compact-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  height: 100%;
}

/* 左侧面板 */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
}

/* 紧凑卡片样式 */
.compact-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header.collapsible {
  cursor: pointer;
  transition: background 0.3s;
}

.card-header.collapsible:hover {
  background: rgba(255, 255, 255, 0.05);
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-icon {
  transition: transform 0.3s;
  font-size: 12px;
  color: #b0bec5;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.card-content {
  padding: 15px 20px;
}

/* 指标设置紧凑布局 */
.targets-mini-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 15px;
}

.target-mini-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.target-mini-label {
  font-size: 14px;
  color: #b0bec5;
}

.target-mini-value {
  font-size: 16px;
  font-weight: bold;
  color: #4caf50;
}

.target-mini-input {
  width: 80px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 4px 8px;
  color: #ffffff;
  font-size: 14px;
}

.target-mini-input:focus {
  outline: none;
  border-color: #2196f3;
}

.targets-actions {
  display: flex;
  gap: 8px;
}

.btn-mini {
  padding: 6px 12px;
  font-size: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-mini:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn-mini.primary {
  background: #2196f3;
  border-color: #2196f3;
}

.btn-mini.primary:hover:not(:disabled) {
  background: #1976d2;
}

.btn-mini:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 概览统计 */
.overview-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.stat-mini {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.stat-mini-value {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 4px;
}

.stat-mini-label {
  font-size: 12px;
  color: #b0bec5;
}

/* 快速操作 */
.action-btn {
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 右侧主要内容区域 */
.main-content-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 标签页导航 */
.tab-navigation {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 15px;
}

.tab-item {
  flex: 1;
  padding: 12px 20px;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
  color: #b0bec5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.tab-item.active {
  background: #2196f3;
  color: #ffffff;
}

/* 标签页内容 */
.tab-content {
  flex: 1;
  overflow: hidden;
}

.tab-panel {
  height: 100%;
  overflow-y: auto;
}

/* 错误提示 toast */
.error-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  background: rgba(244, 67, 54, 0.9);
  backdrop-filter: blur(10px);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.error-toast.show {
  transform: translateX(0);
}

.error-toast .error-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.error-toast .close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .compact-grid {
    grid-template-columns: 250px 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
    padding: 15px 20px;
  }

  .dashboard-title {
    font-size: 24px;
  }

  .header-info {
    align-items: center;
  }

  .dashboard-content {
    padding: 10px 15px;
    height: calc(100vh - 120px);
  }

  .compact-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: 15px;
  }

  .left-panel {
    order: 2;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: visible;
    gap: 10px;
  }

  .left-panel > div {
    min-width: 200px;
    flex-shrink: 0;
  }

  .main-content-area {
    order: 1;
  }

  .error-toast {
    top: 100px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
