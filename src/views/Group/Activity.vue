<template>
  <div class="activity-management">
    <el-card class="box-card">
      <template #header>
        <div class="clearfix">
          <span class="page-title">课外活动管理</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="card">
        <!-- 活动审核 -->
        <el-tab-pane label="活动审核" name="activities">
          <div class="tab-content">
            <div class="filter-bar">
              <el-form :inline="true" :model="activityFilters" class="filter-form">
                <el-form-item label="审核状态:">
                  <el-select v-model="activityFilters.approvalStatus" placeholder="选择状态" clearable>
                    <el-option label="待审核" value="PENDING"></el-option>
                    <el-option label="已通过" value="APPROVED"></el-option>
                    <el-option label="已拒绝" value="REJECTED"></el-option>
                    <el-option label="草稿" value="DRAFT"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="活动类别:">
                  <el-select v-model="activityFilters.category" placeholder="选择活动类别" clearable>
                    <el-option label="跑步" value="跑步"></el-option>
                    <el-option label="球类" value="球类"></el-option>
                    <el-option label="健身" value="健身"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="loadActivities">查询</el-button>
                  <el-button @click="resetActivityFilters">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <el-table :data="activities" v-loading="activitiesLoading" stripe>
              <el-table-column prop="title" label="活动标题" min-width="200"></el-table-column>
              <el-table-column prop="organizer" label="组织者" width="120"></el-table-column>
              <el-table-column prop="category" label="类别" width="120"></el-table-column>
              <el-table-column prop="location" label="地点" width="150"></el-table-column>
              <el-table-column prop="activityStartTime" label="开始时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.activityStartTime || row.activity_start_time) }}
                </template>
              </el-table-column>
              <el-table-column prop="approvalStatus" label="审核状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.approvalStatus || row.approval_status)">
                    {{ getStatusText(row.approvalStatus || row.approval_status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="320">
                <template #default="{ row }">
                  <div class="activity-action-buttons">
                    <el-button size="mini" @click="viewActivity(row)">查看</el-button>
                    <el-button size="mini" type="info" @click="viewAttendanceRecords(row)">查看签到记录</el-button>
                    <el-button 
                      v-if="(row.approvalStatus || row.approval_status) === 'PENDING'"
                      size="mini" 
                      type="success" 
                      @click="approveActivity(row)">
                      通过
                    </el-button>
                    <el-button 
                      v-if="(row.approvalStatus || row.approval_status) === 'PENDING'"
                      size="mini" 
                      type="danger" 
                      @click="rejectActivity(row)">
                      拒绝
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            
            <el-pagination
              @size-change="handleActivitySizeChange"
              @current-change="handleActivityCurrentChange"
              :current-page="activityPagination.currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="activityPagination.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="activityPagination.total">
            </el-pagination>
          </div>
        </el-tab-pane>

        <!-- 签到记录 -->
        <el-tab-pane label="签到记录" name="attendance">
          <div class="tab-content">
            <div class="filter-bar">
              <el-form :inline="true" :model="attendanceFilters" class="filter-form">
                <el-form-item label="活动ID:">
                  <el-input v-model="attendanceFilters.activityId" placeholder="输入活动ID" clearable></el-input>
                </el-form-item>
                <el-form-item label="学号:">
                  <el-input v-model="attendanceFilters.studentId" placeholder="输入学号" clearable></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="loadAttendanceRecords">查询</el-button>
                  <el-button @click="resetAttendanceFilters">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <el-table :data="attendanceRecords" v-loading="attendanceLoading" stripe>
              <el-table-column prop="userName" label="姓名" width="120">
                <template #default="{ row }">
                  {{ row.userName || row.user_name }}
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
              <el-table-column prop="duration" label="参与时长(分钟)" width="120"></el-table-column>
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
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 活动详情对话框 -->
    <el-dialog title="活动详情" v-model="activityDetailVisible" width="60%">
      <div v-if="currentActivity">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动标题">{{ currentActivity.title }}</el-descriptions-item>
          <el-descriptions-item label="组织者">{{ currentActivity.organizer }}</el-descriptions-item>
          <el-descriptions-item label="活动类别">{{ currentActivity.category }}</el-descriptions-item>
          <el-descriptions-item label="地点">{{ currentActivity.location }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusType(currentActivity.approvalStatus || currentActivity.approval_status)">
              {{ getStatusText(currentActivity.approvalStatus || currentActivity.approval_status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="活动描述" :span="2">{{ currentActivity.description }}</el-descriptions-item>
        </el-descriptions>
        
        <div v-if="(currentActivity.approvalStatus || currentActivity.approval_status) === 'PENDING'" style="margin-top: 20px;">
          <h4>活动审核</h4>
          <el-form :model="approvalForm" label-width="80px">
            <el-form-item label="审核结果">
              <el-radio-group v-model="approvalForm.status">
                <el-radio label="APPROVED">通过</el-radio>
                <el-radio label="REJECTED">拒绝</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="审核意见">
              <el-input 
                type="textarea" 
                v-model="approvalForm.comment" 
                placeholder="请输入审核意见"
                :rows="3">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitApproval">提交审核</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'ActivityManagement',
  data() {
    return {
      activeTab: 'activities',
      
      // 活动审核相关
      activities: [],
      activitiesLoading: false,
      activityFilters: {
        approvalStatus: '',
        category: ''
      },
      activityPagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      activityDetailVisible: false,
      currentActivity: null,
      approvalForm: {
        status: 'APPROVED',
        comment: ''
      },
      
      // 签到记录相关
      attendanceRecords: [],
      attendanceLoading: false,
      attendanceFilters: {
        activityId: '',
        studentId: ''
      }
    }
  },
  mounted() {
    this.loadActivities()
  },
  methods: {
    // 活动管理方法
    async loadActivities() {
      this.activitiesLoading = true
      try {
        const params = {
          page: this.activityPagination.currentPage,
          pageSize: this.activityPagination.pageSize,
          ...this.activityFilters
        }
        const response = await api.peManagement.getActivities(params)
        console.log('活动列表响应:', response)
        
        if (response.data && response.data.code === 200) {
          this.activities = Array.isArray(response.data.data?.list) ? response.data.data.list : []
          this.activityPagination.total = response.data.data?.total || 0
        } else if (response.code === 200) {
          this.activities = Array.isArray(response.data?.list) ? response.data.list : []
          this.activityPagination.total = response.data?.total || 0
        } else {
          this.activities = []
        }
      } catch (error) {
        console.error('加载活动列表失败:', error)
        this.$message.error('加载活动列表失败：' + (error.message || '网络错误'))
        this.activities = []
      } finally {
        this.activitiesLoading = false
      }
    },
    
    resetActivityFilters() {
      this.activityFilters = {
        approvalStatus: '',
        category: ''
      }
      this.activityPagination.currentPage = 1
      this.loadActivities()
    },
    
    viewActivity(activity) {
      this.currentActivity = activity
      this.activityDetailVisible = true
    },
    
    viewAttendanceRecords(activity) {
      // 切换到签到记录标签页
      this.activeTab = 'attendance'
      // 设置活动ID并自动查询
      this.attendanceFilters.activityId = activity.id
      this.attendanceFilters.studentId = '' // 清空学号过滤
      this.loadAttendanceRecords()
    },
    
    approveActivity(activity) {
      this.viewActivity(activity)
    },
    
    rejectActivity(activity) {
      this.viewActivity(activity)
    },
    
    async submitApproval() {
      if (!this.approvalForm.comment.trim()) {
        this.$message.warning('请输入审核意见')
        return
      }
      
      try {
        const response = await api.peManagement.reviewActivity(this.currentActivity.id, {
          status: this.approvalForm.status,
          comment: this.approvalForm.comment
        })
        
        if (response.code === 200) {
          this.$message.success('审核提交成功')
          this.activityDetailVisible = false
          this.loadActivities()
        }
      } catch (error) {
        this.$message.error('审核失败：' + error.message)
      }
    },
    
    handleActivitySizeChange(val) {
      this.activityPagination.pageSize = val
      this.activityPagination.currentPage = 1
      this.loadActivities()
    },
    
    handleActivityCurrentChange(val) {
      this.activityPagination.currentPage = val
      this.loadActivities()
    },
    
    // 签到记录方法
    async loadAttendanceRecords() {
      this.attendanceLoading = true
      try {
        // 构建请求参数，只有当字段有值时才添加到参数中
        const params = {}
        if (this.attendanceFilters.activityId?.trim()) {
          params.activityId = this.attendanceFilters.activityId.trim()
        }
        if (this.attendanceFilters.studentId?.trim()) {
          params.studentId = this.attendanceFilters.studentId.trim()
        }
        
        const response = await api.peManagement.getAttendanceRecords(params)
        if (response.code === 200) {
          this.attendanceRecords = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.list || response.data?.items || [])
        } else {
          this.attendanceRecords = []
        }
      } catch (error) {
        console.error('加载签到记录失败:', error)
        this.$message.error('加载签到记录失败：' + (error.message || '网络错误'))
        this.attendanceRecords = []
      } finally {
        this.attendanceLoading = false
      }
    },
    
    resetAttendanceFilters() {
      this.attendanceFilters = {
        activityId: '',
        studentId: ''
      }
    },
    
    // 标签页切换
    async handleTabChange() {
      switch (this.activeTab) {
        case 'activities':
          await this.loadActivities()
          break
        case 'attendance':
          break
      }
    },
    
    // 工具方法
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    },
    
    getStatusType(status) {
      const types = {
        'PENDING': 'warning',
        'APPROVED': 'success',
        'REJECTED': 'danger',
        'DRAFT': 'info'
      }
      return types[status] || 'info'
    },
    
    getStatusText(status) {
      const texts = {
        'PENDING': '待审核',
        'APPROVED': '已通过',
        'REJECTED': '已拒绝',
        'DRAFT': '草稿'
      }
      return texts[status] || status
    }
  },
  watch: {
    activeTab() {
      this.handleTabChange()
    }
  }
}
</script>

<style scoped>
.activity-management {
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

.filter-bar {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
}

.filter-form {
  margin: 0;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

/* 活动操作按钮样式 */
.activity-action-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
}

.activity-action-buttons .el-button {
  margin: 0;
  font-size: 12px;
  padding: 4px 8px;
  white-space: nowrap;
}

.el-pagination {
  margin-top: 20px;
  text-align: right;
}
</style>

