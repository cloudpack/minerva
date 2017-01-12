var path = require('path');

module.exports = {
    entry: './js/src/main.js',
    output: {
        path: path.resolve(__dirname, './js/dist'),
        publicPath: '/js/dist/',
        filename: 'main.js'
    },
    module: {
        loaders: [
            { test: /\.json$/, loader: 'json-loader'}
        ]
    },
    node: {
        fs: 'empty'
    },
    resolve: {
        extensions: ['', '.js', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        }
    }
};
