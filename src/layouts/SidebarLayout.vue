<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-inner">
        <div class="header-left">
          <button class="sidebar-toggle-btn" @click="sidebarCollapsed = !sidebarCollapsed" title="收起/展开侧栏">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <div class="logo" @click="$router.push('/dashboard')" style="cursor:pointer">
            <div class="logo-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path d="M20 4L6 11v9l14 8 14-8v-9L20 4z" stroke="white" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
                <path d="M6 20l14 8 14-8" stroke="white" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
                <path d="M6 25l14 8 14-8" stroke="white" stroke-width="1.8" stroke-linejoin="round" fill="none"/>
              </svg>
            </div>
            <span class="logo-text">校园体育管理系统</span>
          </div>
        </div>
        <div class="header-right">
          <span v-if="userSchool" class="school-tag">{{ userSchool }}</span>
          <div class="user-dropdown">
            <span class="user-name">{{ username }}</span>
            <div class="avatar">{{ (username || '').charAt(0) }}</div>
            <div class="dropdown-menu">
              <button class="dropdown-item" @click="$router.push('/profile')">
                <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/></svg>
                个人中心
              </button>
              <button v-if="canAdmin" class="dropdown-item" @click="$router.push('/admin')">
                <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                管理员管理
              </button>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item danger" @click="logout">
                <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div v-if="isImpersonating" class="impersonate-bar">
      <span>正在以 <strong>{{ impersonatingName }}</strong> 的身份操作</span>
      <button @click="exitImpersonation">退出切换</button>
    </div>

    <div class="app-body">
      <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <nav class="sidebar-nav">
          <template v-for="item in visibleMenu" :key="item.key">
            <a v-if="!item.children"
               class="nav-item depth-0"
               :class="{ active: isActive(item) }"
               @click="navigate(item)">
              <span class="nav-label">{{ item.label }}</span>
            </a>
            <div v-else class="nav-group" :class="{ open: expanded[item.key] }">
              <div class="nav-group-title" @click="toggleGroup(item.key)">
                <span class="nav-label">{{ item.label }}</span>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div class="nav-group-children" v-show="expanded[item.key]">
                <template v-for="child in visibleChildren(item.children)" :key="child.key">
                  <a v-if="!child.children"
                     class="nav-item depth-1"
                     :class="{ active: isActive(child) }"
                     @click="navigate(child)">
                    <span class="nav-label">{{ child.label }}</span>
                  </a>
                  <div v-else class="nav-group nested" :class="{ open: expanded[child.key] }">
                    <div class="nav-group-title sub" @click="toggleGroup(child.key)">
                      <span class="nav-label">{{ child.label }}</span>
                      <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <div class="nav-group-children" v-show="expanded[child.key]">
                      <a v-for="leaf in visibleChildren(child.children)" :key="leaf.key"
                         class="nav-item depth-2"
                         :class="{ active: isActive(leaf) }"
                         @click="navigate(leaf)">
                        <span class="nav-label">{{ leaf.label }}</span>
                      </a>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </nav>
      </aside>
      <main class="app-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'
import { isSuperAdmin, isSchoolAdmin, isDepartmentAdmin, isTeacher, isCounselor, getCurrentRole } from '@/utils/permissionManager'

const ALL_ADMIN = ['counselor', 'department_admin', 'school_admin', 'super_admin']
const SCHOOL_UP = ['school_admin', 'super_admin']
const TEACHER_UP = ['teacher', 'counselor', 'department_admin', 'school_admin', 'super_admin']

