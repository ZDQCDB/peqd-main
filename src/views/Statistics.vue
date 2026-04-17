<template>
  <div class="statistics-dashboard">
    <!-- 顶部栏 -->
    <header class="dashboard-header">
      <div class="header-left">
        <button class="back-btn" @click="$router.push('/dashboard')">
          <svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <h1 class="dashboard-title">PE校园统计大屏</h1>
      </div>
      <div class="header-right">
        <span class="header-time">{{ currentTime }}</span>
        <span class="header-divider">|</span>
        <span class="header-user">{{ userInfo.name || '管理员' }}</span>
        <span class="header-role">{{ userRoleText }}</span>
      </div>
    </header>

    <!-- 权限提示 -->
    <div v-if="!hasPermission" class="permission-denied">
      <div class="permission-box">
        <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#faad14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="12" y1="9" x2="12" y2="13" stroke="#faad14" stroke-width="2" stroke-linecap="round"/>
          <line x1="12" y1="17" x2="12.01" y2="17" stroke="#faad14" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <h2>访问受限</h2>
        <p>只有校级管理员和院级管理员才能访问统计功能</p>
      </div>
    </div>

    <!-- 统计主体 -->
    <div v-else class="dashboard-body">
      <!-- 概览指标行 -->
      <div class="overview-row">
        <div class="metric-card">
          <div class="metric-icon blue">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ getOverviewData().school }}</div>
            <div class="metric-label">学校</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon green">
            <svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.5"/></svg>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ getOverviewData().totalStudents }}</div>
            <div class="metric-label">学生总数</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon orange">
            <svg viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ getOverviewData().avgCompliance }}%</div>
            <div class="metric-label">平均达标率</div>
          </div>
        </div>
        <!-- 刷新按钮 -->
        <button class="refresh-btn" @click="refreshAllData" :disabled="anyLoading">
          <svg viewBox="0 0 24 24" fill="none" :class="{ spinning: anyLoading }"><path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          {{ anyLoading ? '刷新中...' : '刷新' }}
        </button>
      </div>

      <!-- PE积分指标 (仅校级管理员) -->
      <div v-if="isSchoolAdmin" class="targets-row">
        <div class="targets-card">
          <div class="targets-header" @click="targetsCollapsed = !targetsCollapsed">
            <h3>PE积分指标</h3>
            <div class="targets-header-right">
              <div v-if="!targetsCollapsed && !editingTargets" class="target-preview">
                <span v-for="t in targetItems" :key="t.key" class="target-badge">
                  {{ t.label }}: <strong>{{ targets?.[t.key] || '--' }}</strong>分
                </span>
              </div>
              <svg class="collapse-icon" :class="{ rotated: !targetsCollapsed }" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
          <div v-show="!targetsCollapsed" class="targets-body">
            <div class="targets-grid">
              <div v-for="t in targetItems" :key="t.key" class="target-item">
                <span class="target-label">{{ t.label }}</span>
                <span v-if="!editingTargets" class="target-value">{{ targets?.[t.key] || '--' }} 分</span>
                <input v-else v-model.number="editTargets[t.key]" type="number" min="1" class="target-input" />
              </div>
            </div>
            <div class="targets-actions">
              <button @click="toggleEditTargets" class="btn-sm" :disabled="targetsLoading">
                {{ editingTargets ? '取消' : '编辑指标' }}
              </button>
              <button v-if="editingTargets" @click="saveTargets" class="btn-sm primary" :disabled="targetsLoading">
                {{ targetsLoading ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tab-bar">
        <div
          v-if="isSchoolAdmin"
          class="tab-item"
          :class="{ active: activeTab === 'school' }"
          @click="activeTab = 'school'"
        >学校统计</div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'college' }"
          @click="activeTab = 'college'"
        >{{ isSchoolAdmin ? '院系统计' : '本院统计' }}</div>
      </div>

      <!-- 统计内容 -->
      <div class="tab-content">
        <div v-if="activeTab === 'school' && isSchoolAdmin" class="tab-panel">
          <CompactSchoolStats
            :data="schoolStats"
            :loading="schoolStatsLoading"
            :compact-mode="isCompactMode"
            @refresh="fetchSchoolStatistics"
          />
        </div>
        <div v-if="activeTab === 'college'" class="tab-panel">
          <CompactCollegeStats
            :data="collegeStats"
            :loading="collegeStatsLoading"
            :compact-mode="isCompactMode"
            @refresh="fetchCollegeStatistics"
          />
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-toast" :class="{ show: !!error }">
        <span class="error-icon">!</span>
        <span>{{ error }}</span>
        <button @click="error = ''" class="close-btn">&times;</button>
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
    const currentTime = ref('')
    const userInfo = ref({})
    const targets = ref(null)
    const schoolStats = ref(null)
    const collegeStats = ref(null)
    const error = ref('')
    
    const targetsLoading = ref(false)
    const schoolStatsLoading = ref(false)
    const collegeStatsLoading = ref(false)
    
    const activeTab = ref('college')
    const isCompactMode = ref(true)
    const targetsCollapsed = ref(true)
    const editingTargets = ref(false)
    const editTargets = ref({
      weeklyTarget: 0,
      monthlyTarget: 0,
      totalTarget: 0
    })
    
    const targetItems = [
      { key: 'weeklyTarget', label: '周指标' },
      { key: 'monthlyTarget', label: '月指标' },
      { key: 'totalTarget', label: '总指标' }
    ]

    const hasPermission = computed(() => isSchoolAdmin() || isDepartmentAdmin())
    const userRoleText = computed(() => {
      if (isSchoolAdmin()) return '校级管理员'
      if (isDepartmentAdmin()) return '院级管理员'
      return '未知角色'
    })
    
    const anyLoading = computed(() => 
      targetsLoading.value || schoolStatsLoading.value || collegeStatsLoading.value
    )
    
    if (isSchoolAdmin()) {
      activeTab.value = 'school'
    }

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

    const fetchUserInfo = async () => {
      try {
        userInfo.value = await authService.getCurrentUser() || {}
      } catch (err) {
        console.error('获取用户信息失败:', err)
      }
    }

    const fetchSchoolStatistics = async () => {
      if (!isSchoolAdmin()) return
      
      schoolStatsLoading.value = true
      try {
        const response = await api.peStatistics.getSchoolStatistics()
        if (response && response.code !== undefined && response.code !== 200) {
          error.value = response.message || '获取学校统计数据失败'
          schoolStats.value = null
        } else if (response && response.data) {
          error.value = ''
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

    const fetchCollegeStatistics = async () => {
      collegeStatsLoading.value = true
      try {
        const response = await api.peStatistics.getCollegeStatistics()
        if (response && response.code !== undefined && response.code !== 200) {
          error.value = response.message || '获取院系统计失败'
          collegeStats.value = null
        } else if (response && response.data) {
          error.value = ''
          collegeStats.value = response.data
        } else if (response && (response.collegeStats || response.classStats)) {
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

    const toggleEditTargets = () => {
      if (editingTargets.value) {
        if (targets.value) {
          editTargets.value = { ...targets.value }
        }
        editingTargets.value = false
      } else {
        if (targets.value) {
          editTargets.value = { ...targets.value }
        } else {
          editTargets.value = { weeklyTarget: 10, monthlyTarget: 40, totalTarget: 100 }
        }
        editingTargets.value = true
      }
    }
    
    const saveTargets = async () => {
      targetsLoading.value = true
      try {
        await api.peStatistics.setTargets(editTargets.value)
        targets.value = { ...editTargets.value }
        editingTargets.value = false
        
        if (isSchoolAdmin()) await fetchSchoolStatistics()
        await fetchCollegeStatistics()
        
        error.value = ''
      } catch (err) {
        error.value = err.message || '设置指标失败'
      } finally {
        targetsLoading.value = false
      }
    }
    
    const refreshAllData = async () => {
      await Promise.all([
        isSchoolAdmin() ? fetchSchoolStatistics() : Promise.resolve(),
        fetchCollegeStatistics()
      ])
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

    const retryLoad = async () => {
      error.value = ''
      await Promise.all([
        fetchUserInfo(),
        isSchoolAdmin() ? fetchSchoolStatistics() : Promise.resolve(),
        fetchCollegeStatistics()
      ])
    }

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

    onMounted(() => { initialize() })

    onUnmounted(() => {
      if (timeInterval) clearInterval(timeInterval)
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
      toggleEditTargets,
      saveTargets,
      refreshAllData,
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
  background: #f5f5f5;
  color: #000000d9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部栏 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  height: 52px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  color: #595959;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover { border-color: #1677ff; color: #1677ff; }
.back-btn svg { width: 16px; height: 16px; }

.dashboard-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #000000d9;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.header-time { color: #1677ff; font-weight: 500; font-variant-numeric: tabular-nums; }
.header-divider { color: #d9d9d9; }
.header-user { color: #434343; font-weight: 500; }

.header-role {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #e6f4ff;
  color: #1677ff;
  font-weight: 500;
}

/* 权限提示 */
.permission-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}

.permission-box {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  max-width: 360px;
}

.permission-box svg { display: block; margin: 0 auto 16px; }
.permission-box h2 { font-size: 18px; margin: 0 0 8px 0; color: #000000d9; font-weight: 500; }
.permission-box p { font-size: 14px; color: #00000073; margin: 0; }

/* 主体 */
.dashboard-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px 40px;
}

/* 概览指标行 */
.overview-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: stretch;
}

.metric-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.metric-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon svg { width: 20px; height: 20px; }

.metric-icon.blue { background: #e6f4ff; color: #1677ff; }
.metric-icon.green { background: #f6ffed; color: #52c41a; }
.metric-icon.orange { background: #fff7e6; color: #fa8c16; }

.metric-value { font-size: 22px; font-weight: 700; color: #000000d9; line-height: 1.2; }
.metric-label { font-size: 12px; color: #00000073; margin-top: 2px; font-weight: 500; }

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  color: #434343;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
}

.refresh-btn:hover:not(:disabled) { border-color: #1677ff; color: #1677ff; }
.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.refresh-btn svg { width: 16px; height: 16px; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spinning { animation: spin 1s linear infinite; }

/* 指标行 */
.targets-row { margin-bottom: 16px; }

.targets-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.targets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}

.targets-header:hover { background: #fafafa; }

.targets-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #000000d9;
}

.targets-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.target-preview {
  display: flex;
  gap: 12px;
}

.target-badge {
  font-size: 12px;
  color: #595959;
  padding: 3px 10px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.target-badge strong { color: #52c41a; font-weight: 600; }

.collapse-icon {
  width: 16px;
  height: 16px;
  color: #bfbfbf;
  transition: transform 0.2s;
}

.collapse-icon.rotated { transform: rotate(180deg); }

.targets-body {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.targets-grid {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.target-item {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.target-label { font-size: 13px; color: #595959; }
.target-value { font-size: 15px; font-weight: 600; color: #52c41a; }

.target-input {
  width: 80px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  color: #000000d9;
  outline: none;
  text-align: right;
  font-family: inherit;
}

.target-input:focus { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2); }

.targets-actions { display: flex; gap: 8px; }

.btn-sm {
  padding: 5px 14px;
  font-size: 13px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  background: #ffffff;
  color: #434343;
  font-family: inherit;
}

.btn-sm:hover:not(:disabled) { border-color: #1677ff; color: #1677ff; }
.btn-sm.primary { background: #1677ff; border-color: #1677ff; color: #ffffff; }
.btn-sm.primary:hover:not(:disabled) { background: #4096ff; border-color: #4096ff; }
.btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }

/* 标签页 */
.tab-bar {
  display: flex;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  padding: 4px;
  margin-bottom: 16px;
  gap: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.tab-item {
  flex: 1;
  padding: 8px 16px;
  text-align: center;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s;
  color: #595959;
  font-weight: 500;
  font-size: 14px;
  user-select: none;
}

.tab-item:hover { background: #f5f5f5; color: #262626; }

.tab-item.active {
  background: #1677ff;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(22, 119, 255, 0.3);
}

/* 标签页内容 */
.tab-content {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  padding: 20px;
  min-height: 400px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.tab-panel { height: 100%; }

/* 错误提示 */
.error-toast {
  position: fixed;
  top: 68px;
  right: 20px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #cf1322;
  padding: 10px 14px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transform: translateX(120%);
  transition: transform 0.2s ease;
  z-index: 1000;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 13px;
}

.error-toast.show { transform: translateX(0); }

.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #ff4d4f;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #cf1322;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  line-height: 1;
  opacity: 0.6;
}

.close-btn:hover { opacity: 1; }

/* 响应式 */
@media (max-width: 768px) {
  .dashboard-header { padding: 0 16px; }
  .header-time, .header-divider { display: none; }
  .dashboard-body { padding: 12px 16px 32px; }
  .overview-row { flex-direction: column; }
  .metric-card { padding: 12px 16px; }
  .targets-grid { flex-direction: column; }
  .target-preview { display: none; }
  .tab-content { padding: 14px; }
  .error-toast { right: 10px; left: 10px; max-width: none; }
}
</style>
