<template>
  <div class="teacher-teaching">
    <div class="header">
      <h2>教师教学管理</h2>
      <div class="header-actions">
        <button class="btn btn-outline" :class="{ active: activeTab === 'courses' }" @click="activeTab = 'courses'">
          我的课程
        </button>
        <button class="btn btn-outline" :class="{ active: activeTab === 'attendance' }" @click="activeTab = 'attendance'">
          签到记录
        </button>
        <button class="btn btn-outline" :class="{ active: activeTab === 'stats' }" @click="activeTab = 'stats'">
          统计概览
        </button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div v-if="activeTab === 'stats'" class="stats-section">
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-number">{{ stats.totalCourses || 0 }}</div><div class="stat-label">总课程数</div></div>
        <div class="stat-card"><div class="stat-number">{{ stats.todayCourses || 0 }}</div><div class="stat-label">今日课程</div></div>
        <div class="stat-card"><div class="stat-number">{{ stats.totalAttendance || 0 }}</div><div class="stat-label">签到总次数</div></div>
        <div class="stat-card"><div class="stat-number">{{ stats.attendanceRate || '-' }}%</div><div class="stat-label">出勤率</div></div>
      </div>
    </div>

    <!-- 我的课程 -->
    <div v-if="activeTab === 'courses'" class="courses-section">
      <div class="filter-bar">
        <input type="date" v-model="courseDate" @change="loadCourses" class="date-input" />
        <input v-model="courseSearch" placeholder="搜索课程名称..." class="search-input" @input="debouncedLoadCourses" />
      </div>

      <div class="courses-grid">
        <div v-for="course in courses" :key="course.id" class="course-card" :class="{ 'has-attendance': course.hasAttendance }">
          <div class="course-header">
            <div class="course-name">{{ course.courseName }}</div>
            <div class="course-status" :class="course.status">{{ getStatusLabel(course.status) }}</div>
          </div>
          <div class="course-info">
            <span>{{ course.location || '未指定' }}</span>
            <span>{{ course.timeSlot || '-' }}</span>
            <span>{{ course.studentCount || 0 }}人</span>
          </div>
          <div class="course-teacher" v-if="course.teacherName">
            教师：{{ course.teacherName }}
          </div>
          <div class="course-actions">
            <button class="btn btn-small btn-primary" @click="viewCourseDetail(course)">查看详情</button>
            <button class="btn btn-small btn-outline" @click="viewAttendancePhotos(course)">签到照片</button>
            <button class="btn btn-small btn-outline" @click="downloadReport(course)">下载报告</button>
          </div>
        </div>
      </div>

      <div v-if="courses.length === 0 && !loading" class="empty-state">暂无课程数据</div>
    </div>

    <!-- 签到记录 -->
    <div v-if="activeTab === 'attendance'" class="attendance-section">
      <div class="filter-bar">
        <input type="date" v-model="attendanceStartDate" class="date-input" />
        <span>至</span>
        <input type="date" v-model="attendanceEndDate" class="date-input" />
        <button class="btn btn-primary btn-sm" @click="loadAttendanceHistory">查询</button>
      </div>

      <div class="attendance-table-wrap">
        <table class="attendance-table">
          <thead>
            <tr>
              <th>课程名称</th>
              <th>日期</th>
              <th>时间</th>
              <th>签到状态</th>
              <th>签到方式</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in attendanceRecords" :key="record.id">
              <td>{{ record.courseName }}</td>
              <td>{{ record.date }}</td>
              <td>{{ record.timeSlot }}</td>
              <td>
                <span class="status-tag" :class="'status-' + record.status">{{ getAttendanceStatusLabel(record.status) }}</span>
              </td>
              <td>{{ record.checkInMethod || '-' }}</td>
              <td>
                <button v-if="record.photoUrl" class="btn btn-small btn-outline" @click="viewPhoto(record)">查看照片</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="attendanceRecords.length === 0" class="empty-row">暂无签到记录</div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'TeacherTeaching',
  data() {
    return {
      activeTab: 'courses',
      loading: false,
      courses: [],
      courseDate: new Date().toISOString().split('T')[0],
      courseSearch: '',
      stats: {},
      attendanceRecords: [],
      attendanceStartDate: '',
      attendanceEndDate: '',
      debounceTimer: null
    }
  },
  async mounted() {
    await this.loadCourses()
    await this.loadStats()
  },
  methods: {
    async loadCourses() {
      this.loading = true
      try {
        const params = { date: this.courseDate }
        if (this.courseSearch) params.search = this.courseSearch
        const res = await api.teaching.getCourses(params)
        this.courses = res.data?.data || res.data || []
      } catch (e) { console.error('加载课程失败', e) }
      this.loading = false
    },
    debouncedLoadCourses() {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => this.loadCourses(), 300)
    },
    async loadStats() {
      try {
        const res = await api.teaching.getStatistics()
        this.stats = res.data?.data || res.data || {}
      } catch (e) { console.error('加载统计失败', e) }
    },
    async loadAttendanceHistory() {
      this.loading = true
      try {
        const params = {}
        if (this.attendanceStartDate) params.startDate = this.attendanceStartDate
        if (this.attendanceEndDate) params.endDate = this.attendanceEndDate
        const res = await api.teaching.getAttendanceHistory(params)
        this.attendanceRecords = res.data?.data || res.data || []
      } catch (e) { console.error('加载签到记录失败', e) }
      this.loading = false
    },
    viewCourseDetail(course) {
      alert(`课程详情：${course.courseName}\n\n地点：${course.location || '未指定'}\n时间：${course.timeSlot || '-'}\n学生数：${course.studentCount || 0}`)
    },
    async viewAttendancePhotos(course) {
      try {
        const res = await api.teaching.getAttendancePhotos(course.id)
        const photos = res.data?.data || []
        if (photos.length === 0) { alert('暂无签到照片'); return }
        alert(`共 ${photos.length} 张签到照片`)
      } catch (e) { alert('获取照片失败') }
    },
    async downloadReport(course) {
      try {
        const res = await api.teaching.downloadAttendanceReport(course.id)
        const url = URL.createObjectURL(new Blob([res.data || res]))
        const link = document.createElement('a')
        link.href = url
        link.download = `${course.courseName}_签到报告.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (e) { alert('下载失败') }
    },
    viewPhoto(record) {
      if (record.photoUrl) window.open(record.photoUrl, '_blank')
    },
    getStatusLabel(status) {
      return { pending: '待上课', ongoing: '进行中', completed: '已结束', cancelled: '已取消' }[status] || status || '未知'
    },
    getAttendanceStatusLabel(status) {
      return { checked_in: '已签到', checked_out: '已签退', absent: '缺勤', late: '迟到' }[status] || status || '未知'
    }
  }
}
</script>

<style scoped>
.teacher-teaching { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.header h2 { margin: 0; color: #000000d9; }
.header-actions { display: flex; gap: 8px; }

.btn { padding: 8px 16px; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer; font-size: 14px; background: white; transition: all 0.2s; }
.btn-primary { background: #1677ff; color: white; border-color: #1677ff; }
.btn-outline { background: white; }
.btn-outline.active { border-color: #1677ff; color: #1677ff; background: #e6f4ff; }
.btn-sm { padding: 4px 12px; font-size: 12px; }
.btn-small { padding: 4px 10px; font-size: 12px; }
.btn:hover { opacity: 0.85; }

.stats-grid { display: flex; gap: 16px; flex-wrap: wrap; }
.stat-card { background: white; border-radius: 8px; padding: 20px; flex: 1; min-width: 150px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.stat-number { font-size: 28px; font-weight: 700; color: #1677ff; }
.stat-label { font-size: 13px; color: #666; margin-top: 4px; }

.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; flex-wrap: wrap; }
.date-input, .search-input { padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px; }
.search-input { flex: 1; max-width: 300px; }

.courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.course-card { background: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border-left: 4px solid #1677ff; }
.course-card.has-attendance { border-left-color: #52c41a; }
.course-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.course-name { font-size: 16px; font-weight: 600; }
.course-status { padding: 2px 8px; border-radius: 4px; font-size: 12px; background: #f5f5f5; color: #666; }
.course-status.ongoing { background: #e6f4ff; color: #1677ff; }
.course-status.completed { background: #f6ffed; color: #52c41a; }
.course-info { font-size: 12px; color: #999; display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
.course-teacher { font-size: 13px; color: #666; margin-bottom: 12px; }
.course-actions { display: flex; gap: 8px; }

.attendance-table-wrap { background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; }
.attendance-table { width: 100%; border-collapse: collapse; }
.attendance-table th { background: #fafafa; padding: 12px 16px; text-align: left; font-size: 13px; color: #666; border-bottom: 1px solid #f0f0f0; }
.attendance-table td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #f5f5f5; }
.attendance-table tr:hover { background: #fafafa; }
.status-tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.status-checked_in { background: #f6ffed; color: #52c41a; }
.status-checked_out { background: #e6f4ff; color: #1677ff; }
.status-absent { background: #fff1f0; color: #ff4d4f; }
.status-late { background: #fffbe6; color: #faad14; }

.empty-state, .empty-row { text-align: center; padding: 60px 20px; color: #999; font-size: 14px; }
.loading-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
.spinner { width: 40px; height: 40px; border: 3px solid #f0f0f0; border-top-color: #1677ff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
