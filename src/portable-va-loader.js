export function loadPortableVA(options) {
    const {INSTANCE_URL, REDIRECT_URL} = options;

    const serviceNowModule = document.createElement('script');
    serviceNowModule.type = 'module';
    serviceNowModule.src = INSTANCE_URL + '/uxasset/externals/now-requestor-chat-popover-app/index.jsdbx?sysparm_substitute=false&uxpcb=1';
    serviceNowModule.onload = () => {
        new window.ServiceNowChat({
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
        })
    }
    document.head.appendChild(serviceNowModule);


    window.addEventListener('message', (e) => {
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
    });
}
