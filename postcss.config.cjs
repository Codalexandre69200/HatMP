module.exports = {
    plugins: [
        require("postcss-px-to-viewport-8-plugin")({
            unitToConvert: "px",
            viewportWidth: 1080,
            unitPrecision: 5,
            propList: ["*"],
            viewportUnit: "vw",
            fontViewportUnit: "vw",
            selectorBlackList: [],
            minPixelValue: 1,
            mediaQuery: true,
            replace: true,
            exclude: undefined,
            landscape: true,
            landscapeUnit: "vw",
            landscapeWidth: 2340
        }),
        require('css-declaration-sorter'),
        require('cssnano')({
            preset: 'default'
        }),
    ],
};
