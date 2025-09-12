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
          <button class="action-btn primary" @click="showCreateUserModal">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            创建用户
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
  </div>
</template>

<script>
import authService from '@/services/authService'
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
        // 校级管理员可以看到学生、教师、院级管理员
        return users.filter(user => ['student', 'teacher', 'department_admin'].includes(user.userType))
      } else if (isDepartmentAdmin()) {
        // 院级管理员只能看到学生和教师
        return users.filter(user => ['student', 'teacher'].includes(user.userType))
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
      if (!this.createForm.realName || !this.createForm.username || !this.createForm.studentId || !this.createForm.userType || !this.createForm.school) {
        alert('请填写所有必填字段')
        return
      }

      this.saving = true
      try {
        const result = await authService.createUser(this.createForm)
        if (result.code === 200) {
          alert('用户创建成功')
          this.closeModals()
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
      // 超级管理员可以提升校级管理员，校级管理员可以提升院级管理员
      // 学生不能提权为教师
      if (isSuperAdmin()) {
        return ['teacher', 'department_admin'].includes(user.userType)
      } else if (isSchoolAdmin()) {
        return user.userType === 'teacher'
      } else if (isDepartmentAdmin()) {
        return false // 院级管理员不能提升任何用户的权限
      }
      return false
    },

    canDemoteUser(user) {
      // 超级管理员可以降低校级和院级管理员，校级管理员可以降低院级管理员
      // 教师不能降权为学生
      if (isSuperAdmin()) {
        return ['school_admin', 'department_admin'].includes(user.userType)
      } else if (isSchoolAdmin()) {
        return user.userType === 'department_admin'
      } else if (isDepartmentAdmin()) {
        return false // 院级管理员不能降低任何用户的权限
      }
      return false
    },

    getPromoteRole(currentRole) {
      if (isSuperAdmin()) {
        const roleHierarchy = {
          'teacher': 'department_admin',
          'department_admin': 'school_admin'
        }
        return roleHierarchy[currentRole]
      } else if (isSchoolAdmin()) {
        const roleHierarchy = {
          'teacher': 'department_admin'
        }
        return roleHierarchy[currentRole]
      }
      return null
    },

    getDemoteRole(currentRole) {
      if (isSuperAdmin()) {
        const roleHierarchy = {
          'school_admin': 'department_admin',
          'department_admin': 'teacher'
        }
        return roleHierarchy[currentRole]
      } else if (isSchoolAdmin()) {
        const roleHierarchy = {
          'department_admin': 'teacher'
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

    getRoleText(role) {
      const roleMap = {
        'student': '学生',
        'teacher': '教师',
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
/* 主容器 */
.admin-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 顶部导航栏 */
.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: var(--shadow-sm);
}

.header-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
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
  transition: all var(--transition-normal);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
}

.back-btn:hover {
  background: var(--bg-surface);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateX(-2px);
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
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-top: var(--spacing-xs);
}

.role-indicator {
  margin-left: var(--spacing-md);
}

.role-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.premium {
  background: linear-gradient(135deg, var(--accent-color) 0%, #ff8a65 100%);
  color: white;
  box-shadow: var(--shadow-sm);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn.primary {
  background: var(--primary-gradient);
  color: white;
  box-shadow: var(--shadow-sm);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--divider);
}

.action-btn.secondary:hover {
  background: var(--bg-surface);
  border-color: var(--primary-color);
}

.action-btn.refresh {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--divider);
  padding: var(--spacing-sm);
  min-width: 44px;
  justify-content: center;
}

.action-btn.refresh:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.action-btn.refresh svg {
  transition: transform var(--transition-normal);
}

.action-btn.refresh:hover svg {
  transform: rotate(180deg);
}

/* 主内容区域 */
.main-content {
  padding: var(--spacing-xl) 0;
}

.content-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
}

/* 统计信息区域 */
.stats-section {
  margin-bottom: var(--spacing-2xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all var(--transition-normal);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transition: transform var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-card.student::before {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.teacher::before {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-card.admin::before {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-card.online::before {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.stat-card.student .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.teacher .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-card.admin .stat-icon {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-card.online .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.stat-number {
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-xs);
  display: block;
}

/* 筛选区域 */
.filter-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
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

.search-input {
  position: relative;
}

.search-input::placeholder {
  color: var(--text-disabled);
}

.bulk-actions {
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bulk-info {
  font-weight: 500;
  color: #1976d2;
}

.bulk-buttons {
  display: flex;
  gap: 8px;
}

.users-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.users-section h3 {
  margin: 0;
  padding: 20px 20px 0 20px;
  color: #303133;
}

.table-container {
  overflow-x: auto;
  padding: 20px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e4e7ed;
}

.users-table th {
  background: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

.users-table tr:hover {
  background: #f8f9fa;
}

.role-badge.student {
  background: #67c23a;
}

.role-badge.teacher {
  background: #e6a23c;
}

.role-badge.department_admin {
  background: #409eff;
}

.role-badge.school_admin {
  background: #909399;
}

.role-badge.super_admin {
  background: #f56c6c;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge.active {
  background: #f0f9ff;
  color: #67c23a;
}

.status-badge.suspended {
  background: #fef0f0;
  color: #f56c6c;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-small {
  padding: 4px 8px;
  font-size: 11px;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #337ecc;
}

.btn-warning {
  background-color: #e6a23c;
  color: white;
}

.btn-warning:hover {
  background-color: #cf9236;
}

.btn-danger {
  background-color: #f56c6c;
  color: white;
}

.btn-danger:hover {
  background-color: #f14343;
}

.btn-success {
  background-color: #67c23a;
  color: white;
}

.btn-success:hover {
  background-color: #5daf34;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

.btn-secondary {
  background-color: #ddd;
  color: #666;
}

.btn-secondary:hover {
  background-color: #ccc;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
}

.page-info {
  color: #606266;
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.large-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.modal-header h3 {
  margin: 0;
  color: #303133;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #909399;
}

.close-btn:hover {
  color: #606266;
}

.modal-body {
  padding: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.user-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item label {
  font-weight: 500;
  color: #606266;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
}

.log-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 12px;
  padding: 16px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-time {
  font-size: 12px;
  color: #909399;
}

.log-action {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.log-action.role_promote {
  background: #f0f9ff;
  color: #409eff;
}

.log-action.role_demote {
  background: #fef0f0;
  color: #f56c6c;
}

.log-action.status_suspend {
  background: #fff7e6;
  color: #e6a23c;
}

.log-action.status_activate {
  background: #f0f9ff;
  color: #67c23a;
}

.log-details p {
  margin: 4px 0;
  font-size: 14px;
  color: #606266;
}

.no-logs {
  text-align: center;
  color: #909399;
  padding: 40px;
}

.role-change {
  text-align: center;
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.old-role {
  padding: 6px 12px;
  background: #e6a23c;
  color: white;
  border-radius: 4px;
}

.arrow {
  margin: 0 12px;
  font-size: 18px;
  color: #606266;
}

.new-role {
  padding: 6px 12px;
  background: #67c23a;
  color: white;
  border-radius: 4px;
}

.warning {
  color: #e6a23c;
  font-size: 14px;
  background: #fdf6ec;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #e6a23c;
}

.password-hint {
  margin-top: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.password-hint p {
  margin: 0 0 8px 0;
  font-weight: 500;
  color: #303133;
}

.password-hint ul {
  margin: 0;
  padding-left: 16px;
  color: #606266;
  font-size: 13px;
}

.password-hint li {
  margin-bottom: 4px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.checkbox-container input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
}

.checkmark {
  margin-left: 4px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #e4e7ed;
}

.stats-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stats-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 24px;
}

.stat-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  opacity: 0.9;
}

.stat-info p {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .filter-form {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .bulk-actions {
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .user-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style> 