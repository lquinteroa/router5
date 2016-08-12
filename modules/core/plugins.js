import constants from '../constants';

const pluginMethods = ['onStop', 'onTransitionSuccess', 'onTransitionStart', 'onTransitionError', 'onTransitionCancel'];

export default function withPlugins(router) {
    const plugins = [];
    let removePluginListeners = [];

    router.usePlugin = usePlugin;
    router.hasPlugin = hasPlugin;

    function usePlugin(...plugins) {
        plugins.forEach(addPlugin);
        return router;
    }

    function addPlugin(plugin) {
        if (!hasPlugin(plugin)) {
            plugins.push(plugin);

            if (router.isStarted()) {
                startPlugin(plugin);
            }
        }
    }

    function hasPlugin(pluginName) {
        return plugins.filter(p => p.name === pluginName).length > 0;
    }

    function startPlugin(plugin) {
        const appliedPlugin = router.executeFactory(plugin);

        const removeEventListeners = pluginMethods.map((methodName) => {
            if (appliedPlugin[methodName]) {
                return router.addEventListener(
                    methodName.toLowerCase().replace(/^on/, '$$').replace(/transition/, '$$'),
                    appliedPlugin[methodName]
                );
            }
        }).filter(Boolean);

        removePluginListeners.push(...removeEventListeners);
    }

    function startPlugins() {
        plugins.forEach(startPlugin);
    }

    function stopPlugins() {
        removePluginListeners.forEach((removeEventListener) => removeEventListener());
        removePluginListeners = [];
    }

    router.addEventListener(constants.ROUTER_START, startPlugins);
    router.addEventListener(constants.ROUTER_STOP, stopPlugins);
}