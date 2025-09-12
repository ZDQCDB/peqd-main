<template>
  <div class="teacher-training">
    <div class="header">
      <h2>教师训练管理</h2>
      <button class="btn btn-primary" @click="showCreateForm = !showCreateForm">
        <i class="icon">➕</i> 布置训练任务
      </button>
    </div>

    <!-- 创建训练任务表单 -->
    <div v-if="showCreateForm" class="create-form-card">
      <h3>新建训练任务</h3>
      <form class="create-form">
        <div class="form-group">
          <label>任务标题</label>
          <input type="text" v-model="newTask.title" placeholder="请输入训练任务标题" />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>训练类型</label>
            <select v-model="newTask.type">
              <option value="endurance">耐力训练</option>
              <option value="strength">力量训练</option>
              <option value="flexibility">柔韧训练</option>
              <option value="skill">技能训练</option>
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
            <label>开始日期</label>
            <input type="date" v-model="newTask.startDate" />
          </div>
          
          <div class="form-group">
            <label>截止日期</label>
            <input type="date" v-model="newTask.endDate" />
          </div>
        </div>

        <div class="form-group">
          <label>任务描述</label>
          <textarea v-model="newTask.description" placeholder="请详细描述训练任务内容和要求" rows="4"></textarea>
        </div>

        <div class="form-group">
          <label>目标班级</label>
          <div class="class-selector">
            <label v-for="classItem in classes" :key="classItem.id" class="checkbox-label">
              <input type="checkbox" :value="classItem.id" v-model="newTask.targetClasses" />
              <span>{{ classItem.name }}</span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="showCreateForm = false">取消</button>
          <button type="button" class="btn btn-primary" @click="createTask">发布任务</button>
        </div>
      </form>
    </div>

    <!-- 训练任务列表 -->
    <div class="tasks-section">
      <div class="section-header">
        <h3>训练任务列表</h3>
        <div class="filter-tabs">
          <button 
            v-for="status in statusTabs" 
            :key="status.value"
            :class="['tab', { active: activeTab === status.value }]"
            @click="activeTab = status.value"
          >
            {{ status.label }} ({{ getTaskCountByStatus(status.value) }})
          </button>
        </div>
      </div>

      <div class="tasks-grid">
        <div 
          v-for="task in filteredTasks" 
          :key="task.id" 
          class="task-card"
          :class="getTaskStatusClass(task)"
        >
          <div class="task-header">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-type" :class="task.type">{{ getTypeLabel(task.type) }}</div>
          </div>
          
          <div class="task-meta">
            <div class="meta-item">
              <i class="icon">📅</i>
              <span>{{ formatDate(task.startDate) }} - {{ formatDate(task.endDate) }}</span>
            </div>
            <div class="meta-item">
              <i class="icon">🎯</i>
              <span>{{ getDifficultyLabel(task.difficulty) }}</span>
            </div>
            <div class="meta-item">
              <i class="icon">👥</i>
              <span>{{ task.targetClasses.length }} 个班级</span>
            </div>
          </div>

          <div class="task-description">{{ task.description }}</div>

          <div class="task-progress">
            <div class="progress-info">
              <span>完成进度</span>
              <span>{{ task.completedStudents }}/{{ task.totalStudents }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: getProgressPercentage(task) + '%' }"></div>
            </div>
            <div class="progress-percentage">{{ getProgressPercentage(task) }}%</div>
          </div>

          <div class="task-actions">
            <button class="btn btn-small btn-outline" @click="viewTaskDetails(task)">查看详情</button>
            <button class="btn btn-small btn-outline" @click="editTask(task)">编辑</button>
            <button class="btn btn-small btn-danger" @click="deleteTask(task)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-section">
      <h3>训练统计概览</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ tasks.length }}</div>
          <div class="stat-label">总任务数</div>
          <div class="stat-icon">📋</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-number">{{ getActiveTasksCount() }}</div>
          <div class="stat-label">进行中任务</div>
          <div class="stat-icon">⏳</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-number">{{ getCompletedTasksCount() }}</div>
          <div class="stat-label">已完成任务</div>
          <div class="stat-icon">✅</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-number">{{ getAverageCompletion() }}%</div>
          <div class="stat-label">平均完成率</div>
          <div class="stat-icon">📊</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeacherTraining',
  data() {
    return {
      showCreateForm: false,
      activeTab: 'all',
      newTask: {
        title: '',
        type: 'endurance',
        difficulty: 'medium',
        startDate: '',
        endDate: '',
        description: '',
        targetClasses: []
      },
      statusTabs: [
        { value: 'all', label: '全部' },
        { value: 'active', label: '进行中' },
        { value: 'completed', label: '已完成' },
        { value: 'expired', label: '已过期' }
      ],
      classes: [
        { id: 1, name: '计算机科学2021-1班' },
        { id: 2, name: '计算机科学2021-2班' },
        { id: 3, name: '软件工程2021-1班' },
        { id: 4, name: '软件工程2021-2班' },
        { id: 5, name: '信息安全2021-1班' },
        { id: 6, name: '人工智能2021-1班' }
      ],
      tasks: [
        {
          id: 1,
          title: '1000米耐力跑训练',
          type: 'endurance',
          difficulty: 'medium',
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          description: '每周至少完成3次1000米跑步训练，记录时间并逐步提升成绩。要求跑步姿势正确，呼吸节奏稳定。',
          targetClasses: [1, 2, 3],
          totalStudents: 120,
          completedStudents: 95,
          status: 'active'
        },
        {
          id: 2,
          title: '俯卧撑力量提升',
          type: 'strength',
          difficulty: 'easy',
          startDate: '2024-01-10',
          endDate: '2024-01-31',
          description: '每天完成30个标准俯卧撑，分3组进行，每组10个。注意动作标准，保持身体直线。',
          targetClasses: [4, 5],
          totalStudents: 80,
          completedStudents: 80,
          status: 'completed'
        },
        {
          id: 3,
          title: '篮球技能训练',
          type: 'skill',
          difficulty: 'hard',
          startDate: '2024-02-01',
          endDate: '2024-03-01',
          description: '练习篮球基本技能：运球、投篮、传球。每周训练不少于4小时，掌握基本动作要领。',
          targetClasses: [1, 3, 6],
          totalStudents: 90,
          completedStudents: 45,
          status: 'active'
        },
        {
          id: 4,
          title: '瑜伽柔韧性训练',
          type: 'flexibility',
          difficulty: 'medium',
          startDate: '2023-12-01',
          endDate: '2023-12-31',
          description: '进行基础瑜伽训练，提升身体柔韧性和协调性。每次训练30分钟，每周3次。',
          targetClasses: [2, 4],
          totalStudents: 60,
          completedStudents: 50,
          status: 'expired'
        },
        {
          id: 5,
          title: '体能综合训练',
          type: 'strength',
          difficulty: 'hard',
          startDate: '2024-01-20',
          endDate: '2024-02-28',
          description: '综合性体能训练计划，包括力量、耐力、敏捷性等多项内容。每周训练5次，每次45分钟。',
          targetClasses: [5, 6],
          totalStudents: 70,
          completedStudents: 25,
          status: 'active'
        }
      ]
    }
  },
  computed: {
    filteredTasks() {
      if (this.activeTab === 'all') return this.tasks;
      return this.tasks.filter(task => task.status === this.activeTab);
    }
  },
  methods: {
    createTask() {
      // 模拟创建任务
      const newId = Math.max(...this.tasks.map(t => t.id)) + 1;
      const task = {
        ...this.newTask,
        id: newId,
        totalStudents: this.newTask.targetClasses.reduce((sum, classId) => {
          const classItem = this.classes.find(c => c.id === classId);
          return sum + (classItem ? 30 : 0); // 假设每班30人
        }, 0),
        completedStudents: 0,
        status: 'active'
      };
      
      this.tasks.unshift(task);
      this.showCreateForm = false;
      this.resetForm();
      alert('训练任务发布成功！');
    },
    
    resetForm() {
      this.newTask = {
        title: '',
        type: 'endurance',
        difficulty: 'medium',
        startDate: '',
        endDate: '',
        description: '',
        targetClasses: []
      };
    },
    
    getTaskCountByStatus(status) {
      if (status === 'all') return this.tasks.length;
      return this.tasks.filter(task => task.status === status).length;
    },
    
    getTaskStatusClass(task) {
      return `status-${task.status}`;
    },
    
    getTypeLabel(type) {
      const labels = {
        endurance: '耐力',
        strength: '力量',
        flexibility: '柔韧',
        skill: '技能'
      };
      return labels[type] || type;
    },
    
    getDifficultyLabel(difficulty) {
      const labels = {
        easy: '简单',
        medium: '中等',
        hard: '困难'
      };
      return labels[difficulty] || difficulty;
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    },
    
    getProgressPercentage(task) {
      return Math.round((task.completedStudents / task.totalStudents) * 100);
    },
    
    getActiveTasksCount() {
      return this.tasks.filter(task => task.status === 'active').length;
    },
    
    getCompletedTasksCount() {
      return this.tasks.filter(task => task.status === 'completed').length;
    },
    
    getAverageCompletion() {
      if (this.tasks.length === 0) return 0;
      const totalCompletion = this.tasks.reduce((sum, task) => 
        sum + this.getProgressPercentage(task), 0
      );
      return Math.round(totalCompletion / this.tasks.length);
    },
    
    viewTaskDetails(task) {
      alert(`查看任务详情：${task.title}`);
    },
    
    editTask(task) {
      alert(`编辑任务：${task.title}`);
    },
    
    deleteTask(task) {
      if (confirm(`确定要删除任务"${task.title}"吗？`)) {
        const index = this.tasks.findIndex(t => t.id === task.id);
        this.tasks.splice(index, 1);
      }
    }
  }
}
</script>

