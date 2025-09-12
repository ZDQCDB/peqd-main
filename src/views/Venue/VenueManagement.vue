<template>
  <div class="venue-management">
    <div class="header">
      <h2>校方场馆管理</h2>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddModal = true">
          <i class="icon">➕</i> 添加场馆
        </button>
        <button class="btn btn-secondary" @click="exportReport">
          <i class="icon">📊</i> 导出报表
        </button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">🏢</div>
        <div class="stat-info">
          <div class="stat-number">{{ venues.length }}</div>
          <div class="stat-label">总场馆数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-number">{{ getAvailableVenues() }}</div>
          <div class="stat-label">可用场馆</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🔧</div>
        <div class="stat-info">
          <div class="stat-number">{{ getMaintenanceVenues() }}</div>
          <div class="stat-label">维护中</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-number">{{ getAverageUtilization() }}%</div>
          <div class="stat-label">平均利用率</div>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <div class="filter-group">
        <label>场馆类型</label>
        <select v-model="typeFilter">
          <option value="">全部类型</option>
          <option value="basketball">篮球场</option>
          <option value="football">足球场</option>
          <option value="tennis">网球场</option>
          <option value="badminton">羽毛球场</option>
          <option value="gym">健身房</option>
          <option value="swimming">游泳池</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>状态</label>
        <select v-model="statusFilter">
          <option value="">全部状态</option>
          <option value="available">可用</option>
          <option value="occupied">使用中</option>
          <option value="maintenance">维护中</option>
          <option value="closed">关闭</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>搜索</label>
        <input type="text" v-model="searchQuery" placeholder="搜索场馆名称或编号..." />
      </div>
    </div>

    <!-- 场馆列表 -->
    <div class="venues-grid">
      <div 
        v-for="venue in filteredVenues" 
        :key="venue.id"
        class="venue-card"
        :class="getVenueStatusClass(venue)"
      >
        <div class="venue-header">
          <div class="venue-info">
            <h3 class="venue-name">{{ venue.name }}</h3>
            <div class="venue-id">编号: {{ venue.id }}</div>
          </div>
          <div class="venue-status" :class="venue.status">
            {{ getStatusLabel(venue.status) }}
          </div>
        </div>

        <div class="venue-details">
          <div class="detail-item">
            <i class="icon">🏷️</i>
            <span>{{ getTypeLabel(venue.type) }}</span>
          </div>
          <div class="detail-item">
            <i class="icon">👥</i>
            <span>容量: {{ venue.capacity }}人</span>
          </div>
          <div class="detail-item">
            <i class="icon">📍</i>
            <span>{{ venue.location }}</span>
          </div>
          <div class="detail-item">
            <i class="icon">💰</i>
            <span>{{ venue.price }}元/小时</span>
          </div>
        </div>

        <div class="venue-utilization">
          <div class="utilization-header">
            <span>今日利用率</span>
            <span>{{ venue.todayUtilization }}%</span>
          </div>
          <div class="utilization-bar">
            <div class="utilization-fill" :style="{ width: venue.todayUtilization + '%' }"></div>
          </div>
        </div>

        <div class="venue-schedule">
          <h4>今日预约情况</h4>
          <div class="time-slots">
            <div 
              v-for="slot in venue.todaySchedule" 
              :key="slot.time"
              class="time-slot"
              :class="slot.status"
            >
              <div class="slot-time">{{ slot.time }}</div>
              <div class="slot-info">{{ slot.info || '空闲' }}</div>
            </div>
          </div>
        </div>

        <div class="venue-actions">
          <button class="btn btn-small btn-outline" @click="viewDetails(venue)">详情</button>
          <button class="btn btn-small btn-outline" @click="editVenue(venue)">编辑</button>
          <button 
            class="btn btn-small"
            :class="venue.status === 'available' ? 'btn-warning' : 'btn-success'"
            @click="toggleVenueStatus(venue)"
          >
            {{ venue.status === 'available' ? '关闭' : '开放' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 添加场馆模态框 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>添加新场馆</h3>
          <button class="close-btn" @click="closeAddModal">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="addVenue">
            <div class="form-group">
              <label>场馆名称</label>
              <input type="text" v-model="newVenue.name" required />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>场馆类型</label>
                <select v-model="newVenue.type" required>
                  <option value="">请选择</option>
                  <option value="basketball">篮球场</option>
                  <option value="football">足球场</option>
                  <option value="tennis">网球场</option>
                  <option value="badminton">羽毛球场</option>
                  <option value="gym">健身房</option>
                  <option value="swimming">游泳池</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>容量（人）</label>
                <input type="number" v-model="newVenue.capacity" min="1" required />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>价格（元/小时）</label>
                <input type="number" v-model="newVenue.price" min="0" step="0.01" required />
              </div>
              
              <div class="form-group">
                <label>开放时间</label>
                <input type="text" v-model="newVenue.openTime" placeholder="例: 06:00-22:00" required />
              </div>
            </div>
            
            <div class="form-group">
              <label>位置</label>
              <input type="text" v-model="newVenue.location" required />
            </div>
            
            <div class="form-group">
              <label>设施描述</label>
              <textarea v-model="newVenue.description" rows="3"></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeAddModal">取消</button>
              <button type="submit" class="btn btn-primary">添加场馆</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VenueManagement',
  data() {
    return {
      showAddModal: false,
      typeFilter: '',
      statusFilter: '',
      searchQuery: '',
      newVenue: {
        name: '',
        type: '',
        capacity: '',
        price: '',
        location: '',
        openTime: '',
        description: ''
      },
      venues: [
        {
          id: 'B001',
          name: '第一篮球场',
          type: 'basketball',
          capacity: 100,
          location: '体育馆一楼东侧',
          price: 50,
          status: 'available',
          openTime: '06:00-22:00',
          todayUtilization: 75,
          todaySchedule: [
            { time: '08:00-10:00', status: 'occupied', info: '体育课 - 计科21-1班' },
            { time: '10:00-12:00', status: 'free' },
            { time: '14:00-16:00', status: 'occupied', info: '篮球队训练' },
            { time: '16:00-18:00', status: 'reserved', info: '已预约 - 张同学' },
            { time: '19:00-21:00', status: 'occupied', info: '社团活动' }
          ]
        },
        {
          id: 'B002',
          name: '第二篮球场',
          type: 'basketball',
          capacity: 100,
          location: '体育馆一楼西侧',
          price: 50,
          status: 'maintenance',
          openTime: '06:00-22:00',
          todayUtilization: 0,
          todaySchedule: [
            { time: '全天', status: 'maintenance', info: '地板维护中' }
          ]
        },
        {
          id: 'F001',
          name: '标准足球场',
          type: 'football',
          capacity: 200,
          location: '室外运动场',
          price: 100,
          status: 'available',
          openTime: '06:00-21:00',
          todayUtilization: 60,
          todaySchedule: [
            { time: '08:00-10:00', status: 'free' },
            { time: '10:00-12:00', status: 'occupied', info: '足球课 - 体育21班' },
            { time: '14:00-16:00', status: 'occupied', info: '足球队训练' },
            { time: '16:00-18:00', status: 'free' },
            { time: '19:00-21:00', status: 'reserved', info: '已预约 - 足球社' }
          ]
        },
        {
          id: 'T001',
          name: '网球场A',
          type: 'tennis',
          capacity: 20,
          location: '网球场馆',
          price: 80,
          status: 'available',
          openTime: '06:00-22:00',
          todayUtilization: 85,
          todaySchedule: [
            { time: '08:00-09:00', status: 'occupied', info: '私教课程' },
            { time: '09:00-10:00', status: 'occupied', info: '网球课' },
            { time: '10:00-11:00', status: 'reserved', info: '已预约 - 李教授' },
            { time: '14:00-15:00', status: 'occupied', info: '网球社团' },
            { time: '15:00-16:00', status: 'occupied', info: '已预约 - 王同学' }
          ]
        },
        {
          id: 'BD001',
          name: '羽毛球场1号',
          type: 'badminton',
          capacity: 40,
          location: '羽毛球馆',
          price: 30,
          status: 'available',
          openTime: '06:00-22:00',
          todayUtilization: 90,
          todaySchedule: [
            { time: '08:00-10:00', status: 'occupied', info: '羽毛球课' },
            { time: '10:00-12:00', status: 'occupied', info: '社团训练' },
            { time: '14:00-16:00', status: 'occupied', info: '已预约 - 多个用户' },
            { time: '16:00-18:00', status: 'occupied', info: '已预约 - 多个用户' },
            { time: '19:00-21:00', status: 'occupied', info: '羽毛球比赛' }
          ]
        },
        {
          id: 'GYM001',
          name: '综合健身房',
          type: 'gym',
          capacity: 50,
          location: '体育馆三楼',
          price: 20,
          status: 'available',
          openTime: '06:00-23:00',
          todayUtilization: 45,
          todaySchedule: [
            { time: '06:00-08:00', status: 'free' },
            { time: '08:00-12:00', status: 'occupied', info: '健身课程' },
            { time: '14:00-18:00', status: 'free' },
            { time: '18:00-22:00', status: 'occupied', info: '高峰期开放' }
          ]
        },
        {
          id: 'SW001',
          name: '标准游泳池',
          type: 'swimming',
          capacity: 80,
          location: '游泳馆',
          price: 25,
          status: 'closed',
          openTime: '06:00-22:00',
          todayUtilization: 0,
          todaySchedule: [
            { time: '全天', status: 'closed', info: '水质检测中' }
          ]
        }
      ]
    }
  },
  computed: {
    filteredVenues() {
      let filtered = this.venues;
      
      if (this.typeFilter) {
        filtered = filtered.filter(venue => venue.type === this.typeFilter);
      }
      
      if (this.statusFilter) {
        filtered = filtered.filter(venue => venue.status === this.statusFilter);
      }
      
      if (this.searchQuery) {
        filtered = filtered.filter(venue => 
          venue.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          venue.id.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      
      return filtered;
    }
  },
  methods: {
    getAvailableVenues() {
      return this.venues.filter(venue => venue.status === 'available').length;
    },
    
    getMaintenanceVenues() {
      return this.venues.filter(venue => venue.status === 'maintenance').length;
    },
    
    getAverageUtilization() {
      const total = this.venues.reduce((sum, venue) => sum + venue.todayUtilization, 0);
      return Math.round(total / this.venues.length);
    },
    
    getVenueStatusClass(venue) {
      return `status-${venue.status}`;
    },
    
    getStatusLabel(status) {
      const labels = {
        available: '可用',
        occupied: '使用中',
        maintenance: '维护中',
        closed: '关闭'
      };
      return labels[status] || status;
    },
    
    getTypeLabel(type) {
      const labels = {
        basketball: '篮球场',
        football: '足球场',
        tennis: '网球场',
        badminton: '羽毛球场',
        gym: '健身房',
        swimming: '游泳池'
      };
      return labels[type] || type;
    },
    
    viewDetails(venue) {
      alert(`查看场馆详情：${venue.name}`);
    },
    
    editVenue(venue) {
      alert(`编辑场馆：${venue.name}`);
    },
    
    toggleVenueStatus(venue) {
      if (venue.status === 'available') {
        venue.status = 'closed';
        venue.todayUtilization = 0;
      } else if (venue.status === 'closed') {
        venue.status = 'available';
      }
    },
    
    closeAddModal() {
      this.showAddModal = false;
      this.newVenue = {
        name: '',
        type: '',
        capacity: '',
        price: '',
        location: '',
        openTime: '',
        description: ''
      };
    },
    
    addVenue() {
      const newId = this.getNextVenueId(this.newVenue.type);
      const venue = {
        ...this.newVenue,
        id: newId,
        status: 'available',
        todayUtilization: 0,
        todaySchedule: [
          { time: '全天', status: 'free', info: '空闲' }
        ]
      };
      
      this.venues.push(venue);
      alert('场馆添加成功！');
      this.closeAddModal();
    },
    
    getNextVenueId(type) {
      const prefix = {
        basketball: 'B',
        football: 'F',
        tennis: 'T',
        badminton: 'BD',
        gym: 'GYM',
        swimming: 'SW'
      }[type] || 'V';
      
      const existing = this.venues
        .filter(v => v.id.startsWith(prefix))
        .map(v => parseInt(v.id.replace(/\D/g, '')))
        .filter(n => !isNaN(n));
      
      const maxNum = existing.length > 0 ? Math.max(...existing) : 0;
      return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
    },
    
    exportReport() {
      alert('导出场馆使用报表...');
    }
  }
}
</script>

<style scoped>
.venue-management {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header h2 {
  color: #303133;
  margin: 0;
  font-size: 28px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #409eff;
  color: white;
}

.btn-primary:hover {
  background: #337ecc;
}

.btn-secondary {
  background: #f4f4f5;
  color: #606266;
}

.btn-secondary:hover {
  background: #e6e6e7;
}

.btn-warning {
  background: #e6a23c;
  color: white;
}

.btn-warning:hover {
  background: #d1940a;
}

.btn-success {
  background: #67c23a;
  color: white;
}

.btn-success:hover {
  background: #5daf34;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-outline {
  background: transparent;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.btn-outline:hover {
  border-color: #409eff;
  color: #409eff;
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f9e8;
  border-radius: 50%;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

/* 筛选器 */
.filters {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #409eff;
}

/* 场馆网格 */
.venues-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.venue-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.venue-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.venue-card.status-available {
  border-left: 4px solid #67c23a;
}

.venue-card.status-occupied {
  border-left: 4px solid #409eff;
}

.venue-card.status-maintenance {
  border-left: 4px solid #e6a23c;
}

.venue-card.status-closed {
  border-left: 4px solid #f56c6c;
}

.venue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.venue-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.venue-id {
  font-size: 12px;
  color: #909399;
}

.venue-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.venue-status.available {
  background: #e1f3d8;
  color: #67c23a;
}

.venue-status.occupied {
  background: #ecf5ff;
  color: #409eff;
}

.venue-status.maintenance {
  background: #fdf6ec;
  color: #e6a23c;
}

.venue-status.closed {
  background: #fef0f0;
  color: #f56c6c;
}

.venue-details {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.icon {
  font-size: 16px;
}

.venue-utilization {
  margin-bottom: 16px;
}

.utilization-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.utilization-bar {
  height: 6px;
  background: #f5f7fa;
  border-radius: 3px;
  overflow: hidden;
}

.utilization-fill {
  height: 100%;
  background: linear-gradient(90deg, #67c23a, #85ce61);
  transition: width 0.3s;
}

.venue-schedule {
  margin-bottom: 20px;
}

.venue-schedule h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #303133;
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-slot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.time-slot.free {
  background: #f0f9e8;
  color: #67c23a;
}

.time-slot.occupied {
  background: #ecf5ff;
  color: #409eff;
}

.time-slot.reserved {
  background: #fdf6ec;
  color: #e6a23c;
}

.time-slot.maintenance {
  background: #fef0f0;
  color: #f56c6c;
}

.time-slot.closed {
  background: #f4f4f5;
  color: #909399;
}

.slot-time {
  font-weight: 500;
}

.slot-info {
  font-size: 11px;
  opacity: 0.8;
}

.venue-actions {
  display: flex;
  gap: 8px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.modal-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #909399;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #303133;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #409eff;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}
</style> 