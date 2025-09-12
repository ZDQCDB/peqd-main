<template>
  <div class="compact-school-stats">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载统计数据...</p>
    </div>

    <div v-else-if="!data" class="no-data">
      <i class="no-data-icon">📊</i>
      <p>暂无统计数据</p>
    </div>

    <div v-else class="stats-container">
      <!-- 整体达标率卡片 -->
      <div class="stats-card compliance-overview">
        <div class="card-header">
          <h3>整体达标率</h3>
          <button @click="$emit('refresh')" class="refresh-btn-mini" :disabled="loading">🔄</button>
        </div>
        <div class="card-content">
          <div class="compliance-grid-compact">
            <div class="compliance-item weekly">
              <div class="compliance-icon">📅</div>
              <div class="compliance-info">
                <div class="compliance-label">周达标率</div>
                <div class="compliance-value">{{ formatRate(data.overallCompliance?.weeklyComplianceRate) }}%</div>
                <div class="compliance-bar">
                  <div class="compliance-progress" :style="{ width: `${data.overallCompliance?.weeklyComplianceRate || 0}%` }"></div>
                </div>
              </div>
            </div>

            <div class="compliance-item monthly">
              <div class="compliance-icon">📊</div>
              <div class="compliance-info">
                <div class="compliance-label">月达标率</div>
                <div class="compliance-value">{{ formatRate(data.overallCompliance?.monthlyComplianceRate) }}%</div>
                <div class="compliance-bar">
                  <div class="compliance-progress" :style="{ width: `${data.overallCompliance?.monthlyComplianceRate || 0}%` }"></div>
                </div>
              </div>
            </div>

            <div class="compliance-item total">
              <div class="compliance-icon">🏆</div>
              <div class="compliance-info">
                <div class="compliance-label">总达标率</div>
                <div class="compliance-value">{{ formatRate(data.overallCompliance?.totalComplianceRate) }}%</div>
                <div class="compliance-bar">
                  <div class="compliance-progress" :style="{ width: `${data.overallCompliance?.totalComplianceRate || 0}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 院系排名 -->
      <div class="stats-card rankings">
        <div class="card-header">
          <h3>院系排名</h3>
          <div class="view-toggle">
            <button 
              @click="viewMode = 'table'" 
              :class="{ active: viewMode === 'table' }"
              class="toggle-btn"
            >📋</button>
            <button 
              @click="viewMode = 'chart'" 
              :class="{ active: viewMode === 'chart' }"
              class="toggle-btn"
            >📊</button>
          </div>
        </div>
        <div class="card-content">
          <!-- 表格视图 -->
          <div v-if="viewMode === 'table'" class="rankings-table-compact">
            <div class="table-header-compact">
              <div class="col-rank">排名</div>
              <div class="col-name">院系</div>
              <div class="col-rate">达标率</div>
              <div class="col-students">学生数</div>
            </div>
            <div class="table-body-compact">
              <div 
                v-for="college in data.collegeRankings?.slice(0, localCompactMode ? 5 : 10)" 
                :key="college.rank"
                class="table-row-compact"
                :class="{ 'top-rank': college.rank <= 3 }"
              >
                <div class="col-rank">
                  <span class="rank-badge-mini" :class="`rank-${college.rank}`">
                    {{ getRankIcon(college.rank) }}{{ college.rank }}
                  </span>
                </div>
                <div class="col-name">{{ college.collegeName }}</div>
                <div class="col-rate">
                  <span class="rate-value-mini">{{ formatRate(college.overallComplianceRate) }}%</span>
                </div>
                <div class="col-students">{{ getCollegeStudentCount(college.collegeName) }}人</div>
              </div>
            </div>
          </div>

          <!-- 图表视图 -->
          <div v-else class="rankings-chart">
            <div class="chart-bars">
              <div 
                v-for="college in data.collegeRankings?.slice(0, 8)" 
                :key="college.rank"
                class="chart-bar"
              >
                <div class="bar-container">
                  <div 
                    class="bar-fill" 
                    :style="{ 
                      height: `${college.overallComplianceRate || 0}%`,
                      background: getBarColor(college.rank)
                    }"
                  ></div>
                </div>
                <div class="bar-label">
                  <div class="bar-name">{{ college.collegeName }}</div>
                  <div class="bar-value">{{ formatRate(college.overallComplianceRate) }}%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 展开/收起按钮 -->
          <div v-if="data.collegeRankings?.length > 5" class="expand-toggle">
            <button @click="localCompactMode = !localCompactMode" class="expand-btn">
              {{ localCompactMode ? `展开全部 (${data.collegeRankings.length})` : '收起' }}
              <i class="expand-icon" :class="{ rotated: !localCompactMode }">▼</i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'CompactSchoolStats',
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
    const viewMode = ref('table') // 'table' 或 'chart'
    const localCompactMode = ref(props.compactMode)
    
    // 监听props变化
    watch(() => props.compactMode, (newValue) => {
      localCompactMode.value = newValue
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

    // 获取院系学生数
    const getCollegeStudentCount = (collegeName) => {
      const college = props.data?.collegeStats?.find(c => c.collegeName === collegeName)
      return college?.studentCount || 0
    }

    // 获取柱状图颜色
    const getBarColor = (rank) => {
      if (rank <= 3) {
        return 'linear-gradient(135deg, #4caf50, #81c784)'
      } else if (rank <= 6) {
        return 'linear-gradient(135deg, #2196f3, #64b5f6)'
      } else {
        return 'linear-gradient(135deg, #ff9800, #ffb74d)'
      }
    }

    return {
      viewMode,
      localCompactMode,
      formatRate,
      getRankIcon,
      getCollegeStudentCount,
      getBarColor
    }
  }
}
</script>

