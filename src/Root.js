import './Root.css';
import {destroyPortableVA, loadPortableVA} from './portable-va-loader';
import {Link, Outlet} from "react-router-dom";
import {useEffect, useState} from 'react';

const DEFAULT_INSTANCE_URL = 'https://support.va-sn.dev';
const CHAT_OPENED_EVENT_NAME = 'NOW_REQ_CHAT_POPOVER_OR_SELF_SERVICE#DIALOG_OPENED';
const CHAT_CLOSED_EVENT_NAME = 'NOW_REQ_CHAT_POPOVER_OR_SELF_SERVICE#DIALOG_CLOSED';

// Extract the domain and top-level domain from a URL
const getDomainParts = (url) => {
    try {
        const urlObj = new URL(url);
        const hostnameParts = urlObj.hostname.split('.');

        // Get the domain (last two parts: domain.tld)
        if (hostnameParts.length >= 2) {
            const tld = hostnameParts[hostnameParts.length - 1];
            const domain = hostnameParts[hostnameParts.length - 2];
            return {domain, tld, fullDomain: `${domain}.${tld}`};
        }
        return null;
    } catch {
        return null;
    }
};

// Check if two URLs have the same top-level domain
const isSameDomain = (url1, url2) => {
    const domain1 = getDomainParts(url1);
    const domain2 = getDomainParts(url2);

    if (!domain1 || !domain2) return false;

    return domain1.fullDomain === domain2.fullDomain;
};

const validateUrl = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'https:' && urlObj.hostname.includes('.');
    } catch {
        return false;
    }
};

function Root() {
    const [instanceUrl, setInstanceUrl] = useState(() => {
        return localStorage.getItem('va-instance-url') || DEFAULT_INSTANCE_URL;
    });

    const [inputUrl, setInputUrl] = useState(instanceUrl);
    const [isValidUrl, setIsValidUrl] = useState(true);
    const [showCrossDomainWarning, setShowCrossDomainWarning] = useState(false);

    const [showConfig, setShowConfig] = useState(false);

    const [chatInstance, setChatInstance] = useState(null);

    const [isChatOpen, setIsChatOpen] = useState(false);


    // Load portable VA when instance URL changes
    useEffect(() => {
        const REDIRECT_URL = `${instanceUrl}/sn_va_web_client_login.do?sysparm_redirect_uri=${encodeURIComponent(window.location.href)}`;

        loadPortableVA({INSTANCE_URL: instanceUrl, REDIRECT_URL})
            .then((instance) => {
                setChatInstance(instance);
                setIsChatOpen(false); // Reset chat state when new instance loads
            })
            .catch((error) => {
                console.error('Failed to load ServiceNow chat:', error);
                setChatInstance(null);
                setIsChatOpen(false); // Reset chat state on error
            });

        // Save to localStorage
        localStorage.setItem('va-instance-url', instanceUrl);

        // Cleanup function to destroy the instance when component unmounts or instanceUrl changes
        return () => {
            destroyPortableVA();
            setChatInstance(null);
            setIsChatOpen(false); // Reset chat state on cleanup
        };
    }, [instanceUrl]);

    // Listen for chat open/close events
    useEffect(() => {
        const handleChatOpened = () => {
            setIsChatOpen(true);
        };

        const handleChatClosed = () => {
            setIsChatOpen(false);
        };

        window.addEventListener(CHAT_OPENED_EVENT_NAME, handleChatOpened);
        window.addEventListener(CHAT_CLOSED_EVENT_NAME, handleChatClosed);

        return () => {
            window.removeEventListener(CHAT_OPENED_EVENT_NAME, handleChatOpened);
            window.removeEventListener(CHAT_CLOSED_EVENT_NAME, handleChatClosed);
        };
    }, []);

    const handleUrlChange = (e) => {
        const newUrl = e.target.value;
        setInputUrl(newUrl);

        const isValid = validateUrl(newUrl);
        setIsValidUrl(isValid);

        // Check if the new URL is on a different domain
        if (isValid) {
            const currentSiteUrl = window.location.href;
            const isDifferentDomain = !isSameDomain(newUrl, currentSiteUrl);
            setShowCrossDomainWarning(isDifferentDomain);
        } else {
            setShowCrossDomainWarning(false);
        }
    };

    const handleApplyUrl = () => {
        if (isValidUrl && inputUrl.trim()) {
            setInstanceUrl(inputUrl.trim());
            setShowConfig(false);
        }
    };

    const handleReset = () => {
        setInputUrl(DEFAULT_INSTANCE_URL);
        setInstanceUrl(DEFAULT_INSTANCE_URL);
        setIsValidUrl(true);
        setShowConfig(false);
    };

    const handleOpenChat = () => {
        chatInstance.open();
        setIsChatOpen(true);
    };

    const handleCloseChat = () => {
        chatInstance.close();
        setIsChatOpen(false);
    };

    return (
        <div className="App">
            <header className="header">
                <nav>
                    <ul>
                        <li>
                            <Link to={`/`}>Home</Link>
                        </li>
                        <li>
                            <Link to={`/public`}>Public Virtual Agent</Link>
                        </li>
                        <li>
                            <Link to={`/sso`}>Virtual Agent SSO Login</Link>
                        </li>
                    </ul>
                </nav>
                <div className="control-section">
                    <div className="section-header">
                        <strong>Current Instance:</strong> {instanceUrl}
                        <button
                            className="config-button"
                            onClick={() => setShowConfig(!showConfig)}
                        >
                            ⚙️ Configure
                        </button>
                    </div>
                    {showConfig && (
                        <div className="instance-config">
                            <div className="config-form">
                                <label htmlFor="instance-url-input">ServiceNow Instance URL:</label>
                                <input
                                    id="instance-url-input"
                                    type="url"
                                    value={inputUrl}
                                    onChange={handleUrlChange}
                                    placeholder="https://your-instance.service-now.com"
                                    className={!isValidUrl ? 'invalid' : ''}
                                />
                                {!isValidUrl && (
                                    <div className="error-message">
                                        Please enter a valid HTTPS URL (e.g., https://your-instance.service-now.com)
                                    </div>
                                )}
                                {isValidUrl && showCrossDomainWarning && (
                                    <div className="warning-message">
                                        <strong>⚠️ Cross-Domain Warning:</strong> The instance URL you've entered is on
                                        a different domain than this site.
                                        This may cause issues with third-party cookies, which could prevent
                                        authentication and session management from working properly.
                                        Additionally, certain browser modes (such as incognito/private browsing) will
                                        not work at all due to stricter cookie policies.
                                    </div>
                                )}
                                <div className="config-buttons">
                                    <button
                                        onClick={handleApplyUrl}
                                        disabled={!isValidUrl || !inputUrl.trim()}
                                        className="apply-button"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="reset-button"
                                    >
                                        Reset to Default
                                    </button>
                                    <button
                                        onClick={() => setShowConfig(false)}
                                        className="cancel-button"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="control-section">
                    <div className="section-header">
                        <strong>ServiceNow Chat API</strong>
                    </div>
                    <div className="config-buttons">
                        <button
                            onClick={handleOpenChat}
                            disabled={!chatInstance || isChatOpen}
                            className="apply-button"
                        >
                            Open Chat
                        </button>
                        <button
                            onClick={handleCloseChat}
                            disabled={!chatInstance || !isChatOpen}
                            className="reset-button"
                        >
                            Close Chat
                        </button>
                    </div>
                </div>
            </header>
            <div className="main">
                <Outlet/>
            </div>
        </div>
    );
}

export default Root;
