<template>
  <div class="school-account-page">
    <header class="page-header">
      <div class="header-container">
        <button type="button" class="back-btn" @click="$router.push('/admin')">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          返回管理员管理
        </button>
        <div class="page-info">
          <h1 class="page-title">学校开户</h1>
          <p class="page-subtitle">以 checkuser 预导入库中的学校为范围，为教师开户或新建学校</p>
        </div>
        <button v-if="isSuperAdminRole" type="button" class="action-btn create-school-top" @click="showNewSchool = true">
          ＋ 新建学校（校管）
        </button>
      </div>
    </header>

    <main class="main-content">
      <p v-if="errorMsg" class="error-banner">{{ errorMsg }}</p>
      <div v-if="loading" class="loading-state">加载学校模块…</div>
      <div v-else class="school-grid">
        <button
          v-for="item in modules"
          :key="item.school"
          type="button"
          class="school-card"
          :class="{ active: selectedSchool === item.school }"
          @click="openDetail(item.school)"
        >
          <span class="school-name">{{ item.school }}</span>
          <div class="school-stats">
            <span>预导入学生 <strong>{{ item.studentCount }}</strong></span>
            <span>预导入教师 <strong>{{ item.teacherPreimportCount }}</strong></span>
            <span>已注册教师 <strong>{{ item.teacherRegisteredCount }}</strong></span>
          </div>
        </button>
        <p v-if="modules.length === 0" class="empty-hint">暂无预导入学校。请先通过「导入名单」导入学生或教师，或使用「新建学校」。</p>
      </div>

      <section v-if="selectedSchool && detail" class="detail-panel">
        <div class="detail-header">
          <h2>{{ detail.school }}</h2>
          <span class="pill">预导入学生 {{ detail.studentCount }} 人</span>
          <button type="button" class="link-btn" @click="refreshDetail">刷新</button>
        </div>

        <h3 class="subsection-title">预导入教师（可点击「开户」）</h3>
        <div v-if="detailLoading" class="loading-inline">加载中…</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>工号</th>
              <th>姓名</th>
              <th>学院</th>
              <th>状态</th>
              <th width="120">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in detail.preimportTeachers" :key="row.teacherId">
              <td>{{ row.teacherId }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.college || '—' }}</td>
              <td>
                <span v-if="row.hasAccount" class="tag ok">已注册</span>
                <span v-else class="tag muted">待开户</span>
              </td>
              <td>
                <button
                  type="button"
                  class="small-btn primary"
                  :disabled="row.hasAccount"
                  @click="openActivateDialog(row)"
                >
                  开户
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <h3 class="subsection-title">已注册教师（含院管 / 校管）</h3>
        <table v-if="!detailLoading" class="data-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>姓名</th>
              <th>工号</th>
              <th>角色</th>
              <th>学院</th>
              <th width="100">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in detail.registeredTeachers" :key="u.id">
              <td>{{ u.username }}</td>
              <td>{{ u.realName }}</td>
              <td>{{ u.studentId }}</td>
              <td>{{ roleLabel(u.userType) }}</td>
              <td>{{ u.departmentName || '—' }}</td>
              <td>
                <button type="button" class="small-btn warn" @click="openResetPassword(u)">重置密码</button>
              </td>
            </tr>
            <tr v-if="detail.registeredTeachers.length === 0">
              <td colspan="6" class="muted-cell">暂无已注册教师</td>
            </tr>
          </tbody>
        </table>

        <div class="add-teacher-box">
          <h3 class="subsection-title">不在预导入表中的教师</h3>
          <p class="hint">将同时写入 users 与 checkteacher，避免与仅注册不同步。</p>
          <div class="form-grid">
            <label>工号 <input v-model="newTeacher.teacherId" type="text" placeholder="必填" /></label>
            <label>姓名 <input v-model="newTeacher.name" type="text" placeholder="必填" /></label>
            <label>学院 <input v-model="newTeacher.college" type="text" placeholder="可选" /></label>
            <label>初始密码 <input v-model="newTeacher.password" type="password" placeholder="必填" /></label>
            <label>角色
              <select v-model="newTeacher.userType">
                <option value="teacher">教师</option>
                <option value="counselor">辅导员</option>
                <option value="department_admin">院级管理员</option>
                <option value="school_admin">校级管理员</option>
              </select>
            </label>
          </div>
          <button type="button" class="action-btn primary" :disabled="submitting" @click="submitNewTeacher">
            创建并同步预导入
          </button>
        </div>
      </section>
    </main>

    <!-- 预导入行开户 -->
    <div v-if="activateRow" class="modal-overlay" @click.self="activateRow = null">
      <div class="modal">
        <h3>为 {{ activateRow.name }}（{{ activateRow.teacherId }}）开户</h3>
        <label>初始密码 <input v-model="activateForm.password" type="password" /></label>
        <label>角色
          <select v-model="activateForm.userType">
            <option value="teacher">教师</option>
            <option value="counselor">辅导员</option>
            <option value="department_admin">院级管理员</option>
            <option value="school_admin">校级管理员</option>
          </select>
        </label>
        <div class="modal-actions">
          <button type="button" class="action-btn secondary" @click="activateRow = null">取消</button>
          <button type="button" class="action-btn primary" :disabled="submitting" @click="submitActivate">确认开户</button>
        </div>
      </div>
    </div>

    <!-- 已注册用户重置密码 -->
    <div v-if="resetTarget" class="modal-overlay" @click.self="resetTarget = null">
      <div class="modal">
        <h3>重置密码</h3>
        <p class="hint">用户：{{ resetTarget.realName }}（{{ resetTarget.username }} / 工号 {{ resetTarget.studentId }}）</p>
        <label>新密码 <input v-model="resetPasswordInput" type="password" autocomplete="new-password" placeholder="必填" /></label>
        <p class="hint">重置后请告知用户；不会发送短信通知。</p>
        <div class="modal-actions">
          <button type="button" class="action-btn secondary" @click="resetTarget = null">取消</button>
          <button type="button" class="action-btn primary" :disabled="submitting" @click="submitResetPassword">确认重置</button>
        </div>
      </div>
    </div>

    <!-- 新建学校 -->
    <div v-if="showNewSchool" class="modal-overlay" @click.self="showNewSchool = false">
      <div class="modal wide">
        <h3>新建学校</h3>
        <p class="hint">将创建该校的<strong>校级管理员</strong>账户，并把校管信息写入预导入教师表（校名在 checkuser 中尚不存在时可用）。</p>
        <div class="form-grid">
          <label>学校名称 <input v-model="newSchool.schoolName" type="text" placeholder="与系统将使用的学校名一致" /></label>
          <label>学院（可选）<input v-model="newSchool.college" type="text" /></label>
          <label>校管姓名 <input v-model="newSchool.realName" type="text" /></label>
          <label>校管工号 <input v-model="newSchool.teacherId" type="text" /></label>
          <label>初始密码 <input v-model="newSchool.password" type="password" /></label>
        </div>
        <div class="modal-actions">
          <button type="button" class="action-btn secondary" @click="showNewSchool = false">取消</button>
          <button type="button" class="action-btn primary" :disabled="submitting" @click="submitNewSchool">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import authService from '@/services/authService'
