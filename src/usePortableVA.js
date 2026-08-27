import {useEffect} from 'react';
import {useOutletContext} from 'react-router-dom';
import {destroyPortableVA, loadPortableVA} from './portable-va-loader';

// Loads/destroys the portable VA widget scoped to the calling page's own
// mount/unmount lifecycle, instead of Root comparing route paths. Unlike
// useEnhancedChatContainer, there's no `container` option to scope its DOM
// node to the page - it always attaches itself to document.body - but that's
// not what makes destroy-on-navigate-away work; calling destroy() from an
// effect that lives in the page (so its cleanup fires on unmount) is.
//
// Root still owns `chatInstance`/`isChatOpen` for its "ServiceNow Chat API"
// demo controls, so the created instance is handed back up via the Outlet
// context set up in Root.js.
export function usePortableVA(manageNowLogin) {
    const {instanceUrl, onChatInstanceChange} = useOutletContext();

    useEffect(() => {
        let isCurrent = true;
        const REDIRECT_URL = `${instanceUrl}/sn_va_web_client_login.do?sysparm_redirect_uri=${encodeURIComponent(window.location.href)}`;

        loadPortableVA({INSTANCE_URL: instanceUrl, REDIRECT_URL, MANAGE_NOW_LOGIN: manageNowLogin})
            .then((instance) => {
                if (isCurrent) {
                    onChatInstanceChange(instance);
                    return;
                }

                // The page unmounted (e.g. fast navigation) before this
                // resolved - cleanup already ran and destroyed nothing,
                // since loadPortableVA's <script onload> hadn't fired yet.
                // Destroy this exact instance directly rather than via
                // destroyPortableVA(): a subsequent navigation may already
                // have loaded a newer instance into that shared loader
                // state, and we don't want to tear that one down instead.
                try {
                    instance.destroy();
                } catch (error) {
                    console.warn('Error destroying stale ServiceNowChat instance:', error);
                }
            })
            .catch((error) => {
                console.error('Failed to load ServiceNow chat:', error);
                if (isCurrent) {
                    onChatInstanceChange(null);
                }
            });

        return () => {
            isCurrent = false;
            destroyPortableVA();
            onChatInstanceChange(null);
        };
    }, [instanceUrl, manageNowLogin, onChatInstanceChange]);
}