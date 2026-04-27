<template>
  <div class="module-page">
    <div class="module-header">
      <button class="btn btn-primary" @click="$router.push('/dashboard')">← 返回桌面</button>
      <h1>运动装备</h1>
    </div>
    
    <div class="container">
      <div class="module-nav">
        <div class="nav-card" @click="$router.push('/sports-equipment/sharing')">
          <div class="nav-icon"></div>
          <h3>运动装备共享</h3>
          <p>装备共享和交换</p>
        </div>
        
        <div class="nav-card" @click="goToYouzanMall">
          <div class="nav-icon"></div>
          <h3>运动装备商城</h3>
          <p>装备购买和销售</p>
        </div>
      </div>
      
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SportsEquipment',
  methods: {
    goToYouzanMall() {
      window.location.href = 'https://account.youzan.com'
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