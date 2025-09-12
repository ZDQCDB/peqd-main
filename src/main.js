import { createApp } from 'vue'         // ✅ Vue 3 正确引入方式
import App from './App.vue'
import router from './router'
import PermissionPlugin from './plugins/permission'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 注册权限插件和Element Plus（Vue 3 写法）
app.use(router)
app.use(PermissionPlugin)
app.use(ElementPlus)

// 如果你有类似 Vue.config.productionTip 的需求，可以写在这里：
app.config.globalProperties.productionTip = false  // 可选，一般 Vue 3 不需要

// 挂载
app.mount('#app')
