# 听课管理系统 API 文档

## 概述

本文档描述了听课管理系统的API接口，支持多种角色权限：学生、教师、院级管理员、校级管理员、超级管理员。系统使用后端本地存储管理所有文件。

## 基础信息

- **基础URL**: `https://api.example.com/v1`
- **认证方式**: Bearer Token
- **数据格式**: JSON
- **编码**: UTF-8
- **文件存储**: 后端本地存储

## 用户角色说明

- `student`: 学生 - 可查看听课记录
- `teacher`: 教师 - 可创建听课记录、上传教案和视频
- `department_admin`: 院级管理员 - 可查看本院系所有听课记录
- `school_admin`: 校级管理员 - 可查看全校所有听课记录
- `super_admin`: 超级管理员 - 拥有所有权限

## 通用响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 错误响应格式

```json
{
  "code": 400,
  "message": "请求参数错误",
  "error": "详细错误信息",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 1. 课程管理接口

### 1.1 获取课程列表

**接口**: `GET /courses`

**权限**: 所有角色

**请求参数**:
```json
{
  "semester": "2024-1",
  "teacher_name": "李老师",
  "department_id": 1,
  "page": 1,
  "limit": 10
}
```

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": 1,
        "subject_id": 1,
        "subject_name": "体育与健康",
        "class_id": 1,
        "class_name": "高一(1)班",
        "teacher_id": 5,
        "teacher_name": "李老师",
        "course_name": "体育与健康课程",
        "semester": "2024-1",
        "academic_year": "2023-2024",
        "weekly_hours": 2,
        "total_hours": 36
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

## 2. 听课记录管理

### 2.1 获取听课记录列表

**接口**: `GET /observations`

**权限**: 所有角色

**请求参数**:
```json
{
  "teacher_id": 1,
  "observer_id": 2,
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "page": 1,
  "limit": 10
}
```

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "lesson_plan": {
        "id": 1,
        "lesson_title": "篮球基本技能训练",
        "teacher_name": "李老师",
        "course_name": "体育与健康课程",
        "class_name": "高一(1)班"
      },
      "observer": {
        "id": 3,
        "real_name": "王主任",
        "user_type": "department_admin"
      },
      "observer_type": "department_admin",
      "observation_date": "2024-01-15T10:00:00Z",
      "classroom": "操场",
      "student_count": 45,
      "lesson_actual_content": "按计划完成篮球基本技能训练...",
      "teaching_performance_score": 9,
      "student_engagement_score": 8,
      "class_atmosphere_score": 9,
      "overall_score": 9,
      "strengths": "教学思路清晰，示范动作标准...",
      "improvements": "建议增加更多个别指导时间...",
      "additional_notes": "整体课堂效果很好...",
      "video_url": "/api/files/download/video_123456.mp4",
      "video_name": "listening_video_20240115.mp4",
      "video_size": 52428800,
      "lesson_plan_files": [
        {
          "id": 1,
          "name": "篮球教案.pdf",
          "original_name": "篮球基本技能训练教案.pdf",
          "url": "/api/files/download/plan_123456.pdf",
          "size": 1024000,
          "type": "application/pdf",
          "uploaded_at": "2024-01-15T08:00:00Z"
        }
      ],
      "status": 1,
      "created_at": "2024-01-15T12:30:00Z"
    }
  ]
}
```

### 2.2 创建听课记录

**接口**: `POST /observations`

**权限**: `teacher`, `department_admin`, `school_admin`, `super_admin`

**请求体**:
```json
{
  "lesson_plan_id": 1,
  "course_id": 1,
  "observer_type": "teacher",
  "observation_date": "2024-01-15T10:00:00Z",
  "classroom": "操场",
  "student_count": 45,
  "lesson_actual_content": "按计划完成篮球基本技能训练...",
  "teaching_performance_score": 9,
  "student_engagement_score": 8,
  "class_atmosphere_score": 9,
  "overall_score": 9,
  "strengths": "教学思路清晰，示范动作标准...",
  "improvements": "建议增加更多个别指导时间...",
  "additional_notes": "整体课堂效果很好..."
}
```

