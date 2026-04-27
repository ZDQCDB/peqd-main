/**
 * 认证服务模块
 * 负责用户登录、注册、权限验证等功能
 */

import axios from 'axios'
import permissionManager from '@/utils/permissionManager'

// API基础URL配置
const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://192.168.1.103:8081'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加Token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('userToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理Token过期
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储
      localStorage.removeItem('userToken')
      localStorage.removeItem('userType')
      localStorage.removeItem('username')
      localStorage.removeItem('userId')
      
      // 重定向到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

class AuthService {
  constructor() {
    this.currentUser = null
    this.initializeSession()
  }

  // 初始化会话，恢复用户状态
  async initializeSession() {
    if (this.checkCurrentSession()) {
      // 如果有有效session，尝试获取用户信息并初始化权限管理器
      try {
        await this.getCurrentUser()
      } catch (error) {
        console.error('初始化用户会话失败:', error)
      }
    }
  }

  // 用户登录
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      
      if (response.data.code === 200) {
        const { user, token, expiresAt } = response.data.data
        
        // 保存登录状态
        localStorage.setItem('userToken', token)
        localStorage.setItem('userType', user.userType)
        localStorage.setItem('username', user.username)
        localStorage.setItem('userId', user.id)
        localStorage.setItem('tokenExpires', expiresAt)
        
        // 设置当前用户
        this.currentUser = user
        
        // 初始化权限管理器
        permissionManager.init(user.userType)
        
        return response.data
      }
      
