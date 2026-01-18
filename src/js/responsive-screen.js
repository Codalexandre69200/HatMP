class ResponsiveManager {
    constructor(options = {}) {
        this.breakpoints = options.breakpoints || {
            mobile: 480,
            tablet: 768,
            desktop: 1024,
            wide: 1440
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

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.detectDevice();
                this.executeCallbacks('resize');
            }, 250);
        });

        globalThis.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.detectDevice();
            }, 200);
        });
    }

    detectDevice() {
        const width = window.innerWidth;
        let newDevice = '';

        if (width < this.breakpoints.tablet) {
            newDevice = 'mobile';
        } else if (width < this.breakpoints.desktop) {
            newDevice = 'tablet';
        } else if (width < this.breakpoints.wide) {
            newDevice = 'desktop';
        } else {
            newDevice = 'wide';
        }

        if (newDevice !== this.currentDevice) {
            const oldDevice = this.currentDevice;
            this.currentDevice = newDevice;

            document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop', 'device-wide');
            document.body.classList.add(`device-${newDevice}`);

            this.executeCallbacks(newDevice, { oldDevice, newDevice, width });
        }
    }

    on(deviceType, callback) {
        if (this.callbacks[deviceType]) {
            this.callbacks[deviceType].push(callback);
        }
    }

    executeCallbacks(type, data = {}) {
        if (this.callbacks[type]) {
            this.callbacks[type].forEach(callback => {
                callback({ ...data, currentDevice: this.currentDevice, width: window.innerWidth, height: window.innerHeight });
            });
        }
    }

    getDevice() {
        return this.currentDevice;
    }

    is(deviceType) {
        return this.currentDevice === deviceType;
    }

    isMobile() {
        return this.currentDevice === 'mobile' || this.currentDevice === 'tablet';
    }

    getViewport() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        };
    }

    isLandscape() {
        return window.innerWidth > window.innerHeight;
    }

    isPortrait() {
        return window.innerHeight > window.innerWidth;
    }

    enforceLandscape(options = {}) {
        const showWarning = options.showWarning !== false;
        const warningMessage = options.message || 'Please turn your device to landscape mode';

        if (!this.isMobile()) return;

        if (showWarning && !document.getElementById('landscape-warning')) {
            const overlay = document.createElement('div');
            overlay.id = 'landscape-warning';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 99999;
                flex-direction: column;
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
            `;

            // Création sécurisée des éléments DOM
            const iconDiv = document.createElement('div');
            iconDiv.style.cssText = 'font-size: 64px; margin-bottom: 20px;';
            iconDiv.textContent = '📱 ↻';

            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = 'font-size: 24px; font-weight: bold; margin-bottom: 10px;';
            messageDiv.textContent = warningMessage; // Sécurisé contre XSS

            const subtitleDiv = document.createElement('div');
            subtitleDiv.style.cssText = 'font-size: 16px; opacity: 0.8;';
            subtitleDiv.textContent = 'This application works better in landscape mode';

            overlay.appendChild(iconDiv);
            overlay.appendChild(messageDiv);
            overlay.appendChild(subtitleDiv);

            document.body.appendChild(overlay);
        }

        const checkOrientation = () => {
            const overlay = document.getElementById('landscape-warning');
            if (!overlay) return;

            if (this.isPortrait() && this.isMobile()) {
                overlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            } else {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        };

        checkOrientation();
        this.on('resize', checkOrientation);
        globalThis.addEventListener('orientationchange', () => {
            setTimeout(checkOrientation, 100);
        });
    }

    disableLandscapeWarning() {
        const overlay = document.getElementById('landscape-warning');
        if (overlay) {
            overlay.remove();
            document.body.style.overflow = '';
        }
    }

    getOptimalRatio() {
        const device = this.getDevice();

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
        const viewport = this.getViewport();
        return viewport.width / viewport.height;
    }

    adaptContainerToRatio(container, options = {}) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }

        if (!container) {
            console.error('Container not found');
            return;
        }

        const targetRatio = options.ratio || this.getOptimalRatio();
        const mode = options.mode || 'contain';
        const viewport = this.getViewport();

        let width, height;

        switch (mode) {
            case 'contain':
                if (viewport.width / viewport.height > targetRatio) {
                    height = viewport.height;
                    width = height * targetRatio;
                } else {
                    width = viewport.width;
                    height = width / targetRatio;
                }
                break;

            case 'cover':
                if (viewport.width / viewport.height > targetRatio) {
                    width = viewport.width;
                    height = width / targetRatio;
                } else {
                    height = viewport.height;
                    width = height * targetRatio;
                }
                break;

            case 'fill':
                width = viewport.width;
                height = viewport.height;
                break;
        }

        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
        container.style.maxWidth = '100%';
        container.style.maxHeight = '100%';

        if (options.center !== false) {
            container.style.margin = '0 auto';
            container.style.position = 'relative';
            container.style.left = '50%';
            container.style.top = '50%';
            container.style.transform = 'translate(-50%, -50%)';
        }

        return { width, height, ratio: width / height };
    }

    enableAutoRatioAdapt(container, options = {}) {
        const adapt = () => {
            this.adaptContainerToRatio(container, options);
        };

        adapt();

        this.on('resize', adapt);
        globalThis.addEventListener('orientationchange', () => {
            setTimeout(adapt, 100);
        });

        return adapt;
    }

    adaptFontSize(baseSize = 16) {
        const width = window.innerWidth;
        let fontSize;

        if (width < this.breakpoints.tablet) {
            fontSize = baseSize * 0.875;
        } else if (width < this.breakpoints.desktop) {
            fontSize = baseSize * 0.9375;
        } else if (width < this.breakpoints.wide) {
            fontSize = baseSize;
        } else {
            fontSize = baseSize * 1.125;
        }

        document.documentElement.style.fontSize = `${fontSize}px`;
    }
}

const responsive = new ResponsiveManager({
    breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
        wide: 1440
    }
});

responsive.adaptFontSize(16);
responsive.on('resize', () => {
    responsive.adaptFontSize(16);
});

responsive.on('mobile', (data) => {
    console.log('Switch to mobile mode', data);
});

responsive.on('tablet', (data) => {
    console.log('Switch to tablet mode', data);
});

responsive.on('desktop', (data) => {
    console.log('Switch to desktop mode', data);
});

responsive.on('resize', (data) => {
    console.log('Resize:', data);
});

if (responsive.isMobile()) {
    responsive.enforceLandscape({
        showWarning: true,
        message: 'Please turn your device to landscape mode'
    });
}

const ResponsiveUtils = {
    showOnDevice(element, devices = []) {
        const currentDevice = responsive.getDevice();
        if (devices.includes(currentDevice)) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    },

    loadResponsiveImage(img, sources) {
        const device = responsive.getDevice();
        if (sources[device]) {
            img.src = sources[device];
        }
    },

    adaptGrid(container, columns) {
        const device = responsive.getDevice();
        const cols = columns[device] || columns.desktop || 3;
        container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResponsiveManager, ResponsiveUtils };
}

globalThis.ResponsiveManager = ResponsiveManager;
globalThis.ResponsiveUtils = ResponsiveUtils;
globalThis.responsive = responsive;
