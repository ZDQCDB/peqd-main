<template>
  <div class="student-teaching">
    <div class="header">
      <h2>学生学习中心</h2>
    </div>

    <div class="info-banner">
      <div class="banner-icon"></div>
      <div class="banner-text">
        <h3>学生端功能说明</h3>
        <p>以下功能主要通过 PE校园 App（Android/iOS）使用，管理端提供数据查看和管理功能。</p>
      </div>
    </div>

    <div class="function-grid">
      <div class="function-card">
        <div class="card-icon"></div>
        <h3>签到签退</h3>
        <p>学生通过 App 扫描二维码完成课堂签到和签退，管理员可在教学管理中查看签到记录。</p>
        <button class="btn btn-link" @click="$router.push('/teaching')">查看签到管理 →</button>
      </div>

      <div class="function-card">
        <div class="card-icon"></div>
        <h3>训练任务</h3>
        <p>学生在 App 中查看教师发布的训练任务，完成后提交进度。管理员可在训练模块查看完成情况。</p>
        <button class="btn btn-link" @click="$router.push('/training')">查看训练管理 →</button>
      </div>

      <div class="function-card">
        <div class="card-icon"></div>
        <h3>课后作业</h3>
        <p>学生通过 App 完成运动打卡（深蹲、仰卧起坐、俯卧撑等），系统自动计数和评分。</p>
        <span class="status-tag">App端功能</span>
      </div>

      <div class="function-card">
        <div class="card-icon"></div>
        <h3>阳光跑</h3>
        <p>学生通过 App 进行 GPS 跑步记录，系统自动计算距离、配速和积分。</p>
        <span class="status-tag">App端功能</span>
      </div>

      <div class="function-card">
        <div class="card-icon"></div>
        <h3>体能档案</h3>
        <p>学生的体测数据、运动记录、AI分析报告汇总在体能档案中，教师可查看和分析。</p>
        <button class="btn btn-link" @click="$router.push('/training')">查看学生档案 →</button>
      </div>

      <div class="function-card">
        <div class="card-icon"></div>
        <h3>PE积分</h3>
        <p>学生通过参加活动、早操、阳光跑等获取积分，积分可在商城兑换物品。</p>
        <span class="status-tag">App端功能</span>
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
.student-teaching { padding: 20px; }
.header { margin-bottom: 20px; }
.header h2 { margin: 0; color: #000000d9; }

.info-banner { display: flex; gap: 16px; align-items: center; background: #e6f4ff; border: 1px solid #91caff; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
.banner-icon { font-size: 32px; }
.banner-text h3 { margin: 0 0 4px; font-size: 15px; color: #1677ff; }
.banner-text p { margin: 0; font-size: 13px; color: #666; }

.function-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.function-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border: 1px solid #f0f0f0; }
.card-icon { font-size: 32px; margin-bottom: 12px; }
.function-card h3 { margin: 0 0 8px; font-size: 16px; color: #000000d9; }
.function-card p { margin: 0 0 12px; font-size: 13px; color: #666; line-height: 1.6; }

.btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-link { background: none; color: #1677ff; padding: 0; font-size: 13px; }
.btn-link:hover { text-decoration: underline; }

.status-tag { display: inline-block; padding: 2px 10px; background: #f6ffed; color: #52c41a; border-radius: 4px; font-size: 12px; }
</style>
