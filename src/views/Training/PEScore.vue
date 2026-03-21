<template>
  <div class="pe-score">
    <div class="header">
      <button class="btn btn-secondary" @click="$router.push('/training')">← 返回训练模块</button>
      <h2>PE成绩管理</h2>
    </div>

    <!-- 统计概览 -->
    <div class="stats-row">
      <div class="stat-card"><div class="stat-num">{{ schoolStats.totalStudents || 0 }}</div><div class="stat-label">学生总数</div></div>
      <div class="stat-card"><div class="stat-num text-blue">{{ schoolStats.avgPoints || 0 }}</div><div class="stat-label">平均积分</div></div>
      <div class="stat-card"><div class="stat-num text-green">{{ schoolStats.reachedTarget || 0 }}</div><div class="stat-label">达标人数</div></div>
      <div class="stat-card"><div class="stat-num text-orange">{{ schoolStats.targetRate || 0 }}%</div><div class="stat-label">达标率</div></div>
    </div>

    <!-- Tab切换 -->
    <div class="tab-bar">
      <button v-for="tab in tabs" :key="tab.key" :class="['tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">
        {{ tab.label }}
      </button>
    </div>

    <!-- 比赛成绩 -->
    <div v-if="activeTab === 'race'" class="section">
      <div class="filter-bar">
        <input v-model="raceSearch" placeholder="搜索学生姓名/学号..." class="search-input" @input="debouncedLoadRace" />
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>学号</th><th>姓名</th><th>项目</th><th>成绩</th><th>名次</th><th>比赛日期</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in raceResults" :key="r.id">
              <td>{{ r.studentId }}</td>
              <td>{{ r.studentName }}</td>
              <td>{{ r.eventName }}</td>
              <td class="text-bold">{{ r.result }}</td>
              <td>{{ r.ranking || '-' }}</td>
              <td>{{ r.raceDate }}</td>
              <td><button class="btn btn-small btn-danger" @click="deleteRaceResult(r.id)">删除</button></td>
            </tr>
          </tbody>
        </table>
        <div v-if="raceResults.length === 0" class="empty">暂无比赛成绩数据</div>
      </div>
    </div>

    <!-- PE积分 -->
    <div v-if="activeTab === 'points'" class="section">
      <div class="college-stats" v-if="collegeStats.length > 0">
        <h3>院系积分统计</h3>
        <div class="college-grid">
          <div v-for="cs in collegeStats" :key="cs.collegeName" class="college-card">
            <div class="college-name">{{ cs.collegeName }}</div>
            <div class="college-data">
              <span>学生数: {{ cs.studentCount }}</span>
              <span>平均积分: {{ cs.avgPoints }}</span>
              <span>达标率: {{ cs.targetRate }}%</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty">暂无院系统计数据</div>
    </div>

    <!-- 积分指标设置 -->
    <div v-if="activeTab === 'targets'" class="section">
      <div class="targets-form">
        <h3>PE积分达标指标设置</h3>
        <div class="form-row">
          <label>活动积分达标线</label>
          <input type="number" v-model.number="targets.activityTarget" class="form-input" />
        </div>
        <div class="form-row">
          <label>早操积分达标线</label>
          <input type="number" v-model.number="targets.morningTarget" class="form-input" />
        </div>
        <div class="form-row">
          <label>总积分达标线</label>
          <input type="number" v-model.number="targets.totalTarget" class="form-input" />
        </div>
        <button class="btn btn-primary" @click="saveTargets">保存设置</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'PEScore',
  data() {
    return {
      activeTab: 'race',
      tabs: [
        { key: 'race', label: '比赛成绩' },
        { key: 'points', label: 'PE积分统计' },
        { key: 'targets', label: '指标设置' }
      ],
      schoolStats: {},
      raceResults: [],
      raceSearch: '',
      collegeStats: [],
      targets: { activityTarget: 0, morningTarget: 0, totalTarget: 0 },
      debounceTimer: null
    }
  },
  async mounted() {
    await this.loadSchoolStats()
    await this.loadRaceResults()
    await this.loadCollegeStats()
  },
  methods: {
    async loadSchoolStats() {
      try {
        const res = await api.peStatistics.getSchoolStatistics()
        this.schoolStats = res.data || res || {}
      } catch (e) { console.error('加载统计失败', e) }
    },
    async loadRaceResults() {
      try {
        const params = { page: 1, pageSize: 50 }
        if (this.raceSearch) params.keyword = this.raceSearch
        const res = await api.raceResults.getList(params)
        this.raceResults = res.data?.list || res.data?.content || res.list || []
      } catch (e) { console.error('加载比赛成绩失败', e) }
    },
    debouncedLoadRace() {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => this.loadRaceResults(), 300)
    },
    async loadCollegeStats() {
      try {
        const res = await api.peStatistics.getCollegeStatistics()
        this.collegeStats = res.data || res || []
      } catch (e) { console.error('加载院系统计失败', e) }
    },
    async deleteRaceResult(id) {
      if (!confirm('确定删除该成绩记录？')) return
      try {
        await api.raceResults.deleteOne(id)
        await this.loadRaceResults()
      } catch (e) { alert('删除失败') }
    },
    async saveTargets() {
      try {
        await api.peStatistics.setTargets(this.targets)
        alert('保存成功')
      } catch (e) { alert('保存失败') }
    }
  }
}
</script>

<style scoped>
.pe-score { padding: 20px; }
.header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.header h2 { margin: 0; color: #000000d9; }
.btn { padding: 8px 16px; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer; font-size: 14px; background: white; }
.btn-secondary { background: #f5f5f5; }
.btn-primary { background: #1677ff; color: white; border-color: #1677ff; }
.btn-small { padding: 4px 10px; font-size: 12px; }
.btn-danger { color: #ff4d4f; border-color: #ff4d4f; }

.stats-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.stat-card { background: white; border-radius: 8px; padding: 20px; flex: 1; min-width: 140px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.stat-num { font-size: 28px; font-weight: 700; color: #333; }
.stat-label { font-size: 13px; color: #666; margin-top: 4px; }
.text-blue { color: #1677ff; }
.text-green { color: #52c41a; }
.text-orange { color: #fa8c16; }
.text-bold { font-weight: 600; }

.tab-bar { display: flex; gap: 8px; margin-bottom: 20px; }
.tab { padding: 8px 20px; border: 1px solid #d9d9d9; border-radius: 20px; background: white; cursor: pointer; font-size: 14px; }
.tab.active { background: #1677ff; color: white; border-color: #1677ff; }

.filter-bar { margin-bottom: 16px; }
.search-input { padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px; width: 300px; }

.table-wrap { background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #fafafa; padding: 12px 16px; text-align: left; font-size: 13px; color: #666; border-bottom: 1px solid #f0f0f0; }
.data-table td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #f5f5f5; }
.data-table tr:hover { background: #fafafa; }

.college-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.college-card { background: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.college-name { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
.college-data { display: flex; gap: 16px; font-size: 13px; color: #666; }

.targets-form { background: white; border-radius: 8px; padding: 24px; max-width: 500px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.targets-form h3 { margin: 0 0 20px; }
.form-row { margin-bottom: 16px; }
.form-row label { display: block; font-size: 14px; color: #333; margin-bottom: 6px; }
.form-input { width: 100%; padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px; }

.empty { text-align: center; padding: 60px 20px; color: #999; }
</style>
