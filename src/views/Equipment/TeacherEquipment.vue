<template>
  <div class="teacher-equipment">
    <div class="header-section">
      <h2>器材库存管理</h2>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddModal = true">添加器材</button>
        <button class="btn btn-primary" @click="downloadTemplate">下载导入模板</button>
        <label class="btn btn-success import-label">
          批量导入
          <input type="file" accept=".xlsx,.xls" @change="handleImport" style="display:none" ref="importInput" />
        </label>
        <button class="btn btn-success" @click="refreshData">刷新</button>
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

    <!-- 搜索筛选区域 -->
    <div class="search-section card">
      <div class="search-row">
        <div class="search-item">
          <label>器材分类:</label>
          <select v-model="filters.category_id" @change="loadEquipmentItems">
            <option value="">全部分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="search-item">
          <label>搜索器材:</label>
          <input 
            type="text" 
            v-model="filters.keyword" 
            placeholder="输入器材名称或型号"
            @keyup.enter="loadEquipmentItems"
          />
        </div>
        <div class="search-item">
          <button class="btn btn-primary" @click="loadEquipmentItems">搜索</button>
        </div>
      </div>
    </div>

    <!-- 器材列表 -->
    <div class="equipment-list">
      <div class="list-header">
        <h3>器材库存列表</h3>
        <span class="total-count">共 {{ pagination.total }} 件器材</span>
      </div>
      
      <div class="equipment-table" v-if="!loading">
        <table>
          <thead>
            <tr>
              <th>器材名称</th>
              <th>分类</th>
              <th>型号/规格</th>
              <th>总数量</th>
              <th>可用</th>
              <th>借出</th>
              <th>损坏</th>
              <th>存放位置</th>
              <th>所属学校</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in equipmentItems" :key="item.id">
              <td class="equipment-name">
                <strong>{{ item.name }}</strong>
              </td>
              <td>{{ item.category_name }}</td>
              <td class="specification">{{ item.specification || item.model }}</td>
              <td class="quantity-total">{{ item.total_quantity }}</td>
              <td class="quantity-available">{{ item.available_quantity }}</td>
              <td class="quantity-borrowed">{{ item.borrowed_quantity }}</td>
              <td class="quantity-damaged">{{ item.damaged_quantity }}</td>
              <td>{{ item.storage_location }}</td>
              <td>{{ item.school || '—' }}</td>
              <td class="actions">
                <button class="btn btn-small btn-primary" @click="editItem(item)">
                  编辑
                </button>
                <button class="btn btn-small btn-success" @click="adjustStock(item)">
                  调整库存
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && equipmentItems.length === 0" class="empty-state">
        <p>暂无器材数据</p>
      </div>
    </div>

    <!-- 借用申请审批区域 -->
    <div class="applications-section">
      <div class="section-header">
        <h3>待审批借用申请</h3>
        <span class="pending-count">{{ pendingApplications.length }} 条待处理</span>
      </div>
      
      <div class="applications-list">
        <div 
          v-for="app in pendingApplications" 
          :key="app.id" 
          class="application-card"
        >
          <div class="application-info">
            <div class="applicant">
              <strong>{{ app.borrower_name }}</strong>
              <span class="user-type">{{ app.borrower_type === 'student' ? '学生' : '教师' }}</span>
            </div>
            <div class="equipment-info">
              器材：{{ app.equipment_name }} × {{ app.quantity }}
            </div>
            <div class="time-info">
              借用时间：{{ formatDateTime(app.borrow_date) }} - {{ formatDateTime(app.expected_return_date) }}
            </div>
            <div class="purpose">
              用途：{{ app.purpose }}
            </div>
          </div>
          <div class="application-actions">
            <button 
              class="btn btn-success" 
              @click="approveApplication(app.id, 'approved')"
            >
              同意
            </button>
            <button 
              class="btn btn-danger" 
              @click="approveApplication(app.id, 'rejected')"
            >
              拒绝
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑器材模态框 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddModal ? '添加器材' : '编辑器材' }}</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveEquipment">
            <div class="form-row">
              <div class="form-group">
                <label>器材分类 *</label>
                <select v-model="equipmentForm.category_id" required>
                  <option value="">请选择分类</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>器材名称 *</label>
                <input type="text" v-model="equipmentForm.name" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>型号</label>
                <input type="text" v-model="equipmentForm.model" />
              </div>
              <div class="form-group">
                <label>总数量 *</label>
                <input type="number" v-model="equipmentForm.total_quantity" min="0" required />
              </div>
            </div>
            <div class="form-group">
              <label>规格描述</label>
              <textarea v-model="equipmentForm.specification" rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>单价 (元)</label>
                <input type="number" v-model="equipmentForm.unit_price" min="0" step="0.01" />
              </div>
              <div class="form-group">
                <label>购买日期</label>
                <input type="date" v-model="equipmentForm.purchase_date" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>保修期 (月)</label>
                <input type="number" v-model="equipmentForm.warranty_period" min="0" />
              </div>
              <div class="form-group">
                <label>存放位置</label>
                <input type="text" v-model="equipmentForm.storage_location" />
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModals">
                取消
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 库存调整模态框 -->
    <div v-if="showStockModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>调整库存 - {{ currentItem?.name }}</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div class="stock-info">
            <div class="stock-item">
              <label>当前总数量:</label>
              <span>{{ currentItem?.total_quantity }}</span>
            </div>
            <div class="stock-item">
              <label>可用数量:</label>
              <span>{{ currentItem?.available_quantity }}</span>
            </div>
          </div>
          <form @submit.prevent="saveStockAdjustment">
            <div class="form-group">
              <label>调整类型 *</label>
              <select v-model="stockForm.type" required>
                <option value="increase">增加库存</option>
                <option value="decrease">减少库存</option>
                <option value="damage">损坏报废</option>
              </select>
            </div>
            <div class="form-group">
              <label>调整数量 *</label>
              <input type="number" v-model="stockForm.quantity" min="1" required />
            </div>
            <div class="form-group">
              <label>调整原因 *</label>
              <textarea v-model="stockForm.reason" rows="3" required></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModals">
                取消
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? '调整中...' : '确认调整' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api'

