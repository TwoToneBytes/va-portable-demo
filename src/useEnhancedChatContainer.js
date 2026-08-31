import {useEffect, useRef} from 'react';
import {useOutletContext} from 'react-router-dom';
import {destroyEnhancedVA, loadEnhancedVA} from './enhanced-va-loader';

// Mounts the Enhanced Chat widget into a container scoped to the calling
// page (via the `container` config option — see docs/enhanced-chat-docs.md)
// instead of Root's shared document.body mount point. That ties the
// widget's lifecycle to the page's own mount/unmount, so navigating away
// destroys it, rather than relying on Root comparing route paths.
//
// Root still owns `chatInstance`/`isChatOpen` for its "ServiceNow Chat API"
// demo controls, so the created instance is handed back up via the Outlet
// context set up in Root.js.
export function useEnhancedChatContainer(manageNowLogin) {
    const containerRef = useRef(null);
    const {instanceUrl, onChatInstanceChange} = useOutletContext();

    useEffect(() => {
        let isCurrent = true;

        loadEnhancedVA({
            INSTANCE_URL: instanceUrl,
            MANAGE_NOW_LOGIN: manageNowLogin,
            CONTAINER: containerRef.current,
            // Widget's default header title color isn't legible against
            // this app's white .main/.header background — set it via the
            // widget's own branding.header.titleColor config rather than
            // overriding it with page CSS.
            TITLE_COLOR: '#1e3a5f',
        })
            .then((instance) => {
                if (isCurrent) {
                    onChatInstanceChange(instance);
                    return;
                }

                // The page unmounted (e.g. fast navigation) before this
                // resolved - cleanup already ran and destroyed nothing,
                // since loadEnhancedVA's dynamic import hadn't settled yet.
                // Destroy this exact instance directly rather than via
                // destroyEnhancedVA(): a subsequent navigation may already
                // have loaded a newer instance into that shared loader
                // state, and we don't want to tear that one down instead.
                try {
                    instance.destroy();
                } catch (error) {
                    console.warn('Error destroying stale EnhancedChat instance:', error);
                }
            })
            .catch((error) => {
                console.error('Failed to load Enhanced Chat:', error);
                if (isCurrent) {
                    onChatInstanceChange(null);
                }
            });

        return () => {
            isCurrent = false;
            destroyEnhancedVA();
            onChatInstanceChange(null);
        };
    }, [instanceUrl, manageNowLogin, onChatInstanceChange]);

    return containerRef;
}