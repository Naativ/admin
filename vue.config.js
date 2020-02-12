module.exports = {
  lintOnSave: true,
  chainWebpack: config => {
    config.module.output = { filename: '[name].[hash].js' }
    config.module
      .rule('eslint')
      .use('eslint-loader')
      .options({
        fix: true
      })
  }
}