<style scoped>
.compact-school-stats {
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

.refresh-btn-mini:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-content {
  padding: 20px;
}

/* 整体达标率 */
.compliance-grid-compact {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.compliance-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.compliance-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.compliance-info {
  flex: 1;
}

.compliance-label {
  font-size: 12px;
  color: #b0bec5;
  margin-bottom: 4px;
}

.compliance-value {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
}

.compliance-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.compliance-progress {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #81c784);
  border-radius: 3px;
  transition: width 0.5s ease;
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

/* 表格视图 */
.rankings-table-compact {
  overflow-x: auto;
}

.table-header-compact {
  display: grid;
  grid-template-columns: 60px 1fr 80px 80px;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  color: #b0bec5;
  font-weight: bold;
}

.table-row-compact {
  display: grid;
  grid-template-columns: 60px 1fr 80px 80px;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.3s;
}

.table-row-compact:hover {
  background: rgba(255, 255, 255, 0.03);
}

.table-row-compact.top-rank {
  background: rgba(255, 193, 7, 0.1);
}

.rank-badge-mini {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.rank-badge-mini.rank-1 {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #333;
}

.rank-badge-mini.rank-2 {
  background: linear-gradient(45deg, #c0c0c0, #e8e8e8);
  color: #333;
}

.rank-badge-mini.rank-3 {
  background: linear-gradient(45deg, #cd7f32, #daa520);
  color: #fff;
}

.col-name {
  color: #ffffff;
  font-weight: 500;
  font-size: 14px;
}

.col-students {
  color: #b0bec5;
  font-size: 13px;
}

.rate-value-mini {
  font-weight: bold;
  color: #4caf50;
  font-size: 14px;
}

/* 图表视图 */
.rankings-chart {
  height: 300px;
}

.chart-bars {
  display: flex;
  align-items: end;
  height: 250px;
  gap: 8px;
  padding: 20px 0;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: end;
  position: relative;
}

.bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.8s ease;
  min-height: 2px;
}

.bar-label {
  margin-top: 8px;
  text-align: center;
  font-size: 11px;
}

.bar-name {
  color: #b0bec5;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-value {
  color: #ffffff;
  font-weight: bold;
}

/* 展开/收起 */
.expand-toggle {
  margin-top: 15px;
  text-align: center;
}

.expand-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #b0bec5;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin: 0 auto;
}

.expand-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.expand-icon {
  transition: transform 0.3s;
  font-size: 10px;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .compliance-grid-compact {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .table-header-compact,
  .table-row-compact {
    grid-template-columns: 50px 1fr 60px 60px;
    gap: 8px;
  }

  .chart-bars {
    gap: 4px;
  }

  .bar-label {
    font-size: 10px;
  }
}
</style>