export default {
  name: 'SidebarLayout',
  data() {
    return {
      sidebarCollapsed: false,
      username: '',
      userRole: '',
      userSchool: '',
      canAdmin: false,
      isImpersonating: localStorage.getItem('isImpersonating') === 'true',
      impersonatingName: localStorage.getItem('impersonatingName') || '',
      expanded: {},
      menuTree: [
        { key: 'dashboard', label: '工作台', path: '/dashboard' },
        {
          key: 'teaching', label: '教学管理', roles: ['teacher', 'school_admin', 'super_admin'], children: [
            { key: 't-teacher', label: '教师端', path: '/teaching/teacher', roles: ['teacher', 'super_admin'] },
            { key: 't-schedule', label: '课表导入', path: '/teaching/schedule-import', roles: SCHOOL_UP },
            { key: 't-window', label: '选课窗口', path: '/teaching/class-selection-window', roles: SCHOOL_UP },
            { key: 't-temp', label: '临时班级', path: '/teaching/temp-class-management', roles: [...SCHOOL_UP, 'teacher'] },
          ]
        },
        {
          key: 'group', label: '群体活动', children: [
            { key: 'g-morning', label: '早操管理', path: '/group/morning-exercise', roles: ALL_ADMIN },
            { key: 'g-sun', label: '校园阳光跑', path: '/group/sunshine-run' },
            {
              key: 'g-homework', label: '课后作业', children: [
                { key: 'g-hw-stat', label: '作业统计', path: '/group/homework', roles: ALL_ADMIN },
                { key: 'g-hw-pub', label: '作业发布', path: '/group/homework-assignment', roles: ['teacher'] },
                { key: 'g-hw-track', label: '完成率追踪', path: '/group/homework-completion-dashboard', roles: ['department_admin', 'school_admin', 'super_admin'] },
              ]
            },
            { key: 'g-mgmt', label: 'PE校园管理端', path: '/group/management', roles: ALL_ADMIN },
            { key: 'g-activity', label: '活动管理', path: '/group/activity' },
            { key: 'g-race', label: '比赛成绩', path: '/group/race-results' },
            { key: 'g-sports', label: '运动会管理', path: '/group/sports-management', roles: SCHOOL_UP },
          ]
        },
        {
          key: 'training', label: '训练管理', children: [
            { key: 'tr-teacher', label: '教师端', path: '/training/teacher', roles: TEACHER_UP },
            { key: 'tr-student', label: '学生端', path: '/training/student' },
            { key: 'tr-score', label: 'PE分数', path: '/training/score', roles: ALL_ADMIN },
          ]
        },
        { key: 'physical', label: '体质测试', external: 'https://tice.wuhuanfeng.com/teacher/login' },
        { key: 'equipment', label: '器材管理', path: '/equipment/teacher', roles: ALL_ADMIN },
        { key: 'venue', label: '场馆管理', path: '/venue/management', roles: ALL_ADMIN },
        { key: 'listening', label: '听课管理', path: '/listening', roles: TEACHER_UP },
        { key: 'health', label: '健康讲堂', external: 'https://www.open-health.me/' },
        { key: 'se', label: '运动装备', path: '/sports-equipment' },
        { key: 'stats', label: 'PE积分统计', path: '/statistics', roles: ['school_admin', 'department_admin', 'counselor'] },
      ]
    }
  },
  computed: {
    visibleMenu() {
      return this.filterByRole(this.menuTree)
    }
  },
  watch: {
    '$route.path': {
      immediate: true,
      handler() { this.expandActiveGroups() }
    }
  },
  async created() {
    const user = await authService.getCurrentUser()
    if (user) {
      this.username = user.realName || user.username || ''
      this.userRole = user.userType
      this.userSchool = user.school || ''
      this.canAdmin = isSuperAdmin() || isSchoolAdmin() || isDepartmentAdmin()
    }
    this.expandActiveGroups()
  },
  methods: {
    filterByRole(items) {
      return items.filter(item => {
        if (item.roles && !item.roles.includes(this.userRole)) return false
        if (item.children) {
          const filtered = this.filterByRole(item.children)
          return filtered.length > 0
        }
        return true
      })
    },
    visibleChildren(children) {
      return this.filterByRole(children)
    },
    isActive(item) {
      if (!item.path) return false
      return this.$route.path === item.path
    },
    navigate(item) {
      if (item.external) {
        window.location.href = item.external
        return
      }
      if (item.path && item.path !== this.$route.path) {
        this.$router.push(item.path)
      }
    },
    toggleGroup(key) {
      this.expanded = { ...this.expanded, [key]: !this.expanded[key] }
    },
    expandActiveGroups() {
      const path = this.$route.path
      const expand = (items, parents) => {
        for (const item of items) {
          if (item.path === path) {
            parents.forEach(p => { this.expanded[p] = true })
            return true
          }
          if (item.children) {
            if (expand(item.children, [...parents, item.key])) return true
          }
        }
        return false
      }
      expand(this.menuTree, [])
    },
    exitImpersonation() {
      authService.exitImpersonation()
      this.isImpersonating = false
      window.location.href = '/dashboard'
    },
    logout() {
      authService.logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-body);
}

/* ===== Header ===== */
.app-header {
  height: var(--header-height);
  background: #fff;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
  z-index: 100;
}
.header-inner {
  height: 100%;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sidebar-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  transition: background var(--transition-fast);
}
.sidebar-toggle-btn:hover { background: var(--bg-tertiary); color: var(--text-primary); }
.sidebar-toggle-btn svg { width: 18px; height: 18px; }
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-icon {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.logo-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.school-tag {
  padding: 3px 10px;
  background: var(--primary-light);
  color: var(--primary-color);
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
}
.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  cursor: pointer;
  padding: 4px 0;
}
.user-name { font-size: 13px; color: var(--text-primary); }
.avatar {
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #fff;
  border-radius: var(--radius-md);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
  padding: 4px;
  min-width: 150px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: all var(--transition-fast);
  z-index: 200;
}
.user-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background var(--transition-fast);
}
.dropdown-item:hover { background: var(--bg-tertiary); color: var(--primary-color); }
.dropdown-item.danger:hover { background: var(--danger-bg); color: var(--danger-color); }
.dropdown-divider { height: 1px; background: var(--border-light); margin: 4px 8px; }