export default {
  name: 'TeacherEquipment',
  data() {
    return {
      // 数据列表
      categories: [],
      equipmentItems: [],
      pendingApplications: [],
      importResult: null,
      
      // 搜索筛选
      filters: {
        category_id: '',
        keyword: '',
        page: 1,
        limit: 10
      },
      
      // 分页信息
      pagination: {
        total: 0,
        page: 1,
        limit: 10
      },
      
      // 模态框控制
      showAddModal: false,
      showEditModal: false,
      showStockModal: false,
      
      // 表单数据
      equipmentForm: {
        category_id: '',
        name: '',
        model: '',
        specification: '',
        total_quantity: 0,
        unit_price: 0,
        purchase_date: '',
        warranty_period: 12,
        storage_location: ''
      },
      
      stockForm: {
        type: 'increase',
        quantity: 1,
        reason: ''
      },
      
      // 当前操作项
      currentItem: null,
      
      // 状态
      loading: false,
      saving: false
    }
  },
  
  async mounted() {
    await this.initData()
  },
  
  methods: {
    async initData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadCategories(),
          this.loadEquipmentItems(),
          this.loadPendingApplications()
        ])
      } catch (error) {
        console.error('初始化数据失败:', error)
        alert('加载数据失败，请刷新重试')
      } finally {
        this.loading = false
      }
    },
    
    async loadCategories() {
      try {
        const response = await api.equipment.getCategories()
        this.categories = response.data
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },
    
    async loadEquipmentItems() {
      this.loading = true
      try {
        const response = await api.equipment.getItems(this.filters)
        this.equipmentItems = response.data.items
        this.pagination = {
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit
        }
      } catch (error) {
        console.error('加载器材列表失败:', error)
        alert('加载器材列表失败')
      } finally {
        this.loading = false
      }
    },
    
    async loadPendingApplications() {
      try {
        const response = await api.equipment.getApplications({ status: 'pending' })
        this.pendingApplications = response.data.items
      } catch (error) {
        console.error('加载申请列表失败:', error)
      }
    },
    
    async refreshData() {
      await this.initData()
    },

    async downloadTemplate() {
      try {
        const res = await api.importData.getEquipmentTemplate()
        const url = URL.createObjectURL(new Blob([res]))
        const a = document.createElement('a')
        a.href = url; a.download = 'equipment_import_template.xlsx'; a.click()
        URL.revokeObjectURL(url)
      } catch (e) {
        alert('下载失败: ' + e.message)
      }
    },

    async handleImport(e) {
      const file = e.target.files[0]
      if (!file) return
      this.$refs.importInput.value = ''
      try {
        const res = await api.importData.importEquipment(file)
        this.importResult = res.data
        await this.initData()
      } catch (e) {
        alert('导入失败: ' + e.message)
      }
    },

    editItem(item) {
      this.currentItem = item
      this.equipmentForm = { ...item }
      this.showEditModal = true
    },
    
    adjustStock(item) {
      this.currentItem = item
      this.stockForm = {
        type: 'increase',
        quantity: 1,
        reason: ''
      }
      this.showStockModal = true
    },
    
    async saveEquipment() {
      this.saving = true
      try {
        if (this.showAddModal) {
          await api.equipment.addItem(this.equipmentForm)
          alert('添加成功')
        } else {
          await api.equipment.updateItem(this.currentItem.id, this.equipmentForm)
          alert('更新成功')
        }
        
        this.closeModals()
        await this.loadEquipmentItems()
      } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败，请重试')
      } finally {
        this.saving = false
      }
    },
    
    async saveStockAdjustment() {
      this.saving = true
      try {
        await api.equipment.adjustStock(this.currentItem.id, this.stockForm)
        alert('库存调整成功')
        this.closeModals()
        await this.loadEquipmentItems()
      } catch (error) {
        console.error('库存调整失败:', error)
        alert('库存调整失败，请重试')
      } finally {
        this.saving = false
      }
    },
    
    async approveApplication(id, status) {
      try {
        const remark = status === 'approved' ? '申请已通过' : '申请被拒绝'
        await api.equipment.approveApplication(id, { status, remark })
        alert(status === 'approved' ? '申请已同意' : '申请已拒绝')
        await this.loadPendingApplications()
        await this.loadEquipmentItems()
      } catch (error) {
        console.error('审批失败:', error)
        alert('审批操作失败，请重试')
      }
    },
    
    closeModals() {
      this.showAddModal = false
      this.showEditModal = false
      this.showStockModal = false
      this.currentItem = null
      this.equipmentForm = {
        category_id: '',
        name: '',
        model: '',
        specification: '',
        total_quantity: 0,
        unit_price: 0,
        purchase_date: '',
        warranty_period: 12,
        storage_location: ''
      }
    },
    
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.teacher-equipment {
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-section h2 {
  color: #000000d9;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-section {
  margin-bottom: 24px;
  padding: 20px;
}

.search-row {
  display: flex;
  align-items: end;
  gap: 20px;
  flex-wrap: wrap;
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-item label {
  font-weight: 500;
  color: #00000073;
}

.search-item input,
.search-item select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  min-width: 200px;
}

.equipment-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
  margin-bottom: 24px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h3 {
  margin: 0;
  color: #000000d9;
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
}

.equipment-table th {
  background-color: #fafafa;
  font-weight: 600;
  color: #00000073;
}

.equipment-name strong {
  color: #000000d9;
}

.specification {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quantity-total { color: #000000d9; font-weight: 600; }
.quantity-available { color: #67c23a; font-weight: 600; }
.quantity-borrowed { color: #e6a23c; font-weight: 600; }
.quantity-damaged { color: #f56c6c; font-weight: 600; }

.actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #00000040;
}

.applications-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-light);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #000000d9;
}

.pending-count {
  background: #f56c6c;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.application-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.application-card:hover {
  border-color: #1677ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.application-info {
  flex: 1;
}

.applicant {
  margin-bottom: 8px;
}

.applicant strong {
  color: #000000d9;
  margin-right: 8px;
}

.user-type {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.equipment-info,
.time-info,
.purpose {
  color: #00000073;
  font-size: 14px;
  margin-bottom: 4px;
}

.application-actions {
  display: flex;
  gap: 8px;
}

.btn-danger {
  background-color: #f56c6c;
  color: white;
}

.btn-danger:hover {
  background-color: #f78989;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.modal-header h3 {
  margin: 0;
  color: #000000d9;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #00000040;
}

.close-btn:hover {
  color: #000000d9;
}

.modal-body {
  padding: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-group {
  flex: 1;
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #00000073;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1677ff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.btn-secondary {
  background: var(--bg-body);
  color: #00000073;
}

.btn-secondary:hover {
  background-color: #ebeef5;
}

.stock-info {
  background: var(--bg-body);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
}

.stock-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stock-item:last-child {
  margin-bottom: 0;
}

.stock-item label {
  color: #00000073;
}

.stock-item span {
  font-weight: 600;
  color: #000000d9;
}

.import-label {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

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
</style> 