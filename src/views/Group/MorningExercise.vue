<template>
  <div class="morning-exercise">
    <el-card class="box-card">
      <template #header>
        <div class="clearfix">
          <span class="page-title">早操管理</span>
        </div>
      </template>
      
      <div class="tab-content">
        <div class="action-bar">
          <el-button type="primary" @click="showCreateMorningExercise">发布早操活动</el-button>
        </div>
        
        <el-table :data="morningExercises" v-loading="morningExercisesLoading" stripe>
          <el-table-column prop="title" label="活动标题" width="200"></el-table-column>
          <el-table-column prop="date" label="日期" width="120"></el-table-column>
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
          <el-table-column prop="location" label="地点" width="120"></el-table-column>
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
              <el-button size="mini" @click="viewMorningExerciseDetail(row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 发布早操活动对话框 -->
    <el-dialog title="发布早操活动" v-model="createMorningExerciseVisible" width="50%">
      <el-form :model="morningExerciseForm" :rules="morningExerciseRules" ref="morningExerciseForm" label-width="100px">
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="morningExerciseForm.title"></el-input>
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input type="textarea" v-model="morningExerciseForm.description" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="活动地点" prop="location">
          <el-input v-model="morningExerciseForm.location"></el-input>
        </el-form-item>
        <el-form-item label="活动日期" prop="date">
          <el-date-picker v-model="morningExerciseForm.date" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker v-model="morningExerciseForm.startTime" placeholder="选择开始时间"></el-time-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker v-model="morningExerciseForm.endTime" placeholder="选择结束时间"></el-time-picker>
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
    <el-dialog title="早操考勤详情" v-model="morningExerciseDetailVisible" width="80%">
      <div v-if="currentMorningExercise">
        <el-descriptions :column="3" border class="mb-20">
          <el-descriptions-item label="活动标题">{{ currentMorningExercise.title }}</el-descriptions-item>
          <el-descriptions-item label="日期">{{ currentMorningExercise.date }}</el-descriptions-item>
          <el-descriptions-item label="地点">{{ currentMorningExercise.location }}</el-descriptions-item>
          <el-descriptions-item label="签到人数">{{ currentMorningExercise.checkedInCount || currentMorningExercise.checked_in_count || 0 }}</el-descriptions-item>
          <el-descriptions-item label="签退人数">{{ currentMorningExercise.checkedOutCount || currentMorningExercise.checked_out_count || 0 }}</el-descriptions-item>
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

export default {
  name: 'MorningExercise',
  data() {
    return {
      // 早操管理相关
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
  mounted() {
    this.loadMorningExercises()
  },
  methods: {
    // 早操管理方法
    showCreateMorningExercise() {
      this.createMorningExerciseVisible = true
    },
    
    async loadMorningExercises() {
      this.morningExercisesLoading = true
      try {
        const response = await api.peManagement.getMorningExercises()
        console.log('早操列表响应:', response)
        
        if (response.data && response.data.code === 200) {
          this.morningExercises = Array.isArray(response.data.data) 
            ? response.data.data 
            : (response.data.data?.list || response.data.data?.items || [])
        } else if (response.code === 200) {
          this.morningExercises = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.list || response.data?.items || [])
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
        if (response.code === 200) {
          this.morningAttendanceRecords = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.list || response.data?.items || [])
        } else {
          this.morningAttendanceRecords = []
        }
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
        if (valid) {
          try {
            const formData = {
              ...this.morningExerciseForm,
              date: this.formatDate(this.morningExerciseForm.date),
              startTime: this.combineDateTime(this.morningExerciseForm.date, this.morningExerciseForm.startTime),
              endTime: this.combineDateTime(this.morningExerciseForm.date, this.morningExerciseForm.endTime)
            }
            
            const response = await api.peManagement.createMorningExercise(formData)
            
            if (response.code === 200) {
              this.$message.success('早操活动发布成功')
              this.createMorningExerciseVisible = false
              this.loadMorningExercises()
            }
          } catch (error) {
            this.$message.error('发布失败：' + error.message)
          }
        }
      })
    },
    
    // 工具方法
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    },
    
    formatDate(date) {
      if (!date) return ''
      // 使用本地时间格式，避免时区转换问题
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    combineDateTime(date, time) {
      if (!date || !time) return ''
      
      // 获取日期部分 (YYYY-MM-DD)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      // 获取时间部分 (HH:mm:ss)
      const hours = String(time.getHours()).padStart(2, '0')
      const minutes = String(time.getMinutes()).padStart(2, '0')
      const seconds = String(time.getSeconds()).padStart(2, '0')
      const timeStr = `${hours}:${minutes}:${seconds}`
      
      // 组合成本地时间格式，避免时区转换问题
      return `${dateStr} ${timeStr}`
    }
  }
}
</script>

<style scoped>
.morning-exercise {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.tab-content {
  padding: 20px 0;
}

.action-bar {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
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