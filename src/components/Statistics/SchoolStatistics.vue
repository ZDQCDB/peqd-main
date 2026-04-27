<template>
  <div class="school-statistics">
    <div class="panel-header">
      <h2 class="panel-title">
        <i class="icon"></i>
        全校统计数据
      </h2>
      <div class="panel-actions">
        <button @click="$emit('refresh')" class="refresh-btn" :disabled="loading">
          <i class="refresh-icon"></i>
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载统计数据...</p>
    </div>

    <div v-else-if="!data" class="no-data">
      <i class="no-data-icon"></i>
      <p>暂无统计数据</p>
    </div>

    <div v-else class="panel-content">
      <!-- 学校概览 -->
      <div class="school-overview">
        <div class="overview-card">
          <div class="overview-icon"></div>
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
        case 1: return '金'
        case 2: return '银'
        case 3: return '铜'
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
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8eaed;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8eaed;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.icon { font-size: 20px; }

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #fff;
  color: #606266;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  border-color: #1677ff;
  color: #1677ff;
}

.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.refresh-icon { animation: spin 1s linear infinite; }

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
  color: #909399;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e8eaed;
  border-left-color: #1677ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.no-data-icon { font-size: 40px; margin-bottom: 12px; }

.panel-content { padding: 24px; }

.school-overview { margin-bottom: 24px; }

.overview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #f5f7fa;
  border-radius: 10px;
  border: 1px solid #e8eaed;
}

.overview-icon { font-size: 36px; }

.overview-info h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
  color: #2c3e50;
}

.overview-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  border-left: 3px solid #1677ff;
  padding-left: 12px;
}

.compliance-overview { margin-bottom: 32px; }

.compliance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.compliance-card {
  padding: 18px;
  background: #f5f7fa;
  border-radius: 10px;
  border: 1px solid #e8eaed;
}

.compliance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.compliance-label { font-size: 13px; color: #909399; }

.compliance-target { font-size: 12px; color: #52c41a; }

.compliance-value {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
}

.compliance-bar {
  height: 6px;
  background: #e8eaed;
  border-radius: 3px;
  overflow: hidden;
}

.compliance-progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.compliance-progress.weekly  { background: linear-gradient(90deg, #69b1ff, #1677ff); }
.compliance-progress.monthly { background: linear-gradient(90deg, #95de64, #52c41a); }
.compliance-progress.total   { background: linear-gradient(90deg, #ffc069, #fa8c16); }

.college-rankings { margin-top: 32px; }

.rankings-table {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e8eaed;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 100px 120px 200px;
  gap: 15px;
  padding: 12px 20px;
  background: #f8f9fa;
  font-weight: 600;
  color: #909399;
  font-size: 13px;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 100px 120px 200px;
  gap: 15px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f2f5;
  transition: background 0.15s;
}

.table-row:last-child { border-bottom: none; }

.table-row:hover { background: #f5f7fa; }

.table-row.top-rank { background: #fffbe6; }
.table-row.top-rank:hover { background: #fff7cc; }

.rank-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.rank-badge.rank-1 { background: #fff7e6; color: #d48806; border: 1px solid #ffd666; }
.rank-badge.rank-2 { background: #f5f5f5; color: #595959; border: 1px solid #d9d9d9; }
.rank-badge.rank-3 { background: #fff2e8; color: #d4380d; border: 1px solid #ffbb96; }

.college-col { color: #2c3e50; font-weight: 500; }

.students-col { color: #909399; }

.rate-value { font-size: 16px; font-weight: 700; color: #52c41a; }

.detail-rates { display: flex; flex-direction: column; gap: 4px; }

.rate-item {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.rate-item.weekly  { background: #e6f4ff; color: #1677ff; }
.rate-item.monthly { background: #f6ffed; color: #52c41a; }
.rate-item.total   { background: #fff7e6; color: #fa8c16; }

@media (max-width: 1200px) {
  .table-header, .table-row {
    grid-template-columns: 60px 1fr 80px 100px 150px;
    gap: 10px;
    padding: 10px 14px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .compliance-grid { grid-template-columns: 1fr; }
  .table-header, .table-row { grid-template-columns: 1fr; gap: 6px; }
  .table-header > div, .table-row > div { padding: 4px 0; }
  .college-col::before  { content: "院系: ";    color: #909399; }
  .students-col::before { content: "学生数: ";  color: #909399; }
  .rate-col::before     { content: "综合达标率: "; color: #909399; }
  .detail-col::before   { content: "详细达标率: "; color: #909399; display: block; margin-bottom: 4px; }
}
</style>
