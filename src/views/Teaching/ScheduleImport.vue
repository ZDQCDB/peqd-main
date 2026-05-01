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

    <!-- 未注册老师开户弹窗 -->
    <el-dialog
      v-model="showUnknownDialog"
      title="发现未注册的老师"
      width="780px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      >
        <template #title>
          以下 <strong>{{ unknownTeachers.length }}</strong> 位老师在系统中未注册，请为其开户后再导入课表，或选择跳过直接导入。
        </template>
      </el-alert>

      <!-- 在预导入表中的老师（一键开户） -->
      <template v-if="preimportTeachers.length > 0">
        <h4 class="section-label">
          <el-tag type="success" size="small" effect="dark">预导入表中</el-tag>
          已在预导入名单中，设置密码即可一键开户
        </h4>
        <el-table :data="preimportTeachers" border stripe size="small" style="width: 100%; margin-bottom: 20px">
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="teacherId" label="工号" width="120">
            <template #default="{ row }">
              <span>{{ row.teacherId }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="college" label="学院" width="120">
            <template #default="{ row }">
              <span>{{ row.college || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="password" label="初始密码" min-width="140">
            <template #default="{ row }">
              <el-input
                v-model="row.password"
                placeholder="必填"
                size="small"
                type="password"
                show-password
                :disabled="row.created"
              />
            </template>
          </el-table-column>
          <el-table-column prop="userType" label="角色" width="140">
            <template #default="{ row }">
              <el-select v-model="row.userType" size="small" :disabled="row.created">
                <el-option label="教师" value="teacher" />
                <el-option label="辅导员" value="counselor" />
                <el-option label="院级管理员" value="department_admin" />
                <el-option label="校级管理员" value="school_admin" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="110" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.created" type="success" size="small">已开户</el-tag>
              <el-button
                v-else
                type="success"
                size="small"
                :loading="row.creating"
                :disabled="!row.password"
                @click="activatePreimportTeacher(row)"
              >
                一键开户
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <!-- 不在预导入表中的老师（手动开户） -->
      <template v-if="manualTeachers.length > 0">
        <h4 class="section-label">
          <el-tag type="warning" size="small" effect="dark">不在预导入表</el-tag>
          需手动填写信息开户（将同时写入预导入表）
        </h4>
        <el-table :data="manualTeachers" border stripe size="small" style="width: 100%">
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="teacherId" label="工号" min-width="120">
            <template #default="{ row }">
              <el-input
                v-model="row.teacherId"
                placeholder="必填"
                size="small"
                :disabled="row.created"
              />
            </template>
          </el-table-column>
          <el-table-column prop="password" label="初始密码" min-width="130">
            <template #default="{ row }">
              <el-input
                v-model="row.password"
                placeholder="必填"
                size="small"
                type="password"
                show-password
                :disabled="row.created"
              />
            </template>
          </el-table-column>
          <el-table-column prop="college" label="学院" min-width="110">
            <template #default="{ row }">
              <el-input
                v-model="row.college"
                placeholder="可选"
                size="small"
                :disabled="row.created"
              />
            </template>
          </el-table-column>
          <el-table-column prop="userType" label="角色" width="140">
            <template #default="{ row }">
              <el-select v-model="row.userType" size="small" :disabled="row.created">
                <el-option label="教师" value="teacher" />
                <el-option label="辅导员" value="counselor" />
                <el-option label="院级管理员" value="department_admin" />
                <el-option label="校级管理员" value="school_admin" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.created" type="success" size="small">已开户</el-tag>
              <el-button
                v-else
                type="primary"
                size="small"
                :loading="row.creating"
                :disabled="!row.teacherId || !row.password"
                @click="createManualTeacher(row)"
              >
                开户
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelUnknownDialog">取消导入</el-button>
          <el-button
            type="warning"
            :disabled="!hasAnyUncreated"
            @click="proceedImportDirect"
          >
            跳过未开户，直接导入
          </el-button>
          <el-button
            type="success"
            :loading="creatingAll"
            :disabled="!canBatchCreate"
            @click="createAllTeachers"
          >
            全部开户
          </el-button>
          <el-button
            type="primary"
            :disabled="hasAnyUncreated"
            @click="proceedImportAfterCreate"
          >
            全部已开户，继续导入
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { api } from '@/services/api'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'

export default {
  name: 'ScheduleImport',
  data() {
    return {
      Search,
      importForm: {
        semester: '',
        file: null
      },
      parsedRows: [],
      importing: false,
      loading: false,
      searchSemester: '',
      schedules: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      showUnknownDialog: false,
      unknownTeachers: [],
      creatingAll: false
    }
  },
  computed: {
    preimportTeachers() {
      return this.unknownTeachers.filter(t => t.inPreimport)
    },
    manualTeachers() {
      return this.unknownTeachers.filter(t => !t.inPreimport)
    },
    hasAnyUncreated() {
      return this.unknownTeachers.some(t => !t.created)
    },
    canBatchCreate() {
      const uncreated = this.unknownTeachers.filter(t => !t.created)
      if (uncreated.length === 0) return false
      return uncreated.every(t => {
        if (t.inPreimport) return !!t.password
        return !!t.teacherId && !!t.password
      })
    }
  },
  mounted() {
    this.loadSchedules()
  },
  methods: {
    handleFileChange(uploadFile) {
      this.importForm.file = uploadFile.raw
      this.parseExcelFile(uploadFile.raw)
    },
    handleFileRemove() {
      this.importForm.file = null
      this.parsedRows = []
    },

    parseExcelFile(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

          this.parsedRows = jsonRows.map(row => ({
            teacherName: String(row['老师姓名'] || '').trim(),
            dayOfWeek: Number(row['星期']) || 0,
            startTime: this.normalizeExcelTime(row['开始时间']),
            endTime: this.normalizeExcelTime(row['结束时间']),
            location: String(row['地点'] || '').trim(),
            className: String(row['班级名称'] || '').trim(),
            capacity: Number(row['人数上限']) || 0
          })).filter(r => r.teacherName)
        } catch (err) {
          ElMessage.error('Excel 解析失败：' + err.message)
          this.parsedRows = []
        }
      }
      reader.readAsArrayBuffer(file)
    },

    normalizeExcelTime(val) {
      if (val == null || val === '') return ''
      if (typeof val === 'number') {
        const fraction = val - Math.floor(val)
        let totalSeconds = Math.round(fraction * 24 * 60 * 60)
        if (totalSeconds >= 86400) totalSeconds = totalSeconds % 86400
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      }
      return String(val).trim()
    },

    async handleImport() {
      if (this.parsedRows.length === 0 || !this.importForm.semester) {
        ElMessage.warning('请填写学期并选择 Excel 文件')
        return
      }
      try {
        this.importing = true
        const teacherNames = [...new Set(this.parsedRows.map(r => r.teacherName))]
        const preCheckRes = await api.peSchedules.preCheck(teacherNames)
        const items = preCheckRes.data || []

        if (items.length > 0) {
          this.unknownTeachers = items.map(item => ({
            name: item.name,
            inPreimport: item.inPreimport,
            teacherId: item.teacherId || '',
            college: item.college || '',
            password: '',
            userType: 'teacher',
            created: false,
            creating: false,
            username: ''
          }))
          this.showUnknownDialog = true
          return
        }

        await this.doImport()
      } catch (e) {
        ElMessage.error('预检查失败：' + (e.message || '未知错误'))
      } finally {
        this.importing = false
      }
    },

    async doImport() {
      try {
        this.importing = true
        await api.peSchedules.import(this.parsedRows, this.importForm.semester)
        ElMessage.success('导入成功')
        this.importForm.file = null
        this.parsedRows = []
        this.$refs.uploadRef?.clearFiles()
        this.showUnknownDialog = false
        this.unknownTeachers = []
        await this.loadSchedules()
      } catch (e) {
        ElMessage.error('导入失败：' + (e.message || '未知错误'))
      } finally {
        this.importing = false
      }
    },

    async activatePreimportTeacher(row) {
      if (!row.password) {
        ElMessage.warning('请填写密码')
        return
      }
      row.creating = true
      try {
        const res = await api.schoolAccount.activateFromPreimport({
          school: this.getCurrentSchool(),
          teacherId: row.teacherId,
          password: row.password,
          userType: row.userType
        })
        if (res.code === 200) {
          row.created = true
          row.username = res.data?.username || ''
          ElMessage.success(`${row.name} 开户成功，用户名：${row.username}`)
        } else {
          ElMessage.error(res.message || '开户失败')
        }
      } catch (e) {
        ElMessage.error(`${row.name} 开户失败：` + (e.message || '未知错误'))
      } finally {
        row.creating = false
      }
    },

    async createManualTeacher(row) {
      if (!row.teacherId || !row.password) {
        ElMessage.warning('请填写工号和密码')
        return
      }
      row.creating = true
      try {
        const res = await api.schoolAccount.createTeacherWithPreimport({
          school: this.getCurrentSchool(),
          college: row.college || '',
          teacherId: row.teacherId.trim(),
          name: row.name.trim(),
          password: row.password,
          userType: row.userType
        })
        if (res.code === 200) {
          row.created = true
          row.username = res.data?.username || ''
          ElMessage.success(`${row.name} 开户成功，用户名：${row.username}`)
        } else {
          ElMessage.error(res.message || '开户失败')
        }
      } catch (e) {
        ElMessage.error(`${row.name} 开户失败：` + (e.message || '未知错误'))
      } finally {
        row.creating = false
      }
    },

    async createAllTeachers() {
      const uncreated = this.unknownTeachers.filter(t => !t.created)
      if (uncreated.length === 0) return

      this.creatingAll = true
      let successCount = 0
      for (const row of uncreated) {
        if (row.inPreimport) {
          if (!row.password) continue
          await this.activatePreimportTeacher(row)
        } else {
          if (!row.teacherId || !row.password) continue
          await this.createManualTeacher(row)
        }
        if (row.created) successCount++
      }
      this.creatingAll = false
      if (successCount > 0) {
        ElMessage.success(`成功开户 ${successCount} 位老师`)
      }
    },

    cancelUnknownDialog() {
      this.showUnknownDialog = false
      this.unknownTeachers = []
      this.importing = false
    },

    async proceedImportDirect() {
      this.showUnknownDialog = false
      await this.doImport()
    },

    async proceedImportAfterCreate() {
      this.showUnknownDialog = false
      await this.doImport()
    },

    getCurrentSchool() {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        return userInfo.school || ''
      } catch {
        return ''
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

.section-label {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