/* ===== Impersonate bar ===== */
.impersonate-bar {
  background: #722ed1;
  color: #fff;
  text-align: center;
  padding: 6px 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-shrink: 0;
}
.impersonate-bar button {
  background: #fff;
  color: #722ed1;
  border: none;
  padding: 2px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

/* ===== Body (sidebar + content) ===== */
.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ===== Sidebar ===== */
.sidebar {
  width: var(--sidebar-width);
  background: #fff;
  border-right: 1px solid var(--border-light);
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  transition: width 0.2s ease;
}
.sidebar.collapsed {
  width: 0;
  border-right: none;
}
.sidebar-nav {
  padding: 8px 0;
}

/* Nav items */
.nav-item {
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 36px;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  text-decoration: none;
  border-left: 3px solid transparent;
}
.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}
.nav-item.active {
  background: var(--primary-light);
  color: var(--primary-color);
  border-left-color: var(--primary-color);
  font-weight: 500;
}
.nav-item.depth-1 { padding-left: 32px; }
.nav-item.depth-2 { padding-left: 48px; font-size: 12px; }

/* Nav group */
.nav-group { user-select: none; }
.nav-group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 36px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.nav-group-title:hover { background: var(--bg-tertiary); color: var(--text-primary); }
.nav-group-title.sub {
  padding-left: 32px;
  font-weight: 400;
  font-size: 13px;
  color: var(--text-secondary);
}
.nav-arrow {
  transition: transform 0.2s;
  flex-shrink: 0;
}
.nav-group.open > .nav-group-title .nav-arrow,
.nav-group.nested.open > .nav-group-title .nav-arrow {
  transform: rotate(180deg);
}
.nav-group-children {
  overflow: hidden;
}

/* ===== Content ===== */
.app-content {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .sidebar { position: fixed; top: var(--header-height); bottom: 0; left: 0; z-index: 99; box-shadow: 2px 0 8px rgba(0,0,0,0.1); }
  .sidebar.collapsed { width: 0; }
  .logo-text { display: none; }
  .user-name { display: none; }
}
</style>
