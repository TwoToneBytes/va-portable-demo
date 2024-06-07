import './App.css';

const serviceNowModule = document.createElement('script');
serviceNowModule.type = 'module';
serviceNowModule.src = 'https://support.va-sn.dev/uxasset/externals/now-requestor-chat-popover-app/index.jsdbx?sysparm_substitute=false&uxpcb=1';
serviceNowModule.onload = () => {
    new window.ServiceNowChat({
        instance: 'https://support.va-sn.dev',
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


function App() {
    return (
        <div className="App">
            <header className="App-header">
            </header>
        </div>
    );
}

export default App;
