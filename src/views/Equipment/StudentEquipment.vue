<template>
  <div class="student-equipment">
    <div class="header">
      <h2>体育器材借用</h2>
    </div>

    <div class="info-banner">
      <div class="banner-icon"></div>
      <div class="banner-text">
        <h3>器材借用管理</h3>
        <p>学生通过 PE校园 App 申请借用体育器材，管理员在此审核和管理借用记录。</p>
      </div>
    </div>

    <div class="action-grid">
      <div class="action-card" @click="$router.push('/equipment')">
        <div class="card-icon"></div>
        <h3>器材库管理</h3>
        <p>管理体育器材库存、入库和出库</p>
        <span class="card-link">前往管理 →</span>
      </div>
      <div class="action-card">
        <div class="card-icon"></div>
        <h3>借用申请审核</h3>
        <p>审核学生的器材借用申请</p>
        <span class="card-link">前往审核 →</span>
      </div>
      <div class="action-card">
        <div class="card-icon"></div>
        <h3>借用统计</h3>
        <p>查看器材借用频率和损耗统计</p>
        <span class="status-tag">即将上线</span>
      </div>
    </div>
  </div>
</template>

<script>
export default { name: 'StudentEquipment' }
</script>

<style scoped>
.student-equipment { padding: 20px; }
.header h2 { margin: 0 0 20px; color: #000000d9; }
.info-banner { display: flex; gap: 16px; align-items: center; background: #fff7e6; border: 1px solid #ffd591; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
.banner-icon { font-size: 32px; }
.banner-text h3 { margin: 0 0 4px; font-size: 15px; color: #d48806; }
.banner-text p { margin: 0; font-size: 13px; color: #666; }
.action-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.action-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); cursor: pointer; transition: all 0.2s; border: 1px solid #f0f0f0; }
.action-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.card-icon { font-size: 36px; margin-bottom: 12px; }
.action-card h3 { margin: 0 0 8px; font-size: 16px; }
.action-card p { margin: 0 0 12px; font-size: 13px; color: #666; }
.card-link { color: #1677ff; font-size: 13px; }
.status-tag { display: inline-block; padding: 2px 10px; background: #fffbe6; color: #d48806; border-radius: 4px; font-size: 12px; }
</style>
