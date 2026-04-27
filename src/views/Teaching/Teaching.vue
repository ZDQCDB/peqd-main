<template>
  <div class="module-page">
    <div class="module-header">
      <button class="btn btn-primary" @click="$router.push('/dashboard')">← 返回桌面</button>
      <h1>教学模块</h1>
    </div>
    
    <div class="container">
      <div class="module-nav">
        <div class="nav-card" @click="$router.push('/teaching/teacher')">
          <div class="nav-icon">教</div>
          <h3>教师端</h3>
          <p>教学周历、教学教案、签到签退、演示视频、课后作业</p>
        </div>
        
        <div class="nav-card" @click="$router.push('/teaching/student')">
          <div class="nav-icon">学</div>
          <h3>学生端</h3>
          <p>签到签退、学习内容、视频学习、作业上交</p>
        </div>
        
        <div class="nav-card" @click="$router.push('/teaching/admin')">
          <div class="nav-icon">管</div>
          <h3>管理员端</h3>
          <p>教师签到管理、课程监督、签到统计、拍照记录查看</p>
        </div>

        <div class="nav-card" v-if="showScheduleCards" @click="$router.push('/teaching/schedule-import')">
          <div class="nav-icon">表</div>
          <h3>课表导入</h3>
          <p>导入教师课表 Excel，管理学期课程安排</p>
        </div>

        <div class="nav-card" v-if="showScheduleCards" @click="$router.push('/teaching/class-selection-window')">
          <div class="nav-icon">窗</div>
          <h3>选课窗口管理</h3>
          <p>设置学生选课时间窗口，控制临时班级选课开放与关闭</p>
        </div>

        <div class="nav-card" v-if="showTempClassCard" @click="$router.push('/teaching/temp-class-management')">
          <div class="nav-icon">班</div>
          <h3>临时班级管理</h3>
          <p>查看临时班级列表、已选学生名单、班级容量</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isSchoolAdmin, isSuperAdmin, isTeacher } from '@/utils/permissionManager'

export default {
  name: 'Teaching',
  computed: {
    showScheduleCards() {
      return isSchoolAdmin() || isSuperAdmin()
    },
    showTempClassCard() {
      return isSchoolAdmin() || isSuperAdmin() || isTeacher()
    }
  }
}
</script>

<style scoped>
.module-page {
  min-height: 100vh;
  background: var(--bg-body);
}

.module-header {
  background: white;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.module-header h1 {
  color: #000000d9;
  font-size: 24px;
  margin: 0;
}

.module-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin: 40px 0;
}

.nav-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
}

.nav-card:hover {
  
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.nav-card h3 {
  color: #000000d9;
  margin-bottom: 12px;
}

.nav-card p {
  color: #00000040;
  font-size: 14px;
  line-height: 1.5;
}
</style> 