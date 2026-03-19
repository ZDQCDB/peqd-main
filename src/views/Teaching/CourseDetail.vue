<template>
  <div class="course-detail">
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary" @click="$router.push('/teaching/admin')">
          ← 返回课程列表
        </button>
        <h1>课程详情</h1>
      </div>
      <div class="header-right">
        <button class="btn btn-primary" @click="refreshData">
          <i class="icon-refresh"></i> 刷新
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="!course" class="error-state">
      
      <p>课程不存在或已被删除</p>
    </div>

    <div v-else class="content">
      <!-- 课程基本信息 -->
      <div class="course-info-card">
        <div class="card-header">
          <h2>课程信息</h2>
          <span :class="'status-badge status-' + course.attendanceStatus">
            {{ getStatusText(course.attendanceStatus) }}
          </span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">课程名称：</span>
            <span class="value">{{ course.name }}</span>
          </div>

          <div class="info-item">
            <span class="label">授课教师：</span>
            <span class="value">{{ course.teacherName }}</span>
          </div>


          <div class="info-item">
            <span class="label">上课时间：</span>
            <span class="value">{{ formatCourseTime(course) }}</span>
          </div>
          <div class="info-item">
            <span class="label">上课地点：</span>
            <span class="value">{{ course.location }}</span>
          </div>

        </div>
      </div>

      <!-- 签到信息 -->
      <div class="attendance-card">
        <div class="card-header">
          <h2>签到信息</h2>
          <div v-if="course.attendanceStatus === 'completed'" class="attendance-actions">
            <button 
              class="btn btn-info btn-sm"
              @click="downloadAttendanceReport"
            >
              下载签到报告
            </button>
          </div>
        </div>
        
        <div v-if="course.attendanceStatus === 'pending'" class="no-attendance">
          <div class="no-attendance-icon">⏰</div>
          <p>教师尚未签到</p>
          <small>预计上课时间：{{ formatCourseTime(course) }}</small>
        </div>
        
        <div v-else class="attendance-info">
          <div class="attendance-grid">
            <div class="attendance-item">
              <span class="label">签到时间：</span>
              <span class="value">{{ formatTime(course.attendanceTime) }}</span>
            </div>
            <div class="attendance-item">
              <span class="label">签到状态：</span>
              <span :class="'status-text status-' + course.attendanceStatus">
                {{ getStatusText(course.attendanceStatus) }}
              </span>
            </div>
            <div v-if="course.attendanceStatus === 'late'" class="attendance-item">
              <span class="label">迟到时长：</span>
              <span class="value late-duration">{{ calculateLateDuration(course) }}</span>
            </div>
            <div class="attendance-item">
              <span class="label">签到位置：</span>
              <span class="value">{{ course.attendanceLocation || '未记录' }}</span>
            </div>
            <div v-if="course.attendanceNote" class="attendance-item full-width">
              <span class="label">签到备注：</span>
              <span class="value">{{ course.attendanceNote }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 签到照片 -->
      <div v-if="course.attendanceStatus === 'completed'" class="photo-card">
        <div class="card-header">
          <h2>签到照片</h2>
          <div class="photo-actions">
            <button 
              v-if="attendancePhotos.length > 0"
              class="btn btn-info btn-sm"
              @click="downloadAllPhotos"
            >
              下载所有照片
            </button>
          </div>
        </div>
        
        <div v-if="loadingPhotos" class="loading-photos">
          <div class="spinner-sm"></div>
          <p>加载照片中...</p>
        </div>
        
        <div v-else-if="attendancePhotos.length === 0" class="no-photos">
          <div class="no-photos-icon">📷</div>
          <p>暂无签到照片</p>
        </div>
        
        <div v-else class="photos-grid">
          <div 
            v-for="(photo, index) in attendancePhotos" 
            :key="photo.id"
            class="photo-item"
            @click="viewPhoto(photo, index)"
          >
            <img 
              :src="photo.thumbnailUrl || photo.url" 
              :alt="`签到照片 ${index + 1}`"
              @error="handleImageError(photo)"
            />
            <div class="photo-overlay">
              <div class="photo-info">
                <p class="photo-time">{{ formatTime(photo.uploadTime) }}</p>
                <p class="photo-size">{{ formatFileSize(photo.size) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 课程历史 -->
      <div class="history-card">
        <div class="card-header">
          <h2>签到历史</h2>
          <select v-model="historyPeriod" @change="loadAttendanceHistory">
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="semester">本学期</option>
          </select>
        </div>
        
        <div v-if="loadingHistory" class="loading-history">
          <div class="spinner-sm"></div>
          <p>加载历史记录...</p>
        </div>
        
        <div v-else-if="attendanceHistory.length === 0" class="no-history">
          <p>暂无历史记录</p>
        </div>
        
        <div v-else class="history-table">
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>时间</th>
                <th>签到时间</th>
                <th>状态</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in attendanceHistory" :key="record.id">
                <td>{{ formatDate(record.date) }}</td>
                <td>{{ record.startTime }}-{{ record.endTime }}</td>
                <td>{{ formatTime(record.attendanceTime) }}</td>
                <td>
                  <span :class="'status-badge status-' + record.status">
                    {{ getStatusText(record.status) }}
                  </span>
                </td>
                <td>{{ record.note || '-' }}</td>
                <td>
                  <button 
                    v-if="record.status === 'completed'"
                    class="btn btn-link btn-sm"
                    @click="viewHistoryDetail(record)"
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 照片查看器 -->
    <div v-if="showPhotoViewer" class="photo-viewer-overlay" @click="closePhotoViewer">
      <div class="photo-viewer" @click.stop>
        <div class="viewer-header">
          <h3>签到照片 {{ currentPhotoIndex + 1 }} / {{ attendancePhotos.length }}</h3>
          <button class="close-btn" @click="closePhotoViewer">×</button>
        </div>
        <div class="viewer-body">
          <button 
            v-if="attendancePhotos.length > 1"
            class="nav-btn prev-btn"
            @click="prevPhoto"
            :disabled="currentPhotoIndex <= 0"
          >
            ‹
          </button>
          <div class="photo-container">
            <img 
              :src="currentPhoto.url" 
              :alt="`签到照片 ${currentPhotoIndex + 1}`"
              @error="handleImageError(currentPhoto)"
            />
          </div>
          <button 
            v-if="attendancePhotos.length > 1"
            class="nav-btn next-btn"
            @click="nextPhoto"
            :disabled="currentPhotoIndex >= attendancePhotos.length - 1"
          >
            ›
          </button>
        </div>
        <div class="viewer-footer">
          <div class="photo-details">
            <p><strong>上传时间：</strong>{{ formatTime(currentPhoto.uploadTime) }}</p>
            <p><strong>文件大小：</strong>{{ formatFileSize(currentPhoto.size) }}</p>
            <p v-if="currentPhoto.location"><strong>拍摄位置：</strong>{{ currentPhoto.location }}</p>
          </div>
          <div class="viewer-actions">
            <button class="btn btn-primary btn-sm" @click="downloadPhoto(currentPhoto)">
              下载照片
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api'
import { processPhotoUrls } from '@/utils/urlHelper'

export default {
  name: 'CourseDetail',
  data() {
    return {
      loading: true,
      loadingPhotos: false,
      loadingHistory: false,
      course: null,
      attendancePhotos: [],
      attendanceHistory: [],
      historyPeriod: 'month',
      showPhotoViewer: false,
      currentPhotoIndex: 0,
      currentPhoto: null
    }
  },
  async mounted() {
    await this.initData()
  },
  methods: {
    async initData() {
      try {
        this.loading = true
        const courseId = this.$route.params.id
        await Promise.all([
          this.loadCourseDetail(courseId),
          this.loadAttendancePhotos(courseId),
          this.loadAttendanceHistory()
        ])
      } catch (error) {
        console.error('初始化数据失败:', error)
        this.$message?.error('加载数据失败：' + error.message)
      } finally {
        this.loading = false
      }
    },

    async loadCourseDetail(courseId) {
      try {
        const response = await api.teaching.getCourse(courseId)
        this.course = response.data
      } catch (error) {
        console.error('加载课程详情失败:', error)
        throw error
      }
    },

    async loadAttendancePhotos(courseId) {
      if (!courseId) return
      
      try {
        this.loadingPhotos = true
        const response = await api.teaching.getAttendancePhotos(courseId)
        // 处理照片URL，将相对路径转换为完整URL
        this.attendancePhotos = processPhotoUrls(response.data || [])
      } catch (error) {
        console.error('加载签到照片失败:', error)
        this.attendancePhotos = []
      } finally {
        this.loadingPhotos = false
      }
    },

    async loadAttendanceHistory() {
      if (!this.course) return
      
      try {
        this.loadingHistory = true
        const params = {
          courseId: this.course.id,
          period: this.historyPeriod
        }
        const response = await api.teaching.getAttendanceHistory(params)
        this.attendanceHistory = response.data || []
      } catch (error) {
        console.error('加载签到历史失败:', error)
        this.attendanceHistory = []
      } finally {
        this.loadingHistory = false
      }
    },

    async refreshData() {
      await this.initData()
      this.$message?.success('数据已刷新')
    },

    viewPhoto(photo, index) {
      this.currentPhoto = photo
      this.currentPhotoIndex = index
      this.showPhotoViewer = true
    },

    closePhotoViewer() {
      this.showPhotoViewer = false
      this.currentPhoto = null
      this.currentPhotoIndex = 0
    },

    prevPhoto() {
      if (this.currentPhotoIndex > 0) {
        this.currentPhotoIndex--
        this.currentPhoto = this.attendancePhotos[this.currentPhotoIndex]
      }
    },

    nextPhoto() {
      if (this.currentPhotoIndex < this.attendancePhotos.length - 1) {
        this.currentPhotoIndex++
        this.currentPhoto = this.attendancePhotos[this.currentPhotoIndex]
      }
    },

    async downloadPhoto(photo) {
      try {
        const response = await api.file.download(photo.fileName, photo.originalName)
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        link.download = photo.originalName || `签到照片_${Date.now()}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('下载照片失败:', error)
        this.$message?.error('下载失败')
      }
    },

    async downloadAllPhotos() {
      try {
        const response = await api.teaching.downloadAttendancePhotos(this.course.id)
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        link.download = `${this.course.name}_签到照片.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('下载照片压缩包失败:', error)
        this.$message?.error('下载失败')
      }
    },

    async downloadAttendanceReport() {
      try {
        const response = await api.teaching.downloadAttendanceReport(this.course.id)
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        link.download = `${this.course.name}_签到报告.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('下载签到报告失败:', error)
        this.$message?.error('下载失败')
      }
    },

    viewHistoryDetail(record) {
      this.$router.push({
        name: 'CourseDetail',
        params: { id: record.courseId },
        query: { date: record.date }
      })
    },

    handleImageError(photo) {
      console.error('图片加载失败:', photo)
      photo.error = true
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
      if (!timestamp) return '-'
      return new Date(timestamp).toLocaleString('zh-CN')
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString('zh-CN')
    },

    formatFileSize(bytes) {
      if (!bytes) return '-'
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    },

    calculateLateDuration(course) {
      if (!course.attendanceTime || !course.startTime) return '-'
      
      const courseStartTime = new Date(`${course.date} ${course.startTime}`)
      const attendanceTime = new Date(course.attendanceTime)
      const diffMinutes = Math.floor((attendanceTime - courseStartTime) / (1000 * 60))
      
      if (diffMinutes <= 0) return '-'
      
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      
      if (hours > 0) {
        return `${hours}小时${minutes}分钟`
      }
      return `${minutes}分钟`
    }
  }
}
</script>

<style scoped>
.course-detail {
  padding: 20px;
  background: var(--bg-body);
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
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  margin: 0;
  color: #000000d9;
  font-size: 24px;
}

.loading, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
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

.spinner-sm {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 卡片样式 */
.course-info-card,
.attendance-card,
.photo-card,
.history-card {
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-light);
  background-color: #fafafa;
}

.card-header h2 {
  margin: 0;
  color: #000000d9;
  font-size: 18px;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  padding: 20px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  font-weight: 500;
  color: #00000073;
  width: 100px;
  flex-shrink: 0;
}

.info-item .value {
  color: #000000d9;
  flex: 1;
}

/* 状态样式 */
.status-badge {
  padding: 4px 12px;
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

.status-text {
  font-weight: 500;
}

.late-duration {
  color: #f56c6c;
  font-weight: 500;
}

/* 签到信息 */
.no-attendance {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.no-attendance-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.attendance-info {
  padding: 20px;
}

.attendance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.attendance-item {
  display: flex;
  align-items: center;
}

.attendance-item.full-width {
  grid-column: 1 / -1;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.attendance-item .label {
  font-weight: 500;
  color: #00000073;
  width: 80px;
  flex-shrink: 0;
}

.attendance-item .value {
  color: #000000d9;
  flex: 1;
}

/* 照片网格 */
.loading-photos,
.no-photos {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.no-photos-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 20px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.3s;
}

.photo-item:hover {
  transform: scale(1.05);
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 10px;
  transform: translateY(100%);
  transition: transform 0.3s;
}

.photo-item:hover .photo-overlay {
  transform: translateY(0);
}

.photo-info p {
  margin: 2px 0;
  font-size: 12px;
}

/* 历史记录表格 */
.loading-history,
.no-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.history-table {
  overflow-x: auto;
}

.history-table table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
}

.history-table th {
  background-color: #fafafa;
  font-weight: 500;
  color: #00000073;
}

.history-table td {
  color: #000000d9;
}

/* 照片查看器 */
.photo-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.photo-viewer {
  background: white;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-light);
}

.viewer-header h3 {
  margin: 0;
  color: #000000d9;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #00000040;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-body {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.photo-container {
  max-width: 800px;
  max-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-container img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.7);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.viewer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid var(--border-light);
  background-color: #fafafa;
}

.photo-details p {
  margin: 2px 0;
  font-size: 14px;
  color: #00000073;
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
  background-color: #1677ff;
  color: white;
}

.btn-primary:hover {
  background-color: #337ecc;
}

.btn-secondary {
  background-color: #00000040;
  color: white;
}

.btn-secondary:hover {
  background-color: #767a82;
}

.btn-info {
  background-color: #00000040;
  color: white;
}

.btn-info:hover {
  background-color: #767a82;
}

.btn-link {
  background: none;
  color: #1677ff;
  padding: 4px 8px;
}

.btn-link:hover {
  color: #337ecc;
  text-decoration: underline;
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

/* 响应式 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .attendance-grid {
    grid-template-columns: 1fr;
  }
  
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
