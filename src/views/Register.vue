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
          <select class="form-input" v-model="registerForm.school" required>
            <option value="">请选择学校</option>
            <option value="北京体育大学">北京体育大学</option>
            <option value="山东科技大学">山东科技大学</option>
            <option value="山东农业大学">山东农业大学</option>
            <option value="山东理工大学">山东理工大学</option>
            <option value="山东财经大学">山东财经大学</option>
            <option value="山东建筑大学">山东建筑大学</option>
            <option value="首都体育学院">首都体育学院</option>
            <option value="天津体育学院">天津体育学院</option>
            <option value="沈阳体育学院">沈阳体育学院</option>
            <option value="吉林体育学院">吉林体育学院</option>
            <option value="哈尔滨体育学院">哈尔滨体育学院</option>
            <option value="山东体育学院">山东体育学院</option>
            <option value="河北体育学院">河北体育学院</option>
            <option value="广州体育学院">广州体育学院</option>
          </select>
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
              placeholder="请输入验证码"
              maxlength="6"
              required
            />
            <button 
              type="button" 
              class="btn btn-outline verification-btn"
              @click="sendVerificationCode"
              :disabled="!canSendCode || sendingCode"
            >
              {{ sendingCode ? '发送中...' : (countdown > 0 ? `${countdown}s` : '获取验证码') }}
            </button>
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
  </div>
</template>

<script>
import authService from '@/services/authService'

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
        verificationCode: ''
      },
      loading: false,
      sendingCode: false,
      countdown: 0,
      countdownTimer: null
    }
  },
  computed: {
    canSendCode() {
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/
      return phoneRegex.test(this.registerForm.phone) && this.countdown === 0
    }
  },
  methods: {
    getIdLabel() {
      if (this.registerForm.userType === 'student') {
        return '学号'
      } else if (this.registerForm.userType === 'teacher') {
        return '工号'
      } else {
        return '学号/工号'
      }
    },
    
    getIdPlaceholder() {
      if (this.registerForm.userType === 'student') {
        return '请输入学号'
      } else if (this.registerForm.userType === 'teacher') {
        return '请输入工号'
      } else {
        return '请输入学号或工号'
      }
    },
    async sendVerificationCode() {
      if (!this.canSendCode) return
      
      this.sendingCode = true
      try {
        const result = await authService.sendVerificationCode({
          phone: this.registerForm.phone,
          type: 'register'
        })
        
        if (result.code === 200) {
          alert('验证码已发送到您的手机，请注意查收')
          this.startCountdown()
        } else {
          alert(result.message || '验证码发送失败')
        }
      } catch (error) {
        console.error('验证码发送失败:', error)
        alert('验证码发送失败，请重试')
      } finally {
        this.sendingCode = false
      }
    },
    
    startCountdown() {
      this.countdown = 60
      this.countdownTimer = setInterval(() => {
        this.countdown--
        if (this.countdown === 0) {
          clearInterval(this.countdownTimer)
          this.countdownTimer = null
        }
      }, 1000)
    },
    
    async handleRegister() {
      // 验证必填字段
      if (!this.registerForm.realName || !this.registerForm.userType || 
          !this.registerForm.school || !this.registerForm.studentId || 
          !this.registerForm.phone || !this.registerForm.verificationCode) {
        alert('请填写所有必填字段')
        return
      }

      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(this.registerForm.phone)) {
        alert('请输入正确的手机号码')
        return
      }
      
      // 验证验证码格式
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
          alert(`认证成功！您的角色是：${result.data.userType}，用户名：${result.data.username}，初始密码已通过短信发送到您的手机`)
          this.$router.push('/login')
        } else {
          alert(result.message || '认证失败，请检查信息是否正确')
        }
      } catch (error) {
        console.error('注册失败:', error)
        alert('认证失败，请重试')
      } finally {
        this.loading = false
      }
    }
  },
  
  beforeUnmount() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  }
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
}

.form-input:hover {
  border-color: #4096ff;
}

.form-input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
}

.verification-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.verification-input {
  flex: 1;
}

.verification-btn {
  padding: 0 14px;
  border: 1px solid #1677ff;
  background: #ffffff;
  color: #1677ff;
  border-radius: 4px;
  font-size: 14px;
  height: 40px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  min-width: 104px;
  font-family: inherit;
}

.verification-btn:hover:not(:disabled) {
  background: #e6f4ff;
}

.verification-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.register-btn:hover:not(:disabled) {
  background: #4096ff;
}

.register-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

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

.login-link:hover {
  color: #4096ff;
  text-decoration: underline;
}
</style> 