<style scoped>
.teacher-training {
  padding: 24px;
  max-width: 1200px;
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

.btn {
  padding: 12px 24px;
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

.btn-danger {
  background: #f56c6c;
  color: white;
}

.btn-danger:hover {
  background: #dd6161;
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

/* 创建表单样式 */
.create-form-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
}

.create-form-card h3 {
  margin: 0 0 24px 0;
  color: #303133;
  font-size: 20px;
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

.class-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.checkbox-label:hover {
  background-color: #f5f7fa;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* 任务列表样式 */
.tasks-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  color: #303133;
  font-size: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #dcdfe6;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  color: #606266;
}

.tab.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.tab:hover:not(.active) {
  border-color: #409eff;
  color: #409eff;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.task-card.status-active {
  border-left: 4px solid #67c23a;
}

.task-card.status-completed {
  border-left: 4px solid #409eff;
}

.task-card.status-expired {
  border-left: 4px solid #f56c6c;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.task-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.task-type {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.task-type.endurance {
  background: #e1f3d8;
  color: #67c23a;
}

.task-type.strength {
  background: #fdf6ec;
  color: #e6a23c;
}

.task-type.flexibility {
  background: #f4f4f5;
  color: #909399;
}

.task-type.skill {
  background: #ecf5ff;
  color: #409eff;
}

.task-meta {
  margin-bottom: 16px;
}

.meta-item {
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

.task-description {
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.task-progress {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.progress-bar {
  height: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #67c23a, #85ce61);
  transition: width 0.3s;
}

.progress-percentage {
  text-align: right;
  font-size: 12px;
  color: #67c23a;
  font-weight: 600;
}

.task-actions {
  display: flex;
  gap: 8px;
}

/* 统计概览样式 */
.stats-section h3 {
  margin: 0 0 24px 0;
  color: #303133;
  font-size: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
  position: relative;
  overflow: hidden;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
}

.stat-icon {
  font-size: 24px;
  opacity: 0.3;
  position: absolute;
  top: 20px;
  right: 20px;
}
</style> 