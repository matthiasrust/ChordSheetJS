const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
		main: ['./src/chordsheet.js']
  	},
  output: {
    path: path.resolve(__dirname, 'dist'),
		filename: 'chordsheet.js',
		library: 'chordsheetjs',
		// libraryTarget: 'commonjs'		
	},
	devtool: 'source-map',
	mode: 'development',
	//mode: 'production',
	// watch: true,
  /*plugins: [
	  new HtmlWebpackPlugin({
		  title: 'Output Management'
	})
	],*/
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					// options: {
					//   presets: ['@babel/preset-env']
					// }
				}
			}
		]
	}
		
};
