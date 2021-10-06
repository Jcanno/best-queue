module.exports = (api) => {
  api.cache(false)
  return {
    babelrc: false,
    ignore: ['./node_modules'],
    presets: [
      [
        '@babel/preset-env',
        {
          loose: true,
          targets: {
            ie: 11,
          },
        },
      ],
    ],
    plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-transform-typescript'],
  }
}
