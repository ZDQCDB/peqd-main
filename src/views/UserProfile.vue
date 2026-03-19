<template>
  <div class="user-profile">
    <div class="profile-header">
      <button class="btn btn-secondary" @click="$router.push('/dashboard')">
        ← 返回桌面
      </button>
      <h2>个人中心</h2>
    </div>

    <div class="profile-container">
      <!-- 用户基本信息 -->
      <div class="profile-card">
        <div class="profile-avatar">
          <div class="avatar-container">
            <img 
              v-if="user?.avatar" 
              :src="user.avatar" 
              :alt="user.realName"
              class="avatar-img"
            />
            <div v-else class="avatar-placeholder">
              {{ user?.realName?.charAt(0) || 'U' }}
            </div>
          </div>
          <button class="btn btn-outline-primary" @click="showAvatarModal = true">
            更换头像
          </button>
        </div>

        <div class="profile-info">
          <div class="info-item">
            <label>用户ID:</label>
            <span>{{ user?.id }}</span>
          </div>
          <div class="info-item">
            <label>用户名:</label>
            <span>{{ user?.username }}</span>
          </div>
          <div class="info-item">
            <label>角色:</label>
            <span class="role-badge">{{ getRoleText(user?.userType) }}</span>
          </div>
          <div class="info-item">
            <label>状态:</label>
            <span class="status-badge" :class="user?.status">
              {{ getStatusText(user?.status) }}
            </span>
          </div>
          <div class="info-item">
            <label>注册时间:</label>
            <span>{{ formatDateTime(user?.createdAt) }}</span>
          </div>
          <div class="info-item">
            <label>最后登录:</label>
            <span>{{ formatDateTime(user?.lastLoginAt) }}</span>
          </div>
          <div class="info-item">
            <label>登录次数:</label>
            <span>{{ user?.loginCount || 0 }}次</span>
          </div>
        </div>
      </div>

      <!-- 个人信息编辑 -->
      <div class="edit-section">
        <div class="section-header">
          <h3>编辑个人信息</h3>
          <button class="btn btn-primary" @click="showEditModal = true">
            编辑信息
          </button>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <h4>基本信息</h4>
            <div class="info-list">
              <div class="info-row">
                <span class="label">真实姓名:</span>
                <span class="value">{{ user?.realName }}</span>
              </div>
              <div class="info-row">
                <span class="label">邮箱:</span>
                <span class="value">{{ user?.email }}</span>
              </div>
              <div class="info-row">
                <span class="label">电话:</span>
                <span class="value">{{ user?.phone || '未设置' }}</span>
              </div>
              <div class="info-row">
                <span class="label">学号/工号:</span>
                <span class="value">{{ user?.studentId }}</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h4>组织信息</h4>
            <div class="info-list">
              <div class="info-row">
                <span class="label">所属学校:</span>
                <span class="value">{{ user?.school || '未设置' }}</span>
              </div>
              <div class="info-row">
                <span class="label">所属院系:</span>
                <span class="value">{{ user?.departmentName || '未设置' }}</span>
              </div>
              <div class="info-row">
                <span class="label">职务/专业:</span>
                <span class="value">{{ user?.jobTitle }}</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h4>安全设置</h4>
            <div class="info-list">
              <div class="info-row">
                <span class="label">密码:</span>
                <span class="value">••••••••</span>
                <button class="btn btn-outline-primary btn-small" @click="showPasswordModal = true">
                  修改密码
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 账户统计 -->
      <div class="stats-section">
        <h3>账户统计</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="currentColor" stroke-width="1.8"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg></div>
            <div class="stat-info">
              <h4>听课记录</h4>
              <p>{{ userStats.listeningCount }}条</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📁</div>
            <div class="stat-info">
              <h4>上传文件</h4>
              <p>{{ userStats.uploadCount }}个</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💬</div>
            <div class="stat-info">
              <h4>反馈记录</h4>
              <p>{{ userStats.feedbackCount }}条</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <h4>平均评分</h4>
              <p>{{ userStats.averageScore }}/10</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑信息模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑个人信息</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label class="form-label">真实姓名 *</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="editForm.realName"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">邮箱 *</label>
              <input 
                type="email" 
                class="form-input" 
                v-model="editForm.email"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">电话号码</label>
              <input 
                type="tel" 
                class="form-input" 
                v-model="editForm.phone"
              />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModals">
                取消
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>修改密码</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label class="form-label">当前密码 *</label>
              <input 
                type="password" 
                class="form-input" 
                v-model="passwordForm.oldPassword"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">新密码 *</label>
              <input 
                type="password" 
                class="form-input" 
                v-model="passwordForm.newPassword"
                required
              />
              <div class="password-strength">
                <div class="strength-meter" :class="passwordStrength.level">
                  <div class="strength-bar"></div>
                </div>
                <span class="strength-text">{{ passwordStrength.text }}</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">确认新密码 *</label>
              <input 
                type="password" 
                class="form-input" 
                v-model="passwordForm.confirmPassword"
                required
              />
            </div>
            <div class="password-requirements">
              <h5>密码要求：</h5>
              <ul>
                <li :class="{ 'met': passwordForm.newPassword.length >= 8 }">
                  至少8位字符
                </li>
                <li :class="{ 'met': /[A-Z]/.test(passwordForm.newPassword) }">
                  包含大写字母
                </li>
                <li :class="{ 'met': /[a-z]/.test(passwordForm.newPassword) }">
                  包含小写字母
                </li>
                <li :class="{ 'met': /[0-9]/.test(passwordForm.newPassword) }">
                  包含数字
                </li>
              </ul>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModals">
                取消
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading || !isPasswordValid">
                {{ loading ? '修改中...' : '修改密码' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 更换头像模态框 -->
    <div v-if="showAvatarModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>更换头像</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div class="avatar-upload">
            <input 
              type="file" 
              ref="avatarInput"
              @change="handleAvatarUpload"
              accept="image/*"
              style="display: none"
            />
            <div class="upload-area" @click="$refs.avatarInput.click()">
              <div v-if="previewAvatar" class="preview-container">
                <img :src="previewAvatar" alt="预览" class="preview-img" />
              </div>
              <div v-else class="upload-placeholder">
                <div class="upload-icon">📷</div>
                <p>点击选择头像图片</p>
                <p class="upload-hint">支持JPG、PNG格式，大小不超过2MB</p>
              </div>
            </div>
            <div v-if="uploadProgress > 0" class="upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <p>上传进度：{{ uploadProgress }}%</p>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModals">
              取消
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              :disabled="!previewAvatar || loading"
              @click="saveAvatar"
            >
              {{ loading ? '保存中...' : '保存头像' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  name: 'UserProfile',
  data() {
    return {
      user: null,
      userStats: {
        listeningCount: 0,
        uploadCount: 0,
        feedbackCount: 0,
        averageScore: 0
      },
      showEditModal: false,
      showPasswordModal: false,
      showAvatarModal: false,
      editForm: {
        realName: '',
        email: '',
        phone: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      previewAvatar: null,
      uploadProgress: 0,
      loading: false
    }
  },

  computed: {
    passwordStrength() {
      const password = this.passwordForm.newPassword
      if (!password) return { level: '', text: '' }

      let score = 0
      if (password.length >= 8) score += 1
      if (/[A-Z]/.test(password)) score += 1
      if (/[a-z]/.test(password)) score += 1
      if (/[0-9]/.test(password)) score += 1
      if (/[^a-zA-Z0-9]/.test(password)) score += 1

      const levels = [
        { level: 'very-weak', text: '非常弱' },
        { level: 'weak', text: '弱' },
        { level: 'fair', text: '一般' },
        { level: 'good', text: '良好' },
        { level: 'strong', text: '强' }
      ]

      return levels[score] || levels[0]
    },

    isPasswordValid() {
      return this.passwordForm.newPassword && 
             this.passwordForm.newPassword === this.passwordForm.confirmPassword &&
             this.passwordForm.newPassword.length >= 8 &&
             /[A-Z]/.test(this.passwordForm.newPassword) &&
             /[a-z]/.test(this.passwordForm.newPassword) &&
             /[0-9]/.test(this.passwordForm.newPassword)
    }
  },

  async mounted() {
    await this.loadUserData()
  },

  methods: {
    async loadUserData() {
      try {
        // 强制从服务器获取最新的用户信息
        this.user = await authService.refreshUserProfile()
        if (!this.user) {
          this.$router.push('/login')
          return
        }

        // 获取用户统计数据 - 这里使用真实的统计数据
        if (this.user.statistics) {
          this.userStats = {
            listeningCount: this.user.statistics.listeningCount || 0,
            uploadCount: this.user.statistics.uploadCount || 0,
            feedbackCount: this.user.statistics.feedbackCount || 0,
            averageScore: this.user.statistics.averageScore || 0
          }
        } else {
          // 如果没有统计数据，使用默认值
          this.userStats = {
            listeningCount: 0,
            uploadCount: 0,
            feedbackCount: 0,
            averageScore: 0
          }
        }

        // 初始化编辑表单
        this.editForm = {
          realName: this.user.realName || '',
          email: this.user.email || '',
          phone: this.user.phone || ''
        }
      } catch (error) {
        console.error('加载用户数据失败:', error)
        // 如果获取用户信息失败，重定向到登录页
        this.$router.push('/login')
      }
    },

    getRoleText(role) {
      const roleMap = {
        'student': '学生',
        'teacher': '教师',
        'department_admin': '院级管理员',
        'school_admin': '校级管理员',
        'super_admin': '超级管理员'
      }
      return roleMap[role] || '未知角色'
    },

    getStatusText(status) {
      const statusMap = {
        'active': '正常',
        'inactive': '未激活',
        'suspended': '已停用',
        'banned': '已封禁'
      }
      return statusMap[status] || '未知状态'
    },

    formatDateTime(dateTime) {
      if (!dateTime) return '未知'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN')
    },

    async updateProfile() {
      if (!this.editForm.realName || !this.editForm.email) {
        alert('请填写必填字段')
        return
      }

      this.loading = true
      try {
        const result = await authService.updateProfile(this.editForm)
        
        if (result.code === 200) {
          this.user = result.data
          alert('信息更新成功')
          this.closeModals()
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error('更新失败:', error)
        alert('更新失败，请重试')
      } finally {
        this.loading = false
      }
    },

    async changePassword() {
      if (!this.passwordForm.oldPassword || !this.passwordForm.newPassword) {
        alert('请填写所有密码字段')
        return
      }

      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        alert('两次输入的新密码不一致')
        return
      }

      if (!this.isPasswordValid) {
        alert('新密码不符合要求')
        return
      }

      this.loading = true
      try {
        const result = await authService.changePassword(
          this.passwordForm.oldPassword,
          this.passwordForm.newPassword
        )

        if (result.code === 200) {
          alert('密码修改成功')
          this.passwordForm = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
          this.closeModals()
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error('密码修改失败:', error)
        alert('密码修改失败，请重试')
      } finally {
        this.loading = false
      }
    },

    handleAvatarUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      // 验证文件大小
      if (file.size > 2 * 1024 * 1024) {
        alert('文件大小不能超过2MB')
        return
      }

      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewAvatar = e.target.result
      }
      reader.readAsDataURL(file)
    },

    async saveAvatar() {
      if (!this.previewAvatar) return

      this.loading = true
      this.uploadProgress = 0

      try {
        // 模拟上传进度
        const interval = setInterval(() => {
          this.uploadProgress += 10
          if (this.uploadProgress >= 90) {
            clearInterval(interval)
          }
        }, 100)

        // 在实际项目中，这里应该上传到OSS
        // const uploadResult = await ossService.uploadFile(file, 'avatars')
        
        // 模拟上传完成
        setTimeout(async () => {
          this.uploadProgress = 100
          
          const result = await authService.updateProfile({
            avatar: this.previewAvatar
          })

          if (result.code === 200) {
            this.user = result.data
            alert('头像更新成功')
            this.closeModals()
          } else {
            alert(result.message)
          }

          this.loading = false
        }, 500)

      } catch (error) {
        console.error('头像上传失败:', error)
        alert('头像上传失败，请重试')
        this.loading = false
      }
    },

    closeModals() {
      this.showEditModal = false
      this.showPasswordModal = false
      this.showAvatarModal = false
      this.previewAvatar = null
      this.uploadProgress = 0
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  }
}
</script>

<style scoped>
.user-profile {
  padding: 24px;
  background: var(--bg-body);
  min-height: 100vh;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.profile-header h2 {
  margin: 0;
  color: #000000d9;
  font-size: 18px;
  font-weight: 500;
}

.profile-container {
  max-width: 1100px;
  margin: 0 auto;
}

.profile-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-card);
  margin-bottom: 16px;
  display: flex;
  gap: 24px;
}

.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-container {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border-light);
}

.avatar-img { width: 100%; height: 100%; object-fit: cover; }

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #1677ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
  font-weight: 600;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.info-item label {
  font-weight: 400;
  color: #00000073;
  min-width: 72px;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #e6f4ff;
  color: #1677ff;
  border: 1px solid #91caff;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid;
}

.status-badge.active { background: #f6ffed; color: #52c41a; border-color: #b7eb8f; }

.edit-section {
  background: white;
  border-radius: 8px;
  padding: 20px 24px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-card);
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.section-header h3 { margin: 0; color: #000000d9; font-size: 15px; font-weight: 500; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.info-card {
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 14px 16px;
  background: #fafafa;
}

.info-card h4 {
  margin: 0 0 10px 0;
  color: #1677ff;
  font-size: 14px;
  font-weight: 500;
}

.info-list { display: flex; flex-direction: column; }

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid var(--border-light);
  font-size: 14px;
}

.info-row:last-child { border-bottom: none; }
.info-row .label { color: #00000073; }
.info-row .value { color: #000000d9; font-weight: 400; }

.stats-section {
  background: white;
  border-radius: 8px;
  padding: 20px 24px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-card);
}

.stats-section h3 { margin: 0 0 16px 0; color: #000000d9; font-size: 15px; font-weight: 500; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.stat-card {
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 14px 16px;
  background: #fafafa;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon { font-size: 20px; color: #1677ff; }
.stat-info h4 { margin: 0 0 3px 0; font-size: 13px; color: #00000073; font-weight: 400; }
.stat-info p { margin: 0; font-size: 18px; font-weight: 700; color: #000000d9; }

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 { margin: 0; color: #000000d9; font-size: 16px; font-weight: 500; }

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #00000073;
  line-height: 1;
  padding: 0;
}

.close-btn:hover { color: #000000d9; }

.modal-body { padding: 20px; }

.form-group { margin-bottom: 14px; }

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #000000d9;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 7px 11px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-group input:hover,
.form-group select:hover,
.form-group textarea:hover { border-color: #4096ff; }

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
}

/* 密码强度 */
.password-strength { margin-top: 6px; display: flex; align-items: center; gap: 8px; }

.strength-meter {
  width: 80px;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar { height: 100%; transition: width 0.2s, background 0.2s; }
.strength-meter.very-weak .strength-bar { width: 20%; background: #ff4d4f; }
.strength-meter.weak      .strength-bar { width: 40%; background: #faad14; }
.strength-meter.fair      .strength-bar { width: 60%; background: #ffd666; }
.strength-meter.good      .strength-bar { width: 80%; background: #52c41a; }
.strength-meter.strong    .strength-bar { width: 100%; background: #1677ff; }

.strength-text { font-size: 12px; color: #00000073; }

.password-requirements {
  margin-top: 12px;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid var(--border-light);
}

.password-requirements h5 { margin: 0 0 6px 0; color: #000000d9; font-size: 13px; font-weight: 500; }
.password-requirements ul { margin: 0; padding-left: 16px; color: #00000073; font-size: 12px; }
.password-requirements li.met { color: #52c41a; }

/* 头像上传 */
.avatar-upload { text-align: center; }

.upload-area {
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  padding: 24px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.upload-area:hover { border-color: #1677ff; }

.preview-container { display: inline-block; width: 100px; height: 100px; border-radius: 50%; overflow: hidden; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.upload-placeholder { color: #00000073; }
.upload-icon { font-size: 36px; margin-bottom: 8px; color: #00000040; }
.upload-hint { font-size: 12px; margin-top: 4px; color: #00000073; }

.upload-progress { margin-top: 12px; }

.progress-bar { width: 100%; height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: #1677ff; transition: width 0.3s; }

.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 14px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
  height: 32px;
}

.btn-primary { background: #1677ff; border-color: #1677ff; color: white; }
.btn-primary:hover { background: #4096ff; border-color: #4096ff; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: white; border-color: var(--border-color); color: #000000d9; }
.btn-secondary:hover { border-color: #1677ff; color: #1677ff; }
.btn-outline-primary { background: white; border-color: #1677ff; color: #1677ff; }
.btn-outline-primary:hover { background: #e6f4ff; }
.btn-small { padding: 2px 8px; height: 24px; font-size: 12px; }

@media (max-width: 768px) {
  .user-profile { padding: 16px; }
  .profile-card { flex-direction: column; align-items: center; }
  .info-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style> 