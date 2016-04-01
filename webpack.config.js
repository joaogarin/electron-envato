// @AngularClass

/*
 * Helper: root(), and rootDir() are defined at the bottom
 */
var webpack = require('webpack');
var helpers = require('./helpers');

var CopyWebpackPlugin = require('copy-webpack-plugin');
var ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

const ENV = process.env.ENV = process.env.NODE_ENV = 'development';

var METADATA = {
    title: 'Angular2 Minimal Starter',
    baseUrl: '/',
    ENV: ENV
};

/*
 * Config
 */
var config = {
    // static data for index.html
    metadata: METADATA,
    // for faster builds use 'eval'
    devtool: 'source-map',
    debug: true,
    // cache: false,

    // our angular app
    entry: {
        'polyfills': './src/polyfills.ts',
        'vendor': './src/vendor.ts',
        'app': './src/app/app'
    },

    // Config for our build files
    output: {
        path: helpers.root('src/app/dist'),
        filename: '[name].js',
        sourceMapFilename: '[name].map',
        chunkFilename: '[id].chunk.js'
    },

    resolve: {
        // ensure loader extensions match
        extensions: helpers.prepend(['.ts', '.js', '.json', '.css', '.html'], '.async') // ensure .async.ts etc also works
    },

    module: {
        loaders: [
            // Support for .ts files.
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                exclude: [/\.(spec|e2e)\.ts$/]
            },

            // Support for *.json files.
            { test: /\.json$/, loader: 'json-loader' },

            // Support for CSS as raw text
            { test: /\.css$/, loader: 'raw-loader' },

            // support for .html as raw text
            { test: /\.html$/, loader: 'raw-loader', exclude: [helpers.root('app/index.html')] },
            
            // Support for CSS as raw text
            { test: /\.css$/, loader: 'raw' },

            //sass loader implementation
            { test: /\.scss$/, loader: ExtractTextPlugin.extract(['css','sass']) },

            // inline base64 URLs for <=8k images, direct URLs for the rest
            { test: /\.(png|jpg|jpeg)$/, loader: 'url-loader?limit=8192' },

            // if you add a loader include the resolve file extension above
        ]
    },

    plugins: [
        // Plugin : ExtractTextPlugin
        // Description: Extact sass into its own css file
        //
        // See: https://github.com/webpack/extract-text-webpack-plugin
        new ExtractTextPlugin("styles.css"),
        // Plugin: ForkCheckerPlugin
        // Description: Do type checking in a separate process, so webpack don't need to wait.
        //
        // See: https://github.com/s-panferov/awesome-typescript-loader#forkchecker-boolean-defaultfalse
        new ForkCheckerPlugin(),

        // Plugin: OccurenceOrderPlugin
        // Description: Varies the distribution of the ids to get the smallest id length
        // for often used ids.
        //
        // See: https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
        // See: https://github.com/webpack/docs/wiki/optimization#minimize
        new webpack.optimize.OccurenceOrderPlugin(true),

        // Plugin: CommonsChunkPlugin
        // Description: Shares common code between the pages.
        // It identifies common modules and put them into a commons chunk.
        //
        // See: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
        // See: https://github.com/webpack/docs/wiki/optimization#multi-page-app
        new webpack.optimize.CommonsChunkPlugin({ name: ['vendor', 'polyfills'], minChunks: Infinity }),

        // Plugin: DefinePlugin
        // Description: Define free variables.
        // Useful for having development builds with debug logging or adding global constants.
        //
        // Environment helpers
        //
        // See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
        // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
        new webpack.DefinePlugin({ 'ENV': JSON.stringify(METADATA.ENV) })
    ],
    // Other module loader config
    tslint: {
        emitErrors: false,
        failOnHint: false,
        resourcePath: 'app'
    },
    // we need this due to problems with es6-shim
    node: {
        global: 'window',
        progress: false,
        crypto: 'empty',
        module: false,
        clearImmediate: false,
        setImmediate: false
    }
};

config.target = webpackTargetElectronRenderer(config);
module.exports = config;