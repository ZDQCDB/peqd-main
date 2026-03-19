<template>
  <div class="module-page" @click="redirectToTice" style="cursor: pointer;">
    <div class="module-header">
      <button class="btn btn-primary" @click.stop="$router.push('/dashboard')">← 返回桌面</button>
      <h1>体测模块</h1>
    </div>
    
    <div class="container">
      <div class="under-construction">
        <h2>功能建设中</h2>
        <p>体质测试管理和结果查询功能正在开发中，敬请期待...</p>
        <p style="color: #1677ff; margin-top: 20px;">点击页面将自动跳转到体测平台</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhysicalTest',
  methods: {
    redirectToTice() {
      window.location.href = 'https://tice.wuhuanfeng.com/teacher/login'
    }
  },
  mounted() {
    // 进入页面后自动跳转
    this.redirectToTice()
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
</style> 