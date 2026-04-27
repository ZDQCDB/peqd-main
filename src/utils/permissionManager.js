/**
 * 简化权限管理器
 * 基于用户角色的简单权限控制
 */

class PermissionManager {
  constructor() {
    this.userRole = null
    this.initialized = false
  }

  /**
   * 初始化权限管理器
   * @param {string} userRole - 用户角色
   */
  init(userRole) {
    this.userRole = userRole
    this.initialized = true
  }

  /**
   * 检查用户是否具有特定角色
   * @param {string} role - 角色名称
   * @returns {boolean}
   */
  hasRole(role) {
    return this.userRole === role
  }

  /**
   * 检查用户是否具有任意一个角色
   * @param {string[]} roles - 角色数组
   * @returns {boolean}
   */
  hasAnyRole(roles) {
    return roles.includes(this.userRole)
  }

  /**
   * 获取当前用户角色
   * @returns {string|null}
   */
  getCurrentRole() {
    return this.userRole
  }

  /**
   * 重置权限管理器
   */
  reset() {
    this.userRole = null
    this.initialized = false
  }

  /**
   * 检查是否为管理员
   * @returns {boolean}
   */
  isAdmin() {
    return ['department_admin', 'school_admin', 'super_admin'].includes(this.userRole)
  }

  /**
   * 检查是否为超级管理员
   * @returns {boolean}
   */
  isSuperAdmin() {
    return this.userRole === 'super_admin'
  }

  /**
   * 检查是否为学生
   * @returns {boolean}
   */
  isStudent() {
    return this.userRole === 'student'
  }

  /**
   * 检查是否为教师
   * @returns {boolean}
   */
  isTeacher() {
    return this.userRole === 'teacher'
  }

  /**
   * 检查是否为部门管理员
   * @returns {boolean}
   */
  isDepartmentAdmin() {
    return this.userRole === 'department_admin'
  }

  /**
   * 检查是否为学校管理员
   * @returns {boolean}
   */
  isSchoolAdmin() {
    return this.userRole === 'school_admin'
  }

  isCounselor() {
    return this.userRole === 'counselor'
  }
}

// 创建全局实例
const permissionManager = new PermissionManager()

// 导出便利函数
export const hasRole = (role) => permissionManager.hasRole(role)
export const hasAnyRole = (roles) => permissionManager.hasAnyRole(roles)
export const isAdmin = () => permissionManager.isAdmin()
export const isSuperAdmin = () => permissionManager.isSuperAdmin()
export const isStudent = () => permissionManager.isStudent()
export const isTeacher = () => permissionManager.isTeacher()
export const isDepartmentAdmin = () => permissionManager.isDepartmentAdmin()
export const isSchoolAdmin = () => permissionManager.isSchoolAdmin()
export const isCounselor = () => permissionManager.isCounselor()
export const getCurrentRole = () => permissionManager.getCurrentRole()

export default permissionManager 