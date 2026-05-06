<template>
  <div class="pe-management">
    <!-- 顶部导航栏 -->
    <header class="page-header">
      <div class="header-container">
        <div class="header-left">
          <button class="back-btn" @click="handleBack">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ viewLevel === startLevel ? '返回群体管理' : '返回上级' }}
          </button>
          <div class="page-info">
            <h1 class="page-title">PE校园管理端</h1>
            <p class="page-subtitle">User Management System</p>
          </div>
        </div>
      </div>
    </header>

    <!-- 面包屑导航 -->
    <nav class="breadcrumb-nav">
      <div class="breadcrumb-container">
        <template v-if="startLevel === 'school'">
          <span class="breadcrumb-item" :class="{ active: viewLevel === 'school' }" @click="navigateTo('school')">全部学校</span>
        </template>
        <template v-if="selectedSchool">
          <span v-if="startLevel === 'school'" class="breadcrumb-sep">/</span>
          <span class="breadcrumb-item" :class="{ active: viewLevel === 'college' }" @click="navigateTo('college')">{{ selectedSchool }}</span>
        </template>
        <template v-if="selectedCollege">
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-item" :class="{ active: viewLevel === 'class' }" @click="navigateTo('class')">{{ selectedCollege }}</span>
        </template>
        <template v-if="selectedClass !== null">
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-item active">{{ selectedClass || '未分班' }}</span>
        </template>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="content-container">

        <!-- 学校级别 -->
        <section v-if="viewLevel === 'school'" class="card-section">
          <div class="section-header">
            <h2 class="section-title">学校列表</h2>
            <span class="section-count">共 {{ schoolList.length }} 所学校</span>
          </div>
          <div v-if="hierarchyLoading" class="loading-box"><div class="spinner"></div><p>正在加载...</p></div>
          <div v-else-if="schoolList.length === 0" class="empty-box"><p>暂无数据</p></div>
          <div v-else class="card-grid">
            <div v-for="item in schoolList" :key="item.name" class="hierarchy-card" @click="selectSchool(item.name)">
              <div class="card-icon school-icon">
                <svg viewBox="0 0 24 24" fill="none"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="card-body">
                <h3 class="card-name">{{ item.name }}</h3>
                <div class="card-stats">
                  <span class="stat-tag">{{ item.studentCount }} 人</span>
                  <span class="stat-tag">{{ item.collegeCount }} 个学院</span>
                </div>
              </div>
              <div class="card-arrow"><svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            </div>
          </div>
        </section>

        <!-- 学院级别 -->
        <section v-if="viewLevel === 'college'" class="card-section">
          <div class="section-header">
            <h2 class="section-title">{{ selectedSchool }} - 学院列表</h2>
            <span class="section-count">共 {{ collegeList.length }} 个学院</span>
          </div>
          <div v-if="hierarchyLoading" class="loading-box"><div class="spinner"></div><p>正在加载...</p></div>
          <div v-else-if="collegeList.length === 0" class="empty-box"><p>暂无数据</p></div>
          <div v-else class="card-grid">
            <div v-for="item in collegeList" :key="item.name" class="hierarchy-card" @click="selectCollege(item.name)">
              <div class="card-icon college-icon">
                <svg viewBox="0 0 24 24" fill="none"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="card-body">
                <h3 class="card-name">{{ item.name }}</h3>
                <div class="card-stats">
                  <span class="stat-tag">{{ item.studentCount }} 人</span>
                  <span v-if="item.checkerCount" class="stat-tag role-tag checker">{{ item.checkerCount }} 签到员</span>
                  <span v-if="item.subCheckerCount" class="stat-tag role-tag sub-checker">{{ item.subCheckerCount }} 二级管理员</span>
                </div>
              </div>
              <div class="card-arrow"><svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            </div>
          </div>
        </section>

        <!-- 班级级别 -->
        <section v-if="viewLevel === 'class'" class="card-section">
          <div class="section-header">
            <h2 class="section-title">{{ selectedCollege }} - 班级列表</h2>
            <span class="section-count">共 {{ classList.length }} 个班级</span>
          </div>
          <div v-if="hierarchyLoading" class="loading-box"><div class="spinner"></div><p>正在加载...</p></div>
          <div v-else-if="classList.length === 0" class="empty-box"><p>暂无数据</p></div>
          <div v-else class="card-grid">
            <div v-for="item in classList" :key="item.name" class="hierarchy-card" @click="selectClass(item.name)">
              <div class="card-icon class-icon">
                <svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.5"/></svg>
              </div>
              <div class="card-body">
                <h3 class="card-name">{{ item.name || '未分班' }}</h3>
                <div class="card-stats">
                  <span class="stat-tag">{{ item.studentCount }} 人</span>
                  <span v-if="item.checkerCount" class="stat-tag role-tag checker">{{ item.checkerCount }} 签到员</span>
                  <span v-if="item.subCheckerCount" class="stat-tag role-tag sub-checker">{{ item.subCheckerCount }} 二级管理员</span>
                </div>
              </div>
              <div class="card-arrow"><svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            </div>
          </div>
        </section>

        <!-- 成员级别 -->
        <section v-if="viewLevel === 'members'" class="users-section">
          <!-- 角色概览 -->
          <div class="role-overview">
            <div class="role-card checker-card">
              <div class="role-card-icon">
                <svg viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" stroke-width="2"/></svg>
              </div>
              <div class="role-card-info">
                <div class="role-card-count">{{ roleStats.checkerCount }}</div>
                <div class="role-card-label">签到员</div>
              </div>
              <div class="role-card-names" v-if="roleStats.checkers.length > 0">
                <span v-for="u in roleStats.checkers" :key="u.id" class="name-tag">{{ u.name }}</span>
              </div>
              <div v-else class="role-card-empty">暂无</div>
            </div>
            <div class="role-card sub-checker-card">
              <div class="role-card-icon">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="2"/></svg>
              </div>
              <div class="role-card-info">
                <div class="role-card-count">{{ roleStats.subCheckerCount }}</div>
                <div class="role-card-label">二级管理员</div>
              </div>
              <div class="role-card-names" v-if="roleStats.subCheckers.length > 0">
                <span v-for="u in roleStats.subCheckers" :key="u.id" class="name-tag">{{ u.name }}</span>
              </div>
              <div v-else class="role-card-empty">暂无</div>
            </div>
          </div>

          <!-- 筛选 -->
          <div class="filter-section">
            <div class="filter-header">
              <h3 class="filter-title">{{ selectedClass || '未分班' }} - 成员列表</h3>
              <div class="filter-actions">
                <button class="filter-reset" @click="resetUserFilters">重置筛选</button>
              </div>
            </div>
            <div class="filter-form">
              <div class="filter-row">
                <div class="filter-group">
                  <label class="filter-label">搜索关键词</label>
                  <el-input v-model="userFilters.search" placeholder="姓名或学号" clearable @keyup.enter="loadUsers" @clear="loadUsers" />
                </div>
                <div class="filter-group">
                  <label class="filter-label">用户角色</label>
                  <el-select v-model="userFilters.role" @change="loadUsers" style="width:100%" clearable placeholder="全部角色">
                    <el-option label="签到员" value="CHECKER" />
                    <el-option label="二级管理员" value="SUB_CHECKER" />
                  </el-select>
                </div>
              </div>
            </div>
          </div>
            
          <!-- 数据表格 -->
          <div class="table-section">
            <div class="table-container">
              <el-table :data="users" v-loading="usersLoading" stripe class="modern-table" :header-cell-style="{ background: '#f8f9fa', color: '#303133', fontWeight: '600' }">
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column prop="studentId" label="学号" width="140" />
                <el-table-column prop="gender" label="性别" width="70">
                  <template #default="{ row }">
                    <el-tag v-if="row.gender === '男'" size="small" type="primary">男</el-tag>
                    <el-tag v-else-if="row.gender === '女'" size="small" type="danger">女</el-tag>
                    <span v-else style="color:#999">—</span>
                  </template>
                </el-table-column>
                <el-table-column prop="phoneNumber" label="手机号" width="130" />
                <el-table-column prop="points" label="总积分" width="100" />
                <el-table-column prop="studyHours" label="学时" width="80" />
                <el-table-column prop="role" label="角色" width="130">
                  <template #default="{ row }">
                    <el-tag :type="getRoleType(row.role)" effect="dark" v-if="row.role === 'CHECKER' || row.role === 'SUB_CHECKER'">{{ getRoleText(row.role) }}</el-tag>
                    <span v-else class="role-text-plain">{{ getRoleText(row.role) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="260">
                  <template #default="{ row }">
                    <div class="action-buttons">
                      <el-button size="small" @click="viewUserDetail(row)">详情</el-button>
                      <el-button v-if="row.role !== 'CHECKER'" size="small" type="success" @click="setUserRole(row, 'CHECKER')">设为签到员</el-button>
                      <el-button v-if="row.role !== 'SUB_CHECKER'" size="small" type="warning" @click="setUserRole(row, 'SUB_CHECKER')">设为二级管理员</el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="pagination-section">
              <el-pagination @size-change="handleUserSizeChange" @current-change="handleUserCurrentChange"
                :current-page="userPagination.currentPage" :page-sizes="[20, 50, 100]" :page-size="userPagination.pageSize"
                layout="total, sizes, prev, pager, next, jumper" :total="userPagination.total" background />
            </div>
          </div>
        </section>

      </div>
    </main>

    <!-- 用户详情对话框 -->
    <el-dialog title="用户详情" v-model="userDetailVisible" width="700px" :before-close="closeUserDetail" class="user-detail-dialog">
      <div v-if="currentUser" class="user-detail-content">
        <div class="user-header">
          <div class="user-avatar">
            <img v-if="currentUser.avatar" :src="currentUser.avatar" alt="头像" />
            <div v-else class="avatar-placeholder"><svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg></div>
          </div>
          <div class="user-info">
            <h3 class="user-name">{{ currentUser.name }}</h3>
            <p class="user-id">学号：{{ currentUser.studentId }}</p>
            <div class="user-status">
              <el-tag :type="getRoleType(currentUser.role)" size="small">{{ getRoleText(currentUser.role) }}</el-tag>
              <el-tag :type="currentUser.isLoggedIn ? 'success' : 'info'" size="small">{{ currentUser.isLoggedIn ? '在线' : '离线' }}</el-tag>
            </div>
          </div>
        </div>
        <div class="detail-sections">
          <div class="detail-section">
            <h4 class="section-title-detail">基本信息</h4>
            <div class="info-grid">
              <div class="info-item"><label>学校</label><span>{{ currentUser.school || '未设置' }}</span></div>
              <div class="info-item"><label>学院</label><span>{{ currentUser.college || '未设置' }}</span></div>
              <div class="info-item"><label>班级</label><span>{{ currentUser.className || '未设置' }}</span></div>
              <div class="info-item"><label>手机号</label><span>{{ currentUser.phoneNumber || '未设置' }}</span></div>
              <div class="info-item"><label>注册时间</label><span>{{ formatDateTime(currentUser.createdAt) }}</span></div>
              <div class="info-item"><label>最后更新</label><span>{{ formatDateTime(currentUser.updatedAt) }}</span></div>
            </div>
          </div>
          <div class="detail-section">
            <h4 class="section-title-detail">积分 & 学时</h4>
            <div class="score-grid">
              <div class="score-item"><div class="score-value">{{ currentUser.points || 0 }}</div><div class="score-label">总积分</div></div>
              <div class="score-item"><div class="score-value">{{ currentUser.peActivityPoints || 0 }}</div><div class="score-label">PE活动积分</div></div>
              <div class="score-item"><div class="score-value">{{ currentUser.morningExercisePoints || 0 }}</div><div class="score-label">早操积分</div></div>
              <div class="score-item"><div class="score-value">{{ currentUser.studyHours || 0 }}</div><div class="score-label">学时</div></div>
              <div class="score-item"><div class="score-value">{{ currentUser.integrityScore ?? 100 }}</div><div class="score-label">诚信度</div></div>
            </div>
          </div>
          <div class="detail-section">
            <h4 class="section-title-detail">阳光跑数据</h4>
            <div class="score-grid">
              <div class="score-item"><div class="score-value">{{ currentUser.sunshineTotalRuns || 0 }}</div><div class="score-label">总跑步次数</div></div>
              <div class="score-item"><div class="score-value">{{ formatDistance(currentUser.sunshineTotalDistance) }}</div><div class="score-label">总距离(km)</div></div>
              <div class="score-item"><div class="score-value">{{ formatDuration(currentUser.sunshineTotalDuration) }}</div><div class="score-label">总时长</div></div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeUserDetail">关闭</el-button>
          <el-button v-if="currentUser && currentUser.isLoggedIn" type="warning" @click="handleForceLogout(currentUser)">强制登出</el-button>
          <el-button type="primary" @click="showEditPhone = true">修改手机号</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改手机号对话框 -->
    <el-dialog title="修改手机号" v-model="showEditPhone" width="400px" append-to-body>
      <el-form :model="editPhoneForm" label-width="80px">
        <el-form-item label="新手机号">
          <el-input v-model="editPhoneForm.phoneNumber" placeholder="请输入新手机号" maxlength="11" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditPhone = false">取消</el-button>
        <el-button type="primary" :loading="editPhoneLoading" @click="submitEditPhone">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'PEManagement',
  data() {
    return {
      permInfo: null,
      startLevel: 'school',

      viewLevel: 'school',
      selectedSchool: '',
      selectedCollege: '',
      selectedClass: null,
      hierarchyLoading: false,

      schoolList: [],
      collegeList: [],
      classList: [],

      roleStats: { checkerCount: 0, subCheckerCount: 0, checkers: [], subCheckers: [] },

      users: [],
      usersLoading: false,
      userFilters: { search: '', role: '' },
      userPagination: { currentPage: 1, pageSize: 20, total: 0 },
      userDetailVisible: false,
      currentUser: null,
      showEditPhone: false,
      editPhoneLoading: false,
      editPhoneForm: { phoneNumber: '' }
    }
  },
  mounted() {
    this.initWithPermission()
  },
  methods: {
    async initWithPermission() {
      this.hierarchyLoading = true
      try {
        const res = await api.peManagement.getPermissionInfo()
        if (res.code === 200 && res.data) {
          this.permInfo = res.data
          const ut = res.data.userType
          if (ut === 'super_admin') {
            this.startLevel = 'school'
            this.viewLevel = 'school'
            this.loadSchools()
          } else if (ut === 'school_admin') {
            this.startLevel = 'college'
            this.selectedSchool = res.data.school || ''
            this.viewLevel = 'college'
            this.loadColleges()
          } else if (ut === 'counselor') {
            this.startLevel = 'class'
            this.selectedSchool = res.data.school || ''
            this.selectedCollege = res.data.departmentName || ''
            this.viewLevel = 'class'
            this.loadClasses()
          } else if (ut === 'department_admin') {
            this.startLevel = 'class'
            this.selectedSchool = res.data.school || ''
            this.selectedCollege = res.data.departmentName || ''
            this.viewLevel = 'class'
            this.loadClasses()
          } else {
            this.loadSchools()
          }
        } else {
          this.loadSchools()
        }
      } catch (e) {
        console.error('获取权限信息失败:', e)
        this.loadSchools()
      }
    },

    handleBack() {
      if (this.viewLevel === this.startLevel) {
        this.$router.push('/group')
      } else if (this.viewLevel === 'college') {
        this.navigateTo('school')
      } else if (this.viewLevel === 'class') {
        this.navigateTo('college')
      } else if (this.viewLevel === 'members') {
        this.navigateTo('class')
      }
    },

    navigateTo(level) {
      const levels = ['school', 'college', 'class', 'members']
      const startIdx = levels.indexOf(this.startLevel)
      const targetIdx = levels.indexOf(level)
      if (targetIdx < startIdx) return

      if (level === 'school') {
        this.viewLevel = 'school'
        this.selectedSchool = ''
        this.selectedCollege = ''
        this.selectedClass = null
      } else if (level === 'college') {
        this.viewLevel = 'college'
        this.selectedCollege = ''
        this.selectedClass = null
      } else if (level === 'class') {
        this.viewLevel = 'class'
        this.selectedClass = null
      }
    },

    async loadSchools() {
      this.hierarchyLoading = true
      try {
        const res = await api.peManagement.getSchools()
        this.schoolList = res.code === 200 ? (res.data || []) : []
      } catch (e) {
        console.error('加载学校列表失败:', e)
        this.$message.error('加载学校列表失败')
        this.schoolList = []
      } finally {
        this.hierarchyLoading = false
      }
    },

    async loadColleges() {
      this.hierarchyLoading = true
      try {
        const res = await api.peManagement.getColleges(this.selectedSchool)
        this.collegeList = res.code === 200 ? (res.data || []) : []
      } catch (e) {
        console.error('加载学院列表失败:', e)
        this.$message.error('加载学院列表失败')
        this.collegeList = []
      } finally {
        this.hierarchyLoading = false
      }
    },

    async loadClasses() {
      this.hierarchyLoading = true
      try {
        const res = await api.peManagement.getClasses(this.selectedSchool, this.selectedCollege)
        this.classList = res.code === 200 ? (res.data || []) : []
      } catch (e) {
        console.error('加载班级列表失败:', e)
        this.$message.error('加载班级列表失败')
        this.classList = []
      } finally {
        this.hierarchyLoading = false
      }
    },

    selectSchool(name) {
      this.selectedSchool = name
      this.viewLevel = 'college'
      this.loadColleges()
    },

    selectCollege(name) {
      this.selectedCollege = name
      this.viewLevel = 'class'
      this.loadClasses()
    },

    selectClass(name) {
      this.selectedClass = name
      this.viewLevel = 'members'
      this.userPagination.currentPage = 1
      this.userFilters = { search: '', role: '' }
      this.loadUsers()
      this.loadRoleStats()
    },

    /** 加载班级内的角色人员（签到员+二级管理员）*/
    async loadRoleStats() {
      this.roleStats = { checkerCount: 0, subCheckerCount: 0, checkers: [], subCheckers: [] }
      try {
        const [checkerRes, subCheckerRes] = await Promise.all([
          api.peManagement.getUsers({
            page: 1, pageSize: 100, role: 'CHECKER',
            school: this.selectedSchool, college: this.selectedCollege, className: this.selectedClass
          }),
          api.peManagement.getUsers({
            page: 1, pageSize: 100, role: 'SUB_CHECKER',
            school: this.selectedSchool, college: this.selectedCollege, className: this.selectedClass
          })
        ])
        const checkers = checkerRes.code === 200 ? (checkerRes.data?.list || []) : []
        const subCheckers = subCheckerRes.code === 200 ? (subCheckerRes.data?.list || []) : []
        this.roleStats = {
          checkerCount: checkerRes.data?.total || checkers.length,
          subCheckerCount: subCheckerRes.data?.total || subCheckers.length,
          checkers,
          subCheckers
        }
      } catch (e) {
        console.error('加载角色统计失败:', e)
      }
    },

    async loadUsers() {
      this.usersLoading = true
      try {
        const params = {
          page: this.userPagination.currentPage,
          pageSize: this.userPagination.pageSize,
          school: this.selectedSchool,
          college: this.selectedCollege,
          className: this.selectedClass,
          ...this.userFilters
        }
        if (!params.role) delete params.role
        if (!params.search) delete params.search
        const response = await api.peManagement.getUsers(params)
        if (response.code === 200) {
          this.users = Array.isArray(response.data?.list) ? response.data.list : []
          this.userPagination.total = response.data?.total || 0
        } else {
          this.users = []
        }
      } catch (error) {
        console.error('加载用户列表失败:', error)
        this.$message.error('加载用户列表失败：' + (error.message || '网络错误'))
        this.users = []
      } finally {
        this.usersLoading = false
      }
    },
    
    resetUserFilters() {
      this.userFilters = { search: '', role: '' }
      this.userPagination.currentPage = 1
      this.loadUsers()
    },
    
    viewUserDetail(user) {
      this.currentUser = { ...user }
      this.editPhoneForm.phoneNumber = user.phoneNumber || ''
      this.userDetailVisible = true
    },

    closeUserDetail() {
      this.userDetailVisible = false
      this.showEditPhone = false
      this.currentUser = null
    },

    async handleForceLogout(user) {
      try {
        await this.$confirm(`确定要强制登出 ${user.name} 吗？`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
        const res = await api.peManagement.forceLogout(user.id)
        if (res.code === 200) {
          this.$message.success('已强制登出')
          this.currentUser.isLoggedIn = false
          this.loadUsers()
        } else {
          this.$message.error(res.message || '操作失败')
        }
      } catch (e) {
        if (e !== 'cancel') this.$message.error('操作失败：' + (e.message || e))
      }
    },

    async submitEditPhone() {
      const phone = this.editPhoneForm.phoneNumber
      if (!/^1[3-9]\d{9}$/.test(phone)) { this.$message.warning('请输入正确的手机号格式'); return }
      this.editPhoneLoading = true
      try {
        const res = await api.peManagement.updateUserPhone(this.currentUser.id, phone)
        if (res.code === 200) {
          this.$message.success('手机号修改成功')
          this.currentUser.phoneNumber = phone
          this.showEditPhone = false
          this.loadUsers()
        } else {
          this.$message.error(res.message || '修改失败')
        }
      } catch (e) {
        this.$message.error('修改失败：' + (e.message || e))
      } finally {
        this.editPhoneLoading = false
      }
    },
    
    async setUserRole(user, role) {
      const roleText = role === 'CHECKER' ? '签到员' : '二级管理员'
      try {
        await this.$confirm(`确定将 ${user.name} 设为${roleText}吗？`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
        const response = await api.peManagement.setUserRole(user.id, { role })
        if (response.code === 200) {
          this.$message.success('设置成功')
          this.loadUsers()
          this.loadRoleStats()
        }
      } catch (error) {
        if (error !== 'cancel') this.$message.error('设置失败：' + (error.message || error))
      }
    },
    
    handleUserSizeChange(val) { this.userPagination.pageSize = val; this.userPagination.currentPage = 1; this.loadUsers() },
    handleUserCurrentChange(val) { this.userPagination.currentPage = val; this.loadUsers() },
    
    formatDateTime(d) { return d ? new Date(d).toLocaleString('zh-CN') : '-' },
    formatDistance(v) { return v ? (v / 1000).toFixed(2) : '0' },
    formatDuration(s) { if (!s) return '0分钟'; const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}时${m}分` : `${m}分钟` },
    
    getRoleType(role) { return { STUDENT: '', CHECKER: 'success', SUB_CHECKER: 'warning', ADMIN: 'danger' }[role] || 'info' },
    getRoleText(role) { return { STUDENT: '学生', CHECKER: '签到员', SUB_CHECKER: '二级管理员', ADMIN: '管理员' }[role] || role }
  }
}
</script>

<style scoped>
.pe-management { min-height: 100vh; background: #f5f5f5; }

.page-header { background: #fff; border-bottom: 1px solid #e8e8e8; position: sticky; top: 0; z-index: 1000; box-shadow: 0 1px 4px rgba(0,21,41,.08); }
.header-container { max-width: 1400px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; height: 56px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.back-btn { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #fafafa; border: 1px solid #d9d9d9; border-radius: 6px; color: #434343; cursor: pointer; transition: all .2s; font-size: 13px; }
.back-btn:hover { border-color: #1677ff; color: #1677ff; }
.back-btn svg { width: 16px; height: 16px; }
.page-info { display: flex; flex-direction: column; }
.page-title { font-size: 17px; font-weight: 600; color: #000000d9; margin: 0; }
.page-subtitle { font-size: 11px; color: #00000073; font-weight: 500; letter-spacing: .5px; text-transform: uppercase; margin-top: 2px; }

.breadcrumb-nav { background: #fff; border-bottom: 1px solid #f0f0f0; padding: 0 24px; }
.breadcrumb-container { max-width: 1400px; margin: 0 auto; padding: 10px 0; display: flex; align-items: center; gap: 4px; font-size: 13px; }
.breadcrumb-item { color: #1677ff; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: background .15s; }
.breadcrumb-item:hover { background: #e6f4ff; }
.breadcrumb-item.active { color: #000000d9; cursor: default; font-weight: 500; }
.breadcrumb-item.active:hover { background: transparent; }
.breadcrumb-sep { color: #d9d9d9; margin: 0 2px; }

.main-content { padding: 20px 0; }
.content-container { max-width: 1400px; margin: 0 auto; padding: 0 24px; }

.card-section { background: #fff; border-radius: 8px; padding: 24px; border: 1px solid #f0f0f0; box-shadow: 0 1px 4px rgba(0,21,41,.08); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-title { font-size: 16px; font-weight: 600; color: #000000d9; margin: 0; }
.section-count { font-size: 13px; color: #00000073; background: #fafafa; padding: 4px 10px; border-radius: 12px; border: 1px solid #f0f0f0; }

.loading-box, .empty-box { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: #00000073; }
.spinner { width: 28px; height: 28px; border: 3px solid #f0f0f0; border-left-color: #1677ff; border-radius: 50%; animation: spin .8s linear infinite; margin-bottom: 12px; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 12px; }
.hierarchy-card { display: flex; align-items: center; padding: 16px; background: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px; cursor: pointer; transition: all .2s; gap: 14px; }
.hierarchy-card:hover { border-color: #91caff; background: #e6f4ff; box-shadow: 0 2px 8px rgba(22,119,255,.1); }
.card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card-icon svg { width: 22px; height: 22px; }
.school-icon { background: #e6f4ff; color: #1677ff; }
.college-icon { background: #f6ffed; color: #52c41a; }
.class-icon { background: #fff7e6; color: #fa8c16; }
.card-body { flex: 1; min-width: 0; }
.card-name { font-size: 15px; font-weight: 600; color: #000000d9; margin: 0 0 6px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-stats { display: flex; flex-wrap: wrap; gap: 6px; }
.stat-tag { font-size: 12px; padding: 2px 8px; border-radius: 10px; background: #fff; border: 1px solid #e8e8e8; color: #595959; }
.role-tag.checker { background: #f6ffed; border-color: #b7eb8f; color: #389e0d; }
.role-tag.sub-checker { background: #fff7e6; border-color: #ffd591; color: #d46b08; }
.card-arrow { color: #bfbfbf; flex-shrink: 0; transition: color .2s; }
.hierarchy-card:hover .card-arrow { color: #1677ff; }
.card-arrow svg { width: 18px; height: 18px; }

.role-overview { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.role-card { display: flex; flex-direction: column; padding: 18px; border-radius: 8px; border: 1px solid #f0f0f0; gap: 10px; }
.checker-card { background: #f6ffed; border-color: #b7eb8f; }
.sub-checker-card { background: #fff7e6; border-color: #ffd591; }
.role-card-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
.checker-card .role-card-icon { color: #52c41a; }
.sub-checker-card .role-card-icon { color: #fa8c16; }
.role-card-icon svg { width: 24px; height: 24px; }
.role-card-info { display: flex; align-items: baseline; gap: 8px; }
.role-card-count { font-size: 28px; font-weight: 700; line-height: 1; }
.checker-card .role-card-count { color: #389e0d; }
.sub-checker-card .role-card-count { color: #d46b08; }
.role-card-label { font-size: 14px; color: #595959; font-weight: 500; }
.role-card-names { display: flex; flex-wrap: wrap; gap: 6px; }
.name-tag { font-size: 12px; padding: 3px 10px; border-radius: 12px; background: rgba(255,255,255,.8); border: 1px solid rgba(0,0,0,.06); color: #262626; font-weight: 500; }
.role-card-empty { font-size: 13px; color: #00000040; }

.users-section { background: #fff; border-radius: 8px; padding: 24px; border: 1px solid #f0f0f0; box-shadow: 0 1px 4px rgba(0,21,41,.08); }
.filter-section { margin-bottom: 20px; }
.filter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.filter-title { font-size: 16px; font-weight: 600; color: #000000d9; margin: 0; }
.filter-reset { padding: 4px 12px; background: #fff; border: 1px solid #d9d9d9; border-radius: 4px; color: #595959; font-size: 12px; cursor: pointer; transition: all .2s; }
.filter-reset:hover { border-color: #1677ff; color: #1677ff; }
.filter-form { margin-top: 12px; }
.filter-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: end; }
.filter-group { display: flex; flex-direction: column; gap: 6px; }
.filter-label { font-size: 13px; font-weight: 500; color: #434343; }
.role-text-plain { color: #595959; font-size: 13px; }

.table-section { background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #f0f0f0; }
.table-container { overflow-x: auto; }
.modern-table { width: 100%; }
.action-buttons { display: flex; gap: 6px; align-items: center; }
.action-buttons .el-button { margin: 0; }
.pagination-section { padding: 16px; background: #fafafa; border-top: 1px solid #f0f0f0; display: flex; justify-content: center; }

.user-detail-dialog :deep(.el-dialog) { border-radius: 8px; overflow: hidden; }
.user-detail-dialog :deep(.el-dialog__header) { background: linear-gradient(135deg, #1677ff, #4096ff); color: white; padding: 16px 24px; }
.user-detail-dialog :deep(.el-dialog__title) { color: white; font-weight: 600; }
.user-detail-content { padding: 24px; }
.user-header { display: flex; align-items: center; gap: 16px; padding: 20px; background: #fafafa; border-radius: 8px; margin-bottom: 20px; }
.user-avatar { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; background: #fff; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder { color: #bfbfbf; display: flex; align-items: center; justify-content: center; }
.avatar-placeholder svg { width: 32px; height: 32px; }
.user-info { flex: 1; }
.user-name { font-size: 20px; font-weight: 700; color: #000000d9; margin: 0 0 4px 0; }
.user-id { color: #595959; margin: 0 0 8px 0; font-size: 13px; }
.user-status { display: flex; gap: 6px; }
.detail-sections { display: flex; flex-direction: column; gap: 16px; }
.detail-section { background: #fafafa; border-radius: 8px; padding: 20px; border: 1px solid #f0f0f0; }
.section-title-detail { font-size: 15px; font-weight: 600; color: #000000d9; margin: 0 0 14px 0; padding-bottom: 8px; border-bottom: 2px solid #1677ff; }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.info-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #fff; border-radius: 6px; border: 1px solid #f0f0f0; }
.info-item label { font-size: 13px; color: #595959; font-weight: 500; }
.info-item span { color: #262626; font-weight: 500; font-size: 13px; }
.score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
.score-item { text-align: center; padding: 14px; background: #fff; border-radius: 8px; border: 1px solid #f0f0f0; transition: box-shadow .2s; }
.score-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.score-value { font-size: 20px; font-weight: 700; color: #1677ff; line-height: 1; margin-bottom: 6px; }
.score-label { font-size: 12px; color: #595959; font-weight: 500; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 24px; background: #fafafa; border-top: 1px solid #f0f0f0; }

@media (max-width: 1024px) {
  .card-grid { grid-template-columns: 1fr; }
  .filter-row { grid-template-columns: 1fr; }
  .role-overview { grid-template-columns: 1fr; }
  .user-detail-dialog :deep(.el-dialog) { width: 90% !important; }
  .info-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .header-container { padding: 0 16px; }
  .breadcrumb-nav { padding: 0 16px; }
  .content-container { padding: 0 12px; }
  .users-section, .card-section { padding: 16px; }
  .user-header { flex-direction: column; text-align: center; }
  .user-detail-dialog :deep(.el-dialog) { width: 95% !important; }
  .user-detail-content { padding: 16px; }
}
</style>
