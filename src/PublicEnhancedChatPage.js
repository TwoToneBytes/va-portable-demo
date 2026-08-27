import './PageInfo.css';
import {useEnhancedChatContainer} from './useEnhancedChatContainer';

function PublicEnhancedChatPage() {
    // manageNowLogin: false — guest access, never redirects to SSO login.
    const chatContainerRef = useEnhancedChatContainer(false);

    return (
        <div className="page-container">
            <div className="page-info">
                <h1>Public Enhanced Chat</h1>
                <div className="info-section">
                    <h2>About This Page</h2>
                    <p>
                        This page demonstrates the <strong>public/guest access mode</strong> of the ServiceNow
                        Enhanced Chat widget (<code>embedded-enhanced-chat</code>). No authentication is required
                        to use the chat on this page.
                    </p>
                </div>

                <div className="info-section">
                    <h2>Key Features</h2>
                    <ul>
                        <li><strong>No Login Required:</strong> Users can interact with the Enhanced Chat widget
                            without authenticating
                        </li>
                        <li><strong>Guest Access:</strong> Perfect for public-facing help desks or anonymous support
                        </li>
                        <li><strong>No SSO Redirect:</strong> The widget's <code>manageNowLogin</code> option is
                            left off, so it never redirects to the ServiceNow login page
                        </li>
                    </ul>
                </div>

                <div className="info-section technical-note">
                    <h3>Technical Note</h3>
                    <p>
                        This page loads the Enhanced Chat widget via the <code>EnhancedChat</code> named export
                        from <code>embedded-enhanced-chat</code>, handled in <code>enhanced-va-loader.js</code>.
                        The widget is constructed with <code>manageNowLogin: false</code> (its default), so it
                        never redirects the host page to the SSO login, even for an unauthenticated session —
                        see <code>docs/enhanced-chat-docs.md</code> for the full config reference.
                    </p>
                </div>
            </div>
            {/* Enhanced Chat mounts here (see useEnhancedChatContainer) instead
                of document.body, so it's destroyed when this page unmounts.
                color is scoped to just this container so the widget inherits
                a darker default text color, without touching .main/.header's
                white text for the rest of the app. */}
            <div ref={chatContainerRef} style={{display: 'contents', color: '#1e3a5f'}}/>
        </div>
    );
}

export default PublicEnhancedChatPage;