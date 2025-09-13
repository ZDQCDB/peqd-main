<template>
  <div class="equipment-sharing">
    <div class="header">
      <h1>运动装备共享</h1>
      <p class="subtitle">分享你的运动装备，让更多人享受运动的乐趣</p>
    </div>

    <div class="content">
      <!-- 装备展示区域 -->
      <div class="equipment-grid">
        <div class="equipment-card" v-for="item in equipmentList" :key="item.id">
          <div class="equipment-image">
            <img :src="item.image" :alt="item.name" @error="handleImageError" />
          </div>
          <div class="equipment-info">
            <h3>{{ item.name }}</h3>
            <p class="description">{{ item.description }}</p>
            <div class="meta">
              <span class="owner">{{ item.owner }}</span>
              <span class="status">{{ item.status }}</span>
            </div>
          </div>
          <div class="equipment-actions">
            <button class="btn-primary" @click="handleShare(item)">申请借用</button>
          </div>
        </div>
      </div>

      <!-- 添加装备按钮 -->
      <div class="add-equipment">
        <button class="btn-secondary" @click="showAddForm = true">
          + 分享我的装备
        </button>
      </div>

      <!-- 添加装备表单 -->
      <div v-if="showAddForm" class="add-form-overlay">
        <div class="add-form">
          <h2>分享装备</h2>
          <form @submit.prevent="submitEquipment">
            <div class="form-group">
              <label>装备名称</label>
              <input v-model="newEquipment.name" type="text" required>
            </div>
            <div class="form-group">
              <label>装备描述</label>
              <textarea v-model="newEquipment.description" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>装备图片</label>
              <div class="image-upload">
                <div class="upload-placeholder">
                  <span>点击上传图片</span>
                </div>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="cancelAdd">取消</button>
              <button type="submit" class="btn-primary">发布分享</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EquipmentSharing',
  data() {
    return {
      showAddForm: false,
      newEquipment: {
        name: '',
        description: '',
        image: null
      },
      equipmentList: [
        {
          id: 1,
          name: '篮球',
          description: '专业篮球，适合室内外使用',
          owner: '张三',
          status: '可借用',
          image: '/assets/images/equipment/basketball.jpg'
        },
        {
          id: 2,
          name: '羽毛球拍',
          description: '碳纤维材质，轻便耐用',
          owner: '李四',
          status: '已借出',
          image: '/assets/images/equipment/badminton.jpg'
        },
        {
          id: 3,
          name: '跑步鞋',
          description: '专业跑鞋，提供良好缓冲',
          owner: '王五',
          status: '可借用',
          image: '/assets/images/equipment/running-shoes.jpg'
        },
        {
          id: 4,
          name: '瑜伽垫',
          description: '环保材质，防滑设计',
          owner: '赵六',
          status: '可借用',
          image: '/assets/images/equipment/yoga-mat.jpg'
        },
        {
          id: 5,
          name: '哑铃套装',
          description: '5kg-20kg全套，专业健身',
          owner: '孙七',
          status: '可借用',
          image: '/assets/images/equipment/dumbbells.jpg'
        },
        {
          id: 6,
          name: '网球拍',
          description: '碳纤维材质，适合初学者',
          owner: '周八',
          status: '已借出',
          image: '/assets/images/equipment/tennis.jpg'
        }
      ]
    }
  },
  methods: {
    handleShare(item) {
      alert(`申请借用 ${item.name}`)
    },
    handleImageError(event) {
      // 图片加载失败时显示占位符
      const placeholder = document.createElement('div')
      placeholder.className = 'image-placeholder'
      placeholder.innerHTML = '<span>图片加载中</span>'
      event.target.parentNode.replaceChild(placeholder, event.target)
    },
    submitEquipment() {
      // 提交装备分享逻辑
      console.log('提交装备:', this.newEquipment)
      this.showAddForm = false
      this.newEquipment = { name: '', description: '', image: null }
    },
    cancelAdd() {
      this.showAddForm = false
      this.newEquipment = { name: '', description: '', image: null }
    }
  }
}
</script>

<style scoped>
.equipment-sharing {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: 500;
}

.subtitle {
  color: #7f8c8d;
  font-size: 16px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.equipment-card {
  background: #ffffff;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.equipment-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.equipment-image {
  height: 200px;
  background: #f8f9fa;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.equipment-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.equipment-image img:hover {
  transform: scale(1.05);
}

.image-placeholder {
  color: #adb5bd;
  font-size: 14px;
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.equipment-info {
  padding: 16px;
}

.equipment-info h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: 500;
}

.description {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.4;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.owner {
  color: #3498db;
  font-weight: 500;
}

.status {
  color: #27ae60;
  font-weight: 500;
}

.equipment-actions {
  padding: 16px;
  padding-top: 0;
}

.btn-primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: #2980b9;
}

.add-equipment {
  text-align: center;
  margin-bottom: 40px;
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
  border: 1px solid #bdc3c7;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #d5dbdb;
  border-color: #95a5a6;
}

.add-form-overlay {
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

.add-form {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.add-form h2 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 500;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.image-upload {
  border: 2px dashed #bdc3c7;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.image-upload:hover {
  border-color: #3498db;
}

.upload-placeholder {
  color: #7f8c8d;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-cancel {
  flex: 1;
  background: #ecf0f1;
  color: #2c3e50;
  border: 1px solid #bdc3c7;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-cancel:hover {
  background: #d5dbdb;
}

@media (max-width: 768px) {
  .equipment-sharing {
    padding: 15px;
  }

  .equipment-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .header h1 {
    font-size: 24px;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style> 