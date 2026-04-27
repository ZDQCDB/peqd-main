<template>
  <div class="venue-reservation">
    <div class="page-header">
      <button class="btn btn-back" @click="$router.push('/dashboard')">← 返回桌面</button>
      <h2>场馆预约</h2>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ===== Tab: 选择场馆 ===== -->
    <div v-if="activeTab === 'venues'" class="tab-content">
      <!-- 筛选 -->
      <div class="filter-bar">
        <div class="filter-group">
          <label>类型</label>
          <select v-model="venueTypeFilter" @change="loadVenues">
            <option value="">全部</option>
            <option value="basketball">篮球场</option>
            <option value="football">足球场</option>
            <option value="tennis">网球场</option>
            <option value="badminton">羽毛球场</option>
            <option value="gym">健身房</option>
            <option value="swimming">游泳池</option>
            <option value="pingpong">乒乓球馆</option>
          </select>
        </div>
        <div class="filter-group">
          <label>搜索</label>
          <input v-model="venueSearch" placeholder="输入场馆名称..." @keyup.enter="loadVenues" />
        </div>
        <button class="btn btn-primary btn-sm" @click="loadVenues">搜索</button>
      </div>

      <div v-if="venuesLoading" class="loading-center">
        <div class="spinner"></div>
      </div>

      <div v-else-if="venues.length === 0" class="empty-tip">暂无可用场馆</div>

      <div v-else class="venues-grid">
        <div
          v-for="venue in venues"
          :key="venue.id"
          class="venue-card"
          :class="{ unavailable: venue.status !== 'available' }"
          @click="venue.status === 'available' && openBookModal(venue)"
        >
          <div class="venue-icon">{{ getTypeIcon(venue.type) }}</div>
          <div class="venue-info">
            <div class="venue-name">{{ venue.name }}</div>
            <div class="venue-meta">
              <span class="tag">{{ getTypeLabel(venue.type) }}</span>
              <span v-if="venue.location" class="venue-loc">{{ venue.location }}</span>
            </div>
            <div class="venue-meta2">
              <span>{{ venue.capacity }} 人</span>
              <span v-if="venue.price !== undefined">{{ venue.price > 0 ? venue.price + ' 元/时' : '免费' }}</span>
              <span v-if="venue.open_time">{{ venue.open_time }}</span>
            </div>
          </div>
          <div class="venue-status-badge" :class="venue.status">
            {{ getStatusLabel(venue.status) }}
          </div>
          <div v-if="venue.status === 'available'" class="book-hint">点击预约</div>
        </div>
      </div>
    </div>

    <!-- ===== Tab: 我的预约 ===== -->
    <div v-if="activeTab === 'mine'" class="tab-content">
      <div class="section-header">
        <h3>我的预约记录</h3>
        <button class="btn btn-secondary btn-sm" @click="loadMyReservations">刷新</button>
      </div>

      <div v-if="myLoading" class="loading-center"><div class="spinner"></div></div>

      <div v-else-if="myReservations.length === 0" class="empty-tip">暂无预约记录</div>

      <div v-else class="reservations-list">
        <div
          v-for="r in myReservations"
          :key="r.id"
          class="reservation-card"
          :class="r.status"
        >
          <div class="r-header">
            <div class="r-venue-name">{{ r.venue_name || '未知场馆' }}</div>
            <div class="r-status-badge" :class="r.status">{{ getReservationStatusLabel(r.status) }}</div>
          </div>
          <div class="r-body">
            <div class="r-row">
              <span class="r-key">预约日期</span>
              <span class="r-val">{{ r.reservation_date }}</span>
            </div>
            <div class="r-row">
              <span class="r-key">时间段</span>
              <span class="r-val">{{ formatTime(r.start_time) }} – {{ formatTime(r.end_time) }}</span>
            </div>
            <div class="r-row" v-if="r.purpose">
              <span class="r-key">使用目的</span>
              <span class="r-val">{{ r.purpose }}</span>
            </div>
            <div class="r-row" v-if="r.people_count">
              <span class="r-key">人数</span>
              <span class="r-val">{{ r.people_count }} 人</span>
            </div>
            <div class="r-row" v-if="r.reject_reason">
              <span class="r-key reject-key">拒绝原因</span>
              <span class="r-val reject-val">{{ r.reject_reason }}</span>
            </div>
            <div class="r-row" v-if="r.approved_by_name">
              <span class="r-key">审批人</span>
              <span class="r-val">{{ r.approved_by_name }}</span>
            </div>
          </div>
          <div class="r-footer" v-if="r.status === 'pending' || r.status === 'approved'">
            <button class="btn btn-danger btn-sm" @click="cancelReservation(r)">取消预约</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约弹窗 -->
    <div v-if="showBookModal" class="modal-overlay" @click.self="closeBookModal">
      <div class="modal-box">
        <div class="modal-head">
          <div>
            <h3>预约场馆</h3>
            <p class="modal-subtitle">{{ bookingVenue?.name }} · {{ getTypeLabel(bookingVenue?.type) }}</p>
          </div>
          <button class="close-btn" @click="closeBookModal">×</button>
        </div>
        <div class="modal-body">
          <!-- 日历：选日期 -->
          <div class="form-field">
            <label>预约日期 *</label>
            <input type="date" v-model="bookForm.reservation_date" :min="today" @change="loadVenueSchedule" />
          </div>

          <!-- 已预约时间段提示 -->
          <div v-if="venueSchedule.length > 0" class="occupied-hint">
            <div class="occupied-title">该日已占用时间段</div>
            <div v-for="s in occupiedSlots" :key="s.id" class="occupied-slot">
              {{ formatTime(s.start_time) }} – {{ formatTime(s.end_time) }}
              <span class="occ-status" :class="s.status">{{ getReservationStatusLabel(s.status) }}</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>开始时间 *</label>
              <input type="time" v-model="bookForm.start_time" step="1800" />
            </div>
            <div class="form-field">
              <label>结束时间 *</label>
              <input type="time" v-model="bookForm.end_time" step="1800" />
            </div>
          </div>
          <div class="form-field">
            <label>使用目的</label>
            <input type="text" v-model="bookForm.purpose" placeholder="例：班级活动、自由练习..." maxlength="100" />
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>人数</label>
              <input type="number" v-model.number="bookForm.people_count" min="1" :max="bookingVenue?.capacity" />
            </div>
            <div class="form-field">
              <label>联系电话</label>
              <input type="tel" v-model="bookForm.booker_phone" placeholder="选填" maxlength="20" />
            </div>
          </div>
          <div class="form-field">
            <label>备注</label>
            <textarea v-model="bookForm.remark" rows="2" placeholder="其他说明..."></textarea>
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" @click="closeBookModal">取消</button>
            <button class="btn btn-primary" :disabled="booking" @click="submitBooking">
              {{ booking ? '提交中...' : '提交预约' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'VenueReservation',
  data() {
    return {
      activeTab: 'venues',
      tabs: [
        { key: 'venues', label: '浏览场馆' },
        { key: 'mine', label: '我的预约' }
      ],
      venues: [],
      venuesLoading: false,
      venueTypeFilter: '',
      venueSearch: '',
      myReservations: [],
      myLoading: false,
      showBookModal: false,
      bookingVenue: null,
      bookForm: {
        venue_id: '',
        reservation_date: '',
        start_time: '',
        end_time: '',
        purpose: '',
        people_count: 1,
        booker_phone: '',
        remark: ''
      },
      venueSchedule: [],
      booking: false,
      toast: { show: false, message: '', type: 'success' }
    }
  },
  computed: {
    today() {
      return new Date().toISOString().slice(0, 10)
    },
    occupiedSlots() {
      return this.venueSchedule.filter(s => ['pending', 'approved'].includes(s.status))
    }
  },
  mounted() {
    this.loadVenues()
    this.loadMyReservations()
  },
  watch: {
    activeTab(val) {
      if (val === 'mine') this.loadMyReservations()
    }
  },
  methods: {
    async loadVenues() {
      this.venuesLoading = true
      try {
        const params = { status: 'available' }
        if (this.venueTypeFilter) params.type = this.venueTypeFilter
        if (this.venueSearch) params.keyword = this.venueSearch
        const res = await api.venue.getVenues(params)
        this.venues = res.data || []
      } catch (e) {
        this.showToast('加载场馆失败: ' + e.message, 'error')
      } finally {
        this.venuesLoading = false
      }
    },
    async loadMyReservations() {
      this.myLoading = true
      try {
        const res = await api.venue.getMyReservations()
        this.myReservations = res.data || []
      } catch (e) {
        this.showToast('加载预约记录失败: ' + e.message, 'error')
      } finally {
        this.myLoading = false
      }
    },
    openBookModal(venue) {
      this.bookingVenue = venue
      this.bookForm = {
        venue_id: venue.id,
        reservation_date: this.today,
        start_time: '',
        end_time: '',
        purpose: '',
        people_count: 1,
        booker_phone: '',
        remark: ''
      }
      this.venueSchedule = []
      this.showBookModal = true
      this.loadVenueSchedule()
    },
    closeBookModal() {
      this.showBookModal = false
      this.bookingVenue = null
    },
    async loadVenueSchedule() {
      if (!this.bookingVenue || !this.bookForm.reservation_date) return
      try {
        const res = await api.venue.getSchedule(this.bookingVenue.id, this.bookForm.reservation_date)
        this.venueSchedule = res.data || []
      } catch {
        this.venueSchedule = []
      }
    },
    async submitBooking() {
      if (!this.bookForm.reservation_date) {
        this.showToast('请选择预约日期', 'error'); return
      }
      if (!this.bookForm.start_time) {
        this.showToast('请选择开始时间', 'error'); return
      }
      if (!this.bookForm.end_time) {
        this.showToast('请选择结束时间', 'error'); return
      }
      if (this.bookForm.end_time <= this.bookForm.start_time) {
        this.showToast('结束时间必须晚于开始时间', 'error'); return
      }

      this.booking = true
      try {
        await api.venue.createReservation(this.bookForm)
        this.showToast('预约提交成功，等待管理员审批')
        this.closeBookModal()
        this.loadMyReservations()
        this.activeTab = 'mine'
      } catch (e) {
        this.showToast('预约失败: ' + e.message, 'error')
      } finally {
        this.booking = false
      }
    },
    async cancelReservation(reservation) {
      if (!confirm(`确认取消「${reservation.venue_name}」在 ${reservation.reservation_date} 的预约？`)) return
      try {
        await api.venue.cancelReservation(reservation.id)
        this.showToast('预约已取消')
        await this.loadMyReservations()
      } catch (e) {
        this.showToast('取消失败: ' + e.message, 'error')
      }
    },
    getTypeLabel(type) {
      const map = { basketball: '篮球场', football: '足球场', tennis: '网球场', badminton: '羽毛球场', gym: '健身房', swimming: '游泳池', pingpong: '乒乓球馆' }
      return map[type] || type
    },
    getTypeIcon(type) {
      const map = { basketball: '', football: '', tennis: '', badminton: '', gym: '', swimming: '', pingpong: '' }
      return map[type] || ''
    },
    getStatusLabel(status) {
      const map = { available: '可预约', maintenance: '维护中', closed: '关闭' }
      return map[status] || status
    },
    getReservationStatusLabel(status) {
      const map = { pending: '待审批', approved: '已批准', rejected: '已拒绝', cancelled: '已取消', completed: '已完成' }
      return map[status] || status
    },
    formatTime(t) {
      if (!t) return ''
      return typeof t === 'string' ? t.slice(0, 5) : t
    },
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, 3500)
    }
  }
}
</script>

