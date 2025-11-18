<template>
  <div class="sunshine-run-dashboard">
    <!-- 顶部标题栏 -->
    <div class="dashboard-header">
      <h1>校园阳光跑数据大屏</h1>
      <div class="header-actions">
        <el-radio-group v-model="viewMode" size="small" @change="handleViewModeChange">
          <el-radio-button label="school">院系统计</el-radio-button>
          <el-radio-button label="college">班级统计</el-radio-button>
        </el-radio-group>
        <el-button size="small" :icon="Refresh" @click="refreshData" circle />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>数据加载中...</p>
    </div>

    <!-- 主内容区 -->
    <div v-else class="dashboard-content">
      <!-- 顶部数据卡片 -->
      <div class="stats-cards">
        <div class="stat-card" v-for="(stat, index) in topStats" :key="index">
          <div class="stat-icon" :style="{ background: stat.color }">
            <component :is="stat.icon" />
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-unit">{{ stat.unit }}</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-grid">
        <!-- 左侧：排名列表 -->
        <div class="chart-card ranking-card">
          <div class="card-header">
            <h3>{{ viewMode === 'school' ? '院系排名' : '班级排名' }}</h3>
            <span class="subtitle">按人均跑步距离排序</span>
          </div>
          <div class="ranking-list">
            <div 
              v-for="(item, index) in rankings" 
              :key="index"
              class="ranking-item"
              :class="{ 'top-three': index < 3 }"
              @click="selectRanking(item)"
            >
              <div class="rank-badge" :class="getRankClass(index)">
                {{ index + 1 }}
              </div>
              <div class="rank-info">
                <div class="rank-name">{{ item.groupName }}</div>
                <div class="rank-meta">
                  <span>{{ item.avgDistancePerStudent }}米</span>
                  <span class="separator">·</span>
                  <span>{{ item.aggregate.avgRunsPerStudent }}次</span>
                </div>
              </div>
              <div class="rank-progress">
                <div class="progress-bar" :style="{ width: getProgressWidth(item.avgDistancePerStudent) }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右上：柱状图 -->
        <div class="chart-card">
          <div class="card-header">
            <h3>跑步距离对比</h3>
          </div>
          <div ref="barChart" class="chart-container"></div>
        </div>

        <!-- 右下：雷达图 -->
        <div class="chart-card">
          <div class="card-header">
            <h3>综合数据分析</h3>
          </div>
          <div ref="radarChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 底部详细数据表格 -->
      <div class="detail-section">
        <div class="section-header">
          <h3>详细数据</h3>
          <el-input 
            v-model="searchText" 
            placeholder="搜索..." 
            size="small"
            style="width: 200px"
            clearable
          />
        </div>
        <el-table 
          :data="filteredTableData" 
          stripe 
          style="width: 100%"
          :row-class-name="tableRowClassName"
        >
          <el-table-column type="index" label="排名" width="60" align="center" />
          <el-table-column 
            :label="viewMode === 'school' ? '院系名称' : '班级名称'" 
            prop="groupName"
            min-width="150"
          />
          <el-table-column label="学生人数" prop="studentCount" width="100" align="center" />
          <el-table-column label="总次数" prop="aggregate.totalRuns" width="100" align="center" />
          <el-table-column label="总距离(米)" prop="aggregate.totalDistance" width="120" align="center" />
          <el-table-column label="总时长(秒)" prop="aggregate.totalDuration" width="120" align="center" />
          <el-table-column label="人均次数" prop="aggregate.avgRunsPerStudent" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small">{{ row.aggregate.avgRunsPerStudent }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="人均距离(米)" prop="aggregate.avgDistancePerStudent" width="120" align="center">
            <template #default="{ row }">
              <el-tag type="success" size="small">{{ row.aggregate.avgDistancePerStudent }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="人均时长(秒)" prop="aggregate.avgDurationPerStudent" width="120" align="center">
            <template #default="{ row }">
              <el-tag type="info" size="small">{{ row.aggregate.avgDurationPerStudent }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Refresh, Loading, User, Timer, TrendCharts } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import axios from 'axios'

export default {
  name: 'SunshineRun',
  components: {
    Refresh,
    Loading,
    User,
    Timer,
    TrendCharts
  },
  setup() {
    const loading = ref(false)
    const viewMode = ref('school')
    const statsData = ref(null)
    const searchText = ref('')
    
    const barChart = ref(null)
    const radarChart = ref(null)
    
    let barChartInstance = null
    let radarChartInstance = null
    let resizeTimer = null

    // API基础URL
    const API_BASE_URL = 'http://38.207.179.218:8888'

    // 顶部统计卡片数据
    const topStats = computed(() => {
      if (!statsData.value) return []
      
      const { overall, totalStudents } = statsData.value
      
      return [
        {
          label: '总学生数',
          value: totalStudents || 0,
          unit: '人',
          icon: User,
          color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
          label: '总跑步次数',
          value: overall?.totalRuns || 0,
          unit: '次',
          icon: TrendCharts,
          color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
          label: '人均跑步距离',
          value: overall?.avgDistancePerStudent || 0,
          unit: '米',
          icon: TrendCharts,
          color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
          label: '人均跑步时长',
          value: overall?.avgDurationPerStudent || 0,
          unit: '秒',
          icon: Timer,
          color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        }
      ]
    })

    // 排名数据
    const rankings = computed(() => {
      return statsData.value?.groupRankings || []
    })

    // 表格数据
    const filteredTableData = computed(() => {
      const data = statsData.value?.groupStats || []
      if (!searchText.value) return data
      
      return data.filter(item => 
        item.groupName.toLowerCase().includes(searchText.value.toLowerCase())
      )
    })

    // 获取数据
    const fetchData = async () => {
      loading.value = true
      try {
        const token = localStorage.getItem('userToken')
        const endpoint = viewMode.value === 'school' 
          ? '/pe/admin/statistics/sunshine-run/school'
          : '/pe/admin/statistics/sunshine-run/college'
        
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.data.code === 200) {
          statsData.value = response.data.data
          await nextTick()
          initCharts()
        }
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 初始化图表
    const initCharts = () => {
      initBarChart()
      initRadarChart()
    }

    // 初始化柱状图
    const initBarChart = () => {
      if (!barChart.value || !statsData.value) return
      
      if (barChartInstance) {
        barChartInstance.dispose()
      }
      
      barChartInstance = echarts.init(barChart.value)
      
      const top10 = statsData.value.groupRankings.slice(0, 10)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}米'
          }
        },
        yAxis: {
          type: 'category',
          data: top10.map(item => item.groupName).reverse(),
          axisLabel: {
            interval: 0,
            fontSize: 11
          }
        },
        series: [
          {
            name: '人均距离',
            type: 'bar',
            data: top10.map(item => item.avgDistancePerStudent).reverse(),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#4facfe' },
                { offset: 1, color: '#00f2fe' }
              ]),
              borderRadius: [0, 4, 4, 0]
            },
            label: {
              show: true,
              position: 'right',
              formatter: '{c}米'
            }
          }
        ]
      }
      
      barChartInstance.setOption(option)
    }

    // 初始化雷达图
    const initRadarChart = () => {
      if (!radarChart.value || !statsData.value) return
      
      if (radarChartInstance) {
        radarChartInstance.dispose()
      }
      
      radarChartInstance = echarts.init(radarChart.value)
      
      const top5 = statsData.value.groupRankings.slice(0, 5)
      
      // 找出最大值用于标准化
      const maxDistance = Math.max(...top5.map(item => item.aggregate.avgDistancePerStudent))
      const maxRuns = Math.max(...top5.map(item => item.aggregate.avgRunsPerStudent))
      const maxDuration = Math.max(...top5.map(item => item.aggregate.avgDurationPerStudent))
      
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          data: top5.map(item => item.groupName),
          bottom: 0,
          textStyle: {
            fontSize: 10
          }
        },
        radar: {
          indicator: [
            { name: '人均距离', max: maxDistance * 1.2 },
            { name: '人均次数', max: maxRuns * 1.2 },
            { name: '人均时长', max: maxDuration * 1.2 }
          ],
          radius: '60%',
          splitNumber: 4
        },
        series: [
          {
            type: 'radar',
            data: top5.map((item, index) => ({
              value: [
                item.aggregate.avgDistancePerStudent,
                item.aggregate.avgRunsPerStudent,
                item.aggregate.avgDurationPerStudent
              ],
              name: item.groupName,
              itemStyle: {
                color: ['#667eea', '#f5576c', '#4facfe', '#43e97b', '#feca57'][index]
              },
              areaStyle: {
                opacity: 0.3
              }
            }))
          }
        ]
      }
      
      radarChartInstance.setOption(option)
    }

    // 获取排名样式
    const getRankClass = (index) => {
      if (index === 0) return 'rank-first'
      if (index === 1) return 'rank-second'
      if (index === 2) return 'rank-third'
      return ''
    }

    // 获取进度条宽度
    const getProgressWidth = (distance) => {
      if (!statsData.value?.groupRankings.length) return '0%'
      const maxDistance = statsData.value.groupRankings[0].avgDistancePerStudent
      return `${(distance / maxDistance) * 100}%`
    }

    // 选择排名项
    const selectRanking = (item) => {
      console.log('选中:', item)
    }

    // 表格行样式
    const tableRowClassName = ({ rowIndex }) => {
      if (rowIndex < 3) return 'top-row'
      return ''
    }

    // 切换视图模式
    const handleViewModeChange = () => {
      fetchData()
    }

    // 刷新数据
    const refreshData = () => {
      fetchData()
    }

    // 窗口大小改变处理
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        barChartInstance?.resize()
        radarChartInstance?.resize()
      }, 200)
    }

    onMounted(() => {
      fetchData()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      if (barChartInstance) barChartInstance.dispose()
      if (radarChartInstance) radarChartInstance.dispose()
    })

    return {
      loading,
      viewMode,
      topStats,
      rankings,
      filteredTableData,
      searchText,
      barChart,
      radarChart,
      handleViewModeChange,
      refreshData,
      getRankClass,
      getProgressWidth,
      selectRanking,
      tableRowClassName,
      Refresh,
      Loading,
      User,
      Timer,
      TrendCharts
    }
  }
}
</script>