      return response.data
    } catch (error) {
      console.error('登录失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '登录失败，请重试',
        data: null
      }
    }
  }

  // 用户注册
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData)
      return response.data
    } catch (error) {
      console.error('注册失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '注册失败，请重试',
        data: null
      }
    }
  }

  // 用户登出
  async logout() {
    try {
      const token = localStorage.getItem('userToken')
      
      if (token) {
        await apiClient.post('/auth/logout')
      }
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 清除本地存储
      localStorage.removeItem('userToken')
      localStorage.removeItem('userType')
      localStorage.removeItem('username')
      localStorage.removeItem('userId')
      localStorage.removeItem('tokenExpires')
      
      // 清除当前用户
      this.currentUser = null
      
      // 重置权限管理器
      permissionManager.reset()
    }
      
      return {
        code: 200,
        message: '退出成功',
        data: null
    }
  }

  // 检查当前会话
  checkCurrentSession() {
    const token = localStorage.getItem('userToken')
    const tokenExpires = localStorage.getItem('tokenExpires')
    
    if (!token || !tokenExpires) {
      return false
    }

    // 检查Token是否过期
    if (new Date(tokenExpires) < new Date()) {
      this.logout()
      return false
    }

    // 如果权限管理器还没有初始化，尝试从 localStorage 恢复用户角色
    if (!permissionManager.initialized) {
      const userType = localStorage.getItem('userType')
      const username = localStorage.getItem('username')
      const userId = localStorage.getItem('userId')
      
      if (userType && username && userId) {
        // 构建基本用户信息
        this.currentUser = {
          id: userId,
          username: username,
          userType: userType
        }
        
        // 初始化权限管理器
        permissionManager.init(userType)
      }
    }

    return true
  }

  // 获取当前用户信息
  async getCurrentUser(forceRefresh = false) {
    if (!this.checkCurrentSession()) {
      return null
    }

    // 如果不强制刷新且有缓存用户信息，直接返回
    if (!forceRefresh && this.currentUser) {
      // 确保权限管理器已初始化
      if (!permissionManager.initialized) {
        permissionManager.init(this.currentUser.userType)
      }
      return this.currentUser
    }

    try {
      const response = await apiClient.get('/user/profile')
      if (response.data.code === 200) {
        this.currentUser = response.data.data
        
        // 初始化权限管理器
        permissionManager.init(this.currentUser.userType)
        
        return this.currentUser
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.logout()
    }

    return null
  }

  // 强制刷新用户信息
  async refreshUserProfile() {
    return await this.getCurrentUser(true)
  }

  // 修改密码
  async changePassword(oldPassword, newPassword) {
    try {
      const response = await apiClient.post('/user/change-password', {
        oldPassword,
        newPassword,
        confirmPassword: newPassword
      })
      return response.data
    } catch (error) {
      console.error('修改密码失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '修改密码失败，请重试',
        data: null
      }
    }
  }

  // 更新用户资料
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/user/profile', profileData)
      
      if (response.data.code === 200) {
        this.currentUser = { ...this.currentUser, ...response.data.data }
      }
      
      return response.data
    } catch (error) {
      console.error('更新资料失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '更新资料失败，请重试',
        data: null
      }
    }
  }

  // 上传头像
  async uploadAvatar(file) {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await apiClient.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('头像上传失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '头像上传失败，请重试',
        data: null
      }
    }
  }



  // 获取用户列表（管理员功能）
  async getUserList(filters = {}) {
    try {
      const response = await apiClient.get('/admin/users', { params: filters })
      return response.data
    } catch (error) {
      console.error('获取用户列表失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '获取用户列表失败',
        data: null
      }
    }
  }

  // 设置用户角色（管理员功能）
  async setUserRole(userId, newRole) {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/role`, {
        userType: newRole
      })
      return response.data
    } catch (error) {
      console.error('设置用户角色失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '设置用户角色失败',
        data: null
      }
    }
  }

  // 更新用户状态（管理员功能）
  async updateUserStatus(userId, status, reason = '') {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/status`, {
        status,
        reason
      })
      return response.data
    } catch (error) {
      console.error('更新用户状态失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '更新用户状态失败',
        data: null
      }
    }
  }

  // 重置用户密码（管理员功能）
  async resetUserPassword(userId, temporaryPassword) {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/reset-password`, {
        temporaryPassword,
        forceChange: true,
        notifyUser: true
      })
      return response.data
    } catch (error) {
      console.error('重置密码失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '重置密码失败',
        data: null
      }
    }
  }

  // 获取在线用户统计
  async getOnlineStats() {
    try {
      const response = await apiClient.get('/admin/sessions/stats')
      return response.data
    } catch (error) {
      console.error('获取在线统计失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '获取统计数据失败',
        data: null
      }
    }
  }

  // 强制下线用户
  async forceLogout(userId, sessionId) {
    try {
      const response = await apiClient.delete(`/admin/users/${userId}/sessions/${sessionId}`)
      return response.data
    } catch (error) {
      console.error('强制下线失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '强制下线失败',
        data: null
      }
    }
  }

  // 获取登录日志
  async getLoginLogs(filters = {}) {
    try {
      const response = await apiClient.get('/admin/security/login-logs', { params: filters })
      return response.data
    } catch (error) {
      console.error('获取登录日志失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '获取登录日志失败',
        data: null
      }
    }
  }



  // 获取学校列表
  async getSchools() {
    try {
      const response = await apiClient.get('/auth/schools')
      return response.data
    } catch (error) {
      console.error('获取学校列表失败:', error)
      return { code: error.response?.status || 500, message: '获取学校列表失败', data: [] }
    }
  }

  // 根据学校获取用户列表
  async getUsersBySchool(school) {
    try {
      const response = await apiClient.get('/auth/users-by-school', { params: { school } })
      return response.data
    } catch (error) {
      console.error('获取用户列表失败:', error)
      return { code: error.response?.status || 500, message: '获取用户列表失败', data: [] }
    }
  }

  // 超管角色切换
  async impersonate(targetUserId) {
    try {
      const response = await apiClient.post('/auth/impersonate', { targetUserId })
      if (response.data.code === 200) {
        const { user, token, expiresAt } = response.data.data
        const originalToken = localStorage.getItem('userToken')
        const originalUserType = localStorage.getItem('userType')
        const originalUsername = localStorage.getItem('username')
        const originalUserId = localStorage.getItem('userId')

        localStorage.setItem('originalToken', originalToken)
        localStorage.setItem('originalUserType', originalUserType)
        localStorage.setItem('originalUsername', originalUsername)
        localStorage.setItem('originalUserId', originalUserId)

        localStorage.setItem('userToken', token)
        localStorage.setItem('userType', user.userType)
        localStorage.setItem('username', user.username)
        localStorage.setItem('userId', user.id)
        localStorage.setItem('tokenExpires', expiresAt)
        localStorage.setItem('isImpersonating', 'true')
        localStorage.setItem('impersonatingName', user.realName)

        this.currentUser = user
        permissionManager.init(user.userType)
      }
      return response.data
    } catch (error) {
      console.error('角色切换失败:', error)
      return { code: error.response?.status || 500, message: '角色切换失败', data: null }
    }
  }

  // 退出角色切换
  exitImpersonation() {
    const originalToken = localStorage.getItem('originalToken')
    const originalUserType = localStorage.getItem('originalUserType')
    const originalUsername = localStorage.getItem('originalUsername')
    const originalUserId = localStorage.getItem('originalUserId')

    if (originalToken) {
      localStorage.setItem('userToken', originalToken)
      localStorage.setItem('userType', originalUserType)
      localStorage.setItem('username', originalUsername)
      localStorage.setItem('userId', originalUserId)

      localStorage.removeItem('originalToken')
      localStorage.removeItem('originalUserType')
      localStorage.removeItem('originalUsername')
      localStorage.removeItem('originalUserId')
      localStorage.removeItem('isImpersonating')
      localStorage.removeItem('impersonatingName')

      this.currentUser = {
        id: originalUserId,
        username: originalUsername,
        userType: originalUserType
      }
      permissionManager.init(originalUserType)
    }
  }

  // 刷新Token
  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh')
      
      if (response.data.code === 200) {
        const { token, expiresAt } = response.data.data
        
        // 更新本地存储
        localStorage.setItem('userToken', token)
        localStorage.setItem('tokenExpires', expiresAt)
        
        return response.data
      }
      
      return response.data
    } catch (error) {
      console.error('Token刷新失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || 'Token刷新失败',
        data: null
      }
    }
  }

  // 发送验证码
  async sendVerificationCode(data) {
    try {
      const response = await apiClient.post('/auth/send-verification-code', data)
      return response.data
    } catch (error) {
      console.error('发送验证码失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '发送验证码失败',
        data: null
      }
    }
  }

  // 获取院系列表
  async getDepartments() {
    try {
      const response = await apiClient.get('/departments')
      return response.data
    } catch (error) {
      console.error('获取院系列表失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '获取院系列表失败，请重试',
        data: []
      }
    }
  }

  // 创建用户
  async createUser(userData) {
    try {
      const response = await apiClient.post('/admin/users', userData)
      return response.data
    } catch (error) {
      console.error('创建用户失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '创建用户失败，请重试',
        data: null
      }
    }
  }

  // 批量更新用户状态
  async bulkUpdateUserStatus(userIds, status, reason = '') {
    try {
      const response = await apiClient.post('/admin/users/bulk-status', {
        userIds,
        status,
        reason
      })
      return response.data
    } catch (error) {
      console.error('批量更新用户状态失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '批量操作失败，请重试',
        data: null
      }
    }
  }

  // 导出用户数据
  async exportUsers(userIds = null) {
    try {
      const params = userIds ? { userIds } : {}
      const response = await apiClient.post('/admin/users/export', params, {
        responseType: 'blob'
      })
      return {
        code: 200,
        message: '导出成功',
        data: response.data
      }
    } catch (error) {
      console.error('导出用户数据失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '导出失败，请重试',
        data: null
      }
    }
  }

  // 获取用户审计日志
  async getUserAuditLogs(userId) {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/audit-logs`)
      return response.data
    } catch (error) {
      console.error('获取用户审计日志失败:', error)
      return {
        code: error.response?.status || 500,
        message: error.response?.data?.message || '获取审计日志失败，请重试',
        data: []
      }
    }
  }
}

// 创建单例实例
const authService = new AuthService()

export default authService
export { AuthService } 