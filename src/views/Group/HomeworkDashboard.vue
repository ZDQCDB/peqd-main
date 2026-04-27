<template>
  <div class="homework-dashboard">
    <!-- 顶部标题栏 -->
    <div class="dashboard-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" text @click="$router.back()">返回</el-button>
        <h1>课后作业数据大屏</h1>
        <el-tag v-if="isSchoolAdminRole" type="warning" size="small" effect="plain">校级管理员</el-tag>
        <el-tag v-else-if="isDeptAdminRole" type="success" size="small" effect="plain">院级管理员</el-tag>
      </div>
      <div class="header-actions">
        <el-radio-group v-model="periodFilter" size="small" @change="loadAll">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="today">今天</el-radio-button>
          <el-radio-button label="week">最近一周</el-radio-button>
          <el-radio-button label="month">最近一月</el-radio-button>
          <el-radio-button label="four_months">最近四月</el-radio-button>
        </el-radio-group>
        <el-button v-if="isSchoolAdminRole || isDeptAdminRole" size="small" type="success" :loading="exporting" :disabled="periodFilter === 'all' || periodFilter === 'four_months'" @click="exportExcel">
          {{ periodFilter === 'all' || periodFilter === 'four_months' ? '导出Excel（最大支持一个月）' : '导出Excel' }}
        </el-button>
        <el-button size="small" :icon="Refresh" @click="loadAll" circle :loading="loading" />
      </div>
    </div>

    <div v-if="loading && !overview" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>数据加载中...</p>
    </div>

    <div v-else class="dashboard-content">
      <!-- 顶部数据卡片 -->
      <div class="stats-cards">
        <div class="stat-card" v-for="s in topStats" :key="s.label" :style="{ borderLeft: '3px solid ' + s.accent }">
          <div class="stat-left">
            <div class="stat-label">{{ s.label }}</div>
            <div class="stat-value">{{ s.value }}<span class="stat-unit">{{ s.unit }}</span></div>
          </div>
          <div class="stat-trend" :style="{ color: s.accent }">{{ s.icon }}</div>
        </div>
      </div>

      <!-- 中部：运动类型分布 + 排名区域 + 趋势图 -->
      <div class="charts-row">
        <!-- 运动类型分布 -->
        <div class="chart-card type-card">
          <div class="card-header">
            <h3>运动类型分布</h3>
            <span class="subtitle">总完成次数</span>
          </div>
          <div class="type-list">
            <div v-for="(t, i) in typeStats" :key="t.type" class="type-item">
              <div class="rank-badge" :class="i === 0 ? 'rank-first' : i === 1 ? 'rank-second' : i === 2 ? 'rank-third' : ''">{{ i + 1 }}</div>
              <div class="type-info">
                <div class="type-name">{{ typeLabel(t.type) }}</div>
                <div class="type-bar-wrap">
                  <div class="type-bar" :style="{ width: barWidth(t.totalReps) + '%', background: typeColor(t.type) }"></div>
                </div>
              </div>
              <div class="type-nums">
                <span class="type-reps">{{ t.totalReps }}</span>
                <span class="type-sub">{{ t.students }}人</span>
              </div>
            </div>
            <div v-if="!typeStats.length" class="empty-tip">暂无数据</div>
          </div>
        </div>

        <!-- 排名区域：校级管理员显示院系排名+班级排名两列，院级管理员只显示本院班级排名 -->
        <!-- 校级管理员：院系排名 -->
        <div v-if="isSchoolAdminRole" class="chart-card rank-card">
          <div class="card-header">
            <h3>院系排名</h3>
            <span class="subtitle">按总完成次数</span>
          </div>
          <div class="ranking-list">
            <div v-for="(item, i) in deptRank" :key="item.departmentName" class="ranking-item" :class="{ 'top-three': i < 3 }">
              <div class="rank-badge" :class="i === 0 ? 'rank-first' : i === 1 ? 'rank-second' : i === 2 ? 'rank-third' : ''">{{ i + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ item.departmentName }}</div>
                <div class="rank-bar-wrap">
                  <div class="rank-bar" :style="{ width: deptRankBarWidth(item.totalReps) + '%', background: getRankColor(i) }"></div>
                </div>
              </div>
              <div class="rank-nums">
                <span class="rank-main">{{ item.totalReps }}</span>
                <span class="rank-sub">{{ item.activeStudents }}人参与</span>
              </div>
            </div>
            <div v-if="!deptRank.length" class="empty-tip">暂无院系数据</div>
          </div>
        </div>

        <!-- 班级排名（校级：全校班级；院级：本院班级） -->
        <div class="chart-card rank-card">
          <div class="card-header">
            <h3>{{ isDeptAdminRole ? '本院班级排名' : '全校班级排名' }}</h3>
            <span class="subtitle">按总完成次数</span>
          </div>
          <div class="ranking-list">
            <div v-for="(item, i) in classRank" :key="item.className" class="ranking-item" :class="{ 'top-three': i < 3 }">
              <div class="rank-badge" :class="i === 0 ? 'rank-first' : i === 1 ? 'rank-second' : i === 2 ? 'rank-third' : ''">{{ i + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ item.className }}</div>
                <div class="rank-meta" v-if="isSchoolAdminRole && item.departmentName">{{ item.departmentName }}</div>
                <div class="rank-bar-wrap">
                  <div class="rank-bar" :style="{ width: rankBarWidth(item.totalReps) + '%', background: getRankColor(i) }"></div>
                </div>
              </div>
              <div class="rank-nums">
                <span class="rank-main">{{ item.totalReps }}</span>
                <span class="rank-sub">{{ item.activeStudents }}人参与</span>
              </div>
            </div>
            <div v-if="!classRank.length" class="empty-tip">暂无班级数据</div>
          </div>
        </div>

        <!-- 近30天趋势（ECharts） -->
        <div class="chart-card trend-card" :class="{ 'trend-full': isSchoolAdminRole }">
          <div class="card-header">
            <h3>近30天趋势</h3>
            <span class="subtitle">每日提交次数</span>
          </div>
          <div ref="trendChartRef" style="width:100%;height:220px;"></div>
          <div class="legend">
            <span v-for="t in usedTypes" :key="t" class="legend-item">
              <span class="legend-dot" :style="{ background: typeColor(t) }"></span>
              {{ typeLabel(t) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 底部：校级管理员显示院系详细数据 + 班级详细数据；院级管理员只显示本院班级详细数据 -->
      <!-- 院系详细数据（仅校级管理员） -->
      <div v-if="isSchoolAdminRole" class="detail-section">
        <div class="section-header">
          <h3>院系详细数据</h3>
          <el-input v-model="deptSearchText" placeholder="搜索院系..." size="small" style="width:180px" clearable />
        </div>
        <el-table :data="filteredDeptData" stripe size="small" :row-class-name="tableRowClassName">
          <el-table-column type="index" label="#" width="45" align="center" />
          <el-table-column label="院系" prop="departmentName" min-width="140" />
          <el-table-column label="参与人数" prop="activeStudents" width="90" align="center" />
          <el-table-column label="总提交次数" prop="totalRecords" width="100" align="center" />
          <el-table-column label="总完成次数" prop="totalReps" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="success">{{ row.totalReps }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="人均完成" prop="avgReps" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.avgReps ?? '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="班级数" prop="classCount" width="80" align="center" />
        </el-table>
      </div>

      <!-- 班级详细数据 -->
      <div class="detail-section">
        <div class="section-header">
          <h3>{{ isDeptAdminRole ? '本院班级详细数据' : '全校班级详细数据' }}</h3>
          <el-input v-model="searchText" placeholder="搜索班级..." size="small" style="width:180px" clearable />
        </div>
        <el-table :data="filteredTableData" stripe size="small" :row-class-name="tableRowClassName">
          <el-table-column type="index" label="#" width="45" align="center" />
          <el-table-column label="班级" prop="className" min-width="120" />
          <el-table-column v-if="isSchoolAdminRole" label="所属院系" prop="departmentName" min-width="120" />
          <el-table-column label="参与人数" prop="activeStudents" width="90" align="center" />
          <el-table-column label="总提交次数" prop="totalRecords" width="100" align="center" />
          <el-table-column label="总完成次数" prop="totalReps" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="success">{{ row.totalReps }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="人均完成" prop="avgReps" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.avgReps ?? '-' }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ArrowLeft, Refresh, Loading } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import api from '@/services/api'
import permissionManager from '@/utils/permissionManager'

const loading = ref(false)
const exporting = ref(false)
const overview = ref(null)
const classRank = ref([])
const deptRank = ref([])
const trendRaw = ref([])
const searchText = ref('')
const deptSearchText = ref('')
const periodFilter = ref('all')

const trendChartRef = ref(null)
let trendChartInstance = null
let resizeTimer = null

// ── 角色判断 ──────────────────────────────────────────────────────────────────
const isSchoolAdminRole = computed(() =>
  permissionManager.hasAnyRole(['school_admin', 'super_admin'])
)
const isDeptAdminRole = computed(() =>
  permissionManager.hasRole('department_admin') || permissionManager.hasRole('counselor')
)

// ── 颜色 / 标签 ──────────────────────────────────────────────────────────────
const TYPE_MAP = {
  SQUAT:        { label: '深蹲',     color: '#1677ff' },
  SIT_UP:       { label: '仰卧起坐', color: '#52c41a' },
  PUSH_UP:      { label: '俯卧撑',   color: '#fa8c16' },
  PULL_UP:      { label: '引体向上', color: '#722ed1' },
  JUMP_ROPE:    { label: '跳绳',     color: '#eb2f96' },
  JUMPING_JACK: { label: '开合跳',   color: '#00897b' },
  HIGH_KNEES:   { label: '高抬腿',   color: '#f4511e' },
}
const typeLabel = (t) => TYPE_MAP[t]?.label ?? t
const typeColor = (t) => TYPE_MAP[t]?.color ?? '#8c8c8c'

const getRankColor = (index) => {
  const colors = ['#ffd700', '#c0c0c0', '#cd7f32']
  return colors[index] || '#1677ff'
}

// ── 顶部卡片 ─────────────────────────────────────────────────────────────────
const periodLabel = computed(() => {
  const map = { all: '累计', today: '今日', week: '本周', month: '本月', four_months: '近四月' }
  return map[periodFilter.value] || '累计'
})

const topStats = computed(() => {
  if (!overview.value) return []
  const o = overview.value
  const p = periodLabel.value
  const isFiltered = periodFilter.value !== 'all'
  return [
    { label: p + '提交次数', value: o.totalRecords ?? 0, unit: '次', icon: '', accent: '#1677ff' },
    { label: '参与学生数',   value: o.totalStudents ?? 0, unit: '人', icon: '', accent: '#52c41a' },
    { label: p + '完成次数', value: o.totalReps ?? 0,    unit: '次', icon: '', accent: '#fa8c16' },
    ...(!isFiltered ? [
      { label: '今日提交',     value: o.todayRecords ?? 0, unit: '次', icon: '', accent: '#722ed1' },
      { label: '今日参与',     value: o.todayStudents ?? 0,unit: '人', icon: '', accent: '#eb2f96' },
      { label: '本周提交',     value: o.weekRecords ?? 0,  unit: '次', icon: '', accent: '#13c2c2' },
    ] : []),
  ]
})

// ── 运动类型 ─────────────────────────────────────────────────────────────────
const typeStats = computed(() => overview.value?.typeStats ?? [])
const maxReps = computed(() => Math.max(...typeStats.value.map(t => Number(t.totalReps) || 0), 1))
const barWidth = (v) => Math.round((Number(v) / maxReps.value) * 100)

// ── 班级排名 ─────────────────────────────────────────────────────────────────
const maxClassReps = computed(() => Math.max(...classRank.value.map(c => Number(c.totalReps) || 0), 1))
const rankBarWidth = (v) => Math.round((Number(v) / maxClassReps.value) * 100)

// ── 院系排名 ─────────────────────────────────────────────────────────────────
const maxDeptReps = computed(() => Math.max(...deptRank.value.map(d => Number(d.totalReps) || 0), 1))
const deptRankBarWidth = (v) => Math.round((Number(v) / maxDeptReps.value) * 100)

// ── 底部表格 ─────────────────────────────────────────────────────────────────
const filteredTableData = computed(() => {
  if (!searchText.value) return classRank.value
  return classRank.value.filter(item =>
    item.className?.toLowerCase().includes(searchText.value.toLowerCase())
  )
})
const filteredDeptData = computed(() => {
  if (!deptSearchText.value) return deptRank.value
  return deptRank.value.filter(item =>
    item.departmentName?.toLowerCase().includes(deptSearchText.value.toLowerCase())
  )
})
const tableRowClassName = ({ rowIndex }) => rowIndex < 3 ? 'top-row' : ''

// ── 趋势图（ECharts） ─────────────────────────────────────────────────────────
const usedTypes = computed(() => [...new Set(trendRaw.value.map(r => r.type))])

const trendDays = computed(() => {
  const byDate = {}
  for (const row of trendRaw.value) {
    const d = row.date?.toString().slice(0, 10) ?? ''
    if (!byDate[d]) byDate[d] = {}
    byDate[d][row.type] = (byDate[d][row.type] || 0) + Number(row.sessions || 0)
  }
  return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b))
    .map(([date, types]) => ({ date, shortDate: date.slice(5), types }))
})

