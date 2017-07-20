import StyleUpdater from './styleUpdater';
import domService from './domService';
import WixService from './wixService';
import {Plugins} from './plugins';
import {defaultPlugins} from './defaultPlugins';

export default {
    plugins: new Plugins(),

    init(options, domServiceOverride = domService) {
        const wixService = WixService(window.Wix);

        Object.keys(defaultPlugins)
            .forEach((funcName) => this.plugins.addCssFunction(funcName, defaultPlugins[funcName]));

        options = setDefaultOptions(options, this.plugins);
        options.shouldUseCssVars = domService.isCssVarsSupported() && (wixService.isEditorMode() || wixService.isPreviewMode());

        const styleUpdater = StyleUpdater(wixService, domServiceOverride, options);

        if (wixService.isEditorMode() || wixService.isPreviewMode()) {
            wixService.listenToStyleParamsChange(() => styleUpdater.update(true));
        }
        return styleUpdater.update();
    }
}

function setDefaultOptions(options, plugins): any {
    options = options || {};
    options.plugins = options.plugins || plugins;
    return options;
}
