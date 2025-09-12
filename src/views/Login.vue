<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
    </div>
    
    <div class="login-content">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo-section">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1 class="brand-title">校园体育管理系统</h1>
            <p class="brand-subtitle">Campus Sports Management Platform</p>
          </div>
          
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">🎯</div>
              <div class="feature-text">
                <h3>智能管理</h3>
                <p>全面的体育教学与活动管理解决方案</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📊</div>
              <div class="feature-text">
                <h3>数据分析</h3>
                <p>实时统计分析，助力科学决策</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔒</div>
              <div class="feature-text">
                <h3>安全可靠</h3>
                <p>企业级安全保障，数据安全有保证</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录区域 -->
      <div class="login-section">
        <div class="login-card">
          <div class="login-header">
            <h2>欢迎回来</h2>
            <p>请登录您的账户以继续使用</p>
          </div>
      
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input 
            type="text" 
            class="form-input" 
            v-model="loginForm.username"
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">密码</label>
          <input 
            type="password" 
            class="form-input" 
            v-model="loginForm.password"
            placeholder="请输入密码"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">用户类型</label>
          <select 
            class="form-input" 
            v-model="loginForm.userType"
            required
          >
            <option value="">请选择用户类型</option>
            <option value="student">学生</option>
            <option value="teacher">教师</option>
            <option value="department_admin">院级管理员</option>
            <option value="school_admin">校级管理员</option>
            <option value="super_admin">超级管理员</option>
          </select>
        </div>

        <!-- 验证码 - 只在需要时显示 -->
        <div v-if="showCaptcha" class="form-group">
          <label class="form-label">验证码</label>
          <div class="captcha-container">
            <input 
              type="text" 
              class="form-input captcha-input" 
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              required
            />
            <img 
              :src="captchaImage" 
              @click="refreshCaptcha"
              class="captcha-image"
              alt="验证码"
              title="点击刷新验证码"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label class="checkbox-container">
            <input type="checkbox" v-model="loginForm.rememberMe" />
            <span class="checkmark"></span>
            记住我（30天内免登录）
          </label>
        </div>
        
          <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '登录中...' : '立即登录' }}
          </button>
        </form>
        
        <div class="divider">
          <span>或</span>
        </div>
        
        <div class="alternative-actions">
          <router-link to="/register" class="register-link">
            <span>还没有账号？</span>
            <strong>立即注册</strong>
          </router-link>
        </div>
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
        username: '',
        password: '',
        userType: '',
        rememberMe: false,
        captcha: '',
        captchaToken: ''
      },
      loading: false,
      showCaptcha: false,
      captchaImage: '',
      loginAttempts: 0
    }
  },
  methods: {
    async handleLogin() {
      if (!this.loginForm.username || !this.loginForm.password || !this.loginForm.userType) {
        alert('请填写所有必填项')
        return
      }

      if (this.showCaptcha && !this.loginForm.captcha) {
        alert('请输入验证码')
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

        // 如果需要验证码，添加验证码信息
        if (this.showCaptcha) {
          loginData.captcha = this.loginForm.captcha
          loginData.captchaToken = this.loginForm.captchaToken
        }

        const result = await authService.login(loginData)

        if (result.code === 200) {
          alert('登录成功！')
          this.$router.push('/dashboard')
        } else {
          alert(result.message)
          this.handleLoginFailure()
        }
      } catch (error) {
        console.error('登录失败:', error)
        alert('登录失败，请重试')
        this.handleLoginFailure()
      } finally {
        this.loading = false
      }
    },

    handleLoginFailure() {
      this.loginAttempts++
      
      // 登录失败3次后显示验证码
      if (this.loginAttempts >= 3) {
        this.showCaptcha = true
        this.getCaptcha()
      }
    },

    async getCaptcha() {
      try {
        const response = await fetch('/security/captcha')
        const result = await response.json()
        
        if (result.code === 200) {
          this.captchaImage = result.data.captchaImage
          this.loginForm.captchaToken = result.data.captchaToken
        }
      } catch (error) {
        console.error('获取验证码失败:', error)
      }
    },

    refreshCaptcha() {
      this.getCaptcha()
    }
  }
}
</script>

<style scoped>
/* 主容器 */
.login-container {
  min-height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 30%;
  right: 30%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

/* 主内容区域 */
.login-content {
  display: flex;
  width: 100%;
  position: relative;
  z-index: 2;
}

/* 左侧品牌区域 */
.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  color: white;
}

.brand-content {
  max-width: 500px;
  width: 100%;
}

.logo-section {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-lg);
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.logo-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

.brand-title {
  font-size: 36px;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 16px;
  opacity: 0.9;
  font-weight: var(--font-weight-light);
  letter-spacing: 1px;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all var(--transition-normal);
}

.feature-item:hover {
  transform: translateX(10px);
  background: rgba(255, 255, 255, 0.15);
}

.feature-icon {
  font-size: 24px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
}

.feature-text h3 {
  font-size: 18px;
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}

.feature-text p {
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.5;
}

/* 右侧登录区域 */
.login-section {
  flex: 0 0 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  position: relative;
}

.login-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(20px);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-2xl);
  position: relative;
  z-index: 3;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.login-header h2 {
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-header p {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.5;
}

/* 表单样式 */
.login-form {
  margin-bottom: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--divider);
  border-radius: var(--radius-md);
  font-size: 16px;
  font-family: inherit;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(26, 35, 126, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: var(--text-disabled);
}

/* 验证码容器 */
.captcha-container {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 48px;
  border: 2px solid var(--divider);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.captcha-image:hover {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

/* 复选框样式 */
.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  gap: var(--spacing-sm);
}

.checkbox-container input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.login-btn:active {
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

/* 加载动画 */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 分隔线 */
.divider {
  text-align: center;
  margin: var(--spacing-xl) 0;
  position: relative;
  color: var(--text-disabled);
  font-size: 14px;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--divider);
  z-index: 1;
}

.divider span {
  background: var(--bg-secondary);
  padding: 0 var(--spacing-md);
  position: relative;
  z-index: 2;
}

/* 注册链接 */
.alternative-actions {
  text-align: center;
}

.register-link {
  display: inline-flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  text-decoration: none;
  color: var(--text-secondary);
  transition: all var(--transition-normal);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
}

.register-link:hover {
  color: var(--primary-color);
  background: rgba(26, 35, 126, 0.05);
}

.register-link strong {
  color: var(--primary-color);
  font-weight: var(--font-weight-semibold);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-content {
    flex-direction: column;
  }
  
  .brand-section {
    flex: none;
    padding: var(--spacing-lg);
    min-height: 300px;
  }
  
  .login-section {
    flex: none;
    background: var(--bg-secondary);
  }
  
  .brand-title {
    font-size: 28px;
  }
  
  .features-list {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .feature-item {
    flex: 0 1 calc(50% - var(--spacing-sm));
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .login-container {
    padding: var(--spacing-md);
  }
  
  .brand-section {
    padding: var(--spacing-md);
    min-height: 200px;
  }
  
  .login-card {
    padding: var(--spacing-lg);
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .login-header h2 {
    font-size: 24px;
  }
  
  .features-list {
    flex-direction: column;
  }
  
  .feature-item {
    flex: none;
  }
  
  .logo-icon {
    width: 60px;
    height: 60px;
  }
  
  .logo-icon svg {
    width: 30px;
    height: 30px;
  }
}

@media (max-width: 480px) {
  .login-section {
    flex: none;
  }
  
  .captcha-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .captcha-image {
    width: 100%;
    height: 60px;
  }
}
</style> 