<template>
  <div class="counselor-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="page-title">辅导员班级管理</span>
        </div>
      </template>

      <el-table :data="counselors" v-loading="loading" stripe border>
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column label="已分配班级数" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info" effect="plain">{{ row.classCount ?? '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="viewClasses(row)">查看班级</el-button>
            <el-button size="small" type="success" link @click="openAssignDialog(row)">分配班级</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 查看已分配班级 -->
    <el-dialog v-model="viewDialogVisible" title="已分配班级" width="500px" destroy-on-close>
      <div v-loading="viewLoading">
        <el-empty v-if="!viewClasses_.length" description="暂无已分配班级" />
        <div v-else class="class-tags">
          <el-tag v-for="cls in viewClasses_" :key="cls" size="large" class="class-tag">{{ cls }}</el-tag>
        </div>
      </div>
    </el-dialog>

    <!-- 分配班级 -->
    <el-dialog v-model="assignDialogVisible" title="分配班级" width="520px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="辅导员">
          <span>{{ assignTarget.name }} ({{ assignTarget.username }})</span>
        </el-form-item>
        <el-form-item label="选择班级">
          <el-select
            v-model="selectedClasses"
            multiple
            filterable
            placeholder="请选择班级"
            style="width: 100%"
            :loading="classListLoading"
          >
            <el-option
              v-for="cls in availableClasses"
              :key="cls"
              :label="cls"
              :value="cls"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="assigning" @click="submitAssign">确认分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/services/api'
import authService from '@/services/authService'

export default {
  name: 'CounselorManagement',
  data() {
    return {
      loading: false,
      counselors: [],
      userInfo: null,

      viewDialogVisible: false,
      viewLoading: false,
      viewClasses_: [],

      assignDialogVisible: false,
      assignTarget: {},
      selectedClasses: [],
      availableClasses: [],
      classListLoading: false,
      assigning: false
    }
  },
  async mounted() {
    await this.loadUserInfo()
    await this.loadCounselors()
  },
  methods: {
    async loadUserInfo() {
      try {
        const raw = localStorage.getItem('userInfo')
        if (raw) {
          this.userInfo = JSON.parse(raw)
        }
        if (!this.userInfo) {
          this.userInfo = await authService.getCurrentUser()
        }
      } catch {
        this.$message.error('无法获取用户信息')
      }
    },

    async loadCounselors() {
      this.loading = true
      try {
        const school = this.userInfo?.school || ''
        const res = await api.counselor.listCounselors({ school })
        const list = res?.code === 200 ? res.data : (Array.isArray(res) ? res : [])
        this.counselors = Array.isArray(list) ? list : []
      } catch (e) {
        console.error('加载辅导员列表失败:', e)
        this.$message.error('加载辅导员列表失败：' + (e.message || '网络错误'))
        this.counselors = []
      } finally {
        this.loading = false
      }
    },

    async viewClasses(row) {
      this.viewDialogVisible = true
      this.viewLoading = true
      this.viewClasses_ = []
      try {
        const res = await api.counselor.getClassesByCounselor(row.id)
        const data = res?.code === 200 ? res.data : (Array.isArray(res) ? res : [])
        this.viewClasses_ = Array.isArray(data) ? data : []
      } catch (e) {
        console.error('加载辅导员班级失败:', e)
        this.$message.error('加载班级列表失败')
      } finally {
        this.viewLoading = false
      }
    },

    async openAssignDialog(row) {
      this.assignTarget = row
      this.selectedClasses = []
      this.assignDialogVisible = true
      await this.loadAvailableClasses()
    },

    async loadAvailableClasses() {
      this.classListLoading = true
      try {
        const school = this.userInfo?.school || ''
        const college = this.userInfo?.department || this.userInfo?.college || ''
        const res = await api.peManagement.getClasses(school, college)
        const data = res?.code === 200 ? res.data : (Array.isArray(res) ? res : [])
        this.availableClasses = Array.isArray(data) ? data : []
      } catch (e) {
        console.error('加载班级列表失败:', e)
        this.$message.error('加载可选班级失败')
        this.availableClasses = []
      } finally {
        this.classListLoading = false
      }
    },

    async submitAssign() {
      if (!this.selectedClasses.length) {
        this.$message.warning('请至少选择一个班级')
        return
      }
      this.assigning = true
      try {
        const payload = {
          counselorId: this.assignTarget.id,
          classNames: this.selectedClasses,
          school: this.userInfo?.school || '',
          departmentName: this.userInfo?.department || this.userInfo?.college || ''
        }
        const res = await api.counselor.assignClasses(payload)
        if (res?.code === 200) {
          this.$message.success('班级分配成功')
          this.assignDialogVisible = false
          await this.loadCounselors()
        } else {
          this.$message.error(res?.message || '分配失败')
        }
      } catch (e) {
        console.error('分配班级失败:', e)
        this.$message.error('分配失败：' + (e.message || '网络错误'))
      } finally {
        this.assigning = false
      }
    }
  }
}
</script>

<style scoped>
.counselor-management {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #000000d9;
}

.class-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.class-tag {
  font-size: 14px;
}
</style>
