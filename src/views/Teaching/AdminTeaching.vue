<template>
  <div class="admin-teaching">
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary" @click="$router.push('/teaching')">
          ← 返回教学模块
        </button>
        <h1>教师签到管理</h1>
      </div>
      <div class="header-right">
        <button class="btn btn-primary" @click="refreshData">
          <i class="icon-refresh"></i> 刷新数据
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-content">
          <h3>{{ statistics.totalCourses }}</h3>
          <p>总课程数</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>{{ statistics.todayAttendance }}</h3>
          <p>今日签到</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>{{ statistics.attendanceRate }}%</h3>
          <p>签到率</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👨‍🏫</div>
        <div class="stat-content">
          <h3>{{ statistics.totalTeachers }}</h3>
          <p>教师总数</p>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索课程名称或教师姓名..."
          @input="handleSearch"
        />
        <i class="icon-search"></i>
      </div>
      <div class="filter-group">
        <select v-model="selectedStatus" @change="handleFilter">
          <option value="">全部状态</option>
          <option value="completed">已签到</option>
          <option value="pending">未签到</option>
          <option value="late">迟到</option>
        </select>
        <input 
          type="date" 
          v-model="selectedDate" 
          @change="handleFilter"
        />
      </div>
    </div>

    <!-- 课程列表 -->
    <div class="course-list">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="filteredCourses.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>暂无课程数据</p>
      </div>
      
      <div v-else class="course-grid">
        <div 
          v-for="course in filteredCourses" 
          :key="course.id"
          class="course-card"
          :class="getCardClass(course)"
        >
          <div class="course-header">
                      <div class="course-info">
            <h3>{{ course.name }}</h3>
          </div>
            <div class="course-status">
              <span :class="'status-badge status-' + course.attendanceStatus">
                {{ getStatusText(course.attendanceStatus) }}
              </span>
            </div>
          </div>
          
          <div class="course-details">
            <div class="detail-row">
              <span class="label">教师：</span>
              <span class="value">{{ course.teacherName }}</span>
            </div>

            <div class="detail-row">
              <span class="label">时间：</span>
              <span class="value">{{ formatCourseTime(course) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">地点：</span>
              <span class="value">{{ course.location }}</span>
            </div>
            <div v-if="course.attendanceTime" class="detail-row">
              <span class="label">签到时间：</span>
              <span class="value">{{ formatTime(course.attendanceTime) }}</span>
            </div>
          </div>
          
          <div class="course-actions">
            <button 
              class="btn btn-primary btn-sm"
              @click="viewCourseDetail(course)"
            >
              查看详情
            </button>
            <button 
              v-if="course.attendanceStatus === 'completed'"
              class="btn btn-info btn-sm"
              @click="viewAttendancePhoto(course)"
            >
              查看签到照片
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.total > 0" class="pagination">
      <button 
        class="btn btn-secondary"
        :disabled="pagination.current <= 1"
        @click="changePage(pagination.current - 1)"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ pagination.current }} 页，共 {{ pagination.pages }} 页
      </span>
      <button 
        class="btn btn-secondary"
        :disabled="pagination.current >= pagination.pages"
        @click="changePage(pagination.current + 1)"
      >
        下一页
      </button>
    </div>

    <!-- 照片查看模态框 -->
    <div v-if="showPhotoModal" class="modal-overlay" @click="closePhotoModal">
      <div class="photo-modal" @click.stop>
        <div class="modal-header">
          <h3>签到照片</h3>
          <button class="close-btn" @click="closePhotoModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedCourse" class="photo-info">
            <p><strong>课程：</strong>{{ selectedCourse.name }}</p>
            <p><strong>教师：</strong>{{ selectedCourse.teacherName }}</p>
            <p><strong>签到时间：</strong>{{ formatTime(selectedCourse.attendanceTime) }}</p>
          </div>
          <div class="photo-container">
            <img 
              v-if="currentPhoto" 
              :src="currentPhoto" 
              :alt="selectedCourse?.name + ' 签到照片'"
              @error="handleImageError"
            />
            <div v-else class="no-photo">
              <p>暂无签到照片</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api'

