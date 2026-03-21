<template>
  <div class="venue-reservation">
    <div class="header">
      <button class="btn btn-secondary" @click="$router.push('/dashboard')">← 返回桌面</button>
      <h2>场馆预约</h2>
    </div>

    <div class="info-banner">
      <div class="banner-icon">🏟️</div>
      <div class="banner-text">
        <h3>场馆预约系统</h3>
        <p>该功能正在对接学校场馆管理系统，预计近期上线。目前可通过以下方式预约场馆。</p>
      </div>
    </div>

    <div class="venue-grid">
      <div class="venue-card">
        <div class="venue-img">🏀</div>
        <h3>篮球场</h3>
        <p>室内/室外篮球场预约</p>
        <span class="status coming-soon">即将上线</span>
      </div>
      <div class="venue-card">
        <div class="venue-img">⚽</div>
        <h3>足球场</h3>
        <p>标准足球场预约</p>
        <span class="status coming-soon">即将上线</span>
      </div>
      <div class="venue-card">
        <div class="venue-img">🏸</div>
        <h3>羽毛球馆</h3>
        <p>室内羽毛球场地预约</p>
        <span class="status coming-soon">即将上线</span>
      </div>
      <div class="venue-card">
        <div class="venue-img">🏊</div>
        <h3>游泳馆</h3>
        <p>室内游泳馆预约</p>
        <span class="status coming-soon">即将上线</span>
      </div>
      <div class="venue-card">
        <div class="venue-img">🏓</div>
        <h3>乒乓球馆</h3>
        <p>乒乓球场地预约</p>
        <span class="status coming-soon">即将上线</span>
      </div>
      <div class="venue-card">
        <div class="venue-img">🎾</div>
        <h3>网球场</h3>
        <p>室外网球场预约</p>
        <span class="status coming-soon">即将上线</span>
      </div>
    </div>

    <div class="contact-info">
      <h3>📞 临时预约方式</h3>
      <p>在系统上线前，请联系体育部办公室进行场馆预约。</p>
    </div>
  </div>
</template>

<script>
export default { name: 'VenueReservation' }
</script>

<style scoped>
.venue-reservation { padding: 20px; }
.header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.header h2 { margin: 0; color: #000000d9; }
.btn { padding: 8px 16px; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer; font-size: 14px; background: white; }
.btn-secondary { background: #f5f5f5; }

.info-banner { display: flex; gap: 16px; align-items: center; background: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
.banner-icon { font-size: 32px; }
.banner-text h3 { margin: 0 0 4px; font-size: 15px; color: #d48806; }
.banner-text p { margin: 0; font-size: 13px; color: #666; }

.venue-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
.venue-card { background: white; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border: 1px solid #f0f0f0; }
.venue-img { font-size: 48px; margin-bottom: 12px; }
.venue-card h3 { margin: 0 0 4px; font-size: 16px; }
.venue-card p { margin: 0 0 12px; font-size: 13px; color: #666; }
.status { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 12px; }
.coming-soon { background: #fffbe6; color: #d48806; }

.contact-info { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.contact-info h3 { margin: 0 0 8px; font-size: 15px; }
.contact-info p { margin: 0; font-size: 13px; color: #666; }
</style>
