<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>校园体育管理系统</h1>
        <p>用户注册</p>
      </div>
      
      <form class="register-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">真实姓名 *</label>
          <input 
            type="text" 
            class="form-input" 
            v-model="registerForm.realName"
            placeholder="请输入真实姓名"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">用户类型 *</label>
          <select class="form-input" v-model="registerForm.userType" required>
            <option value="">请选择用户类型</option>
            <option value="student">学生</option>
            <option value="teacher">教师</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">所属学校 *</label>
          <select class="form-input" v-model="registerForm.school" required :disabled="schoolsLoading">
            <option value="">{{ schoolsLoading ? '加载中...' : '请选择学校' }}</option>
            <option v-for="s in schools" :key="s" :value="s">{{ s }}</option>
          </select>
          <p v-if="schoolsError" class="field-error">{{ schoolsError }}</p>
        </div>
        
        <div class="form-group">
          <label class="form-label">{{ getIdLabel() }} *</label>
          <input 
            type="text" 
            class="form-input" 
            v-model="registerForm.studentId"
            :placeholder="getIdPlaceholder()"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">手机号码 *</label>
          <input 
            type="tel" 
            class="form-input" 
            v-model="registerForm.phone"
            placeholder="请输入手机号码"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">手机验证码 *</label>
          <div class="verification-container">
            <input 
              type="text" 
              class="form-input verification-input" 
              v-model="registerForm.verificationCode"
              maxlength="6"
              readonly
              required
            />
            <span class="default-code-hint">默认验证码</span>
          </div>
        </div>
        
        <button type="submit" class="btn btn-success register-btn" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
      
      <div class="register-footer">
        <p>已有账号？ 
          <router-link to="/login" class="login-link">立即登录</router-link>
        </p>
      </div>
    </div>

    <!-- 注册成功 - 凭据展示弹窗 -->
    <div v-if="showCredentials" class="cred-overlay">
      <div class="cred-modal">
        <div class="cred-header">
          <div class="cred-title-wrap">
            <svg viewBox="0 0 24 24" fill="none" class="cred-icon">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>注册成功</h3>
          </div>
        </div>

        <div class="cred-body">
          <div class="cred-notice">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            请妥善保存以下登录凭据，关闭后将无法再次查看初始密码
          </div>

          <div class="cred-name-row">
            <span class="cred-name">{{ credentials.realName }}</span>
            <span class="cred-role-tag">{{ getRoleText(credentials.userType) }}</span>
          </div>

          <div class="cred-item">
            <div class="cred-label">用户名（登录账号）</div>
            <div class="cred-value-row">
              <span class="cred-value">{{ credentials.username }}</span>
              <button type="button" class="copy-btn" @click="copyText(credentials.username)">
                <svg viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/></svg>
                复制
              </button>
            </div>
          </div>

          <div class="cred-item">
            <div class="cred-label">初始密码</div>
            <div class="cred-value-row">
              <span class="cred-value cred-password">{{ credentials.initialPassword }}</span>
              <button type="button" class="copy-btn" @click="copyText(credentials.initialPassword)">
                <svg viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/></svg>
                复制
              </button>
            </div>
          </div>

          <button type="button" class="copy-all-btn" @click="copyText(`用户名：${credentials.username}\n初始密码：${credentials.initialPassword}`)">
            <svg viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/></svg>
            一键复制全部凭据
          </button>
        </div>

        <div class="cred-footer">
          <button type="button" class="go-login-btn" @click="goLogin">我已记录，前往登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'
import api from '@/services/api'

