<template>
  <div class="compact-college-stats">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载统计数据...</p>
    </div>

    <div v-else-if="!data" class="no-data">
      <i class="no-data-icon">📊</i>
      <p>暂无统计数据</p>
    </div>

    <div v-else class="stats-container">
      <!-- 院系信息概览 -->
      <div class="stats-card overview">
        <div class="card-header">
          <h3>{{ data.college || '院系信息' }}</h3>
          <button @click="$emit('refresh')" class="refresh-btn-mini" :disabled="loading">🔄</button>
        </div>
        <div class="card-content">
          <div class="overview-grid">
            <div class="overview-item">
              <div class="overview-icon">🏛️</div>
              <div class="overview-info">
                <div class="overview-value">{{ data.college }}</div>
                <div class="overview-label">当前院系</div>
              </div>
            </div>
            <div class="overview-item">
              <div class="overview-icon">👥</div>
              <div class="overview-info">
                <div class="overview-value">{{ data.totalStudents }}人</div>
                <div class="overview-label">学生总数</div>
              </div>
            </div>
            <div class="overview-item">
              <div class="overview-icon">📈</div>
              <div class="overview-info">
                <div class="overview-value">{{ getAverageCompliance() }}%</div>
                <div class="overview-label">平均达标率</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 达标率概览 -->
      <div class="stats-card compliance">
        <div class="card-header">
          <h3>达标率概览</h3>
          <div class="view-toggle">
            <button 
              @click="complianceView = 'bars'" 
              :class="{ active: complianceView === 'bars' }"
              class="toggle-btn"
            >📊</button>
            <button 
              @click="complianceView = 'circles'" 
              :class="{ active: complianceView === 'circles' }"
              class="toggle-btn"
            >⭕</button>
          </div>
        </div>
        <div class="card-content">
          <!-- 柱状图视图 -->
          <div v-if="complianceView === 'bars'" class="compliance-bars">
            <div class="compliance-bar-item" v-for="item in complianceItems" :key="item.key">
              <div class="bar-header">
                <span class="bar-label">{{ item.label }}</span>
                <span class="bar-value">{{ formatRate(getComplianceRate(item.key)) }}%</span>
              </div>
              <div class="bar-container">
                <div 
                  class="bar-fill" 
                  :style="{ 
                    width: `${getComplianceRate(item.key) || 0}%`,
                    background: item.color
                  }"
                ></div>
              </div>
            </div>
          </div>

          <!-- 圆形进度图视图 -->
          <div v-else class="compliance-circles">
            <div class="circle-item" v-for="item in complianceItems" :key="item.key">
              <div class="circle-progress">
                <svg viewBox="0 0 100 100" class="circle-svg">
                  <circle cx="50" cy="50" r="45" class="circle-bg"/>
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    class="circle-fill"
                    :style="{ 
                      strokeDasharray: `${2 * Math.PI * 45}`,
                      strokeDashoffset: `${2 * Math.PI * 45 * (1 - (getComplianceRate(item.key) || 0) / 100)}`,
                      stroke: item.color
                    }"
                  />
                </svg>
                <div class="circle-text">
                  <div class="circle-value">{{ formatRate(getComplianceRate(item.key)) }}%</div>
                  <div class="circle-label">{{ item.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 排名数据 -->
      <div class="stats-card rankings">
        <div class="card-header">
          <h3>{{ rankingsTitle }}</h3>
          <div class="ranking-controls">
            <select v-model="sortBy" class="sort-select">
              <option value="overall">综合排名</option>
              <option value="weekly">周达标率</option>
              <option value="monthly">月达标率</option>
              <option value="total">总达标率</option>
            </select>
          </div>
        </div>
        <div class="card-content">
          <!-- 前三名展示 -->
          <div v-if="topThreeItems.length > 0" class="podium">
            <div 
              v-for="item in topThreeItems" 
              :key="item.rank"
              class="podium-item"
              :class="`rank-${item.rank}`"
            >
              <div class="podium-medal">{{ getRankIcon(item.rank) }}</div>
              <div class="podium-info">
                <div class="podium-name">{{ getItemName(item) }}</div>
                <div class="podium-rate">{{ formatRate(getSortValue(item)) }}%</div>
              </div>
            </div>
          </div>

          <!-- 完整排名列表 -->
          <div class="rankings-list">
            <div class="list-header">
              <div class="col-rank">排名</div>
              <div class="col-name">名称</div>
              <div class="col-students">学生数</div>
              <div class="col-rate">{{ getSortLabel() }}</div>
            </div>
            <div class="list-body">
              <div 
                v-for="(item, index) in sortedRankings" 
                :key="index"
                class="list-row"
                :class="{ 
                  'top-rank': item.rank <= 3,
                  'low-performance': getSortValue(item) < 60
                }"
              >
                <div class="col-rank">
                  <span class="rank-number">{{ item.rank }}</span>
                </div>
                <div class="col-name">
                  <span class="item-name">{{ getItemName(item) }}</span>
                </div>
                <div class="col-students">{{ getItemStudentCount(item) }}人</div>
                <div class="col-rate">
                  <span class="rate-value" :class="getRateClass(getSortValue(item))">
                    {{ formatRate(getSortValue(item)) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页控制 -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="page-btn"
            >‹</button>
            <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
            <button 
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="page-btn"
            >›</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { isSchoolAdmin } from '@/utils/permissionManager'

export default {
  name: 'CompactCollegeStats',
  props: {
    data: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    compactMode: {
      type: Boolean,
      default: true
    }
  },
  emits: ['refresh'],
  setup(props) {
    const complianceView = ref('bars')
    const sortBy = ref('overall')
    const currentPage = ref(1)
    const itemsPerPage = 10

    // 判断是否为校级管理员视图
    const isSchoolAdminView = computed(() => {
      return props.data?.collegeRankings && !props.data?.classRankings
    })

    // 获取排名数据
    const rankingsData = computed(() => {
      if (isSchoolAdminView.value) {
        return props.data?.collegeRankings || []
      } else {
        return props.data?.classRankings || []
      }
    })

    // 获取统计数据
    const statsData = computed(() => {
      if (isSchoolAdminView.value) {
        return props.data?.collegeStats || []
      } else {
        return props.data?.classStats || []
      }
    })

    // 排名标题
    const rankingsTitle = computed(() => {
      return isSchoolAdminView.value ? '院系排名' : '班级排名'
    })

    // 前三名数据
    const topThreeItems = computed(() => {
      return rankingsData.value.filter(item => item.rank <= 3)
    })

    // 达标率配置
    const complianceItems = [
      { key: 'weekly', label: '周达标率', color: '#2196f3' },
      { key: 'monthly', label: '月达标率', color: '#4caf50' },
      { key: 'total', label: '总达标率', color: '#ff9800' }
    ]

    // 排序后的排名数据
    const sortedRankings = computed(() => {
      let sorted = [...rankingsData.value]
      
      if (sortBy.value !== 'overall') {
        sorted.sort((a, b) => {
          const aValue = getSortValue(a)
          const bValue = getSortValue(b)
          return bValue - aValue
        })
        
        // 重新分配排名
        sorted = sorted.map((item, index) => ({
          ...item,
          rank: index + 1
        }))
      }

      // 分页
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return sorted.slice(start, end)
    })

    // 总页数
    const totalPages = computed(() => {
      return Math.ceil(rankingsData.value.length / itemsPerPage)
    })

    // 监听排序变化，重置页码
    watch(sortBy, () => {
      currentPage.value = 1
    })

    // 格式化百分比
    const formatRate = (rate) => {
      if (rate === null || rate === undefined) return '--'
      return Number(rate).toFixed(1)
    }

    // 获取排名图标
    const getRankIcon = (rank) => {
      switch (rank) {
        case 1: return '🥇'
        case 2: return '🥈'
        case 3: return '🥉'
        default: return ''
      }
    }

    // 获取项目名称
    const getItemName = (itemData) => {
      return itemData.collegeName || itemData.className || '未知'
    }

    // 获取项目学生数
    const getItemStudentCount = (itemData) => {
      if (isSchoolAdminView.value) {
        const collegeData = statsData.value.find(c => c.collegeName === itemData.collegeName)
        return collegeData?.studentCount || 0
      } else {
        const classData = statsData.value.find(c => c.className === itemData.className)
        return classData?.studentCount || 0
      }
    }

    // 获取达标率
    const getComplianceRate = (key) => {
      const compliance = props.data?.overallCompliance
      if (!compliance) return 0
      
      switch (key) {
        case 'weekly': return compliance.weeklyComplianceRate
        case 'monthly': return compliance.monthlyComplianceRate
        case 'total': return compliance.totalComplianceRate
        default: return 0
      }
    }

    // 获取平均达标率
    const getAverageCompliance = () => {
      const compliance = props.data?.overallCompliance
      if (!compliance) return '--'
      
      const avg = (
        (compliance.weeklyComplianceRate || 0) +
        (compliance.monthlyComplianceRate || 0) +
        (compliance.totalComplianceRate || 0)
      ) / 3
      
      return avg.toFixed(1)
    }

    // 获取排序值
    const getSortValue = (item) => {
      switch (sortBy.value) {
        case 'weekly': return item.complianceRates?.weeklyComplianceRate || 0
        case 'monthly': return item.complianceRates?.monthlyComplianceRate || 0
        case 'total': return item.complianceRates?.totalComplianceRate || 0
        default: return item.overallComplianceRate || 0
      }
    }

    // 获取排序标签
    const getSortLabel = () => {
      switch (sortBy.value) {
        case 'weekly': return '周达标率'
        case 'monthly': return '月达标率'
        case 'total': return '总达标率'
        default: return '综合达标率'
      }
    }

    // 获取达标率等级样式
    const getRateClass = (rate) => {
      if (rate >= 90) return 'excellent'
      if (rate >= 80) return 'good'
      if (rate >= 70) return 'pass'
      if (rate >= 60) return 'low'
      return 'poor'
    }

    return {
      complianceView,
      sortBy,
      currentPage,
      isSchoolAdminView,
      rankingsData,
      statsData,
      rankingsTitle,
      topThreeItems,
      complianceItems,
      sortedRankings,
      totalPages,
      formatRate,
      getRankIcon,
      getItemName,
      getItemStudentCount,
      getComplianceRate,
      getAverageCompliance,
      getSortValue,
      getSortLabel,
      getRateClass
    }
  }
}
</script>

<style scoped>
.compact-college-stats {
  height: 100%;
  overflow-y: auto;
}

.loading-state, .no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #b0bec5;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-left-color: #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.no-data-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px 0;
}

.stats-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #ffffff;
}

.refresh-btn-mini {
  background: none;
  border: none;
  color: #b0bec5;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.refresh-btn-mini:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.card-content {
  padding: 20px;
}

/* 概览信息 */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.overview-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.overview-value {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 4px;
}

.overview-label {
  font-size: 12px;
  color: #b0bec5;
}

/* 视图切换 */
.view-toggle {
  display: flex;
  gap: 4px;
}

.toggle-btn {
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #b0bec5;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.toggle-btn.active {
  background: #2196f3;
  color: #ffffff;
  border-color: #2196f3;
}

/* 柱状图达标率 */
.compliance-bars {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.compliance-bar-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bar-label {
  font-size: 14px;
  color: #b0bec5;
}

.bar-value {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
}

.bar-container {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* 圆形进度达标率 */
.compliance-circles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  justify-items: center;
}

.circle-item {
  position: relative;
}

.circle-progress {
  position: relative;
  width: 100px;
  height: 100px;
}

.circle-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 6;
}

.circle-fill {
  fill: none;
  stroke-width: 6;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.circle-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.circle-value {
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
}

.circle-label {
  font-size: 11px;
  color: #b0bec5;
  margin-top: 2px;
}

/* 排名控制 */
.ranking-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ffffff;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: #2196f3;
}

/* 前三名展示 */
.podium {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.podium-medal {
  font-size: 32px;
  margin-bottom: 8px;
}

.podium-name {
  font-size: 14px;
  color: #ffffff;
  font-weight: bold;
  text-align: center;
  margin-bottom: 4px;
}

.podium-rate {
  font-size: 16px;
  color: #4caf50;
  font-weight: bold;
}

/* 排名列表 */
.rankings-list {
  overflow-x: auto;
}

.list-header {
  display: grid;
  grid-template-columns: 60px 1fr 80px 100px;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  color: #b0bec5;
  font-weight: bold;
}

.list-row {
  display: grid;
  grid-template-columns: 60px 1fr 80px 100px;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.3s;
}

.list-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.list-row.top-rank {
  background: rgba(255, 193, 7, 0.1);
}

.list-row.low-performance {
  background: rgba(244, 67, 54, 0.1);
}

.rank-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
}

.item-name {
  color: #ffffff;
  font-weight: 500;
  font-size: 14px;
}

.rate-value {
  font-weight: bold;
  font-size: 14px;
}

.rate-value.excellent { color: #4caf50; }
.rate-value.good { color: #8bc34a; }
.rate-value.pass { color: #ffeb3b; }
.rate-value.low { color: #ff9800; }
.rate-value.poor { color: #f44336; }

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.page-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ffffff;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #b0bec5;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .compliance-circles {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 15px;
  }

  .podium {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .list-header,
  .list-row {
    grid-template-columns: 50px 1fr 60px 80px;
    gap: 8px;
  }

  .circle-progress {
    width: 80px;
    height: 80px;
  }

  .circle-value {
    font-size: 14px;
  }
}
</style>
