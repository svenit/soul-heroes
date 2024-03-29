const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const { InjectManifest } = require('workbox-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const { version } = require('../package.json');

const builtAt = new Date().getTime();
const maxBuiltFileSize = 20 * 1024 * 1024;

const prod = {
	mode: 'production',
	stats: 'errors-warnings',
	output: {
		filename: `[name].[contenthash].bundle.${version}.${builtAt}.js`,
		chunkFilename: `[name].chunk.${version}.${builtAt}.js`,
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					filename: `[name].[contenthash].bundle.${version}.${builtAt}.js`,
				},
			},
		},
	},
	plugins: [
		// new WebpackObfuscator(
		//     {
		//         compact: true,
		//         deadCodeInjection: true,
		//         debugProtection: true,
		//         disableConsoleOutput: true,
		//         sourceMap: false,
		//     },
		//     ['vendors.*.js', 'sw.js'],
		// ),
		// new InjectManifest({
		//     swSrc: path.resolve(__dirname, '../pwa/sw.js'),
		//     swDest: 'sw.js',
		//     maximumFileSizeToCacheInBytes: maxBuiltFileSize,
		// }),
	],
	performance: {
		maxEntrypointSize: maxBuiltFileSize,
		maxAssetSize: maxBuiltFileSize,
	},
};

module.exports = merge(common, prod);
