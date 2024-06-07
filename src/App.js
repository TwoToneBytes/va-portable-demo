import './App.css';
import ServiceNowChat
    from 'https://support.va-sn.dev/uxasset/externals/now-requestor-chat-popover-app/index.jsdbx?sysparm_substitute=false&uxpcb=1';

const chat = new ServiceNowChat({
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
