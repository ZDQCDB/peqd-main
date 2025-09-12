# 简化权限系统使用指南

## 概述

系统已简化权限管理，移除了复杂的权限计算功能，采用基于角色的简单判断。前端直接根据用户角色控制UI显示，后端负责API访问权限验证。

## 用户角色

- **student**: 学生
- **teacher**: 教师  
- **department_admin**: 院级管理员
- **school_admin**: 校级管理员
- **super_admin**: 超级管理员

## 前端使用方法

### 1. 在组件中使用

```vue
<template>
  <div>
    <!-- 基于角色显示/隐藏UI -->
    <button v-if="$isUserTeacher || $isUserAdmin">创建听课记录</button>
    <button v-if="$isUserAdmin">管理用户</button>
    
    <!-- 使用指令控制 -->
    <div v-teacher>教师专用功能</div>
    <div v-admin>管理员专用功能</div>
    <div v-any-role="['teacher', 'department_admin']">教师和院级管理员可见</div>
  </div>
</template>

<script>
export default {
  computed: {
    // 可以直接使用混入的计算属性
    canCreate() {
      return this.$isUserTeacher || this.$isUserAdmin
    }
  },
  methods: {
    doSomething() {
      // 在方法中检查角色
      if (this.$isUserAdmin) {
        // 管理员操作
      } else if (this.$isUserTeacher) {
        // 教师操作  
      }
    }
  }
}
</script>
```

### 2. 可用的全局方法

```javascript
// 检查当前用户角色
this.$userRole              // 获取当前用户角色
this.$hasRole('teacher')    // 检查是否为特定角色
this.$hasAnyRole(['teacher', 'admin'])  // 检查是否为任意角色

// 快捷判断方法
this.$isUserStudent         // 是否为学生
this.$isUserTeacher         // 是否为教师
this.$isUserAdmin           // 是否为管理员（任何级别）
this.$isUserDepartmentAdmin // 是否为院级管理员
this.$isUserSchoolAdmin     // 是否为校级管理员
this.$isUserSuperAdmin      // 是否为超级管理员
```

### 3. 可用的Vue指令

```vue
<!-- 角色控制 -->
<div v-role="'teacher'">教师可见</div>
<div v-any-role="['teacher', 'department_admin']">多角色可见</div>
<div v-admin>管理员可见</div>
<div v-student>学生可见</div>
<div v-teacher>教师可见</div>
```

### 4. 在路由守卫中使用

```javascript
import { isAdmin, hasRole } from '@/utils/permissionManager'

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin && !isAdmin()) {
    next('/unauthorized')
  } else if (to.meta.requiresRole && !hasRole(to.meta.requiresRole)) {
    next('/unauthorized')
  } else {
    next()
  }
})
```

## 典型功能权限分配

### 听课管理功能
- **学生**: 查看听课记录，参与反馈
- **教师**: 学生权限 + 创建听课记录，上传教案和视频
- **管理员**: 教师权限 + 删除记录，查看统计数据

### 用户管理功能
- **学生/教师**: 无权限
- **院级管理员**: 查看本院系用户
- **校级管理员**: 管理所有用户，设置院级管理员
- **超级管理员**: 所有权限，设置校级管理员

## 实现示例

### 听课记录组件权限控制

```vue
<template>
  <div>
    <!-- 所有用户都可以查看 -->
    <div class="observation-list">
      <div v-for="item in observations" :key="item.id">
        {{ item.title }}
        
        <!-- 只有教师和管理员可以编辑 -->
        <button v-if="$isUserTeacher || $isUserAdmin" @click="edit(item)">
          编辑
        </button>
        
        <!-- 只有管理员可以删除 -->
        <button v-if="$isUserAdmin" @click="delete(item)">
          删除
        </button>
      </div>
    </div>
    
    <!-- 只有教师和管理员可以创建 -->
    <button v-if="$isUserTeacher || $isUserAdmin" @click="create()">
      创建听课记录
    </button>
    
    <!-- 只有管理员可以查看统计 -->
    <div v-if="$isUserAdmin" class="statistics">
      <h3>数据统计</h3>
      <!-- 统计内容 -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'ObservationList',
  methods: {
    edit(item) {
      // 编辑逻辑
      if (this.$isUserTeacher || this.$isUserAdmin) {
        // 执行编辑操作
      }
    },
    
    delete(item) {
      // 删除逻辑
      if (this.$isUserAdmin) {
        // 执行删除操作
      }
    },
    
    create() {
      // 创建逻辑
      if (this.$isUserTeacher || this.$isUserAdmin) {
        // 执行创建操作
      }
    }
  }
}
</script>
```

## 后端开发建议

1. **API权限验证**: 在API端点验证用户角色
2. **数据过滤**: 根据用户角色返回相应的数据
3. **操作权限**: 在执行敏感操作前检查用户角色

```javascript
// 后端API示例
app.get('/api/observations', (req, res) => {
  const userRole = req.user.role
  
  if (userRole === 'student') {
    // 学生只能看到公开的听课记录
    const observations = getPublicObservations()
    res.json(observations)
  } else if (userRole === 'teacher') {
    // 教师可以看到自己的和公开的
    const observations = getObservationsByTeacher(req.user.id)
    res.json(observations)
  } else if (isAdmin(userRole)) {
    // 管理员可以看到所有
    const observations = getAllObservations()
    res.json(observations)
  }
})
```

## 优势

1. **开发简单**: 直接基于角色判断，无需复杂权限计算
2. **性能高效**: 无需API调用，本地判断速度快
3. **易于维护**: 权限逻辑清晰，便于理解和修改
4. **一致性好**: 前后端都基于相同的角色体系

## 注意事项

1. **前端验证**: 仅用于UI控制，不能作为安全保障
2. **后端验证**: 必须在API层面进行真正的权限验证
3. **角色一致性**: 确保前后端角色定义完全一致
4. **登录状态**: 权限检查前确保用户已登录 