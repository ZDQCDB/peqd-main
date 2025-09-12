<template>
  <div class="student-teaching">
    <h2>学生学习中心</h2>
    
    <div class="function-grid">
      <div class="function-card">
        <h3>✅ 签到签退</h3>
        <div class="under-construction">
          <h2>功能建设中</h2>
          <p>学生签到签退功能正在开发中，敬请期待...</p>
        </div>
      </div>
      
      <div class="function-card">
        <h3>📚 学习内容</h3>
        <div class="under-construction">
          <h2>功能建设中</h2>
          <p>学习内容查看功能正在开发中，敬请期待...</p>
        </div>
      </div>
      
      <div class="function-card">
        <h3>🎥 视频学习</h3>
        <div class="under-construction">
          <h2>功能建设中</h2>
          <p>视频学习功能正在开发中，敬请期待...</p>
        </div>
      </div>
      
      <div class="function-card">
        <h3>📝 作业上交</h3>
        <div class="under-construction">
          <h2>功能建设中</h2>
          <p>作业上交功能正在开发中，敬请期待...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudentTeaching'
}
</script>

<style scoped>
.student-teaching h2 {
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
  color: #67c23a;
  margin-bottom: 16px;
  font-size: 18px;
}
</style> 