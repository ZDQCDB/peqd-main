<template>
  <div class="pe-campus">
    <div class="header">
      <h2>PE校园比赛</h2>
    </div>

    <div class="info-banner">
      <div class="banner-icon">🏆</div>
      <div class="banner-text">
        <h3>校园体育赛事管理</h3>
        <p>管理校内体育比赛的报名、赛程安排和成绩录入。比赛成绩可在"PE成绩管理"中查看。</p>
      </div>
    </div>

    <div class="action-grid">
      <div class="action-card" @click="$router.push('/training')">
        <div class="card-icon">📊</div>
        <h3>比赛成绩查询</h3>
        <p>查看已录入的比赛成绩和排名</p>
        <span class="card-link">前往查看 →</span>
      </div>
      <div class="action-card">
        <div class="card-icon">📋</div>
        <h3>赛事报名管理</h3>
        <p>管理学生比赛报名信息</p>
        <span class="status-tag">即将上线</span>
      </div>
      <div class="action-card">
        <div class="card-icon">📅</div>
        <h3>赛程安排</h3>
        <p>制定和发布比赛赛程</p>
        <span class="status-tag">即将上线</span>
      </div>
    </div>
  </div>
</template>

<script>
export default { name: 'PECampus' }
</script>

<style scoped>
.pe-campus { padding: 20px; }
.header h2 { margin: 0 0 20px; color: #000000d9; }
.info-banner { display: flex; gap: 16px; align-items: center; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
.banner-icon { font-size: 32px; }
.banner-text h3 { margin: 0 0 4px; font-size: 15px; color: #389e0d; }
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
