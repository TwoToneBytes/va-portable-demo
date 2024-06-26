import './App.css';

const INSTANCE_URL = 'https://support.va-sn.dev';
const REDIRECT_URL = `${INSTANCE_URL}/sn_va_web_client_login.do?sysparm_redirect_uri=${encodeURIComponent(window.location.href)}`;


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
    const isSessionUnauthenticatedEvent = e?.data?.type === 'SESSION_CREATED' && !e.data.authenticated;
    const isSessionLoggedOut = e?.data?.type === 'SESSION_LOGGED_OUT';
    if (isSessionLoggedOut || isSessionUnauthenticatedEvent) {
        window.location.href = REDIRECT_URL;
        return;
    }

    console.log('Session created', {event: e.data});
});

function App() {
    return (
        <div className="App">
            <header className="App-header">
            </header>
        </div>
    );
}

export default App;
