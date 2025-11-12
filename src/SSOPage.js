import './PageInfo.css';

function SSOPage() {
    return (
        <div className="page-container">
            <div className="page-info">
                <h1>Virtual Agent with SSO Login</h1>
                <div className="info-section">
                    <h2>About This Page</h2>
                    <p>
                        This page demonstrates the <strong>authenticated access mode</strong> of the ServiceNow Virtual Agent.
                        Users must be logged in to their ServiceNow instance to use the Virtual Agent on this page.
                    </p>
                </div>

                <div className="info-section">
                    <h2>Key Features</h2>
                    <ul>
                        <li><strong>Authentication Required:</strong> Users must log in via ServiceNow SSO</li>
                        <li><strong>Automatic SSO Redirect:</strong> If not authenticated, users are automatically redirected to the ServiceNow login page</li>
                        <li><strong>Personalized Experience:</strong> The Virtual Agent can access user context and provide personalized assistance</li>
                        <li><strong>Session Management:</strong> Maintains authenticated sessions with the ServiceNow instance</li>
                    </ul>
                </div>

                <div className="info-section">
                    <h2>Use Cases</h2>
                    <ul>
                        <li>Internal employee support portals</li>
                        <li>Authenticated customer portals with personalized service</li>
                        <li>Access to user-specific data and workflows</li>
                        <li>Secure interactions requiring identity verification</li>
                    </ul>
                </div>

                <div className="info-section technical-note">
                    <h3>Technical Note</h3>
                    <p>
                        When the Virtual Agent detects an unauthenticated session on this page,
                        it <em>automatically redirects</em> the user to the ServiceNow SSO login page.
                        After successful authentication, the user is returned to this application.
                        This behavior is implemented in <code>portable-va-loader.js</code> by listening
                        for <code>SESSION_CREATED</code> and <code>SESSION_LOGGED_OUT</code> events.
                    </p>
                </div>

                <div className="info-section action-prompt">
                    <p>
                        <strong>To test this feature:</strong> Click the Virtual Agent chat icon in the bottom-right corner.
                        If you're not already authenticated, you'll be redirected to log in.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SSOPage;
