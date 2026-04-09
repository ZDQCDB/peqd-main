<template>
  <div class="morning-exercise">
    <el-card class="box-card">
      <template #header>
        <div class="header-row">
          <span class="page-title">{{ pageHeaderTitle }}</span>
          <span v-if="isSchoolLevel" class="page-sub">统计大屏</span>
        </div>
      </template>

      <!-- 统计大屏 -->
      <section class="dashboard-section">
        <el-alert
          v-if="dashboardNotice"
          type="info"
          show-icon
          :closable="false"
          class="dashboard-alert dashboard-notice-multiline"
          :title="dashboardNotice"
        />

        <div class="dashboard-toolbar">
          <el-date-picker
            v-model="dashboardRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            unlink-panels
            :shortcuts="dateShortcuts"
            @change="onDashboardRangeChange"
          />
          <el-button type="primary" :loading="dashboardLoading" @click="loadDashboard">
            刷新统计
          </el-button>
        </div>

        <div v-loading="dashboardLoading" class="dashboard-summary">
          <template v-if="dashboardData">
            <p class="summary-text">
              统计区间：{{ dashboardData.startDate }} ~ {{ dashboardData.endDate }}，
              场次：<strong>{{ dashboardData.exerciseCount }}</strong>
            </p>

            <div v-if="dashboardData.showCollegeStats && collegeRows.length" class="table-block">
              <h3 class="block-title">院系统计（出勤率）</h3>
              <p class="block-hint">
                口径：已签退计为出勤；未签到或签到未签退计为未出勤。人次 = 每场早操对应院系应到学生数之和。
                表中仅列出所选时间内有早操场次的院系；无场次的学院不展示。
              </p>
              <el-table :data="collegeRows" stripe border size="small">
                <el-table-column prop="schoolName" label="学校" min-width="120" />
                <el-table-column prop="collegeName" label="院系" min-width="140" />
                <el-table-column prop="studentHeadcount" label="在籍学生" width="100" />
                <el-table-column prop="totalSlots" label="应考勤人次" width="110" />
                <el-table-column prop="presentSlots" label="出勤人次" width="100" />
                <el-table-column prop="absentSlots" label="未出勤人次" width="110" />
                <el-table-column label="出勤率" width="100">
                  <template #default="{ row }">
                    {{ formatPercent(row.attendanceRatePercent) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div v-if="classRows.length" class="table-block">
              <h3 class="block-title">班级统计（出勤率）</h3>
              <p v-if="dashboardData.showCollegeStats" class="block-hint">
                班级数据来自上述区间内的早操场次；未发布场次的学院下班级不会出现在表中。
              </p>
              <p v-else class="block-hint">
                以下统计仅含所选日期范围内本院已发布早操的班级与人次口径（已签退计出勤）。
              </p>
              <el-table :data="classRows" stripe border size="small">
                <el-table-column v-if="showSchoolInClassTable" prop="schoolName" label="学校" min-width="120" />
                <el-table-column prop="collegeName" label="院系" min-width="140" />
                <el-table-column prop="className" label="班级" min-width="120" />
                <el-table-column prop="studentHeadcount" label="在籍人数" width="100" />
                <el-table-column prop="totalSlots" label="应考勤人次" width="110" />
                <el-table-column prop="presentSlots" label="出勤人次" width="100" />
                <el-table-column prop="absentSlots" label="未出勤人次" width="110" />
                <el-table-column label="出勤率" width="100">
                  <template #default="{ row }">
                    {{ formatPercent(row.attendanceRatePercent) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <el-empty
              v-if="!collegeRows.length && !classRows.length"
              description="当前区间内无有效早操或与学籍院系未匹配的数据"
            />
          </template>
        </div>
      </section>

      <!-- 院级：发布与列表 -->
      <template v-if="isDeptAdmin">
        <el-divider content-position="left">早操发布与记录</el-divider>

        <div class="tab-content">
          <div class="action-bar">
            <el-button type="primary" @click="showCreateMorningExercise">发布早操活动</el-button>
          </div>

          <el-table :data="morningExercises" v-loading="morningExercisesLoading" stripe>
            <el-table-column prop="title" label="活动标题" width="200" />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="startTime" label="开始时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.startTime || row.start_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="endTime" label="结束时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.endTime || row.end_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="location" label="地点" width="120" />
            <el-table-column prop="checkedInCount" label="签到人数" width="100">
              <template #default="{ row }">
                {{ row.checkedInCount || row.checked_in_count || 0 }}
              </template>
            </el-table-column>
            <el-table-column prop="checkedOutCount" label="签退人数" width="100">
              <template #default="{ row }">
                {{ row.checkedOutCount || row.checked_out_count || 0 }}
              </template>
            </el-table-column>
            <el-table-column prop="isActive" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="(row.isActive || row.is_active) ? 'success' : 'info'">
                  {{ (row.isActive || row.is_active) ? '活跃' : '已结束' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="viewMorningExerciseDetail(row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </el-card>

    <!-- 发布早操活动对话框 -->
    <el-dialog v-if="isDeptAdmin" v-model="createMorningExerciseVisible" title="发布早操活动" width="50%">
      <el-form
        ref="morningExerciseForm"
        :model="morningExerciseForm"
        :rules="morningExerciseRules"
        label-width="100px"
      >
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="morningExerciseForm.title" />
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input v-model="morningExerciseForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="活动地点" prop="location">
          <el-input v-model="morningExerciseForm.location" />
        </el-form-item>
        <el-form-item label="活动日期" prop="date">
          <el-date-picker v-model="morningExerciseForm.date" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker v-model="morningExerciseForm.startTime" placeholder="选择开始时间" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker v-model="morningExerciseForm.endTime" placeholder="选择结束时间" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createMorningExerciseVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMorningExercise">发布</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 早操详情对话框 -->
    <el-dialog v-model="morningExerciseDetailVisible" title="早操考勤详情" width="80%">
      <div v-if="currentMorningExercise">
        <el-descriptions :column="3" border class="mb-20">
          <el-descriptions-item label="活动标题">{{ currentMorningExercise.title }}</el-descriptions-item>
          <el-descriptions-item label="日期">{{ currentMorningExercise.date }}</el-descriptions-item>
          <el-descriptions-item label="地点">{{ currentMorningExercise.location }}</el-descriptions-item>
          <el-descriptions-item label="签到人数">
            {{ currentMorningExercise.checkedInCount || currentMorningExercise.checked_in_count || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="签退人数">
            {{ currentMorningExercise.checkedOutCount || currentMorningExercise.checked_out_count || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="(currentMorningExercise.isActive || currentMorningExercise.is_active) ? 'success' : 'info'">
              {{ (currentMorningExercise.isActive || currentMorningExercise.is_active) ? '活跃' : '已结束' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <h3>考勤记录</h3>
        <el-table :data="morningAttendanceRecords" v-loading="morningAttendanceLoading" stripe>
          <el-table-column prop="studentName" label="姓名" width="120">
            <template #default="{ row }">
              {{ row.studentName || row.student_name }}
            </template>
          </el-table-column>
          <el-table-column prop="studentId" label="学号" width="120">
            <template #default="{ row }">
              {{ row.studentId || row.student_id }}
            </template>
          </el-table-column>
          <el-table-column prop="checkInTime" label="签到时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.checkInTime || row.check_in_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="checkOutTime" label="签退时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.checkOutTime || row.check_out_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="checkedByName" label="签到员" width="120">
            <template #default="{ row }">
              {{ row.checkedByName || row.checked_by_name }}
            </template>
          </el-table-column>
          <el-table-column prop="pointsEarned" label="获得积分" width="100">
            <template #default="{ row }">
              {{ row.pointsEarned || row.points_earned }}
            </template>
          </el-table-column>
          <el-table-column prop="isCheckedOut" label="签退状态" width="100">
            <template #default="{ row }">
              <el-tag :type="(row.isCheckedOut || row.is_checked_out) ? 'success' : 'warning'">
                {{ (row.isCheckedOut || row.is_checked_out) ? '已签退' : '未签退' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/services/api'
import permissionManager, {
  isDepartmentAdmin,
  isSchoolAdmin,
  isSuperAdmin
} from '@/utils/permissionManager'

export default {
  name: 'MorningExercise',
  data() {
    return {
      dashboardLoading: false,
      dashboardData: null,
      dashboardRange: null,
      dateShortcuts: [
        {
          text: '最近7天',
          value: () => {
            const e = new Date()
            const s = new Date()
            s.setDate(s.getDate() - 6)
            return [s, e]
          }
        },
        {
          text: '最近30天',
          value: () => {
            const e = new Date()
            const s = new Date()
            s.setDate(s.getDate() - 29)
            return [s, e]
          }
        }
      ],
      morningExercises: [],
      morningExercisesLoading: false,
      createMorningExerciseVisible: false,
      morningExerciseDetailVisible: false,
      currentMorningExercise: null,
      morningExerciseForm: {
        title: '早操考勤',
        description: '',
        location: '操场',
        date: '',
        startTime: '',
        endTime: ''
      },
      morningExerciseRules: {
        title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
        location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
        date: [{ required: true, message: '请选择活动日期', trigger: 'change' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
      },
      morningAttendanceRecords: [],
      morningAttendanceLoading: false
    }
  },
  computed: {
    isSchoolLevel() {
      return isSchoolAdmin() || isSuperAdmin()
    },
    isDeptAdmin() {
      return isDepartmentAdmin()
    },
    pageHeaderTitle() {
      return this.isSchoolLevel ? '早操出勤统计' : '早操管理'
    },
    dashboardNotice() {
      if (this.dashboardData && this.dashboardData.notice) {
        return this.dashboardData.notice
      }
      if (this.isSchoolLevel) {
        return '早操活动仅院级管理员可发布与维护；校级可查看本校早操出勤统计。\n说明：院系统计、班级统计均仅基于所选日期范围内已发布的早操场次；无场次的学院不会出现在表中，并非权限限制。'
      }
      return '以下为本院班级出勤统计（仅统计所选日期范围内已发布的早操场次）；院系统计仅校级管理员可见。'
    },
    collegeRows() {
      const c = this.dashboardData && this.dashboardData.colleges
      return Array.isArray(c) ? c : []
    },
    classRows() {
      const c = this.dashboardData && this.dashboardData.classes
      return Array.isArray(c) ? c : []
    },
    showSchoolInClassTable() {
      if (!this.classRows.length) return false
      if (isSuperAdmin()) return true
      const first = this.classRows[0].schoolName
      return this.classRows.some((r) => r.schoolName !== first)
    }
  },
  mounted() {
    if (!permissionManager.initialized) {
      try {
        const raw = localStorage.getItem('userInfo')
        if (raw) {
          const u = JSON.parse(raw)
          if (u && u.userType) permissionManager.init(u.userType)
        }
      } catch (_) {
        /* ignore */
      }
    }
    this.initDashboardRange()
    this.loadDashboard()
    if (this.isDeptAdmin) {
      this.loadMorningExercises()
    }
  },
  methods: {
    initDashboardRange() {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 29)
      const f = (d) => {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
      }
      this.dashboardRange = [f(start), f(end)]
    },

    onDashboardRangeChange() {
      this.loadDashboard()
    },

    async loadDashboard() {
      this.dashboardLoading = true
      try {
        const range = this.dashboardRange
        const params = {}
        if (Array.isArray(range) && range.length === 2 && range[0] && range[1]) {
          params.startDate = range[0]
          params.endDate = range[1]
        }
        const res = await api.peManagement.getMorningAttendanceDashboard(params)
        if (res && res.code === 200) {
          this.dashboardData = res.data || null
        } else {
          this.dashboardData = null
          this.$message.error((res && res.message) || '加载统计失败')
        }
      } catch (error) {
        console.error('加载早操统计失败:', error)
        this.$message.error('加载统计失败：' + (error.message || '网络错误'))
        this.dashboardData = null
      } finally {
        this.dashboardLoading = false
      }
    },

    formatPercent(v) {
      if (v == null || Number.isNaN(Number(v))) return '-'
      return `${Number(v).toFixed(2)}%`
    },

    showCreateMorningExercise() {
      this.createMorningExerciseVisible = true
    },

    async loadMorningExercises() {
      this.morningExercisesLoading = true
      try {
        const response = await api.peManagement.getMorningExercises()

        let payload = null
        if (response && response.code === 200) {
          payload = response.data
        } else if (response && response.data && response.data.code === 200) {
          payload = response.data.data
        }

        if (payload && Array.isArray(payload.list)) {
          this.morningExercises = payload.list
        } else if (payload && Array.isArray(payload)) {
          this.morningExercises = payload
        } else {
          this.morningExercises = []
        }
      } catch (error) {
        console.error('加载早操列表失败:', error)
        this.$message.error('加载早操列表失败：' + (error.message || '网络错误'))
        this.morningExercises = []
      } finally {
        this.morningExercisesLoading = false
      }
    },

    async viewMorningExerciseDetail(exercise) {
      this.currentMorningExercise = exercise
      this.morningExerciseDetailVisible = true
      await this.loadMorningAttendanceRecords(exercise.id)
    },

    async loadMorningAttendanceRecords(exerciseId) {
      this.morningAttendanceLoading = true
      try {
        const response = await api.peManagement.getMorningAttendanceRecords(exerciseId)
        let records = []
        if (response && response.code === 200) {
          const d = response.data
          records = Array.isArray(d) ? d : (d && (d.list || d.items)) || []
        } else if (response && response.data && response.data.code === 200) {
          const d = response.data.data
          records = Array.isArray(d) ? d : (d && (d.list || d.items)) || []
        }
        this.morningAttendanceRecords = records
      } catch (error) {
        console.error('加载考勤记录失败:', error)
        this.$message.error('加载考勤记录失败：' + (error.message || '网络错误'))
        this.morningAttendanceRecords = []
      } finally {
        this.morningAttendanceLoading = false
      }
    },

    async submitMorningExercise() {
      this.$refs.morningExerciseForm.validate(async (valid) => {
        if (!valid) return
        try {
          const formData = {
            ...this.morningExerciseForm,
            date: this.formatDate(this.morningExerciseForm.date),
            startTime: this.combineDateTime(this.morningExerciseForm.date, this.morningExerciseForm.startTime),
            endTime: this.combineDateTime(this.morningExerciseForm.date, this.morningExerciseForm.endTime)
          }

          const response = await api.peManagement.createMorningExercise(formData)

          if (response && response.code === 200) {
            this.$message.success('早操活动发布成功')
            this.createMorningExerciseVisible = false
            await this.loadMorningExercises()
            await this.loadDashboard()
          } else {
            this.$message.error((response && response.message) || '发布失败')
          }
        } catch (error) {
          this.$message.error('发布失败：' + (error.message || ''))
        }
      })
    },

    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    },

    formatDate(date) {
      if (!date) return ''
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    combineDateTime(date, time) {
      if (!date || !time) return ''

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`

      const hours = String(time.getHours()).padStart(2, '0')
      const minutes = String(time.getMinutes()).padStart(2, '0')
      const seconds = String(time.getSeconds()).padStart(2, '0')
      const timeStr = `${hours}:${minutes}:${seconds}`

      return `${dateStr} ${timeStr}`
    }
  }
}
</script>

<style scoped>
.morning-exercise {
  padding: 20px;
}

.header-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #000000d9;
}

.page-sub {
  font-size: 13px;
  color: #909399;
}

.dashboard-section {
  padding-bottom: 8px;
}

.dashboard-alert {
  margin-bottom: 16px;
}

/* 公告内换行展示（与后端 notice 中 \n 一致） */
.dashboard-notice-multiline :deep(.el-alert__title) {
  white-space: pre-line;
  line-height: 1.55;
}

.dashboard-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.dashboard-summary {
  min-height: 120px;
}

.summary-text {
  margin: 0 0 16px;
  color: #606266;
  font-size: 14px;
}

.block-title {
  margin: 20px 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.block-hint {
  margin: 0 0 12px;
  font-size: 12px;
  color: #909399;
}

.table-block {
  margin-bottom: 24px;
}

.tab-content {
  padding: 12px 0 0;
}

.action-bar {
  margin-bottom: 20px;
  padding: 15px;
  background: var(--bg-body);
  border-radius: 6px;
}

.dialog-footer {
  text-align: right;
}

.mb-20 {
  margin-bottom: 20px;
}

.el-descriptions {
  margin-bottom: 20px;
}
</style>