function initTrendChart() {
  if (!trendChartRef.value) return
  if (trendChartInstance) trendChartInstance.dispose()
  trendChartInstance = echarts.init(trendChartRef.value)

  const days = trendDays.value
  const types = usedTypes.value
  const xData = days.map(d => d.shortDate)

  const series = types.map(type => ({
    name: typeLabel(type),
    type: 'bar',
    stack: 'total',
    barMaxWidth: 20,
    itemStyle: { color: typeColor(type), borderRadius: type === types[types.length - 1] ? [3, 3, 0, 0] : 0 },
    data: days.map(d => d.types[type] || 0),
  }))

  trendChartInstance.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { show: false },
    grid: { left: 8, right: 8, top: 8, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: { fontSize: 10, interval: Math.floor(xData.length / 10) },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e8eaed' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: series.length ? series : [{ type: 'bar', data: [] }],
  })
}

// ── 导出 Excel ──────────────────────────────────────────────────────────────
async function exportExcel() {
  exporting.value = true
  try {
    const p = periodFilter.value === 'all' ? 'month' : periodFilter.value
    const res = await api.homeworkStats.exportExcel({ period: p })
    const blob = res instanceof Blob ? res : new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '课后作业统计.xlsx'
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

// ── 数据加载 ─────────────────────────────────────────────────────────────────
async function loadAll() {
  loading.value = true
  try {
    const p = periodFilter.value === 'all' ? undefined : periodFilter.value
    const qp = p ? { period: p } : undefined
    const requests = [
      api.homeworkStats.getOverview(qp),
      api.homeworkStats.getTrend(qp),
    ]

    if (isSchoolAdminRole.value) {
      requests.push(api.homeworkStats.getClassRank(qp))
      requests.push(api.homeworkStats.getDepartmentRank(qp))
    } else {
      requests.push(api.homeworkStats.getDeptClassRank(qp))
    }

    const results = await Promise.allSettled(requests)
    const [ovRes, trendRes, rankRes, deptRes] = results

    if (ovRes.status === 'fulfilled' && ovRes.value?.data) {
      overview.value = ovRes.value.data
    }
    if (trendRes.status === 'fulfilled' && trendRes.value?.data) {
      trendRaw.value = trendRes.value.data
    }
    if (rankRes.status === 'fulfilled' && rankRes.value?.data) {
      classRank.value = rankRes.value.data
    }
    if (isSchoolAdminRole.value && deptRes?.status === 'fulfilled' && deptRes.value?.data) {
      deptRank.value = deptRes.value.data
    }
  } finally {
    loading.value = false
    await nextTick()
    setTimeout(initTrendChart, 50)
  }
}

const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => { trendChartInstance?.resize() }, 200)
}

