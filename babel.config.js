module.exports = (api) => {
  // Cache configuration is a required option
  api.cache(false)

  return {
    presets: ['@babel/preset-typescript', '@babel/preset-env'],
    plugins: ['babel-plugin-transform-vite-meta-env'],
  }
}
