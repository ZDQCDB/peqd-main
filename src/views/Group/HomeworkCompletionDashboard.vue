<template>
  <div class="completion-dashboard">
    <div class="filter-bar">
      <h1 class="page-title">课后作业完成情况</h1>
      <div class="filter-controls">
        <el-select v-model="semester" placeholder="选择学期" clearable style="width: 200px" @change="loadDashboard">
          <el-option v-for="s in semesters" :key="s" :label="s" :value="s" />
        </el-select>
        <el-button type="primary" :icon="Refresh" :loading="loading" @click="loadDashboard">刷新</el-button>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="stats-row">
      <div class="stat-card" v-for="s in statsCards" :key="s.label">
        <div class="stat-icon" :style="{ background: s.bg }">{{ s.icon }}</div>
        <div class="stat-body">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">{{ s.value }}<span v-if="s.unit" class="stat-unit">{{ s.unit }}</span></div>
        </div>
      </div>
    </div>

    <div class="main-content" v-loading="loading">
      <!-- Table -->
      <el-card class="table-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">教师 / 临时班级完成率</span>
            <el-input v-model="searchText" placeholder="搜索教师或班级..." clearable size="small" style="width: 220px" />
          </div>
        </template>
        <el-table :data="filteredTableData" stripe border size="small" max-height="500">
          <el-table-column type="index" label="#" width="50" align="center" />
          <el-table-column label="体育老师" prop="teacherName" min-width="100" show-overflow-tooltip />
          <el-table-column label="临时班级" prop="tempClassName" min-width="140" show-overflow-tooltip />
          <el-table-column label="总学生数" prop="totalStudents" width="90" align="center" />
          <el-table-column label="已提交" prop="submittedCount" width="80" align="center">
            <template #default="{ row }">
              <el-tag type="success" size="small">{{ row.submittedCount ?? 0 }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="完成率" width="180" align="center">
            <template #default="{ row }">
              <div class="rate-cell">
                <el-progress
                  :percentage="row.completionRate ?? 0"
                  :color="rateColor(row.completionRate)"
                  :stroke-width="14"
                  :text-inside="true"
                  style="flex: 1"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Chart -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <span class="card-title">完成率柱状图</span>
        </template>
        <div ref="chartRef" class="echart-container"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import api from '@/services/api'
import permissionManager from '@/utils/permissionManager'

const loading = ref(false)
const semester = ref('')
const searchText = ref('')
const dashboardData = ref(null)

const chartRef = ref(null)
let chartInstance = null

const semesters = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const list = []
  for (let y = year; y >= year - 2; y--) {
    list.push(`${y}-${y + 1}-1`)
    list.push(`${y}-${y + 1}-2`)
  }
  return list
})

const school = computed(() => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return info.school || ''
  } catch { return '' }
})

const dashboardRows = computed(() => {
  if (Array.isArray(dashboardData.value)) return dashboardData.value
  return dashboardData.value?.details || dashboardData.value?.records || []
})

const totalAssignments = computed(() => {
  if (Array.isArray(dashboardData.value)) return dashboardRows.value.length
  return dashboardData.value?.totalAssignments ?? 0
})

const totalSubmissions = computed(() => {
  if (Array.isArray(dashboardData.value)) {
    return dashboardRows.value.reduce((sum, row) => sum + (Number(row.submittedCount) || 0), 0)
  }
  return dashboardData.value?.totalSubmissions ?? 0
})

const avgCompletionRate = computed(() => {
  if (Array.isArray(dashboardData.value)) {
    if (!dashboardRows.value.length) return 0
    const total = dashboardRows.value.reduce((sum, row) => sum + (Number(row.completionRate) || 0), 0)
    return Math.round((total / dashboardRows.value.length) * 100) / 100
  }
  return dashboardData.value?.avgCompletionRate ?? 0
})

const statsCards = computed(() => [
  { label: '总作业数', value: totalAssignments.value, unit: '个', icon: '', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { label: '总提交数', value: totalSubmissions.value, unit: '次', icon: '', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { label: '平均完成率', value: avgCompletionRate.value, unit: '%', icon: '', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
])

const tableData = computed(() => dashboardRows.value)

const filteredTableData = computed(() => {
  if (!searchText.value) return tableData.value
  const kw = searchText.value.toLowerCase()
  return tableData.value.filter(
    r => (r.teacherName || '').toLowerCase().includes(kw) || (r.tempClassName || '').toLowerCase().includes(kw)
  )
})

function rateColor(rate) {
  if (rate >= 80) return '#67c23a'
  if (rate >= 50) return '#e6a23c'
  return '#f56c6c'
}

async function loadDashboard() {
  loading.value = true
  try {
    const params = {}
    if (school.value) params.school = school.value
    if (semester.value) params.semester = semester.value
    const res = await api.homeworkAssignments.getCompletionDashboard(params)
    dashboardData.value = res?.data || res || {}
  } catch (e) {
    console.error('加载完成率数据失败:', e)
  } finally {
    loading.value = false
    await nextTick()
    setTimeout(renderChart, 80)
  }
}

function renderChart() {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)

  const data = tableData.value.slice(0, 30)
  const names = data.map(r => r.tempClassName || r.teacherName || '-')
  const rates = data.map(r => r.completionRate ?? 0)

  chartInstance.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}%' },
    grid: { left: 12, right: 20, top: 20, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { rotate: 35, fontSize: 11, interval: 0 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e4e7ed' } }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f0f2f5' } }
    },
    series: [{
      type: 'bar',
      data: rates.map(v => ({
        value: v,
        itemStyle: { color: rateColor(v), borderRadius: [4, 4, 0, 0] }
      })),
      barMaxWidth: 36,
      label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11, color: '#606266' }
    }]
  })
}

const handleResize = () => chartInstance?.resize()

watch(semester, () => { loadDashboard() })

onMounted(() => {
  loadDashboard()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
.completion-dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* Filter bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Stats row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-body {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.1;
}

.stat-unit {
  font-size: 13px;
  font-weight: 400;
  color: #909399;
  margin-left: 4px;
}

/* Main content */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-card,
.chart-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.rate-cell {
  display: flex;
  align-items: center;
}

.echart-container {
  width: 100%;
  height: 380px;
}

/* Table styles */
:deep(.el-table th.el-table__cell) {
  background: #f8f9fa;
  color: #606266;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .completion-dashboard {
    padding: 12px;
  }

  .echart-container {
    height: 280px;
  }
}
</style>
