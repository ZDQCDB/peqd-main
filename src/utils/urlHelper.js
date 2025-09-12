/**
 * URL辅助工具
 */

/**
 * 将相对路径转换为完整URL
 * @param {string} relativeUrl - 相对路径
 * @param {string} baseUrl - 基础URL，可选
 * @returns {string} 完整URL
 */
export function buildFullUrl(relativeUrl, baseUrl = null) {
  if (!relativeUrl) return ''
  
  // 如果已经是完整URL，直接返回
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl
  }
  
  // 获取API基础URL
  const apiBaseUrl = baseUrl || process.env.VUE_APP_API_BASE_URL || 'http://192.168.1.104:9999'
  
  // 如果相对路径以/开头，直接拼接
  // 统一去掉路径开头的“/”再拼接
  const cleanRelativeUrl = relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl
  return apiBaseUrl + cleanRelativeUrl
}

/**
 * 处理照片数据，将相对路径转换为完整URL
 * @param {Object|Array} photoData - 照片数据对象或数组
 * @returns {Object|Array} 处理后的照片数据
 */
export function processPhotoUrls(photoData) {
  if (!photoData) return photoData
  
  // 如果是数组
  if (Array.isArray(photoData)) {
    return photoData.map(photo => processPhotoUrls(photo))
  }
  
  // 如果是对象
  if (typeof photoData === 'object') {
    const processed = { ...photoData }
    
    // 处理常见的URL字段
    if (processed.url) {
      processed.url = buildFullUrl(processed.url)
    }
    if (processed.thumbnailUrl) {
      processed.thumbnailUrl = buildFullUrl(processed.thumbnailUrl)
    }
    if (processed.photoUrl) {
      processed.photoUrl = buildFullUrl(processed.photoUrl)
    }
    if (processed.attendancePhotoUrl) {
      processed.attendancePhotoUrl = buildFullUrl(processed.attendancePhotoUrl)
    }
    
    return processed
  }
  
  // 如果是字符串，直接处理
  if (typeof photoData === 'string') {
    return buildFullUrl(photoData)
  }
  
  return photoData
}

export default {
  buildFullUrl,
  processPhotoUrls
}
