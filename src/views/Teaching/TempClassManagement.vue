<template>
  <div class="temp-class-management">
    <div class="page-header">
      <div class="header-left">
        <h1>临时班级管理</h1>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="loadClasses">
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-section" shadow="hover">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="学期">
          <el-input
            v-model="filterForm.semester"
            placeholder="按学期筛选"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="搜索">
          <el-input
            v-model="filterForm.keyword"
            placeholder="班级名/教师姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadClasses">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 班级表格 -->
    <el-card class="table-section" shadow="hover">
      <template #header>
        <span class="card-title">临时班级列表</span>
      </template>

      <el-table
        v-loading="loading"
        :data="classes"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="className" label="班级名" min-width="150" />
        <el-table-column prop="teacherName" label="体育老师" min-width="100" />
        <el-table-column prop="dayOfWeek" label="星期" width="80" align="center" />
        <el-table-column prop="time" label="时间" min-width="120" />
        <el-table-column prop="location" label="地点" min-width="120" />
        <el-table-column label="容量" width="120" align="center">
          <template #default="{ row }">
            <span :class="{ 'capacity-full': row.enrolled >= row.capacity }">
              {{ row.enrolled || 0 }} / {{ row.capacity || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewStudents(row)">
              查看学生
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadClasses"
          @current-change="loadClasses"
        />
      </div>
    </el-card>

    <!-- 学生名单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="'学生名单 — ' + (selectedClass?.className || '')"
      width="650px"
      destroy-on-close
    >
      <el-table
        v-loading="loadingStudents"
        :data="students"
        stripe
        border
        max-height="420"
        style="width: 100%"
      >
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="studentName" label="姓名" min-width="100" />
        <el-table-column prop="studentId" label="学号" min-width="140" />
        <el-table-column prop="college" label="学院" min-width="140" />
        <el-table-column prop="enrolledAt" label="选课时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.enrolledAt) }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { api } from '@/services/api'
import { ElMessage } from 'element-plus'

export default {
  name: 'TempClassManagement',
  data() {
    return {
      loading: false,
      loadingStudents: false,
      classes: [],
      filterForm: {
        semester: '',
        keyword: ''
      },
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      dialogVisible: false,
      selectedClass: null,
      students: []
    }
  },
  mounted() {
    this.loadClasses()
  },
  methods: {
    async loadClasses() {
      try {
        this.loading = true
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        }
        if (this.filterForm.semester) params.semester = this.filterForm.semester
        if (this.filterForm.keyword) params.keyword = this.filterForm.keyword

        const res = await api.tempClasses.list(params)
        const data = res.data || res
        if (Array.isArray(data)) {
          this.classes = data
          this.pagination.total = res.total || data.length
        } else {
          this.classes = data.records || data.list || []
          this.pagination.total = data.total || 0
        }
      } catch (e) {
        ElMessage.error('加载班级列表失败：' + (e.message || '未知错误'))
        this.classes = []
      } finally {
        this.loading = false
      }
    },

    async viewStudents(row) {
      this.selectedClass = row
      this.dialogVisible = true
      this.students = []
      try {
        this.loadingStudents = true
        const res = await api.tempClasses.getEnrollments(row.id)
        const data = res.data || res
        this.students = Array.isArray(data) ? data : (data.records || data.list || [])
      } catch (e) {
        ElMessage.error('获取学生名单失败：' + (e.message || '未知错误'))
      } finally {
        this.loadingStudents = false
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
.temp-class-management {
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

.filter-section {
  margin-bottom: 24px;
}

.table-section {
  margin-bottom: 24px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.capacity-full {
  color: #f56c6c;
  font-weight: 600;
}
</style>
