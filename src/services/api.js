import axios from 'axios'

// API基础配置
const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://192.168.1.104:9999'

// 比赛成绩服务地址
const RACE_BASE_URL = 'http://38.207.179.218:8888'

// 创建比赛成绩专用 axios 实例
const raceApiClient = axios.create({
  baseURL: RACE_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

raceApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

raceApiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('userToken')
        localStorage.removeItem('userInfo')
        if (window.location.pathname !== '/login') window.location.href = '/login'
      }
      throw new Error((data && data.message) || `请求失败(${status})`)
    } else if (error.request) {
      throw new Error('网络连接失败，请检查网络设置')
    } else {
      throw new Error(error.message || '请求失败')
    }
  }
)

// 创建axios实例
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理响应
apiClient.interceptors.response.use(
  (response) => {
    // 返回响应数据
    return response.data
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('userToken')
          localStorage.removeItem('userInfo')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
        case 403:
          // 权限不足
          throw new Error(data.message || '权限不足')
        case 404:
          // 资源不存在
          throw new Error(data.message || '请求的资源不存在')
        case 500:
          // 服务器内部错误
          throw new Error(data.message || '服务器内部错误')
        default:
          throw new Error(data.message || '请求失败')
      }
    } else if (error.request) {
      // 网络错误
      throw new Error('网络连接失败，请检查网络设置')
    } else {
      // 其他错误
      throw new Error(error.message || '请求失败')
    }
  }
)

