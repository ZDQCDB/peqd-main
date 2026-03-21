<template>
  <div class="pe-management">
    <!-- 顶部导航栏 -->
    <header class="page-header">
      <div class="header-container">
        <div class="header-left">
          <button class="back-btn" @click="$router.push('/group')">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            返回群体管理
          </button>
          <div class="page-info">
            <h1 class="page-title">PE校园管理端</h1>
            <p class="page-subtitle">User Management System</p>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <!-- 用户管理区域 -->
        <section class="users-section">
      
          <!-- 筛选和搜索 -->
          <div class="filter-section">
            <div class="filter-header">
              <h3 class="filter-title">用户筛选</h3>
              <div class="filter-actions">
                <button class="filter-reset" @click="resetUserFilters">重置筛选</button>
              </div>
            </div>
            
            <div class="filter-form">
              <div class="filter-row">
                <div class="filter-group">
                  <label class="filter-label">搜索关键词</label>
                  <el-input
                    v-model="userFilters.search"
                    placeholder="姓名或学号"
                    clearable
                    @keyup.enter="loadUsers"
                    @clear="loadUsers"
                  />
                </div>
                
                <div class="filter-group">
                  <label class="filter-label">用户角色</label>
                  <el-select v-model="userFilters.role" @change="loadUsers" style="width:100%">
                    <el-option label="学生" value="STUDENT" />
                    <el-option label="签到员" value="CHECKER" />
                    <el-option label="二级管理员" value="SUB_CHECKER" />
                    <el-option label="管理员" value="ADMIN" />
                  </el-select>
                </div>
              </div>
            </div>
          </div>
            
          <!-- 数据表格 -->
          <div class="table-section">
            <div class="table-container">
              <el-table 
                :data="users" 
                v-loading="usersLoading" 
                stripe
                class="modern-table"
                :header-cell-style="{ background: '#f8f9fa', color: '#303133', fontWeight: '600' }"
              >
              <el-table-column prop="name" label="姓名" width="120"></el-table-column>
                <el-table-column prop="studentId" label="学号" width="120"></el-table-column>
              <el-table-column prop="school" label="学校" width="150"></el-table-column>
              <el-table-column prop="college" label="学院" width="150"></el-table-column>
                <el-table-column prop="phoneNumber" label="手机号" width="130"></el-table-column>
              <el-table-column prop="points" label="总积分" width="100"></el-table-column>
                <el-table-column prop="studyHours" label="学时" width="80"></el-table-column>
              <el-table-column prop="role" label="角色" width="120">
                <template #default="{ row }">
                  <el-tag :type="getRoleType(row.role)">
                    {{ getRoleText(row.role) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <div class="action-buttons">
                    <el-button size="mini" @click="viewUserDetail(row)">详情</el-button>
                    <el-button 
                      v-if="row.role === 'STUDENT'"
                      size="mini" 
                      type="warning" 
                      @click="setUserAsChecker(row)">
                      设为签到员
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            </div>
            
            <!-- 分页 -->
            <div class="pagination-section">
            <el-pagination
              @size-change="handleUserSizeChange"
              @current-change="handleUserCurrentChange"
              :current-page="userPagination.currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="userPagination.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
                :total="userPagination.total"
                background
              />
            </div>
          </div>
        </section>

      </div>
    </main>

    <!-- 用户详情对话框 -->
    <el-dialog 
      title="用户详情" 
      v-model="userDetailVisible" 
      width="700px"
      :before-close="closeUserDetail"
      class="user-detail-dialog"
    >
      <div v-if="currentUser" class="user-detail-content">
        <!-- 用户头像和基本信息 -->
        <div class="user-header">
          <div class="user-avatar">
            <img v-if="currentUser.avatar" :src="currentUser.avatar" alt="用户头像" />
            <div v-else class="avatar-placeholder">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
          </div>
          <div class="user-info">
            <h3 class="user-name">{{ currentUser.name }}</h3>
            <p class="user-id">学号：{{ currentUser.studentId }}</p>
            <div class="user-status">
              <el-tag :type="getRoleType(currentUser.role)" size="small">
                {{ getRoleText(currentUser.role) }}
              </el-tag>
              <el-tag :type="currentUser.isLoggedIn ? 'success' : 'info'" size="small">
                {{ currentUser.isLoggedIn ? '在线' : '离线' }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="detail-sections">
          <!-- 基本信息 -->
          <div class="detail-section">
            <h4 class="section-title">基本信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>学校</label>
                <span>{{ currentUser.school || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label>学院</label>
                <span>{{ currentUser.college || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label>班级</label>
                <span>{{ currentUser.className || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label>手机号</label>
                <span>{{ currentUser.phoneNumber || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label>注册时间</label>
                <span>{{ formatDateTime(currentUser.createdAt) }}</span>
              </div>
              <div class="info-item">
                <label>最后更新</label>
                <span>{{ formatDateTime(currentUser.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- 积分信息 -->
          <div class="detail-section">
            <h4 class="section-title">积分 & 学时</h4>
            <div class="score-grid">
              <div class="score-item">
                <div class="score-value">{{ currentUser.points || 0 }}</div>
                <div class="score-label">总积分</div>
              </div>
              <div class="score-item">
                <div class="score-value">{{ currentUser.peActivityPoints || 0 }}</div>
                <div class="score-label">PE活动积分</div>
              </div>
              <div class="score-item">
                <div class="score-value">{{ currentUser.morningExercisePoints || 0 }}</div>
                <div class="score-label">早操积分</div>
              </div>
              <div class="score-item">
                <div class="score-value">{{ currentUser.studyHours || 0 }}</div>
                <div class="score-label">学时</div>
              </div>
              <div class="score-item">
                <div class="score-value">{{ currentUser.integrityScore ?? 100 }}</div>
                <div class="score-label">诚信度</div>
              </div>
            </div>
          </div>

          <!-- 阳光跑数据 -->
          <div class="detail-section">
            <h4 class="section-title">阳光跑数据</h4>
            <div class="score-grid">
              <div class="score-item">
                <div class="score-value">{{ currentUser.sunshineTotalRuns || 0 }}</div>
                <div class="score-label">总跑步次数</div>
              </div>
              <div class="score-item">
                <div class="score-value">{{ formatDistance(currentUser.sunshineTotalDistance) }}</div>
                <div class="score-label">总距离(km)</div>
              </div>
              <div class="score-item">
                <div class="score-value">{{ formatDuration(currentUser.sunshineTotalDuration) }}</div>
                <div class="score-label">总时长</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeUserDetail">关闭</el-button>
          <el-button 
            v-if="currentUser && currentUser.isLoggedIn"
            type="warning" 
            @click="handleForceLogout(currentUser)">
            强制登出
          </el-button>
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
      users: [],
      usersLoading: false,
      userFilters: {
        search: '',
        role: 'STUDENT'
      },
      userPagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      userDetailVisible: false,
      currentUser: null,
      // 修改手机号
      showEditPhone: false,
      editPhoneLoading: false,
      editPhoneForm: { phoneNumber: '' }
    }
  },
  mounted() {
    this.loadUsers()
  },
  methods: {
    // 用户管理方法
    async loadUsers() {
      this.usersLoading = true
      try {
        const params = {
          page: this.userPagination.currentPage,
          pageSize: this.userPagination.pageSize,
          ...this.userFilters
        }
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
      this.userFilters = {
        search: '',
        role: 'STUDENT'
      }
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
        await this.$confirm(`确定要强制登出 ${user.name} 吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
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
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        this.$message.warning('请输入正确的手机号格式')
        return
      }
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
    
    async setUserAsChecker(user) {
      try {
        const response = await api.peManagement.setUserRole(user.id, {
          role: 'CHECKER'
        })
        
        if (response.code === 200) {
          this.$message.success('设置成功')
          this.loadUsers()
        }
      } catch (error) {
        this.$message.error('设置失败：' + error.message)
      }
    },
    
    handleUserSizeChange(val) {
      this.userPagination.pageSize = val
      this.userPagination.currentPage = 1
      this.loadUsers()
    },
    
    handleUserCurrentChange(val) {
      this.userPagination.currentPage = val
      this.loadUsers()
    },
    
    // 工具方法
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    },

    formatDistance(val) {
      if (!val) return '0'
      return (val / 1000).toFixed(2)
    },

    formatDuration(seconds) {
      if (!seconds) return '0分钟'
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      if (h > 0) return `${h}时${m}分`
      return `${m}分钟`
    },
    
    getRoleType(role) {
      const types = {
        'STUDENT': 'primary',
        'CHECKER': 'success',
        'SUB_CHECKER': 'warning',
        'ADMIN': 'danger'
      }
      return types[role] || 'info'
    },
    
    getRoleText(role) {
      const texts = {
        'STUDENT': '学生',
        'CHECKER': '签到员',
        'SUB_CHECKER': '二级管理员',
        'ADMIN': '管理员'
      }
      return texts[role] || role
    }
  }
}
</script>

<style scoped>
/* 主容器 */
.pe-management {
  min-height: 100vh;
  background: #fafafa; border: 1px solid var(--border-light);
}

/* 顶部导航栏 */
.page-header {
  background: #ffffff;
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: var(--shadow-sm);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--divider);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  font-size: 14px;
}

.back-btn:hover {
  background: var(--bg-surface);
  border-color: var(--primary-color);
  color: var(--primary-color);
  
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.page-info {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #000000d9;
  margin: 0;
  color: var(--text-primary);
}

.page-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-top: var(--spacing-xs);
}

/* 主内容区域 */
.main-content {
  padding: var(--spacing-xl) 0;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
}

/* 用户管理区域 */
.users-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

/* 筛选区域 */
.filter-section {
  margin-bottom: var(--spacing-xl);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.filter-title {
  font-size: 20px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.filter-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.filter-reset {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-surface);
  border: 1px solid var(--divider);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.filter-reset:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.filter-form {
  margin-top: var(--spacing-lg);
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  align-items: end;
}

.filter-btn-row {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.filter-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.filter-label svg {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
}

.filter-select,
.filter-input {
  padding: var(--spacing-md);
  border: 2px solid var(--divider);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all var(--transition-normal);
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
}

.search-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.search-btn:hover {
  
  box-shadow: var(--shadow-md);
}

.search-btn svg {
  width: 18px;
  height: 18px;
}

/* 表格区域 */
.table-section {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table-container {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-radius: var(--radius-lg);
}

.modern-table :deep(.el-table__header) {
  background: #f8f9fa;
}

.modern-table :deep(.el-table__row:hover) {
  background: rgba(26, 35, 126, 0.05);
}

/* 操作按钮区域 */
.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
}

.action-buttons .el-button {
  margin: 0;
}

/* 分页区域 */
.pagination-section {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-top: 1px solid var(--divider);
  display: flex;
  justify-content: center;
}

.pagination-section :deep(.el-pagination) {
  background: transparent;
}

/* 用户详情弹窗样式 */
.user-detail-dialog :deep(.el-dialog) {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.user-detail-dialog :deep(.el-dialog__header) {
  background: var(--primary-gradient);
  color: white;
  padding: var(--spacing-lg) var(--spacing-xl);
}

.user-detail-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: var(--font-weight-semibold);
}

.user-detail-content {
  padding: var(--spacing-xl);
}

.user-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
}

.user-avatar {
  width: 80px;
  height: var(--header-height);
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
  box-shadow: var(--shadow-md);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder svg {
  width: 40px;
  height: 40px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.user-id {
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md) 0;
  font-size: 14px;
}

.user-status {
  display: flex;
  gap: var(--spacing-sm);
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.detail-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--border-light);
}

.section-title {
  font-size: 18px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--primary-color);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--divider);
}

.info-item label {
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  font-size: 14px;
}

.info-item span {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-lg);
}

.score-item {
  text-align: center;
  padding: var(--spacing-lg);
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--divider);
  transition: all var(--transition-normal);
}

.score-item:hover {
  
  box-shadow: var(--shadow-md);
}

.score-value {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: var(--spacing-sm);
}

.score-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--bg-secondary);
  border-top: 1px solid var(--divider);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .filter-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .content-container {
    padding: 0 var(--spacing-lg);
  }

  .user-detail-dialog :deep(.el-dialog) {
    width: 90% !important;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .score-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 var(--spacing-lg);
  }
  
  .users-section {
    padding: var(--spacing-lg);
  }
  
  .content-container {
    padding: 0 var(--spacing-md);
  }

  .user-header {
    flex-direction: column;
    text-align: center;
  }

  .user-detail-dialog :deep(.el-dialog) {
    width: 95% !important;
  }

  .user-detail-content {
    padding: var(--spacing-lg);
  }
}
</style> 