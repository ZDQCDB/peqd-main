<template>
  <div class="teacher-training">
    <div class="header">
      <div class="header-left">
        <button class="btn btn-secondary" @click="$router.push('/training')">← 返回训练模块</button>
        <h2>教师训练管理</h2>
      </div>
      <div class="header-right">
        <button class="btn btn-outline" @click="activeView = 'profiles'" :class="{ active: activeView === 'profiles' }">
          📊 学生档案
        </button>
        <button class="btn btn-outline" @click="activeView = 'tasks'" :class="{ active: activeView === 'tasks' }">
          📋 训练任务
        </button>
        <button class="btn btn-primary" @click="showCreateForm = true" v-if="activeView === 'tasks'">
          ➕ 布置训练任务
        </button>
      </div>
    </div>

    <!-- ==================== 学生档案视图 ==================== -->
    <div v-if="activeView === 'profiles'" class="profiles-section">
      <!-- 班级选择和搜索 -->
      <div class="filter-bar">
        <select v-model="selectedClass" @change="loadClassProfiles" class="select-input">
          <option value="">选择班级</option>
          <option v-for="c in availableClasses" :key="c" :value="c">{{ c }}</option>
        </select>
        <input v-model="profileSearchKeyword" placeholder="搜索学生姓名或学号..." class="search-input" @keyup.enter="searchStudentProfiles" />
        <button class="btn btn-primary btn-sm" @click="searchStudentProfiles">搜索</button>
      </div>

      <!-- 班级体能概览 -->
      <div v-if="classOverview" class="class-overview">
        <h3>📊 {{ classOverview.className }} 体能概览</h3>
        <div class="overview-cards">
          <div class="overview-card">
            <div class="ov-number">{{ classOverview.totalStudents }}</div>
            <div class="ov-label">总人数</div>
          </div>
          <div class="overview-card">
            <div class="ov-number">{{ classOverview.profiledStudents }}</div>
            <div class="ov-label">已建档</div>
          </div>
          <div class="overview-card" v-for="(count, level) in classOverview.fitnessLevelDistribution" :key="level">
            <div class="ov-number" :class="'level-' + level">{{ count }}</div>
            <div class="ov-label">{{ level }}级</div>
          </div>
        </div>
      </div>

      <!-- 学生档案列表 -->
      <div class="profiles-grid">
        <div v-for="profile in studentProfiles" :key="profile.id" class="profile-card" @click="showProfileDetail(profile)">
          <div class="profile-header">
            <div class="profile-name">{{ profile.realName }}</div>
            <div class="profile-level" :class="'level-' + (profile.aiFitnessLevel || 'N')">
              {{ profile.aiFitnessLevel || '未评估' }}
            </div>
          </div>
          <div class="profile-info">
            <span>{{ profile.studentId }}</span>
            <span>{{ profile.className }}</span>
          </div>
          <div class="profile-metrics">
            <div class="metric">
              <span class="metric-label">体测</span>
              <span class="metric-value">{{ profile.ticeData?.totalScore || '-' }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">跑步</span>
              <span class="metric-value">{{ profile.runData?.totalCount || 0 }}次</span>
            </div>
            <div class="metric">
              <span class="metric-label">作业</span>
              <span class="metric-value">{{ profile.homeworkData?.totalCount || 0 }}次</span>
            </div>
            <div class="metric">
              <span class="metric-label">积分</span>
              <span class="metric-value">{{ profile.pePointsData?.totalPoints || 0 }}</span>
            </div>
          </div>
          <div class="profile-tags" v-if="profile.aiStrengths && profile.aiStrengths.length">
            <span class="tag tag-green" v-for="s in profile.aiStrengths.slice(0, 2)" :key="s">{{ s }}</span>
          </div>
          <div class="profile-tags" v-if="profile.aiWeaknesses && profile.aiWeaknesses.length">
            <span class="tag tag-red" v-for="w in profile.aiWeaknesses.slice(0, 2)" :key="w">{{ w }}</span>
          </div>
        </div>
      </div>

      <div v-if="studentProfiles.length === 0 && selectedClass" class="empty-state">
        暂无学生档案数据，学生需要先上传体测数据建立档案
      </div>

      <!-- 分页 -->
      <div v-if="profilePagination.totalPages > 1" class="pagination">
        <button :disabled="profilePagination.currentPage === 0" @click="loadClassProfiles(profilePagination.currentPage - 1)">上一页</button>
        <span>{{ profilePagination.currentPage + 1 }} / {{ profilePagination.totalPages }}</span>
        <button :disabled="profilePagination.currentPage >= profilePagination.totalPages - 1" @click="loadClassProfiles(profilePagination.currentPage + 1)">下一页</button>
      </div>
    </div>

    <!-- ==================== 训练任务视图 ==================== -->
    <div v-if="activeView === 'tasks'" class="tasks-section">
      <!-- 统计概览 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ taskStats.totalTasks || 0 }}</div>
          <div class="stat-label">总任务数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ taskStats.activeTasks || 0 }}</div>
          <div class="stat-label">进行中</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ taskStats.completedTasks || 0 }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>

      <!-- 筛选 -->
      <div class="filter-tabs">
        <button v-for="tab in statusTabs" :key="tab.value"
                :class="['tab', { active: activeTab === tab.value }]"
                @click="activeTab = tab.value; loadTasks()">
          {{ tab.label }}
        </button>
      </div>

      <!-- 任务列表 -->
      <div class="tasks-grid">
        <div v-for="task in tasks" :key="task.id" class="task-card" :class="'status-' + task.status">
          <div class="task-header">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-type" :class="task.trainingType">{{ getTypeLabel(task.trainingType) }}</div>
          </div>
          <div class="task-meta">
            <span>📅 {{ task.startDate }} ~ {{ task.endDate }}</span>
            <span>📊 {{ getDifficultyLabel(task.difficulty) }}</span>
            <span>👥 {{ task.targetClasses?.join(', ') }}</span>
          </div>
          <div class="task-description">{{ task.description }}</div>
          <div class="task-progress">
            <div class="progress-info">
              <span>完成进度</span>
              <span>{{ task.completedStudents }}/{{ task.totalStudents }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: task.completionRate + '%' }"></div>
            </div>
          </div>
          <div v-if="task.aiReference" class="ai-badge">🤖 AI参考</div>
          <div class="task-actions">
            <button class="btn btn-small btn-outline" @click="viewTaskDetail(task)">查看详情</button>
            <button class="btn btn-small btn-danger" @click="deleteTask(task)">删除</button>
          </div>
        </div>
      </div>

      <div v-if="tasks.length === 0" class="empty-state">暂无训练任务</div>

      <!-- 分页 -->
      <div v-if="taskPagination.totalPages > 1" class="pagination">
        <button :disabled="taskPagination.currentPage === 0" @click="loadTasks(taskPagination.currentPage - 1)">上一页</button>
        <span>{{ taskPagination.currentPage + 1 }} / {{ taskPagination.totalPages }}</span>
        <button :disabled="taskPagination.currentPage >= taskPagination.totalPages - 1" @click="loadTasks(taskPagination.currentPage + 1)">下一页</button>
      </div>
    </div>

    <!-- ==================== 创建任务弹窗 ==================== -->
    <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>新建训练任务</h3>
          <button class="close-btn" @click="showCreateForm = false">✕</button>
        </div>
        <form class="create-form" @submit.prevent="createTask">
          <div class="form-group">
            <label>任务标题 *</label>
            <input type="text" v-model="newTask.title" placeholder="请输入训练任务标题" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>训练类型 *</label>
              <select v-model="newTask.trainingType" required>
                <option value="endurance">耐力训练</option>
                <option value="strength">力量训练</option>
                <option value="flexibility">柔韧训练</option>
                <option value="skill">技能训练</option>
                <option value="comprehensive">综合训练</option>
              </select>
            </div>
            <div class="form-group">
              <label>难度等级</label>
              <select v-model="newTask.difficulty">
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>开始日期 *</label>
              <input type="date" v-model="newTask.startDate" required />
            </div>
            <div class="form-group">
              <label>截止日期 *</label>
              <input type="date" v-model="newTask.endDate" required />
            </div>
          </div>
          <div class="form-group">
            <label>任务描述</label>
            <textarea v-model="newTask.description" placeholder="请详细描述训练任务内容和要求" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>目标班级 *</label>
            <div class="class-selector">
              <label v-for="c in availableClasses" :key="c" class="checkbox-label">
                <input type="checkbox" :value="c" v-model="newTask.targetClasses" />
                <span>{{ c }}</span>
              </label>
            </div>
            <div v-if="availableClasses.length === 0" class="hint">暂无可选班级，需要学生先建立体能档案</div>
          </div>

          <!-- AI参考建议 -->
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="newTask.useAiReference" />
              🤖 获取AI训练建议（基于学生体能档案）
            </label>
          </div>
          <div v-if="aiSuggestion" class="ai-suggestion-box">
            <h4>🤖 AI训练建议</h4>
            <pre>{{ aiSuggestion }}</pre>
          </div>
          <button v-if="newTask.useAiReference && newTask.targetClasses.length > 0 && !aiSuggestion"
                  type="button" class="btn btn-outline btn-sm" @click="fetchAiSuggestion" :disabled="aiLoading">
            {{ aiLoading ? '分析中...' : '获取AI建议' }}
          </button>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateForm = false">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              {{ creating ? '发布中...' : '发布任务' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ==================== 档案详情弹窗 ==================== -->
    <div v-if="selectedProfile" class="modal-overlay" @click.self="selectedProfile = null">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>{{ selectedProfile.realName }} 的体能档案</h3>
          <button class="close-btn" @click="selectedProfile = null">✕</button>
        </div>
        <div class="profile-detail">
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-grid">
              <div><span class="label">学号：</span>{{ selectedProfile.studentId }}</div>
              <div><span class="label">班级：</span>{{ selectedProfile.className }}</div>
              <div><span class="label">体能等级：</span>
                <span class="level-badge" :class="'level-' + (selectedProfile.aiFitnessLevel || 'N')">
                  {{ selectedProfile.aiFitnessLevel || '未评估' }}
                </span>
              </div>
            </div>
          </div>
          <div class="detail-section" v-if="selectedProfile.ticeData">
            <h4>📋 体测数据</h4>
            <div class="detail-grid">
              <div><span class="label">肺活量：</span>{{ selectedProfile.ticeData.vitalCapacity || '-' }} ml</div>
              <div><span class="label">坐位体前屈：</span>{{ selectedProfile.ticeData.sitAndReach || '-' }} cm</div>
              <div><span class="label">立定跳远：</span>{{ selectedProfile.ticeData.standingLongJump || '-' }} cm</div>
              <div><span class="label">仰卧起坐：</span>{{ selectedProfile.ticeData.sitUps || '-' }} 个/分钟</div>
              <div><span class="label">50米跑：</span>{{ selectedProfile.ticeData.sprint50m || '-' }} 秒</div>
              <div><span class="label">长跑：</span>{{ selectedProfile.ticeData.longRun ? formatLongRun(selectedProfile.ticeData.longRun) : '-' }}</div>
              <div><span class="label">引体向上：</span>{{ selectedProfile.ticeData.pullUps || '-' }} 个</div>
              <div><span class="label">BMI：</span>{{ selectedProfile.ticeData.bmi || '-' }}</div>
              <div><span class="label">总分：</span>{{ selectedProfile.ticeData.totalScore || '-' }}</div>
              <div><span class="label">等级：</span>{{ selectedProfile.ticeData.grade || '-' }}</div>
            </div>
          </div>
          <div class="detail-section">
            <h4>🏃 阳光跑数据</h4>
            <div class="detail-grid">
              <div><span class="label">跑步次数：</span>{{ selectedProfile.runData?.totalCount || 0 }} 次</div>
              <div><span class="label">总距离：</span>{{ formatDistance(selectedProfile.runData?.totalDistance) }}</div>
              <div><span class="label">平均配速：</span>{{ selectedProfile.runData?.avgPace ? selectedProfile.runData.avgPace.toFixed(1) + ' min/km' : '-' }}</div>
              <div><span class="label">最佳配速：</span>{{ selectedProfile.runData?.bestPace ? selectedProfile.runData.bestPace.toFixed(1) + ' min/km' : '-' }}</div>
            </div>
          </div>
          <div class="detail-section">
            <h4>📝 课后作业</h4>
            <div class="detail-grid">
              <div><span class="label">完成次数：</span>{{ selectedProfile.homeworkData?.totalCount || 0 }} 次</div>
              <div><span class="label">深蹲最佳：</span>{{ selectedProfile.homeworkData?.squatBest || '-' }} 个</div>
              <div><span class="label">仰卧起坐最佳：</span>{{ selectedProfile.homeworkData?.situpBest || '-' }} 个</div>
              <div><span class="label">俯卧撑最佳：</span>{{ selectedProfile.homeworkData?.pushupBest || '-' }} 个</div>
              <div><span class="label">引体向上最佳：</span>{{ selectedProfile.homeworkData?.pullupBest || '-' }} 个</div>
              <div><span class="label">跳绳最佳：</span>{{ selectedProfile.homeworkData?.jumpropeBest || '-' }} 个</div>
            </div>
          </div>
          <div class="detail-section" v-if="selectedProfile.aiRecommendation">
            <h4>🤖 AI训练建议</h4>
            <div class="ai-recommendation">
              <div v-if="selectedProfile.aiStrengths?.length" class="rec-section">
                <strong>优势：</strong>
                <span class="tag tag-green" v-for="s in selectedProfile.aiStrengths" :key="s">{{ s }}</span>
              </div>
              <div v-if="selectedProfile.aiWeaknesses?.length" class="rec-section">
                <strong>薄弱：</strong>
                <span class="tag tag-red" v-for="w in selectedProfile.aiWeaknesses" :key="w">{{ w }}</span>
              </div>
              <pre class="rec-text">{{ selectedProfile.aiRecommendation }}</pre>
            </div>
            <button class="btn btn-outline btn-sm" @click="reAnalyze(selectedProfile.userId)" :disabled="analyzing">
              {{ analyzing ? '分析中...' : '🔄 重新分析' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api'

export default {
  name: 'TeacherTraining',
  data() {
    return {
      activeView: 'tasks',
      // 档案相关
      availableClasses: [],
      selectedClass: '',
      profileSearchKeyword: '',
      studentProfiles: [],
      classOverview: null,
      selectedProfile: null,
      analyzing: false,
      profilePagination: { currentPage: 0, totalPages: 0, totalElements: 0 },
      // 任务相关
      showCreateForm: false,
      creating: false,
      activeTab: 'all',
      tasks: [],
      taskStats: {},
      taskPagination: { currentPage: 0, totalPages: 0, totalElements: 0 },
      statusTabs: [
        { value: 'all', label: '全部' },
        { value: 'active', label: '进行中' },
        { value: 'completed', label: '已完成' },
        { value: 'cancelled', label: '已取消' }
      ],
      newTask: {
        title: '', trainingType: 'endurance', difficulty: 'medium',
        startDate: '', endDate: '', description: '',
        targetClasses: [], useAiReference: false
      },
      aiSuggestion: '',
      aiLoading: false
    }
  },
  async mounted() {
    await this.loadAvailableClasses()
    await this.loadTasks()
    await this.loadTaskStats()
  },
  methods: {
    async loadAvailableClasses() {
      try {
        const res = await api.training.getAvailableClasses()
        this.availableClasses = res.data?.data || []
      } catch (e) { console.error('加载班级列表失败', e) }
    },
    async loadClassProfiles(page = 0) {
      if (!this.selectedClass) return
      try {
        const res = await api.training.getClassProfiles({ className: this.selectedClass, page, size: 12 })
        const data = res.data?.data || {}
        this.studentProfiles = data.content || []
        this.profilePagination = { currentPage: data.currentPage || 0, totalPages: data.totalPages || 0, totalElements: data.totalElements || 0 }
        // 加载班级概览
        const ovRes = await api.training.getClassOverview(this.selectedClass)
        this.classOverview = ovRes.data?.data || null
      } catch (e) { console.error('加载档案失败', e) }
    },
    async searchStudentProfiles() {
      if (!this.profileSearchKeyword) return
      try {
        const res = await api.training.searchProfiles({ keyword: this.profileSearchKeyword, className: this.selectedClass || null, page: 0, size: 20 })
        const data = res.data?.data || {}
        this.studentProfiles = data.content || []
      } catch (e) { console.error('搜索失败', e) }
    },
    showProfileDetail(profile) { this.selectedProfile = profile },
    async reAnalyze(userId) {
      this.analyzing = true
      try {
        const res = await api.training.triggerAiAnalysis(userId)
        this.selectedProfile = res.data?.data || this.selectedProfile
        await this.loadClassProfiles(this.profilePagination.currentPage)
      } catch (e) { console.error('分析失败', e) }
      this.analyzing = false
    },
    async loadTasks(page = 0) {
      try {
        const params = { page, size: 10 }
        if (this.activeTab !== 'all') params.status = this.activeTab
        const res = await api.training.getTasks(params)
        const data = res.data?.data || {}
        this.tasks = data.content || []
        this.taskPagination = { currentPage: data.currentPage || 0, totalPages: data.totalPages || 0 }
      } catch (e) { console.error('加载任务失败', e) }
    },
    async loadTaskStats() {
      try {
        const res = await api.training.getStats()
        this.taskStats = res.data?.data || {}
      } catch (e) { console.error('加载统计失败', e) }
    },
    async createTask() {
      if (!this.newTask.title || !this.newTask.startDate || !this.newTask.endDate || !this.newTask.targetClasses.length) {
        alert('请填写必填项'); return
      }
      this.creating = true
      try {
        await api.training.createTask(this.newTask)
        this.showCreateForm = false
        this.resetForm()
        await this.loadTasks()
        await this.loadTaskStats()
        alert('训练任务发布成功！')
      } catch (e) { alert('发布失败：' + (e.response?.data?.message || e.message)) }
      this.creating = false
    },
    async fetchAiSuggestion() {
      this.aiLoading = true
      try {
        const res = await api.training.getAiSuggestion({
          targetClasses: this.newTask.targetClasses,
          trainingType: this.newTask.trainingType
        })
        this.aiSuggestion = res.data?.data || '暂无建议'
      } catch (e) { this.aiSuggestion = '获取建议失败' }
      this.aiLoading = false
    },
    async deleteTask(task) {
      if (!confirm(`确定要删除任务"${task.title}"吗？`)) return
      try {
        await api.training.deleteTask(task.id)
        await this.loadTasks()
        await this.loadTaskStats()
      } catch (e) { alert('删除失败') }
    },
    viewTaskDetail(task) { alert(`任务详情：${task.title}\n\n${task.description || '无描述'}`) },
    resetForm() {
      this.newTask = { title: '', trainingType: 'endurance', difficulty: 'medium', startDate: '', endDate: '', description: '', targetClasses: [], useAiReference: false }
      this.aiSuggestion = ''
    },
    getTypeLabel(type) {
      return { endurance: '耐力', strength: '力量', flexibility: '柔韧', skill: '技能', comprehensive: '综合' }[type] || type
    },
    getDifficultyLabel(d) {
      return { easy: '简单', medium: '中等', hard: '困难' }[d] || d
    },
    formatDistance(meters) {
      if (!meters) return '-'
      return (meters / 1000).toFixed(1) + ' km'
    },
    formatLongRun(seconds) {
      if (!seconds) return '-'
      const min = Math.floor(seconds / 60)
      const sec = seconds % 60
      return `${min}'${sec < 10 ? '0' : ''}${sec}"`
    }
  }
}
</script>

<style scoped>
.teacher-training { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-left h2 { margin: 0; color: #000000d9; }
.header-right { display: flex; gap: 8px; align-items: center; }

.btn { padding: 8px 16px; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s; background: white; }
.btn-primary { background: #1677ff; color: white; border-color: #1677ff; }
.btn-secondary { background: #f5f5f5; }
.btn-outline { background: white; border-color: #d9d9d9; }
.btn-outline.active { border-color: #1677ff; color: #1677ff; background: #e6f4ff; }
.btn-danger { background: #ff4d4f; color: white; border-color: #ff4d4f; }
.btn-sm { padding: 4px 12px; font-size: 12px; }
.btn-small { padding: 4px 10px; font-size: 12px; }
.btn:hover { opacity: 0.85; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 筛选栏 */
.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }
.select-input, .search-input { padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px; }
.select-input { min-width: 180px; }
.search-input { flex: 1; max-width: 300px; }

/* 班级概览 */
.class-overview { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.class-overview h3 { margin: 0 0 16px; font-size: 16px; }
.overview-cards { display: flex; gap: 16px; flex-wrap: wrap; }
.overview-card { background: #f8f9fa; border-radius: 8px; padding: 16px 24px; text-align: center; min-width: 80px; }
.ov-number { font-size: 24px; font-weight: 700; color: #1677ff; }
.ov-label { font-size: 12px; color: #666; margin-top: 4px; }

/* 档案卡片 */
.profiles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.profile-card { background: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); cursor: pointer; transition: all 0.2s; border: 1px solid #f0f0f0; }
.profile-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); transform: translateY(-2px); }
.profile-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.profile-name { font-size: 16px; font-weight: 600; }
.profile-level { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; }
.level-A { background: #f6ffed; color: #52c41a; }
.level-B { background: #e6f4ff; color: #1677ff; }
.level-C { background: #fffbe6; color: #faad14; }
.level-D { background: #fff2e8; color: #fa8c16; }
.level-E { background: #fff1f0; color: #ff4d4f; }
.level-N { background: #f5f5f5; color: #999; }
.profile-info { font-size: 12px; color: #999; margin-bottom: 12px; display: flex; gap: 12px; }
.profile-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 8px; }
.metric { text-align: center; }
.metric-label { display: block; font-size: 11px; color: #999; }
.metric-value { display: block; font-size: 14px; font-weight: 600; color: #333; }
.profile-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
.tag { padding: 2px 6px; border-radius: 3px; font-size: 11px; }
.tag-green { background: #f6ffed; color: #52c41a; }
.tag-red { background: #fff1f0; color: #ff4d4f; }

/* 统计卡片 */
.stats-grid { display: flex; gap: 16px; margin-bottom: 20px; }
.stat-card { background: white; border-radius: 8px; padding: 20px; flex: 1; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.stat-number { font-size: 28px; font-weight: 700; color: #1677ff; }
.stat-label { font-size: 13px; color: #666; margin-top: 4px; }

/* 筛选标签 */
.filter-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
.tab { padding: 6px 16px; border: 1px solid #d9d9d9; border-radius: 20px; background: white; cursor: pointer; font-size: 13px; transition: all 0.2s; }
.tab.active { background: #1677ff; color: white; border-color: #1677ff; }

/* 任务卡片 */
.tasks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
.task-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border-left: 4px solid #1677ff; }
.task-card.status-completed { border-left-color: #52c41a; }
.task-card.status-cancelled { border-left-color: #d9d9d9; opacity: 0.7; }
.task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.task-title { font-size: 16px; font-weight: 600; }
.task-type { padding: 2px 8px; border-radius: 4px; font-size: 12px; background: #e6f4ff; color: #1677ff; }
.task-type.strength { background: #fff2e8; color: #fa8c16; }
.task-type.flexibility { background: #f6ffed; color: #52c41a; }
.task-type.skill { background: #f9f0ff; color: #722ed1; }
.task-type.comprehensive { background: #e6fffb; color: #13c2c2; }
.task-meta { font-size: 12px; color: #999; display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
.task-description { font-size: 13px; color: #666; margin-bottom: 12px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.task-progress { margin-bottom: 12px; }
.progress-info { display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 4px; }
.progress-bar { height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: #1677ff; border-radius: 3px; transition: width 0.3s; }
.ai-badge { display: inline-block; padding: 2px 8px; background: #f0f5ff; color: #2f54eb; border-radius: 4px; font-size: 11px; margin-bottom: 8px; }
.task-actions { display: flex; gap: 8px; }

/* 弹窗 */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; }
.modal-large { max-width: 800px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { margin: 0; }
.close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #999; }

/* 表单 */
.create-form .form-group { margin-bottom: 16px; }
.create-form label { display: block; font-size: 13px; color: #333; margin-bottom: 6px; font-weight: 500; }
.create-form input[type="text"], .create-form input[type="date"], .create-form select, .create-form textarea {
  width: 100%; padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 14px; box-sizing: border-box;
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.class-selector { display: flex; flex-wrap: wrap; gap: 8px; }
.checkbox-label { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: #f5f5f5; border-radius: 4px; font-size: 13px; cursor: pointer; }
.checkbox-label input:checked + span { color: #1677ff; font-weight: 600; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.hint { font-size: 12px; color: #999; margin-top: 4px; }

/* AI建议 */
.ai-suggestion-box { background: #f0f5ff; border: 1px solid #d6e4ff; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.ai-suggestion-box h4 { margin: 0 0 8px; font-size: 14px; color: #2f54eb; }
.ai-suggestion-box pre { white-space: pre-wrap; font-size: 13px; color: #333; margin: 0; font-family: inherit; line-height: 1.6; }

/* 档案详情 */
.detail-section { margin-bottom: 20px; }
.detail-section h4 { margin: 0 0 12px; font-size: 15px; color: #333; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; }
.detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.detail-grid .label { color: #999; font-size: 13px; }
.level-badge { padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 13px; }
.ai-recommendation { background: #f8f9fa; border-radius: 8px; padding: 16px; }
.rec-section { margin-bottom: 8px; }
.rec-text { white-space: pre-wrap; font-size: 13px; color: #333; margin: 8px 0 0; font-family: inherit; line-height: 1.6; }

/* 通用 */
.empty-state { text-align: center; padding: 60px 20px; color: #999; font-size: 14px; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; }
.pagination button { padding: 6px 16px; border: 1px solid #d9d9d9; border-radius: 4px; background: white; cursor: pointer; }
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
