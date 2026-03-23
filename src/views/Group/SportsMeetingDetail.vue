<template>
  <div class="meeting-detail">
    <header class="page-header">
      <div class="header-container">
        <div class="header-left">
          <button class="back-btn" @click="$router.push('/group/sports-management')">
            <svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            返回列表
          </button>
          <div class="module-info" v-if="meeting">
            <h1 class="module-title">{{ meeting.name }}</h1>
            <p class="module-subtitle">
              <span :class="['status-badge', 'status-' + meeting.status]">{{ statusLabel(meeting.status) }}</span>
              <span v-if="meeting.startDate" style="margin-left:8px">{{ meeting.startDate }} ~ {{ meeting.endDate || '待定' }}</span>
            </p>
          </div>
        </div>
        <div class="header-actions" v-if="meeting">
          <select v-model="statusAction" @change="changeStatus" class="status-select">
            <option value="">切换状态...</option>
            <option value="draft">草稿</option>
            <option value="registration">开始报名</option>
            <option value="scheduling">编排阶段</option>
            <option value="in_progress">正式开始</option>
            <option value="completed">比赛结束</option>
            <option value="cancelled">取消</option>
          </select>
        </div>
      </div>
    </header>

    <div class="tabs-container" v-if="meeting">
      <div class="tabs-nav">
        <button v-for="tab in tabs" :key="tab.key" :class="['tab-btn', { active: activeTab === tab.key }]" @click="activeTab = tab.key">
          {{ tab.label }}
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </div>

      <div class="tab-content">
        <!-- ═══ Tab 1: 项目管理 ═══ -->
        <div v-if="activeTab === 'events'" class="tab-pane">
          <div class="tab-toolbar">
            <button class="btn-primary" @click="showEventDialog = true; editingEvent = null; eventForm = getEmptyEventForm()">添加项目</button>
            <button class="btn-secondary" @click="showPresetDialog = true">快速添加预设项目</button>
          </div>
          <div v-if="events.length === 0" class="empty-hint">暂无比赛项目，请添加</div>
          <table v-else class="data-table">
            <thead><tr>
              <th>序号</th><th>项目名称</th><th>类型</th><th>性别</th><th>每队限报</th>
              <th>日期</th><th>时间</th><th>场地</th><th>计分方式</th><th>状态</th><th>操作</th>
            </tr></thead>
            <tbody>
              <tr v-for="(ev, idx) in events" :key="ev.id">
                <td>{{ idx + 1 }}</td>
                <td><strong>{{ ev.name }}</strong><span v-if="ev.isRelay" class="relay-tag">接力</span></td>
                <td>{{ ev.eventCategory === 'track' ? '径赛' : '田赛' }}</td>
                <td>{{ genderLabel(ev.gender) }}</td>
                <td>{{ ev.maxPerTeam }}人</td>
                <td>{{ ev.eventDate || '-' }}</td>
                <td>{{ ev.eventTime || '-' }}</td>
                <td>{{ ev.venue || '-' }}</td>
                <td>{{ scoringLabel(ev.scoringType) }}</td>
                <td><span :class="['status-badge', 'status-' + ev.status]">{{ eventStatusLabel(ev.status) }}</span></td>
                <td class="action-cell">
                  <button class="btn-text-sm" @click="openEditEvent(ev)">编辑</button>
                  <button class="btn-text-sm danger" @click="removeEvent(ev)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ═══ Tab 2: 报名管理 ═══ -->
        <div v-if="activeTab === 'registration'" class="tab-pane">
          <div class="tab-toolbar">
            <button class="btn-primary" @click="downloadTemplate">下载报名模板</button>
            <label class="btn-secondary upload-btn">
              导入报名Excel
              <input type="file" accept=".xlsx,.xls" @change="importFile" style="display:none" />
            </label>
            <button class="btn-danger" @click="clearAllRegistrations" v-if="registrations.length > 0">清空报名</button>
          </div>
          <div v-if="importResult" :class="['import-feedback', importResult.errorCount > 0 ? 'has-errors' : 'all-success']">
            <p>导入完成：成功 <strong>{{ importResult.successCount }}</strong> 条，失败 <strong>{{ importResult.errorCount }}</strong> 条</p>
            <div v-if="importResult.errors && importResult.errors.length > 0" class="error-list">
              <p v-for="(err, i) in importResult.errors.slice(0, 20)" :key="i">第{{ err.row }}行：{{ err.reason }}</p>
              <p v-if="importResult.errors.length > 20">... 还有 {{ importResult.errors.length - 20 }} 条错误</p>
            </div>
          </div>
          <div class="filter-bar">
            <select v-model="regFilterEvent" @change="loadRegistrations">
              <option :value="null">全部项目</option>
              <option v-for="ev in events" :key="ev.id" :value="ev.id">{{ ev.name }}({{ genderLabel(ev.gender) }})</option>
            </select>
            <select v-model="regFilterDept" @change="loadRegistrations">
              <option value="">全部代表队</option>
              <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
            </select>
            <span class="filter-info">共 {{ registrations.length }} 条报名</span>
          </div>
          <div v-if="registrations.length === 0" class="empty-hint">暂无报名记录</div>
          <table v-else class="data-table">
            <thead><tr>
              <th>序号</th><th>姓名</th><th>学号</th><th>性别</th><th>学院(代表队)</th><th>班级</th><th>联系电话</th><th>项目</th><th>操作</th>
            </tr></thead>
            <tbody>
              <tr v-for="(r, idx) in registrations" :key="r.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ r.athleteName }}</td>
                <td>{{ r.studentNumber || '-' }}</td>
                <td>{{ r.gender === 'female' ? '女' : '男' }}</td>
                <td>{{ r.department || '-' }}</td>
                <td>{{ r.className || '-' }}</td>
                <td>{{ r.phone || '-' }}</td>
                <td>{{ getEventName(r.eventId) }}</td>
                <td><button class="btn-text-sm danger" @click="removeRegistration(r)">删除</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ═══ Tab 3: 编排管理 ═══ -->
        <div v-if="activeTab === 'schedule'" class="tab-pane">
          <div class="tab-toolbar">
            <div class="lanes-input">
              <label>每组道次/人数：</label>
              <input v-model.number="lanesPerHeat" type="number" min="2" max="20" style="width:60px" />
            </div>
            <button class="btn-primary" @click="scheduleAll">一键编排全部项目</button>
          </div>
          <div class="schedule-events">
            <div v-for="ev in events" :key="ev.id" class="schedule-event-card">
              <div class="event-card-header">
                <div>
                  <strong>{{ ev.name }}</strong>
                  <span class="event-meta">{{ ev.eventCategory === 'track' ? '径赛' : '田赛' }} | {{ genderLabel(ev.gender) }}</span>
                </div>
                <div class="event-card-actions">
                  <button class="btn-text-sm" @click="scheduleEvent(ev)">编排此项目</button>
                  <button class="btn-text-sm" @click="loadHeats(ev)" v-if="!eventHeats[ev.id]">查看分组</button>
                </div>
              </div>
              <div v-if="eventHeats[ev.id]" class="heats-container">
                <div v-if="eventHeats[ev.id].length === 0" class="empty-hint small">未编排</div>
                <div v-for="heat in eventHeats[ev.id]" :key="heat.id" class="heat-card">
                  <div class="heat-header">
                    <span>第{{ heat.heatNumber }}组 ({{ heatTypeLabel(heat.heatType) }})</span>
                    <span :class="['status-badge', 'status-' + heat.status]">{{ eventStatusLabel(heat.status) }}</span>
                  </div>
                  <div class="lanes-list">
                    <div v-for="lane in heat.lanes" :key="lane.id" class="lane-item">
                      <span class="lane-number">{{ ev.eventCategory === 'track' ? '第'+lane.laneNumber+'道' : '第'+lane.laneNumber+'位' }}</span>
                      <span class="lane-athlete">{{ lane.athleteName }}</span>
                      <span class="lane-dept">{{ lane.department || '' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ Tab 4: 成绩管理 ═══ -->
        <div v-if="activeTab === 'results'" class="tab-pane">
          <div class="tab-toolbar">
            <select v-model="selectedResultEvent" @change="loadResults">
              <option :value="null">选择项目</option>
              <option v-for="ev in events" :key="ev.id" :value="ev.id">{{ ev.name }}({{ genderLabel(ev.gender) }})</option>
            </select>
            <button class="btn-primary" v-if="selectedResultEvent" @click="calculateRankings">计算排名与积分</button>
          </div>
          <div v-if="!selectedResultEvent" class="empty-hint">请先选择比赛项目</div>
          <div v-else>
            <div class="result-entry-section">
              <h4>成绩录入</h4>
              <div class="result-entry-list">
                <div v-for="r in eventRegistrations" :key="r.id" class="result-entry-row">
                  <span class="entry-name">{{ r.athleteName }}</span>
                  <span class="entry-dept">{{ r.department || '' }}</span>
                  <input v-model="resultInputs[r.id]" :placeholder="getResultPlaceholder()" class="result-input" />
                  <select v-model="remarkInputs[r.id]" class="remark-select">
                    <option value="">正常</option>
                    <option value="DNF">DNF(未完赛)</option>
                    <option value="DQ">DQ(犯规)</option>
                    <option value="DNS">DNS(未出发)</option>
                  </select>
                </div>
              </div>
              <button class="btn-primary" @click="saveAllResults" style="margin-top:12px">保存全部成绩</button>
            </div>
            <div v-if="eventResults.length > 0" class="results-table-section">
              <h4>成绩排名</h4>
              <table class="data-table">
                <thead><tr>
                  <th>名次</th><th>姓名</th><th>学号</th><th>代表队</th><th>成绩</th><th>得分</th><th>备注</th>
                </tr></thead>
                <tbody>
                  <tr v-for="r in eventResults" :key="r.id" :class="{ 'rank-gold': r.ranking===1, 'rank-silver': r.ranking===2, 'rank-bronze': r.ranking===3 }">
                    <td><strong>{{ r.ranking || '-' }}</strong></td>
                    <td>{{ r.athleteName }}</td>
                    <td>{{ r.studentNumber || '-' }}</td>
                    <td>{{ r.department || '-' }}</td>
                    <td>{{ r.resultValue || '-' }}</td>
                    <td>{{ r.score || 0 }}</td>
                    <td>{{ r.remark || '' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ═══ Tab 5: 团体积分 ═══ -->
        <div v-if="activeTab === 'rankings'" class="tab-pane">
          <div class="tab-toolbar">
            <button class="btn-primary" @click="loadRankings">刷新排名</button>
          </div>
          <div v-if="rankings.length === 0" class="empty-hint">暂无团体积分数据</div>
          <table v-else class="data-table rankings-table">
            <thead><tr>
              <th>排名</th><th>代表队</th><th>金牌</th><th>银牌</th><th>铜牌</th><th>奖牌总数</th><th>总积分</th>
            </tr></thead>
            <tbody>
              <tr v-for="r in rankings" :key="r.department" :class="{ 'rank-first': r.rank===1, 'rank-second': r.rank===2, 'rank-third': r.rank===3 }">
                <td><strong class="rank-num">{{ r.rank }}</strong></td>
                <td><strong>{{ r.department }}</strong></td>
                <td><span class="medal gold">{{ r.gold }}</span></td>
                <td><span class="medal silver">{{ r.silver }}</span></td>
                <td><span class="medal bronze">{{ r.bronze }}</span></td>
                <td>{{ r.totalMedals }}</td>
                <td><strong class="score-total">{{ r.totalScore }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ═══ Tab 6: 计分规则 ═══ -->
        <div v-if="activeTab === 'scoreRules'" class="tab-pane">
          <div class="rules-section">
            <p class="rules-hint">设置各名次对应的积分。保存后对所有项目生效。</p>
            <div class="rules-grid">
              <div v-for="(rule, idx) in scoreRules" :key="idx" class="rule-item">
                <label>第{{ rule.ranking }}名</label>
                <input v-model.number="rule.score" type="number" min="0" />
                <span>分</span>
              </div>
            </div>
            <div class="rules-actions">
              <button class="btn-secondary" @click="resetDefaultRules">恢复默认(9-7-6-5-4-3-2-1)</button>
              <button class="btn-primary" @click="saveRules">保存计分规则</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目编辑对话框 -->
    <div v-if="showEventDialog" class="dialog-overlay" @click.self="showEventDialog = false">
      <div class="dialog-box">
        <div class="dialog-header">
          <h3>{{ editingEvent ? '编辑项目' : '添加项目' }}</h3>
          <button class="close-btn" @click="showEventDialog = false">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>项目名称 <span class="required">*</span></label>
            <input v-model="eventForm.name" placeholder="如：男子100米" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>类型</label>
              <select v-model="eventForm.eventCategory">
                <option value="track">径赛(计时)</option>
                <option value="field">田赛(计量)</option>
              </select>
            </div>
            <div class="form-group">
              <label>性别</label>
              <select v-model="eventForm.gender">
                <option value="male">男子</option>
                <option value="female">女子</option>
                <option value="mixed">混合</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>每队限报人数</label>
              <input v-model.number="eventForm.maxPerTeam" type="number" min="1" />
            </div>
            <div class="form-group">
              <label>计分方式</label>
              <select v-model="eventForm.scoringType">
                <option value="time">计时(越小越好)</option>
                <option value="distance">计距(越大越好)</option>
                <option value="height">计高(越大越好)</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>比赛日期</label>
              <input v-model="eventForm.eventDate" type="date" />
            </div>
            <div class="form-group">
              <label>比赛时间</label>
              <input v-model="eventForm.eventTime" placeholder="如 09:00" />
            </div>
          </div>
          <div class="form-group">
            <label>比赛场地</label>
            <input v-model="eventForm.venue" placeholder="如：田径场" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="eventForm.isRelay" /> 接力项目
              </label>
            </div>
            <div class="form-group" v-if="eventForm.isRelay">
              <label>接力人数</label>
              <input v-model.number="eventForm.relayMembers" type="number" min="2" />
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="showEventDialog = false">取消</button>
          <button class="btn-primary" @click="submitEvent">{{ editingEvent ? '保存' : '添加' }}</button>
        </div>
      </div>
    </div>

    <!-- 预设项目对话框 -->
    <div v-if="showPresetDialog" class="dialog-overlay" @click.self="showPresetDialog = false">
      <div class="dialog-box wide">
        <div class="dialog-header">
          <h3>快速添加预设项目</h3>
          <button class="close-btn" @click="showPresetDialog = false">&times;</button>
        </div>
        <div class="dialog-body">
          <p class="preset-hint">勾选需要的项目，批量添加到运动会中。</p>
          <div class="preset-section">
            <h4>径赛项目</h4>
            <div class="preset-grid">
              <label v-for="p in presetTrackEvents" :key="p.name" class="preset-item">
                <input type="checkbox" v-model="p.selected" /> {{ p.name }} ({{ genderLabel(p.gender) }})
              </label>
            </div>
          </div>
          <div class="preset-section">
            <h4>田赛项目</h4>
            <div class="preset-grid">
              <label v-for="p in presetFieldEvents" :key="p.name" class="preset-item">
                <input type="checkbox" v-model="p.selected" /> {{ p.name }} ({{ genderLabel(p.gender) }})
              </label>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="showPresetDialog = false">取消</button>
          <button class="btn-primary" @click="addPresetEvents">添加选中项目</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="full-loading">加载中...</div>
  </div>
</template>

<script>
import api from '@/services/api'

const TRACK_PRESETS = [
  '男子100米','女子100米','男子200米','女子200米','男子400米','女子400米',
  '男子800米','女子800米','男子1500米','女子1500米','男子5000米','女子3000米',
  '男子110米栏','女子100米栏','男子4×100米接力','女子4×100米接力','男子4×400米接力','女子4×400米接力'
]
const FIELD_PRESETS = [
  '男子跳高','女子跳高','男子跳远','女子跳远','男子三级跳远','女子三级跳远',
  '男子铅球','女子铅球','男子标枪','女子标枪','男子铁饼','女子铁饼'
]

export default {
  name: 'SportsMeetingDetail',
  data() {
    return {
      meeting: null,
      loading: true,
      activeTab: 'events',
      statusAction: '',
      events: [],
      registrations: [],
      departments: [],
      eventHeats: {},
      rankings: [],
      scoreRules: [],
      eventResults: [],
      eventRegistrations: [],
      resultInputs: {},
      remarkInputs: {},
      selectedResultEvent: null,
      regFilterEvent: null,
      regFilterDept: '',
      importResult: null,
      lanesPerHeat: 8,
      showEventDialog: false,
      showPresetDialog: false,
      editingEvent: null,
      eventForm: this.getEmptyEventForm(),
      presetTrackEvents: TRACK_PRESETS.map(name => ({
        name, selected: false,
        gender: name.startsWith('女') ? 'female' : 'male',
        isRelay: name.includes('接力'),
        relayMembers: name.includes('4×') ? 4 : 0
      })),
      presetFieldEvents: FIELD_PRESETS.map(name => ({
        name, selected: false,
        gender: name.startsWith('女') ? 'female' : 'male'
      }))
    }
  },
  computed: {
    meetingId() { return this.$route.params.id },
    tabs() {
      return [
        { key: 'events', label: '项目管理', badge: this.events.length || null },
        { key: 'registration', label: '报名管理', badge: this.registrations.length || null },
        { key: 'schedule', label: '编排管理' },
        { key: 'results', label: '成绩管理' },
        { key: 'rankings', label: '团体积分' },
        { key: 'scoreRules', label: '计分规则' }
      ]
    }
  },
  mounted() {
    this.loadMeeting()
  },
  methods: {
    getEmptyEventForm() {
      return { name: '', eventCategory: 'track', gender: 'male', maxPerTeam: 3, scoringType: 'time', eventDate: '', eventTime: '', venue: '', isRelay: false, relayMembers: 4, sortOrder: 0 }
    },

    async loadMeeting() {
      this.loading = true
      try {
        const res = await api.sportsMeeting.get(this.meetingId)
        this.meeting = res.data || res
        await this.loadEvents()
        await this.loadRegistrations()
        await this.loadScoreRules()
        await this.loadRankings()
      } catch (e) {
        alert('加载运动会信息失败：' + (e.message || ''))
        this.$router.push('/group/sports-management')
      } finally {
        this.loading = false
      }
    },

    async loadEvents() {
      try {
        const res = await api.sportsMeeting.listEvents(this.meetingId)
        this.events = res.data || res || []
      } catch (e) { console.error(e) }
    },

    async loadRegistrations() {
      try {
        const params = {}
        if (this.regFilterEvent) params.eventId = this.regFilterEvent
        if (this.regFilterDept) params.department = this.regFilterDept
        const res = await api.sportsMeeting.listRegistrations(this.meetingId, params)
        const data = res.data || res
        this.registrations = data.list || data || []
        const depts = new Set()
        this.registrations.forEach(r => { if (r.department) depts.add(r.department) })
        this.departments = [...depts].sort()
      } catch (e) { console.error(e) }
    },

    async loadScoreRules() {
      try {
        const res = await api.sportsMeeting.getScoreRules(this.meetingId)
        const data = res.data || res || []
        if (data.length > 0) {
          this.scoreRules = data.map(r => ({ ranking: r.ranking, score: r.score }))
        } else {
          this.resetDefaultRules()
        }
      } catch (e) { this.resetDefaultRules() }
    },

    async loadRankings() {
      try {
        const res = await api.sportsMeeting.getRankings(this.meetingId)
        this.rankings = res.data || res || []
      } catch (e) { console.error(e) }
    },

    async loadResults() {
      if (!this.selectedResultEvent) { this.eventResults = []; this.eventRegistrations = []; return }
      try {
        const [resResults, resRegs] = await Promise.all([
          api.sportsMeeting.getEventResults(this.selectedResultEvent),
          api.sportsMeeting.listRegistrations(this.meetingId, { eventId: this.selectedResultEvent })
        ])
        this.eventResults = resResults.data || resResults || []
        const regsData = resRegs.data || resRegs
        this.eventRegistrations = regsData.list || regsData || []
        this.resultInputs = {}
        this.remarkInputs = {}
        for (const r of this.eventRegistrations) {
          const existing = this.eventResults.find(er => er.registrationId === r.id)
          this.resultInputs[r.id] = existing ? existing.resultValue || '' : ''
          this.remarkInputs[r.id] = existing ? existing.remark || '' : ''
        }
      } catch (e) { console.error(e) }
    },

    async loadHeats(event) {
      try {
        const res = await api.sportsMeeting.getEventHeats(event.id)
        this.eventHeats = { ...this.eventHeats, [event.id]: res.data || res || [] }
      } catch (e) { console.error(e) }
    },

    async changeStatus() {
      if (!this.statusAction) return
      try {
        await api.sportsMeeting.updateStatus(this.meetingId, this.statusAction)
        this.meeting.status = this.statusAction
      } catch (e) {
        alert(e.message || '状态更新失败')
      }
      this.statusAction = ''
    },

    async submitEvent() {
      if (!this.eventForm.name) return alert('请输入项目名称')
      try {
        if (this.editingEvent) {
          await api.sportsMeeting.updateEvent(this.editingEvent.id, this.eventForm)
        } else {
          await api.sportsMeeting.createEvent(this.meetingId, this.eventForm)
        }
        this.showEventDialog = false
        await this.loadEvents()
      } catch (e) { alert(e.message || '操作失败') }
    },

    openEditEvent(ev) {
      this.editingEvent = ev
      this.eventForm = {
        name: ev.name, eventCategory: ev.eventCategory, gender: ev.gender,
        maxPerTeam: ev.maxPerTeam, scoringType: ev.scoringType,
        eventDate: ev.eventDate || '', eventTime: ev.eventTime || '',
        venue: ev.venue || '', isRelay: ev.isRelay || false,
        relayMembers: ev.relayMembers || 4, sortOrder: ev.sortOrder || 0
      }
      this.showEventDialog = true
    },

    async removeEvent(ev) {
      if (!confirm(`确定删除项目"${ev.name}"？关联的报名、分组、成绩将一并删除。`)) return
      try {
        await api.sportsMeeting.deleteEvent(ev.id)
        await this.loadEvents()
      } catch (e) { alert(e.message || '删除失败') }
    },

    async addPresetEvents() {
      const selectedTrack = this.presetTrackEvents.filter(p => p.selected)
      const selectedField = this.presetFieldEvents.filter(p => p.selected)
      const all = [
        ...selectedTrack.map((p, i) => ({
          name: p.name, eventCategory: 'track', gender: p.gender, maxPerTeam: 3,
          scoringType: 'time', isRelay: p.isRelay, relayMembers: p.relayMembers, sortOrder: i
        })),
        ...selectedField.map((p, i) => ({
          name: p.name, eventCategory: 'field', gender: p.gender, maxPerTeam: 3,
          scoringType: 'distance', isRelay: false, relayMembers: 0, sortOrder: selectedTrack.length + i
        }))
      ]
      if (all.length === 0) return alert('请至少选择一个项目')
      try {
        await api.sportsMeeting.batchCreateEvents(this.meetingId, all)
        this.showPresetDialog = false
        this.presetTrackEvents.forEach(p => p.selected = false)
        this.presetFieldEvents.forEach(p => p.selected = false)
        await this.loadEvents()
      } catch (e) { alert(e.message || '添加失败') }
    },

    async downloadTemplate() {
      try {
        const data = await api.sportsMeeting.downloadTemplate(this.meetingId)
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = '报名模板.xlsx'; a.click()
        URL.revokeObjectURL(url)
      } catch (e) { alert(e.message || '下载失败') }
    },

    async importFile(e) {
      const file = e.target.files[0]
      if (!file) return
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await api.sportsMeeting.importRegistrations(this.meetingId, formData)
        this.importResult = res.data || res
        await this.loadRegistrations()
      } catch (err) { alert(err.message || '导入失败') }
      e.target.value = ''
    },

    async removeRegistration(r) {
      if (!confirm(`确定删除${r.athleteName}的报名？`)) return
      try {
        await api.sportsMeeting.deleteRegistration(r.id)
        await this.loadRegistrations()
      } catch (e) { alert(e.message || '删除失败') }
    },

    async clearAllRegistrations() {
      if (!confirm('确定清空所有报名记录？此操作不可恢复。')) return
      try {
        await api.sportsMeeting.clearRegistrations(this.meetingId)
        await this.loadRegistrations()
        this.importResult = null
      } catch (e) { alert(e.message || '清空失败') }
    },

    async scheduleEvent(ev) {
      try {
        const res = await api.sportsMeeting.scheduleEvent(ev.id, this.lanesPerHeat)
        const data = res.data || res
        alert(`项目"${ev.name}"编排完成：${data.heatCount || 0}组`)
        await this.loadHeats(ev)
      } catch (e) { alert(e.message || '编排失败') }
    },

    async scheduleAll() {
      if (!confirm('将对所有项目进行自动编排，已有编排将被重置。确定继续？')) return
      try {
        const res = await api.sportsMeeting.scheduleAll(this.meetingId, this.lanesPerHeat)
        const data = res.data || res
        alert(`全部编排完成：${data.eventCount || 0}个项目，${data.totalHeats || 0}个组次`)
        this.eventHeats = {}
        for (const ev of this.events) { await this.loadHeats(ev) }
      } catch (e) { alert(e.message || '编排失败') }
    },

    async saveAllResults() {
      const selectedEvent = this.events.find(e => e.id === this.selectedResultEvent)
      if (!selectedEvent) return

      const batch = []
      for (const reg of this.eventRegistrations) {
        const val = this.resultInputs[reg.id]
        if (!val && !this.remarkInputs[reg.id]) continue
        const item = { registrationId: reg.id, resultValue: val || '', remark: this.remarkInputs[reg.id] || '' }
        if (selectedEvent.scoringType === 'time' && val) {
          item.resultMs = this.parseTimeToMs(val)
        } else if (val) {
          item.resultCm = this.parseDistanceToCm(val)
        }
        batch.push(item)
      }
      if (batch.length === 0) return alert('请输入至少一条成绩')
      try {
        await api.sportsMeeting.batchSaveResults(this.selectedResultEvent, batch)
        alert('保存成功')
        await this.loadResults()
      } catch (e) { alert(e.message || '保存失败') }
    },

    async calculateRankings() {
      try {
        await api.sportsMeeting.calculateRankings(this.selectedResultEvent)
        alert('排名计算完成')
        await this.loadResults()
        await this.loadRankings()
      } catch (e) { alert(e.message || '计算失败') }
    },

    resetDefaultRules() {
      this.scoreRules = [
        { ranking: 1, score: 9 }, { ranking: 2, score: 7 }, { ranking: 3, score: 6 },
        { ranking: 4, score: 5 }, { ranking: 5, score: 4 }, { ranking: 6, score: 3 },
        { ranking: 7, score: 2 }, { ranking: 8, score: 1 }
      ]
    },

    async saveRules() {
      try {
        await api.sportsMeeting.saveScoreRules(this.meetingId, this.scoreRules)
        alert('计分规则保存成功')
      } catch (e) { alert(e.message || '保存失败') }
    },

    getEventName(eventId) {
      const ev = this.events.find(e => e.id === eventId)
      return ev ? ev.name : eventId
    },

    getResultPlaceholder() {
      const ev = this.events.find(e => e.id === this.selectedResultEvent)
      if (!ev) return '成绩'
      return ev.scoringType === 'time' ? '如 11.23' : '如 5.67'
    },

    parseTimeToMs(val) {
      const num = parseFloat(val)
      if (isNaN(num)) return 0
      if (val.includes(':')) {
        const parts = val.split(':')
        return (parseInt(parts[0]) * 60 + parseFloat(parts[1])) * 1000
      }
      return Math.round(num * 1000)
    },

    parseDistanceToCm(val) {
      const num = parseFloat(val)
      return isNaN(num) ? 0 : Math.round(num * 100)
    },

    statusLabel(s) {
      const m = { draft:'草稿', registration:'报名中', scheduling:'编排中', in_progress:'进行中', completed:'已完成', cancelled:'已取消' }
      return m[s] || s
    },
    eventStatusLabel(s) {
      const m = { pending:'待开始', scheduled:'已编排', in_progress:'进行中', completed:'已完成' }
      return m[s] || s
    },
    genderLabel(g) {
      if (g === 'female') return '女子'
      if (g === 'mixed') return '混合'
      return '男子'
    },
    scoringLabel(s) {
      const m = { time:'计时', distance:'计距', height:'计高' }
      return m[s] || s
    },
    heatTypeLabel(t) {
      const m = { preliminary:'预赛', semifinal:'半决赛', final:'决赛' }
      return m[t] || t
    }
  }
}
</script>

<style scoped>
.meeting-detail { min-height: 100vh; background: var(--bg-primary, #f5f7fa); }
.page-header { background: var(--bg-card, #fff); border-bottom: 1px solid var(--border-color, #e4e7ed); padding: 16px 24px; position: sticky; top: 0; z-index: 10; }
.header-container { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.header-left { display: flex; align-items: center; gap: 16px; }
.back-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; padding: 8px 14px; cursor: pointer; font-size: 14px; color: var(--text-secondary, #606266); transition: all 0.2s; }
.back-btn:hover { border-color: var(--primary-color, #409eff); color: var(--primary-color, #409eff); }
.back-btn svg { width: 16px; height: 16px; }
.module-title { font-size: 20px; font-weight: 700; color: var(--text-primary, #303133); margin: 0; }
.module-subtitle { font-size: 13px; color: var(--text-secondary, #909399); margin: 4px 0 0; display: flex; align-items: center; }
.status-select { padding: 8px 12px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; font-size: 14px; background: var(--bg-card, #fff); cursor: pointer; }

.tabs-container { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
.tabs-nav { display: flex; gap: 4px; background: var(--bg-card, #fff); border-radius: 12px 12px 0 0; padding: 12px 16px 0; margin-top: 20px; border: 1px solid var(--border-color, #e4e7ed); border-bottom: none; overflow-x: auto; }
.tab-btn { padding: 10px 20px; border: none; background: none; font-size: 14px; font-weight: 500; color: var(--text-secondary, #606266); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
.tab-btn:hover { color: var(--primary-color, #409eff); }
.tab-btn.active { color: var(--primary-color, #409eff); border-bottom-color: var(--primary-color, #409eff); }
.tab-badge { background: var(--primary-color, #409eff); color: #fff; font-size: 11px; padding: 1px 6px; border-radius: 10px; }
.tab-content { background: var(--bg-card, #fff); border: 1px solid var(--border-color, #e4e7ed); border-top: none; border-radius: 0 0 12px 12px; min-height: 400px; }
.tab-pane { padding: 20px; }
.tab-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }

.btn-primary { display: inline-flex; align-items: center; gap: 6px; background: var(--primary-color, #409eff); color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { opacity: 0.9; }
.btn-secondary { display: inline-flex; align-items: center; gap: 6px; background: var(--bg-primary, #f5f7fa); color: var(--text-primary, #303133); border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; padding: 8px 16px; font-size: 14px; cursor: pointer; }
.btn-secondary:hover { border-color: var(--primary-color, #409eff); color: var(--primary-color, #409eff); }
.btn-danger { background: #f56c6c; color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 14px; cursor: pointer; }
.btn-danger:hover { opacity: 0.9; }
.btn-cancel { background: var(--bg-primary, #f5f7fa); border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; padding: 8px 16px; font-size: 14px; cursor: pointer; }
.btn-text-sm { background: none; border: none; font-size: 13px; color: var(--primary-color, #409eff); cursor: pointer; padding: 2px 6px; }
.btn-text-sm.danger { color: #f56c6c; }
.upload-btn { cursor: pointer; }

.empty-hint { text-align: center; padding: 40px; color: var(--text-secondary, #909399); font-size: 14px; }
.empty-hint.small { padding: 16px; font-size: 13px; }

.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { background: var(--bg-primary, #fafafa); padding: 10px 12px; text-align: left; font-weight: 600; color: var(--text-secondary, #606266); border-bottom: 1px solid var(--border-color, #ebeef5); white-space: nowrap; }
.data-table td { padding: 10px 12px; border-bottom: 1px solid var(--border-color, #f0f0f0); color: var(--text-primary, #303133); }
.data-table tbody tr:hover { background: rgba(64,158,255,0.04); }
.action-cell { white-space: nowrap; }
.relay-tag { background: #ecf5ff; color: #409eff; font-size: 11px; padding: 1px 6px; border-radius: 4px; margin-left: 6px; }

.status-badge { padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; display: inline-block; }
.status-draft { background: #f0f0f0; color: #909399; }
.status-registration { background: #fdf6ec; color: #e6a23c; }
.status-scheduling { background: #ecf5ff; color: #409eff; }
.status-in_progress, .status-scheduled { background: #f0f9eb; color: #67c23a; }
.status-completed { background: #f4f4f5; color: #909399; }
.status-cancelled { background: #fef0f0; color: #f56c6c; }
.status-pending { background: #fdf6ec; color: #e6a23c; }

.filter-bar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.filter-bar select { padding: 8px 12px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; font-size: 13px; background: var(--bg-card, #fff); }
.filter-info { font-size: 13px; color: var(--text-secondary, #909399); }

.import-feedback { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
.import-feedback.all-success { background: #f0f9eb; border: 1px solid #e1f3d8; color: #67c23a; }
.import-feedback.has-errors { background: #fdf6ec; border: 1px solid #faecd8; color: #e6a23c; }
.error-list { margin-top: 8px; max-height: 200px; overflow-y: auto; }
.error-list p { margin: 2px 0; font-size: 12px; color: #f56c6c; }

.schedule-events { display: flex; flex-direction: column; gap: 16px; }
.schedule-event-card { border: 1px solid var(--border-color, #e4e7ed); border-radius: 10px; overflow: hidden; }
.event-card-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-primary, #fafafa); }
.event-meta { font-size: 12px; color: var(--text-secondary, #909399); margin-left: 8px; }
.event-card-actions { display: flex; gap: 8px; }
.heats-container { padding: 12px 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.heat-card { border: 1px solid var(--border-color, #ebeef5); border-radius: 8px; padding: 10px; }
.heat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; font-weight: 600; }
.lanes-list { display: flex; flex-direction: column; gap: 4px; }
.lane-item { display: flex; gap: 8px; align-items: center; font-size: 13px; padding: 4px 8px; background: var(--bg-primary, #fafafa); border-radius: 4px; }
.lane-number { font-weight: 600; color: var(--primary-color, #409eff); min-width: 50px; }
.lane-athlete { font-weight: 500; }
.lane-dept { color: var(--text-secondary, #909399); font-size: 12px; }
.lanes-input { display: flex; align-items: center; gap: 6px; font-size: 14px; }
.lanes-input input { padding: 6px 8px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 6px; text-align: center; }

.result-entry-section { margin-bottom: 24px; }
.result-entry-section h4, .results-table-section h4 { margin: 0 0 12px; font-size: 15px; }
.result-entry-list { display: flex; flex-direction: column; gap: 8px; }
.result-entry-row { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: var(--bg-primary, #fafafa); border-radius: 8px; }
.entry-name { font-weight: 500; min-width: 80px; }
.entry-dept { color: var(--text-secondary, #909399); font-size: 13px; min-width: 100px; }
.result-input { padding: 6px 10px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 6px; width: 120px; font-size: 14px; }
.remark-select { padding: 6px 8px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 6px; font-size: 13px; }

.rank-gold td:first-child { color: #d4a017; }
.rank-silver td:first-child { color: #8e8e8e; }
.rank-bronze td:first-child { color: #cd7f32; }
.rank-first { background: rgba(212,160,23,0.06); }
.rank-second { background: rgba(142,142,142,0.04); }
.rank-third { background: rgba(205,127,50,0.04); }
.rankings-table .medal { display: inline-flex; width: 28px; height: 28px; align-items: center; justify-content: center; border-radius: 50%; font-weight: 700; font-size: 14px; }
.medal.gold { background: #fff7e6; color: #d4a017; }
.medal.silver { background: #f5f5f5; color: #8e8e8e; }
.medal.bronze { background: #fef3e8; color: #cd7f32; }
.rank-num { font-size: 18px; color: var(--primary-color, #409eff); }
.score-total { font-size: 16px; color: var(--primary-color, #409eff); }

.rules-section { max-width: 600px; }
.rules-hint { font-size: 13px; color: var(--text-secondary, #909399); margin-bottom: 16px; }
.rules-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
.rule-item { display: flex; align-items: center; gap: 8px; }
.rule-item label { font-size: 14px; font-weight: 500; min-width: 60px; }
.rule-item input { width: 60px; padding: 6px 8px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 6px; text-align: center; font-size: 14px; }
.rule-item span { font-size: 14px; color: var(--text-secondary, #909399); }
.rules-actions { display: flex; gap: 12px; }

.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.dialog-box { background: var(--bg-card, #fff); border-radius: 16px; width: 560px; max-width: 90vw; max-height: 85vh; overflow-y: auto; }
.dialog-box.wide { width: 720px; }
.dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0; }
.dialog-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-secondary, #909399); }
.dialog-body { padding: 20px 24px; }
.dialog-footer { padding: 16px 24px 20px; display: flex; justify-content: flex-end; gap: 12px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; font-weight: 500; color: var(--text-primary, #303133); margin-bottom: 6px; }
.required { color: #f56c6c; }
.form-group input[type="text"], .form-group input[type="date"], .form-group input[type="number"],
.form-group input:not([type="checkbox"]), .form-group textarea, .form-group select {
  width: 100%; padding: 10px 12px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px;
  font-size: 14px; background: var(--bg-primary, #fff); color: var(--text-primary, #303133); box-sizing: border-box; outline: none;
}
.form-group input:focus, .form-group select:focus { border-color: var(--primary-color, #409eff); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.preset-hint { font-size: 13px; color: var(--text-secondary, #909399); margin-bottom: 16px; }
.preset-section { margin-bottom: 20px; }
.preset-section h4 { font-size: 15px; margin: 0 0 10px; color: var(--text-primary, #303133); }
.preset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.preset-item { display: flex; align-items: center; gap: 6px; font-size: 13px; padding: 6px 10px; border: 1px solid var(--border-color, #e4e7ed); border-radius: 6px; cursor: pointer; }
.preset-item:hover { border-color: var(--primary-color, #409eff); }
.preset-item input[type="checkbox"] { margin: 0; }

.full-loading { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.8); z-index: 100; font-size: 16px; color: var(--text-secondary, #909399); }

@media (max-width: 768px) {
  .tabs-nav { overflow-x: auto; }
  .form-row { grid-template-columns: 1fr; }
  .heats-container { grid-template-columns: 1fr; }
  .rules-grid { grid-template-columns: 1fr; }
  .preset-grid { grid-template-columns: 1fr; }
}
</style>
