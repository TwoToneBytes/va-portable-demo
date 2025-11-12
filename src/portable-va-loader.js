let currentServiceNowChatInstance = null;
let currentScriptElement = null;
let currentMessageListener = null;

export function loadPortableVA(options) {
    const {INSTANCE_URL, REDIRECT_URL} = options;

    if (currentServiceNowChatInstance) {
        try {
            currentServiceNowChatInstance.destroy();
        } catch (error) {
            console.warn('Error destroying existing ServiceNowChat instance:', error);
        }
        currentServiceNowChatInstance = null;
    }

    if (currentScriptElement?.parentNode) {
        currentScriptElement.parentNode.removeChild(currentScriptElement);
        currentScriptElement = null;
    }

    // Remove any existing message listener to prevent memory leaks
    if (currentMessageListener) {
        window.removeEventListener('message', currentMessageListener);
    }

    // Store reference to the message listener for cleanup
    currentMessageListener = (e) => {
        // prevent redirecting on the public page:
        if (window.location.pathname === '/public') {
            return;
        }

        const isSessionUnauthenticatedEvent = e?.data?.type === 'SESSION_CREATED' && !e.data.authenticated;
        const isSessionLoggedOut = e?.data?.type === 'SESSION_LOGGED_OUT';
        if (isSessionLoggedOut || isSessionUnauthenticatedEvent) {
            window.location.href = REDIRECT_URL;
            return;
        }

        console.log('Session created', {event: e.data});
    };

    window.addEventListener('message', currentMessageListener);

    return new Promise((resolve, reject) => {
        const serviceNowModule = document.createElement('script');
        serviceNowModule.type = 'module';
        serviceNowModule.src = INSTANCE_URL + '/uxasset/externals/now-requestor-chat-popover-app/index.jsdbx?sysparm_substitute=false&uxpcb=1';
        serviceNowModule.onload = () => {
            try {
                currentServiceNowChatInstance = new window.ServiceNowChat({
                    instance: INSTANCE_URL,
                    context: {
                        skip_load_history: 1
                    },
                    branding: {},
                    offsetX: 50,
                    offsetY: 50,
                    position: 'right',
                    translations: {
                        'Open dialog': 'Open chat',
                        'Open Chat. {0} unread message(s)': 'Click to open',
                        'Close chat.': 'Click to close',
                    },
                });
                resolve(currentServiceNowChatInstance);
            } catch (error) {
                reject(error);
            }
        };
        
        serviceNowModule.onerror = () => {
            reject(new Error('Failed to load ServiceNow chat script'));
        };
        
        currentScriptElement = serviceNowModule;
        document.head.appendChild(serviceNowModule);
    });
}

export function destroyPortableVA() {
    if (currentServiceNowChatInstance) {
        try {
            currentServiceNowChatInstance.destroy();
        } catch (error) {
            console.warn('Error destroying ServiceNowChat instance:', error);
        }
        currentServiceNowChatInstance = null;
    }

    if (currentScriptElement?.parentNode) {
        currentScriptElement.parentNode.removeChild(currentScriptElement);
        currentScriptElement = null;
    }

    // Remove message event listener to prevent memory leaks
    if (currentMessageListener) {
        window.removeEventListener('message', currentMessageListener);
        currentMessageListener = null;
    }
}
