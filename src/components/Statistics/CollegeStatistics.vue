<template>
  <div class="college-statistics">
    <div class="panel-header">
      <h2 class="panel-title">
        <i class="icon">🏛️</i>
        院系统计数据
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
      <!-- 院系概览 -->
      <div class="college-overview">
        <div class="overview-grid">
          <div class="overview-card school">
            <div class="overview-icon">🏫</div>
            <div class="overview-info">
              <h3>{{ data.school }}</h3>
              <p>所属学校</p>
            </div>
          </div>
          <div class="overview-card college">
            <div class="overview-icon">🏛️</div>
            <div class="overview-info">
              <h3>{{ data.college }}</h3>
              <p>当前院系</p>
            </div>
          </div>
          <div class="overview-card students">
            <div class="overview-icon">👥</div>
            <div class="overview-info">
              <h3>{{ data.totalStudents }}人</h3>
              <p>学生总数</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 指标信息 -->
      <div class="targets-info">
        <h3 class="section-title">PE积分指标</h3>
        <div class="targets-grid">
          <div class="target-item">
            <span class="target-label">周指标</span>
            <span class="target-value">{{ data.targets?.weeklyTarget || '--' }}分</span>
          </div>
          <div class="target-item">
            <span class="target-label">月指标</span>
            <span class="target-value">{{ data.targets?.monthlyTarget || '--' }}分</span>
          </div>
          <div class="target-item">
            <span class="target-label">总指标</span>
            <span class="target-value">{{ data.targets?.totalTarget || '--' }}分</span>
          </div>
        </div>
      </div>

      <!-- 院系整体达标率 -->
      <div class="compliance-overview">
        <h3 class="section-title">院系整体达标率</h3>
        <div class="compliance-grid">
          <div class="compliance-card weekly">
            <div class="compliance-header">
              <span class="compliance-label">周达标率</span>
              <span class="compliance-icon">📅</span>
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
            <div class="compliance-status">
              {{ getComplianceStatus(data.overallCompliance?.weeklyComplianceRate) }}
            </div>
          </div>

          <div class="compliance-card monthly">
            <div class="compliance-header">
              <span class="compliance-label">月达标率</span>
              <span class="compliance-icon">📊</span>
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
            <div class="compliance-status">
              {{ getComplianceStatus(data.overallCompliance?.monthlyComplianceRate) }}
            </div>
          </div>

          <div class="compliance-card total">
            <div class="compliance-header">
              <span class="compliance-label">总达标率</span>
              <span class="compliance-icon">🏆</span>
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
            <div class="compliance-status">
              {{ getComplianceStatus(data.overallCompliance?.totalComplianceRate) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 排名数据 (根据用户角色显示院系或班级排名) -->
      <div class="rankings-section">
        <h3 class="section-title">{{ rankingsTitle }}</h3>
        <div class="rankings-container">
          <!-- 前三名特殊展示 -->
          <div v-if="topThreeItems.length > 0" class="top-three">
            <div 
              v-for="itemData in topThreeItems" 
              :key="itemData.rank"
              class="podium-item"
              :class="`rank-${itemData.rank}`"
            >
              <div class="podium-medal">{{ getRankIcon(itemData.rank) }}</div>
              <div class="podium-info">
                <div class="podium-rank">#{{ itemData.rank }}</div>
                <div class="podium-name">{{ getItemName(itemData) }}</div>
                <div class="podium-rate">{{ formatRate(itemData.overallComplianceRate) }}%</div>
              </div>
            </div>
          </div>

          <!-- 完整排名表格 -->
          <div class="rankings-table">
            <div class="table-header">
              <div class="rank-col">排名</div>
              <div class="name-col">{{ isSchoolAdminView ? '院系名称' : '班级名称' }}</div>
              <div class="students-col">学生数</div>
              <div class="rate-col">综合达标率</div>
              <div class="detail-col">详细达标率</div>
            </div>
            <div class="table-body">
              <div 
                v-for="itemData in rankingsData" 
                :key="itemData.rank"
                class="table-row"
                :class="{ 
                  'top-rank': itemData.rank <= 3,
                  'low-rank': itemData.overallComplianceRate < 60 
                }"
              >
                <div class="rank-col">
                  <span class="rank-badge" :class="`rank-${itemData.rank}`">
                    {{ getRankIcon(itemData.rank) }} {{ itemData.rank }}
                  </span>
                </div>
                <div class="name-col">{{ getItemName(itemData) }}</div>
                <div class="students-col">
                  {{ getItemStudentCount(itemData) }}人
                </div>
                <div class="rate-col">
                  <div class="rate-value" :class="getRateClass(itemData.overallComplianceRate)">
                    {{ formatRate(itemData.overallComplianceRate) }}%
                  </div>
                </div>
                <div class="detail-col">
                  <div class="detail-rates">
                    <div class="rate-row">
                      <span class="rate-item weekly">
                        周: {{ formatRate(itemData.complianceRates?.weeklyComplianceRate) }}%
                      </span>
                      <span class="rate-item monthly">
                        月: {{ formatRate(itemData.complianceRates?.monthlyComplianceRate) }}%
                      </span>
                      <span class="rate-item total">
                        总: {{ formatRate(itemData.complianceRates?.totalComplianceRate) }}%
                      </span>
                    </div>
                  </div>
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
import { computed, watch } from 'vue'
import { isSchoolAdmin } from '@/utils/permissionManager'

export default {
  name: 'CollegeStatistics',
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
    // 判断是否为校级管理员视图
    const isSchoolAdminView = computed(() => {
      // 校级管理员访问时，返回的数据包含 collegeRankings（院系排名）
      // 院级管理员访问时，返回的数据包含 classRankings（班级排名）
      return props.data?.collegeRankings && !props.data?.classRankings
    })

    // 获取排名数据（根据用户角色返回不同的数据）
    const rankingsData = computed(() => {
      if (isSchoolAdminView.value) {
        return props.data?.collegeRankings || []
      } else {
        return props.data?.classRankings || []
      }
    })

    // 获取统计数据（根据用户角色返回不同的数据）
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

    // 获取达标状态
    const getComplianceStatus = (rate) => {
      if (rate === null || rate === undefined) return '暂无数据'
      if (rate >= 90) return '优秀'
      if (rate >= 80) return '良好'
      if (rate >= 70) return '合格'
      if (rate >= 60) return '及格'
      return '待改进'
    }

    // 获取达标率等级样式
    const getRateClass = (rate) => {
      if (rate >= 90) return 'excellent'
      if (rate >= 80) return 'good'
      if (rate >= 70) return 'pass'
      if (rate >= 60) return 'low'
      return 'poor'
    }

    // 获取项目名称（院系名或班级名）
    const getItemName = (itemData) => {
      return itemData.collegeName || itemData.className || '未知'
    }

    // 获取项目学生数
    const getItemStudentCount = (itemData) => {
      if (isSchoolAdminView.value) {
        // 校级管理员视图：从 collegeStats 中查找对应院系的学生数
        const collegeData = statsData.value.find(c => c.collegeName === itemData.collegeName)
        return collegeData?.studentCount || 0
      } else {
        // 院级管理员视图：从 classStats 中查找对应班级的学生数
        const classData = statsData.value.find(c => c.className === itemData.className)
        return classData?.studentCount || 0
      }
    }

    return {
      isSchoolAdminView,
      rankingsData,
      statsData,
      rankingsTitle,
      topThreeItems,
      formatRate,
      getRankIcon,
      getComplianceStatus,
      getRateClass,
      getItemName,
      getItemStudentCount
    }
  }
}
</script>

