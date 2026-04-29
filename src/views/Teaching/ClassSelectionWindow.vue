<template>
  <div class="class-selection-window">
    <div class="page-header">
      <div class="header-left">
        <h1>选课时间窗口管理</h1>
      </div>
    </div>

    <!-- 当前窗口状态 -->
    <el-card class="status-section" shadow="hover">
      <template #header>
        <span class="card-title">当前选课窗口状态</span>
      </template>
      <div v-loading="loadingStatus" class="status-content">
        <template v-if="currentWindow">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="学期">{{ currentWindow.semester }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="isOpen ? 'success' : 'info'" effect="dark">
                {{ isOpen ? '开放中' : '已关闭' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ formatDateTime(currentWindow.startTime) }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ formatDateTime(currentWindow.endTime) }}</el-descriptions-item>
            <el-descriptions-item v-if="isOpen" label="剩余时间" :span="2">
              <span class="remaining-time">{{ remainingText }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </template>
        <el-empty v-else description="暂未设置选课时间窗口" :image-size="80" />
      </div>
    </el-card>

    <!-- 设置表单 -->
    <el-card class="form-section" shadow="hover">
      <template #header>
        <span class="card-title">{{ currentWindow ? '更新选课窗口' : '创建选课窗口' }}</span>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="max-width: 600px"
      >
        <el-form-item label="学期" prop="semester">
          <el-input v-model="form.semester" placeholder="例如：2026春季" clearable />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">
            {{ currentWindow ? '更新窗口' : '创建窗口' }}
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { api } from '@/services/api'
import { ElMessage } from 'element-plus'

export default {
  name: 'ClassSelectionWindow',
  data() {
    return {
      loadingStatus: false,
      saving: false,
      currentWindow: null,
      remainingText: '',
      remainingTimer: null,
      form: {
        semester: '',
        startTime: '',
        endTime: ''
      },
      rules: {
        semester: [{ required: true, message: '请输入学期', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
      }
    }
  },
  computed: {
    isOpen() {
      if (!this.currentWindow) return false
      const now = Date.now()
      const start = new Date(this.currentWindow.startTime).getTime()
      const end = new Date(this.currentWindow.endTime).getTime()
      return now >= start && now <= end
    }
  },
  mounted() {
    this.loadCurrentWindow()
  },
  beforeUnmount() {
    clearInterval(this.remainingTimer)
  },
  methods: {
    async loadCurrentWindow() {
      try {
        this.loadingStatus = true
        const res = await api.classSelectionWindow.get()
        const data = res.data || res
        if (data && data.id) {
          this.currentWindow = data
          this.form.semester = data.semester || ''
          this.form.startTime = data.startTime || ''
          this.form.endTime = data.endTime || ''
          this.startRemainingTimer()
        } else {
          this.currentWindow = null
        }
      } catch (e) {
        console.error('加载选课窗口失败:', e)
      } finally {
        this.loadingStatus = false
      }
    },

    startRemainingTimer() {
      clearInterval(this.remainingTimer)
      this.updateRemaining()
      this.remainingTimer = setInterval(() => this.updateRemaining(), 1000)
    },

    updateRemaining() {
      if (!this.currentWindow) return
      const end = new Date(this.currentWindow.endTime).getTime()
      const diff = end - Date.now()
      if (diff <= 0) {
        this.remainingText = '已结束'
        clearInterval(this.remainingTimer)
        return
      }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      const parts = []
      if (days > 0) parts.push(`${days}天`)
      if (hours > 0) parts.push(`${hours}小时`)
      parts.push(`${minutes}分${seconds}秒`)
      this.remainingText = parts.join(' ')
    },

    async handleSave() {
      try {
        await this.$refs.formRef.validate()
      } catch {
        return
      }

      if (new Date(this.form.endTime) <= new Date(this.form.startTime)) {
        ElMessage.warning('结束时间必须晚于开始时间')
        return
      }

      try {
        this.saving = true
        const payload = { ...this.form }
        if (this.currentWindow && this.currentWindow.id) {
          await api.classSelectionWindow.update(this.currentWindow.id, payload)
          ElMessage.success('更新成功')
        } else {
          await api.classSelectionWindow.create(payload)
          ElMessage.success('创建成功')
        }
        await this.loadCurrentWindow()
      } catch (e) {
        ElMessage.error('保存失败：' + (e.message || '未知错误'))
      } finally {
        this.saving = false
      }
    },

    resetForm() {
      if (this.currentWindow) {
        this.form.semester = this.currentWindow.semester || ''
        this.form.startTime = this.currentWindow.startTime || ''
        this.form.endTime = this.currentWindow.endTime || ''
      } else {
        this.form = { semester: '', startTime: '', endTime: '' }
      }
    },

    formatDateTime(val) {
      if (!val) return '-'
      return new Date(val).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.class-selection-window {
  padding: 20px;
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h1 {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.status-section {
  margin-bottom: 24px;
}

.status-content {
  min-height: 80px;
}

.remaining-time {
  color: #e6a23c;
  font-weight: 600;
  font-size: 15px;
}

.form-section {
  margin-bottom: 24px;
}
</style>
