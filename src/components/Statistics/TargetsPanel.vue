<template>
  <div class="targets-panel">
    <div class="panel-header">
      <h2 class="panel-title">
        <i class="icon"></i>
        PE积分指标设置
      </h2>
      <div class="panel-actions">
        <button @click="toggleEdit" class="edit-btn" :disabled="loading">
          {{ isEditing ? '取消' : '编辑' }}
        </button>
        <button 
          v-if="isEditing" 
          @click="saveTargets" 
          class="save-btn"
          :disabled="loading || !hasChanges"
        >
          {{ loading ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>

    <div class="panel-content">
      <div class="targets-grid">
        <!-- 周指标 -->
        <div class="target-card">
          <div class="target-icon weekly"></div>
          <div class="target-info">
            <h3>周积分指标</h3>
            <div class="target-value">
              <input 
                v-if="isEditing"
                v-model.number="editTargets.weeklyTarget"
                type="number"
                min="1"
                class="target-input"
                placeholder="请输入周积分指标"
              />
              <span v-else class="target-display">
                {{ targets?.weeklyTarget || '--' }}
              </span>
              <span class="target-unit">分</span>
            </div>
          </div>
        </div>

        <!-- 月指标 -->
        <div class="target-card">
          <div class="target-icon monthly"></div>
          <div class="target-info">
            <h3>月积分指标</h3>
            <div class="target-value">
              <input 
                v-if="isEditing"
                v-model.number="editTargets.monthlyTarget"
                type="number"
                min="1"
                class="target-input"
                placeholder="请输入月积分指标"
              />
              <span v-else class="target-display">
                {{ targets?.monthlyTarget || '--' }}
              </span>
              <span class="target-unit">分</span>
            </div>
          </div>
        </div>

        <!-- 总指标 -->
        <div class="target-card">
          <div class="target-icon total"></div>
          <div class="target-info">
            <h3>总积分指标</h3>
            <div class="target-value">
              <input 
                v-if="isEditing"
                v-model.number="editTargets.totalTarget"
                type="number"
                min="1"
                class="target-input"
                placeholder="请输入总积分指标"
              />
              <span v-else class="target-display">
                {{ targets?.totalTarget || '--' }}
              </span>
              <span class="target-unit">分</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div v-if="!targets" class="no-targets">
        <i class="warning-icon"></i>
        <p>尚未设置PE积分指标，请点击编辑按钮进行设置</p>
      </div>

      <div v-if="isEditing" class="edit-tips">
        <p>提示：设置的指标将作为全校学生PE积分达标的标准</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'TargetsPanel',
  props: {
    targets: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update-targets'],
  setup(props, { emit }) {
    const isEditing = ref(false)
    const editTargets = ref({
      weeklyTarget: 0,
      monthlyTarget: 0,
      totalTarget: 0
    })

    // 计算是否有修改
    const hasChanges = computed(() => {
      if (!props.targets) return true
      return (
        editTargets.value.weeklyTarget !== props.targets.weeklyTarget ||
        editTargets.value.monthlyTarget !== props.targets.monthlyTarget ||
        editTargets.value.totalTarget !== props.targets.totalTarget
      )
    })

    // 切换编辑模式
    const toggleEdit = () => {
      if (isEditing.value) {
        // 取消编辑，恢复原值
        if (props.targets) {
          editTargets.value = { ...props.targets }
        }
        isEditing.value = false
      } else {
        // 开始编辑
        if (props.targets) {
          editTargets.value = { ...props.targets }
        } else {
          editTargets.value = {
            weeklyTarget: 10,
            monthlyTarget: 40,
            totalTarget: 100
          }
        }
        isEditing.value = true
      }
    }

    // 保存指标
    const saveTargets = () => {
      if (!hasChanges.value) return

      // 验证数据
      if (editTargets.value.weeklyTarget <= 0 || 
          editTargets.value.monthlyTarget <= 0 || 
          editTargets.value.totalTarget <= 0) {
        alert('所有指标必须大于0')
        return
      }

      // 发送更新事件
      emit('update-targets', {
        weeklyTarget: editTargets.value.weeklyTarget,
        monthlyTarget: editTargets.value.monthlyTarget,
        totalTarget: editTargets.value.totalTarget
      })

      isEditing.value = false
    }

    // 监听props变化
    watch(() => props.targets, (newTargets) => {
      if (newTargets && !isEditing.value) {
        editTargets.value = { ...newTargets }
      }
    }, { immediate: true })

    return {
      isEditing,
      editTargets,
      hasChanges,
      toggleEdit,
      saveTargets
    }
  }
}
</script>

<style scoped>
.targets-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
}

.icon {
  font-size: 24px;
}

.panel-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.edit-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.save-btn {
  background: #4caf50;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #45a049;
}

.save-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.panel-content {
  padding: 30px;
}

.targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.target-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.target-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.target-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.target-icon.weekly {
  background: linear-gradient(135deg, #64b5f6, #2196f3);
}

.target-icon.monthly {
  background: linear-gradient(135deg, #81c784, #4caf50);
}

.target-icon.total {
  background: linear-gradient(135deg, #ffb74d, #ff9800);
}

.target-info {
  flex: 1;
}

.target-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #b0bec5;
}

.target-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.target-display {
  font-size: 28px;
  font-weight: bold;
  color: #ffffff;
}

.target-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 18px;
  color: #ffffff;
  width: 120px;
}

.target-input:focus {
  outline: none;
  border-color: #2196f3;
  background: rgba(255, 255, 255, 0.15);
}

.target-unit {
  font-size: 14px;
  color: #b0bec5;
}

.no-targets {
  text-align: center;
  padding: 40px 20px;
  color: #b0bec5;
}

.warning-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 15px;
}

.edit-tips {
  margin-top: 20px;
  padding: 15px 20px;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.edit-tips p {
  margin: 0;
  color: #64b5f6;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .panel-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .targets-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .target-card {
    padding: 15px;
  }

  .target-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  .target-display {
    font-size: 24px;
  }

  .target-input {
    width: 100px;
    font-size: 16px;
  }
}
</style>
