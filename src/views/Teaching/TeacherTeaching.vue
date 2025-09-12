<template>
  <div class="teacher-teaching">
    <h2>教师教学管理</h2>
    
    <div class="function-grid">
      <div class="function-card">
        <h3>📅 教学周历</h3>
        <div class="under-construction">
          <h2>功能建设中</h2>
          <p>教学周历功能正在开发中，敬请期待...</p>
        </div>
      </div>
      
      <div class="function-card">
        <h3>📝 教学教案</h3>
        <div class="under-construction">
          <h2>功能建设中</h2>
          <p>教学教案管理功能正在开发中，敬请期待...</p>
        </div>
      </div>
      
      <div class="function-card">
        <h3>✅ 签到签退</h3>
        <div class="under-construction">
          <h2>功能建设中</h2>
          <p>教师签到签退功能正在开发中，敬请期待...</p>
        </div>
      </div>
      
      <div class="function-card">
        <h3>🎥 演示视频</h3>
        <div class="under-construction">
          <h2>功能建设中</h2>
          <p>演示视频管理功能正在开发中，敬请期待...</p>
        </div>
      </div>
      
      <div class="function-card">
        <h3>📋 课后作业</h3>
        <div class="under-construction">
          <h2>功能建设中</h2>
          <p>课后作业布置功能正在开发中，敬请期待...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeacherTeaching'
}
</script>

<style scoped>
.teacher-teaching h2 {
  color: #303133;
  margin-bottom: 24px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.function-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.function-card h3 {
  color: #409eff;
  margin-bottom: 16px;
  font-size: 18px;
}
</style> 