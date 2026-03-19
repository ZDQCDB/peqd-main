<template>
  <div class="listening-management">
    <!-- 顶部导航栏 -->
    <header class="page-header">
      <div class="header-container">
        <div class="header-left">
          <button class="back-btn" @click="$router.push('/dashboard')">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            返回桌面
          </button>
          <div class="page-info">
            <h1 class="page-title">听课管理系统</h1>
            <p class="page-subtitle">Teaching Observation Management</p>
          </div>
          <div class="role-indicator">
            <span class="role-badge premium">{{ getRoleText(userRole) }}</span>
          </div>
        </div>
        
        <div class="header-actions">
          <button v-if="canCreateObservation" class="action-btn primary" @click="showCreateObservationModal">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
              <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
            </svg>
            新建听课记录
          </button>
          <button v-if="isSchoolAdmin" class="action-btn secondary" @click="showTemplateManagement">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="18" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
              <line x1="9" y1="15" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
            </svg>
            模板管理
          </button>
          <button class="action-btn refresh" @click="refreshData">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 3v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="content-container">
        
        <!-- 统计面板 (仅管理员可见) -->
        <section v-if="isAdminUser" class="statistics-section">
          <div class="stats-grid">
            <div class="stat-card observations">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>听课记录总数</h3>
                <p class="stat-number">{{ statistics.totalObservations }}</p>
                <span class="stat-label">累计观摩记录</span>
              </div>
            </div>
            
            <div class="stat-card monthly">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>本月听课数</h3>
                <p class="stat-number">{{ statistics.thisMonthCount }}</p>
                <span class="stat-label">当月活动次数</span>
              </div>
            </div>
            
            <div class="stat-card teachers">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>教师总数</h3>
                <p class="stat-number">{{ statistics.teacherCount }}</p>
                <span class="stat-label">参与教师数量</span>
              </div>
            </div>
            
            <div class="stat-card files">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>评价文件数</h3>
                <p class="stat-number">{{ statistics.evaluationFiles }}</p>
                <span class="stat-label">存档文档数量</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 功能导航 -->
        <section class="function-section">
          <div class="function-tabs">
            <button 
              class="tab-btn"
              :class="{ active: activeTab === 'observations' }"
              @click="activeTab = 'observations'"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
              </svg>
              听课记录
            </button>
            <button 
              v-if="isSchoolAdmin"
              class="tab-btn"
              :class="{ active: activeTab === 'templates' }"
              @click="activeTab = 'templates'"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="18" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="15" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
              模板管理
            </button>
          </div>
        </section>

    <!-- 听课记录管理 -->
    <div v-show="activeTab === 'observations'" class="tab-content">
      <div class="content-header">
        <h3>听课记录管理</h3>
        <div v-if="!isAdminUser" class="permission-notice">
          <span class="notice-text">📋 您只能查看自己作为听课者的听课记录</span>
        </div>
        <div class="filters">
          <input 
            type="text" 
            v-model="filters.keyword" 
            placeholder="搜索教师、课程..."
            @input="debounceSearch"
          />
          <select v-model="filters.departmentId" @change="loadObservations">
            <option value="">全部院系</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
          <input type="date" v-model="filters.startDate" @change="loadObservations" />
          <input type="date" v-model="filters.endDate" @change="loadObservations" />
        </div>
      </div>
      
      <div class="observations-table">
        <table>
          <thead>
            <tr>
              <th>课程信息</th>
              <th>教师</th>
              <th>听课者</th>
              <th>听课时间</th>
              <th>文件状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="obs in observations" :key="obs.id">
              <td>
                <div class="course-info">
                  <strong>{{ obs.course_name || '未命名课程' }}</strong>
                  <div class="course-meta">
                    {{ obs.class_name }}<br>
                    {{ formatDate(obs.class_date) }}
                  </div>
                </div>
              </td>
              <td>{{ obs.teacher_name }}</td>
              <td>
                <div class="observer-info">
                  {{ obs.observer_name }}
                  <span class="observer-type">({{ getRoleText(obs.observer_type) }})</span>
                </div>
              </td>
              <td>{{ formatDateTime(obs.created_at) }}</td>
              <td>
                <div class="file-status">
                  <span v-if="obs.evaluation_file" class="status-badge file-uploaded">
                    📄 已提交评价
                  </span>
                  <span v-if="obs.video_file" class="status-badge video-uploaded">
                    🎥 已提交视频
                  </span>
                  <span v-if="!obs.evaluation_file && !obs.video_file" class="status-badge no-files">
                    ⏳ 待提交
                  </span>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-info btn-small" @click="viewObservation(obs)">
                    👁️ 查看
                  </button>
                  <button 
                    v-if="canEditObservation(obs)"
                    class="btn btn-warning btn-small" 
                    @click="uploadFiles(obs)"
                  >
                    📤 上传文件
                  </button>
                  <button 
                    v-if="obs.video_file"
                    class="btn btn-success btn-small" 
                    @click="playVideo(obs)"
                  >
                    🎥 播放视频
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="loading" class="loading">
          加载中...
        </div>
      
        <div v-if="!loading && observations.length === 0" class="no-data">
          暂无听课记录
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="pagination.total > 0">
        <button 
          class="btn btn-secondary"
          :disabled="pagination.page <= 1"
          @click="changePage(pagination.page - 1)"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ pagination.page }} 页，共 {{ pagination.totalPages }} 页，共 {{ pagination.total }} 条记录
        </span>
        <button 
          class="btn btn-secondary"
          :disabled="pagination.page >= pagination.totalPages"
          @click="changePage(pagination.page + 1)"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 模板管理 (仅校级管理员可见) -->
    <div v-show="activeTab === 'templates'" class="tab-content">
      <div class="content-header">
        <h3>听课模板管理</h3>
        <button class="btn btn-primary" @click="uploadTemplate">
          📤 上传新模板
        </button>
      </div>

      <div class="templates-grid">
        <div v-for="template in templates" :key="template.id" class="template-card">
          <div class="file-icon">
            <i :class="getFileIcon(template.file_type)"></i>
          </div>
          <div class="file-info">
            <h4>{{ template.name }}</h4>
            <p>{{ formatFileSize(template.file_size) }}</p>
            <p>{{ formatDateTime(template.uploaded_at) }}</p>
            <p v-if="template.is_default" class="default-badge">默认模板</p>
          </div>
          <div class="file-actions">
            <button class="btn btn-info btn-small" @click="downloadTemplate(template)">
              📥 下载
            </button>
            <button 
              v-if="!template.is_default"
              class="btn btn-warning btn-small" 
              @click="setDefaultTemplate(template)"
            >
              ⭐ 设为默认
            </button>
            <button 
              class="btn btn-danger btn-small" 
              @click="deleteTemplate(template)"
            >
              🗑️ 删除
            </button>
          </div>
        </div>
      </div>

      <input 
        type="file" 
        ref="templateInput"
        @change="handleTemplateUpload"
        style="display: none"
      />
    </div>

    <!-- 新建听课记录模态框 -->
    <div v-if="showObservationModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新建听课记录</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveObservation">
            <div class="form-group">
              <label>课程上课日期 *</label>
              <input type="date" v-model="observationForm.class_date" required />
            </div>
            <div class="form-group">
              <label>搜索课程</label>
              <div class="course-search">
                <input 
                  type="text" 
                  v-model="courseSearchKeyword" 
                  placeholder="输入教师姓名或课程名称搜索"
                  @input="debounceCourseSearch"
                />
                <div v-if="filteredCourses.length > 0" class="course-suggestions">
                  <div 
                    v-for="course in filteredCourses" 
                    :key="course.id"
                    class="course-item"
                    @click="selectCourse(course)"
                  >
                    <strong>{{ course.course_name }}</strong> - {{ course.teacher_name }}<br>
                    <small>{{ course.class_name }} | {{ course.classroom }}</small>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="observationForm.course_id" class="selected-course">
              <h4>已选择课程：</h4>
              <p><strong>{{ selectedCourse.course_name }}</strong></p>
              <p>教师：{{ selectedCourse.teacher_name }}</p>
              <p>班级：{{ selectedCourse.class_name }}</p>
              <p>教室：{{ selectedCourse.classroom }}</p>
            </div>
          </form>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModals">取消</button>
          <button class="btn btn-primary" @click="saveObservation" :disabled="saving || !observationForm.course_id || !observationForm.class_date">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 查看详情模态框 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>听课记录详情</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body" v-if="currentObservation">
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>课程名称:</label>
                <span>{{ currentObservation.course_name }}</span>
              </div>
              <div class="detail-item">
                <label>授课教师:</label>
                <span>{{ currentObservation.teacher_name }}</span>
              </div>
              <div class="detail-item">
                <label>听课者:</label>
                <span>{{ currentObservation.observer_name }}</span>
              </div>
              <div class="detail-item">
                <label>班级:</label>
                <span>{{ currentObservation.class_name }}</span>
              </div>
              <div class="detail-item">
                <label>上课日期:</label>
                <span>{{ formatDate(currentObservation.class_date) }}</span>
              </div>
              <div class="detail-item">
                <label>教室:</label>
                <span>{{ currentObservation.classroom }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="currentObservation.evaluation_file" class="detail-section">
            <h4>评价文件</h4>
            <div class="file-item">
              <i :class="getFileIcon(currentObservation.evaluation_file.type)"></i>
              <span>{{ currentObservation.evaluation_file.name }}</span>
              <button class="btn btn-info btn-small" @click="downloadFile(currentObservation.evaluation_file)">
                📥 下载
              </button>
            </div>
          </div>
          
          <div v-if="currentObservation.video_file" class="detail-section">
            <h4>听课视频</h4>
            <div class="video-section">
              <video controls :src="currentObservation.video_file.url" style="width: 100%; max-height: 400px;">
                您的浏览器不支持视频播放
              </video>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModals">关闭</button>
        </div>
      </div>
    </div>

    <!-- 文件上传模态框 -->
    <div v-if="showFileUploadModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>上传听课文件</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div class="upload-section">
            <div class="template-download">
              <h4>1. 下载听课评价模板</h4>
              <button class="btn btn-info" @click="downloadEvaluationTemplate">
                📥 下载模板
              </button>
              <p class="help-text">请先下载模板，填写完成后上传评价文件</p>
            </div>
            
            <div class="file-upload">
              <h4>2. 上传评价文件</h4>
              <input 
                type="file" 
                ref="evaluationFileInput"
                @change="handleEvaluationFileUpload"
                accept=".xlsx,.xls,.pdf,.doc,.docx"
                style="display: none"
              />
              <div class="upload-area" @click="$refs.evaluationFileInput.click()">
                <div class="upload-icon">📄</div>
                <p>点击选择评价文件</p>
                <p class="upload-hint">支持Excel、PDF、Word格式，最大50MB</p>
              </div>
            </div>
            
            <div class="video-upload">
              <h4>3. 上传听课视频（可选）</h4>
              <input 
                type="file" 
                ref="videoFileInput"
                @change="handleVideoFileUpload"
                accept="video/*"
                style="display: none"
              />
              <div class="upload-area" @click="$refs.videoFileInput.click()">
                <div class="upload-icon">🎥</div>
                <p>点击选择视频文件</p>
                <p class="upload-hint">支持MP4、AVI、MOV等格式，最大500MB</p>
              </div>
            </div>
            
            <div v-if="uploadProgress > 0" class="upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <p>上传进度：{{ uploadProgress }}%</p>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModals">关闭</button>
        </div>
      </div>
    </div>

    <!-- 视频播放模态框 -->
    <div v-if="showVideoModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>听课视频</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div class="video-player">
            <video 
              controls 
              :src="`http://192.168.1.103:9999${currentVideoUrl.replace(/^\/api/, '')}`" 
              style="width: 100%; max-height: 500px;"
            >
              您的浏览器不支持视频播放
            </video>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModals">关闭</button>
        </div>
      </div>
    </div>

      </div>
    </main>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'
import authService from '@/services/authService'
import { 
  hasRole,
  isAdmin,
  isSuperAdmin,
  isStudent,
  isTeacher,
  isSchoolAdmin
} from '@/utils/permissionManager'

export default {
  name: 'ListeningManagement',
  setup() {
    // 响应式数据
    const userRole = ref('')
    const currentUserId = ref(null)
    const activeTab = ref('observations')
    const loading = ref(false)
    const saving = ref(false)
    const uploadProgress = ref(0)

    // 模态框显示状态
    const showObservationModal = ref(false)
    const showDetailModal = ref(false)
    const showFileUploadModal = ref(false)
    const showVideoModal = ref(false)

    // 数据列表
    const observations = ref([])
    const courses = ref([])
    const departments = ref([])
    const templates = ref([])
    const filteredCourses = ref([])

    // 当前选中项
    const currentObservation = ref(null)
    const currentVideoUrl = ref('')
    const selectedCourse = ref(null)

    // 搜索
    const courseSearchKeyword = ref('')

    // 模板上传的ref
    const templateInput = ref(null)

    // 统计数据
    const statistics = reactive({
      totalObservations: 0,
      thisMonthCount: 0,
      teacherCount: 0,
      evaluationFiles: 0
    })

    // 筛选条件
    const filters = reactive({
      keyword: '',
      departmentId: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10
    })

    // 分页信息
    const pagination = reactive({
      page: 1,
      total: 0,
      totalPages: 0
    })

    // 表单数据
    const observationForm = reactive({
      class_date: '',
      course_id: null
    })

    // 计算属性
    const isAdminUser = computed(() => {
      // 首先尝试使用权限管理器
      const permissionResult = isAdmin()
      if (permissionResult) {
        return true
      }
      
      // 如果权限管理器没有正确初始化，使用本地的用户角色作为备选
      const adminRoles = ['department_admin', 'school_admin', 'super_admin']
      return adminRoles.includes(userRole.value)
    })

    const isSchoolAdmin = computed(() => {
      return userRole.value === 'school_admin' || isSuperAdmin()
    })

    const canCreateObservation = computed(() => {
      return isTeacher() || isAdmin()
    })

    // 方法
    const getUserInfo = async () => {
      try {
        const user = await authService.getCurrentUser()
        if (user) {
          userRole.value = user.userType
          currentUserId.value = user.id
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }

    const loadObservations = async () => {
      loading.value = true
      try {
        const params = {
          ...filters,
          page: pagination.page
        }
        
        // 管理员可以查看所有记录，教师只能查看自己作为听课者的记录
        const response = isAdminUser.value 
          ? await api.listening.getAdminObservations(params)
          : await api.listening.getObservations(params)
        

        
        if (response.data && response.data.code === 200) {
          const data = response.data.data
          // 后端返回的是 data.list，不是 data.items
          observations.value = data.list || data.items || data || []
          pagination.total = data.total || 0
          pagination.totalPages = Math.ceil((data.total || 0) / (data.limit || 10))
        } else if (response.data) {
          // 如果响应直接包含数据
          observations.value = response.data.list || response.data.items || response.data || []
          pagination.total = response.data.total || 0
          pagination.totalPages = Math.ceil((response.data.total || 0) / (response.data.limit || 10))
        }
      } catch (error) {
        console.error('获取听课记录失败:', error)
      } finally {
        loading.value = false
      }
    }

    const loadStatistics = async () => {
      if (!isAdminUser.value) return
      
      try {
        const response = await api.listening.getAdminStats({
          start_date: filters.startDate,
          end_date: filters.endDate,
          department_id: filters.departmentId
        })
        

        
        const data = response.data && response.data.code === 200 
          ? response.data.data 
          : response.data
          
        if (data) {
          Object.assign(statistics, {
            totalObservations: data.total_observations || 0,
            thisMonthCount: data.this_month_count || 0,
            teacherCount: data.teacher_count || 0,
            evaluationFiles: data.evaluation_files || 0
          })
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      }
    }

    const loadDepartments = async () => {
      try {
        const response = await api.listening.getDepartments()
        

        
        const data = response.data && response.data.code === 200 
          ? response.data.data 
          : response.data
          
        if (data) {
          departments.value = data
        }
      } catch (error) {
        console.error('获取院系列表失败:', error)
      }
    }

    const loadTemplates = async () => {
      if (!isSchoolAdmin.value) return
      
      try {
        const response = await api.listening.getTemplates()
        

        
        const data = response.data && response.data.code === 200 
          ? response.data.data 
          : response.data
          
        if (data) {
          templates.value = data
        }
      } catch (error) {
        console.error('获取模板列表失败:', error)
      }
    }

    const searchCourses = async () => {
      if (!courseSearchKeyword.value.trim() || !observationForm.class_date) {
        filteredCourses.value = []
        return
      }

      try {
        const response = await api.listening.searchCourses({
          keyword: courseSearchKeyword.value,
          date: observationForm.class_date
        })
        
        if (response.data && response.data.code === 200) {
          filteredCourses.value = response.data.data || []
        } else if (response.data) {
          filteredCourses.value = response.data
        }
      } catch (error) {
        console.error('搜索课程失败:', error)
        filteredCourses.value = []
      }
    }

    const selectCourse = (course) => {
      observationForm.course_id = course.id
      selectedCourse.value = course
      filteredCourses.value = []
      courseSearchKeyword.value = `${course.course_name} - ${course.teacher_name}`
    }

    const refreshData = () => {
      loadObservations()
      loadStatistics()
      if (activeTab.value === 'templates') {
        loadTemplates()
      }
    }

    const showCreateObservationModal = () => {
      resetObservationForm()
      showObservationModal.value = true
    }

    const showTemplateManagement = () => {
      activeTab.value = 'templates'
      loadTemplates()
    }

    const resetObservationForm = () => {
      Object.assign(observationForm, {
        class_date: '',
        course_id: null
      })
      courseSearchKeyword.value = ''
      selectedCourse.value = null
      filteredCourses.value = []
    }

    const saveObservation = async () => {
      saving.value = true
      try {
        const response = await api.listening.createObservation(observationForm)
        
        window.location.reload()
      } catch (error) {
        console.error('保存听课记录失败:', error)
        alert('创建失败，请重试')
      } finally {
        saving.value = false
      }
    }

    const viewObservation = (observation) => {
      currentObservation.value = observation
      showDetailModal.value = true
    }

    const uploadFiles = (observation) => {
      currentObservation.value = observation
      showFileUploadModal.value = true
    }

    const canEditObservation = (observation) => {
      if (!observation) return false
      return (
        observation.observer_id === currentUserId.value ||
        isAdmin()
      )
    }

    const playVideo = (observation) => {
      currentVideoUrl.value = observation.video_file.url
      showVideoModal.value = true
    }

    const downloadEvaluationTemplate = async () => {
      // 直接执行下载，不处理错误
      const response = await api.listening.downloadDefaultTemplate()
      
      // 确保数据是正确的 Blob 格式
      let blob
      if (response instanceof Blob) {
        blob = response
      } else if (response.data instanceof Blob) {
        blob = response.data
      } else {
        // 手动创建 Blob
        blob = new Blob([response], { type: 'application/octet-stream' })
      }
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = '听课评价表模板.docx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    const handleEvaluationFileUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      if (file.size > 50 * 1024 * 1024) {
        alert('评价文件大小不能超过50MB')
        return
      }

      const formData = new FormData()
      formData.append('evaluation_file', file)

      try {
        uploadProgress.value = 0
        
        // 添加上传进度监听
        const config = {
          onUploadProgress: (progressEvent) => {
            uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        }
        
        const response = await api.listening.uploadEvaluationFile(currentObservation.value.id, formData)

        window.location.reload()
      } catch (error) {
        console.error('评价文件上传失败:', error)
        alert('上传失败，请重试')
      } finally {
        uploadProgress.value = 0
      }
    }

    const handleVideoFileUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      if (file.size > 500 * 1024 * 1024) {
        alert('视频文件大小不能超过500MB')
        return
      }

      const formData = new FormData()
      formData.append('video_file', file)

      try {
        uploadProgress.value = 0
        
        // 添加上传进度监听
        const config = {
          onUploadProgress: (progressEvent) => {
            uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        }
        
        const response = await api.listening.uploadVideoFile(currentObservation.value.id, formData)

        if (response.data && response.data.code === 200) {
          alert('视频文件上传成功')
          loadObservations()
        } else {
          alert('上传失败，请重试')
        }
      } catch (error) {
        console.error('视频文件上传失败:', error)
        alert('上传失败，请重试')
      } finally {
        uploadProgress.value = 0
      }
    }

    const uploadTemplate = () => {
      if (templateInput.value) {
        templateInput.value.click()
      } else {
        console.error('模板上传input元素未找到')
      }
    }

    const handleTemplateUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      if (file.size > 10 * 1024 * 1024) {
        alert('模板文件大小不能超过10MB')
        return
      }

      const formData = new FormData()
      formData.append('template_file', file)
      formData.append('name', file.name)

      try {
        const response = await api.listening.uploadTemplate(formData)
        
        // 有响应就跳转到模板管理并刷新数据
        activeTab.value = 'templates'
        loadTemplates()
      } catch (error) {
        console.error('模板上传失败:', error)
        alert('上传失败，请重试')
      } finally {
        // 清空文件输入，允许重复上传同一文件
        if (templateInput.value) {
          templateInput.value.value = ''
        }
      }
    }

    const downloadTemplate = async (template) => {
      // 直接执行下载，不处理错误
      const response = await api.listening.downloadTemplate(template.id)
      
      // 确保数据是正确的 Blob 格式
      let blob
      if (response instanceof Blob) {
        blob = response
      } else if (response.data instanceof Blob) {
        blob = response.data
      } else {
        // 手动创建 Blob
        blob = new Blob([response], { type: 'application/octet-stream' })
      }
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = template.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    const setDefaultTemplate = async (template) => {
      try {
        const response = await api.listening.setDefaultTemplate(template.id)
        
        // 有响应就跳转到模板管理并刷新数据
        activeTab.value = 'templates'
        loadTemplates()
      } catch (error) {
        console.error('设置默认模板失败:', error)
        alert('设置失败，请重试')
      }
    }

    const deleteTemplate = async (template) => {
      if (!confirm(`确定要删除模板 ${template.name} 吗？`)) return
      
      try {
        const response = await api.listening.deleteTemplate(template.id)
        
        // 有响应就跳转到模板管理并刷新数据
        activeTab.value = 'templates'
        loadTemplates()
      } catch (error) {
        console.error('删除模板失败:', error)
        alert('删除失败，请重试')
      }
    }

    const downloadFile = async (file) => {
      // 直接执行下载，不处理错误
      const response = await api.get(`/files/download/${file.path}`, {
        responseType: 'blob'
      })
      
      // 确保数据是正确的 Blob 格式
      let blob
      if (response instanceof Blob) {
        blob = response
      } else if (response.data instanceof Blob) {
        blob = response.data
      } else {
        // 手动创建 Blob
        blob = new Blob([response], { type: 'application/octet-stream' })
      }
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
      
      

    const changePage = (page) => {
      pagination.page = page
      loadObservations()
    }

    const debounceSearch = (() => {
      let timeout
      return () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          pagination.page = 1
          loadObservations()
        }, 500)
      }
    })()

    const debounceCourseSearch = (() => {
      let timeout
      return () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          searchCourses()
        }, 300)
      }
    })()

    const closeModals = () => {
      showObservationModal.value = false
      showDetailModal.value = false
      showFileUploadModal.value = false
      showVideoModal.value = false
      
      currentObservation.value = null
      currentVideoUrl.value = ''
      uploadProgress.value = 0
    }

    // 工具方法
    const getRoleText = (role) => {
      const roleMap = {
        'student': '学生',
        'teacher': '教师',
        'department_admin': '院级管理员',
        'school_admin': '校级管理员',
        'super_admin': '超级管理员'
      }
      return roleMap[role] || '未知角色'
    }

    const formatDateTime = (dateTime) => {
      if (!dateTime) return '未知时间'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN')
    }

    const formatDate = (date) => {
      if (!date) return '未知日期'
      const d = new Date(date)
      return d.toLocaleDateString('zh-CN')
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileIcon = (fileType) => {
      if (fileType?.includes('pdf')) return 'fas fa-file-pdf'
      if (fileType?.includes('excel') || fileType?.includes('sheet')) return 'fas fa-file-excel'
      if (fileType?.includes('word') || fileType?.includes('document')) return 'fas fa-file-word'
      if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return 'fas fa-file-powerpoint'
      return 'fas fa-file'
    }

    // 初始化
    onMounted(async () => {
      await getUserInfo()
      await loadDepartments()
      await loadObservations()
      await loadStatistics()
      
      if (isSchoolAdmin.value) {
        await loadTemplates()
      }
    })

    return {
      // 数据
      userRole,
      activeTab,
      loading,
      saving,
      uploadProgress,
      observations,
      courses,
      departments,
      templates,
      filteredCourses,
      statistics,
      filters,
      pagination,
      observationForm,
      courseSearchKeyword,
      selectedCourse,
      templateInput,
      
      // 状态
      showObservationModal,
      showDetailModal,
      showFileUploadModal,
      showVideoModal,
      currentObservation,
      currentVideoUrl,
      
      // 计算属性
      isAdminUser,
      isSchoolAdmin,
      canCreateObservation,
      
      // 方法
      refreshData,
      showCreateObservationModal,
      showTemplateManagement,
      saveObservation,
      viewObservation,
      uploadFiles,
      canEditObservation,
      playVideo,
      downloadEvaluationTemplate,
      handleEvaluationFileUpload,
      handleVideoFileUpload,
      uploadTemplate,
      handleTemplateUpload,
      downloadTemplate,
      setDefaultTemplate,
      deleteTemplate,
      downloadFile,
      searchCourses,
      debounceCourseSearch,
      selectCourse,
      changePage,
      debounceSearch,
      closeModals,
      
      // 工具方法
      getRoleText,
      formatDateTime,
      formatDate,
      formatFileSize,
      getFileIcon
    }
  }
}
</script>

