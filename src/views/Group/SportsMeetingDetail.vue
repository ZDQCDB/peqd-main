<template>
  <div class="meeting-detail">
    <!-- ═══ Toast 通知 ═══ -->
    <transition-group name="toast-slide" tag="div" class="toast-container">
      <div v-for="t in toasts" :key="t.id" :class="['toast', 'toast-' + t.type]">
        <span class="toast-icon">{{ t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warning' ? '!' : 'i' }}</span>
        <span class="toast-msg">{{ t.message }}</span>
        <button class="toast-close" @click="removeToast(t.id)">&times;</button>
      </div>
    </transition-group>

    <!-- ═══ 自定义确认弹窗 ═══ -->
    <transition name="dialog-fade">
      <div v-if="confirmDialog.visible" class="dialog-overlay" @click.self="cancelConfirm">
        <div class="dialog-box confirm-dialog" :class="{ 'confirm-danger': confirmDialog.danger }">
          <div class="dialog-header">
            <h3>{{ confirmDialog.title }}</h3>
          </div>
          <div class="dialog-body">
            <p class="confirm-message">{{ confirmDialog.message }}</p>
          </div>
          <div class="dialog-footer">
            <button class="btn-cancel" @click="cancelConfirm">取消</button>
            <button :class="confirmDialog.danger ? 'btn-danger' : 'btn-primary'" @click="doConfirm">
              {{ confirmDialog.confirmText || '确定' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══ 页面头部 ═══ -->
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
              <span v-if="meeting.startDate" class="header-date">{{ meeting.startDate }} ~ {{ meeting.endDate || '待定' }}</span>
              <span v-if="meeting.location" class="header-location">{{ meeting.location }}</span>
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

    <div v-if="meeting" class="main-area">
      <!-- ═══ 流程引导横幅 ═══ -->
      <div v-if="guidanceTip" class="guidance-banner" @click="guidanceTip.action && guidanceTip.action()">
        <span class="guidance-icon"></span>
        <span class="guidance-text">{{ guidanceTip.text }}</span>
        <span v-if="guidanceTip.actionLabel" class="guidance-action">{{ guidanceTip.actionLabel }} →</span>
      </div>

      <!-- ═══ 概览统计卡片 ═══ -->
      <div class="overview-stats">
        <div class="ov-card"><span class="ov-num">{{ events.length }}</span><span class="ov-label">比赛项目</span></div>
        <div class="ov-card"><span class="ov-num">{{ registrations.length }}</span><span class="ov-label">报名人次</span></div>
        <div class="ov-card"><span class="ov-num">{{ scheduledEventCount }}</span><span class="ov-label">已编排</span></div>
        <div class="ov-card"><span class="ov-num">{{ completedEventCount }}</span><span class="ov-label">已完成</span></div>
      </div>

      <!-- ═══ Tabs ═══ -->
      <div class="tabs-container">
        <div class="tabs-nav">
          <button v-for="tab in tabs" :key="tab.key" :class="['tab-btn', { active: activeTab === tab.key }]" @click="switchTab(tab.key)">
            {{ tab.label }}
            <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
          </button>
        </div>

        <div class="tab-content">
          <transition name="tab-fade" mode="out-in">
            <div :key="activeTab" class="tab-pane-wrapper">
            <!-- ═══ Tab 1: 项目管理 ═══ -->
            <div v-if="activeTab === 'events'" class="tab-pane">
              <div class="tab-toolbar">
                <button class="btn-primary" @click="showEventDialog = true; editingEvent = null; eventForm = getEmptyEventForm()">
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                  添加项目
                </button>
                <button class="btn-secondary" @click="showPresetDialog = true">快速添加预设项目</button>
              </div>

              <div v-if="events.length === 0" class="empty-state-card">
                <div class="empty-icon"></div>
                <p>暂无比赛项目</p>
                <div class="empty-actions">
                  <button class="btn-primary" @click="showEventDialog = true; editingEvent = null; eventForm = getEmptyEventForm()">手动添加项目</button>
                  <button class="btn-secondary" @click="showPresetDialog = true">从预设模板添加</button>
                </div>
              </div>

              <div v-else class="table-wrapper">
                <table class="data-table">
                  <thead><tr>
                    <th>序号</th><th>项目名称</th><th>类型</th><th>性别</th><th>每队限报</th>
                    <th>日期</th><th>时间</th><th>场地</th><th>计分方式</th><th>状态</th><th>操作</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="(ev, idx) in events" :key="ev.id" class="row-animate" :style="{ animationDelay: idx * 30 + 'ms' }">
                      <td>{{ idx + 1 }}</td>
                      <td><strong>{{ ev.name }}</strong><span v-if="ev.isRelay" class="relay-tag">接力</span></td>
                      <td>{{ ev.eventCategory === 'track' ? '径赛' : '田赛' }}</td>
                      <td>{{ genderLabel(ev.gender) }}</td>
                      <td>{{ ev.maxPerTeam }}人</td>
                      <td>{{ ev.eventDate || '-' }}</td>
                      <td>{{ ev.eventTime || '-' }}</td>
                      <td>{{ ev.venue || '-' }}</td>
                      <td>{{ scoringLabel(ev.scoringType) }}</td>
                      <td><span :class="['mini-badge', 'status-' + ev.status]">{{ eventStatusLabel(ev.status) }}</span></td>
                      <td class="action-cell">
                        <button class="btn-text-sm" @click="openEditEvent(ev)">编辑</button>
                        <button class="btn-text-sm danger" @click="confirmRemoveEvent(ev)">删除</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ═══ Tab 2: 报名管理 ═══ -->
            <div v-else-if="activeTab === 'registration'" class="tab-pane">
              <div class="tab-toolbar">
                <button class="btn-primary" @click="downloadTemplate" :disabled="loadingStates.downloadTemplate">
                  <span v-if="loadingStates.downloadTemplate" class="btn-spinner"></span>
                  {{ loadingStates.downloadTemplate ? '下载中...' : '下载报名模板' }}
                </button>
                <button class="btn-danger-outline" @click="confirmClearRegistrations" v-if="registrations.length > 0">清空报名</button>
              </div>

              <!-- 拖拽上传区域 -->
              <div class="upload-zone" :class="{ 'drag-over': isDragging, 'uploading': loadingStates.importFile }"
                   @dragenter.prevent="isDragging = true" @dragover.prevent="isDragging = true"
                   @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
                <div v-if="loadingStates.importFile" class="upload-progress">
                  <div class="spinner-ring"></div>
                  <p>正在导入，请稍候...</p>
                </div>
                <div v-else class="upload-prompt">
                  <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
                    <path d="M24 32V16m0 0l-8 8m8-8l8 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 32v4a4 4 0 004 4h24a4 4 0 004-4v-4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                  </svg>
                  <p>拖拽 Excel 文件到此处，或 <label class="upload-link">点击选择文件<input type="file" accept=".xlsx,.xls" @change="importFile" /></label></p>
                  <span class="upload-hint">支持 .xlsx / .xls 格式</span>
                </div>
              </div>

              <!-- 导入反馈 -->
              <transition name="fade">
                <div v-if="importResult" :class="['import-feedback', importResult.errorCount > 0 ? 'has-errors' : 'all-success']">
                  <div class="feedback-header">
                    <span>{{ importResult.errorCount > 0 ? '⚠' : '✓' }} 导入完成：成功 <strong>{{ importResult.successCount }}</strong> 条{{ importResult.errorCount > 0 ? '，失败 ' : '' }}<strong v-if="importResult.errorCount > 0">{{ importResult.errorCount }}</strong>{{ importResult.errorCount > 0 ? ' 条' : '' }}</span>
                    <button class="feedback-close" @click="importResult = null">&times;</button>
                  </div>
                  <div v-if="importResult.errors && importResult.errors.length > 0" class="error-list">
                    <p v-for="(err, i) in importResult.errors.slice(0, 15)" :key="i">第{{ err.row }}行：{{ err.reason }}</p>
                    <p v-if="importResult.errors.length > 15" class="error-more">还有 {{ importResult.errors.length - 15 }} 条错误未显示</p>
                  </div>
                </div>
              </transition>

              <!-- 搜索 & 筛选栏 -->
              <div class="filter-bar">
                <div class="search-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                  <input v-model="regSearch" placeholder="搜索姓名 / 学号..." class="search-input" />
                </div>
                <select v-model="regFilterEvent" @change="loadRegistrations">
                  <option :value="null">全部项目</option>
                  <option v-for="ev in events" :key="ev.id" :value="ev.id">{{ ev.name }}({{ genderLabel(ev.gender) }})</option>
                </select>
                <select v-model="regFilterDept" @change="loadRegistrations">
                  <option value="">全部代表队</option>
                  <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
                </select>
                <span class="filter-info">共 {{ filteredRegistrations.length }} 条</span>
              </div>

              <div v-if="filteredRegistrations.length === 0" class="empty-state-card small">
                <p>{{ registrations.length === 0 ? '暂无报名记录，请导入 Excel' : '未找到匹配记录' }}</p>
              </div>
              <div v-else class="table-wrapper">
                <table class="data-table">
                  <thead><tr>
                    <th>序号</th><th>姓名</th><th>学号</th><th>性别</th><th>学院(代表队)</th><th>班级</th><th>联系电话</th><th>项目</th><th>操作</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="(r, idx) in filteredRegistrations" :key="r.id">
                      <td>{{ idx + 1 }}</td>
                      <td>{{ r.athleteName }}</td>
                      <td>{{ r.studentNumber || '-' }}</td>
                      <td>{{ r.gender === 'female' ? '女' : '男' }}</td>
                      <td>{{ r.department || '-' }}</td>
                      <td>{{ r.className || '-' }}</td>
                      <td>{{ r.phone || '-' }}</td>
                      <td>{{ getEventName(r.eventId) }}</td>
                      <td><button class="btn-text-sm danger" @click="confirmRemoveRegistration(r)">删除</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ═══ Tab 3: 编排管理 ═══ -->
            <div v-else-if="activeTab === 'schedule'" class="tab-pane">
              <div class="tab-toolbar">
                <div class="lanes-input">
                  <label>每组道次/人数：</label>
                  <input v-model.number="lanesPerHeat" type="number" min="2" max="20" />
                </div>
                <button class="btn-primary" @click="confirmScheduleAll" :disabled="loadingStates.scheduleAll">
                  <span v-if="loadingStates.scheduleAll" class="btn-spinner"></span>
                  {{ loadingStates.scheduleAll ? '编排中...' : '一键编排全部项目' }}
                </button>
              </div>

              <div v-if="loadingStates.loadHeats" class="loading-placeholder">
                <div class="spinner-ring"></div>
                <p>加载编排数据...</p>
              </div>

              <div v-else class="schedule-events">
                <div v-for="ev in events" :key="ev.id" class="schedule-event-card" :class="{ expanded: expandedEvents[ev.id] }">
                  <div class="event-card-header" @click="toggleEventExpand(ev)">
                    <div class="event-card-left">
                      <span class="expand-arrow">{{ expandedEvents[ev.id] ? '▾' : '▸' }}</span>
                      <strong>{{ ev.name }}</strong>
                      <span class="event-meta">{{ ev.eventCategory === 'track' ? '径赛' : '田赛' }} | {{ genderLabel(ev.gender) }}</span>
                      <span v-if="eventHeats[ev.id]" class="heat-count-badge">{{ eventHeats[ev.id].length }}组</span>
                      <span v-if="!eventHeats[ev.id] || eventHeats[ev.id].length === 0" class="no-schedule-hint">未编排</span>
                    </div>
                    <div class="event-card-actions" @click.stop>
                      <button class="btn-text-sm" @click="doScheduleEvent(ev)" :disabled="loadingStates['schedule_' + ev.id]">
                        {{ loadingStates['schedule_' + ev.id] ? '编排中...' : '编排此项目' }}
                      </button>
                    </div>
                  </div>
                  <transition name="expand">
                    <div v-if="expandedEvents[ev.id] && eventHeats[ev.id]" class="heats-container">
                      <div v-if="eventHeats[ev.id].length === 0" class="empty-hint small">未编排，请点击右侧"编排此项目"</div>
                      <div v-for="heat in eventHeats[ev.id]" :key="heat.id" class="heat-card">
                        <div class="heat-header">
                          <span>第{{ heat.heatNumber }}组 ({{ heatTypeLabel(heat.heatType) }})</span>
                          <span :class="['mini-badge', 'status-' + heat.status]">{{ eventStatusLabel(heat.status) }}</span>
                        </div>
                        <div class="lanes-list">
                          <div v-for="lane in heat.lanes" :key="lane.id" class="lane-item">
                            <span class="lane-number">{{ ev.eventCategory === 'track' ? lane.laneNumber + '道' : '第' + lane.laneNumber + '位' }}</span>
                            <span class="lane-athlete">{{ lane.athleteName }}</span>
                            <span class="lane-dept">{{ lane.department || '' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </div>

            <!-- ═══ Tab 4: 成绩管理 ═══ -->
            <div v-else-if="activeTab === 'results'" class="tab-pane">
              <div class="tab-toolbar">
                <select v-model="selectedResultEvent" @change="loadResults" class="event-select">
                  <option :value="null">-- 选择比赛项目 --</option>
                  <option v-for="ev in events" :key="ev.id" :value="ev.id">{{ ev.name }} ({{ genderLabel(ev.gender) }})</option>
                </select>
                <button class="btn-primary" v-if="selectedResultEvent && eventResults.length > 0" @click="doCalculateRankings" :disabled="loadingStates.calculateRankings">
                  <span v-if="loadingStates.calculateRankings" class="btn-spinner"></span>
                  {{ loadingStates.calculateRankings ? '计算中...' : '计算排名与积分' }}
                </button>
              </div>

              <div v-if="!selectedResultEvent" class="empty-state-card small">
                <div class="empty-icon"></div>
                <p>请从上方选择一个比赛项目来录入或查看成绩</p>
              </div>

              <div v-else>
                <div class="result-entry-section">
                  <h4>成绩录入 <span class="section-sub">({{ selectedEventObj ? selectedEventObj.name : '' }})</span></h4>
                  <div v-if="eventRegistrations.length === 0" class="empty-hint small">该项目暂无报名运动员</div>
                  <div v-else class="result-entry-list">
                    <div class="result-entry-header">
                      <span class="reh-seq">#</span><span class="reh-name">姓名</span><span class="reh-sn">学号</span>
                      <span class="reh-dept">代表队</span><span class="reh-val">成绩</span><span class="reh-remark">状态</span>
                    </div>
                    <div v-for="(r, idx) in eventRegistrations" :key="r.id" class="result-entry-row">
                      <span class="entry-seq">{{ idx + 1 }}</span>
                      <span class="entry-name">{{ r.athleteName }}</span>
                      <span class="entry-sn">{{ r.studentNumber || '-' }}</span>
                      <span class="entry-dept">{{ r.department || '' }}</span>
                      <input v-model="resultInputs[r.id]" :placeholder="getResultPlaceholder()" class="result-input" @keydown.enter="focusNextInput($event)" />
                      <select v-model="remarkInputs[r.id]" class="remark-select">
                        <option value="">正常</option>
                        <option value="DNF">DNF</option>
                        <option value="DQ">DQ</option>
                        <option value="DNS">DNS</option>
                      </select>
                    </div>
                  </div>
                  <button v-if="eventRegistrations.length > 0" class="btn-primary" @click="saveAllResults" :disabled="loadingStates.saveResults" style="margin-top:12px">
                    <span v-if="loadingStates.saveResults" class="btn-spinner"></span>
                    {{ loadingStates.saveResults ? '保存中...' : '保存全部成绩' }}
                  </button>
                </div>

                <div v-if="eventResults.length > 0" class="results-table-section">
                  <h4>成绩排名</h4>
                  <table class="data-table">
                    <thead><tr>
                      <th>名次</th><th>姓名</th><th>学号</th><th>代表队</th><th>成绩</th><th>得分</th><th>备注</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="r in eventResults" :key="r.id" :class="rankClass(r.ranking)">
                        <td><strong class="rank-display">{{ r.ranking || '-' }}</strong></td>
                        <td>{{ r.athleteName }}</td>
                        <td>{{ r.studentNumber || '-' }}</td>
                        <td>{{ r.department || '-' }}</td>
                        <td class="result-val">{{ r.resultValue || '-' }}</td>
                        <td><span class="score-pill">{{ r.score || 0 }}</span></td>
                        <td>{{ r.remark || '' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- ═══ Tab 5: 团体积分 ═══ -->
            <div v-else-if="activeTab === 'rankings'" class="tab-pane">
              <div v-if="loadingStates.rankings" class="loading-placeholder"><div class="spinner-ring"></div><p>加载排名...</p></div>
              <div v-else-if="rankings.length === 0" class="empty-state-card small">
                <div class="empty-icon"></div>
                <p>暂无团体积分数据，请先在"成绩管理"中录入成绩并计算排名</p>
              </div>
              <table v-else class="data-table rankings-table">
                <thead><tr>
                  <th>排名</th><th>代表队</th><th>金牌</th><th>银牌</th><th>铜牌</th><th>奖牌总数</th><th>总积分</th>
                </tr></thead>
                <tbody>
                  <tr v-for="r in rankings" :key="r.department" :class="rankClass(r.rank)" class="row-animate" :style="{ animationDelay: (r.rank - 1) * 60 + 'ms' }">
                    <td><strong class="rank-display rank-lg">{{ r.rank }}</strong></td>
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
            <div v-else-if="activeTab === 'scoreRules'" class="tab-pane">
              <div class="rules-section">
                <p class="rules-hint">设置各名次对应的积分，保存后对所有项目生效。</p>
                <div class="rules-grid">
                  <div v-for="(rule, idx) in scoreRules" :key="idx" class="rule-item">
                    <span class="rule-rank">{{ rule.ranking }}</span>
                    <input v-model.number="rule.score" type="number" min="0" class="rule-input" />
                    <span class="rule-unit">分</span>
                  </div>
                </div>
                <div class="rules-actions">
                  <button class="btn-secondary" @click="resetDefaultRules">恢复默认</button>
                  <button class="btn-primary" @click="saveRules" :disabled="loadingStates.saveRules">
                    <span v-if="loadingStates.saveRules" class="btn-spinner"></span>
                    {{ loadingStates.saveRules ? '保存中...' : '保存计分规则' }}
                  </button>
                </div>
              </div>
            </div>
            </div><!-- end tab-pane-wrapper -->
          </transition>
        </div>
      </div>
    </div>

    <!-- ═══ 项目编辑对话框 ═══ -->
    <transition name="dialog-fade">
      <div v-if="showEventDialog" class="dialog-overlay" @click.self="showEventDialog = false">
        <div class="dialog-box">
          <div class="dialog-header">
            <h3>{{ editingEvent ? '编辑项目' : '添加项目' }}</h3>
            <button class="close-btn" @click="showEventDialog = false">&times;</button>
          </div>
          <div class="dialog-body">
            <div class="form-group">
              <label>项目名称 <span class="required">*</span></label>
              <input v-model="eventForm.name" placeholder="如：男子100米" @keydown.enter="submitEvent" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>类型</label>
                <select v-model="eventForm.eventCategory" @change="autoSetScoring">
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
              <div class="form-group checkbox-group">
                <label><input type="checkbox" v-model="eventForm.isRelay" /> 接力项目</label>
              </div>
              <div class="form-group" v-if="eventForm.isRelay">
                <label>接力人数</label>
                <input v-model.number="eventForm.relayMembers" type="number" min="2" />
              </div>
            </div>
          </div>
          <div class="dialog-footer">
            <button class="btn-cancel" @click="showEventDialog = false">取消</button>
            <button class="btn-primary" @click="submitEvent" :disabled="loadingStates.submitEvent">
              <span v-if="loadingStates.submitEvent" class="btn-spinner"></span>
              {{ editingEvent ? '保存' : '添加' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══ 预设项目对话框 ═══ -->
    <transition name="dialog-fade">
      <div v-if="showPresetDialog" class="dialog-overlay" @click.self="showPresetDialog = false">
        <div class="dialog-box wide">
          <div class="dialog-header">
            <h3>快速添加预设项目</h3>
            <button class="close-btn" @click="showPresetDialog = false">&times;</button>
          </div>
          <div class="dialog-body">
            <div class="preset-toolbar">
              <button class="btn-text-sm" @click="selectAllPresets(true)">全选</button>
              <button class="btn-text-sm" @click="selectAllPresets(false)">全不选</button>
              <span class="preset-count">已选 {{ selectedPresetCount }} 项</span>
            </div>
            <div class="preset-section">
              <h4>径赛项目</h4>
              <div class="preset-grid">
                <label v-for="p in presetTrackEvents" :key="p.name" :class="['preset-item', { selected: p.selected }]">
                  <input type="checkbox" v-model="p.selected" /> {{ p.name }}
                </label>
              </div>
            </div>
            <div class="preset-section">
              <h4>田赛项目</h4>
              <div class="preset-grid">
                <label v-for="p in presetFieldEvents" :key="p.name" :class="['preset-item', { selected: p.selected }]">
                  <input type="checkbox" v-model="p.selected" /> {{ p.name }}
                </label>
              </div>
            </div>
          </div>
          <div class="dialog-footer">
            <button class="btn-cancel" @click="showPresetDialog = false">取消</button>
            <button class="btn-primary" @click="addPresetEvents" :disabled="loadingStates.addPreset || selectedPresetCount === 0">
              <span v-if="loadingStates.addPreset" class="btn-spinner"></span>
              添加 {{ selectedPresetCount }} 个项目
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══ 全屏加载 ═══ -->
    <transition name="fade">
      <div v-if="loading" class="full-loading">
        <div class="spinner-ring large"></div>
        <p>加载运动会数据...</p>
      </div>
    </transition>
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
      expandedEvents: {},
      rankings: [],
      scoreRules: [],
      eventResults: [],
      eventRegistrations: [],
      resultInputs: {},
      remarkInputs: {},
      selectedResultEvent: null,
      regFilterEvent: null,
      regFilterDept: '',
      regSearch: '',
      importResult: null,
      lanesPerHeat: 8,
      isDragging: false,
      showEventDialog: false,
      showPresetDialog: false,
      editingEvent: null,
      eventForm: this.getEmptyEventForm(),
      toasts: [],
      toastIdCounter: 0,
      confirmDialog: { visible: false, title: '', message: '', danger: false, confirmText: '', resolve: null },
      loadingStates: {},
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
    },
    filteredRegistrations() {
      if (!this.regSearch) return this.registrations
      const q = this.regSearch.toLowerCase()
      return this.registrations.filter(r =>
        (r.athleteName && r.athleteName.toLowerCase().includes(q)) ||
        (r.studentNumber && r.studentNumber.toLowerCase().includes(q))
      )
    },
    scheduledEventCount() { return this.events.filter(e => e.status === 'scheduled' || e.status === 'completed' || e.status === 'in_progress').length },
    completedEventCount() { return this.events.filter(e => e.status === 'completed').length },
    selectedPresetCount() { return [...this.presetTrackEvents, ...this.presetFieldEvents].filter(p => p.selected).length },
    selectedEventObj() { return this.events.find(e => e.id === this.selectedResultEvent) },
    guidanceTip() {
      if (!this.meeting) return null
      if (this.events.length === 0) return { text: '第一步：请先添加比赛项目', actionLabel: '去添加', action: () => { this.activeTab = 'events'; this.showPresetDialog = true } }
      if (this.registrations.length === 0) return { text: '第二步：下载报名模板并导入报名数据', actionLabel: '去导入', action: () => { this.activeTab = 'registration' } }
      if (this.scheduledEventCount === 0) return { text: '第三步：进行比赛编排，自动分组分道', actionLabel: '去编排', action: () => { this.activeTab = 'schedule' } }
      const noResults = this.events.some(e => e.status !== 'completed')
      if (noResults) return { text: '第四步：录入比赛成绩并计算排名', actionLabel: '去录入', action: () => { this.activeTab = 'results' } }
      return null
    }
  },
  watch: {
    activeTab(tab) { this.onTabSwitch(tab) }
  },
  mounted() {
    this.loadMeeting()
    document.addEventListener('keydown', this.handleGlobalKey)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleGlobalKey)
  },
  methods: {
    // ── Toast ──────────────────────────────────────────────────────
    toast(message, type = 'success') {
      const id = ++this.toastIdCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => this.removeToast(id), 3500)
    },
    removeToast(id) { this.toasts = this.toasts.filter(t => t.id !== id) },

    // ── 确认弹窗 ──────────────────────────────────────────────────
    showConfirm(title, message, { danger = false, confirmText = '确定' } = {}) {
      return new Promise(resolve => {
        this.confirmDialog = { visible: true, title, message, danger, confirmText, resolve }
      })
    },
    doConfirm() { this.confirmDialog.visible = false; if (this.confirmDialog.resolve) this.confirmDialog.resolve(true) },
    cancelConfirm() { this.confirmDialog.visible = false; if (this.confirmDialog.resolve) this.confirmDialog.resolve(false) },

    // ── 全局键盘 ──────────────────────────────────────────────────
    handleGlobalKey(e) {
      if (e.key === 'Escape') {
        if (this.confirmDialog.visible) this.cancelConfirm()
        else if (this.showEventDialog) this.showEventDialog = false
        else if (this.showPresetDialog) this.showPresetDialog = false
      }
    },

    // ── Tab 切换自动刷新 ──────────────────────────────────────────
    async switchTab(key) { this.activeTab = key },
    async onTabSwitch(tab) {
      if (tab === 'schedule') await this.loadAllHeats()
      if (tab === 'rankings') await this.loadRankings()
      if (tab === 'registration') await this.loadRegistrations()
    },

    getEmptyEventForm() {
      return { name: '', eventCategory: 'track', gender: 'male', maxPerTeam: 3, scoringType: 'time', eventDate: '', eventTime: '', venue: '', isRelay: false, relayMembers: 4, sortOrder: 0 }
    },
    autoSetScoring() {
      this.eventForm.scoringType = this.eventForm.eventCategory === 'track' ? 'time' : 'distance'
    },

    // ── 数据加载 ──────────────────────────────────────────────────
    async loadMeeting() {
      this.loading = true
      try {
        const res = await api.sportsMeeting.get(this.meetingId)
        this.meeting = res.data || res
        await Promise.all([this.loadEvents(), this.loadRegistrations(), this.loadScoreRules(), this.loadRankings()])
      } catch (e) {
        this.toast('加载运动会信息失败：' + (e.message || ''), 'error')
        setTimeout(() => this.$router.push('/group/sports-management'), 1500)
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
        this.scoreRules = data.length > 0 ? data.map(r => ({ ranking: r.ranking, score: r.score })) : this.getDefaultRules()
      } catch (e) { this.scoreRules = this.getDefaultRules() }
    },
    async loadRankings() {
      this.loadingStates = { ...this.loadingStates, rankings: true }
      try {
        const res = await api.sportsMeeting.getRankings(this.meetingId)
        this.rankings = res.data || res || []
      } catch (e) { console.error(e) }
      this.loadingStates = { ...this.loadingStates, rankings: false }
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
        this.resultInputs = {}; this.remarkInputs = {}
        for (const r of this.eventRegistrations) {
          const existing = this.eventResults.find(er => er.registrationId === r.id)
          this.resultInputs[r.id] = existing ? existing.resultValue || '' : ''
          this.remarkInputs[r.id] = existing ? existing.remark || '' : ''
        }
      } catch (e) { console.error(e) }
    },
    async loadAllHeats() {
      this.loadingStates = { ...this.loadingStates, loadHeats: true }
      try {
        await Promise.all(this.events.map(async ev => {
          const res = await api.sportsMeeting.getEventHeats(ev.id)
          this.eventHeats[ev.id] = res.data || res || []
        }))
        this.eventHeats = { ...this.eventHeats }
        this.events.forEach(ev => {
          if (this.eventHeats[ev.id] && this.eventHeats[ev.id].length > 0) {
            this.expandedEvents[ev.id] = true
          }
        })
        this.expandedEvents = { ...this.expandedEvents }
      } catch (e) { console.error(e) }
      this.loadingStates = { ...this.loadingStates, loadHeats: false }
    },
    toggleEventExpand(ev) {
      this.expandedEvents = { ...this.expandedEvents, [ev.id]: !this.expandedEvents[ev.id] }
    },

    // ── 运动会状态 ────────────────────────────────────────────────
    async changeStatus() {
      if (!this.statusAction) return
      const label = this.statusLabel(this.statusAction)
      const ok = await this.showConfirm('切换状态', `确定将运动会状态切换为"${label}"吗？`)
      if (!ok) { this.statusAction = ''; return }
      try {
        await api.sportsMeeting.updateStatus(this.meetingId, this.statusAction)
        this.meeting.status = this.statusAction
        this.toast(`状态已切换为"${label}"`)
      } catch (e) { this.toast(e.message || '状态更新失败', 'error') }
      this.statusAction = ''
    },

    // ── 项目操作 ──────────────────────────────────────────────────
    async submitEvent() {
      if (!this.eventForm.name) return this.toast('请输入项目名称', 'warning')
      this.loadingStates = { ...this.loadingStates, submitEvent: true }
      try {
        if (this.editingEvent) {
          await api.sportsMeeting.updateEvent(this.editingEvent.id, this.eventForm)
          this.toast('项目已更新')
        } else {
          await api.sportsMeeting.createEvent(this.meetingId, this.eventForm)
          this.toast('项目已添加')
        }
        this.showEventDialog = false
        await this.loadEvents()
      } catch (e) { this.toast(e.message || '操作失败', 'error') }
      this.loadingStates = { ...this.loadingStates, submitEvent: false }
    },
    openEditEvent(ev) {
      this.editingEvent = ev
      this.eventForm = { name: ev.name, eventCategory: ev.eventCategory, gender: ev.gender, maxPerTeam: ev.maxPerTeam, scoringType: ev.scoringType, eventDate: ev.eventDate || '', eventTime: ev.eventTime || '', venue: ev.venue || '', isRelay: ev.isRelay || false, relayMembers: ev.relayMembers || 4, sortOrder: ev.sortOrder || 0 }
      this.showEventDialog = true
    },
    async confirmRemoveEvent(ev) {
      const ok = await this.showConfirm('删除项目', `确定删除"${ev.name}"吗？关联的报名、分组、成绩将一并删除。`, { danger: true, confirmText: '删除' })
      if (!ok) return
      try {
        await api.sportsMeeting.deleteEvent(ev.id)
        this.toast('项目已删除')
        await this.loadEvents()
      } catch (e) { this.toast(e.message || '删除失败', 'error') }
    },
    async addPresetEvents() {
      const selected = [...this.presetTrackEvents.filter(p => p.selected), ...this.presetFieldEvents.filter(p => p.selected)]
      if (selected.length === 0) return this.toast('请至少选择一个项目', 'warning')
      this.loadingStates = { ...this.loadingStates, addPreset: true }
      try {
        const all = selected.map((p, i) => ({
          name: p.name, eventCategory: p.isRelay !== undefined && p.isRelay ? 'track' : (FIELD_PRESETS.includes(p.name) ? 'field' : 'track'),
          gender: p.gender, maxPerTeam: 3, scoringType: FIELD_PRESETS.includes(p.name) ? 'distance' : 'time',
          isRelay: p.isRelay || false, relayMembers: p.relayMembers || 0, sortOrder: i
        }))
        await api.sportsMeeting.batchCreateEvents(this.meetingId, all)
        this.showPresetDialog = false
        this.presetTrackEvents.forEach(p => p.selected = false)
        this.presetFieldEvents.forEach(p => p.selected = false)
        await this.loadEvents()
        this.toast(`已添加 ${all.length} 个项目`)
      } catch (e) { this.toast(e.message || '添加失败', 'error') }
      this.loadingStates = { ...this.loadingStates, addPreset: false }
    },
    selectAllPresets(val) {
      this.presetTrackEvents.forEach(p => p.selected = val)
      this.presetFieldEvents.forEach(p => p.selected = val)
    },

    // ── 报名操作 ──────────────────────────────────────────────────
    async downloadTemplate() {
      this.loadingStates = { ...this.loadingStates, downloadTemplate: true }
      try {
        const data = await api.sportsMeeting.downloadTemplate(this.meetingId)
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = '报名模板.xlsx'; a.click()
        URL.revokeObjectURL(url)
        this.toast('模板已下载')
      } catch (e) { this.toast(e.message || '下载失败', 'error') }
      this.loadingStates = { ...this.loadingStates, downloadTemplate: false }
    },
    async importFile(e) {
      const file = e.target ? e.target.files[0] : e
      if (!file) return
      this.loadingStates = { ...this.loadingStates, importFile: true }
      this.isDragging = false
      const formData = new FormData(); formData.append('file', file)
      try {
        const res = await api.sportsMeeting.importRegistrations(this.meetingId, formData)
        this.importResult = res.data || res
        await this.loadRegistrations()
        const r = this.importResult
        if (r.errorCount > 0) this.toast(`导入完成：成功${r.successCount}条，失败${r.errorCount}条`, 'warning')
        else this.toast(`成功导入 ${r.successCount} 条报名`)
      } catch (err) { this.toast(err.message || '导入失败', 'error') }
      this.loadingStates = { ...this.loadingStates, importFile: false }
      if (e.target) e.target.value = ''
    },
    handleDrop(e) {
      this.isDragging = false
      const file = e.dataTransfer.files[0]
      if (file) this.importFile(file)
    },
    async confirmRemoveRegistration(r) {
      const ok = await this.showConfirm('删除报名', `确定删除${r.athleteName}的报名记录？`, { danger: true, confirmText: '删除' })
      if (!ok) return
      try {
        await api.sportsMeeting.deleteRegistration(r.id)
        this.toast('已删除')
        await this.loadRegistrations()
      } catch (e) { this.toast(e.message || '删除失败', 'error') }
    },
    async confirmClearRegistrations() {
      const ok = await this.showConfirm('清空所有报名', '此操作将删除全部报名记录，不可恢复。确定继续？', { danger: true, confirmText: '清空全部' })
      if (!ok) return
      try {
        await api.sportsMeeting.clearRegistrations(this.meetingId)
        await this.loadRegistrations()
        this.importResult = null
        this.toast('报名已清空')
      } catch (e) { this.toast(e.message || '清空失败', 'error') }
    },

    // ── 编排操作 ──────────────────────────────────────────────────
    async doScheduleEvent(ev) {
      this.loadingStates = { ...this.loadingStates, ['schedule_' + ev.id]: true }
      try {
        const res = await api.sportsMeeting.scheduleEvent(ev.id, this.lanesPerHeat)
        const data = res.data || res
        this.toast(`"${ev.name}"编排完成：${data.heatCount || 0}组`)
        const hRes = await api.sportsMeeting.getEventHeats(ev.id)
        this.eventHeats = { ...this.eventHeats, [ev.id]: hRes.data || hRes || [] }
        this.expandedEvents = { ...this.expandedEvents, [ev.id]: true }
        await this.loadEvents()
      } catch (e) { this.toast(e.message || '编排失败', 'error') }
      this.loadingStates = { ...this.loadingStates, ['schedule_' + ev.id]: false }
    },
    async confirmScheduleAll() {
      const ok = await this.showConfirm('一键编排', '将对所有项目进行自动编排，已有编排将被重置。确定继续？', { confirmText: '开始编排' })
      if (!ok) return
      this.loadingStates = { ...this.loadingStates, scheduleAll: true }
      try {
        const res = await api.sportsMeeting.scheduleAll(this.meetingId, this.lanesPerHeat)
        const data = res.data || res
        this.toast(`全部编排完成：${data.eventCount || 0}个项目，${data.totalHeats || 0}组`)
        await this.loadAllHeats()
        await this.loadEvents()
      } catch (e) { this.toast(e.message || '编排失败', 'error') }
      this.loadingStates = { ...this.loadingStates, scheduleAll: false }
    },

    // ── 成绩操作 ──────────────────────────────────────────────────
    async saveAllResults() {
      const ev = this.selectedEventObj
      if (!ev) return
      const batch = []
      for (const reg of this.eventRegistrations) {
        const val = this.resultInputs[reg.id]
        if (!val && !this.remarkInputs[reg.id]) continue
        const item = { registrationId: reg.id, resultValue: val || '', remark: this.remarkInputs[reg.id] || '' }
        if (ev.scoringType === 'time' && val) item.resultMs = this.parseTimeToMs(val)
        else if (val) item.resultCm = this.parseDistanceToCm(val)
        batch.push(item)
      }
      if (batch.length === 0) return this.toast('请输入至少一条成绩', 'warning')
      this.loadingStates = { ...this.loadingStates, saveResults: true }
      try {
        await api.sportsMeeting.batchSaveResults(this.selectedResultEvent, batch)
        this.toast(`已保存 ${batch.length} 条成绩`)
        await this.loadResults()
      } catch (e) { this.toast(e.message || '保存失败', 'error') }
      this.loadingStates = { ...this.loadingStates, saveResults: false }
    },
    async doCalculateRankings() {
      this.loadingStates = { ...this.loadingStates, calculateRankings: true }
      try {
        await api.sportsMeeting.calculateRankings(this.selectedResultEvent)
        this.toast('排名与积分计算完成')
        await this.loadResults()
        await this.loadRankings()
        await this.loadEvents()
      } catch (e) { this.toast(e.message || '计算失败', 'error') }
      this.loadingStates = { ...this.loadingStates, calculateRankings: false }
    },
    focusNextInput(e) {
      const rows = this.$el.querySelectorAll('.result-entry-row')
      const inputs = Array.from(rows).map(r => r.querySelector('.result-input'))
      const idx = inputs.indexOf(e.target)
      if (idx >= 0 && idx < inputs.length - 1) inputs[idx + 1].focus()
    },

    // ── 计分规则 ──────────────────────────────────────────────────
    getDefaultRules() {
      return [{ ranking:1,score:9 },{ranking:2,score:7},{ranking:3,score:6},{ranking:4,score:5},{ranking:5,score:4},{ranking:6,score:3},{ranking:7,score:2},{ranking:8,score:1}]
    },
    resetDefaultRules() { this.scoreRules = this.getDefaultRules(); this.toast('已恢复默认规则', 'info') },
    async saveRules() {
      this.loadingStates = { ...this.loadingStates, saveRules: true }
      try {
        await api.sportsMeeting.saveScoreRules(this.meetingId, this.scoreRules)
        this.toast('计分规则已保存')
      } catch (e) { this.toast(e.message || '保存失败', 'error') }
      this.loadingStates = { ...this.loadingStates, saveRules: false }
    },

    // ── 工具方法 ──────────────────────────────────────────────────
    getEventName(eventId) { const ev = this.events.find(e => e.id === eventId); return ev ? ev.name : eventId },
    getResultPlaceholder() { const ev = this.selectedEventObj; return ev ? (ev.scoringType === 'time' ? '如 11.23 或 1:23.45' : '如 5.67') : '成绩' },
    parseTimeToMs(val) { const num = parseFloat(val); if (isNaN(num)) return 0; if (val.includes(':')) { const p = val.split(':'); return (parseInt(p[0]) * 60 + parseFloat(p[1])) * 1000 } return Math.round(num * 1000) },
    parseDistanceToCm(val) { const num = parseFloat(val); return isNaN(num) ? 0 : Math.round(num * 100) },
    statusLabel(s) { return { draft:'草稿', registration:'报名中', scheduling:'编排中', in_progress:'进行中', completed:'已完成', cancelled:'已取消' }[s] || s },
    eventStatusLabel(s) { return { pending:'待开始', scheduled:'已编排', in_progress:'进行中', completed:'已完成' }[s] || s },
    genderLabel(g) { return g === 'female' ? '女子' : g === 'mixed' ? '混合' : '男子' },
    scoringLabel(s) { return { time:'计时', distance:'计距', height:'计高' }[s] || s },
    heatTypeLabel(t) { return { preliminary:'预赛', semifinal:'半决赛', final:'决赛' }[t] || t },
    rankClass(r) { return { 'rank-gold': r === 1, 'rank-silver': r === 2, 'rank-bronze': r === 3 } }
  }
}
</script>

<style scoped>
/* ── 基础布局 ────────────────────────────────────────────── */
.meeting-detail { min-height: 100vh; background: var(--bg-primary, #f5f7fa); }
.page-header { background: var(--bg-card, #fff); border-bottom: 1px solid var(--border-color, #e4e7ed); padding: 14px 24px; position: sticky; top: 0; z-index: 20; }
.header-container { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.header-left { display: flex; align-items: center; gap: 16px; min-width: 0; }
.back-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; padding: 7px 14px; cursor: pointer; font-size: 13px; color: var(--text-secondary, #606266); transition: all 0.2s; flex-shrink: 0; }
.back-btn:hover { border-color: var(--primary-color, #409eff); color: var(--primary-color, #409eff); }
.back-btn svg { width: 16px; height: 16px; }
.module-title { font-size: 18px; font-weight: 700; color: var(--text-primary, #303133); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.module-subtitle { font-size: 13px; color: var(--text-secondary, #909399); margin: 3px 0 0; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.header-date, .header-location { opacity: 0.8; font-size: 12px; }
.status-select { padding: 7px 12px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; font-size: 13px; background: var(--bg-card, #fff); cursor: pointer; flex-shrink: 0; }
.main-area { max-width: 1400px; margin: 0 auto; padding: 16px 24px 40px; }

/* ── 流程引导 ────────────────────────────────────────────── */
.guidance-banner { display: flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #ecf5ff, #f0f9ff); border: 1px solid #d9ecff; border-radius: 10px; padding: 12px 18px; margin-bottom: 16px; cursor: pointer; transition: all 0.2s; }
.guidance-banner:hover { border-color: #a0cfff; box-shadow: 0 2px 8px rgba(64,158,255,0.1); }
.guidance-icon { font-size: 18px; }
.guidance-text { flex: 1; font-size: 14px; color: #409eff; font-weight: 500; }
.guidance-action { font-size: 13px; color: #409eff; font-weight: 600; white-space: nowrap; }

/* ── 概览统计 ────────────────────────────────────────────── */
.overview-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.ov-card { background: var(--bg-card, #fff); border-radius: 10px; padding: 14px 16px; text-align: center; border: 1px solid var(--border-color, #e4e7ed); }
.ov-num { display: block; font-size: 24px; font-weight: 700; color: var(--primary-color, #409eff); }
.ov-label { font-size: 12px; color: var(--text-secondary, #909399); }

/* ── Tabs ────────────────────────────────────────────────── */
.tabs-container { }
.tabs-nav { display: flex; gap: 2px; background: var(--bg-card, #fff); border-radius: 12px 12px 0 0; padding: 10px 16px 0; border: 1px solid var(--border-color, #e4e7ed); border-bottom: none; overflow-x: auto; }
.tab-btn { padding: 10px 18px; border: none; background: none; font-size: 14px; font-weight: 500; color: var(--text-secondary, #606266); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
.tab-btn:hover { color: var(--primary-color, #409eff); }
.tab-btn.active { color: var(--primary-color, #409eff); border-bottom-color: var(--primary-color, #409eff); }
.tab-badge { background: var(--primary-color, #409eff); color: #fff; font-size: 11px; padding: 1px 6px; border-radius: 10px; }
.tab-content { background: var(--bg-card, #fff); border: 1px solid var(--border-color, #e4e7ed); border-top: none; border-radius: 0 0 12px 12px; min-height: 400px; }
.tab-pane { padding: 20px; }
.tab-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }

/* ── Tab 过渡 ────────────────────────────────────────────── */
.tab-fade-enter-active { animation: tabIn 0.2s ease; }
.tab-fade-leave-active { animation: tabOut 0.15s ease; }
@keyframes tabIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes tabOut { from { opacity: 1; } to { opacity: 0; } }

/* ── 按钮系统 ────────────────────────────────────────────── */
.btn-primary { display: inline-flex; align-items: center; gap: 6px; background: var(--primary-color, #409eff); color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-secondary { display: inline-flex; align-items: center; gap: 6px; background: var(--bg-primary, #f5f7fa); color: var(--text-primary, #303133); border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.btn-secondary:hover { border-color: var(--primary-color, #409eff); color: var(--primary-color, #409eff); }
.btn-danger { background: #f56c6c; color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; }
.btn-danger:hover { opacity: 0.9; }
.btn-danger-outline { background: none; color: #f56c6c; border: 1px solid #f56c6c; border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.btn-danger-outline:hover { background: #fef0f0; }
.btn-cancel { background: var(--bg-primary, #f5f7fa); border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; }
.btn-text-sm { background: none; border: none; font-size: 13px; color: var(--primary-color, #409eff); cursor: pointer; padding: 2px 6px; }
.btn-text-sm.danger { color: #f56c6c; }
.btn-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Spinner ─────────────────────────────────────────────── */
.spinner-ring { width: 32px; height: 32px; border: 3px solid var(--border-color, #e4e7ed); border-top-color: var(--primary-color, #409eff); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
.spinner-ring.large { width: 40px; height: 40px; }
.loading-placeholder { text-align: center; padding: 40px; color: var(--text-secondary, #909399); }
.loading-placeholder p { margin-top: 12px; }

/* ── 空状态 ──────────────────────────────────────────────── */
.empty-state-card { text-align: center; padding: 48px 20px; color: var(--text-secondary, #909399); }
.empty-state-card.small { padding: 32px 20px; }
.empty-icon { font-size: 36px; margin-bottom: 10px; }
.empty-state-card p { font-size: 14px; margin: 0 0 16px; }
.empty-actions { display: flex; gap: 12px; justify-content: center; }
.empty-hint { text-align: center; padding: 24px; color: var(--text-secondary, #909399); font-size: 13px; }
.empty-hint.small { padding: 16px; }

/* ── 数据表格 ────────────────────────────────────────────── */
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { background: var(--bg-primary, #fafafa); padding: 10px 12px; text-align: left; font-weight: 600; color: var(--text-secondary, #606266); border-bottom: 1px solid var(--border-color, #ebeef5); white-space: nowrap; position: sticky; top: 0; }
.data-table td { padding: 9px 12px; border-bottom: 1px solid var(--border-color, #f0f0f0); color: var(--text-primary, #303133); }
.data-table tbody tr { transition: background 0.15s; }
.data-table tbody tr:hover { background: rgba(64,158,255,0.04); }
.action-cell { white-space: nowrap; }
.relay-tag { background: #ecf5ff; color: #409eff; font-size: 11px; padding: 1px 6px; border-radius: 4px; margin-left: 6px; }
.row-animate { animation: rowSlide 0.3s ease backwards; }
@keyframes rowSlide { from { opacity: 0; transform: translateX(-8px); } }

/* ── 状态徽章 ────────────────────────────────────────────── */
.status-badge, .mini-badge { padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; display: inline-block; }
.mini-badge { padding: 1px 8px; font-size: 11px; }
.status-draft { background: #f0f0f0; color: #909399; }
.status-registration { background: #fdf6ec; color: #e6a23c; }
.status-scheduling { background: #ecf5ff; color: #409eff; }
.status-in_progress, .status-scheduled { background: #f0f9eb; color: #67c23a; }
.status-completed { background: #f4f4f5; color: #909399; }
.status-cancelled { background: #fef0f0; color: #f56c6c; }
.status-pending { background: #fdf6ec; color: #e6a23c; }

/* ── 搜索 & 筛选 ────────────────────────────────────────── */
.filter-bar { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.search-input-wrap { position: relative; }
.search-input-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-placeholder, #c0c4cc); }
.search-input { padding: 8px 12px 8px 32px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; font-size: 13px; width: 200px; outline: none; transition: border-color 0.2s; }
.search-input:focus { border-color: var(--primary-color, #409eff); }
.filter-bar select { padding: 8px 12px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; font-size: 13px; background: var(--bg-card, #fff); }
.filter-info { font-size: 13px; color: var(--text-secondary, #909399); margin-left: auto; }

/* ── 拖拽上传 ────────────────────────────────────────────── */
.upload-zone { border: 2px dashed var(--border-color, #dcdfe6); border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 16px; transition: all 0.25s; background: var(--bg-primary, #fafbfc); }
.upload-zone:hover { border-color: #a0cfff; }
.upload-zone.drag-over { border-color: var(--primary-color, #409eff); background: #ecf5ff; transform: scale(1.01); }
.upload-zone.uploading { border-color: var(--primary-color, #409eff); background: #f0f7ff; }
.upload-prompt svg { color: var(--text-placeholder, #c0c4cc); margin-bottom: 8px; }
.upload-prompt p { font-size: 14px; color: var(--text-secondary, #606266); margin: 0 0 4px; }
.upload-link { color: var(--primary-color, #409eff); cursor: pointer; font-weight: 500; text-decoration: underline; }
.upload-link input { display: none; }
.upload-hint { font-size: 12px; color: var(--text-placeholder, #c0c4cc); }
.upload-progress { padding: 12px; }
.upload-progress p { margin: 10px 0 0; font-size: 14px; color: var(--primary-color, #409eff); }

/* ── 导入反馈 ────────────────────────────────────────────── */
.import-feedback { padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 13px; }
.import-feedback.all-success { background: #f0f9eb; border: 1px solid #e1f3d8; color: #67c23a; }
.import-feedback.has-errors { background: #fdf6ec; border: 1px solid #faecd8; color: #e6a23c; }
.feedback-header { display: flex; justify-content: space-between; align-items: center; }
.feedback-close { background: none; border: none; font-size: 18px; cursor: pointer; color: inherit; opacity: 0.7; }
.error-list { margin-top: 8px; max-height: 180px; overflow-y: auto; }
.error-list p { margin: 2px 0; font-size: 12px; color: #f56c6c; }
.error-more { font-style: italic; color: #909399 !important; }

/* ── 编排 ────────────────────────────────────────────────── */
.schedule-events { display: flex; flex-direction: column; gap: 10px; }
.schedule-event-card { border: 1px solid var(--border-color, #e4e7ed); border-radius: 10px; overflow: hidden; transition: border-color 0.2s; }
.schedule-event-card.expanded { border-color: #a0cfff; }
.event-card-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: var(--bg-primary, #fafafa); cursor: pointer; transition: background 0.15s; }
.event-card-header:hover { background: #f0f5ff; }
.event-card-left { display: flex; align-items: center; gap: 8px; }
.expand-arrow { font-size: 12px; color: var(--text-secondary, #909399); width: 14px; transition: transform 0.2s; }
.event-meta { font-size: 12px; color: var(--text-secondary, #909399); }
.heat-count-badge { background: #ecf5ff; color: #409eff; font-size: 11px; padding: 1px 8px; border-radius: 10px; }
.no-schedule-hint { font-size: 12px; color: var(--text-placeholder, #c0c4cc); }
.event-card-actions { display: flex; gap: 8px; }
.expand-enter-active, .expand-leave-active { transition: all 0.25s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 1200px; }
.heats-container { padding: 12px 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
.heat-card { border: 1px solid var(--border-color, #ebeef5); border-radius: 8px; padding: 10px; }
.heat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; font-weight: 600; }
.lanes-list { display: flex; flex-direction: column; gap: 3px; }
.lane-item { display: flex; gap: 8px; align-items: center; font-size: 13px; padding: 4px 8px; background: var(--bg-primary, #fafafa); border-radius: 4px; }
.lane-number { font-weight: 600; color: var(--primary-color, #409eff); min-width: 40px; font-size: 12px; }
.lane-athlete { font-weight: 500; }
.lane-dept { color: var(--text-secondary, #909399); font-size: 12px; margin-left: auto; }
.lanes-input { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.lanes-input input { padding: 6px 8px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 6px; text-align: center; width: 56px; }

/* ── 成绩录入 ────────────────────────────────────────────── */
.event-select { min-width: 220px; }
.result-entry-section { margin-bottom: 24px; }
.result-entry-section h4, .results-table-section h4 { margin: 0 0 12px; font-size: 15px; font-weight: 600; }
.section-sub { font-weight: 400; color: var(--text-secondary, #909399); font-size: 13px; }
.result-entry-header { display: flex; align-items: center; gap: 12px; padding: 6px 12px; font-size: 12px; font-weight: 600; color: var(--text-secondary, #909399); }
.reh-seq { width: 24px; } .reh-name { width: 80px; } .reh-sn { width: 90px; } .reh-dept { width: 100px; } .reh-val { width: 120px; } .reh-remark { width: 80px; }
.result-entry-list { display: flex; flex-direction: column; gap: 4px; }
.result-entry-row { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: var(--bg-primary, #fafafa); border-radius: 8px; transition: background 0.15s; }
.result-entry-row:hover { background: #f0f5ff; }
.entry-seq { width: 24px; font-size: 12px; color: var(--text-secondary, #909399); text-align: center; }
.entry-name { font-weight: 500; width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.entry-sn { width: 90px; font-size: 12px; color: var(--text-secondary, #909399); }
.entry-dept { color: var(--text-secondary, #909399); font-size: 13px; width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.result-input { padding: 6px 10px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 6px; width: 120px; font-size: 14px; outline: none; transition: border-color 0.2s; }
.result-input:focus { border-color: var(--primary-color, #409eff); box-shadow: 0 0 0 2px rgba(64,158,255,0.1); }
.remark-select { padding: 6px 8px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 6px; font-size: 12px; width: 80px; }
.result-val { font-family: 'SF Mono', Monaco, Consolas, monospace; font-weight: 600; }
.score-pill { background: #ecf5ff; color: #409eff; font-weight: 600; padding: 2px 8px; border-radius: 10px; font-size: 12px; }

/* ── 排名 ────────────────────────────────────────────────── */
.rank-display { font-size: 16px; color: var(--primary-color, #409eff); }
.rank-display.rank-lg { font-size: 20px; }
.rank-gold { background: rgba(255,215,0,0.06); }
.rank-gold .rank-display { color: #d4a017; }
.rank-silver { background: rgba(192,192,192,0.06); }
.rank-silver .rank-display { color: #8e8e8e; }
.rank-bronze { background: rgba(205,127,50,0.06); }
.rank-bronze .rank-display { color: #cd7f32; }
.rankings-table .medal { display: inline-flex; width: 28px; height: 28px; align-items: center; justify-content: center; border-radius: 50%; font-weight: 700; font-size: 14px; }
.medal.gold { background: #fff7e6; color: #d4a017; }
.medal.silver { background: #f5f5f5; color: #8e8e8e; }
.medal.bronze { background: #fef3e8; color: #cd7f32; }
.score-total { font-size: 16px; color: var(--primary-color, #409eff); }

/* ── 计分规则 ────────────────────────────────────────────── */
.rules-section { max-width: 600px; }
.rules-hint { font-size: 13px; color: var(--text-secondary, #909399); margin: 0 0 16px; }
.rules-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
.rule-item { display: flex; align-items: center; gap: 8px; background: var(--bg-primary, #fafafa); padding: 8px 12px; border-radius: 8px; }
.rule-rank { background: var(--primary-color, #409eff); color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.rule-input { width: 56px; padding: 6px 8px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 6px; text-align: center; font-size: 14px; font-weight: 600; outline: none; }
.rule-input:focus { border-color: var(--primary-color, #409eff); }
.rule-unit { font-size: 13px; color: var(--text-secondary, #909399); }
.rules-actions { display: flex; gap: 12px; }

/* ── 弹窗系统 ────────────────────────────────────────────── */
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.dialog-box { background: var(--bg-card, #fff); border-radius: 16px; width: 560px; max-width: 90vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.dialog-box.wide { width: 720px; }
.confirm-dialog { width: 420px; }
.confirm-dialog .confirm-message { font-size: 14px; color: var(--text-primary, #303133); line-height: 1.6; margin: 0; }
.confirm-danger .btn-danger { background: #f56c6c; }
.dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0; }
.dialog-header h3 { margin: 0; font-size: 17px; font-weight: 600; }
.close-btn { background: none; border: none; font-size: 22px; cursor: pointer; color: var(--text-secondary, #909399); padding: 0; line-height: 1; transition: color 0.15s; }
.close-btn:hover { color: var(--text-primary, #303133); }
.dialog-body { padding: 18px 24px; }
.dialog-footer { padding: 14px 24px 20px; display: flex; justify-content: flex-end; gap: 10px; }
.dialog-fade-enter-active { animation: dialogIn 0.25s ease; }
.dialog-fade-leave-active { animation: dialogOut 0.2s ease; }
@keyframes dialogIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes dialogOut { from { opacity: 1; } to { opacity: 0; } }
.dialog-fade-enter-active .dialog-box { animation: dialogBoxIn 0.25s ease; }
@keyframes dialogBoxIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

/* ── 表单 ────────────────────────────────────────────────── */
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-primary, #303133); margin-bottom: 5px; }
.required { color: #f56c6c; }
.form-group input:not([type="checkbox"]), .form-group textarea, .form-group select { width: 100%; padding: 9px 12px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; font-size: 14px; background: var(--bg-primary, #fff); color: var(--text-primary, #303133); box-sizing: border-box; outline: none; transition: border-color 0.2s; }
.form-group input:focus, .form-group select:focus { border-color: var(--primary-color, #409eff); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.checkbox-group label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.checkbox-group input[type="checkbox"] { width: auto; margin: 0; }

/* ── 预设 ────────────────────────────────────────────────── */
.preset-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
.preset-count { font-size: 13px; color: var(--primary-color, #409eff); font-weight: 600; margin-left: auto; }
.preset-section { margin-bottom: 16px; }
.preset-section h4 { font-size: 14px; margin: 0 0 8px; color: var(--text-primary, #303133); }
.preset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 6px; }
.preset-item { display: flex; align-items: center; gap: 6px; font-size: 13px; padding: 7px 10px; border: 1px solid var(--border-color, #e4e7ed); border-radius: 6px; cursor: pointer; transition: all 0.15s; }
.preset-item:hover { border-color: var(--primary-color, #409eff); }
.preset-item.selected { border-color: var(--primary-color, #409eff); background: #ecf5ff; color: #409eff; }
.preset-item input[type="checkbox"] { margin: 0; }

/* ── Toast 通知 ──────────────────────────────────────────── */
.toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
.toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 10px; font-size: 14px; box-shadow: 0 6px 20px rgba(0,0,0,0.12); min-width: 260px; max-width: 420px; backdrop-filter: blur(8px); }
.toast-success { background: #f0f9eb; border: 1px solid #e1f3d8; color: #67c23a; }
.toast-error { background: #fef0f0; border: 1px solid #fde2e2; color: #f56c6c; }
.toast-warning { background: #fdf6ec; border: 1px solid #faecd8; color: #e6a23c; }
.toast-info { background: #ecf5ff; border: 1px solid #d9ecff; color: #409eff; }
.toast-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.toast-success .toast-icon { background: #67c23a; color: #fff; }
.toast-error .toast-icon { background: #f56c6c; color: #fff; }
.toast-warning .toast-icon { background: #e6a23c; color: #fff; }
.toast-info .toast-icon { background: #409eff; color: #fff; }
.toast-msg { flex: 1; }
.toast-close { background: none; border: none; font-size: 16px; cursor: pointer; color: inherit; opacity: 0.6; padding: 0 0 0 4px; }
.toast-close:hover { opacity: 1; }
.toast-slide-enter-active { animation: toastIn 0.3s ease; }
.toast-slide-leave-active { animation: toastOut 0.25s ease; }
@keyframes toastIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes toastOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(40px); } }

/* ── 通用过渡 ────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── 全屏加载 ────────────────────────────────────────────── */
.full-loading { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.85); z-index: 100; gap: 12px; }
.full-loading p { font-size: 14px; color: var(--text-secondary, #909399); margin: 0; }

/* ── 响应式 ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .overview-stats { grid-template-columns: repeat(2, 1fr); }
  .tabs-nav { overflow-x: auto; }
  .form-row { grid-template-columns: 1fr; }
  .heats-container { grid-template-columns: 1fr; }
  .rules-grid { grid-template-columns: 1fr; }
  .preset-grid { grid-template-columns: 1fr; }
  .header-container { flex-direction: column; align-items: flex-start; }
  .search-input { width: 100%; }
}
</style>