**响应**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1,
    "created_at": "2024-01-15T12:30:00Z"
  }
}
```

### 2.3 更新听课记录

**接口**: `PUT /observations/{id}`

**权限**: `teacher`, `department_admin`, `school_admin`, `super_admin` (仅创建者或上级管理员可修改)

**请求体**: 同创建接口

**响应**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "updated_at": "2024-01-15T15:30:00Z"
  }
}
```

### 2.4 删除听课记录

**接口**: `DELETE /observations/{id}`

**权限**: `department_admin`, `school_admin`, `super_admin`

**响应**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

## 3. 文件管理接口

### 3.1 上传教案文件

**接口**: `POST /teachers/{teacherId}/lesson-plans`

**权限**: `teacher`, `department_admin`, `school_admin`, `super_admin`

**请求类型**: `multipart/form-data`

**请求参数**:
```
file: 教案文件 (必需)
teacherId: 教师ID (必需)
fileName: 文件名 (可选，默认使用原文件名)
description: 文件描述 (可选)
```

**文件限制**:
- 支持格式: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX
- 最大大小: 50MB
- 文件名不能包含特殊字符

**响应**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "id": 1,
    "original_name": "篮球基本技能训练教案.pdf",
    "file_name": "lesson_plan_20240115_123456.pdf",
    "file_url": "/api/files/download/lesson_plan_20240115_123456.pdf",
    "file_size": 1024000,
    "file_type": "application/pdf",
    "teacher_id": 1,
    "uploaded_at": "2024-01-15T08:00:00Z"
  }
}
```

### 3.2 获取教师教案列表

**接口**: `GET /teachers/{teacherId}/lesson-plans`

**权限**: `teacher`, `department_admin`, `school_admin`, `super_admin`

**请求参数**:
```json
{
  "page": 1,
  "limit": 10,
  "file_type": "pdf",
  "keyword": "篮球"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "original_name": "篮球基本技能训练教案.pdf",
      "file_name": "lesson_plan_20240115_123456.pdf",
      "file_url": "/api/files/download/lesson_plan_20240115_123456.pdf",
      "file_size": 1024000,
      "file_type": "application/pdf",
      "description": "篮球基础技能教学教案",
      "teacher_id": 1,
      "uploaded_at": "2024-01-15T08:00:00Z"
    }
  ]
}
```

### 3.3 删除教案文件

**接口**: `DELETE /lesson-plans/{id}`

**权限**: `teacher`, `department_admin`, `school_admin`, `super_admin` (仅创建者或上级管理员可删除)

**响应**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

### 3.4 上传听课视频

**接口**: `POST /observations/{id}/video`

**权限**: `teacher`, `department_admin`, `school_admin`, `super_admin`

**请求类型**: `multipart/form-data`

**请求参数**:
```
video: 视频文件 (必需)
observationId: 听课记录ID (必需)
description: 视频描述 (可选)
```

**文件限制**:
- 支持格式: MP4, AVI, MOV, WMV
- 最大大小: 500MB
- 视频时长建议不超过2小时

**响应**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "id": 1,
    "original_name": "听课视频_篮球课.mp4",
    "file_name": "video_20240115_123456.mp4",
    "file_url": "/api/files/download/video_20240115_123456.mp4",
    "file_size": 52428800,
    "file_type": "video/mp4",
    "observation_id": 1,
    "uploaded_at": "2024-01-15T14:00:00Z"
  }
}
```

### 3.5 文件下载

**接口**: `GET /files/download/{fileName}`

**权限**: 根据文件类型和用户角色验证

**响应**: 直接返回文件流

**Headers**:
```
Content-Type: application/octet-stream (根据文件类型调整)
Content-Disposition: attachment; filename="原文件名"
Content-Length: 文件大小
```

### 3.6 下载听课评价表模板

**接口**: `GET /templates/evaluation-form/download`

**权限**: 所有角色

**响应**: 直接返回Excel文件流