<style scoped>
/* 主容器 */
.listening-management {
  min-height: 100vh;
  background: #fafafa; border: 1px solid var(--border-light);
}

/* 顶部导航栏 */
.page-header {
  background: #ffffff;
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: var(--shadow-sm);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--divider);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  font-size: 14px;
}

.back-btn:hover {
  background: var(--bg-surface);
  border-color: var(--primary-color);
  color: var(--primary-color);
  
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.page-info {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #000000d9;
  margin: 0;
  color: var(--text-primary);
}

.page-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-top: var(--spacing-xs);
}

.role-indicator {
  margin-left: var(--spacing-md);
}

.role-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  
}

.role-badge.premium {
  background: linear-gradient(135deg, var(--accent-color) 0%, #ff8a65 100%);
  color: white;
  box-shadow: var(--shadow-sm);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn.primary {
  background: var(--primary-gradient);
  color: white;
  box-shadow: var(--shadow-sm);
}

.action-btn.primary:hover {
  
  box-shadow: var(--shadow-md);
}

.action-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--divider);
}

.action-btn.secondary:hover {
  background: var(--bg-surface);
  border-color: var(--primary-color);
}

.action-btn.refresh {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--divider);
  padding: var(--spacing-sm);
  min-width: 44px;
  justify-content: center;
}

