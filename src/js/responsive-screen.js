var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var ResponsiveManager = /** @class */ (function () {
    class ResponsiveManager {
        constructor(options) {
            if (options === void 0) { options = {}; }
            var _a, _b, _c, _d, _e, _f, _g, _h;
            this.breakpoints = {
                mobile: (_b = (_a = options.breakpoints) === null || _a === void 0 ? void 0 : _a.mobile) !== null && _b !== void 0 ? _b : 480,
                tablet: (_d = (_c = options.breakpoints) === null || _c === void 0 ? void 0 : _c.tablet) !== null && _d !== void 0 ? _d : 768,
                desktop: (_f = (_e = options.breakpoints) === null || _e === void 0 ? void 0 : _e.desktop) !== null && _f !== void 0 ? _f : 1024,
                wide: (_h = (_g = options.breakpoints) === null || _g === void 0 ? void 0 : _g.wide) !== null && _h !== void 0 ? _h : 1440
            };
            this.currentDevice = '';
            this.callbacks = {
                mobile: [],
                tablet: [],
                desktop: [],
                wide: [],
                resize: []
            };
            this.init();
        }
        init() {
            this.detectDevice();
            var resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    this.detectDevice();
                    this.executeCallbacks('resize');
                }, 250);
            }.bind(this));
            globalThis.addEventListener('orientationchange', function () {
                setTimeout(function () {
                    this.detectDevice();
                }.bind(this), 200);
            }.bind(this));
        }
        detectDevice() {
            var width = window.innerWidth;
            var newDevice = '';
            if (width < this.breakpoints.tablet) {
                newDevice = 'mobile';
            }
            else if (width < this.breakpoints.desktop) {
                newDevice = 'tablet';
            }
            else if (width < this.breakpoints.wide) {
                newDevice = 'desktop';
            }
            else {
                newDevice = 'wide';
            }
            if (newDevice !== this.currentDevice) {
                var oldDevice = this.currentDevice;
                this.currentDevice = newDevice;
                document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop', 'device-wide');
                document.body.classList.add("device-".concat(newDevice));
                this.executeCallbacks(newDevice, { oldDevice: oldDevice, newDevice: newDevice, width: width });
            }
        }
        on(deviceType, callback) {
            if (this.callbacks[deviceType]) {
                this.callbacks[deviceType].push(callback);
            }
        }
        executeCallbacks(type, data) {
            if (data === void 0) { data = {}; }
            if (this.callbacks[type]) {
                this.callbacks[type].forEach(function (callback) {
                    callback(__assign(__assign({}, data), { currentDevice: this.currentDevice, width: window.innerWidth, height: window.innerHeight }));
                }.bind(this));
            }
        }
        getDevice() {
            return this.currentDevice;
        }
        is(deviceType) {
            return this.currentDevice === deviceType;
        }
        isMobile() {
            return ['mobile', 'tablet'].includes(this.currentDevice);
        }
        getViewport() {
            return {
                width: window.innerWidth,
                height: window.innerHeight,
                orientation: window.innerWidth > window.innerHeight ? "landscape" : "portrait"
            };
        }
        isLandscape() {
            return window.innerWidth > window.innerHeight;
        }
        isPortrait() {
            return window.innerHeight > window.innerWidth;
        }
        enforceLandscape(options) {
            if (options === void 0) { options = {}; }
            var showWarning = options.showWarning !== false;
            var warningMessage = options.message || 'Please turn your device to landscape mode';
            if (!this.isMobile())
                return;
            if (showWarning && !document.getElementById('landscape-warning')) {
                var overlay = document.createElement('div');
                overlay.id = 'landscape-warning';
                overlay.style.cssText = "\n         position:fixed;\n         top :0 ;\n         left :0 ;\n         width :100% ;\n         height :100%;\n         background :rgba(0 ,0 ,0 ,0.95);\n         display:none ;\n         justify-content:center ;\n         align-items:center ;\n         z-index :99999 ;\n         flex-direction :column ;\n         color:white ;\n         font-family:'Arial' ,sans-serif ;\n         text-align:center ;\n         padding :20px ;";
                overlay.innerHTML = "\n          <div style=\"font-size :64px ;margin-bottom :20px;\">\uD83D\uDCF1 \u21BB</div>\n          <div style=\"font-size :24px;font-weight:bold;margin-bottom :10px;\">".concat(warningMessage, "</div>\n          <div style=\"font-size :16px;opacity:.8;\">This app works best in landscape mode</div>");
                document.body.appendChild(overlay);
            }
            var checkOrientation = function () {
                var overlay = document.getElementById('landscape-warning');
                if (!overlay)
                    return; // 'this' is bound to ResponsiveManager
                if (this.isPortrait() && this.isMobile()) {
                    overlay.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
                else {
                    overlay.style.display = 'none';
                    document.body.style.overflow = '';
                }
            };
            checkOrientation.call(this); // Explicitly call with 'this' context
            this.on('resize', checkOrientation.bind(this)); // Bind 'this' for the callback
            globalThis.addEventListener('orientationchange', function () {
                setTimeout(checkOrientation.bind(this), 100); // Bind 'this' for the setTimeout callback
            }.bind(this));
        }
        disableLandscapeWarning() {
            var overlay = document.getElementById('landscape-warning');
            if (overlay) {
                overlay.remove();
                document.body.style.overflow = '';
            }
        }
        getOptimalRatio() {
            var device = this.getDevice();
            switch (device) {
                case 'mobile':
                    return 1.78;
                case 'tablet':
                    return 1.6;
                case 'desktop':
                case 'wide':
                    return 1.78;
                default:
                    return 1.78;
            }
        }
        getCurrentRatio() {
            var viewport = this.getViewport();
            return viewport.width / viewport.height;
        }
        adaptContainerToRatio(container, options) {
            if (options === void 0) { options = {}; }
            if (typeof container === 'string') {
                container = document.querySelector(container);
            }
            if (!container) {
                console.error('Container not found');
                return { width: -1, height: -1, ratio: -1 };
            }
            var targetRatio = options.ratio || this.getOptimalRatio();
            var mode = options.mode || 'contain';
            var viewport = this.getViewport();
            var width = viewport.width, height = viewport.height;
            switch (mode) {
                case 'contain':
                    if (viewport.width / viewport.height > targetRatio) {
                        height = viewport.height;
                        width = height * targetRatio;
                    }
                    else {
                        width = viewport.width;
                        height = width / targetRatio;
                    }
                    break;
                case 'cover':
                    if (viewport.width / viewport.height > targetRatio) {
                        width = viewport.width;
                        height = width / targetRatio;
                    }
                    else {
                        height = viewport.height;
                        width = height * targetRatio;
                    }
                    break;
                case 'fill':
                    width = viewport.width;
                    height = viewport.height;
                    break;
            }
            container.style.width = "".concat(width, "px");
            container.style.height = "".concat(height, "px");
            container.style.maxWidth = '100%';
            container.style.maxHeight = '100%';
            if (options.center !== false) {
                container.style.margin = '0 auto';
                container.style.position = 'relative';
                container.style.left = '50%';
                container.style.top = '50%';
                container.style.transform = 'translate(-50%, -50%)';
            }
            return { width: width, height: height, ratio: (width / height) };
        }
        enableAutoRatioAdapt(container, options) {
            if (options === void 0) { options = {}; }
            var adapt = function () { this.adaptContainerToRatio(container, options); }.bind(this);
            adapt(); // Call it directly
            this.on('resize', adapt); // Pass the bound function
            globalThis.addEventListener('orientationchange', function () {
                setTimeout(adapt, 100); // setTimeout will call the bound function
            }.bind(this));
            return adapt;
        }
        adaptFontSize(baseSize) {
            if (baseSize === void 0) { baseSize = 16; }
            var width = window.innerWidth;
            var fontSize = baseSize;
            if (width < this.breakpoints.mobile) {
                fontSize = baseSize * 0.875;
            }
            else if (width < this.breakpoints.tablet) {
                fontSize = baseSize * 0.9375;
            }
            else if (width >= this.breakpoints.wide) {
                fontSize += baseSize * 1.125;
            }
            document.documentElement.style.fontSize = "".concat(fontSize, "px");
        }
    }
    return ResponsiveManager;
}());
var responsive = new ResponsiveManager({
    breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
        wide: 1440
    }
});
responsive.adaptFontSize(16);
responsive.on('resize', function () {
    responsive.adaptFontSize(16);
});
responsive.on('mobile', function (data) {
    console.log('Switch to mobile mode', data);
});
responsive.on('tablet', function (data) {
    console.log('Switch to tablet mode', data);
});
responsive.on('desktop', function (data) {
    console.log('Switch to desktop mode', data);
});
responsive.on("resize", function (data) {
    console.log("resizing:", data);
});
var ResponsiveUtils = {
    showOnDevice: function (element, devices) {
        if (devices === void 0) { devices = []; }
        var current_device = responsive.getDevice();
        if (devices.includes(current_device)) {
            element.style.display = '';
        }
        else {
            element.style.display = 'none';
        }
    },
    loadResponsiveImage: function (img, sources) {
        var device = responsive.getDevice();
        if (sources[device]) {
            img.src = sources[device];
        }
    },
    adaptGrid: function (container, columns) {
        var device = responsive.getDevice();
        var cols = (columns[device] || columns.desktop || 3);
        container.style.gridTemplateColumns = "repeat(".concat(cols, ",1fr)");
    }
};
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResponsiveManager: ResponsiveManager, ResponsiveUtils: ResponsiveUtils };
}
;
globalThis.ResponsiveManager = ResponsiveManager;
;
globalThis.ResponsiveUtils = ResponsiveUtils;
;
globalThis.responsive = responsive;
