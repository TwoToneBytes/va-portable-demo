import './Root.css';
import {loadPortableVA} from './portable-va-loader';
import {Link, Outlet} from "react-router-dom";

const INSTANCE_URL = 'https://support.va-sn.dev';
const REDIRECT_URL = `${INSTANCE_URL}/sn_va_web_client_login.do?sysparm_redirect_uri=${encodeURIComponent(window.location.href)}`;
loadPortableVA({INSTANCE_URL, REDIRECT_URL});

function Root() {
    return (<div className="App">
        <header className="App-header">
            <nav>
                <ul>
                    <li>
                        <Link to={`/public`}>Public Virtual Agent</Link>
                    </li>
                    <li>
                        <Link to={`/sso`}>Virtual Agent SSO Login</Link>
                    </li>
                </ul>
            </nav>
        </header>
        <div id="root">
            <Outlet/>
        </div>
    </div>);
}

export default Root;
