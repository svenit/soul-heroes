const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { version } = require('../package.json');

const builtAt = new Date().getTime();
module.exports = {
	entry: ['./src/scripts/game.ts', './webpack/credits.js'],
	output: {
		path: path.resolve(__dirname, '../dist'),
		filename: `[name].bundle.${version}.${builtAt}.js`,
		chunkFilename: `[name].chunk.${version}.${builtAt}.js`,
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	module: {
		rules: [{ test: /\.tsx?$|\.jsx?$/, include: path.join(__dirname, '../src'), loader: 'ts-loader' }],
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
					filename: `[name].bundle.${version}.${builtAt}.js`,
				},
			},
		},
	},
	plugins: [
		new HtmlWebpackPlugin({ gameName: 'Solo Dungeon', template: 'src/index.html' }),
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'src/public', to: '' },
				{ from: 'pwa', to: '' },
				{ from: 'src/favicon.ico', to: '' },
			],
		}),
	],
};
