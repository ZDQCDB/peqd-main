<template>
  <div class="module-page">
    <div class="module-header">
      <button class="btn btn-primary" @click="$router.push('/dashboard')">← 返回桌面</button>
      <h1>器材模块</h1>
    </div>
    
    <div class="container">
      <div class="module-nav">
        <div class="nav-card" @click="$router.push('/equipment/teacher')">
          <div class="nav-icon">👨‍🏫</div>
          <h3>教师端</h3>
          <p>体育器材管理和分配</p>
        </div>
        
        <div class="nav-card" @click="$router.push('/equipment/student')">
          <div class="nav-icon">👨‍🎓</div>
          <h3>学生端</h3>
          <p>体育器材借用和归还</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Equipment'
}
</script>

<style scoped>
.module-page {
  min-height: 100vh;
  background-color: #f5f7fa;
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
  color: #303133;
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.nav-card h3 {
  color: #303133;
  margin-bottom: 12px;
}

.nav-card p {
  color: #909399;
  font-size: 14px;
  line-height: 1.5;
}
</style> 