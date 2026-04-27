<template>
  <div class="admin-management">
    <!-- 顶部导航栏 -->
    <header class="page-header">
      <div class="header-container">
        <div class="header-left">
          <button class="back-btn" @click="$router.push('/dashboard')">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            返回桌面
          </button>
          <div class="page-info">
            <h1 class="page-title">管理员管理</h1>
            <p class="page-subtitle">User Management System</p>
          </div>
          <div class="role-indicator">
            <span class="role-badge premium">{{ getRoleText(currentUserRole) }}</span>
          </div>
        </div>
        
        <div class="header-actions">
          <button v-if="isSuperAdminRole || isSchoolAdminRole" class="action-btn import-btn" @click="openImportDialog">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            导入名单
          </button>
          <button v-if="isSuperAdminRole || isSchoolAdminRole" class="action-btn stats-btn" @click="openSchoolStatsDialog">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            预导入统计
          </button>
          <button v-if="isSuperAdminRole || isSchoolAdminRole" class="action-btn school-account-btn" @click="$router.push('/admin/school-accounts')" title="按预导入学校可视化开户">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="9" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="3" width="7" height="5" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="12" width="7" height="9" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="3" y="16" width="7" height="5" rx="1" stroke="currentColor" stroke-width="2"/>
            </svg>
            学校开户
          </button>
          <button v-if="isSuperAdminRole" class="action-btn face-btn" @click="openFaceImportDialog">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            人脸库导入
          </button>
          <button class="action-btn counselor-btn" @click="$router.push('/admin/counselor-management')" title="为辅导员分配管辖班级">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            辅导员班级管理
          </button>
          <button class="action-btn secondary" @click="exportUserData">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            导出数据
          </button>
          <button class="action-btn refresh" @click="refreshData">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 3v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="content-container">
        
        <!-- 统计信息 -->
        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-card student" v-if="canManageStudent">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M6 12v5c3 0 9-1 9-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>学生总数</h3>
                <p class="stat-number">{{ stats.studentCount }}</p>
                <span class="stat-label">已注册用户</span>
              </div>
            </div>
            
            <div class="stat-card teacher">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>教师总数</h3>
                <p class="stat-number">{{ stats.teacherCount }}</p>
                <span class="stat-label">活跃教师</span>
              </div>
            </div>
            
            <div class="stat-card admin" v-if="canManageDepartmentAdmin">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>管理员</h3>
                <p class="stat-number">{{ stats.departmentAdminCount + stats.schoolAdminCount }}</p>
                <span class="stat-label">各级管理员</span>
              </div>
            </div>
            
            <div class="stat-card online">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>在线用户</h3>
                <p class="stat-number">{{ stats.onlineCount }}</p>
                <span class="stat-label">当前在线</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 超管数据导入教程 -->
        <section v-if="isSuperAdminRole" class="notice-section notice-blue">
          <div class="notice-header">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="notice-icon">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="notice-title">数据导入教程</span>
          </div>
          <p class="notice-desc">
            系统注册逻辑为先导入预导入表，在用户注册时会对预导入表的信息做匹配以规避混乱注册，信息导入步骤如下：
          </p>
          <ol class="notice-steps">
            <li>
              <span class="step-num">1</span>
              点击顶部 <strong>「预导入统计」</strong> 按钮，查看各学校当前已导入的学生/教师数量
            </li>
            <li>
              <span class="step-num">2</span>
              点击顶部 <strong>「导入名单」</strong> 按钮，下载模版后填写教师信息和学生信息，分别上传导入
            </li>
            <li>
              <span class="step-num">3</span>
              点击顶部 <strong>「人脸库导入」</strong> 按钮，将以学号/工号命名的人脸照片打包成 <strong>.zip</strong> 压缩包后上传
            </li>
          </ol>
        </section>

        <!-- 校管/超管角色说明 -->
        <section v-if="isSuperAdminRole || isSchoolAdminRole" class="notice-section notice-orange">
          <div class="notice-header">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="notice-icon">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="notice-title">用户角色说明</span>
          </div>
          <div class="notice-role-rows">
            <div class="notice-role-item">
              <span class="role-tag teacher-tag">教师</span>
              <span>教师用户注册后初始身份为教师，可通过列表中的 <strong>「提升权限」</strong> 按钮将其提权为辅导员、院级管理员或校级管理员</span>
            </div>
            <div class="notice-role-item">
              <span class="role-tag counselor-tag">辅导员</span>
              <span>辅导员介于教师与院管之间，由院管或校管指定，拥有所辖班级的数据查看权限和早操发布权限</span>
            </div>
            <div class="notice-role-item">
              <span class="role-tag student-tag">学生</span>
              <span>学生用户注册后可在 <strong>群体活动 → PE校园管理端</strong> 中查看；可指定学生设为签到员，签到员身份即为班级管理员</span>
            </div>
          </div>
        </section>

        <!-- 筛选和搜索 -->
        <section class="filter-section">
          <div class="filter-header">
            <h3 class="filter-title">用户筛选</h3>
            <div class="filter-actions">
              <button class="filter-reset" @click="resetFilters">重置筛选</button>
            </div>
          </div>
          
          <div class="filter-form">
            <div class="filter-row">
              <div class="filter-group">
                <label class="filter-label">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    <path d="M20 8v6M23 11h-6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  用户类型
                </label>
                <select v-model="filters.userType" @change="loadUsers" class="filter-select">
                  <option value="">全部类型</option>
                  <option value="student" v-if="canManageStudent">学生</option>
                  <option value="teacher">教师</option>
                  <option value="counselor" v-if="canManageDepartmentAdmin">辅导员</option>
                  <option value="department_admin" v-if="canManageDepartmentAdmin">院级管理员</option>
                  <option value="school_admin" v-if="canManageSchoolAdmin">校级管理员</option>
                </select>
              </div>
              
              <div class="filter-group">
                <label class="filter-label">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  搜索关键词
                </label>
                <input 
                  type="text" 
                  v-model="filters.keyword" 
                  placeholder="姓名、用户名、邮箱"
                  @input="debounceSearch"
                  class="filter-input search-input"
                />
              </div>
              
              <div class="filter-group">
                <label class="filter-label">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  账户状态
                </label>
                <select v-model="filters.status" @change="loadUsers" class="filter-select">
                  <option value="">全部状态</option>
                  <option value="active">正常</option>
                  <option value="suspended">已停用</option>
                </select>
              </div>
              
              <div class="filter-group">
                <label class="filter-label">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2"/>
                    <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  所属院系
                </label>
                <select v-model="filters.departmentId" @change="loadUsers" class="filter-select">
                  <option value="">全部院系</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>

    <!-- 批量操作 -->
    <div class="bulk-actions" v-if="selectedUsers.length > 0">
      <div class="bulk-info">
        已选择 {{ selectedUsers.length }} 个用户
      </div>
      <div class="bulk-buttons">
        <button class="btn btn-warning" @click="bulkSuspend">批量停用</button>
        <button class="btn btn-success" @click="bulkActivate">批量启用</button>
        <button class="btn btn-danger" @click="bulkExport">导出选中</button>
        <button class="btn btn-secondary" @click="clearSelection">清除选择</button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="users-section">
      <h3>用户列表</h3>
      <div class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" @change="toggleSelectAll" :checked="allSelected" />
              </th>
              <th>姓名</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>当前角色</th>
              <th>所属院系</th>
              <th>所属学校</th>
              <th>状态</th>
              <th>最后登录</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <input type="checkbox" :value="user.id" v-model="selectedUsers" />
              </td>
              <td>{{ user.realName }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" :class="user.userType">
                  {{ getRoleText(user.userType) }}
                </span>
              </td>
              <td>{{ user.departmentName || '未设置' }}</td>
              <td>{{ user.school || '未设置' }}</td>
              <td>
                <span class="status-badge" :class="user.status">
                  {{ getStatusText(user.status) }}
                </span>
              </td>
              <td>{{ formatDateTime(user.lastLoginAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="btn btn-info btn-small"
                    @click="showUserDetail(user)"
                  >
                    详情
                  </button>
                  <button 
                    v-if="canPromoteUser(user)"
                    class="btn btn-primary btn-small"
                    @click="showPromoteModal(user)"
                  >
                    提升权限
                  </button>
                  <button 
                    v-if="canDemoteUser(user)"
                    class="btn btn-warning btn-small"
                    @click="showDemoteModal(user)"
                  >
                    降低权限
                  </button>
                  <button 
                    v-if="user.status === 'active'"
                    class="btn btn-danger btn-small"
                    @click="suspendUser(user)"
                  >
                    停用
                  </button>
                  <button 
                    v-if="user.status === 'suspended'"
                    class="btn btn-success btn-small"
                    @click="activateUser(user)"
                  >
                    启用
                  </button>
                  <button
                    v-if="isSuperAdminRole && (user.userType === 'teacher' || user.userType === 'department_admin' || user.userType === 'school_admin' || user.userType === 'counselor')"
                    class="btn btn-small"
                    style="background:#722ed1;color:#fff"
                    @click="impersonateUser(user)"
                  >
                    以此角色进入
                  </button>
                  <button 
                    class="btn btn-warning btn-small"
                    @click="showResetPasswordModal(user)"
                  >
                    重置密码
                  </button>
                  <button 
                    class="btn btn-secondary btn-small"
                    @click="showAuditLog(user)"
                  >
                    日志
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="loading" class="loading">
          加载中...
        </div>
        
        <div v-if="!loading && users.length === 0" class="no-data">
          暂无数据
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="pagination.total > 0">
        <button 
          class="btn btn-secondary"
          :disabled="pagination.page <= 1"
          @click="changePage(pagination.page - 1)"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ pagination.page }} 页，共 {{ pagination.totalPages }} 页，共 {{ pagination.total }} 条记录
        </span>
        <button 
          class="btn btn-secondary"
          :disabled="pagination.page >= pagination.totalPages"
          @click="changePage(pagination.page + 1)"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 创建用户模态框 -->
    <div v-if="showCreateDialog" class="modal-overlay" @click="closeModals">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>创建新用户</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createUser">
            <div class="form-row">
              <div class="form-group">
                <label>真实姓名 *</label>
                <input type="text" v-model="createForm.realName" required />
              </div>
              <div class="form-group">
                <label>用户名 *</label>
                <input type="text" v-model="createForm.username" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>学工号 *</label>
                <input type="text" v-model="createForm.studentId" required />
              </div>
              <div class="form-group">
                <label>邮箱</label>
                <input type="email" v-model="createForm.email" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>手机号</label>
                <input type="tel" v-model="createForm.phone" />
              </div>
              <div class="form-group">
                <label>用户类型 *</label>
                <select v-model="createForm.userType" required>
                  <option value="">请选择类型</option>
                  <option value="student" v-if="canManageStudent">学生</option>
                  <option value="teacher">教师</option>
                  <option value="counselor" v-if="canManageDepartmentAdmin">辅导员</option>
                  <option value="department_admin" v-if="canManageDepartmentAdmin">院级管理员</option>
                  <option value="school_admin" v-if="canManageSchoolAdmin">校级管理员</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>所属学校 *</label>
                <select v-model="createForm.school" required>
                  <option value="">请选择学校</option>
                  <option value="北京体育大学">北京体育大学</option>
                  <option value="上海体育学院">上海体育学院</option>
                  <!-- 其他学校选项 -->
                </select>
              </div>
              <div class="form-group">
                <label>所属院系</label>
                <select v-model="createForm.departmentId">
                  <option value="">请选择院系</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>初始密码 *</label>
              <input type="password" v-model="createForm.password" required placeholder="留空则系统自动生成" />
            </div>
          </form>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModals">取消</button>
          <button class="btn btn-primary" @click="createUser" :disabled="saving">
            {{ saving ? '创建中...' : '创建用户' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 用户详情模态框 -->
    <div v-if="showDetailDialog" class="modal-overlay" @click="closeModals">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>用户详情</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body" v-if="selectedUser">
          <div class="user-detail-grid">
            <div class="detail-section">
              <h4>基本信息</h4>
              <div class="detail-item">
                <label>用户ID:</label>
                <span>{{ selectedUser.id }}</span>
              </div>
              <div class="detail-item">
                <label>真实姓名:</label>
                <span>{{ selectedUser.realName }}</span>
              </div>
              <div class="detail-item">
                <label>用户名:</label>
                <span>{{ selectedUser.username }}</span>
              </div>
              <div class="detail-item">
                <label>学工号:</label>
                <span>{{ selectedUser.studentId }}</span>
              </div>
              <div class="detail-item">
                <label>邮箱:</label>
                <span>{{ selectedUser.email || '未设置' }}</span>
              </div>
              <div class="detail-item">
                <label>手机号:</label>
                <span>{{ selectedUser.phone || '未设置' }}</span>
              </div>
            </div>
            <div class="detail-section">
              <h4>权限信息</h4>
              <div class="detail-item">
                <label>用户类型:</label>
                <span class="role-badge" :class="selectedUser.userType">
                  {{ getRoleText(selectedUser.userType) }}
                </span>
              </div>
              <div class="detail-item">
                <label>账户状态:</label>
                <span class="status-badge" :class="selectedUser.status">
                  {{ getStatusText(selectedUser.status) }}
                </span>
              </div>
              <div class="detail-item">
                <label>所属学校:</label>
                <span>{{ selectedUser.school }}</span>
              </div>
              <div class="detail-item">
                <label>所属院系:</label>
                <span>{{ selectedUser.departmentName || '未设置' }}</span>
              </div>
            </div>
            <div class="detail-section">
              <h4>登录信息</h4>
              <div class="detail-item">
                <label>创建时间:</label>
                <span>{{ formatDateTime(selectedUser.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <label>最后登录:</label>
                <span>{{ formatDateTime(selectedUser.lastLoginAt) }}</span>
              </div>
              <div class="detail-item">
                <label>登录次数:</label>
                <span>{{ selectedUser.loginCount || 0 }} 次</span>
              </div>
              <div class="detail-item">
                <label>首次登录:</label>
                <span>{{ selectedUser.isFirstLogin ? '是' : '否' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModals">关闭</button>
          <button class="btn btn-primary" @click="editUser(selectedUser)">编辑用户</button>
        </div>
      </div>
    </div>

    <!-- 审计日志模态框 -->
    <div v-if="showAuditDialog" class="modal-overlay" @click="closeModals">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>用户操作日志</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div class="log-container">
            <div v-for="log in auditLogs" :key="log.id" class="log-item">
              <div class="log-header">
                <span class="log-time">{{ formatDateTime(log.timestamp) }}</span>
                <span class="log-action" :class="log.action">{{ log.actionText }}</span>
              </div>
              <div class="log-details">
                <p><strong>操作者:</strong> {{ log.operatorName }}</p>
                <p><strong>详情:</strong> {{ log.details }}</p>
                <p v-if="log.reason"><strong>原因:</strong> {{ log.reason }}</p>
              </div>
            </div>
            <div v-if="auditLogs.length === 0" class="no-logs">
              暂无操作日志
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModals">关闭</button>
        </div>
      </div>
    </div>

    <!-- 权限提升确认模态框 -->
    <div v-if="showPromoteDialog" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>提升用户权限</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <p>您确定要将用户 <strong>{{ selectedUser?.realName }}</strong> 的权限从：</p>
          <p class="role-change">
            <span class="old-role">{{ getRoleText(selectedUser?.userType) }}</span>
            <span class="arrow">→</span>
            <span class="new-role">{{ getRoleText(newRole) }}</span>
          </p>
          <p class="warning">此操作将立即生效，用户下次登录时将拥有新的权限。</p>
          <div class="form-group">
            <label>操作原因 *</label>
            <textarea v-model="operationReason" placeholder="请输入提升权限的原因" required></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModals">取消</button>
          <button class="btn btn-primary" @click="confirmPromote" :disabled="loading || !operationReason">
            {{ loading ? '处理中...' : '确认提升' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 权限降低确认模态框 -->
    <div v-if="showDemoteDialog" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>降低用户权限</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <p>您确定要将用户 <strong>{{ selectedUser?.realName }}</strong> 的权限从：</p>
          <p class="role-change">
            <span class="old-role">{{ getRoleText(selectedUser?.userType) }}</span>
            <span class="arrow">→</span>
            <span class="new-role">{{ getRoleText(newRole) }}</span>
          </p>
          <p class="warning">此操作将立即生效，用户将失去当前管理员权限。</p>
          <div class="form-group">
            <label>操作原因 *</label>
            <textarea v-model="operationReason" placeholder="请输入降低权限的原因" required></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModals">取消</button>
          <button class="btn btn-warning" @click="confirmDemote" :disabled="loading || !operationReason">
            {{ loading ? '处理中...' : '确认降低' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 重置密码确认模态框 -->
    <div v-if="showResetPasswordDialog" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>重置用户密码</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <p>您确定要重置用户 <strong>{{ selectedUser?.realName }}</strong> 的密码吗？</p>
          <div class="form-group">
            <label>新密码 *</label>
            <input 
              type="text" 
              v-model="resetPasswordForm.newPassword" 
              placeholder="请输入新密码（留空则系统自动生成）" 
            />
            <div class="password-hint">
              <p>密码要求：</p>
              <ul>
                <li>至少8位字符</li>
                <li>包含大小写字母和数字</li>
                <li>如不填写，系统将自动生成安全密码</li>
              </ul>
            </div>
          </div>
          <div class="form-group">
            <label class="checkbox-container">
              <input type="checkbox" v-model="resetPasswordForm.forceChange" />
              <span class="checkmark"></span>
              强制用户下次登录时修改密码
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-container">
              <input type="checkbox" v-model="resetPasswordForm.notifyUser" />
              <span class="checkmark"></span>
              通知用户密码已重置
            </label>
          </div>
          <div class="form-group">
            <label>操作原因</label>
            <textarea v-model="resetPasswordForm.reason" placeholder="请输入重置密码的原因"></textarea>
          </div>
          <p class="warning">此操作将立即生效，用户当前密码将失效。</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModals">取消</button>
          <button class="btn btn-warning" @click="confirmResetPassword" :disabled="loading">
            {{ loading ? '重置中...' : '确认重置' }}
          </button>
        </div>
      </div>
    </div>

      </div>
    </main>

    <!-- 用户创建成功 - 凭据展示弹窗 -->
    <div v-if="showCredentialsDialog" class="modal-overlay">
      <div class="modal-content credentials-modal" @click.stop>
        <div class="modal-header credentials-header">
          <div class="credentials-title-wrap">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="credentials-icon">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>用户创建成功</h3>
          </div>
          <button class="close-btn" @click="closeCredentialsDialog">×</button>
        </div>
        <div class="modal-body" v-if="createdCredentials">
          <div class="credentials-notice">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            请将以下登录凭据告知用户，此窗口关闭后密码将无法再次查看
          </div>

          <div class="credentials-user-info">
            <span class="credentials-name">{{ createdCredentials.realName }}</span>
            <span class="role-badge" :class="createdCredentials.userType">{{ getRoleText(createdCredentials.userType) }}</span>
          </div>

          <div class="credentials-item">
            <div class="credentials-label">用户名（登录账号）</div>
            <div class="credentials-value-row">
              <span class="credentials-value">{{ createdCredentials.username }}</span>
              <button class="copy-btn" @click="copyText(createdCredentials.username)">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/>
                </svg>
                复制
              </button>
            </div>
          </div>

          <div class="credentials-item">
            <div class="credentials-label">初始密码</div>
            <div class="credentials-value-row">
              <span class="credentials-value credentials-password">{{ createdCredentials.initialPassword }}</span>
              <button class="copy-btn" @click="copyText(createdCredentials.initialPassword)">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/>
                </svg>
                复制
              </button>
            </div>
          </div>

          <button class="copy-all-btn" @click="copyText(`用户名：${createdCredentials.username}\n初始密码：${createdCredentials.initialPassword}`)">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/>
            </svg>
            一键复制全部凭据
          </button>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="closeCredentialsDialog">我已记录，关闭</button>
        </div>
      </div>
    </div>

    <!-- 学校预导入统计弹窗 -->
    <div v-if="showSchoolStatsDialog" class="modal-overlay" @click="showSchoolStatsDialog = false">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>checkuser 预导入名单统计</h3>
          <button class="close-btn" @click="showSchoolStatsDialog = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="schoolStatsLoading" class="loading">加载中...</div>
          <div v-else-if="schoolStats.length === 0" class="no-data">暂无数据</div>
          <table v-else class="users-table">
            <thead>
              <tr>
                <th>学校</th>
                <th style="text-align:right">预导入学生数</th>
                <th style="text-align:right">预导入教师数</th>
                <th style="text-align:right">合计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in schoolStats" :key="row.school">
                <td>{{ row.school || '（未设置）' }}</td>
                <td style="text-align:right">
                  <span v-if="row.studentCount > 0" class="stat-badge student-badge">{{ row.studentCount.toLocaleString() }}</span>
                  <span v-else class="stat-badge zero-badge">0</span>
                </td>
                <td style="text-align:right">
                  <span v-if="row.teacherCount > 0" class="stat-badge teacher-badge">{{ row.teacherCount.toLocaleString() }}</span>
                  <span v-else class="stat-badge zero-badge">0</span>
                </td>
                <td style="text-align:right;font-weight:600">{{ (row.studentCount + row.teacherCount).toLocaleString() }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="stats-total-row">
                <td><strong>合计</strong></td>
                <td style="text-align:right"><strong>{{ schoolStats.reduce((s, r) => s + r.studentCount, 0).toLocaleString() }}</strong></td>
                <td style="text-align:right"><strong>{{ schoolStats.reduce((s, r) => s + r.teacherCount, 0).toLocaleString() }}</strong></td>
                <td style="text-align:right"><strong>{{ schoolStats.reduce((s, r) => s + r.studentCount + r.teacherCount, 0).toLocaleString() }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showSchoolStatsDialog = false">关闭</button>
          <button class="btn btn-primary" @click="loadSchoolStats">刷新</button>
        </div>
      </div>
    </div>

    <!-- 人脸库批量导入弹窗 -->
    <div v-if="showFaceImportDialog" class="modal-overlay" @click="showFaceImportDialog = false">
      <div class="modal-content" @click.stop style="max-width:480px">
        <div class="modal-header">
          <h3>人脸库批量导入</h3>
          <button class="close-btn" @click="closeFaceImportDialog">×</button>
        </div>
        <div class="modal-body">
          <div class="face-tip">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div>
              上传 <strong>.zip</strong> 压缩包，文件名（不含后缀）即为学号，支持 .jpg / .jpeg / .png / .gif<br/>
              <span style="color:#00000073">最大 100MB，支持子目录</span>
            </div>
          </div>

          <div class="face-upload-area" :class="{ 'has-file': faceFile }" @click="$refs.faceFileInput.click()" @dragover.prevent @drop.prevent="onFaceDrop">
            <input ref="faceFileInput" type="file" accept=".zip" style="display:none" @change="onFaceFileChange" />
            <svg v-if="!faceFile" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="upload-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="upload-icon file-ok-icon">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p v-if="!faceFile" class="upload-hint">点击或拖拽 zip 文件至此处</p>
            <p v-else class="upload-filename">{{ faceFile.name }}<span class="upload-filesize">（{{ (faceFile.size / 1024 / 1024).toFixed(2) }} MB）</span></p>
            <button v-if="faceFile" type="button" class="remove-file-btn" @click.stop="faceFile = null; faceImportResult = null">移除</button>
          </div>

          <label class="overwrite-label">
            <input type="checkbox" v-model="faceOverwrite" />
            覆盖已有同名图片
          </label>

          <div v-if="faceImportResult" class="face-result">
            <div class="face-result-summary" :class="faceImportResult.fail_count > 0 ? 'result-warn' : 'result-ok'">
              <span>导入成功 <strong>{{ faceImportResult.success_count }}</strong> 张</span>
              <span v-if="faceImportResult.skip_count > 0"> &nbsp;跳过 <strong>{{ faceImportResult.skip_count }}</strong> 个</span>
              <span v-if="faceImportResult.fail_count > 0"> &nbsp;失败 <strong>{{ faceImportResult.fail_count }}</strong> 个</span>
            </div>
            <div v-if="faceImportResult.failed && faceImportResult.failed.length" class="face-result-errors">
              <p style="font-size:12px;color:#ff4d4f;margin:0 0 4px">失败详情：</p>
              <div v-for="f in faceImportResult.failed" :key="f.file" class="face-error-item">
                {{ f.file }}：{{ f.reason }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeFaceImportDialog">取消</button>
          <button class="btn btn-primary" :disabled="!faceFile || faceImporting" @click="doFaceImport">
            {{ faceImporting ? '导入中...' : '开始导入' }}
          </button>
        </div>
      </div>
    </div>

    <!-- checkuser 数据导入弹窗（仅超管可见） -->
    <el-dialog
      v-if="isSuperAdminRole || isSchoolAdminRole"
      v-model="showImportDialog"
      title="导入 checkuser 数据"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-tabs v-model="importTab">
        <el-tab-pane label="学生数据" name="student">
          <div class="import-section">
            <p class="import-tip">
              Excel 列顺序：<strong>{{ isSchoolAdminRole ? '学校 / 学院 / 班级 / 学号 / 姓名（学校列自动填充为本校）' : '学校 / 学院 / 班级 / 学号 / 姓名' }}</strong><br/>
              导入前会自动检测重复记录，您可以选择覆盖或跳过。
            </p>
            <div class="import-actions">
              <el-button size="small" @click="downloadTemplate('student')">⬇ 下载学生模板</el-button>
              <el-upload
                ref="studentUploadRef"
                :auto-upload="false"
                :limit="1"
                accept=".xlsx,.xls"
                :on-change="(f) => { studentFile = f.raw }"
                :on-remove="() => { studentFile = null }"
              >
                <el-button size="small" type="primary">选择 Excel 文件</el-button>
              </el-upload>
            </div>
            <el-button type="success" :loading="importLoading" :disabled="!studentFile"
              @click="doImport('student')" style="margin-top:12px;width:100%">
              开始导入
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="教师数据" name="teacher">
          <div class="import-section">
            <p class="import-tip">
              Excel 列顺序：<strong>{{ isSchoolAdminRole ? '学校 / 学院 / 工号 / 姓名（学校列自动填充为本校）' : '学校 / 学院 / 工号 / 姓名' }}</strong><br/>
              导入前会自动检测重复记录，您可以选择覆盖或跳过。
            </p>
            <div class="import-actions">
              <el-button size="small" @click="downloadTemplate('teacher')">⬇ 下载教师模板</el-button>
              <el-upload
                ref="teacherUploadRef"
                :auto-upload="false"
                :limit="1"
                accept=".xlsx,.xls"
                :on-change="(f) => { teacherFile = f.raw }"
                :on-remove="() => { teacherFile = null }"
              >
                <el-button size="small" type="primary">选择 Excel 文件</el-button>
              </el-upload>
            </div>
            <el-button type="success" :loading="importLoading" :disabled="!teacherFile"
              @click="doImport('teacher')" style="margin-top:12px;width:100%">
              开始导入
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div v-if="importResult" class="import-result">
        <el-alert
          :title="importResultTitle"
          :type="importResult.errors?.length ? 'warning' : 'success'"
          show-icon :closable="false"
        />
        <ul v-if="importResult.errors?.length" style="font-size:12px;color:#595959;padding-left:16px;margin:8px 0 0">
          <li v-for="e in importResult.errors" :key="e">{{ e }}</li>
        </ul>
      </div>

      <template #footer>
        <el-button @click="closeImportDialog">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 查重确认对话框 -->
    <el-dialog
      v-model="showDuplicateDialog"
      title="发现重复记录"
      width="700px"
      :close-on-click-modal="false"
    >
      <div style="margin-bottom:12px;">
        <el-alert
          :title="`共发现 ${duplicateRecords.length} 条重复记录，新增 ${newRecordCount} 条`"
          type="warning" show-icon :closable="false"
        />
      </div>
      <div style="margin-bottom:12px;display:flex;gap:8px;">
        <el-button size="small" type="primary" @click="selectAllDuplicates(true)">全部覆盖</el-button>
        <el-button size="small" @click="selectAllDuplicates(false)">全部跳过</el-button>
      </div>
      <el-table :data="duplicateRecords" max-height="360" size="small" border>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row }">
            <el-checkbox v-model="row.override" />
          </template>
        </el-table-column>
        <el-table-column prop="studentId" :label="duplicateType === 'student' ? '学号' : '工号'" width="130" />
        <el-table-column prop="name" label="新姓名" width="100" />
        <el-table-column prop="existingName" label="已有姓名" width="100" />
        <el-table-column prop="college" label="新学院" min-width="120" />
        <el-table-column prop="existingCollege" label="已有学院" min-width="120" />
      </el-table>
      <template #footer>
        <el-button @click="showDuplicateDialog = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="confirmImportWithDuplicates">确认导入</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import authService from '@/services/authService'
import api from '@/services/api'
import { isSchoolAdmin, isSuperAdmin, isDepartmentAdmin } from '@/utils/permissionManager'

export default {
  name: 'AdminManagement',
  data() {
    return {
      currentUserRole: '',
      users: [],
      departments: [],
      selectedUsers: [],
      loading: false,
      saving: false,
      filters: {
        userType: 'teacher', // 默认显示教师
        keyword: '',
        status: 'active', // 默认显示正常状态
        departmentId: '',
        page: 1,
        limit: 10
      },
      pagination: {
        page: 1,
        total: 0,
        totalPages: 0
      },
      stats: {
        studentCount: 0,
        teacherCount: 0,
        departmentAdminCount: 0,
        schoolAdminCount: 0,
        onlineCount: 0
      },
      showPromoteDialog: false,
      showDemoteDialog: false,
      showCreateDialog: false,
      showDetailDialog: false,
      showAuditDialog: false,
      showResetPasswordDialog: false,
      showCredentialsDialog: false,
      createdCredentials: null,
      // checkuser 导入
      showImportDialog: false,
      importTab: 'student',
      studentFile: null,
      teacherFile: null,
      importLoading: false,
      importResult: null,
      // 查重确认
      showDuplicateDialog: false,
      duplicateRecords: [],
      newRecordCount: 0,
      duplicateType: 'student',
      pendingImportFile: null,
      // 学校预导入统计
      showSchoolStatsDialog: false,
      schoolStats: [],
      schoolStatsLoading: false,
      // 人脸库导入
      showFaceImportDialog: false,
      faceFile: null,
      faceOverwrite: true,
      faceImporting: false,
      faceImportResult: null,
      selectedUser: null,
      newRole: '',
      operationReason: '',
      auditLogs: [],
      searchTimeout: null,
      createForm: {
        realName: '',
        username: '',
        studentId: '',
        email: '',
        phone: '',
        userType: '',
        school: '',
        departmentId: '',
        password: ''
      },
      resetPasswordForm: {
        newPassword: '',
        forceChange: true,
        notifyUser: true,
        reason: ''
      }
    }
  },

  computed: {
    isSuperAdminRole() {
      return isSuperAdmin()
    },

    isSchoolAdminRole() {
      return isSchoolAdmin()
    },

    importResultTitle() {
      if (!this.importResult) return ''
      const r = this.importResult
      const parts = [`共 ${r.total} 行，新增 ${r.inserted} 条`]
      if (r.updated > 0) parts.push(`覆盖更新 ${r.updated} 条`)
      parts.push(`跳过 ${r.skipped} 条`)
      return '导入完成：' + parts.join('，')
    },

    canManageStudent() {
      // 所有管理员都可以管理学生
      return isDepartmentAdmin() || isSchoolAdmin() || isSuperAdmin()
    },

    canManageDepartmentAdmin() {
      return isSuperAdmin() || isSchoolAdmin()
    },

    canManageSchoolAdmin() {
      return isSuperAdmin()
    },

    allSelected() {
      return this.users.length > 0 && this.selectedUsers.length === this.users.length
    }
  },

  async mounted() {
    await this.checkPermissions()
    await this.loadDepartments()
    await this.loadUsers()
    await this.loadStats()
  },

  methods: {
    async impersonateUser(user) {
      if (!confirm(`确定要以 ${user.realName}（${this.getRoleText(user.userType)}）的身份进入平台吗？`)) return
      try {
        const result = await authService.impersonate(user.id)
        if (result.code === 200) {
          alert(`已切换为 ${user.realName} 的身份`)
          this.$router.push('/dashboard')
          window.location.reload()
        } else {
          alert(result.message || '切换失败')
        }
      } catch (e) {
        alert('角色切换失败')
      }
    },
    async checkPermissions() {
      const user = await authService.getCurrentUser()
      if (!user) {
        this.$router.push('/login')
        return
      }

      this.currentUserRole = user.userType

      // 检查是否有管理权限
      if (!isSchoolAdmin() && !isSuperAdmin() && !isDepartmentAdmin()) {
        alert('权限不足')
        this.$router.push('/dashboard')
        return
      }
    },

    async loadDepartments() {
      try {
        const result = await authService.getDepartments()
        if (result.code === 200) {
          this.departments = result.data
        }
      } catch (error) {
        console.error('获取院系列表失败:', error)
      }
    },

    async loadUsers() {
      this.loading = true
      try {
        const result = await authService.getUserList({
          ...this.filters,
          page: this.pagination.page
        })

        if (result.code === 200) {
          // 根据当前用户权限过滤可见的用户
          this.users = this.filterUsersByPermission(result.data.items)
          this.pagination.total = result.data.total
          this.pagination.totalPages = result.data.totalPages
          this.pagination.page = result.data.page
        } else {
          console.error('获取用户列表失败:', result.message)
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 根据权限过滤用户列表
    filterUsersByPermission(users) {
      if (isSuperAdmin()) {
        // 超级管理员可以看到所有用户
        return users
      } else if (isSchoolAdmin()) {
        return users.filter(user => ['student', 'teacher', 'counselor', 'department_admin'].includes(user.userType))
      } else if (isDepartmentAdmin()) {
        return users.filter(user => ['student', 'teacher', 'counselor'].includes(user.userType))
      }
      return []
    },

    async loadStats() {
      try {
        const result = await authService.getOnlineStats()
        if (result.code === 200) {
          this.stats = {
            studentCount: result.data.userTypeStats?.student || 0,
            teacherCount: result.data.userTypeStats?.teacher || 0,
            departmentAdminCount: result.data.userTypeStats?.department_admin || 0,
            schoolAdminCount: result.data.userTypeStats?.school_admin || 0,
            onlineCount: result.data.totalOnline || 0
          }
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      }
    },

    // 批量操作方法
    toggleSelectAll() {
      if (this.allSelected) {
        this.selectedUsers = []
      } else {
        this.selectedUsers = this.users.map(user => user.id)
      }
    },

    clearSelection() {
      this.selectedUsers = []
    },

    async bulkSuspend() {
      if (!confirm(`确定要停用选中的 ${this.selectedUsers.length} 个用户吗？`)) return
      
      try {
        const result = await authService.bulkUpdateUserStatus(this.selectedUsers, 'suspended', '批量停用操作')
        if (result.code === 200) {
          alert('批量停用成功')
          this.clearSelection()
          this.loadUsers()
        } else {
          alert(result.message || '操作失败')
        }
      } catch (error) {
        console.error('批量停用失败:', error)
        alert('操作失败，请重试')
      }
    },

    async bulkActivate() {
      if (!confirm(`确定要启用选中的 ${this.selectedUsers.length} 个用户吗？`)) return
      
      try {
        const result = await authService.bulkUpdateUserStatus(this.selectedUsers, 'active', '批量启用操作')
        if (result.code === 200) {
          alert('批量启用成功')
          this.clearSelection()
          this.loadUsers()
        } else {
          alert(result.message || '操作失败')
        }
      } catch (error) {
        console.error('批量启用失败:', error)
        alert('操作失败，请重试')
      }
    },

    async bulkExport() {
      try {
        const result = await authService.exportUsers(this.selectedUsers)
        if (result.code === 200) {
          // 触发下载
          const blob = new Blob([result.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `users_${new Date().toISOString().split('T')[0]}.xlsx`
          a.click()
          window.URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error('导出失败:', error)
        alert('导出失败，请重试')
      }
    },

    async exportUserData() {
      try {
        const result = await authService.exportUsers()
        if (result.code === 200) {
          // 触发下载
          const blob = new Blob([result.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `all_users_${new Date().toISOString().split('T')[0]}.xlsx`
          a.click()
          window.URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error('导出失败:', error)
        alert('导出失败，请重试')
      }
    },

    // 用户创建
    showCreateUserModal() {
      this.showCreateDialog = true
      this.resetCreateForm()
    },

    resetCreateForm() {
      this.createForm = {
        realName: '',
        username: '',
        studentId: '',
        email: '',
        phone: '',
        userType: 'teacher', // 默认创建教师
        school: '',
        departmentId: '',
        password: ''
      }
    },

    async createUser() {
      if (!this.createForm.realName || !this.createForm.studentId || !this.createForm.userType || !this.createForm.school) {
        alert('请填写所有必填字段')
        return
      }

      this.saving = true
      try {
        const result = await authService.createUser(this.createForm)
        if (result.code === 200) {
          this.showCreateDialog = false
          this.createdCredentials = {
            realName: result.data?.realName || this.createForm.realName,
            username: result.data?.username || this.createForm.username,
            initialPassword: result.data?.initialPassword || result.data?.temporaryPassword || '（请查看短信通知）',
            userType: result.data?.userType || this.createForm.userType
          }
          this.showCredentialsDialog = true
          this.loadUsers()
          this.loadStats()
        } else {
          alert(result.message || '创建失败')
        }
      } catch (error) {
        console.error('创建用户失败:', error)
        alert('创建失败，请重试')
      } finally {
        this.saving = false
      }
    },

    copyText(text) {
      navigator.clipboard.writeText(text).then(() => {
        alert('已复制到剪贴板')
      }).catch(() => {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        alert('已复制到剪贴板')
      })
    },

    closeCredentialsDialog() {
      this.showCredentialsDialog = false
      this.createdCredentials = null
      this.resetCreateForm()
    },

    // 用户详情
    async showUserDetail(user) {
      this.selectedUser = user
      this.showDetailDialog = true
    },

    editUser(user) {
      // 这里可以添加编辑用户的逻辑
      alert('编辑功能开发中...')
    },

    // 审计日志
    async showAuditLog(user) {
      this.selectedUser = user
      this.showAuditDialog = true
      
      try {
        const result = await authService.getUserAuditLogs(user.id)
        if (result.code === 200) {
          this.auditLogs = result.data.map(log => ({
            ...log,
            actionText: this.getActionText(log.action)
          }))
        }
      } catch (error) {
        console.error('获取审计日志失败:', error)
        this.auditLogs = []
      }
    },

    getActionText(action) {
      const actionMap = {
        'role_promote': '权限提升',
        'role_demote': '权限降低',
        'status_suspend': '账户停用',
        'status_activate': '账户启用',
        'password_reset': '密码重置',
        'login': '用户登录',
        'logout': '用户登出'
      }
      return actionMap[action] || action
    },

    debounceSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1
        this.loadUsers()
      }, 500)
    },

    changePage(page) {
      this.pagination.page = page
      this.loadUsers()
    },

    refreshData() {
      this.loadUsers()
      this.loadStats()
    },

    resetFilters() {
      this.filters = {
        userType: 'teacher',
        keyword: '',
        status: 'active',
        departmentId: '',
        page: 1,
        limit: 10
      }
      this.loadUsers()
    },

    canPromoteUser(user) {
      if (isSuperAdmin()) {
        return ['teacher', 'counselor', 'department_admin'].includes(user.userType)
      } else if (isSchoolAdmin()) {
        return ['teacher', 'counselor'].includes(user.userType)
      } else if (isDepartmentAdmin()) {
        return false
      }
      return false
    },

    canDemoteUser(user) {
      if (isSuperAdmin()) {
        return ['school_admin', 'department_admin', 'counselor'].includes(user.userType)
      } else if (isSchoolAdmin()) {
        return ['department_admin', 'counselor'].includes(user.userType)
      } else if (isDepartmentAdmin()) {
        return false
      }
      return false
    },

    getPromoteRole(currentRole) {
      if (isSuperAdmin()) {
        const roleHierarchy = {
          'teacher': 'counselor',
          'counselor': 'department_admin',
          'department_admin': 'school_admin'
        }
        return roleHierarchy[currentRole]
      } else if (isSchoolAdmin()) {
        const roleHierarchy = {
          'teacher': 'counselor',
          'counselor': 'department_admin'
        }
        return roleHierarchy[currentRole]
      }
      return null
    },

    getDemoteRole(currentRole) {
      if (isSuperAdmin()) {
        const roleHierarchy = {
          'school_admin': 'department_admin',
          'department_admin': 'counselor',
          'counselor': 'teacher'
        }
        return roleHierarchy[currentRole]
      } else if (isSchoolAdmin()) {
        const roleHierarchy = {
          'department_admin': 'counselor',
          'counselor': 'teacher'
        }
        return roleHierarchy[currentRole]
      }
      return null
    },

    showPromoteModal(user) {
      this.selectedUser = user
      this.newRole = this.getPromoteRole(user.userType)
      this.operationReason = ''
      this.showPromoteDialog = true
    },

    showDemoteModal(user) {
      this.selectedUser = user
      this.newRole = this.getDemoteRole(user.userType)
      this.operationReason = ''
      this.showDemoteDialog = true
    },

    showResetPasswordModal(user) {
      this.selectedUser = user
      this.resetPasswordForm = {
        newPassword: '',
        forceChange: true,
        notifyUser: true,
        reason: ''
      }
      this.showResetPasswordDialog = true
    },

    async confirmPromote() {
      if (!this.selectedUser || !this.newRole || !this.operationReason) return

      this.loading = true
      try {
        const result = await authService.setUserRole(this.selectedUser.id, this.newRole, this.operationReason)
        
        if (result.code === 200) {
          alert(`用户 ${this.selectedUser.realName} 已成功提升为 ${this.getRoleText(this.newRole)}`)
          this.closeModals()
          this.loadUsers()
          this.loadStats()
        } else {
          alert(result.message || '操作失败')
        }
      } catch (error) {
        console.error('提升权限失败:', error)
        alert('操作失败，请重试')
      } finally {
        this.loading = false
      }
    },

    async confirmDemote() {
      if (!this.selectedUser || !this.newRole || !this.operationReason) return

      this.loading = true
      try {
        const result = await authService.setUserRole(this.selectedUser.id, this.newRole, this.operationReason)
        
        if (result.code === 200) {
          alert(`用户 ${this.selectedUser.realName} 权限已降低为 ${this.getRoleText(this.newRole)}`)
          this.closeModals()
          this.loadUsers()
          this.loadStats()
        } else {
          alert(result.message || '操作失败')
        }
      } catch (error) {
        console.error('降低权限失败:', error)
        alert('操作失败，请重试')
      } finally {
        this.loading = false
      }
    },

    async confirmResetPassword() {
      if (!this.selectedUser) return

      this.loading = true
      try {
        const result = await authService.resetUserPassword(
          this.selectedUser.id, 
          this.resetPasswordForm.newPassword || null
        )
        
        if (result.code === 200) {
          const message = this.resetPasswordForm.newPassword 
            ? `用户 ${this.selectedUser.realName} 的密码已重置为指定密码` 
            : `用户 ${this.selectedUser.realName} 的密码已重置，新密码已发送给用户`
          alert(message)
          this.closeModals()
        } else {
          alert(result.message || '重置密码失败')
        }
      } catch (error) {
        console.error('重置密码失败:', error)
        alert('重置密码失败，请重试')
      } finally {
        this.loading = false
      }
    },

    async suspendUser(user) {
      if (!confirm(`确定要停用用户 ${user.realName} 吗？`)) return

      try {
        const result = await authService.updateUserStatus(user.id, 'suspended', '管理员操作')
        
        if (result.code === 200) {
          alert(`用户 ${user.realName} 已停用`)
          this.loadUsers()
        } else {
          alert(result.message || '操作失败')
        }
      } catch (error) {
        console.error('停用用户失败:', error)
        alert('操作失败，请重试')
      }
    },

    async activateUser(user) {
      if (!confirm(`确定要启用用户 ${user.realName} 吗？`)) return

      try {
        const result = await authService.updateUserStatus(user.id, 'active', '管理员操作')
        
        if (result.code === 200) {
          alert(`用户 ${user.realName} 已启用`)
          this.loadUsers()
        } else {
          alert(result.message || '操作失败')
        }
      } catch (error) {
        console.error('启用用户失败:', error)
        alert('操作失败，请重试')
      }
    },

    closeModals() {
      this.showPromoteDialog = false
      this.showDemoteDialog = false
      this.showCreateDialog = false
      this.showDetailDialog = false
      this.showAuditDialog = false
      this.showResetPasswordDialog = false
      this.showCredentialsDialog = false
      this.createdCredentials = null
      this.selectedUser = null
      this.newRole = ''
      this.operationReason = ''
      this.auditLogs = []
      this.resetPasswordForm = {
        newPassword: '',
        forceChange: true,
        notifyUser: true,
        reason: ''
      }
    },

    // ── 学校预导入统计 ────────────────────────────────────────────────────────
    async openSchoolStatsDialog() {
      this.showSchoolStatsDialog = true
      await this.loadSchoolStats()
    },

    async loadSchoolStats() {
      this.schoolStatsLoading = true
      try {
        const res = await api.checkUserImport.getSchoolStats()
        if (res.code === 200) {
          this.schoolStats = res.data || []
        } else {
          alert(res.message || '获取统计数据失败')
        }
      } catch (e) {
        alert('获取统计数据失败：' + (e.message || e))
      } finally {
        this.schoolStatsLoading = false
      }
    },

    // ── 人脸库导入 ────────────────────────────────────────────────────────────
    openFaceImportDialog() {
      this.faceFile = null
      this.faceImportResult = null
      this.faceOverwrite = true
      this.showFaceImportDialog = true
    },

    closeFaceImportDialog() {
      this.showFaceImportDialog = false
      this.faceFile = null
      this.faceImportResult = null
    },

    onFaceFileChange(e) {
      const f = e.target.files[0]
      if (!f) return
      if (!f.name.toLowerCase().endsWith('.zip')) {
        alert('只支持 .zip 格式文件')
        return
      }
      this.faceFile = f
      this.faceImportResult = null
    },

    onFaceDrop(e) {
      const f = e.dataTransfer.files[0]
      if (!f) return
      if (!f.name.toLowerCase().endsWith('.zip')) {
        alert('只支持 .zip 格式文件')
        return
      }
      this.faceFile = f
      this.faceImportResult = null
    },

    async doFaceImport() {
      if (!this.faceFile) return
      this.faceImporting = true
      this.faceImportResult = null
      try {
        const res = await api.faceImport.importFaces(this.faceFile, this.faceOverwrite)
        if (res && res.code === 200) {
          this.faceImportResult = res.data
        } else {
          alert((res && res.message) || '导入失败')
        }
      } catch (e) {
        alert('导入失败：' + (e.message || e))
      } finally {
        this.faceImporting = false
      }
    },

    // ── checkuser 导入 ────────────────────────────────────────────────────────
    openImportDialog() {
      this.importResult = null
      this.studentFile = null
      this.teacherFile = null
      this.showImportDialog = true
    },

    closeImportDialog() {
      this.showImportDialog = false
      this.importResult = null
      this.studentFile = null
      this.teacherFile = null
    },

    async downloadTemplate(type) {
      try {
        const res = type === 'student'
          ? await api.checkUserImport.downloadStudentTemplate()
          : await api.checkUserImport.downloadTeacherTemplate()
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = type === 'student' ? '学生导入模板.xlsx' : '教师导入模板.xlsx'
        a.click()
        URL.revokeObjectURL(url)
      } catch (e) {
        this.$message?.error('下载失败：' + (e.message || e))
      }
    },

    async doImport(type) {
      const file = type === 'student' ? this.studentFile : this.teacherFile
      if (!file) return
      this.importLoading = true
      this.importResult = null
      try {
        const res = type === 'student'
          ? await api.checkUserImport.previewImportStudents(file)
          : await api.checkUserImport.previewImportTeachers(file)
        if (res.code === 200) {
          const data = res.data
          if (data.duplicateCount > 0) {
            this.duplicateType = type
            this.pendingImportFile = file
            this.newRecordCount = data.newCount
            this.duplicateRecords = data.duplicates.map(d => ({
              ...d,
              studentId: d.studentId || d.teacherId,
              override: false
            }))
            this.showDuplicateDialog = true
          } else {
            await this.executeConfirmImport(type, file, [])
          }
        } else {
          this.$message?.error(res.message || '导入预检失败')
        }
      } catch (e) {
        this.$message?.error('导入失败：' + (e.message || e))
      } finally {
        this.importLoading = false
      }
    },

    selectAllDuplicates(override) {
      this.duplicateRecords.forEach(r => { r.override = override })
    },

    async confirmImportWithDuplicates() {
      const overrideIds = this.duplicateRecords
        .filter(r => r.override)
        .map(r => r.studentId)
      await this.executeConfirmImport(this.duplicateType, this.pendingImportFile, overrideIds)
      this.showDuplicateDialog = false
    },

    async executeConfirmImport(type, file, overrideIds) {
      this.importLoading = true
      this.importResult = null
      try {
        const res = type === 'student'
          ? await api.checkUserImport.confirmImportStudents(file, overrideIds)
          : await api.checkUserImport.confirmImportTeachers(file, overrideIds)
        if (res.code === 200) {
          this.importResult = res.data
        } else {
          this.$message?.error(res.message || '导入失败')
        }
      } catch (e) {
        this.$message?.error('导入失败：' + (e.message || e))
      } finally {
        this.importLoading = false
      }
    },

    getRoleText(role) {
      const roleMap = {
        'student': '学生',
        'teacher': '教师',
        'counselor': '辅导员',
        'department_admin': '院级管理员',
        'school_admin': '校级管理员',
        'super_admin': '超级管理员'
      }
      return roleMap[role] || '未知角色'
    },

    getStatusText(status) {
      const statusMap = {
        'active': '正常',
        'suspended': '已停用',
        'banned': '已封禁'
      }
      return statusMap[status] || '未知状态'
    },

    formatDateTime(dateTime) {
      if (!dateTime) return '从未登录'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.admin-management {
  min-height: 100vh;
  background: var(--bg-body);
}

.page-header {
  background: #ffffff;
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

/* ===== 布局 ===== */
.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  font-size: 14px;
  font-family: inherit;
}

.back-btn:hover { border-color: #1677ff; color: #1677ff; }
.back-btn svg { width: 16px; height: 16px; }

.page-info { display: flex; flex-direction: column; }

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #000000d9;
  margin: 0;
}

.page-subtitle {
  font-size: 12px;
  color: #00000073;
  margin-top: 1px;
}

.role-indicator { margin-left: 8px; }

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
}

.role-badge.premium { background: #e6f4ff; color: #1677ff; border-color: #91caff; }

.header-actions { display: flex; align-items: center; gap: 8px; }

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  font-family: inherit;
  height: 32px;
}

.action-btn svg { width: 16px; height: 16px; }
.action-btn.primary { background: #1677ff; border-color: #1677ff; color: white; }
.action-btn.primary:hover { background: #4096ff; border-color: #4096ff; }
.action-btn.secondary { background: white; border-color: var(--border-color); color: var(--text-primary); }
.action-btn.secondary:hover { border-color: #1677ff; color: #1677ff; }
.action-btn.refresh { background: white; border-color: var(--border-color); color: var(--text-secondary); padding: 5px 8px; }
.action-btn.refresh:hover { border-color: #1677ff; color: #1677ff; }
.action-btn.refresh svg { transition: transform 0.3s; }
.action-btn.refresh:hover svg { transform: rotate(180deg); }

/* ===== 主内容 ===== */
.main-content { padding: 24px 0; }

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ===== 统计卡片 ===== */
.stats-section { margin-bottom: 20px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-card);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card.student .stat-icon { background: #e6f4ff; color: #1677ff; }
.stat-card.teacher .stat-icon { background: #fff7e6; color: #d46b08; }
.stat-card.admin .stat-icon { background: #f9f0ff; color: #722ed1; }
.stat-card.online .stat-icon { background: #f6ffed; color: #389e0d; }

.stat-icon svg { width: 22px; height: 22px; }

.stat-content { flex: 1; min-width: 0; }
.stat-content h3 { font-size: 13px; color: #00000073; font-weight: 400; margin: 0 0 4px 0; }

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #000000d9;
  margin: 0;
  line-height: 1;
}

.stat-label { font-size: 12px; color: #00000073; margin-top: 2px; display: block; }

/* ===== 筛选区域 ===== */
.filter-section {
  background: white;
  border-radius: 8px;
  padding: 16px 20px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-card);
  margin-bottom: 16px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.filter-title { font-size: 15px; font-weight: 500; color: #000000d9; margin: 0; }
.filter-actions { display: flex; gap: 8px; }

.filter-reset {
  padding: 4px 10px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  font-family: inherit;
}

.filter-reset:hover { border-color: #1677ff; color: #1677ff; }
.filter-form { margin-top: 0; }

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.filter-group { display: flex; flex-direction: column; gap: 6px; }

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 400;
  color: #000000d9;
}

.filter-label svg { width: 14px; height: 14px; color: #00000073; }

.filter-select,
.filter-input {
  padding: 7px 11px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background: white;
  color: #000000d9;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
  font-family: inherit;
  height: 32px;
}

.filter-select:hover, .filter-input:hover { border-color: #4096ff; }
.filter-select:focus, .filter-input:focus { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2); }

/* ===== 批量操作 ===== */
.bulk-actions {
  background: #e6f4ff;
  border: 1px solid #91caff;
  border-radius: 6px;
  padding: 10px 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bulk-info { font-weight: 500; color: #1677ff; font-size: 14px; }
.bulk-buttons { display: flex; gap: 8px; }

/* ===== 用户表格 ===== */
.users-section {
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-card);
  margin-bottom: 16px;
}

.users-section h3 {
  margin: 0;
  padding: 16px 20px 0;
  color: #000000d9;
  font-size: 15px;
  font-weight: 500;
}

.table-container { overflow-x: auto; padding: 0 0 0 0; }

.users-table { width: 100%; border-collapse: collapse; }

.users-table th,
.users-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  font-size: 14px;
}

.users-table th { background: #fafafa; font-weight: 500; color: #00000073; }
.users-table tr:last-child td { border-bottom: none; }
.users-table tr:hover td { background: #fafafa; }

/* 角色徽章 */
.role-badge.student   { background: #f6ffed; color: #52c41a; border-color: #b7eb8f; }
.role-badge.teacher   { background: #fff7e6; color: #fa8c16; border-color: #ffd591; }
.role-badge.counselor        { background: #e6fffb; color: #08979c; border-color: #87e8de; }
.role-badge.department_admin { background: #e6f4ff; color: #1677ff; border-color: #91caff; }
.role-badge.school_admin     { background: #fafafa; color: #8c8c8c; border-color: #d9d9d9; }
.role-badge.super_admin      { background: #fff2f0; color: #ff4d4f; border-color: #ffccc7; }

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  border: 1px solid;
}

.status-badge.active   { background: #f6ffed; color: #52c41a; border-color: #b7eb8f; }
.status-badge.suspended{ background: #fff2f0; color: #ff4d4f; border-color: #ffccc7; }

.action-buttons { display: flex; gap: 6px; flex-wrap: wrap; }

/* ===== 按钮（页面内局部覆盖） ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
  height: 28px;
  white-space: nowrap;
}

.btn-small { padding: 2px 8px; height: 24px; font-size: 11px; }
.btn-primary   { background: #1677ff; border-color: #1677ff; color: white; }
.btn-primary:hover { background: #4096ff; border-color: #4096ff; }
.btn-warning   { background: #faad14; border-color: #faad14; color: white; }
.btn-warning:hover { background: #ffc53d; border-color: #ffc53d; }
.btn-danger    { background: #ff4d4f; border-color: #ff4d4f; color: white; }
.btn-danger:hover { background: #ff7875; border-color: #ff7875; }
.btn-success   { background: #52c41a; border-color: #52c41a; color: white; }
.btn-success:hover { background: #73d13d; border-color: #73d13d; }
.btn-info      { background: #13c2c2; border-color: #13c2c2; color: white; }
.btn-info:hover { background: #36cfc9; border-color: #36cfc9; }
.btn-secondary { background: white; border-color: var(--border-color); color: var(--text-primary); }
.btn-secondary:hover { border-color: #1677ff; color: #1677ff; }

/* ===== 状态提示 ===== */
.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: #00000073;
  font-size: 14px;
}

/* ===== 分页 ===== */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid var(--border-light);
  font-size: 14px;
  color: #00000073;
}

.page-info { color: #00000073; font-size: 14px; }

/* ===== 弹窗 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 520px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.large-modal { max-width: 800px; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 { margin: 0; color: #000000d9; font-size: 16px; font-weight: 500; }

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #00000073;
  line-height: 1;
  padding: 0;
}

.close-btn:hover { color: #000000d9; }

.modal-body { padding: 20px; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.user-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  color: #000000d9;
  font-size: 14px;
  font-weight: 500;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #fafafa;
  font-size: 14px;
}

.detail-item label { color: #00000073; font-weight: 400; }

.log-container { max-height: 360px; overflow-y: auto; }

.log-item {
  border: 1px solid var(--border-light);
  border-radius: 6px;
  margin-bottom: 10px;
  padding: 12px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.log-time { font-size: 12px; color: #00000073; }

.log-action {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.log-action.role_promote  { background: #e6f4ff; color: #1677ff; }
.log-action.role_demote   { background: #fff2f0; color: #ff4d4f; }
.log-action.status_suspend { background: #fffbe6; color: #d48806; }
.log-action.status_activate { background: #f6ffed; color: #52c41a; }

.log-details p { margin: 3px 0; font-size: 13px; color: #00000073; }

.no-logs { text-align: center; color: #00000073; padding: 32px; font-size: 14px; }

.role-change {
  text-align: center;
  margin: 12px 0;
  padding: 14px;
  background: #fafafa;
  border-radius: 6px;
}

.old-role { display: inline; padding: 4px 10px; background: #fffbe6; color: #d48806; border-radius: 4px; font-size: 13px; }
.arrow { margin: 0 10px; color: #00000073; font-size: 16px; }
.new-role { display: inline; padding: 4px 10px; background: #f6ffed; color: #52c41a; border-radius: 4px; font-size: 13px; }

.warning {
  color: #d48806;
  font-size: 13px;
  background: #fffbe6;
  padding: 10px 12px;
  border-radius: 4px;
  border-left: 3px solid #faad14;
}

.password-hint {
  margin-top: 10px;
  padding: 10px 12px;
  background: #f0f5ff;
  border-radius: 4px;
  border-left: 3px solid #1677ff;
}

.password-hint p { margin: 0 0 6px 0; font-weight: 500; color: #000000d9; font-size: 13px; }
.password-hint ul { margin: 0; padding-left: 16px; color: #00000073; font-size: 12px; }
.password-hint li { margin-bottom: 3px; }

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #00000073;
  margin-bottom: 8px;
  gap: 8px;
}

.checkbox-container input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: #1677ff;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid var(--border-light);
}

/* ===== 统计信息二级 ===== */
.stats-section h3 { margin: 0 0 16px 0; color: #000000d9; font-size: 15px; font-weight: 500; }
.stat-info h4 { margin: 0 0 3px 0; font-size: 13px; color: #00000073; font-weight: 400; }
.stat-info p { margin: 0; font-size: 20px; font-weight: 700; color: #000000d9; }

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .header-container { padding: 0 16px; }
  .header-left { gap: 10px; }
  .header-actions { gap: 6px; }
  .content-container { padding: 0 16px; }
  .filter-row { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
  .bulk-actions { flex-direction: column; gap: 10px; align-items: flex-start; }
  .action-buttons { flex-direction: column; }
  .pagination { flex-direction: column; gap: 10px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .user-detail-grid { grid-template-columns: 1fr; }
}
.action-btn.import-btn {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}
.action-btn.import-btn:hover { background: #d9f7be; }

.action-btn.stats-btn {
  background: #e6f4ff;
  color: #1677ff;
  border: 1px solid #91caff;
}
.action-btn.stats-btn:hover { background: #bae0ff; }

.action-btn.school-account-btn {
  background: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}
.action-btn.school-account-btn:hover { background: #efdbff; }

.action-btn.face-btn {
  background: #fff0f6;
  color: #c41d7f;
  border: 1px solid #ffadd2;
}
.action-btn.face-btn:hover { background: #ffd6e7; }

.action-btn.counselor-btn {
  background: #fffbe6;
  color: #ad8b00;
  border: 1px solid #ffe58f;
}
.action-btn.counselor-btn:hover { background: #fff1b8; }

/* 统计弹窗 */
.stat-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.student-badge { background: #e6f4ff; color: #1677ff; }
.teacher-badge { background: #fff7e6; color: #d46b08; }
.zero-badge    { background: #fafafa; color: #bfbfbf; }

.stats-total-row td {
  background: #fafafa;
  border-top: 2px solid #d9d9d9;
  padding: 10px 16px;
}

/* 人脸库导入弹窗 */
.face-tip {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #e6f4ff;
  border: 1px solid #91caff;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 13px;
  color: #003a8c;
  margin-bottom: 16px;
  line-height: 1.6;
}
.face-tip svg { width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; color: #1677ff; }

.face-upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 28px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  margin-bottom: 12px;
  position: relative;
}
.face-upload-area:hover { border-color: #1677ff; background: #f0f7ff; }
.face-upload-area.has-file { border-color: #52c41a; background: #f6ffed; }

.upload-icon { width: 36px; height: 36px; color: #bfbfbf; margin-bottom: 8px; }
.file-ok-icon { color: #52c41a; }
.upload-hint { color: #00000073; font-size: 13px; margin: 0; }
.upload-filename { color: #000000d9; font-size: 14px; font-weight: 500; margin: 0; }
.upload-filesize { color: #00000073; font-size: 12px; margin-left: 4px; }

.remove-file-btn {
  margin-top: 8px;
  padding: 2px 10px;
  background: white;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
}
.remove-file-btn:hover { background: #fff2f0; }

.overwrite-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #000000d9;
  cursor: pointer;
  margin-bottom: 12px;
}
.overwrite-label input { accent-color: #1677ff; }

.face-result { margin-top: 12px; }

.face-result-summary {
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 13px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.result-ok   { background: #f6ffed; border: 1px solid #b7eb8f; color: #237804; }
.result-warn { background: #fffbe6; border: 1px solid #ffe58f; color: #874d00; }

.face-result-errors { margin-top: 8px; max-height: 120px; overflow-y: auto; }
.face-error-item { font-size: 12px; color: #ff4d4f; padding: 2px 0; border-bottom: 1px solid #fff2f0; }

/* ===== 说明卡片 ===== */
.notice-section {
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;
  border: 1px solid;
}

.notice-blue {
  background: #e6f4ff;
  border-color: #91caff;
}

.notice-orange {
  background: #fff7e6;
  border-color: #ffd591;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
}

.notice-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.notice-blue .notice-icon { color: #1677ff; }
.notice-orange .notice-icon { color: #d46b08; }

.notice-title {
  font-size: 14px;
  font-weight: 600;
}

.notice-blue .notice-title { color: #003a8c; }
.notice-orange .notice-title { color: #7c3c00; }

.notice-desc {
  font-size: 13px;
  color: #003a8c;
  margin: 0 0 10px;
  line-height: 1.6;
}

.notice-steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.notice-steps li {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  color: #003a8c;
  line-height: 1.6;
}

.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #1677ff;
  color: white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.notice-role-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notice-role-item {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 13px;
  color: #7c3c00;
  line-height: 1.6;
}

.role-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid;
}

.teacher-tag { background: #fff7e6; color: #d46b08; border-color: #ffd591; }
.counselor-tag { background: #e6fffb; color: #08979c; border-color: #87e8de; }
.student-tag { background: #f6ffed; color: #389e0d; border-color: #b7eb8f; }

.import-section { padding: 8px 0; }
.import-tip {
  font-size: 13px;
  color: #606266;
  background: #f5f7fa;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 14px;
  line-height: 1.8;
}
.import-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.import-result { margin-top: 16px; }

/* ===== 凭据展示弹窗 ===== */
.credentials-modal { max-width: 460px; }

.credentials-header { background: #f6ffed; border-bottom: 1px solid #b7eb8f; }

.credentials-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.credentials-title-wrap h3 { color: #389e0d; margin: 0; font-size: 16px; }

.credentials-icon { width: 20px; height: 20px; color: #52c41a; flex-shrink: 0; }

.credentials-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 13px;
  color: #874d00;
  margin-bottom: 16px;
  line-height: 1.5;
}

.credentials-notice svg { width: 16px; height: 16px; color: #faad14; flex-shrink: 0; margin-top: 1px; }

.credentials-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.credentials-name { font-size: 16px; font-weight: 600; color: #000000d9; }

.credentials-item {
  margin-bottom: 14px;
}

.credentials-label {
  font-size: 12px;
  color: #00000073;
  margin-bottom: 6px;
  font-weight: 400;
}

.credentials-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fafafa;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px 12px;
}

.credentials-value {
  flex: 1;
  font-size: 15px;
  font-family: 'SFMono-Regular', Consolas, monospace;
  color: #000000d9;
  word-break: break-all;
}

.credentials-password {
  color: #1677ff;
  font-weight: 600;
  font-size: 17px;
  letter-spacing: 1px;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: #00000073;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  white-space: nowrap;
  font-family: inherit;
  flex-shrink: 0;
}

.copy-btn svg { width: 13px; height: 13px; }
.copy-btn:hover { border-color: #1677ff; color: #1677ff; }

.copy-all-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 6px;
  padding: 9px;
  background: #e6f4ff;
  border: 1px solid #91caff;
  border-radius: 6px;
  font-size: 14px;
  color: #1677ff;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}

.copy-all-btn svg { width: 15px; height: 15px; }
.copy-all-btn:hover { background: #bae0ff; }
</style> 