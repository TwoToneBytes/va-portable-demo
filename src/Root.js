import './Root.css';
import {destroyPortableVA, loadPortableVA} from './portable-va-loader';
import {Link, Outlet} from "react-router-dom";
import {useEffect, useState} from 'react';

const DEFAULT_INSTANCE_URL = 'https://support.va-sn.dev';
const CHAT_OPENED_EVENT_NAME = 'NOW_POPOVER#OPENED_SET';


function Root() {
    const [instanceUrl, setInstanceUrl] = useState(() => {
        return localStorage.getItem('va-instance-url') || DEFAULT_INSTANCE_URL;
    });

    const [inputUrl, setInputUrl] = useState(instanceUrl);
    const [isValidUrl, setIsValidUrl] = useState(true);
    const [showConfig, setShowConfig] = useState(false);
    const [chatInstance, setChatInstance] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const validateUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'https:' && urlObj.hostname.includes('.');
        } catch {
            return false;
        }
    };

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
        const handleChatStateChange = (event) => {
            const isOpen = event.detail?.payload?.value
            if (typeof isOpen === 'boolean') {
                setIsChatOpen(isOpen);
            }
        };

        window.addEventListener(CHAT_OPENED_EVENT_NAME, handleChatStateChange);

        return () => {
            window.removeEventListener(CHAT_OPENED_EVENT_NAME, handleChatStateChange);
        };
    }, []);

    const handleUrlChange = (e) => {
        const newUrl = e.target.value;
        setInputUrl(newUrl);
        setIsValidUrl(validateUrl(newUrl));
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
                            <Link to={`/public`}>Public Virtual Agent</Link>
                        </li>
                        <li>
                            <Link to={`/sso`}>Virtual Agent SSO Login</Link>
                        </li>
                    </ul>
                </nav>
                <div className="instance-info">
                    <div className="current-instance">
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
                <div>
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
            </header>
            <div className="main">
                <Outlet/>
            </div>
        </div>
    );
}

export default Root;
