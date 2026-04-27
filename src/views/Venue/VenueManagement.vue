<template>
  <div class="teacher-equipment">
    <div class="header-section">
      <h2>场馆管理</h2>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openAddModal">添加场馆</button>
        <button class="btn btn-primary" @click="downloadTemplate">下载导入模板</button>
        <label class="btn btn-success import-label">
          批量导入
          <input type="file" accept=".xlsx,.xls" @change="handleImport" style="display:none" ref="importInput" />
        </label>
        <button class="btn btn-success" @click="loadVenues">刷新</button>
      </div>
    </div>

    <!-- 导入结果提示 -->
    <div v-if="importResult" class="import-result card">
      <span>导入完成：成功 <strong>{{ importResult.imported }}</strong> 条</span>
      <span v-if="importResult.errors && importResult.errors.length"> ，错误 {{ importResult.errors.length }} 条</span>
      <ul v-if="importResult.errors && importResult.errors.length" class="error-list">
        <li v-for="err in importResult.errors" :key="err">{{ err }}</li>
      </ul>
      <button class="btn btn-small" @click="importResult = null">关闭</button>
    </div>

    <!-- 统计概览 -->
    <div class="stats-row card">
      <div class="stat-box">
        <span class="stat-num">{{ venues.length }}</span>
        <span class="stat-label">总场馆数</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-num available">{{ countByStatus('available') }}</span>
        <span class="stat-label">可用</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-num warning">{{ countByStatus('maintenance') }}</span>
        <span class="stat-label">维护中</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-box">
        <span class="stat-num danger">{{ countByStatus('closed') }}</span>
        <span class="stat-label">已关闭</span>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-section card">
      <div class="search-row">
        <div class="search-item">
          <label>场馆类型</label>
          <select v-model="typeFilter" @change="loadVenues">
            <option value="">全部类型</option>
            <option value="basketball">篮球场</option>
            <option value="football">足球场</option>
            <option value="tennis">网球场</option>
            <option value="badminton">羽毛球场</option>
            <option value="gym">健身房</option>
            <option value="swimming">游泳池</option>
            <option value="pingpong">乒乓球馆</option>
          </select>
        </div>
        <div class="search-item">
          <label>状态</label>
          <select v-model="statusFilter" @change="loadVenues">
            <option value="">全部状态</option>
            <option value="available">可用</option>
            <option value="maintenance">维护中</option>
            <option value="closed">已关闭</option>
          </select>
        </div>
        <div class="search-item">
          <label>搜索场馆</label>
          <input type="text" v-model="searchQuery" placeholder="输入场馆名称..." @keyup.enter="loadVenues" />
        </div>
        <div class="search-item">
          <button class="btn btn-primary" @click="loadVenues">搜索</button>
        </div>
      </div>
    </div>

    <!-- 场馆列表 -->
    <div class="equipment-list">
      <div class="list-header">
        <h3>场馆列表</h3>
        <span class="total-count">共 {{ venues.length }} 个场馆</span>
      </div>

      <div class="equipment-table" v-if="!loading">
        <table>
          <thead>
            <tr>
              <th>场馆名称</th>
              <th>类型</th>
              <th>容量</th>
              <th>位置</th>
              <th>开放时间</th>
              <th>价格</th>
              <th>所属学校</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="venue in venues" :key="venue.id">
              <td class="equipment-name">
                <strong>{{ venue.name }}</strong>
              </td>
              <td>{{ getTypeLabel(venue.type) }}</td>
              <td>{{ venue.capacity }} 人</td>
              <td>{{ venue.location || '—' }}</td>
              <td>{{ venue.open_time || '—' }}</td>
              <td>{{ venue.price > 0 ? venue.price + ' 元/时' : '免费' }}</td>
              <td>{{ venue.school || '—' }}</td>
              <td>
                <span class="status-badge" :class="venue.status">
                  {{ getStatusLabel(venue.status) }}
                </span>
              </td>
              <td class="actions">
                <button class="btn btn-small btn-primary" @click="viewSchedule(venue)">预约日历</button>
                <button class="btn btn-small" @click="openEditModal(venue)">编辑</button>
                <button
                  class="btn btn-small"
                  :class="venue.status === 'available' ? 'btn-warning' : 'btn-success'"
                  @click="toggleStatus(venue)"
                >{{ venue.status === 'available' ? '关闭' : '开放' }}</button>
                <button class="btn btn-small btn-danger" @click="deleteVenue(venue)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>

      <div v-if="!loading && venues.length === 0" class="empty-state">
        <p>暂无场馆数据，点击"添加场馆"开始管理</p>
      </div>
    </div>

    <!-- 预约日历区域 -->
    <div v-if="showSchedule" class="applications-section">
      <div class="section-header">
        <h3>{{ selectedVenue?.name }} — 预约日历</h3>
        <div class="section-tools">
          <input type="date" v-model="scheduleDate" @change="loadSchedule" />
          <button class="btn btn-small btn-primary" @click="loadSchedule">查询</button>
          <button class="btn btn-small" @click="showSchedule = false">关闭</button>
        </div>
      </div>

      <div v-if="schedule.length === 0" class="empty-state" style="margin:0">
        <p>该日期暂无预约</p>
      </div>

      <div v-else class="applications-list">
        <div
          v-for="r in schedule"
          :key="r.id"
          class="application-card"
        >
          <div class="application-info">
            <div class="applicant">
              <strong>{{ r.booker_name }}</strong>
              <span class="user-type">{{ r.people_count }} 人</span>
            </div>
            <div class="equipment-info">
              时间：{{ formatTime(r.start_time) }} — {{ formatTime(r.end_time) }}
            </div>
            <div class="time-info" v-if="r.purpose">用途：{{ r.purpose }}</div>
          </div>
          <div class="application-actions">
            <span class="status-badge" :class="r.status">{{ getReservationStatusLabel(r.status) }}</span>
            <template v-if="r.status === 'pending'">
              <button class="btn btn-small btn-success" @click="approveReservation(r, true)">批准</button>
              <button class="btn btn-small btn-danger" @click="promptReject(r)">拒绝</button>
            </template>
            <template v-else-if="r.status === 'approved'">
              <button class="btn btn-small btn-primary" @click="completeReservation(r)">完成</button>
            </template>
          </div>
        </div>
      </div>

      <!-- 拒绝原因弹窗 -->
      <div v-if="showRejectModal" class="modal-overlay" @click.self="showRejectModal = false">
        <div class="modal-content" style="max-width:420px">
          <div class="modal-header">
            <h3>填写拒绝原因</h3>
            <button class="close-btn" @click="showRejectModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>拒绝原因（必填）</label>
              <textarea v-model="rejectReason" rows="4" placeholder="请说明拒绝理由..."></textarea>
            </div>
            <div class="form-actions">
              <button class="btn" @click="showRejectModal = false">取消</button>
              <button class="btn btn-danger" @click="confirmReject">确认拒绝</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑场馆模态框 -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeFormModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingVenue ? '编辑场馆' : '添加场馆' }}</h3>
          <button class="close-btn" @click="closeFormModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-row">
              <div class="form-group">
                <label>场馆名称 *</label>
                <input type="text" v-model="form.name" required placeholder="例：第一篮球场" />
              </div>
              <div class="form-group">
                <label>场馆类型 *</label>
                <select v-model="form.type" required>
                  <option value="">请选择</option>
                  <option value="basketball">篮球场</option>
                  <option value="football">足球场</option>
                  <option value="tennis">网球场</option>
                  <option value="badminton">羽毛球场</option>
                  <option value="gym">健身房</option>
                  <option value="swimming">游泳池</option>
                  <option value="pingpong">乒乓球馆</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>容量（人）*</label>
                <input type="number" v-model.number="form.capacity" min="1" required />
              </div>
              <div class="form-group">
                <label>价格（元/时，0为免费）</label>
                <input type="number" v-model.number="form.price" min="0" step="0.01" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>位置</label>
                <input type="text" v-model="form.location" placeholder="例：体育馆一楼东侧" />
              </div>
              <div class="form-group">
                <label>开放时间</label>
                <input type="text" v-model="form.open_time" placeholder="例：06:00-22:00" />
              </div>
            </div>
            <div class="form-group">
              <label>设施描述</label>
              <textarea v-model="form.description" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn" @click="closeFormModal">取消</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? '提交中...' : (editingVenue ? '保存修改' : '添加场馆') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'VenueManagement',
  data() {
    return {
      loading: false,
      submitting: false,
      importResult: null,
      venues: [],
      typeFilter: '',
      statusFilter: '',
      searchQuery: '',
      showFormModal: false,
      editingVenue: null,
      form: { name: '', type: '', capacity: 1, price: 0, location: '', open_time: '', description: '' },
      showSchedule: false,
      selectedVenue: null,
      schedule: [],
      scheduleDate: new Date().toISOString().slice(0, 10),
      showRejectModal: false,
      rejectReason: '',
      rejectingReservation: null,
      toast: { show: false, message: '', type: 'success' }
    }
  },
  mounted() {
    this.loadVenues()
  },
  methods: {
    async loadVenues() {
      this.loading = true
      try {
        const params = {}
        if (this.typeFilter) params.type = this.typeFilter
        if (this.statusFilter) params.status = this.statusFilter
        if (this.searchQuery) params.keyword = this.searchQuery
        const res = await api.venue.getVenues(params)
        this.venues = res.data || []
      } catch (e) {
        this.showToast('加载失败: ' + e.message, 'error')
      } finally {
        this.loading = false
      }
    },
    async loadSchedule() {
      if (!this.selectedVenue) return
      try {
        const res = await api.venue.getSchedule(this.selectedVenue.id, this.scheduleDate)
        this.schedule = res.data || []
      } catch (e) {
        this.showToast('加载日历失败: ' + e.message, 'error')
      }
    },
    viewSchedule(venue) {
      this.selectedVenue = venue
      this.showSchedule = true
      this.loadSchedule()
    },
    openAddModal() {
      this.editingVenue = null
      this.form = { name: '', type: '', capacity: 1, price: 0, location: '', open_time: '', description: '' }
      this.showFormModal = true
    },
    openEditModal(venue) {
      this.editingVenue = venue
      this.form = {
        name: venue.name, type: venue.type, capacity: venue.capacity,
        price: venue.price || 0, location: venue.location || '',
        open_time: venue.open_time || '', description: venue.description || ''
      }
      this.showFormModal = true
    },
    closeFormModal() { this.showFormModal = false },
    async submitForm() {
      this.submitting = true
      try {
        const payload = { ...this.form }
        if (this.editingVenue) {
          await api.venue.updateVenue(this.editingVenue.id, payload)
          this.showToast('场馆更新成功')
        } else {
          await api.venue.addVenue(payload)
          this.showToast('场馆添加成功')
        }
        this.closeFormModal()
        await this.loadVenues()
      } catch (e) {
        this.showToast('操作失败: ' + e.message, 'error')
      } finally {
        this.submitting = false
      }
    },
    async toggleStatus(venue) {
      const newStatus = venue.status === 'available' ? 'closed' : 'available'
      if (!confirm(`确认将「${venue.name}」${newStatus === 'available' ? '开放' : '关闭'}？`)) return
      try {
        await api.venue.updateVenueStatus(venue.id, newStatus)
        this.showToast('状态更新成功')
        await this.loadVenues()
      } catch (e) {
        this.showToast('操作失败: ' + e.message, 'error')
      }
    },
    async deleteVenue(venue) {
      if (!confirm(`确认删除场馆「${venue.name}」？此操作不可恢复。`)) return
      try {
        await api.venue.deleteVenue(venue.id)
        this.showToast('场馆已删除')
        await this.loadVenues()
        if (this.selectedVenue?.id === venue.id) this.showSchedule = false
      } catch (e) {
        this.showToast('删除失败: ' + e.message, 'error')
      }
    },
    async approveReservation(r, approved) {
      try {
        await api.venue.approveReservation(r.id, { approved, reject_reason: '' })
        this.showToast(approved ? '已批准' : '已撤销')
        await this.loadSchedule()
      } catch (e) {
        this.showToast('操作失败: ' + e.message, 'error')
      }
    },
    promptReject(r) {
      this.rejectingReservation = r
      this.rejectReason = ''
      this.showRejectModal = true
    },
    async confirmReject() {
      if (!this.rejectReason.trim()) { this.showToast('请填写拒绝原因', 'error'); return }
      try {
        await api.venue.approveReservation(this.rejectingReservation.id, {
          approved: false, reject_reason: this.rejectReason
        })
        this.showToast('已拒绝')
        this.showRejectModal = false
        await this.loadSchedule()
      } catch (e) {
        this.showToast('操作失败: ' + e.message, 'error')
      }
    },
    async completeReservation(r) {
      if (!confirm('确认将该预约标记为已完成？')) return
      try {
        await api.venue.completeReservation(r.id)
        this.showToast('已标记完成')
        await this.loadSchedule()
      } catch (e) {
        this.showToast('操作失败: ' + e.message, 'error')
      }
    },
    async downloadTemplate() {
      try {
        const res = await api.importData.getVenueTemplate()
        const url = URL.createObjectURL(new Blob([res]))
        const a = document.createElement('a')
        a.href = url; a.download = 'venue_import_template.xlsx'; a.click()
        URL.revokeObjectURL(url)
      } catch (e) { this.showToast('下载失败: ' + e.message, 'error') }
    },
    async handleImport(e) {
      const file = e.target.files[0]
      if (!file) return
      this.$refs.importInput.value = ''
      try {
        const res = await api.importData.importVenues(file)
        this.importResult = res.data
        this.showToast(`导入完成，成功 ${res.data.imported} 条`)
        await this.loadVenues()
      } catch (e) { this.showToast('导入失败: ' + e.message, 'error') }
    },
    countByStatus(s) { return this.venues.filter(v => v.status === s).length },
    getTypeLabel(t) {
      return { basketball:'篮球场', football:'足球场', tennis:'网球场', badminton:'羽毛球场', gym:'健身房', swimming:'游泳池', pingpong:'乒乓球馆' }[t] || t
    },
    getStatusLabel(s) { return { available:'可用', maintenance:'维护中', closed:'已关闭' }[s] || s },
    getReservationStatusLabel(s) {
      return { pending:'待审批', approved:'已批准', rejected:'已拒绝', cancelled:'已取消', completed:'已完成' }[s] || s
    },
    formatTime(t) { return t ? t.slice(0, 5) : '' },
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, 3000)
    }
  }
}
</script>

