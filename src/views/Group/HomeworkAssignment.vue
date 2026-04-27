<template>
  <div class="homework-assignment">
    <el-button :icon="ArrowLeft" text @click="$router.back()" class="back-btn">返回</el-button>

    <!-- 发布课后作业 -->
    <el-card class="publish-card" shadow="hover">
      <template #header>
        <div class="card-title">
          <el-icon><EditPen /></el-icon>
          <span>发布课后作业</span>
        </div>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
        label-position="top"
        class="publish-form"
      >
        <div class="form-grid">
          <el-form-item label="临时班级" prop="tempClassId">
            <el-select
              v-model="form.tempClassId"
              placeholder="请选择临时班级"
              filterable
              :loading="tempClassLoading"
              style="width: 100%"
            >
              <el-option
                v-for="cls in tempClasses"
                :key="cls.id"
                :label="cls.name"
                :value="cls.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="运动类型" prop="exerciseType">
            <el-select v-model="form.exerciseType" placeholder="请选择运动类型" style="width: 100%">
              <el-option
                v-for="t in exerciseTypes"
                :key="t.value"
                :label="t.label"
                :value="t.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="要求完成个数" prop="requiredCount">
            <el-input-number
              v-model="form.requiredCount"
              :min="1"
              :max="9999"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="作业标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入作业标题" maxlength="100" show-word-limit />
          </el-form-item>

          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="form.startTime"
              type="datetime"
              placeholder="选择开始时间"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="截止时间" prop="deadline">
            <el-date-picker
              v-model="form.deadline"
              type="datetime"
              placeholder="选择截止时间"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </div>

        <div class="form-actions">
          <el-button type="primary" :loading="submitting" @click="handleSubmit" :icon="Check">
            发布作业
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 已发布作业 -->
    <el-card class="list-card" shadow="hover">
      <template #header>
        <div class="card-title">
          <el-icon><List /></el-icon>
          <span>已发布作业</span>
          <el-button
            type="primary"
            :icon="Refresh"
            circle
            size="small"
            :loading="listLoading"
            @click="loadAssignments"
            class="refresh-btn"
          />
        </div>
      </template>

      <el-table :data="assignments" v-loading="listLoading" stripe border style="width: 100%">
        <el-table-column label="标题" prop="title" min-width="140" show-overflow-tooltip />
        <el-table-column label="运动类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="exerciseTagType(row.exerciseType)" effect="plain" size="small">
              {{ exerciseTypeLabel(row.exerciseType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="要求个数" prop="requiredCount" width="90" align="center" />
        <el-table-column label="临时班级" prop="tempClassName" min-width="120" show-overflow-tooltip />
        <el-table-column label="开始时间" width="170" align="center">
          <template #default="{ row }">{{ formatTime(row.startTime) }}</template>
        </el-table-column>
        <el-table-column label="截止时间" width="170" align="center">
          <template #default="{ row }">{{ formatTime(row.deadline) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row)" size="small">{{ statusLabel(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewCompletions(row)">
              查看完成情况
            </el-button>
            <el-popconfirm title="确认删除该作业？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 完成情况弹窗 -->
    <el-dialog
      v-model="completionDialogVisible"
      :title="`完成情况 - ${currentAssignment?.title || ''}`"
      width="720px"
      destroy-on-close
    >
      <div v-loading="completionLoading">
        <div v-if="completionStats" class="completion-summary">
          <div class="summary-item">
            <span class="summary-label">总人数</span>
            <span class="summary-value">{{ completionStats.totalStudents }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">已完成</span>
            <span class="summary-value success">{{ completionStats.completedCount }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">完成率</span>
            <span class="summary-value primary">{{ completionStats.completionRate }}%</span>
          </div>
        </div>
        <el-table :data="completions" stripe size="small" max-height="400">
          <el-table-column type="index" label="#" width="50" align="center" />
          <el-table-column label="学生姓名" prop="studentName" min-width="100" />
          <el-table-column label="学号" prop="studentNumber" min-width="120" />
          <el-table-column label="完成个数" prop="completedCount" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.completedCount >= (currentAssignment?.requiredCount || 0) ? 'success' : 'warning'" size="small">
                {{ row.completedCount ?? 0 }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.completed ? 'success' : 'info'" size="small">
                {{ row.completed ? '已完成' : '未完成' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="提交时间" min-width="160">
            <template #default="{ row }">{{ row.submittedAt ? formatTime(row.submittedAt) : '-' }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ArrowLeft, EditPen, List, Refresh, Check } from '@element-plus/icons-vue'
import api from '@/services/api'

const EXERCISE_TYPES = [
  { value: 'PUSH_UP', label: '俯卧撑' },
  { value: 'SIT_UP', label: '仰卧起坐' },
  { value: 'SQUAT', label: '深蹲' },
  { value: 'PULL_UP', label: '引体向上' },
  { value: 'JUMP_ROPE', label: '跳绳' },
  { value: 'JUMPING_JACK', label: '开合跳' },
  { value: 'HIGH_KNEES', label: '高抬腿' }
]

const TAG_TYPES = ['', 'success', 'warning', 'danger', 'info', 'primary']

export default {
  name: 'HomeworkAssignment',
  components: {},
  data() {
    return {
      ArrowLeft,
      EditPen,
      List,
      Refresh,
      Check,

      exerciseTypes: EXERCISE_TYPES,

      tempClasses: [],
      tempClassLoading: false,

      form: {
        tempClassId: null,
        exerciseType: '',
        requiredCount: 10,
        title: '',
        startTime: '',
        deadline: ''
      },
      formRules: {
        tempClassId: [{ required: true, message: '请选择临时班级', trigger: 'change' }],
        exerciseType: [{ required: true, message: '请选择运动类型', trigger: 'change' }],
        requiredCount: [{ required: true, message: '请输入要求完成个数', trigger: 'blur' }],
        title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
      },
      submitting: false,

      assignments: [],
      listLoading: false,

      completionDialogVisible: false,
      completionLoading: false,
      currentAssignment: null,
      completions: [],
      completionStats: null
    }
  },

  created() {
    this.loadTempClasses()
    this.loadAssignments()
  },

  methods: {
    async loadTempClasses() {
      this.tempClassLoading = true
      try {
        const res = await api.tempClasses.list()
        this.tempClasses = res?.data || res || []
      } catch (e) {
        console.error('加载临时班级失败:', e)
      } finally {
        this.tempClassLoading = false
      }
    },

    async loadAssignments() {
      this.listLoading = true
      try {
        const res = await api.homeworkAssignments.list()
        this.assignments = res?.data || res || []
      } catch (e) {
        console.error('加载作业列表失败:', e)
        this.$message.error('加载作业列表失败')
      } finally {
        this.listLoading = false
      }
    },

    async handleSubmit() {
      try {
        await this.$refs.formRef.validate()
      } catch {
        return
      }
      this.submitting = true
      try {
        await api.homeworkAssignments.create({
          tempClassId: this.form.tempClassId,
          exerciseType: this.form.exerciseType,
          requiredCount: this.form.requiredCount,
          title: this.form.title,
          startTime: this.form.startTime,
          deadline: this.form.deadline
        })
        this.$message.success('作业发布成功')
        this.resetForm()
        this.loadAssignments()
      } catch (e) {
        console.error('发布作业失败:', e)
        this.$message.error(e.message || '发布作业失败')
      } finally {
        this.submitting = false
      }
    },

    resetForm() {
      this.$refs.formRef?.resetFields()
      this.form.requiredCount = 10
    },

    async handleDelete(id) {
      try {
        await api.homeworkAssignments.delete(id)
        this.$message.success('删除成功')
        this.loadAssignments()
      } catch (e) {
        this.$message.error(e.message || '删除失败')
      }
    },

    async viewCompletions(row) {
      this.currentAssignment = row
      this.completionDialogVisible = true
      this.completionLoading = true
      this.completions = []
      this.completionStats = null
      try {
        const res = await api.homeworkAssignments.getCompletions(row.id)
        const data = res?.data || res || {}
        this.completions = data.records || data.completions || []
        this.completionStats = {
          totalStudents: data.totalStudents ?? this.completions.length,
          completedCount: data.completedCount ?? this.completions.filter(c => c.completed).length,
          completionRate: data.completionRate ?? (
            this.completions.length
              ? Math.round(this.completions.filter(c => c.completed).length / this.completions.length * 100)
              : 0
          )
        }
      } catch (e) {
        console.error('加载完成情况失败:', e)
        this.$message.error('加载完成情况失败')
      } finally {
        this.completionLoading = false
      }
    },

    exerciseTypeLabel(type) {
      return EXERCISE_TYPES.find(t => t.value === type)?.label || type
    },

    exerciseTagType(type) {
      const idx = EXERCISE_TYPES.findIndex(t => t.value === type)
      return TAG_TYPES[idx % TAG_TYPES.length] || ''
    },

    statusLabel(row) {
      const now = new Date()
      if (row.startTime && new Date(row.startTime) > now) return '未开始'
      if (row.deadline && new Date(row.deadline) < now) return '已截止'
      return '进行中'
    },

    statusTagType(row) {
      const label = this.statusLabel(row)
      if (label === '进行中') return 'success'
      if (label === '已截止') return 'info'
      return 'warning'
    },

    formatTime(t) {
      if (!t) return '-'
      const d = new Date(t)
      if (isNaN(d.getTime())) return t
      const pad = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
  }
}
</script>

<style scoped>
.homework-assignment {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.back-btn {
  margin-bottom: 16px;
}

/* Cards */
.publish-card,
.list-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.refresh-btn {
  margin-left: auto;
}

/* Form grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* Completion dialog */
.completion-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #f8f9fb;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #909399;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.summary-value.success {
  color: #67c23a;
}

.summary-value.primary {
  color: #409eff;
}

/* Table tweaks */
:deep(.el-table th.el-table__cell) {
  background: #f8f9fa;
  color: #606266;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .homework-assignment {
    padding: 12px;
  }
}
</style>
