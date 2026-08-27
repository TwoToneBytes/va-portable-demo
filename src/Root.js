import './Root.css';
import {Link, Outlet, useLocation} from "react-router-dom";
import {useEffect, useState} from 'react';
import EnhancedChatConfigPanel from './EnhancedChatConfigPanel';

const DEFAULT_PORTABLE_INSTANCE_URL = 'https://support.va-sn.dev';
const DEFAULT_ENHANCED_CHAT_INSTANCE_URL = 'https://nwjanus02.service-now.com';
const PORTABLE_INSTANCE_URL_STORAGE_KEY = 'va-instance-url';
const ENHANCED_CHAT_INSTANCE_URL_STORAGE_KEY = 'va-enhanced-chat-instance-url';
const PUBLIC_ENHANCED_CHAT_PATH = '/public-enhanced-chat';
const AUTHENTICATED_ENHANCED_CHAT_PATH = '/authenticated-enhanced-chat';
const ENHANCED_CHAT_PATHS = [PUBLIC_ENHANCED_CHAT_PATH, AUTHENTICATED_ENHANCED_CHAT_PATH];
const CHAT_OPENED_EVENT_NAME = 'NOW_REQ_CHAT_POPOVER_OR_SELF_SERVICE#DIALOG_OPENED';
const CHAT_CLOSED_EVENT_NAME = 'NOW_REQ_CHAT_POPOVER_OR_SELF_SERVICE#DIALOG_CLOSED';
// Enhanced Chat dispatches its own namespaced CustomEvent instead — see
// "Events" in docs/enhanced-chat-docs.md.
const ENHANCED_CHAT_OPEN_CHANGE_EVENT_NAME = 'now-embedded.open-change';

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
    const location = useLocation();
    const isEnhancedChatRoute = ENHANCED_CHAT_PATHS.includes(location.pathname);

    // Enhanced Chat and the portable VA each remember their own instance URL,
    // so switching between those route families doesn't clobber the other's setting.
    const [portableInstanceUrl, setPortableInstanceUrl] = useState(() => {
        return localStorage.getItem(PORTABLE_INSTANCE_URL_STORAGE_KEY) || DEFAULT_PORTABLE_INSTANCE_URL;
    });
    const [enhancedChatInstanceUrl, setEnhancedChatInstanceUrl] = useState(() => {
        return localStorage.getItem(ENHANCED_CHAT_INSTANCE_URL_STORAGE_KEY) || DEFAULT_ENHANCED_CHAT_INSTANCE_URL;
    });

    const defaultInstanceUrl = isEnhancedChatRoute ? DEFAULT_ENHANCED_CHAT_INSTANCE_URL : DEFAULT_PORTABLE_INSTANCE_URL;
    const instanceUrlStorageKey = isEnhancedChatRoute ? ENHANCED_CHAT_INSTANCE_URL_STORAGE_KEY : PORTABLE_INSTANCE_URL_STORAGE_KEY;
    const instanceUrl = isEnhancedChatRoute ? enhancedChatInstanceUrl : portableInstanceUrl;
    const setInstanceUrl = isEnhancedChatRoute ? setEnhancedChatInstanceUrl : setPortableInstanceUrl;

    const [inputUrl, setInputUrl] = useState(instanceUrl);
    const [isValidUrl, setIsValidUrl] = useState(true);
    const [showCrossDomainWarning, setShowCrossDomainWarning] = useState(false);

    const [showConfig, setShowConfig] = useState(false);

    const [chatInstance, setChatInstance] = useState(null);

    const [isChatOpen, setIsChatOpen] = useState(false);

    // Keep the config form's text input in sync when the active instance URL
    // changes for a reason other than typing - e.g. navigating between a
    // portable VA route and an Enhanced Chat route, each with its own value.
    useEffect(() => {
        setInputUrl(instanceUrl);
        setIsValidUrl(true);
        setShowCrossDomainWarning(false);
    }, [instanceUrl]);

    // Persist the active instance URL. Root no longer loads either widget
    // itself - every route's page owns its own widget's load/destroy
    // lifecycle (see usePortableVA / useEnhancedChatContainer) and hands the
    // resulting instance back up via the Outlet context below.
    useEffect(() => {
        localStorage.setItem(instanceUrlStorageKey, instanceUrl);
    }, [instanceUrl, instanceUrlStorageKey]);

    // Pages set/clear chatInstance themselves; reset the open state whenever
    // the active instance changes, regardless of which widget set it.
    useEffect(() => {
        setIsChatOpen(false);
    }, [chatInstance]);

    // Listen for chat open/close events. Enhanced Chat and the portable VA
    // widget report this via different events, so pick the pair that matches
    // the current route's widget.
    useEffect(() => {
        if (isEnhancedChatRoute) {
            const handleOpenChange = (e) => {
                setIsChatOpen(Boolean(e.detail?.opened));
            };

            document.addEventListener(ENHANCED_CHAT_OPEN_CHANGE_EVENT_NAME, handleOpenChange);
            return () => {
                document.removeEventListener(ENHANCED_CHAT_OPEN_CHANGE_EVENT_NAME, handleOpenChange);
            };
        }

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
    }, [isEnhancedChatRoute]);

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
        setInputUrl(defaultInstanceUrl);
        setInstanceUrl(defaultInstanceUrl);
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
                        <li>
                            <Link to={PUBLIC_ENHANCED_CHAT_PATH}>Public Enhanced Chat</Link>
                        </li>
                        <li>
                            <Link to={AUTHENTICATED_ENHANCED_CHAT_PATH}>Authenticated Enhanced Chat</Link>
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
                    {isEnhancedChatRoute && (
                        <EnhancedChatConfigPanel
                            instanceUrl={enhancedChatInstanceUrl}
                            onChatInstanceChange={setChatInstance}
                            isOpen={showConfig}
                            onClose={() => setShowConfig(false)}
                        />
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
                <Outlet context={{instanceUrl, onChatInstanceChange: setChatInstance}}/>
            </div>
        </div>
    );
}

export default Root;
