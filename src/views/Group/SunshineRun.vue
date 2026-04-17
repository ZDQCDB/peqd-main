<template>
  <div class="sunshine-run-dashboard">
    <!-- 顶部标题栏 -->
    <div class="dashboard-header">
      <h1>校园阳光跑数据大屏</h1>
      <div class="header-actions">
        <el-radio-group v-model="periodFilter" size="small" @change="refreshData" style="margin-right:8px">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="today">今天</el-radio-button>
          <el-radio-button label="week">最近一周</el-radio-button>
          <el-radio-button label="month">最近一月</el-radio-button>
          <el-radio-button label="four_months">最近四月</el-radio-button>
        </el-radio-group>
        <el-radio-group v-if="!isDeptAdmin" v-model="viewMode" size="small" @change="handleViewModeChange">
          <el-radio-button label="school">院系统计</el-radio-button>
          <el-radio-button label="college">班级统计</el-radio-button>
        </el-radio-group>
        <el-button size="small" type="success" :loading="exporting" :disabled="exportDisabled" @click="exportExcel">
          {{ exportDisabled ? '导出Excel（最大支持一个月）' : '导出Excel' }}
        </el-button>
        <el-button size="small" :icon="Refresh" @click="refreshData" circle />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>数据加载中...</p>
    </div>

    <div v-else class="dashboard-content">
      <!-- 顶部数据卡片 -->
      <div class="stats-cards">
        <div class="stat-card" v-for="(stat, index) in topStats" :key="index" :style="{ borderLeft: '3px solid ' + stat.accent }">
          <div class="stat-left">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}<span class="stat-unit">{{ stat.unit }}</span></div>
          </div>
          <div class="stat-trend" :style="{ color: stat.accent }">{{ stat.icon }}</div>
        </div>
      </div>

      <!-- 中部：排名 + 两个图表 -->
      <div class="charts-row">
        <!-- 左侧排名 -->
        <div class="chart-card ranking-card">
          <div class="card-header">
            <h3>{{ viewMode === 'school' ? '院系排名' : '班级排名' }}</h3>
            <span class="subtitle">人均距离(km)</span>
          </div>
          <div class="ranking-list">
            <div
              v-for="(item, index) in rankings"
              :key="index"
              class="ranking-item"
              :class="{ 'top-three': index < 3 }"
              @click="selectRanking(item)"
            >
              <div class="rank-badge" :class="getRankClass(index)">{{ index + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ item.groupName }}</div>
                <div class="rank-bar-wrap">
                  <div class="rank-bar" :style="{ width: getProgressWidth(item.avgDistancePerStudent), background: getRankColor(index) }"></div>
                </div>
              </div>
              <div class="rank-dist">{{ toKm(item.avgDistancePerStudent) }}<em>km</em></div>
            </div>
          </div>
        </div>

        <!-- 右侧图表区域 -->
        <div class="charts-right">
          <!-- 柱状图 -->
          <div class="chart-card">
            <div class="card-header">
              <h3>跑步距离对比</h3>
              <span class="subtitle">人均(公里)</span>
            </div>
            <div ref="barChart" style="width:100%;height:220px;"></div>
          </div>

          <!-- 雷达图 -->
          <div class="chart-card">
            <div class="card-header">
              <h3>综合数据分析</h3>
              <span class="subtitle">前5名多维度</span>
            </div>
            <div ref="radarChart" style="width:100%;height:220px;"></div>
          </div>
        </div>
      </div>

      <!-- 底部表格 -->
      <div class="detail-section">
        <div class="section-header">
          <h3>详细数据</h3>
          <el-input v-model="searchText" placeholder="搜索..." size="small" style="width:180px" clearable />
        </div>
        <el-table :data="filteredTableData" stripe size="small" :row-class-name="tableRowClassName">
          <el-table-column type="index" label="#" width="45" align="center" />
          <el-table-column :label="viewMode === 'school' ? '院系' : '班级'" prop="groupName" min-width="120" />
          <el-table-column label="人数" prop="studentCount" width="70" align="center" />
          <el-table-column label="总次数" prop="aggregate.totalRuns" width="80" align="center" />
          <el-table-column label="总距离(km)" width="100" align="center">
            <template #default="{ row }">{{ toKm(row.aggregate.totalDistance) }}</template>
          </el-table-column>
          <el-table-column label="总时长(h)" width="100" align="center">
            <template #default="{ row }">{{ toHours(row.aggregate.totalDuration) }}</template>
          </el-table-column>
          <el-table-column label="人均次数" prop="aggregate.avgRunsPerStudent" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.aggregate.avgRunsPerStudent }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="人均距离(km)" width="110" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="success">{{ toKm(row.aggregate.avgDistancePerStudent) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="人均时长(h)" width="110" align="center">
            <template #default="{ row }">
              <el-tag size="small">{{ toHours(row.aggregate.avgDurationPerStudent) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Refresh, Loading } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import axios from 'axios'
import api from '@/services/api'
import permissionManager from '@/utils/permissionManager'

export default {
  name: 'SunshineRun',
  components: { Loading },
  setup() {
    const loading = ref(false)
    const exporting = ref(false)
    const isDeptAdmin = computed(() => permissionManager.hasRole('department_admin'))
    const viewMode = ref(permissionManager.hasRole('department_admin') ? 'college' : 'school')
    const statsData = ref(null)
    const searchText = ref('')
    const periodFilter = ref('all')
    const exportDisabled = computed(() => periodFilter.value === 'all' || periodFilter.value === 'four_months')

    const toKm = (meters) => {
      if (meters == null || meters === 0) return '0'
      return (meters / 1000).toFixed(2)
    }
    const toHours = (seconds) => {
      if (seconds == null || seconds === 0) return '0'
      return (seconds / 3600).toFixed(2)
    }

    const barChart = ref(null)
    const radarChart = ref(null)

    let barChartInstance = null
    let radarChartInstance = null
    let resizeTimer = null

    const API_BASE_URL = (process.env.VUE_APP_API_URL || 'http://192.168.1.103:8081').replace(/\/$/, '')

    const topStats = computed(() => {
      if (!statsData.value) return []
      const { overall, totalStudents } = statsData.value
      return [
        { label: '总学生数', value: totalStudents || 0, unit: '人', icon: '🎓', accent: '#667eea' },
        { label: '总跑步次数', value: overall?.totalRuns || 0, unit: '次', icon: '🏃', accent: '#f5576c' },
        { label: '人均跑步距离', value: toKm(overall?.avgDistancePerStudent || 0), unit: 'km', icon: '📏', accent: '#4facfe' },
        { label: '人均跑步时长', value: toHours(overall?.avgDurationPerStudent || 0), unit: 'h', icon: '⏱', accent: '#43e97b' }
      ]
    })

    const rankings = computed(() => statsData.value?.groupRankings || [])

    const filteredTableData = computed(() => {
      const data = statsData.value?.groupStats || []
      if (!searchText.value) return data
      return data.filter(item => item.groupName.toLowerCase().includes(searchText.value.toLowerCase()))
    })

    const fetchData = async () => {
      loading.value = true
      try {
        const token = localStorage.getItem('userToken')
        const endpoint = viewMode.value === 'school'
          ? '/pe/admin/statistics/sunshine-run/school'
          : '/pe/admin/statistics/sunshine-run/college'
        const params = {}
        if (periodFilter.value && periodFilter.value !== 'all') {
          params.period = periodFilter.value
        }
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params
        })
        if (response.data.code === 200) {
          statsData.value = response.data.data
          await nextTick()
          setTimeout(() => { initCharts() }, 50)
        }
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    const initCharts = () => {
      initBarChart()
      initRadarChart()
    }

    const initBarChart = () => {
      if (!barChart.value || !statsData.value) return
      if (barChartInstance) barChartInstance.dispose()

      barChartInstance = echarts.init(barChart.value)
      const top8 = (statsData.value.groupRankings || []).slice(0, 8)

      barChartInstance.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 12, right: 48, top: 8, bottom: 4, containLabel: true },
        xAxis: {
          type: 'value',
          axisLabel: { fontSize: 10, formatter: v => (v / 1000).toFixed(1) + 'km' },
          splitLine: { lineStyle: { color: '#f0f0f0' } }
        },
        yAxis: {
          type: 'category',
          data: top8.map(i => i.groupName).reverse(),
          axisLabel: { fontSize: 11, interval: 0 }
        },
        series: [{
          name: '人均距离',
          type: 'bar',
          barMaxWidth: 18,
          data: top8.map(i => i.avgDistancePerStudent).reverse(),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#4facfe' },
              { offset: 1, color: '#00f2fe' }
            ]),
            borderRadius: [0, 3, 3, 0]
          },
          label: { show: true, position: 'right', fontSize: 10, formatter: p => (p.value / 1000).toFixed(2) + 'km' }
        }]
      })
    }

    const initRadarChart = () => {
      if (!radarChart.value || !statsData.value) return
      if (radarChartInstance) radarChartInstance.dispose()

      radarChartInstance = echarts.init(radarChart.value)
      const top5 = (statsData.value.groupRankings || []).slice(0, 5)
      if (!top5.length) return

      const maxDist = Math.max(...top5.map(i => i.aggregate.avgDistancePerStudent)) || 1
      const maxRuns = Math.max(...top5.map(i => i.aggregate.avgRunsPerStudent)) || 1
      const maxDur = Math.max(...top5.map(i => i.aggregate.avgDurationPerStudent)) || 1

      const colors = ['#667eea', '#f5576c', '#4facfe', '#43e97b', '#feca57']

      radarChartInstance.setOption({
        tooltip: { trigger: 'item' },
        legend: {
          data: top5.map(i => i.groupName),
          bottom: 0,
          textStyle: { fontSize: 10 },
          itemWidth: 10,
          itemHeight: 10
        },
        radar: {
          indicator: [
            { name: '人均距离', max: maxDist * 1.2 },
            { name: '人均次数', max: maxRuns * 1.2 },
            { name: '人均时长', max: maxDur * 1.2 }
          ],
          center: ['50%', '45%'],
          radius: '52%',
          splitNumber: 3,
          axisName: { fontSize: 11 },
          splitLine: { lineStyle: { color: '#e8eaed' } },
          splitArea: { areaStyle: { color: ['#fafafa', '#f0f2f5'] } }
        },
        series: [{
          type: 'radar',
          data: top5.map((item, idx) => ({
            value: [
              item.aggregate.avgDistancePerStudent,
              item.aggregate.avgRunsPerStudent,
              item.aggregate.avgDurationPerStudent
            ],
            name: item.groupName,
            itemStyle: { color: colors[idx] },
            lineStyle: { color: colors[idx], width: 1.5 },
            areaStyle: { color: colors[idx], opacity: 0.15 },
            symbol: 'circle',
            symbolSize: 4
          }))
        }]
      })
    }

    const getRankClass = (index) => {
      if (index === 0) return 'rank-first'
      if (index === 1) return 'rank-second'
      if (index === 2) return 'rank-third'
      return ''
    }

    const getRankColor = (index) => {
      const colors = ['#ffd700', '#c0c0c0', '#cd7f32']
      return colors[index] || '#667eea'
    }

    const getProgressWidth = (distance) => {
      const list = statsData.value?.groupRankings
      if (!list?.length) return '0%'
      const max = list[0].avgDistancePerStudent
      if (!max) return '0%'
      return `${Math.min((distance / max) * 100, 100)}%`
    }

    const selectRanking = () => {}

    const tableRowClassName = ({ rowIndex }) => rowIndex < 3 ? 'top-row' : ''

    const handleViewModeChange = () => fetchData()
    const refreshData = () => fetchData()

    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        barChartInstance?.resize()
        radarChartInstance?.resize()
      }, 200)
    }

    async function exportExcel() {
      exporting.value = true
      try {
        const res = await api.peStatistics.exportSunshineRun({ scope: viewMode.value })
        const blob = res instanceof Blob ? res : new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = '阳光跑统计.xlsx'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (e) {
        console.error('导出失败:', e)
        alert('导出失败，请稍后重试')
      } finally {
        exporting.value = false
      }
    }

    onMounted(() => {
      fetchData()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      barChartInstance?.dispose()
      radarChartInstance?.dispose()
    })

    return {
      loading, exporting, exportDisabled, isDeptAdmin, viewMode, periodFilter, topStats, rankings, filteredTableData, searchText,
      barChart, radarChart,
      handleViewModeChange, refreshData, exportExcel, toKm, toHours,
      getRankClass, getRankColor, getProgressWidth, selectRanking, tableRowClassName,
      Refresh, Loading
    }
  }
}
</script>