**Headers**:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="听课评价表模板.xlsx"
```

## 4. 管理员功能接口

### 4.1 获取管理员听课记录

**接口**: `GET /admin/observations`

**权限**: `department_admin`, `school_admin`, `super_admin`

**请求参数**:
```json
{
  "teacher_id": 1,
  "department_id": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "page": 1,
  "limit": 10
}
```

**数据权限**:
- `department_admin`: 只能查看本院系数据
- `school_admin`: 可以查看全校数据
- `super_admin`: 可以查看所有数据

**响应**: 同 2.1 获取听课记录列表

### 4.2 获取统计数据

**接口**: `GET /admin/stats`

**权限**: `department_admin`, `school_admin`, `super_admin`

**请求参数**:
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "department_id": 1
}
```

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total_observations": 156,
    "average_score": 8.7,
    "this_month_count": 23,
    "teacher_count": 45,
    "department_stats": [
      {
        "department_id": 1,
        "department_name": "体育学院",
        "observation_count": 78,
        "average_score": 8.9,
        "teacher_count": 25
      }
    ],
    "score_distribution": {
      "excellent": 89,
      "good": 45,
      "fair": 18,
      "poor": 4
    }
  }
}
```

### 4.3 获取教师列表

**接口**: `GET /teachers`

**权限**: `department_admin`, `school_admin`, `super_admin`

**请求参数**:
```json
{
  "department_id": 1,
  "keyword": "张",
  "page": 1,
  "limit": 10
}
```

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "name": "张老师",
      "department_id": 1,
      "department_name": "体育学院",
      "job_title": "副教授",
      "phone": "138****1234",
      "email": "zhang@example.com",
      "average_score": 8.9,
      "observation_count": 15,
      "lesson_plan_count": 8,
      "video_count": 12
    }
  ]
}
```

### 4.4 获取院系列表

**接口**: `GET /departments`

**权限**: `department_admin`, `school_admin`, `super_admin`

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "name": "体育学院",
      "code": "PE",
      "description": "体育教育专业院系",
      "teacher_count": 25,
      "observation_count": 78,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## 5. 反馈管理接口

### 5.1 获取反馈列表

**接口**: `GET /observations/{id}/feedback`

**权限**: 所有角色

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "feedback_type": "observer_to_teacher",
      "feedback_content": "课堂组织很好，建议增加互动环节",
      "sender": {
        "id": 2,
        "name": "王主任",
        "type": "department_admin"
      },
      "receiver": {
        "id": 1,
        "name": "李老师",
        "type": "teacher"
      },
      "is_read": false,
      "created_at": "2024-01-15T14:00:00Z"
    }
  ]
}
```

### 5.2 提交反馈

**接口**: `POST /observations/{id}/feedback`

**权限**: 所有角色

**请求体**:
```json
{
  "feedback_type": "observer_to_teacher",
  "feedback_content": "课堂组织很好，建议增加互动环节",
  "receiver_id": 1
}
```

**响应**:
```json
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "id": 1,
    "created_at": "2024-01-15T14:00:00Z"
  }
}
```

## 6. 报告生成接口

### 6.1 生成听课报告

**接口**: `POST /reports/generate`

**权限**: `department_admin`, `school_admin`, `super_admin`

**请求体**:
```json
{
  "report_type": "monthly",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "department_id": 1,
  "include_videos": false,
  "include_files": true
}
```

**响应**:
```json
{
  "code": 200,
  "message": "报告生成中",
  "data": {
    "report_id": "report_20240115_123456",
    "status": "processing",
    "estimated_time": 300
  }
}
```

### 6.2 获取报告列表

**接口**: `GET /reports`

**权限**: `department_admin`, `school_admin`, `super_admin`

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": "report_20240115_123456",
      "report_type": "monthly",
      "title": "2024年1月听课报告",
      "status": "completed",
      "file_url": "/api/reports/report_20240115_123456/download",
      "file_size": 5242880,
      "created_at": "2024-01-15T16:00:00Z"
    }
  ]
}
```

### 6.3 下载报告

**接口**: `GET /reports/{reportId}/download`

**权限**: `department_admin`, `school_admin`, `super_admin`

**响应**: 直接返回PDF文件流

## 7. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 413 | 文件过大 |
| 415 | 不支持的文件类型 |
| 422 | 参数验证失败 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
| 507 | 存储空间不足 |

## 8. 文件管理规范

### 8.1 支持的文件类型

**教案文件**:
- PDF: .pdf
- Word: .doc, .docx
- PowerPoint: .ppt, .pptx
- Excel: .xls, .xlsx

**视频文件**:
- MP4: .mp4 (推荐)
- AVI: .avi
- MOV: .mov
- WMV: .wmv

### 8.2 文件大小限制