// 导出API方法
export const api = {
  // 基础HTTP方法
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),

  // 器材管理API
  equipment: {
    // 获取器材分类
    getCategories: () => apiClient.get('/equipment/categories'),
    
    // 获取器材列表
    getItems: (params) => apiClient.get('/equipment/items', { params }),
    
    // 添加器材
    addItem: (data) => apiClient.post('/equipment/items', data),
    
    // 更新器材信息
    updateItem: (id, data) => apiClient.put(`/equipment/items/${id}`, data),
    
    // 删除器材
    deleteItem: (id) => apiClient.delete(`/equipment/items/${id}`),
    
    // 调整库存
    adjustStock: (id, data) => apiClient.post(`/equipment/items/${id}/adjust`, data),
    
    // 获取借用申请列表
    getApplications: (params) => apiClient.get('/equipment/applications', { params }),
    
    // 创建借用申请
    createApplication: (data) => apiClient.post('/equipment/applications', data),
    
    // 审批借用申请
    approveApplication: (id, data) => apiClient.post(`/equipment/applications/${id}/approve`, data),
    
    // 拒绝借用申请
    rejectApplication: (id, data) => apiClient.post(`/equipment/applications/${id}/reject`, data),
    
    // 归还器材
    returnEquipment: (id, data) => apiClient.post(`/equipment/applications/${id}/return`, data)
  },
  
  // 听课管理API (简化版)
  listening: {
    // 听课记录管理
    // 注意：教师只能查看自己作为听课者的记录，后端需要根据token过滤数据
    getObservations: (params) => apiClient.get('/listening/observations', { params }),
    getObservation: (id) => apiClient.get(`/listening/observations/${id}`),
    createObservation: (data) => apiClient.post('/listening/observations', data),
    deleteObservation: (id) => apiClient.delete(`/listening/observations/${id}`),
    
    // 管理员听课记录管理
    getAdminObservations: (params) => apiClient.get('/listening/admin/observations', { params }),
    getAdminStats: (params) => apiClient.get('/listening/admin/stats', { params }),
    
    // 课程搜索
    searchCourses: (params) => apiClient.get('/listening/courses/search', { params }),
    
    // 院系管理
    getDepartments: () => apiClient.get('/listening/departments'),
    
    // 模板管理
    getTemplates: () => apiClient.get('/listening/templates'),
    uploadTemplate: (formData) => {
      return apiClient.post('/listening/templates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    downloadTemplate: (id) => {
      return apiClient.get(`/listening/templates/${id}/download`, {
        responseType: 'blob'
      })
    },
    downloadDefaultTemplate: () => {
      return apiClient.get('/listening/templates/default/download', {
        responseType: 'blob'
      })
    },
    setDefaultTemplate: (id) => apiClient.put(`/listening/templates/${id}/default`),
    deleteTemplate: (id) => apiClient.delete(`/listening/templates/${id}`),
    
    // 文件上传
    uploadEvaluationFile: (observationId, formData) => {
      return apiClient.post(`/listening/observations/${observationId}/evaluation`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    uploadVideoFile: (observationId, formData) => {
      return apiClient.post(`/listening/observations/${observationId}/video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
  },
  
  // 用户管理API
  user: {
    // 获取用户信息
    getUserInfo: () => apiClient.get('/user/info'),
    
    // 更新用户信息
    updateUserInfo: (data) => apiClient.put('/user/info', data),
    
    // 修改密码
    changePassword: (data) => apiClient.post('/user/change-password', data),
    
    // 上传头像
    uploadAvatar: (formData) => {
      return apiClient.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    
    // 获取用户列表（管理员）
    getUsers: (params) => apiClient.get('/users', { params }),
    
    // 获取用户详情
    getUser: (id) => apiClient.get(`/users/${id}`),
    
    // 创建用户
    createUser: (data) => apiClient.post('/users', data),
    
    // 更新用户信息
    updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
    
    // 更新用户状态
    updateUserStatus: (id, data) => apiClient.put(`/users/${id}/status`, data),
    
    // 批量更新用户状态
    bulkUpdateUserStatus: (userIds, status, reason) => {
      return apiClient.post('/admin/users/bulk-status', {
        userIds,
        status,
        reason
      })
    },
    
    // 设置用户角色
    setUserRole: (userId, role, reason) => {
      return apiClient.put(`/admin/users/${userId}/role`, {
        userType: role,
        reason
      })
    },
    
    // 重置用户密码
    resetPassword: (id) => apiClient.post(`/users/${id}/reset-password`),
    
    // 删除用户
    deleteUser: (id) => apiClient.delete(`/users/${id}`),
    
    // 导出用户数据
    exportUsers: (userIds) => {
      return apiClient.post('/admin/users/export', { userIds }, {
        responseType: 'blob'
      })
    },
    
    // 获取用户审计日志
    getUserAuditLogs: (userId) => apiClient.get(`/admin/users/${userId}/audit-logs`),
    
    // 获取在线统计
    getOnlineStats: () => apiClient.get('/admin/stats')
  },
  
  // 系统设置API
  system: {
    // 获取系统配置
    getSettings: () => apiClient.get('/system/settings'),
    
    // 更新系统配置
    updateSettings: (data) => apiClient.put('/system/settings', data),
    
    // 获取系统日志
    getLogs: (params) => apiClient.get('/system/logs', { params }),
    
    // 数据备份
    backup: () => apiClient.post('/system/backup'),
    
    // 获取备份列表
    getBackups: () => apiClient.get('/system/backups'),
    
    // 恢复数据
    restore: (backupId) => apiClient.post(`/system/restore/${backupId}`)
  },
  
  // 文件管理API
  file: {
    // 通用文件上传
    upload: (formData) => {
      return apiClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    
    // 获取文件信息
    getFileInfo: (id) => apiClient.get(`/files/${id}`),
    
    // 删除文件
    deleteFile: (id) => apiClient.delete(`/files/${id}`),
    
    // 获取文件列表
    getFiles: (params) => apiClient.get('/files', { params }),
    
    // 下载文件
    download: (fileName, originalName) => {
      return apiClient.get(`/files/download/${fileName}`, {
        responseType: 'blob'
      })
    }
  },
  
  // 权限管理API
  permission: {
    // 检查权限
    checkPermissions: (permissions) => {
      return apiClient.post('/permissions/check', { permissions })
    },
    
    // 获取权限列表
    getPermissions: () => apiClient.get('/permissions'),
    
    // 获取用户权限
    getUserPermissions: (userId) => apiClient.get(`/users/${userId}/permissions`)
  },

  // 教学管理API
  teaching: {
    // 获取课程列表
    getCourses: (params) => apiClient.get('/teaching/courses', { params }),
    
    // 获取课程详情
    getCourse: (id) => apiClient.get(`/teaching/courses/${id}`),
    

    
    // 获取统计数据
    getStatistics: () => apiClient.get('/teaching/statistics'),
    
    // 获取签到照片
    getAttendancePhoto: (courseId) => apiClient.get(`/teaching/courses/${courseId}/attendance/photo`),
    
    // 获取签到照片列表
    getAttendancePhotos: (courseId) => apiClient.get(`/teaching/courses/${courseId}/attendance/photos`),
    
    // 获取签到历史
    getAttendanceHistory: (params) => apiClient.get('/teaching/attendance/history', { params }),
    
    // 下载签到照片
    downloadAttendancePhotos: (courseId) => {
      return apiClient.get(`/teaching/courses/${courseId}/attendance/photos/download`, {
        responseType: 'blob'
      })
    },
    
    // 下载签到报告
    downloadAttendanceReport: (courseId) => {
      return apiClient.get(`/teaching/courses/${courseId}/attendance/report`, {
        responseType: 'blob'
      })
    },
    
    // 教师签到相关
    teacherCheckIn: (courseId, data) => {
      return apiClient.post(`/teaching/courses/${courseId}/checkin`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    
    // 教师获取自己的课程
    getTeacherCourses: (params) => apiClient.get('/teaching/teacher/courses', { params }),
    
    // 教师获取签到记录
    getTeacherAttendance: (params) => apiClient.get('/teaching/teacher/attendance', { params })
  },

    // PE校园管理端API
  peManagement: {
    // 活动管理
    getActivities: (params) => apiClient.get('/pe/activities', { params }),
    getActivity: (id) => apiClient.get(`/pe/activities/${id}`),
    reviewActivity: (id, data) => apiClient.put(`/pe/activities/${id}/review`, data),
    getActivityAttendance: (id, params) => apiClient.get(`/pe/activities/${id}/attendance`, { params }),
    
    // 用户管理
    getUsers: (params) => apiClient.get('/pe/users', { params }),
    getUser: (id) => apiClient.get(`/pe/users/${id}`),
    setUserRole: (id, data) => apiClient.put(`/pe/users/${id}/role`, data),
    getUserPointsHistory: (id, params) => apiClient.get(`/pe/users/${id}/points-history`, { params }),
    // 强制登出（清除登录状态）
    forceLogout: (id) => apiClient.post(`/pe/users/${id}/force-logout`),
    // 修改手机号
    updateUserPhone: (id, phoneNumber) => apiClient.put(`/pe/users/${id}/phone`, { phoneNumber }),
    
    // 早操管理
    getMorningExercises: (params) => apiClient.get('/pe/morning-exercises', { params }),
    getMorningExercise: (id) => apiClient.get(`/pe/morning-exercises/${id}`),
    createMorningExercise: (data) => apiClient.post('/pe/morning-exercises', data),
    updateMorningExercise: (id, data) => apiClient.put(`/pe/morning-exercises/${id}`, data),
    deleteMorningExercise: (id) => apiClient.delete(`/pe/morning-exercises/${id}`),
    getMorningAttendanceRecords: (id, params) => apiClient.get(`/pe/morning-exercises/${id}/attendance`, { params }),
    
    // 签到记录管理
    getAttendanceRecords: (params) => apiClient.get('/pe/attendance-records', { params }),
    getAttendanceRecord: (id) => apiClient.get(`/pe/attendance-records/${id}`),
    exportAttendanceRecords: (params) => {
      return apiClient.get('/pe/attendance-records/export', {
        params,
        responseType: 'blob'
      })
    },
    
    // 统计数据
    getStatistics: (params) => apiClient.get('/pe/statistics', { params }),
    getActivityStatistics: (params) => apiClient.get('/pe/statistics/activities', { params }),
    getUserStatistics: (params) => apiClient.get('/pe/statistics/users', { params }),
    getMorningExerciseStatistics: (params) => apiClient.get('/pe/statistics/morning-exercises', { params })
  },

  // 比赛成绩管理API
  raceResults: {
    // 分页查询成绩列表
    getList: (params) => raceApiClient.get('/race/results', { params }),

    // 成绩统计数据
    getStatistics: (params) => raceApiClient.get('/race/results/statistics', { params }),

    // 查询单条成绩详情
    getDetail: (id) => raceApiClient.get(`/race/results/${id}`),

    // 删除单条成绩
    deleteOne: (id) => raceApiClient.delete(`/race/results/${id}`),

    // 批量删除成绩
    deleteBatch: (ids) => raceApiClient.delete('/race/results/batch', { data: { ids } })
  },

  // PE积分统计管理API
  peStatistics: {
    // 设置PE积分指标 (仅校级管理员)
    setTargets: (data) => apiClient.post('/pe/admin/statistics/targets', data),
    
    // 获取学校统计数据 (仅校级管理员)
    getSchoolStatistics: () => apiClient.get('/pe/admin/statistics/school'),
    
    // 获取院系统计数据 (院级管理员和校级管理员)
    getCollegeStatistics: () => apiClient.get('/pe/admin/statistics/college')
  },

  // 训练管理API
  training: {
    // 体能档案
    getMyProfile: () => apiClient.get('/training/profile'),
    getStudentProfile: (userId) => apiClient.get(`/training/profile/${userId}`),
    uploadTiceData: (data) => apiClient.post('/training/profile/tice-data', data),
    getClassProfiles: (params) => apiClient.get('/training/profiles/class', { params }),
    getClassesProfiles: (params) => apiClient.get('/training/profiles/classes', { params }),
    searchProfiles: (params) => apiClient.get('/training/profiles/search', { params }),
    getClassOverview: (className) => apiClient.get('/training/profiles/class-overview', { params: { className } }),
    triggerAiAnalysis: (userId) => apiClient.post(`/training/profile/${userId}/analyze`),
    getAvailableClasses: () => apiClient.get('/training/classes'),

    // 训练任务
    createTask: (data) => apiClient.post('/training/tasks', data),
    getTasks: (params) => apiClient.get('/training/tasks', { params }),
    getTaskDetail: (taskId) => apiClient.get(`/training/tasks/${taskId}`),
    getTaskRecords: (taskId, params) => apiClient.get(`/training/tasks/${taskId}/records`, { params }),
    getMyTasks: () => apiClient.get('/training/my-tasks'),
    updateTaskStatus: (taskId, status) => apiClient.put(`/training/tasks/${taskId}/status`, { status }),
    deleteTask: (taskId) => apiClient.delete(`/training/tasks/${taskId}`),
    getAiSuggestion: (data) => apiClient.post('/training/tasks/ai-suggestion', data),
    getStats: () => apiClient.get('/training/stats')
  },

  // 课后作业统计API（管理端）
  homeworkStats: {
    getOverview: () => apiClient.get('/statistics/homework/overview'),
    getTrend: () => apiClient.get('/statistics/homework/trend'),
    getClassRank: () => apiClient.get('/statistics/homework/class-rank'),
    getDepartmentRank: () => apiClient.get('/statistics/homework/department-rank'),
    getDeptClassRank: () => apiClient.get('/statistics/homework/dept-class-rank')
  },

  // 批量导入API
  importData: {
    // 下载场馆导入模板
    getVenueTemplate: () => apiClient.get('/import/venues/template', { responseType: 'blob' }),
    // 批量导入场馆
    importVenues: (file) => {
      const form = new FormData()
      form.append('file', file)
      return apiClient.post('/import/venues', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    // 下载器材导入模板
    getEquipmentTemplate: () => apiClient.get('/import/equipment/template', { responseType: 'blob' }),
    // 批量导入器材
    importEquipment: (file) => {
      const form = new FormData()
      form.append('file', file)
      return apiClient.post('/import/equipment', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
  },

  // 场馆管理API
  venue: {
    // 场馆列表（支持 type/status/keyword 筛选）
    getVenues: (params) => apiClient.get('/venue/venues', { params }),

    // 场馆详情
    getVenue: (id) => apiClient.get(`/venue/venues/${id}`),

    // 添加场馆（院级及以上管理员）
    addVenue: (data) => apiClient.post('/venue/venues', data),

    // 更新场馆信息（院级及以上管理员）
    updateVenue: (id, data) => apiClient.put(`/venue/venues/${id}`, data),

    // 更新场馆状态（院级及以上管理员）
    updateVenueStatus: (id, status) => apiClient.put(`/venue/venues/${id}/status`, { status }),

    // 删除场馆（院级及以上管理员）
    deleteVenue: (id) => apiClient.delete(`/venue/venues/${id}`),

    // 获取某场馆某日期的预约安排（日历视图）
    getSchedule: (venueId, date) => apiClient.get('/venue/reservations/schedule', { params: { venue_id: venueId, date } }),

    // 获取所有预约（管理端，支持筛选）
    getAllReservations: (params) => apiClient.get('/venue/reservations', { params }),

    // 获取我的预约
    getMyReservations: () => apiClient.get('/venue/reservations/my'),

    // 创建预约
    createReservation: (data) => apiClient.post('/venue/reservations', data),

    // 审批预约（院级及以上管理员）
    approveReservation: (id, data) => apiClient.post(`/venue/reservations/${id}/approve`, data),

    // 取消预约
    cancelReservation: (id) => apiClient.post(`/venue/reservations/${id}/cancel`),

    // 标记预约完成（院级及以上管理员）
    completeReservation: (id) => apiClient.post(`/venue/reservations/${id}/complete`)
  },

  // checkuser 库导入（仅超管）
  checkUserImport: {
    downloadStudentTemplate: () =>
      apiClient.get('/checkuser/template/student', { responseType: 'blob' }),
    downloadTeacherTemplate: () =>
      apiClient.get('/checkuser/template/teacher', { responseType: 'blob' }),
    importStudents: (file) => {
      const form = new FormData()
      form.append('file', file)
      return apiClient.post('/checkuser/import/student', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    importTeachers: (file) => {
      const form = new FormData()
      form.append('file', file)
      return apiClient.post('/checkuser/import/teacher', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
  }
}

// 导出API对象为默认导出，同时导出axios实例
export default api
export { apiClient }