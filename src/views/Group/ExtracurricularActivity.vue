<template>
  <div class="extracurricular">
    <div class="header">
      <h2>课外体育活动</h2>
    </div>

    <div class="info-banner">
      <div class="banner-icon">🎯</div>
      <div class="banner-text">
        <h3>课外体育活动管理</h3>
        <p>PE活动的创建、审核和管理功能已在"PE活动"模块中实现。学生通过 App 报名参加活动并获取积分。</p>
      </div>
    </div>

    <div class="action-grid">
      <div class="action-card" @click="$router.push('/pe-activities')">
        <div class="card-icon">🎪</div>
        <h3>PE活动管理</h3>
        <p>创建、审核和管理PE体育活动</p>
        <span class="card-link">前往管理 →</span>
      </div>
      <div class="action-card" @click="$router.push('/morning-exercise')">
        <div class="card-icon">🌅</div>
        <h3>早操管理</h3>
        <p>管理早操签到和积分发放</p>
        <span class="card-link">前往管理 →</span>
      </div>
      <div class="action-card" @click="$router.push('/group/sunshine-run')">
        <div class="card-icon">🏃</div>
        <h3>阳光跑统计</h3>
        <p>查看学生阳光跑记录和统计大屏</p>
        <span class="card-link">前往查看 →</span>
      </div>
      <div class="action-card" @click="$router.push('/group/homework')">
        <div class="card-icon">💪</div>
        <h3>课后作业统计</h3>
        <p>查看学生课后运动作业完成情况和班级排名</p>
        <span class="card-link">前往查看 →</span>
      </div>
    </div>
  </div>
</template>

<script>
export default { name: 'ExtracurricularActivity' }
</script>

<style scoped>
.extracurricular { padding: 20px; }
.header h2 { margin: 0 0 20px; color: #000000d9; }
.info-banner { display: flex; gap: 16px; align-items: center; background: #e6f4ff; border: 1px solid #91caff; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
.banner-icon { font-size: 32px; }
.banner-text h3 { margin: 0 0 4px; font-size: 15px; color: #1677ff; }
.banner-text p { margin: 0; font-size: 13px; color: #666; }
.action-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.action-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); cursor: pointer; transition: all 0.2s; border: 1px solid #f0f0f0; }
.action-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.card-icon { font-size: 36px; margin-bottom: 12px; }
.action-card h3 { margin: 0 0 8px; font-size: 16px; }
.action-card p { margin: 0 0 12px; font-size: 13px; color: #666; }
.card-link { color: #1677ff; font-size: 13px; }
.status-tag { display: inline-block; padding: 2px 10px; background: #f6ffed; color: #52c41a; border-radius: 4px; font-size: 12px; }
</style>
