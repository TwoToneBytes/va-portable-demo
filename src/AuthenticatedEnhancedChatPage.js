import './PageInfo.css';
import {useEnhancedChatContainer} from './useEnhancedChatContainer';

function AuthenticatedEnhancedChatPage() {
    // manageNowLogin: true — redirects the host page to SSO login when the
    // iframe reports an unauthenticated/logged-out session.
    const chatContainerRef = useEnhancedChatContainer(true);

    return (
        <div className="page-container">
            <div className="page-info">
                <h1>Authenticated Enhanced Chat</h1>
                <div className="info-section">
                    <h2>About This Page</h2>
                    <p>
                        This page demonstrates the <strong>authenticated access mode</strong> of the ServiceNow
                        Enhanced Chat widget (<code>embedded-enhanced-chat</code>). Users must be logged in to
                        their ServiceNow instance to use the chat on this page.
                    </p>
                </div>

                <div className="info-section">
                    <h2>Key Features</h2>
                    <ul>
                        <li><strong>Authentication Required:</strong> Users must log in via ServiceNow SSO</li>
                        <li><strong>Automatic SSO Redirect:</strong> If not authenticated, users are automatically
                            redirected to the ServiceNow login page
                        </li>
                        <li><strong>Personalized Experience:</strong> The Enhanced Chat widget can access user
                            context and provide personalized assistance
                        </li>
                    </ul>
                </div>

                <div className="info-section technical-note">
                    <h3>Technical Note</h3>
                    <p>
                        This page loads the Enhanced Chat widget via the <code>EnhancedChat</code> named export
                        from <code>embedded-enhanced-chat</code>, handled in <code>enhanced-va-loader.js</code>.
                        The widget is constructed with <code>manageNowLogin: true</code>, which makes it listen
                        for the iframe's <code>SESSION_CREATED</code> (unauthenticated)
                        and <code>SESSION_LOGGED_OUT</code> <code>postMessage</code> events itself and redirect
                        this host page to the instance's SSO login when either fires — no custom message
                        listener needed on our side. See <code>docs/enhanced-chat-docs.md</code> for the full
                        config reference.
                    </p>
                </div>

                <div className="info-section action-prompt">
                    <p>
                        <strong>To test this feature:</strong> Click the chat icon in the bottom-right corner.
                        If you're not already authenticated, you'll be redirected to log in.
                    </p>
                </div>
            </div>
            {/* Enhanced Chat mounts here (see useEnhancedChatContainer) instead
                of document.body, so it's destroyed when this page unmounts.
                Header title color is set via the widget's own
                branding.header.titleColor config (see useEnhancedChatContainer),
                not page CSS. */}
            <div ref={chatContainerRef} style={{display: 'contents'}}/>
        </div>
    );
}

export default AuthenticatedEnhancedChatPage;