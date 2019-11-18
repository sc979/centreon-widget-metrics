const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: ['@babel/polyfill', './src/index.jsx'],
  output: {
    path: path.resolve(__dirname),
    publicPath: './widgets/',
    filename: 'metrics/static/js/[name].[hash:8].js',
    chunkFilename: 'metrics/static/js/[name].[hash:8].chunk.js',
    libraryTarget: 'umd',
    library: '[name]',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        parallel: true,
        cache: true,
        sourceMap: true,
      }),
    ],
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: true,
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['metrics/static/**/*'],
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'metrics/index.html',
    }),
  ],
  module: {
    rules: [
      { parser: { system: false } },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true,
          },
        },
      },
    ],
  },
};
