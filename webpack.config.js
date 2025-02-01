const path = require('path');

module.exports = {
  entry: './src/extension.ts', // Entry point of your extension
  target: 'node', // VS Code extensions run in a Node.js context
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js', // Output file
    libraryTarget: 'commonjs2',
  },
  externals: {
    vscode: 'commonjs vscode', // Ignore vscode module
  },
  resolve: {
    extensions: ['.ts', '.js'], // Resolve .ts and .js files
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader', // Use ts-loader to compile TypeScript
          },
        ],
      },
    ],
  },
};