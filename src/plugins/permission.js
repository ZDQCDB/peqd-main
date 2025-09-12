// src/plugins/permission.js

import {
  hasRole,
  hasAnyRole,
  isAdmin,
  isSuperAdmin,
  isStudent,
  isTeacher,
  isDepartmentAdmin,
  isSchoolAdmin,
  getCurrentRole
} from '@/utils/permissionManager'

export default {
  install(app) {
    // ✅ 注册全局属性
    app.config.globalProperties.$role = getCurrentRole
    app.config.globalProperties.$hasRole = hasRole
    app.config.globalProperties.$hasAnyRole = hasAnyRole
    app.config.globalProperties.$isAdmin = isAdmin
    app.config.globalProperties.$isSuperAdmin = isSuperAdmin
    app.config.globalProperties.$isStudent = isStudent
    app.config.globalProperties.$isTeacher = isTeacher
    app.config.globalProperties.$isDepartmentAdmin = isDepartmentAdmin
    app.config.globalProperties.$isSchoolAdmin = isSchoolAdmin

    // ✅ 注册自定义指令（v-role）
    app.directive('role', {
      mounted(el, binding) {
        if (!hasRole(binding.value)) {
          el.style.display = 'none'
        }
      },
      updated(el, binding) {
        if (!hasRole(binding.value)) {
          el.style.display = 'none'
        } else {
          el.style.display = ''
        }
      }
    })

    app.directive('any-role', {
      mounted(el, binding) {
        if (!hasAnyRole(binding.value)) {
          el.style.display = 'none'
        }
      },
      updated(el, binding) {
        if (!hasAnyRole(binding.value)) {
          el.style.display = 'none'
        } else {
          el.style.display = ''
        }
      }
    })

    app.directive('admin', {
      mounted(el) {
        if (!isAdmin()) {
          el.style.display = 'none'
        }
      },
      updated(el) {
        if (!isAdmin()) {
          el.style.display = 'none'
        } else {
          el.style.display = ''
        }
      }
    })

    app.directive('student', {
      mounted(el) {
        if (!isStudent()) {
          el.style.display = 'none'
        }
      },
      updated(el) {
        if (!isStudent()) {
          el.style.display = 'none'
        } else {
          el.style.display = ''
        }
      }
    })

    app.directive('teacher', {
      mounted(el) {
        if (!isTeacher()) {
          el.style.display = 'none'
        }
      },
      updated(el) {
        if (!isTeacher()) {
          el.style.display = 'none'
        } else {
          el.style.display = ''
        }
      }
    })

    // ✅ 注册混入逻辑（选项式 API 支持）
    app.mixin({
      computed: {
        $userRole() {
          return getCurrentRole()
        },
        $isUserAdmin() {
          return isAdmin()
        },
        $isUserSuperAdmin() {
          return isSuperAdmin()
        },
        $isUserStudent() {
          return isStudent()
        },
        $isUserTeacher() {
          return isTeacher()
        },
        $isUserDepartmentAdmin() {
          return isDepartmentAdmin()
        },
        $isUserSchoolAdmin() {
          return isSchoolAdmin()
        }
      }
    })
  }
}
