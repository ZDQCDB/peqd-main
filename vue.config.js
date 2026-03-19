const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,
    client: {
      overlay: {
        runtimeErrors: (error) => {
          if (error?.message === 'ResizeObserver loop completed with undelivered notifications.') {
            return false
          }
          return true
        }
      }
    }
  }
})