<style scoped>
.sunshine-run-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.dashboard-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #909399;
}

.loading-container p {
  margin-top: 16px;
  font-size: 14px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 顶部数据卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1;
}

.stat-unit {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  height: 600px;
}

.ranking-card {
  grid-row: span 2;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.subtitle {
  font-size: 12px;
  color: #909399;
}

/* 排名列表 */
.ranking-list {
  flex: 1;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.ranking-item:hover {
  background: #f5f7fa;
  transform: translateX(4px);
}

.ranking-item.top-three {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, transparent 100%);
}

.rank-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  background: #e4e7ed;
  color: #606266;
  flex-shrink: 0;
}

.rank-badge.rank-first {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.rank-badge.rank-second {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
}

.rank-badge.rank-third {
  background: linear-gradient(135deg, #cd7f32 0%, #e8a87c 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-name {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-meta {
  font-size: 12px;
  color: #909399;
}

.separator {
  margin: 0 4px;
}

.rank-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #f0f2f5;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

/* 图表容器 */
.chart-container {
  flex: 1;
  min-height: 0;
}

/* 详细数据部分 */
.detail-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

/* 表格样式 */
:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table .top-row) {
  background: #f0f9ff !important;
  font-weight: 500;
}

:deep(.el-table th) {
  background: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 1400px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    height: auto;
  }
  
  .ranking-card {
    grid-row: span 1;
    height: 400px;
  }
  
  .chart-card {
    height: 350px;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 16px;
  }
}
</style> 