- 教案文件: 最大 50MB
- 视频文件: 最大 500MB
- 模板文件: 最大 10MB

### 8.3 文件命名规范

- 系统自动生成唯一文件名: `{type}_{timestamp}_{random}`
- 保留原始文件名用于显示
- 禁止包含特殊字符: `< > : " | ? * \`

### 8.4 存储路径结构

```
/var/www/storage/files/
├── lesson-plans/           # 教案文件
│   ├── teacher_1/
│   │   ├── lesson_plan_20240115_123456.pdf
├── videos/                 # 听课视频
│   ├── observation_1/
│   │   ├── video_20240115_123456.mp4
├── templates/              # 模板文件
│   ├── evaluation-template.xlsx
└── reports/               # 生成的报告
    ├── report_20240115_123456.pdf
```

### 8.5 文件安全措施

- 上传文件病毒扫描
- 文件类型验证
- 权限控制访问
- 文件完整性校验
- 定期备份

## 9. 权限控制矩阵

| 功能 | 学生 | 教师 | 院级管理员 | 校级管理员 | 超级管理员 |
|------|------|------|------------|------------|------------|
| 查看听课记录 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 创建听课记录 | ❌ | ✅ | ✅ | ✅ | ✅ |
| 修改听课记录 | ❌ | ✅ (自己的) | ✅ | ✅ | ✅ |
| 删除听课记录 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 上传教案 | ❌ | ✅ | ✅ | ✅ | ✅ |
| 上传视频 | ❌ | ✅ | ✅ | ✅ | ✅ |
| 下载文件 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 删除文件 | ❌ | ✅ (自己的) | ✅ | ✅ | ✅ |
| 查看院系统计 | ❌ | ❌ | ✅ (本院系) | ✅ | ✅ |
| 查看全校统计 | ❌ | ❌ | ❌ | ✅ | ✅ |
| 生成报告 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 系统管理 | ❌ | ❌ | ❌ | ❌ | ✅ |

## 10. API调用示例

### 10.1 教案上传示例 (JavaScript)

```javascript
const uploadLessonPlan = async (teacherId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('teacherId', teacherId)
  formData.append('fileName', file.name)
  
  try {
    const response = await fetch(`/api/teachers/${teacherId}/lesson-plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    const result = await response.json()
    console.log('上传成功:', result.data)
  } catch (error) {
    console.error('上传失败:', error)
  }
}
```

### 10.2 视频上传示例 (JavaScript)

```javascript
const uploadVideo = async (observationId, videoFile) => {
  const formData = new FormData()
  formData.append('video', videoFile)
  formData.append('observationId', observationId)
  
  try {
    const response = await fetch(`/api/observations/${observationId}/video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    const result = await response.json()
    console.log('视频上传成功:', result.data)
  } catch (error) {
    console.error('视频上传失败:', error)
  }
}
```

### 10.3 文件下载示例 (JavaScript)

```javascript
const downloadFile = async (fileName, originalName) => {
  try {
    const response = await fetch(`/api/files/download/${fileName}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = originalName
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载失败:', error)
  }
}
```

## 11. 注意事项

1. **文件上传**：使用 `multipart/form-data` 格式
2. **大文件上传**：支持分片上传，建议使用进度监控
3. **并发限制**：同一用户同时上传文件数不超过3个
4. **存储清理**：系统定期清理未关联的临时文件
5. **备份策略**：重要文件自动备份到多个位置
6. **访问日志**：所有文件访问记录日志用于安全审计

## 12. 版本更新日志

### v2.0.0 (2024-01-15)
- 🔄 **重大更新**: 从OSS存储迁移到后端本地存储
- ✨ 新增完整的文件管理API
- 🛡️ 增强文件安全验证
- 📊 优化统计数据接口
- 🐛 修复权限控制问题

### v1.2.0 (2024-01-01)
- ✨ 新增反馈管理功能
- 📈 新增统计报告生成
- 🔐 完善权限控制矩阵

### v1.1.0 (2023-12-01)
- ✨ 新增视频上传功能
- 🔧 优化文件管理接口
- 📱 改进移动端适配

### v1.0.0 (2023-11-01)
- 🎉 首次发布
- 📝 基础听课记录管理
- 📄 教案文件上传功能 