onMounted(() => {
  loadAll()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChartInstance?.dispose()
})
</script>

<style scoped>
.homework-dashboard {
  background: var(--bg-body, #f5f7fa);
  padding: 14px;
  min-height: 100vh;
}

/* 顶部 */
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
.header-left { display: flex; align-items: center; gap: 8px; }
.header-left h1 { margin: 0; font-size: 18px; font-weight: 600; color: #2c3e50; }
.header-actions { display: flex; gap: 10px; align-items: center; }

/* 加载 */
.loading-container {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 300px; color: #00000040;
  gap: 12px; font-size: 14px;
}

.dashboard-content { display: flex; flex-direction: column; gap: 12px; }

/* 顶部卡片 */
.stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
.stat-card {
  background: white; border-radius: 8px; padding: 14px 16px;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); transition: box-shadow 0.2s;
}
.stat-card:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.1); }
.stat-label { font-size: 12px; color: #00000040; margin-bottom: 6px; }
.stat-value { font-size: 24px; font-weight: 700; color: #2c3e50; line-height: 1; }
.stat-unit { font-size: 12px; font-weight: 400; color: #00000040; margin-left: 3px; }
.stat-trend { font-size: 28px; opacity: 0.7; }

/* 中部三/四列 */
/* 院级管理员：运动类型 + 班级排名 + 趋势图（3列） */
/* 校级管理员：运动类型 + 院系排名 + 班级排名 + 趋势图（4列，趋势图换行） */
.charts-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1.4fr; gap: 12px; }
.chart-card {
  background: white; border-radius: 8px; padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.card-header h3 { margin: 0; font-size: 14px; font-weight: 600; color: #2c3e50; }
.subtitle { font-size: 11px; color: #c0c4cc; }

/* 趋势图在校级管理员下独占一行 */
.trend-full { grid-column: 1 / -1; }

/* 运动类型 */
.type-list { display: flex; flex-direction: column; gap: 12px; }
.type-item { display: flex; align-items: center; gap: 10px; }
.type-info { flex: 1; min-width: 0; }
.type-name { font-size: 13px; color: #333; margin-bottom: 4px; }
.type-bar-wrap { height: 5px; background: #f0f2f5; border-radius: 3px; overflow: hidden; }
.type-bar { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
.type-nums { text-align: right; flex-shrink: 0; }
.type-reps { display: block; font-size: 14px; font-weight: 600; color: #2c3e50; }
.type-sub { font-size: 11px; color: #00000040; }

/* 排名卡片 */
.rank-card { max-height: 480px; }
.ranking-list { overflow-y: auto; max-height: 420px; }
.ranking-list::-webkit-scrollbar { width: 4px; }
.ranking-list::-webkit-scrollbar-thumb { background: #e4e7ed; border-radius: 2px; }
.ranking-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 6px; border-radius: 6px; transition: background 0.15s;
}
.ranking-item:hover { background: #f5f7fa; }
.ranking-item.top-three {
  background: linear-gradient(90deg, rgba(22,119,255,0.04) 0%, transparent 100%);
}
.rank-badge {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 12px;
  background: #f0f2f5; color: #00000040; flex-shrink: 0;
}
.rank-badge.rank-first  { background: #ffd700; color: #fff; }
.rank-badge.rank-second { background: #b0b0b0; color: #fff; }
.rank-badge.rank-third  { background: #cd7f32; color: #fff; }
.rank-info { flex: 1; min-width: 0; }
.rank-name {
  font-size: 13px; color: #000000d9; margin-bottom: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.rank-meta { font-size: 11px; color: #00000040; margin-bottom: 3px; }
.rank-bar-wrap { height: 4px; background: #f0f2f5; border-radius: 2px; overflow: hidden; }
.rank-bar { height: 100%; border-radius: 2px; transition: width 0.4s ease; }
.rank-nums { text-align: right; flex-shrink: 0; }
.rank-main { display: block; font-size: 14px; font-weight: 600; color: #2c3e50; }
.rank-sub { font-size: 11px; color: #00000040; }

/* 趋势图 */
.trend-card { display: flex; flex-direction: column; }
.legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0; }
.legend-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

/* 底部表格 */
.detail-section {
  background: white; border-radius: 8px; padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.section-header h3 { font-size: 14px; font-weight: 600; color: #2c3e50; margin: 0; }

:deep(.el-table) { font-size: 12px; }
:deep(.el-table th.el-table__cell) {
  background: #f8f9fa; color: #00000073; font-weight: 600; padding: 6px 0;
}
:deep(.el-table td.el-table__cell) { padding: 5px 0; }
:deep(.el-table .top-row td.el-table__cell) { background: #f0f9ff; font-weight: 500; }

/* 通用 */
.empty-tip { text-align: center; color: #bfbfbf; font-size: 13px; padding: 40px 0; }

/* 响应式 */
@media (max-width: 1400px) {
  .charts-row { grid-template-columns: 1fr 1fr; }
  .trend-card, .trend-full { grid-column: 1 / -1; }
}
@media (max-width: 1200px) {
  .stats-cards { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .stats-cards { grid-template-columns: repeat(2, 1fr); }
  .charts-row { grid-template-columns: 1fr; }
}
</style>
