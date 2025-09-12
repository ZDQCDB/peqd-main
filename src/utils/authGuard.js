/**
 * 认证守卫工具
 * 用于组件级权限控制
 */

import authService from '@/services/authService'
import { permissionManager, PERMISSIONS, ROLES } from '@/utils/permissionManager'

/**
 * 权限检查函数
 * @param {string|Array} permissions - 需要的权限
 * @returns {boolean} 是否有权限
 */
export function hasPermission(permissions) {
  // 如果传入的是字符串，转换为数组
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions]
  
  // 检查是否有任一权限
  return permissionManager.hasAnyPermission(requiredPermissions)
}

/**
 * 角色检查函数
 * @param {string|Array} roles - 需要的角色
 * @returns {boolean} 是否有角色
 */
export function hasRole(roles) {
  const requiredRoles = Array.isArray(roles) ? roles : [roles]
  return permissionManager.hasAnyRole(requiredRoles)
}

/**
 * 认证状态检查
 * @returns {boolean} 是否已登录
 */
export function isAuthenticated() {
  return authService.checkCurrentSession()
}

/**
 * 获取当前用户信息
 * @returns {Promise<Object|null>} 用户信息
 */
export async function getCurrentUser() {
  return await authService.getCurrentUser()
}

/**
 * 检查是否为管理员
 * @returns {boolean} 是否为管理员
 */
export function isAdmin() {
  return permissionManager.isAdmin()
}

/**
 * 检查是否为超级管理员
 * @returns {boolean} 是否为超级管理员
 */
export function isSuperAdmin() {
  return permissionManager.isSuperAdmin()
}

/**
 * Vue 混入，提供组件级权限方法
 */
export const AuthMixin = {
  data() {
    return {
      $currentUserData: null
    }
  },
  computed: {
    $isAuthenticated() {
      return isAuthenticated()
    },
    $isAdmin() {
      return isAdmin()
    },
    $isSuperAdmin() {
      return isSuperAdmin()
    }
  },
  async mounted() {
    this.$currentUserData = await getCurrentUser()
  },
  methods: {
    $hasPermission(permissions) {
      return hasPermission(permissions)
    },
    $hasRole(roles) {
      return hasRole(roles)
    },
    $requireAuth() {
      if (!this.$isAuthenticated) {
        this.$router.push('/login')
        return false
      }
      return true
    },
    $requirePermission(permissions) {
      if (!this.$requireAuth()) return false
      
      const hasPermissions = this.$hasPermission(permissions)
      if (!hasPermissions) {
        alert('权限不足')
        return false
      }
      return true
    },
    $requireRole(roles) {
      if (!this.$requireAuth()) return false
      
      const hasRoles = this.$hasRole(roles)
      if (!hasRoles) {
        alert('角色权限不足')
        return false
      }
      return true
    }
  }
}

/**
 * Vue 指令，用于控制元素显示/隐藏
 */
export const AuthDirectives = {
  // v-auth="'permission_name'" 或 v-auth="['perm1', 'perm2']"
  auth: {
    mounted(el, binding) {
      const permissions = binding.value
      const hasPermissions = hasPermission(permissions)
      if (!hasPermissions) {
        el.style.display = 'none'
      }
    },
    updated(el, binding) {
      const permissions = binding.value
      const hasPermissions = hasPermission(permissions)
      if (!hasPermissions) {
        el.style.display = 'none'
      } else {
        el.style.display = ''
      }
    }
  },
  
  // v-role="'admin'" 或 v-role="['admin', 'teacher']"
  role: {
    mounted(el, binding) {
      const roles = binding.value
      const hasRoles = hasRole(roles)
      if (!hasRoles) {
        el.style.display = 'none'
      }
    },
    updated(el, binding) {
      const roles = binding.value
      const hasRoles = hasRole(roles)
      if (!hasRoles) {
        el.style.display = 'none'
      } else {
        el.style.display = ''
      }
    }
  }
}

/**
 * 高阶组件，包装需要权限的组件
 * @param {Object} WrappedComponent - 被包装的组件
 * @param {Object} options - 权限配置
 * @returns {Object} 包装后的组件
 */
export function withAuth(WrappedComponent, options = {}) {
  return {
    name: `WithAuth(${WrappedComponent.name})`,
    mixins: [AuthMixin],
    
    beforeMount() {
      // 检查登录状态
      if (options.requireAuth !== false && !this.$requireAuth()) {
        return
      }
      
      // 检查权限
      if (options.permissions && !this.$requirePermission(options.permissions)) {
        return
      }
      
      // 检查角色
      if (options.roles && !this.$requireRole(options.roles)) {
        return
      }
    },
    
    render() {
      // 如果没有权限，可以显示提示组件
      if (options.requireAuth !== false && !this.$isAuthenticated) {
        return options.loginComponent || null
      }
      
      if (options.permissions && !this.$hasPermission(options.permissions)) {
        return options.noPermissionComponent || null
      }
      
      if (options.roles && !this.$hasRole(options.roles)) {
        return options.noRoleComponent || null
      }
      
      // 渲染原组件
      return h(WrappedComponent, this.$attrs, this.$slots)
    }
  }
}

/**
 * 路由权限检查工具
 */
export class RouteGuard {
  static checkAuth(to, from, next) {
    if (!isAuthenticated()) {
      next('/login')
      return false
    }
    return true
  }
  
  static checkPermissions(permissions) {
    return (to, from, next) => {
      if (!this.checkAuth(to, from, next)) return
      
      if (!hasPermission(permissions)) {
        alert('权限不足')
        next('/dashboard')
        return
      }
      
      next()
    }
  }
  
  static checkRoles(roles) {
    return (to, from, next) => {
      if (!this.checkAuth(to, from, next)) return
      
      if (!hasRole(roles)) {
        alert('角色权限不足')
        next('/dashboard')
        return
      }
      
      next()
    }
  }
}

// 权限常量和角色常量已移至 permissionManager.js
// 为了向后兼容，重新导出
export { PERMISSIONS, ROLES } from '@/utils/permissionManager'

export default {
  hasPermission,
  hasRole,
  isAuthenticated,
  getCurrentUser,
  isAdmin,
  isSuperAdmin,
  AuthMixin,
  AuthDirectives,
  withAuth,
  RouteGuard,
  PERMISSIONS,
  ROLES
} 