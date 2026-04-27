<template>
  <div class="student-training-admin">
    <div class="header">
      <div class="header-left">
        <button class="btn btn-secondary" @click="$router.push('/training')">← 返回训练模块</button>
        <h2>学生训练完成情况</h2>
      </div>
      <div class="header-right">
        <select v-model="selectedTaskId" @change="loadTaskRecords" class="select-input">
          <option value="">选择训练任务</option>
          <option v-for="task in allTasks" :key="task.id" :value="task.id">
            {{ task.title }} ({{ task.startDate }} ~ {{ task.endDate }})
          </option>
        </select>
      </div>
    </div>

    <!-- 任务概览 -->
    <div v-if="currentTask" class="task-overview">
      <div class="overview-info">
        <h3>{{ currentTask.title }}</h3>
        <div class="overview-meta">
          <span class="badge" :class="currentTask.trainingType">{{ getTypeLabel(currentTask.trainingType) }}</span>
          <span>{{ currentTask.startDate }} ~ {{ currentTask.endDate }}</span>
          <span>{{ currentTask.targetClasses?.join(', ') }}</span>
        </div>
        <p v-if="currentTask.description" class="overview-desc">{{ currentTask.description }}</p>
      </div>
      <div class="overview-stats">
        <div class="os-item">
          <div class="os-number">{{ currentTask.totalStudents }}</div>
          <div class="os-label">总人数</div>
        </div>
        <div class="os-item">
          <div class="os-number text-green">{{ currentTask.completedStudents }}</div>
          <div class="os-label">已完成</div>
        </div>
        <div class="os-item">
          <div class="os-number text-blue">{{ currentTask.completionRate }}%</div>
          <div class="os-label">完成率</div>
        </div>
      </div>
    </div>

    <!-- 筛选 -->
    <div v-if="currentTask" class="filter-bar">
      <div class="filter-tabs">
        <button v-for="s in recordStatusTabs" :key="s.value"
                :class="['tab', { active: recordStatusFilter === s.value }]"
                @click="recordStatusFilter = s.value">
          {{ s.label }} ({{ getRecordCountByStatus(s.value) }})
        </button>
      </div>
    </div>

    <!-- 学生完成记录列表 -->
    <div v-if="currentTask" class="records-table-wrap">
      <table class="records-table">
        <thead>
          <tr>
            <th>学号</th>
            <th>姓名</th>
            <th>班级</th>
            <th>状态</th>
            <th>完成率</th>
            <th>评分</th>
            <th>完成时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="record.id">
            <td>{{ record.studentId }}</td>
            <td>{{ record.studentName }}</td>
            <td>{{ record.className }}</td>
            <td>
              <span class="status-tag" :class="'status-' + record.status">{{ getStatusLabel(record.status) }}</span>
            </td>
            <td>
              <div class="mini-progress">
                <div class="mini-bar"><div class="mini-fill" :style="{ width: (record.completionRate || 0) + '%' }"></div></div>
                <span>{{ record.completionRate || 0 }}%</span>
              </div>
            </td>
            <td>{{ record.score || '-' }}</td>
            <td>{{ record.completedAt ? formatDateTime(record.completedAt) : '-' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredRecords.length === 0" class="empty-row">暂无记录</div>
    </div>

    <!-- 未选择任务 -->
    <div v-if="!currentTask" class="empty-state">
      <div class="empty-icon"></div>
      <p>请选择一个训练任务查看学生完成情况</p>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api'

export default {
  name: 'StudentTraining',
  data() {
    return {
      allTasks: [],
      selectedTaskId: '',
      currentTask: null,
      records: [],
      recordStatusFilter: 'all',
      recordStatusTabs: [
        { value: 'all', label: '全部' },
        { value: 'pending', label: '未开始' },
        { value: 'in_progress', label: '进行中' },
        { value: 'completed', label: '已完成' },
        { value: 'overdue', label: '已逾期' }
      ]
    }
  },
  computed: {
    filteredRecords() {
      if (this.recordStatusFilter === 'all') return this.records
      return this.records.filter(r => r.status === this.recordStatusFilter)
    }
  },
  async mounted() {
    await this.loadAllTasks()
  },
  methods: {
    async loadAllTasks() {
      try {
        const res = await api.training.getTasks({ page: 0, size: 100 })
        this.allTasks = res.data?.data?.content || []
      } catch (e) { console.error('加载任务列表失败', e) }
    },
    async loadTaskRecords() {
      if (!this.selectedTaskId) { this.currentTask = null; this.records = []; return }
      try {
        const detailRes = await api.training.getTaskDetail(this.selectedTaskId)
        this.currentTask = detailRes.data?.data || null
        const recordsRes = await api.training.getTaskRecords(this.selectedTaskId, { page: 0, size: 200 })
        this.records = recordsRes.data?.data?.content || []
      } catch (e) { console.error('加载记录失败', e) }
    },
    getRecordCountByStatus(status) {
      if (status === 'all') return this.records.length
      return this.records.filter(r => r.status === status).length
    },
    getTypeLabel(type) {
      return { endurance: '耐力', strength: '力量', flexibility: '柔韧', skill: '技能', comprehensive: '综合' }[type] || type
    },
    getStatusLabel(status) {
      return { pending: '未开始', in_progress: '进行中', completed: '已完成', overdue: '已逾期' }[status] || status
    },
    formatDateTime(dt) {
      if (!dt) return '-'
      return new Date(dt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.student-training-admin { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-left h2 { margin: 0; color: #000000d9; }
.select-input { padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px; min-width: 300px; }

.btn { padding: 8px 16px; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer; font-size: 14px; background: white; }
.btn-secondary { background: #f5f5f5; }

/* 任务概览 */
.task-overview { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.overview-info { flex: 1; }
.overview-info h3 { margin: 0 0 8px; font-size: 18px; }
.overview-meta { display: flex; gap: 12px; font-size: 13px; color: #666; align-items: center; flex-wrap: wrap; }
.overview-desc { font-size: 13px; color: #666; margin: 8px 0 0; line-height: 1.5; }
.badge { padding: 2px 8px; border-radius: 4px; font-size: 12px; background: #e6f4ff; color: #1677ff; }
.badge.strength { background: #fff2e8; color: #fa8c16; }
.badge.flexibility { background: #f6ffed; color: #52c41a; }
.badge.skill { background: #f9f0ff; color: #722ed1; }
.badge.comprehensive { background: #e6fffb; color: #13c2c2; }
.overview-stats { display: flex; gap: 24px; align-items: center; }
.os-item { text-align: center; min-width: 70px; }
.os-number { font-size: 28px; font-weight: 700; color: #333; }
.os-label { font-size: 12px; color: #999; }
.text-green { color: #52c41a; }
.text-blue { color: #1677ff; }

/* 筛选 */
.filter-bar { margin-bottom: 16px; }
.filter-tabs { display: flex; gap: 8px; }
.tab { padding: 6px 16px; border: 1px solid #d9d9d9; border-radius: 20px; background: white; cursor: pointer; font-size: 13px; }
.tab.active { background: #1677ff; color: white; border-color: #1677ff; }

/* 表格 */
.records-table-wrap { background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; }
.records-table { width: 100%; border-collapse: collapse; }
.records-table th { background: #fafafa; padding: 12px 16px; text-align: left; font-size: 13px; color: #666; border-bottom: 1px solid #f0f0f0; }
.records-table td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #f5f5f5; }
.records-table tr:hover { background: #fafafa; }
.status-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.status-pending { background: #f5f5f5; color: #999; }
.status-in_progress { background: #e6f4ff; color: #1677ff; }
.status-completed { background: #f6ffed; color: #52c41a; }
.status-overdue { background: #fff1f0; color: #ff4d4f; }
.mini-progress { display: flex; align-items: center; gap: 8px; }
.mini-bar { width: 60px; height: 4px; background: #f0f0f0; border-radius: 2px; overflow: hidden; }
.mini-fill { height: 100%; background: #1677ff; border-radius: 2px; }
.empty-row { text-align: center; padding: 40px; color: #999; }

.empty-state { text-align: center; padding: 80px 20px; color: #999; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
</style>
