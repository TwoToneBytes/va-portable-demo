import './Root.css';
import {loadPortableVA} from './portable-va-loader';

const INSTANCE_URL = 'https://support.va-sn.dev';
const REDIRECT_URL = `${INSTANCE_URL}/sn_va_web_client_login.do?sysparm_redirect_uri=${encodeURIComponent(window.location.href)}`;
loadPortableVA({INSTANCE_URL, REDIRECT_URL});

function Root() {
    return (<div className="App">
        <header className="App-header">
        </header>
    </div>);
}

export default Root;
