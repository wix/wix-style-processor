import StyleUpdater from './styleUpdater';
import domService from './domService';
import WixService from './wixService';

declare var window: any;

export default {
    plugins: {
        valueTransformers: {},
        declarationTransformers: []
    },

    resetPlugins() {
        this.plugins = {
            valueTransformers: {},
            declarationTransformers: []
        }
    },

    init(options, domServiceOverride = domService) {
        options = setDefaultOptions(options, this.plugins);
        const wixService = WixService(window.Wix);
        const styleUpdater = StyleUpdater(wixService, domServiceOverride, options);
        wixService.listenToStyleParamsChange(() => styleUpdater.update());
        return styleUpdater.update();
    },

    plugin(...args) {
        return this.valuePlugin(...args);
    },

    valuePlugin(name, fun) {
        this.plugins.valueTransformers[name] = fun;
        return this;
    },

    declarationPlugin(fun) {
        this.plugins.declarationTransformers.push(fun);
        return this;
    }
}

function setDefaultOptions(options, plugins) {
    options = options || {};
    options.plugins = options.plugins || plugins;
    return options;
}