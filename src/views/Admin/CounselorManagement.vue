<template>
  <div class="counselor-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="page-title">辅导员班级管理</span>
          <el-button size="small" @click="$router.push('/admin')">返回管理员管理</el-button>
        </div>
      </template>

      <el-table :data="counselors" v-loading="loading" stripe border>
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column label="管辖班级" min-width="240">
          <template #default="{ row }">
            <template v-if="row._classes && row._classes.length">
              <el-tag v-for="c in row._classes" :key="c" size="small" class="class-tag">{{ c }}</el-tag>
            </template>
            <span v-else class="no-class-hint">未分配</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openAssignDialog(row)">分配班级</el-button>
            <el-button size="small" type="danger" link @click="confirmRemoveAll(row)" :disabled="!row._classes || !row._classes.length">清除分配</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配班级 -->
    <el-dialog v-model="assignDialogVisible" title="分配班级" width="520px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="辅导员">
          <span>{{ assignTarget.name }} ({{ assignTarget.username }})</span>
        </el-form-item>
        <el-form-item label="当前班级">
          <div v-if="assignTarget._classes && assignTarget._classes.length" class="class-tags">
            <el-tag v-for="c in assignTarget._classes" :key="c" size="small">{{ c }}</el-tag>
          </div>
          <span v-else class="no-class-hint">暂无</span>
        </el-form-item>
        <el-form-item label="选择班级">
          <el-select
            v-model="selectedClasses"
            multiple
            filterable
            placeholder="请选择要分配的班级"
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
        const counselors = Array.isArray(list) ? list : []

        for (const c of counselors) {
          try {
            const cr = await api.counselor.getClassesByCounselor(c.id)
            const data = cr?.code === 200 ? cr.data : (Array.isArray(cr) ? cr : [])
            c._classes = (Array.isArray(data) ? data : []).map(r => r.class_name || r)
          } catch {
            c._classes = []
          }
        }
        this.counselors = counselors
      } catch (e) {
        console.error('加载辅导员列表失败:', e)
        this.$message.error('加载辅导员列表失败')
        this.counselors = []
      } finally {
        this.loading = false
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
        const college = this.userInfo?.departmentName || this.userInfo?.department || this.userInfo?.college || ''
        const res = await api.peManagement.getClasses(school, college)
        const data = res?.code === 200 ? res.data : (Array.isArray(res) ? res : [])
        this.availableClasses = (Array.isArray(data) ? data : []).map(c => typeof c === 'string' ? c : (c.name || c.className || ''))
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
          departmentName: this.userInfo?.departmentName || this.userInfo?.department || this.userInfo?.college || ''
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
    },

    async confirmRemoveAll(row) {
      try {
        await this.$confirm(`确定清除 ${row.name} 的全部班级分配？`, '提示', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        const res = await api.counselor.removeAllClasses(row.id)
        if (res?.code === 200) {
          this.$message.success('已清除全部班级分配')
          await this.loadCounselors()
        } else {
          this.$message.error(res?.message || '操作失败')
        }
      } catch {
        // cancelled
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
  justify-content: space-between;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #000000d9;
}

.class-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.class-tag {
  font-size: 13px;
}

.no-class-hint {
  color: #999;
  font-size: 13px;
}
</style>
