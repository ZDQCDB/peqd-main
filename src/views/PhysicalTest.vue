<template>
  <div class="physical-test">
    <div class="header">
      <button class="btn btn-secondary" @click="$router.push('/dashboard')">← 返回桌面</button>
      <h2>体测管理</h2>
    </div>

    <div class="content">
      <div class="card-grid">
        <div class="action-card" @click="redirectToTice">
          <div class="card-icon">🏃</div>
          <h3>体创易测平台</h3>
          <p>前往体测数据录入和管理平台</p>
          <span class="card-link">点击跳转 →</span>
        </div>

        <div class="action-card" @click="viewStudentProfiles">
          <div class="card-icon">📊</div>
          <h3>学生体能档案</h3>
          <p>查看学生体测数据和AI分析报告</p>
          <span class="card-link">查看档案 →</span>
        </div>

        <div class="action-card" @click="$router.push('/training')">
          <div class="card-icon">💪</div>
          <h3>训练任务管理</h3>
          <p>基于体测数据发布个性化训练任务</p>
          <span class="card-link">进入管理 →</span>
        </div>
      </div>

      <div class="info-section">
        <h3>📋 体测项目说明</h3>
        <div class="test-items">
          <div class="test-item"><span class="item-name">肺活量</span><span class="item-unit">ml</span></div>
          <div class="test-item"><span class="item-name">50米跑</span><span class="item-unit">秒</span></div>
          <div class="test-item"><span class="item-name">坐位体前屈</span><span class="item-unit">cm</span></div>
          <div class="test-item"><span class="item-name">立定跳远</span><span class="item-unit">cm</span></div>
          <div class="test-item"><span class="item-name">仰卧起坐</span><span class="item-unit">个/分钟</span></div>
          <div class="test-item"><span class="item-name">引体向上</span><span class="item-unit">个</span></div>
          <div class="test-item"><span class="item-name">长跑(男1000m/女800m)</span><span class="item-unit">秒</span></div>
          <div class="test-item"><span class="item-name">BMI</span><span class="item-unit">kg/m²</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhysicalTest',
  methods: {
    redirectToTice() {
      window.open('https://tice.wuhuanfeng.com/teacher/login', '_blank')
    },
    viewStudentProfiles() {
      this.$router.push('/training')
    }
  }
}
</script>

<style scoped>
.physical-test { padding: 20px; }
.header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.header h2 { margin: 0; color: #000000d9; }
.btn { padding: 8px 16px; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer; font-size: 14px; background: white; }
.btn-secondary { background: #f5f5f5; }

.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px; }
.action-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); cursor: pointer; transition: all 0.2s; border: 1px solid #f0f0f0; }
.action-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); border-color: #1677ff; }
.card-icon { font-size: 36px; margin-bottom: 12px; }
.action-card h3 { margin: 0 0 8px; font-size: 16px; color: #000000d9; }
.action-card p { margin: 0 0 12px; font-size: 13px; color: #666; line-height: 1.5; }
.card-link { color: #1677ff; font-size: 13px; font-weight: 500; }

.info-section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.info-section h3 { margin: 0 0 16px; font-size: 16px; color: #000000d9; }
.test-items { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.test-item { display: flex; justify-content: space-between; padding: 10px 16px; background: #fafafa; border-radius: 6px; }
.item-name { font-size: 14px; color: #333; }
.item-unit { font-size: 13px; color: #999; }
</style>