<style scoped>
.teacher-equipment {
  padding: 24px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-section h2 {
  font-size: 22px;
  font-weight: 600;
  color: #000000d9;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 统计条 */
.stats-row {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 16px 24px;
  margin-bottom: 20px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px;
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: #000000d9;
  line-height: 1.2;
}

.stat-num.available { color: #67c23a; }
.stat-num.warning { color: #e6a23c; }
.stat-num.danger { color: #f56c6c; }

.stat-label {
  font-size: 12px;
  color: #00000073;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #ebeef5;
}

/* card 通用 */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
}

/* 搜索区 */
.search-section {
  margin-bottom: 20px;
  padding: 20px;
}

.search-row {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-item label {
  font-size: 13px;
  font-weight: 500;
  color: #00000073;
}

.search-item input,
.search-item select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  min-width: 160px;
  font-size: 14px;
  outline: none;
}

.search-item input:focus,
.search-item select:focus {
  border-color: #1677ff;
}

/* 列表区 */
.equipment-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
  margin-bottom: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h3 {
  margin: 0;
  color: #000000d9;
  font-size: 16px;
  font-weight: 600;
}

.total-count {
  color: #00000040;
  font-size: 14px;
}

.equipment-table table {
  width: 100%;
  border-collapse: collapse;
}

.equipment-table th,
.equipment-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
}

.equipment-table th {
  background-color: #fafafa;
  font-weight: 600;
  color: #00000073;
}

.equipment-name strong { color: #000000d9; }

.actions { display: flex; gap: 6px; flex-wrap: wrap; }

/* 状态标签 */
.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.available { background: #f0f9e8; color: #67c23a; }
.status-badge.maintenance { background: #fdf6ec; color: #e6a23c; }
.status-badge.closed { background: #fef0f0; color: #f56c6c; }
.status-badge.pending { background: #fdf6ec; color: #e6a23c; }
.status-badge.approved { background: #f0f9e8; color: #67c23a; }
.status-badge.rejected { background: #fef0f0; color: #f56c6c; }
.status-badge.cancelled { background: #f4f4f5; color: #909399; }
.status-badge.completed { background: #ecf5ff; color: #1677ff; }

/* 预约日历区域 - 复用 applications-section 样式 */
.applications-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #000000d9;
}

.section-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-tools input[type="date"] {
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 13px;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.application-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fafafa;
  gap: 16px;
}

.application-info { flex: 1; }

.applicant {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.applicant strong { color: #000000d9; font-size: 14px; }

.user-type {
  font-size: 12px;
  color: #00000040;
  background: #f4f4f5;
  padding: 1px 8px;
  border-radius: 8px;
}

.equipment-info, .time-info {
  font-size: 13px;
  color: #00000073;
  margin-top: 3px;
}

.application-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

/* 按钮 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-primary { background: #1677ff; color: white; }
.btn-primary:hover:not(:disabled) { background: #0958d9; }

.btn-success { background: #67c23a; color: white; }
.btn-success:hover { background: #5daf34; }

.btn-warning { background: #e6a23c; color: white; }
.btn-warning:hover { background: #d1940a; }

.btn-danger { background: #f56c6c; color: white; }
.btn-danger:hover { background: #e05555; }

.btn-small { padding: 5px 10px; font-size: 12px; }

/* 加载/空状态 */
.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #00000040;
  font-size: 15px;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 560px;
  max-width: 94vw;
  max-height: 88vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #ebeef5;
}

.modal-header h3 { margin: 0; font-size: 16px; color: #000000d9; }

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #00000040;
  padding: 0;
  line-height: 1;
}

.close-btn:hover { color: #000000d9; }

.modal-body { padding: 20px; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group { margin-bottom: 16px; }

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #00000073;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: #1677ff; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

/* 导入模板按钮 */
.import-label {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

/* 导入结果 */
.import-result {
  padding: 14px 20px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #000000d9;
}

.error-list {
  margin: 4px 0 0 16px;
  padding: 0;
  color: #f56c6c;
  font-size: 13px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 24px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast.success { background: #67c23a; color: white; }
.toast.error { background: #f56c6c; color: white; }
</style>