import { isSuperAdmin } from '@/utils/permissionManager'

export default {
  name: 'SchoolAccountManagement',
  data () {
    return {
      modules: [],
      loading: true,
      errorMsg: '',
      selectedSchool: '',
      detail: null,
      detailLoading: false,
      activateRow: null,
      activateForm: { password: '', userType: 'teacher' },
      newTeacher: {
        teacherId: '',
        name: '',
        college: '',
        password: '',
        userType: 'teacher'
      },
      newSchool: {
        schoolName: '',
        college: '',
        realName: '',
        teacherId: '',
        password: ''
      },
      showNewSchool: false,
      submitting: false,
      resetTarget: null,
      resetPasswordInput: '',
      currentUserSchool: ''
    }
  },
  computed: {
    isSuperAdminRole () {
      return isSuperAdmin()
    }
  },
  async mounted () {
    const user = await authService.getCurrentUser()
    if (user) {
      this.currentUserSchool = user.school || ''
    }
    this.loadModules()
    if (!this.isSuperAdminRole && this.currentUserSchool) {
      this.openDetail(this.currentUserSchool)
    }
  },
  methods: {
    roleLabel (t) {
      const map = {
        teacher: '教师',
        counselor: '辅导员',
        department_admin: '院级管理员',
        school_admin: '校级管理员'
      }
      return map[t] || t
    },
    async loadModules () {
      this.loading = true
      this.errorMsg = ''
      try {
        const res = await api.schoolAccount.getSchoolModules()
        if (res.code === 200) {
          this.modules = res.data || []
        } else {
          this.errorMsg = res.message || '加载失败'
        }
      } catch (e) {
        this.errorMsg = e.message || '加载失败'
      } finally {
        this.loading = false
      }
    },
    async openDetail (school) {
      this.selectedSchool = school
      await this.refreshDetail()
    },
    async refreshDetail () {
      if (!this.selectedSchool) return
      this.detailLoading = true
      this.errorMsg = ''
      try {
        const res = await api.schoolAccount.getSchoolDetail(this.selectedSchool)
        if (res.code === 200) {
          this.detail = res.data
        } else {
          this.errorMsg = res.message || '加载详情失败'
          this.detail = null
        }
      } catch (e) {
        this.errorMsg = e.message || '加载详情失败'
        this.detail = null
      } finally {
        this.detailLoading = false
      }
    },
    openActivateDialog (row) {
      this.activateRow = row
      this.activateForm = { password: '', userType: 'teacher' }
    },
    async submitActivate () {
      if (!this.activateForm.password) {
        alert('请填写密码')
        return
      }
      this.submitting = true
      try {
        const res = await api.schoolAccount.activateFromPreimport({
          school: this.selectedSchool,
          teacherId: this.activateRow.teacherId,
          password: this.activateForm.password,
          userType: this.activateForm.userType
        })
        if (res.code === 200) {
          const d = res.data || {}
          alert(`开户成功\n用户名：${d.username}\n工号：${d.studentId}\n角色：${this.roleLabel(d.userType)}`)
          this.activateRow = null
          await this.refreshDetail()
          await this.loadModules()
        } else {
          alert(res.message || '失败')
        }
      } catch (e) {
        alert(e.message || '失败')
      } finally {
        this.submitting = false
      }
    },
    async submitNewTeacher () {
      const t = this.newTeacher
      if (!t.teacherId || !t.name || !t.password) {
        alert('请填写工号、姓名、密码')
        return
      }
      this.submitting = true
      try {
        const res = await api.schoolAccount.createTeacherWithPreimport({
          school: this.selectedSchool,
          college: t.college || '',
          teacherId: t.teacherId.trim(),
          name: t.name.trim(),
          password: t.password,
          userType: t.userType
        })
        if (res.code === 200) {
          const d = res.data || {}
          alert(`已创建并写入预导入表\n用户名：${d.username}`)
          this.newTeacher = {
            teacherId: '', name: '', college: '', password: '', userType: 'teacher'
          }
          await this.refreshDetail()
          await this.loadModules()
        } else {
          alert(res.message || '失败')
        }
      } catch (e) {
        alert(e.message || '失败')
      } finally {
        this.submitting = false
      }
    },
    openResetPassword (u) {
      this.resetTarget = u
      this.resetPasswordInput = ''
    },
    async submitResetPassword () {
      const pwd = (this.resetPasswordInput || '').trim()
      if (!pwd) {
        alert('请填写新密码')
        return
      }
      if (!this.resetTarget) return
      this.submitting = true
      try {
        const res = await api.user.adminResetPassword(this.resetTarget.id, {
          temporaryPassword: pwd,
          forceChange: false,
          notifyUser: false
        })
        if (res.code === 200) {
          const shown = res.data && res.data.temporaryPassword != null ? res.data.temporaryPassword : pwd
          alert(`密码已重置\n新密码：${shown}`)
          this.resetTarget = null
          this.resetPasswordInput = ''
        } else {
          alert(res.message || '重置失败')
        }
      } catch (e) {
        alert(e.message || '重置失败')
      } finally {
        this.submitting = false
      }
    },
    async submitNewSchool () {
      const s = this.newSchool
      if (!s.schoolName || !s.realName || !s.teacherId || !s.password) {
        alert('请填写学校名称、姓名、工号、密码')
        return
      }
      this.submitting = true
      try {
        const res = await api.schoolAccount.createSchool({
          schoolName: s.schoolName.trim(),
          college: s.college || '',
          realName: s.realName.trim(),
          teacherId: s.teacherId.trim(),
          password: s.password
        })
        if (res.code === 200) {
          const d = res.data || {}
          alert(`创建成功\n用户名：${d.username}\n学校：${s.schoolName}`)
          this.showNewSchool = false
          this.newSchool = {
            schoolName: '', college: '', realName: '', teacherId: '', password: ''
          }
          await this.loadModules()
          this.selectedSchool = s.schoolName.trim()
          await this.refreshDetail()
        } else {
          alert(res.message || '失败')
        }
      } catch (e) {
        alert(e.message || '失败')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.school-account-page {
  min-height: 100vh;
  background: #f5f7fa;
  --border: #e8e8e8;
  --primary: #1677ff;
}
.page-header {
  background: #fff;
  border-bottom: 1px solid var(--border);
  padding: 16px 0;
}
.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #fafafa;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.back-btn svg { width: 18px; height: 18px; }
.page-info { flex: 1; min-width: 200px; }
.page-title { margin: 0; font-size: 20px; font-weight: 600; }
.page-subtitle { margin: 4px 0 0; font-size: 13px; color: #666; }
.create-school-top {
  padding: 10px 18px;
  background: #722ed1;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.create-school-top:hover { filter: brightness(1.05); }

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
.error-banner {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #cf1322;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.loading-state { padding: 40px; text-align: center; color: #666; }

.school-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.school-card {
  text-align: left;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.school-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
.school-card.active {
  border-color: #722ed1;
  box-shadow: 0 0 0 2px #d3adf7;
}
.school-name {
  display: block;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 10px;
}
.school-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: #666;
}
.empty-hint { grid-column: 1 / -1; color: #999; padding: 24px; }

.detail-panel {
  margin-top: 32px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}
.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.detail-header h2 { margin: 0; font-size: 18px; }
.pill {
  font-size: 12px;
  padding: 4px 10px;
  background: #e6f4ff;
  color: var(--primary);
  border-radius: 20px;
}
.link-btn {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: 14px;
}
.subsection-title {
  font-size: 15px;
  margin: 24px 0 12px;
}
.loading-inline { color: #888; margin-bottom: 12px; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.data-table th,
.data-table td {
  border: 1px solid var(--border);
  padding: 10px 12px;
  text-align: left;
}
.data-table th { background: #fafafa; font-weight: 600; }
.muted-cell { color: #999; text-align: center; }

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.tag.ok { background: #f6ffed; color: #389e0d; }
.tag.muted { background: #f5f5f5; color: #8c8c8c; }

.small-btn {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid var(--border);
  background: #fff;
}
.small-btn.primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.small-btn.warn {
  background: #fff7e6;
  color: #d46b08;
  border-color: #ffd591;
}
.small-btn.warn:hover {
  background: #ffe7ba;
}
.small-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-teacher-box {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px dashed var(--border);
}
.hint { font-size: 13px; color: #666; margin: 0 0 12px; }
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #333;
}
.form-grid input,
.form-grid select {
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
}
.action-btn.primary {
  padding: 10px 20px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.action-btn.secondary {
  padding: 10px 20px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}
.modal {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.modal.wide { max-width: 520px; }
.modal h3 { margin: 0 0 16px; font-size: 17px; }
.modal label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 13px;
}
.modal input,
.modal select {
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>
