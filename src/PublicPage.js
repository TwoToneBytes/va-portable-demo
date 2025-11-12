import './PageInfo.css';

function PublicPage() {
    return (
        <div className="page-container">
            <div className="page-info">
                <h1>Public Virtual Agent</h1>
                <div className="info-section">
                    <h2>About This Page</h2>
                    <p>
                        This page demonstrates the <strong>public/guest access mode</strong> of the ServiceNow Virtual
                        Agent.
                        No authentication is required to use the Virtual Agent on this page.
                    </p>
                </div>

                <div className="info-section">
                    <h2>Key Features</h2>
                    <ul>
                        <li><strong>No Login Required:</strong> Users can interact with the Virtual Agent without
                            authenticating
                        </li>
                        <li><strong>Guest Access:</strong> Perfect for public-facing help desks or anonymous support
                        </li>
                        <li><strong>No SSO Redirect:</strong> The application prevents automatic redirects to the
                            ServiceNow login page
                        </li>
                    </ul>
                </div>

                <div className="info-section">
                    <h2>Use Cases</h2>
                    <ul>
                        <li>Public-facing customer support portals</li>
                        <li>FAQ and self-service help for anonymous users</li>
                        <li>Pre-authentication customer assistance</li>
                    </ul>
                </div>

                <div className="info-section technical-note">
                    <h3>Technical Note</h3>
                    <p>
                        When the Virtual Agent detects an unauthenticated session on this page,
                        it <em>does not</em> redirect to the SSO login. This is handled in the parent page. In our case
                        it is the:
                        <code>portable-va-loader.js</code> file by checking the current pathname.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PublicPage;
