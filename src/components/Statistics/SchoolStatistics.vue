<template>
  <div class="school-statistics">
    <div class="panel-header">
      <h2 class="panel-title">
        <i class="icon">🏫</i>
        全校统计数据
      </h2>
      <div class="panel-actions">
        <button @click="$emit('refresh')" class="refresh-btn" :disabled="loading">
          <i class="refresh-icon">🔄</i>
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载统计数据...</p>
    </div>

    <div v-else-if="!data" class="no-data">
      <i class="no-data-icon">📊</i>
      <p>暂无统计数据</p>
    </div>

    <div v-else class="panel-content">
      <!-- 学校概览 -->
      <div class="school-overview">
        <div class="overview-card">
          <div class="overview-icon">🏛️</div>
          <div class="overview-info">
            <h3>{{ data.school }}</h3>
            <p>学生总数: {{ data.totalStudents }}人</p>
          </div>
        </div>
      </div>

      <!-- 整体达标率 -->
      <div class="compliance-overview">
        <h3 class="section-title">整体达标率</h3>
        <div class="compliance-grid">
          <div class="compliance-card weekly">
            <div class="compliance-header">
              <span class="compliance-label">周达标率</span>
              <span class="compliance-target">目标: {{ data.targets?.weeklyTarget || '--' }}分</span>
            </div>
            <div class="compliance-value">
              {{ formatRate(data.overallCompliance?.weeklyComplianceRate) }}%
            </div>
            <div class="compliance-bar">
              <div 
                class="compliance-progress weekly" 
                :style="{ width: `${data.overallCompliance?.weeklyComplianceRate || 0}%` }"
              ></div>
            </div>
          </div>

          <div class="compliance-card monthly">
            <div class="compliance-header">
              <span class="compliance-label">月达标率</span>
              <span class="compliance-target">目标: {{ data.targets?.monthlyTarget || '--' }}分</span>
            </div>
            <div class="compliance-value">
              {{ formatRate(data.overallCompliance?.monthlyComplianceRate) }}%
            </div>
            <div class="compliance-bar">
              <div 
                class="compliance-progress monthly" 
                :style="{ width: `${data.overallCompliance?.monthlyComplianceRate || 0}%` }"
              ></div>
            </div>
          </div>

          <div class="compliance-card total">
            <div class="compliance-header">
              <span class="compliance-label">总达标率</span>
              <span class="compliance-target">目标: {{ data.targets?.totalTarget || '--' }}分</span>
            </div>
            <div class="compliance-value">
              {{ formatRate(data.overallCompliance?.totalComplianceRate) }}%
            </div>
            <div class="compliance-bar">
              <div 
                class="compliance-progress total" 
                :style="{ width: `${data.overallCompliance?.totalComplianceRate || 0}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 院系排名 -->
      <div class="college-rankings">
        <h3 class="section-title">院系排名</h3>
        <div class="rankings-table">
          <div class="table-header">
            <div class="rank-col">排名</div>
            <div class="college-col">院系名称</div>
            <div class="students-col">学生数</div>
            <div class="rate-col">综合达标率</div>
            <div class="detail-col">详细达标率</div>
          </div>
          <div class="table-body">
            <div 
              v-for="college in data.collegeRankings" 
              :key="college.rank"
              class="table-row"
              :class="{ 'top-rank': college.rank <= 3 }"
            >
              <div class="rank-col">
                <span class="rank-badge" :class="`rank-${college.rank}`">
                  {{ getRankIcon(college.rank) }} {{ college.rank }}
                </span>
              </div>
              <div class="college-col">{{ college.collegeName }}</div>
              <div class="students-col">
                {{ getCollegeStudentCount(college.collegeName) }}人
              </div>
              <div class="rate-col">
                <div class="rate-value">{{ formatRate(college.overallComplianceRate) }}%</div>
              </div>
              <div class="detail-col">
                <div class="detail-rates">
                  <span class="rate-item weekly">
                    周: {{ formatRate(college.complianceRates?.weeklyComplianceRate) }}%
                  </span>
                  <span class="rate-item monthly">
                    月: {{ formatRate(college.complianceRates?.monthlyComplianceRate) }}%
                  </span>
                  <span class="rate-item total">
                    总: {{ formatRate(college.complianceRates?.totalComplianceRate) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SchoolStatistics',
  props: {
    data: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['refresh'],
  setup(props) {
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

    return {
      formatRate,
      getRankIcon,
      getCollegeStudentCount
    }
  }
}
</script>

<style scoped>
.school-statistics {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
}

.icon {
  font-size: 24px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-state, .no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #b0bec5;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.panel-content {
  padding: 30px;
}

.school-overview {
  margin-bottom: 30px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.overview-icon {
  font-size: 40px;
}

.overview-info h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #ffffff;
}

.overview-info p {
  margin: 0;
  color: #b0bec5;
  font-size: 16px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #ffffff;
  border-left: 4px solid #2196f3;
  padding-left: 15px;
}

.compliance-overview {
  margin-bottom: 40px;
}

.compliance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.compliance-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.compliance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.compliance-label {
  font-size: 14px;
  color: #b0bec5;
}

.compliance-target {
  font-size: 12px;
  color: #81c784;
}

.compliance-value {
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 15px;
}

.compliance-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.compliance-progress {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.compliance-progress.weekly {
  background: linear-gradient(90deg, #64b5f6, #2196f3);
}

.compliance-progress.monthly {
  background: linear-gradient(90deg, #81c784, #4caf50);
}

.compliance-progress.total {
  background: linear-gradient(90deg, #ffb74d, #ff9800);
}

.college-rankings {
  margin-top: 40px;
}

.rankings-table {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 100px 120px 200px;
  gap: 15px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.05);
  font-weight: bold;
  color: #b0bec5;
  font-size: 14px;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 100px 120px 200px;
  gap: 15px;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.3s;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.table-row.top-rank {
  background: rgba(255, 193, 7, 0.1);
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.rank-badge.rank-1 {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #333;
}

.rank-badge.rank-2 {
  background: linear-gradient(45deg, #c0c0c0, #e8e8e8);
  color: #333;
}

.rank-badge.rank-3 {
  background: linear-gradient(45deg, #cd7f32, #daa520);
  color: #fff;
}

.college-col {
  color: #ffffff;
  font-weight: 500;
}

.students-col {
  color: #b0bec5;
}

.rate-value {
  font-size: 18px;
  font-weight: bold;
  color: #4caf50;
}

.detail-rates {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rate-item {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.rate-item.weekly {
  background: rgba(33, 150, 243, 0.2);
  color: #64b5f6;
}

.rate-item.monthly {
  background: rgba(76, 175, 80, 0.2);
  color: #81c784;
}

.rate-item.total {
  background: rgba(255, 152, 0, 0.2);
  color: #ffb74d;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .table-header, .table-row {
    grid-template-columns: 60px 1fr 80px 100px 150px;
    gap: 10px;
    padding: 12px 15px;
    font-size: 13px;
  }
  
  .detail-rates {
    gap: 2px;
  }
  
  .rate-item {
    font-size: 11px;
  }
}

@media (max-width: 768px) {
  .compliance-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .table-header > div, .table-row > div {
    padding: 5px 0;
  }
  
  .college-col::before { content: "院系: "; color: #b0bec5; }
  .students-col::before { content: "学生数: "; color: #b0bec5; }
  .rate-col::before { content: "综合达标率: "; color: #b0bec5; }
  .detail-col::before { content: "详细达标率: "; color: #b0bec5; display: block; margin-bottom: 5px; }
}
</style>