.action-btn.refresh:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.action-btn.refresh svg {
  transition: transform var(--transition-normal);
}

.action-btn.refresh:hover svg {
  transform: rotate(180deg);
}

/* 主内容区域 */
.main-content {
  padding: var(--spacing-xl) 0;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
}

/* 统计信息区域 */
.statistics-section {
  margin-bottom: var(--spacing-2xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all var(--transition-normal);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transition: transform var(--transition-normal);
}

.stat-card:hover {
  
  box-shadow: var(--shadow-lg);
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-card.observations::before {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.monthly::before {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-card.teachers::before {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-card.files::before {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.stat-card.observations .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.monthly .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-card.teachers .stat-icon {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-card.files .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.stat-number {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-xs);
  display: block;
}

/* 功能导航区域 */
.function-section {
  margin-bottom: var(--spacing-xl);
}

.function-tabs {
  display: flex;
  gap: var(--spacing-sm);
  background: var(--bg-secondary);
  padding: var(--spacing-sm);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.tab-btn svg {
  width: 18px;
  height: 18px;
}

.tab-btn:hover {
  background: rgba(26, 35, 126, 0.1);
  color: var(--primary-color);
}

.tab-btn.active {
  background: var(--primary-gradient);
  color: white;
  box-shadow: var(--shadow-sm);
}

.tab-btn.active svg {
  color: white;
}

/* 统计面板 */
.statistics-panel {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
  margin-bottom: 24px;
}

.statistics-panel h3 {
  margin: 0 0 20px 0;
  color: #000000d9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #fafafa; border: 1px solid var(--border-light);
  color: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 24px;
}

.stat-info h4 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: bold;
}

.stat-info p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

/* 功能导航 */
.function-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
}

.tab-btn {
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #00000073;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
}

.tab-btn:hover {
  background: var(--bg-body);
  color: #1677ff;
}

.tab-btn.active {
  background: #1677ff;
  color: white;
}

/* 内容区域 */
.tab-content {
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
}

.content-header h3 {
  margin: 0;
  color: #000000d9;
}

.permission-notice {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 4px;
  padding: 8px 12px;
  margin: 16px 0;
}

.notice-text {
  font-size: 14px;
  color: #d48806;
}

.filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filters input,
.filters select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

/* 听课记录表格 */
.observations-table {
  overflow-x: auto;
}

.observations-table table {
  width: 100%;
  border-collapse: collapse;
}

.observations-table th,
.observations-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
}

.observations-table th {
  background: var(--bg-body);
  font-weight: 600;
  color: #000000d9;
}

.observations-table tr:hover {
  background: #f8f9fa;
}

.course-info strong {
  color: #000000d9;
  font-size: 14px;
}

.course-meta {
  font-size: 12px;
  color: #00000040;
  margin-top: 4px;
}

.observer-info {
  font-size: 14px;
}

.observer-type {
  font-size: 12px;
  color: #00000040;
}

.file-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.file-uploaded {
  background: #67c23a;
  color: white;
}

.video-uploaded {
  background: #1677ff;
  color: white;
}

.no-files {
  background: #e6a23c;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 模板管理 */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 24px;
}

.template-card {
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}

.template-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-icon {
  font-size: 32px;
  color: #1677ff;
}

.file-info {
  flex: 1;
}

.file-info h4 {
  margin: 0 0 8px 0;
  color: #000000d9;
  font-size: 14px;
}

.file-info p {
  margin: 0;
  font-size: 12px;
  color: #00000040;
}

.default-badge {
  color: #67c23a !important;
  font-weight: bold;
}

.file-actions {
  display: flex;
  gap: 8px;
  flex-direction: column;
}

/* 课程搜索 */
.course-search {
  position: relative;
}

.course-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.course-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.course-item:hover {
  background: var(--bg-body);
}

.course-item:last-child {
  border-bottom: none;
}

.selected-course {
  margin-top: 16px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.selected-course h4 {
  margin: 0 0 8px 0;
  color: #1677ff;
}

.selected-course p {
  margin: 4px 0;
  color: #000000d9;
}

/* 文件上传 */
.upload-section {
  padding: 24px;
}

.template-download,
.file-upload,
.video-upload {
  margin-bottom: 24px;
}

.template-download h4,
.file-upload h4,
.video-upload h4 {
  margin: 0 0 12px 0;
  color: #000000d9;
}

.help-text {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #00000040;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #1677ff;
  background: #f0f9ff;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-area p {
  margin: 8px 0;
  color: #00000073;
}

.upload-hint {
  font-size: 12px;
  color: #00000040;
}

.upload-progress {
  margin-top: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-body);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #1677ff;
  transition: width 0.3s;
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
  justify-content: center;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-primary {
  background-color: #1677ff;
  color: white;
}

.btn-primary:hover {
  background-color: #337ecc;
}

.btn-success {
  background-color: #67c23a;
  color: white;
}

.btn-success:hover {
  background-color: #5daf34;
}

.btn-warning {
  background-color: #e6a23c;
  color: white;
}

.btn-warning:hover {
  background-color: #cf9236;
}

.btn-danger {
  background-color: #f56c6c;
  color: white;
}

.btn-danger:hover {
  background-color: #f14343;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

.btn-secondary {
  background-color: #ddd;
  color: #666;
}

.btn-secondary:hover {
  background-color: #ccc;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.large-modal {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  margin: 0;
  color: #000000d9;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #00000040;
}

.close-btn:hover {
  color: #00000073;
}

.modal-body {
  padding: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid var(--border-light);
}

/* 表单样式 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 14px;
  color: #00000073;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

/* 详情页面样式 */
.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  color: #000000d9;
  border-bottom: 2px solid #1677ff;
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item label {
  font-weight: 500;
  color: #00000073;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-body);
  border-radius: 4px;
}

.file-item i {
  color: #1677ff;
  font-size: 20px;
}

.video-section video {
  border-radius: 8px;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
}

.page-info {
  color: #00000073;
  font-size: 14px;
}

/* 加载和空状态 */
.loading {
  text-align: center;
  padding: 40px;
  color: #00000040;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #00000040;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .listening-management {
    padding: 12px;
  }

  .header-section {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .function-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }

  .file-actions {
    flex-direction: row;
  }
}
</style> 