export default {
  name: 'Register',
  data() {
    return {
      registerForm: {
        realName: '',
        userType: '',
        school: '',
        studentId: '',
        phone: '',
        verificationCode: '123456'
      },
      schools: [],
      schoolsLoading: false,
      schoolsError: '',
      loading: false,
      showCredentials: false,
      credentials: {
        realName: '',
        username: '',
        initialPassword: '',
        userType: ''
      }
    }
  },

  computed: {},

  async mounted() {
    await this.loadSchools()
  },

  methods: {
    async loadSchools() {
      this.schoolsLoading = true
      this.schoolsError = ''
      try {
        const result = await api.register.getTeacherSchools()
        if (result.code === 200 && Array.isArray(result.data)) {
          this.schools = result.data
        } else {
          this.schoolsError = '学校列表加载失败，请刷新重试'
        }
      } catch (e) {
        console.error('加载学校列表失败:', e)
        this.schoolsError = '学校列表加载失败，请刷新重试'
      } finally {
        this.schoolsLoading = false
      }
    },

    getIdLabel() {
      if (this.registerForm.userType === 'student') return '学号'
      if (this.registerForm.userType === 'teacher') return '工号'
      return '学号/工号'
    },

    getIdPlaceholder() {
      if (this.registerForm.userType === 'student') return '请输入学号'
      if (this.registerForm.userType === 'teacher') return '请输入工号'
      return '请输入学号或工号'
    },

    getRoleText(role) {
      const map = { student: '学生', teacher: '教师', department_admin: '院级管理员', school_admin: '校级管理员', super_admin: '超级管理员' }
      return map[role] || role
    },

    async handleRegister() {
      if (!this.registerForm.realName || !this.registerForm.userType ||
          !this.registerForm.school || !this.registerForm.studentId ||
          !this.registerForm.phone || !this.registerForm.verificationCode) {
        alert('请填写所有必填字段')
        return
      }
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(this.registerForm.phone)) {
        alert('请输入正确的手机号码')
        return
      }
      if (!/^\d{6}$/.test(this.registerForm.verificationCode)) {
        alert('请输入6位数字验证码')
        return
      }

      this.loading = true
      try {
        const result = await authService.register({
          realName: this.registerForm.realName,
          userType: this.registerForm.userType,
          school: this.registerForm.school,
          studentId: this.registerForm.studentId,
          phone: this.registerForm.phone,
          verificationCode: this.registerForm.verificationCode
        })

        if (result.code === 200) {
          this.credentials = {
            realName: result.data?.realName || this.registerForm.realName,
            username: result.data?.username || '',
            initialPassword: result.data?.initialPassword || '',
            userType: result.data?.userType || this.registerForm.userType
          }
          this.showCredentials = true
        } else {
          alert(result.message || '认证失败，请检查信息是否正确')
        }
      } catch (error) {
        console.error('注册失败:', error)
        alert('认证失败，请重试')
      } finally {
        this.loading = false
      }
    },

    copyText(text) {
      navigator.clipboard.writeText(text).then(() => {
        alert('已复制到剪贴板')
      }).catch(() => {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        alert('已复制到剪贴板')
      })
    },

    goLogin() {
      this.showCredentials = false
      this.$router.push('/login')
    }
  },

  beforeUnmount() {}
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  padding: 24px 16px;
}

.register-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 40px;
  width: 100%;
  max-width: 460px;
}

.register-header {
  text-align: center;
  margin-bottom: 28px;
}

.register-header h1 {
  color: #000000d9;
  font-size: 22px;
  margin-bottom: 6px;
  font-weight: 600;
}

.register-header p {
  color: #00000073;
  font-size: 14px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  color: #000000d9;
  font-weight: 400;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  height: 40px;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:hover { border-color: #4096ff; }
.form-input:focus { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2); }
.form-input:disabled { background: #fafafa; color: #00000073; cursor: not-allowed; }

.field-error {
  margin: 4px 0 0;
  font-size: 12px;
  color: #ff4d4f;
}

.verification-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.verification-input { flex: 1; }

.default-code-hint {
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  font-size: 12px;
  color: #389e0d;
  white-space: nowrap;
  flex-shrink: 0;
}

.register-btn {
  width: 100%;
  padding: 0 20px;
  height: 40px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  letter-spacing: 1px;
  font-family: inherit;
  margin-top: 4px;
}

.register-btn:hover:not(:disabled) { background: #4096ff; }
.register-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.register-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  color: #00000073;
  font-size: 14px;
}

.login-link {
  color: #1677ff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.login-link:hover { color: #4096ff; text-decoration: underline; }

/* ===== 凭据弹窗 ===== */
.cred-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.cred-modal {
  background: white;
  border-radius: 10px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.cred-header {
  background: #f6ffed;
  border-bottom: 1px solid #b7eb8f;
  padding: 16px 20px;
}

.cred-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cred-title-wrap h3 {
  margin: 0;
  color: #389e0d;
  font-size: 16px;
  font-weight: 600;
}

.cred-icon {
  width: 20px;
  height: 20px;
  color: #52c41a;
  flex-shrink: 0;
}

.cred-body { padding: 20px; }

.cred-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 13px;
  color: #874d00;
  margin-bottom: 16px;
  line-height: 1.5;
}

.cred-notice svg {
  width: 16px;
  height: 16px;
  color: #faad14;
  flex-shrink: 0;
  margin-top: 1px;
}

.cred-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.cred-name {
  font-size: 16px;
  font-weight: 600;
  color: #000000d9;
}

.cred-role-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.cred-item { margin-bottom: 14px; }

.cred-label {
  font-size: 12px;
  color: #00000073;
  margin-bottom: 6px;
}

.cred-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 10px 12px;
}

.cred-value {
  flex: 1;
  font-size: 15px;
  font-family: 'SFMono-Regular', Consolas, monospace;
  color: #000000d9;
  word-break: break-all;
}

.cred-password {
  color: #1677ff;
  font-weight: 700;
  font-size: 17px;
  letter-spacing: 1px;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  color: #00000073;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  white-space: nowrap;
  font-family: inherit;
  flex-shrink: 0;
}

.copy-btn svg { width: 13px; height: 13px; }
.copy-btn:hover { border-color: #1677ff; color: #1677ff; }

.copy-all-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 4px;
  padding: 9px;
  background: #e6f4ff;
  border: 1px solid #91caff;
  border-radius: 6px;
  font-size: 14px;
  color: #1677ff;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}

.copy-all-btn svg { width: 15px; height: 15px; }
.copy-all-btn:hover { background: #bae0ff; }

.cred-footer {
  padding: 14px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
}

.go-login-btn {
  padding: 8px 20px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}

.go-login-btn:hover { background: #4096ff; }
</style>
