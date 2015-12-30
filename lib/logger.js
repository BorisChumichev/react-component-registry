var colors = require('colors')

module.exports = function (prefix) {
  return {
    info: function(message) {
      console.log(`${prefix}: ${message}`)
      return this
    },
    success: function(message) {
      this.info(colors.green(message))
    },
    warning: function(message) {
      this.info(colors.yellow.underline(message))
    },
    fail: function(message) {
      this.info(colors.red(message))
    }
  }
} 
