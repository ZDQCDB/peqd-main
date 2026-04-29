<template>
  <div class="schedule-import">
    <div class="page-header">
      <div class="header-left">
        <h1>课表导入</h1>
      </div>
    </div>

    <!-- 导入区域 -->
    <el-card class="import-section" shadow="hover">
      <template #header>
        <span class="card-title">导入课表 Excel</span>
      </template>
      <el-form :inline="true" :model="importForm" class="import-form">
        <el-form-item label="学期">
          <el-input
            v-model="importForm.semester"
            placeholder="例如：2026春季"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="Excel 文件">
          <div class="upload-row">
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              accept=".xlsx,.xls"
            >
              <template #trigger>
                <el-button type="primary" plain>选择文件</el-button>
              </template>
            </el-upload>
            <a
              class="template-link"
              href="/assets/templates/课表导入模板.xlsx"
              download="课表导入模板.xlsx"
            >
              下载导入模板
            </a>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="importing"
            :disabled="!importForm.file || !importForm.semester"
            @click="handleImport"
          >
            开始导入
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 课表列表 -->
    <el-card class="table-section" shadow="hover">
      <template #header>
        <div class="table-header">
          <span class="card-title">已导入课表</span>
          <el-input
            v-model="searchSemester"
            placeholder="按学期筛选"
            clearable
            style="width: 200px"
            @clear="loadSchedules"
            @keyup.enter="loadSchedules"
          >
            <template #append>
              <el-button :icon="Search" @click="loadSchedules" />
            </template>
          </el-input>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="schedules"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="teacherName" label="老师姓名" min-width="100" />
        <el-table-column prop="dayOfWeek" label="星期" width="90" align="center" />
        <el-table-column prop="time" label="时间" min-width="120" />
        <el-table-column prop="location" label="地点" min-width="120" />
        <el-table-column prop="className" label="班级名" min-width="140" />
        <el-table-column prop="capacity" label="人数上限" width="100" align="center" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-popconfirm
              title="确定删除该条课表记录？"
              confirm-button-text="删除"
              cancel-button-text="取消"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
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
          @size-change="loadSchedules"
          @current-change="loadSchedules"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { api } from '@/services/api'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'ScheduleImport',
  data() {
    return {
      Search,
      importForm: {
        semester: '',
        file: null
      },
      importing: false,
      loading: false,
      searchSemester: '',
      schedules: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0
      }
    }
  },
  mounted() {
    this.loadSchedules()
  },
  methods: {
    handleFileChange(uploadFile) {
      this.importForm.file = uploadFile.raw
    },
    handleFileRemove() {
      this.importForm.file = null
    },

    async handleImport() {
      if (!this.importForm.file || !this.importForm.semester) {
        ElMessage.warning('请填写学期并选择 Excel 文件')
        return
      }
      try {
        this.importing = true
        await api.peSchedules.import(this.importForm.file, this.importForm.semester)
        ElMessage.success('导入成功')
        this.importForm.file = null
        this.$refs.uploadRef?.clearFiles()
        await this.loadSchedules()
      } catch (e) {
        ElMessage.error('导入失败：' + (e.message || '未知错误'))
      } finally {
        this.importing = false
      }
    },

    async loadSchedules() {
      try {
        this.loading = true
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        }
        if (this.searchSemester) {
          params.semester = this.searchSemester
        }
        const res = await api.peSchedules.list(params)
        const data = res.data || res
        if (Array.isArray(data)) {
          this.schedules = data
          this.pagination.total = res.total || data.length
        } else {
          this.schedules = data.records || data.list || []
          this.pagination.total = data.total || 0
        }
      } catch (e) {
        ElMessage.error('加载课表失败：' + (e.message || '未知错误'))
        this.schedules = []
      } finally {
        this.loading = false
      }
    },

    async handleDelete(row) {
      try {
        await api.peSchedules.delete(row.id)
        ElMessage.success('删除成功')
        await this.loadSchedules()
      } catch (e) {
        ElMessage.error('删除失败：' + (e.message || '未知错误'))
      }
    }
  }
}
</script>

<style scoped>
.schedule-import {
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

.import-section {
  margin-bottom: 24px;
}

.import-form {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.upload-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.template-link {
  font-size: 14px;
  color: var(--el-color-primary);
  text-decoration: none;
}

.template-link:hover {
  text-decoration: underline;
}

.table-section {
  margin-bottom: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
