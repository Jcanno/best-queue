module.exports = (api) => {
  api.cache(true)
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
    plugins: ['@babel/plugin-transform-typescript'],
  }
}