<style scoped>
.sunshine-run-dashboard {
  background: var(--bg-body);
  padding: 14px;
  min-height: 100vh;
}

/* 头部 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.dashboard-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}
.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 加载 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #00000040;
  gap: 12px;
  font-size: 14px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
}
.stat-card:hover {
  box-shadow: 0 3px 12px rgba(0,0,0,0.1);
}
.stat-label {
  font-size: 12px;
  color: #00000040;
  margin-bottom: 6px;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}
.stat-unit {
  font-size: 12px;
  font-weight: 400;
  color: #00000040;
  margin-left: 3px;
}
.stat-trend {
  font-size: 28px;
  opacity: 0.7;
}

/* 中部区域 */
.charts-row {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 12px;
  align-items: start;
}

.charts-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.card-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}
.subtitle {
  font-size: 11px;
  color: #c0c4cc;
}

/* 排名列表 */
.ranking-card {
  max-height: 480px;
}
.ranking-list {
  overflow-y: auto;
  max-height: 420px;
}
.ranking-list::-webkit-scrollbar {
  width: 4px;
}
.ranking-list::-webkit-scrollbar-thumb {
  background: #e4e7ed;
  border-radius: 2px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.ranking-item:hover {
  background: var(--bg-body);
}
.ranking-item.top-three {
  background: linear-gradient(90deg, rgba(102,126,234,0.04) 0%, transparent 100%);
}

.rank-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  background: #f0f2f5;
  color: #00000040;
  flex-shrink: 0;
}
.rank-badge.rank-first  { background: #ffd700; color: #fff; }
.rank-badge.rank-second { background: #b0b0b0; color: #fff; }
.rank-badge.rank-third  { background: #cd7f32; color: #fff; }

.rank-info {
  flex: 1;
  min-width: 0;
}
.rank-name {
  font-size: 13px;
  color: #000000d9;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rank-bar-wrap {
  height: 4px;
  background: #f0f2f5;
  border-radius: 2px;
  overflow: hidden;
}
.rank-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}
.rank-dist {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  flex-shrink: 0;
}
.rank-dist em {
  font-style: normal;
  font-size: 10px;
  color: #00000040;
  margin-left: 1px;
}

/* 表格 */
.detail-section {
  background: white;
  border-radius: 8px;
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.section-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

:deep(.el-table) { font-size: 12px; }
:deep(.el-table th.el-table__cell) {
  background: #f8f9fa;
  color: #00000073;
  font-weight: 600;
  padding: 6px 0;
}
:deep(.el-table td.el-table__cell) { padding: 5px 0; }
:deep(.el-table .top-row td.el-table__cell) {
  background: #f0f9ff;
  font-weight: 500;
}

@media (max-width: 1100px) {
  .charts-row { grid-template-columns: 1fr; }
  .stats-cards { grid-template-columns: repeat(2, 1fr); }
}
</style>
