let currentEnhancedChatInstance = null;

// See docs/enhanced-chat-docs.md for the full EnhancedChat config/API reference.

function destroyCurrentInstance() {
    if (currentEnhancedChatInstance) {
        try {
            currentEnhancedChatInstance.destroy();
        } catch (error) {
            console.warn('Error destroying existing EnhancedChat instance:', error);
        }
        currentEnhancedChatInstance = null;
    }
}

async function importEnhancedChat(instanceUrl) {
    const moduleUrl = `${instanceUrl}/uxasset/externals/embedded-enhanced-chat/index.jsdbx?sysparm_substitute=false&uxpcb=1`;

    // webpackIgnore keeps this as a native dynamic import so the browser's
    // ES module loader fetches the remote module directly, instead of
    // webpack trying to statically resolve/bundle a fully dynamic URL.
    const {EnhancedChat} = await import(/* webpackIgnore: true */ moduleUrl);
    return EnhancedChat;
}

export async function loadEnhancedVA(options) {
    const {INSTANCE_URL, PORTAL = 'sp', MANAGE_NOW_LOGIN = false, CONTAINER, TITLE_COLOR} = options;

    destroyCurrentInstance();

    const EnhancedChat = await importEnhancedChat(INSTANCE_URL);

    // manageNowLogin, when true, makes the widget itself listen for the
    // iframe's SESSION_CREATED (unauthenticated)/SESSION_LOGGED_OUT
    // postMessages and redirect the host page to the instance's SSO login —
    // no manual message listener needed on our side.
    currentEnhancedChatInstance = new EnhancedChat({
        instance: INSTANCE_URL,
        portal: PORTAL,
        manageNowLogin: MANAGE_NOW_LOGIN,
        // Off by default — unread.enabled defaults to true on the widget
        // itself, which polls get_feature_status/unread endpoints on the
        // instance (see "Unread messages and proactive nudges" in
        // docs/enhanced-chat-docs.md). Not needed for this demo, so skip
        // the extra network traffic against the configured instance.
        unread: {enabled: false},
        // container defaults to document.body when omitted — callers that
        // want the widget's lifecycle scoped to a specific view (destroyed
        // when that view unmounts) pass their own mount node instead.
        ...(CONTAINER ? {container: CONTAINER} : {}),
        // Sets the header title's text color via the widget's own
        // branding.header.titleColor config (see docs/enhanced-chat-docs.md)
        // instead of relying on the mount container inheriting a color from
        // page CSS.
        ...(TITLE_COLOR ? {branding: {header: {titleColor: TITLE_COLOR}}} : {}),
    });

    return currentEnhancedChatInstance;
}

// Full-config variant for the config panel (see EnhancedChatConfigPanel.js):
// `config` is passed straight through to `new EnhancedChat(config)` instead
// of the fixed subset `loadEnhancedVA` builds, so every field documented in
// docs/enhanced-chat-docs.md can be exercised. Shares the same
// destroy-then-create singleton as `loadEnhancedVA` above, so Root's
// "ServiceNow Chat API" open/close controls keep working regardless of
// which loader created the current instance.
export async function loadEnhancedVAWithConfig(config) {
    destroyCurrentInstance();

    const EnhancedChat = await importEnhancedChat(config.instance);
    currentEnhancedChatInstance = new EnhancedChat(config);

    return currentEnhancedChatInstance;
}

export function destroyEnhancedVA() {
    destroyCurrentInstance();
}