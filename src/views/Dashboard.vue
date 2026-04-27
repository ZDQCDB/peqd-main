<template>
  <div class="dashboard-page">
    <section class="welcome-section">
      <div class="welcome-inner">
        <div class="welcome-text">
          <h2 class="welcome-title">{{ greeting }}</h2>
          <p class="welcome-sub">校园体育教学与管理平台，请从左侧菜单选择功能模块</p>
        </div>
        <div class="welcome-stats">
          <div class="ws-item"><span class="ws-num">9</span><span class="ws-label">功能模块</span></div>
          <div class="ws-sep"></div>
          <div class="ws-item"><span class="ws-num">365</span><span class="ws-label">天全年服务</span></div>
          <div class="ws-sep"></div>
          <div class="ws-item"><span class="ws-num">100%</span><span class="ws-label">数据安全</span></div>
        </div>
      </div>
    </section>

    <section class="quick-section" v-if="quickLinks.length">
      <h3 class="section-title">快捷入口</h3>
      <div class="quick-grid">
        <div v-for="link in quickLinks" :key="link.path" class="quick-card" @click="go(link)">
          <div class="qc-title">{{ link.label }}</div>
          <div class="qc-desc">{{ link.desc }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import authService from '@/services/authService'
import { isSuperAdmin, isSchoolAdmin, isDepartmentAdmin, isTeacher } from '@/utils/permissionManager'

export default {
  name: 'Dashboard',
  data() {
    return {
      username: '',
      userRole: '',
      userSchool: ''
    }
  },
  computed: {
    greeting() {
      const parts = ['欢迎']
      if (this.userSchool) parts.push(this.userSchool)
      if (this.roleDisplayName) parts.push(this.roleDisplayName)
      if (this.username) parts.push(this.username)
      return parts.join(' ')
    },
    roleDisplayName() {
      const map = { super_admin: '超级管理员', school_admin: '校级管理员', department_admin: '院级管理员', teacher: '老师', counselor: '辅导员', student: '同学' }
      return map[this.userRole] || ''
    },
    quickLinks() {
      const links = []
      if (isTeacher() || isSuperAdmin() || isSchoolAdmin() || isDepartmentAdmin()) {
        links.push({ label: '教学管理 - 教师端', desc: '教学周历、签到签退', path: '/teaching/teacher' })
      }
      if (isSuperAdmin() || isSchoolAdmin() || isDepartmentAdmin()) {
        links.push({ label: '早操管理', desc: '考勤记录、出勤统计', path: '/group/morning-exercise' })
        links.push({ label: 'PE校园管理端', desc: '活动管理、数据统计', path: '/group/management' })
      }
      if (isTeacher()) {
        links.push({ label: '课后作业发布', desc: '发布运动作业、查看提交', path: '/group/homework-assignment' })
      }
      links.push({ label: '校园阳光跑', desc: '路线规划、跑步记录', path: '/group/sunshine-run' })
      return links.slice(0, 6)
    }
  },
  async mounted() {
    const user = await authService.getCurrentUser()
    if (user) {
      this.username = user.realName || user.username || ''
      this.userRole = user.userType
      this.userSchool = user.school || ''
    }
  },
  methods: {
    go(link) {
      if (link.external) { window.location.href = link.external; return }
      this.$router.push(link.path)
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  background: #fff;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 28px 32px;
  margin-bottom: 24px;
}
.welcome-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.welcome-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px;
}
.welcome-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}
.welcome-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}
.ws-item { display: flex; flex-direction: column; align-items: center; }
.ws-num { font-size: 20px; font-weight: 700; color: var(--primary-color); line-height: 1; }
.ws-label { font-size: 11px; color: var(--text-secondary); margin-top: 4px; }
.ws-sep { width: 1px; height: 32px; background: var(--border-light); }

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 14px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.quick-card {
  background: #fff;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.quick-card:hover {
  border-color: var(--primary-border);
  box-shadow: 0 2px 8px rgba(22,119,255,0.08);
}
.qc-title { font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px; }
.qc-desc { font-size: 12px; color: var(--text-secondary); }

@media (max-width: 768px) {
  .dashboard-page { padding: 16px; }
  .welcome-inner { flex-direction: column; align-items: flex-start; }
  .welcome-section { padding: 20px; }
  .quick-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .quick-grid { grid-template-columns: 1fr; }
}
</style>