<style scoped>
.venue-reservation {
  padding: 20px 24px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f5f6fa;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.page-header h2 { margin: 0; font-size: 24px; color: #222; font-weight: 700; }

.btn { padding: 8px 16px; border: none; border-radius: 7px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-back { background: white; border: 1px solid #d9d9d9; color: #555; }
.btn-back:hover { border-color: #1677ff; color: #1677ff; }
.btn-primary { background: #1677ff; color: white; }
.btn-primary:hover:not(:disabled) { background: #0958d9; }
.btn-secondary { background: #f4f4f5; color: #606266; }
.btn-secondary:hover { background: #e9e9eb; }
.btn-danger { background: #ff4d4f; color: white; }
.btn-danger:hover { background: #cf1322; }
.btn-sm { padding: 6px 14px; font-size: 13px; }

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  background: white;
  padding: 6px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  width: fit-content;
}
.tab-btn {
  padding: 9px 24px;
  border: none;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #888;
  transition: all 0.2s;
}
.tab-btn.active { background: #1677ff; color: white; font-weight: 600; }
.tab-btn:hover:not(.active) { background: #f0f5ff; color: #1677ff; }

.tab-content { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}
.filter-group { display: flex; flex-direction: column; gap: 5px; }
.filter-group label { font-size: 12px; color: #888; }
.filter-group select,
.filter-group input {
  padding: 7px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  min-width: 140px;
}
.filter-group select:focus,
.filter-group input:focus { border-color: #1677ff; }

.loading-center { display: flex; justify-content: center; padding: 60px; }
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f0f0f0;
  border-top-color: #1677ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-tip { text-align: center; color: #aaa; padding: 60px; font-size: 15px; }

.venues-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.venue-card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.venue-card:hover:not(.unavailable) {
  border-color: #1677ff;
  box-shadow: 0 4px 16px rgba(22,119,255,0.12);
}
.venue-card.unavailable { cursor: not-allowed; opacity: 0.6; }
.venue-icon { font-size: 36px; flex-shrink: 0; }
.venue-info { flex: 1; }
.venue-name { font-size: 16px; font-weight: 600; color: #222; margin-bottom: 6px; }
.venue-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 6px; }
.tag { padding: 2px 10px; background: #e6f4ff; color: #1677ff; border-radius: 10px; font-size: 12px; }
.venue-loc { font-size: 12px; color: #888; }
.venue-meta2 { display: flex; gap: 12px; font-size: 12px; color: #666; flex-wrap: wrap; }
.venue-status-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 3px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.venue-status-badge.available { background: #f6ffed; color: #52c41a; }
.venue-status-badge.maintenance { background: #fffbe6; color: #faad14; }
.venue-status-badge.closed { background: #fff1f0; color: #ff4d4f; }
.book-hint {
  position: absolute;
  bottom: 12px;
  right: 14px;
  font-size: 12px;
  color: #1677ff;
  font-weight: 500;
}

/* 我的预约 */
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h3 { margin: 0; font-size: 16px; color: #222; }
.reservations-list { display: flex; flex-direction: column; gap: 12px; }
.reservation-card {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}
.reservation-card.pending { border-left: 4px solid #faad14; }
.reservation-card.approved { border-left: 4px solid #52c41a; }
.reservation-card.rejected { border-left: 4px solid #ff4d4f; }
.reservation-card.cancelled { border-left: 4px solid #d9d9d9; opacity: 0.7; }
.reservation-card.completed { border-left: 4px solid #1677ff; }
.r-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px 10px; background: #fafafa; }
.r-venue-name { font-size: 15px; font-weight: 600; color: #222; }
.r-status-badge { padding: 3px 12px; border-radius: 10px; font-size: 12px; font-weight: 500; }
.r-status-badge.pending { background: #fffbe6; color: #d48806; }
.r-status-badge.approved { background: #f6ffed; color: #52c41a; }
.r-status-badge.rejected { background: #fff1f0; color: #ff4d4f; }
.r-status-badge.cancelled { background: #f5f5f5; color: #999; }
.r-status-badge.completed { background: #e6f4ff; color: #1677ff; }
.r-body { padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; }
.r-row { display: flex; gap: 12px; font-size: 13px; }
.r-key { color: #888; min-width: 70px; }
.r-val { color: #333; }
.reject-key { color: #ff4d4f; }
.reject-val { color: #ff4d4f; }
.r-footer { padding: 10px 16px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; }

/* 预约弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}
.modal-box {
  background: white;
  border-radius: 14px;
  width: 520px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.modal-head h3 { margin: 0 0 4px; font-size: 18px; color: #222; }
.modal-subtitle { margin: 0; font-size: 13px; color: #888; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #aaa; padding: 0; line-height: 1; }
.close-btn:hover { color: #333; }
.modal-body { padding: 20px 24px; }
.form-field { margin-bottom: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-field label { display: block; margin-bottom: 6px; font-size: 13px; color: #555; font-weight: 500; }
.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus { border-color: #1677ff; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }

.occupied-hint {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
}
.occupied-title { font-size: 13px; font-weight: 600; color: #d48806; margin-bottom: 8px; }
.occupied-slot { font-size: 12px; color: #555; display: flex; gap: 10px; align-items: center; margin-bottom: 4px; }
.occ-status { padding: 1px 8px; border-radius: 8px; font-size: 11px; }
.occ-status.pending { background: #fffbe6; color: #d48806; }
.occ-status.approved { background: #f6ffed; color: #52c41a; }

/* Toast */
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: opacity 0.3s;
}
.toast.success { background: #52c41a; color: white; }
.toast.error { background: #ff4d4f; color: white; }
</style>