<style scoped>
.college-statistics {
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

.refresh-btn:hover:not(:disabled) { border-color: #1677ff; color: #1677ff; }
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

.college-overview { margin-bottom: 24px; }

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 10px;
  border: 1px solid #e8eaed;
}

.overview-icon { font-size: 28px; flex-shrink: 0; }

.overview-info h3 { margin: 0 0 4px 0; font-size: 18px; color: #2c3e50; }
.overview-info p  { margin: 0; color: #909399; font-size: 13px; }

.section-title {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  border-left: 3px solid #1677ff;
  padding-left: 12px;
}

.targets-info { margin-bottom: 24px; }

.targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
}

.target-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  background: #f5f7fa;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e8eaed;
}

.target-label { font-size: 13px; color: #909399; }
.target-value { font-size: 18px; font-weight: 700; color: #52c41a; }

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
.compliance-icon  { font-size: 18px; }

.compliance-value {
  font-size: 30px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
}

.compliance-bar {
  height: 8px;
  background: #e8eaed;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.compliance-progress { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
.compliance-progress.weekly  { background: linear-gradient(90deg, #69b1ff, #1677ff); }
.compliance-progress.monthly { background: linear-gradient(90deg, #95de64, #52c41a); }
.compliance-progress.total   { background: linear-gradient(90deg, #ffc069, #fa8c16); }

.compliance-status { font-size: 12px; color: #52c41a; font-weight: 500; }

.class-rankings { margin-top: 32px; }

.rankings-container { display: flex; flex-direction: column; gap: 24px; }

.top-three {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px;
  background: #f5f7fa;
  border-radius: 12px;
  border: 1px solid #e8eaed;
  position: relative;
  overflow: hidden;
}

.podium-item.rank-1::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #ffd700, #ffed4e); }
.podium-item.rank-2::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #c0c0c0, #e8e8e8); }
.podium-item.rank-3::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #cd7f32, #daa520); }

.podium-medal { font-size: 36px; margin-bottom: 8px; }
.podium-rank  { font-size: 13px; color: #909399; margin-bottom: 4px; }
.podium-name  { font-size: 15px; color: #2c3e50; font-weight: 600; margin-bottom: 6px; text-align: center; }
.podium-rate  { font-size: 18px; color: #52c41a; font-weight: 700; }

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
  padding: 13px 20px;
  border-bottom: 1px solid #f0f2f5;
  transition: background 0.15s;
}

.table-row:last-child { border-bottom: none; }
.table-row:hover { background: #f5f7fa; }
.table-row.top-rank { background: #fffbe6; }
.table-row.top-rank:hover { background: #fff7cc; }
.table-row.low-rank { background: #fff2f0; }
.table-row.low-rank:hover { background: #ffe7e5; }

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

.name-col     { color: #2c3e50; font-weight: 500; }
.students-col { color: #909399; }

.rate-value           { font-size: 16px; font-weight: 700; }
.rate-value.excellent { color: #52c41a; }
.rate-value.good      { color: #73d13d; }
.rate-value.pass      { color: #fa8c16; }
.rate-value.low       { color: #ff7a45; }
.rate-value.poor      { color: #f5222d; }

.detail-rates { display: flex; flex-direction: column; gap: 4px; }
.rate-row     { display: flex; flex-direction: column; gap: 2px; }

.rate-item { font-size: 12px; padding: 2px 6px; border-radius: 4px; }
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
  .overview-grid, .compliance-grid, .top-three { grid-template-columns: 1fr; }
  .table-header, .table-row { grid-template-columns: 1fr; gap: 6px; }
  .table-header > div, .table-row > div { padding: 4px 0; }
  .name-col::before     { content: "名称: ";    color: #909399; }
  .students-col::before { content: "学生数: ";  color: #909399; }
  .rate-col::before     { content: "综合达标率: "; color: #909399; }
  .detail-col::before   { content: "详细达标率: "; color: #909399; display: block; margin-bottom: 4px; }
}
</style>

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

.college-overview {
  margin-bottom: 30px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.overview-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.overview-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #ffffff;
}

.overview-info p {
  margin: 0;
  color: #b0bec5;
  font-size: 14px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #ffffff;
  border-left: 4px solid #2196f3;
  padding-left: 15px;
}

.targets-info {
  margin-bottom: 30px;
}

.targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.target-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  text-align: center;
}

.target-label {
  font-size: 14px;
  color: #b0bec5;
}

.target-value {
  font-size: 20px;
  font-weight: bold;
  color: #4caf50;
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
  padding: 25px;
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

.compliance-icon {
  font-size: 20px;
}

.compliance-value {
  font-size: 36px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 15px;
}

.compliance-bar {
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
}

.compliance-progress {
  height: 100%;
  border-radius: 5px;
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

.compliance-status {
  font-size: 12px;
  color: #81c784;
  font-weight: 500;
}

.class-rankings {
  margin-top: 40px;
}

.rankings-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.top-three {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.podium-item.rank-1::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
}

.podium-item.rank-2::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #c0c0c0, #e8e8e8);
}

.podium-item.rank-3::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #cd7f32, #daa520);
}

.podium-medal {
  font-size: 40px;
  margin-bottom: 10px;
}

.podium-rank {
  font-size: 14px;
  color: #b0bec5;
  margin-bottom: 5px;
}

.podium-name {
  font-size: 16px;
  color: #ffffff;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}

.podium-rate {
  font-size: 20px;
  color: #4caf50;
  font-weight: bold;
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

.table-row.low-rank {
  background: rgba(244, 67, 54, 0.1);
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

.name-col {
  color: #ffffff;
  font-weight: 500;
}

.students-col {
  color: #b0bec5;
}

.rate-value {
  font-size: 18px;
  font-weight: bold;
}

.rate-value.excellent {
  color: #4caf50;
}

.rate-value.good {
  color: #8bc34a;
}

.rate-value.pass {
  color: #ffeb3b;
}

.rate-value.low {
  color: #ff9800;
}

.rate-value.poor {
  color: #f44336;
}

.detail-rates {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rate-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
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
}

@media (max-width: 768px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
  
  .compliance-grid {
    grid-template-columns: 1fr;
  }
  
  .top-three {
    grid-template-columns: 1fr;
  }
  
  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .table-header > div, .table-row > div {
    padding: 5px 0;
  }
  
  .name-col::before { content: "名称: "; color: #b0bec5; }
  .students-col::before { content: "学生数: "; color: #b0bec5; }
  .rate-col::before { content: "综合达标率: "; color: #b0bec5; }
  .detail-col::before { content: "详细达标率: "; color: #b0bec5; display: block; margin-bottom: 5px; }
}
</style>