export default {
  name: 'AdminTeaching',
  data() {
    return {
      loading: true,
      courses: [],
      statistics: {
        totalCourses: 0,
        todayAttendance: 0,
        attendanceRate: 0,
        totalTeachers: 0
      },
      searchQuery: '',
      selectedStatus: '',
      selectedDate: '',
      pagination: {
        current: 1,
        pages: 1,
        total: 0,
        pageSize: 12
      },
      showPhotoModal: false,
      selectedCourse: null,
      currentPhoto: null
    }
  },
  computed: {
    filteredCourses() {
      // 确保courses是数组
      if (!Array.isArray(this.courses)) {
        console.warn('courses is not an array:', this.courses)
        return []
      }
      
      let filtered = this.courses

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(course => 
          course && course.name && course.teacherName &&
          (course.name.toLowerCase().includes(query) ||
          course.teacherName.toLowerCase().includes(query))
        )
      }

      if (this.selectedStatus) {
        filtered = filtered.filter(course => 
          course && course.attendanceStatus === this.selectedStatus
        )
      }

      if (this.selectedDate) {
        filtered = filtered.filter(course => 
          course && course.date === this.selectedDate
        )
      }

      return filtered
    }
  },
  async mounted() {
    await this.initData()
  },
  methods: {
    async initData() {
      try {
        this.loading = true
        await Promise.all([
          this.loadCourses(),
          this.loadStatistics()
        ])
      } catch (error) {
        console.error('初始化数据失败:', error)
        this.$message?.error('加载数据失败：' + error.message)
      } finally {
        this.loading = false
      }
    },

    async loadCourses() {
      try {
        const params = {
          page: this.pagination.current,
          pageSize: this.pagination.pageSize
        }
        
        // 只有用户选择了日期才添加日期参数
        if (this.selectedDate) {
          params.date = this.selectedDate
        }
        
        const response = await api.teaching.getCourses(params)
        
        // 确保courses始终是数组
        if (response && response.data && Array.isArray(response.data)) {
          this.courses = response.data
        } else if (response && Array.isArray(response)) {
          this.courses = response
        } else {
          this.courses = []
        }
        
        this.pagination = {
          ...this.pagination,
          total: response.total || 0,
          pages: Math.ceil((response.total || 0) / this.pagination.pageSize)
        }
      } catch (error) {
        console.error('加载课程列表失败:', error)
        this.courses = [] // 确保错误时courses是空数组
        throw error
      }
    },



    async loadStatistics() {
      try {
        const response = await api.teaching.getStatistics()
        this.statistics = response.data || this.statistics
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    },

    async refreshData() {
      await this.initData()
      this.$message?.success('数据已刷新')
    },

    handleSearch() {
      // 搜索功能在计算属性中处理
    },

    async handleFilter() {
      this.pagination.current = 1
      await this.loadCourses()
    },

    async changePage(page) {
      this.pagination.current = page
      await this.loadCourses()
    },

    viewCourseDetail(course) {
      this.$router.push({
        name: 'CourseDetail',
        params: { id: course.id }
      })
    },

    async viewAttendancePhoto(course) {
      try {
        this.selectedCourse = course
        this.showPhotoModal = true
        
        if (course.attendancePhotoUrl) {
          this.currentPhoto = course.attendancePhotoUrl
        } else {
          // 获取签到照片
          const response = await api.teaching.getAttendancePhoto(course.id)
          this.currentPhoto = response.photoUrl
        }
      } catch (error) {
        console.error('获取签到照片失败:', error)
        this.currentPhoto = null
      }
    },

    closePhotoModal() {
      this.showPhotoModal = false
      this.selectedCourse = null
      this.currentPhoto = null
    },

    handleImageError() {
      this.currentPhoto = null
    },

    getCardClass(course) {
      return {
        'card-completed': course.attendanceStatus === 'completed',
        'card-pending': course.attendanceStatus === 'pending',
        'card-late': course.attendanceStatus === 'late'
      }
    },

    getStatusText(status) {
      const statusMap = {
        completed: '已签到',
        pending: '未签到',
        late: '迟到'
      }
      return statusMap[status] || '未知'
    },

    formatCourseTime(course) {
      return `${course.date} ${course.startTime}-${course.endTime}`
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleString('zh-CN')
    },

    getCurrentDate() {
      return new Date().toISOString().split('T')[0]
    }
  }
}
</script>

<style scoped>
.admin-teaching {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 36px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f9ff;
  border-radius: 50%;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  font-size: 24px;
  color: #409eff;
  font-weight: bold;
}

.stat-content p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* 搜索和筛选 */
.search-filter {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.icon-search {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #909399;
}

.filter-group {
  display: flex;
  gap: 10px;
}

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

/* 课程列表 */
.course-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 20px;
}

.course-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
  background: #fafafa;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card-completed {
  border-left: 4px solid #67c23a;
}

.card-pending {
  border-left: 4px solid #e6a23c;
}

.card-late {
  border-left: 4px solid #f56c6c;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.course-info h3 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 16px;
}

.course-code {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status-completed {
  background-color: #f0f9ff;
  color: #67c23a;
}

.status-pending {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.status-late {
  background-color: #fef0f0;
  color: #f56c6c;
}

.course-details {
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-row .label {
  color: #909399;
  font-weight: 500;
}

.detail-row .value {
  color: #303133;
}

.course-actions {
  display: flex;
  gap: 10px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-info {
  color: #606266;
  font-size: 14px;
}

/* 照片模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.photo-modal {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.modal-header h3 {
  margin: 0;
  color: #303133;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #909399;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.photo-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.photo-info p {
  margin: 5px 0;
  font-size: 14px;
}

.photo-container {
  text-align: center;
}

.photo-container img {
  max-width: 100%;
  max-height: 500px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-photo {
  padding: 60px;
  color: #909399;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #337ecc;
}

.btn-secondary {
  background-color: #909399;
  color: white;
}

.btn-secondary:hover {
  background-color: #767a82;
}

.btn-info {
  background-color: #909399;
  color: white;
}

.btn-info:hover {
  background-color: #767a82;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 图标样式 */
.icon-refresh::before {
  content: '🔄';
}

.icon-search::before {
  content: '🔍';
}
</style>
