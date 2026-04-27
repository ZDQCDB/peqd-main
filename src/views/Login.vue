<template>
  <div class="login-page">
    <div class="login-left">
      <div class="brand-wrap">
        <div class="brand-logo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
            <rect width="40" height="40" rx="8" fill="#1677ff"/>
            <path d="M20 8L10 14v7l10 6 10-6v-7L20 8z" stroke="white" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
            <path d="M10 21l10 6 10-6" stroke="white" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
            <path d="M10 25l10 6 10-6" stroke="white" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
        <h1 class="brand-name">校园体育管理系统</h1>
        <p class="brand-desc">Campus Sports Management Platform</p>
      </div>
      <div class="brand-features">
        <div class="feature-item">
          <span class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M9 11l3 3L22 4" stroke="#1677ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#1677ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <div>
            <p class="feature-title">智能教学管理</p>
            <p class="feature-desc">全流程体育教学管理，提升教学效率</p>
          </div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M3 3v18h18" stroke="#1677ff" stroke-width="2" stroke-linecap="round"/>
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="#1677ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <div>
            <p class="feature-title">数据分析统计</p>
            <p class="feature-desc">实时数据看板，助力科学决策</p>
          </div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="#1677ff" stroke-width="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="#1677ff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <div>
            <p class="feature-title">安全可靠</p>
            <p class="feature-desc">企业级数据安全保障</p>
          </div>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card">
        <div class="login-header">
          <h2>欢迎登录</h2>
          <p>请输入您的账号信息</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">选择学校</label>
            <select class="form-input" v-model="loginForm.school" @change="onSchoolChange" required>
              <option value="">请选择学校</option>
              <option v-for="s in schools" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">选择用户</label>
            <select class="form-input" v-model="loginForm.username" @change="onUserChange" :disabled="!loginForm.school || loadingUsers" required>
              <option value="">{{ loadingUsers ? '加载中...' : '请选择用户' }}</option>
              <option v-for="u in schoolUsers" :key="u.username" :value="u.username">
                {{ u.realName }} - {{ userTypeLabel(u.userType) }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <input
              type="password"
              class="form-input"
              v-model="loginForm.password"
              placeholder="请输入密码"
              autocomplete="current-password"
              required
            />
          </div>

          <div class="form-row-check">
            <label class="checkbox-label">
              <input type="checkbox" v-model="loginForm.rememberMe" />
              <span>记住我（30天）</span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-large" :disabled="loading">
            <span v-if="loading" class="spin-icon"></span>
            {{ loading ? '登录中...' : '登 录' }}
          </button>
        </form>

        <div class="login-footer">
          <span class="footer-text">还没有账号？</span>
          <router-link to="/register" class="register-link">立即注册</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/multi-word-component-names */
import authService from '@/services/authService'

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        school: '',
        username: '',
        password: '',
        userType: '',
        rememberMe: false
      },
      loading: false,
      loadingUsers: false,
      schools: [],
      schoolUsers: []
    }
  },
  async created() {
    await this.loadSchools()
  },
  methods: {
    userTypeLabel(type) {
      const map = {
        teacher: '教师',
        department_admin: '院级管理员',
        school_admin: '校级管理员',
        super_admin: '超级管理员',
        counselor: '辅导员'
      }
      return map[type] || type
    },
    async loadSchools() {
      try {
        const result = await authService.getSchools()
        if (result.code === 200) {
          this.schools = result.data
        }
      } catch (e) {
        console.error('加载学校列表失败:', e)
      }
    },
    async onSchoolChange() {
      this.loginForm.username = ''
      this.loginForm.userType = ''
      this.schoolUsers = []
      if (!this.loginForm.school) return
      this.loadingUsers = true
      try {
        const result = await authService.getUsersBySchool(this.loginForm.school)
        if (result.code === 200) {
          this.schoolUsers = result.data
        }
      } catch (e) {
        console.error('加载用户列表失败:', e)
      } finally {
        this.loadingUsers = false
      }
    },
    onUserChange() {
      const selected = this.schoolUsers.find(u => u.username === this.loginForm.username)
      if (selected) {
        this.loginForm.userType = selected.userType
      }
    },
    async handleLogin() {
      if (!this.loginForm.username || !this.loginForm.password || !this.loginForm.userType) {
        alert('请填写所有必填项')
        return
      }
      this.loading = true
      try {
        const loginData = {
          username: this.loginForm.username,
          password: this.loginForm.password,
          userType: this.loginForm.userType,
          rememberMe: this.loginForm.rememberMe
        }
        const result = await authService.login(loginData)
        if (result.code === 200) {
          alert('登录成功！')
          this.$router.push('/dashboard')
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error('登录失败:', error)
        alert('登录失败，请重试')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
}

/* 左侧品牌区 */
.login-left {
  flex: 1;
  background: #1677ff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 56px;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  pointer-events: none;
}

.login-left::after {
  content: '';
  position: absolute;
  bottom: -60px;
  left: -60px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  pointer-events: none;
}

.brand-wrap {
  margin-bottom: 56px;
}

.brand-logo {
  margin-bottom: 20px;
}

.brand-name {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.brand-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 1px;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.feature-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-title {
  font-size: 15px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
}

/* 右侧登录区 */
.login-right {
  width: 480px;
  flex-shrink: 0;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #000000d9;
  margin-bottom: 6px;
}

.login-header p {
  font-size: 14px;
  color: #00000073;
}

.login-form .form-input {
  height: 40px;
}

.form-row-check {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #00000073;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: #1677ff;
  cursor: pointer;
}

.btn-block {
  width: 100%;
  justify-content: center;
  letter-spacing: 1px;
}

.spin-icon {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  font-size: 14px;
}

.footer-text {
  color: #00000073;
}

.register-link {
  color: #1677ff;
  text-decoration: none;
  margin-left: 4px;
  font-weight: 500;
}

.register-link:hover {
  color: #4096ff;
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .login-left {
    padding: 40px 32px;
  }
  .login-right {
    width: 420px;
  }
}

@media (max-width: 768px) {
  .login-page {
    flex-direction: column;
  }
  .login-left {
    padding: 32px 24px;
    flex: none;
  }
  .brand-features {
    display: none;
  }
  .login-right {
    width: 100%;
    flex: 1;
    padding: 24px 16px;
  }
}
</style>
