// Field metadata + helpers backing EnhancedChatConfigPanel.js's config
// form. Kept separate from the panel component so the (long) list of
// EnhancedChat config fields doesn't drown out the form/lifecycle logic.
//
// Every field's `path` is a dot-path into the config object `new
// EnhancedChat(config)` expects — see docs/enhanced-chat-docs.md for the
// authoritative schema this mirrors. Form state itself stays flat (keyed by
// that same dot-path string); `buildConfig` is what nests it back into the
// shape the widget wants.

export const FIELD_GROUPS = [
    {
        title: 'Core',
        fields: [
            {path: 'instance', label: 'Instance URL', type: 'text', placeholder: 'https://yourco.service-now.com'},
            {path: 'portal', label: 'Portal', type: 'text', placeholder: 'esc', defaultValue: 'sp'},
            {path: 'title', label: 'Title', type: 'text', placeholder: 'Now Assist'},
            {path: 'manageNowLogin', label: 'Manage Now Login', type: 'checkbox'},
            {path: 'showSupportAndSettingsMenu', label: 'Show Support & Settings Menu', type: 'checkbox'},
            {path: 'pinnable', label: 'Pinnable', type: 'checkbox', defaultChecked: true},
            {path: 'expandable', label: 'Expandable', type: 'checkbox', defaultChecked: true},
            {
                path: 'position', label: 'Initial Position', type: 'select', options: [
                    {value: '', label: 'Default (floating)'},
                    {value: 'modal', label: 'Modal'},
                    {value: 'pinned', label: 'Pinned'},
                ],
            },
        ],
    },
    {
        title: 'Layout',
        fields: [
            {path: 'offsetX', label: 'Offset X (px)', type: 'number', placeholder: '25'},
            {path: 'offsetY', label: 'Offset Y (px)', type: 'number', placeholder: '25'},
            {path: 'zIndex', label: 'Z-Index', type: 'number', placeholder: '1000'},
            {path: 'modalZIndex', label: 'Modal Z-Index', type: 'number', placeholder: '4000'},
            {path: 'modalWidth', label: 'Modal Width', type: 'size', placeholder: '95vw'},
            {path: 'modalHeight', label: 'Modal Height', type: 'size', placeholder: '85vh'},
        ],
    },
    {
        title: 'Unread & Proactive Nudges',
        fields: [
            // Off by default so the panel doesn't add unread/get_feature_status
            // polling against the configured instance unless a visitor opts in.
            {path: 'unread.enabled', label: 'Enabled', type: 'checkbox', defaultChecked: false},
            {path: 'unread.notificationSoundUrl', label: 'Notification Sound URL', type: 'url'},
        ],
    },
    {
        title: 'Branding — Launcher',
        fields: [
            {path: 'branding.launcher.bgColor', label: 'Background Color', type: 'color'},
            {path: 'branding.launcher.bgColorHover', label: 'Background Color (hover)', type: 'color'},
            {path: 'branding.launcher.bgColorActive', label: 'Background Color (active)', type: 'color'},
            {path: 'branding.launcher.color', label: 'Icon Color', type: 'color'},
            {path: 'branding.launcher.colorHover', label: 'Icon Color (hover)', type: 'color'},
            {path: 'branding.launcher.colorActive', label: 'Icon Color (active)', type: 'color'},
            {path: 'branding.launcher.openIcon', label: 'Open Icon URL', type: 'url'},
            {path: 'branding.launcher.sizeMultiplier', label: 'Size Multiplier', type: 'number', placeholder: '1'},
        ],
    },
    {
        title: 'Branding — Panel',
        fields: [
            {path: 'branding.panel.bgColor', label: 'Background Color', type: 'color'},
            {path: 'branding.panel.border', label: 'Border (CSS shorthand)', type: 'text', placeholder: '1px solid #d1d5db'},
            {path: 'branding.panel.shadow', label: 'Box Shadow (CSS)', type: 'text', placeholder: '0 4px 12px rgba(0,0,0,0.2)'},
        ],
    },
    {
        title: 'Branding — Header',
        fields: [
            {path: 'branding.header.iconColor', label: 'Title Icon Color', type: 'color'},
            {path: 'branding.header.titleIcon', label: 'Title Icon URL', type: 'url'},
            {path: 'branding.header.buttonColor', label: 'Button Color', type: 'color'},
            {path: 'branding.header.buttonColorActive', label: 'Button Color (active)', type: 'color'},
            {path: 'branding.header.buttonBgColorHover', label: 'Button Background (hover)', type: 'color'},
            {path: 'branding.header.buttonBgColorActive', label: 'Button Background (active)', type: 'color'},
            {path: 'branding.header.expandIcon', label: 'Expand Icon URL', type: 'url'},
            {path: 'branding.header.collapseIcon', label: 'Collapse Icon URL', type: 'url'},
            {path: 'branding.header.pinIcon', label: 'Pin Icon URL', type: 'url'},
            {path: 'branding.header.pinnedIcon', label: 'Pinned Icon URL', type: 'url'},
        ],
    },
    {
        title: 'Branding — Shared',
        fields: [
            {path: 'branding.closeIcon', label: 'Close Icon URL', type: 'url'},
            {path: 'branding.focusRing', label: 'Focus Ring (CSS box-shadow)', type: 'text', placeholder: '0 0 0 2px #0b5fff'},
        ],
    },
    {
        title: 'Translations (accessible labels)',
        fields: [
            {path: 'translations.openLabel', label: 'Open Label', type: 'text', placeholder: 'Open chat'},
            {path: 'translations.closeLabel', label: 'Close Label', type: 'text', placeholder: 'Close chat'},
            {path: 'translations.pinLabel', label: 'Pin Label', type: 'text', placeholder: 'Pin'},
            {path: 'translations.unpinLabel', label: 'Unpin Label', type: 'text', placeholder: 'Unpin'},
            {path: 'translations.expandLabel', label: 'Expand Label', type: 'text', placeholder: 'Expand'},
            {path: 'translations.contractLabel', label: 'Contract Label', type: 'text', placeholder: 'Contract'},
        ],
    },
];

export function createDefaultValues(instanceUrl) {
    const values = {};
    FIELD_GROUPS.forEach((group) => {
        group.fields.forEach((field) => {
            if (field.path === 'instance') {
                values[field.path] = instanceUrl || '';
            } else if (field.type === 'checkbox') {
                values[field.path] = Boolean(field.defaultChecked);
            } else {
                values[field.path] = field.defaultValue || '';
            }
        });
    });
    return values;
}

function setPath(target, path, value) {
    const keys = path.split('.');
    let node = target;
    keys.forEach((key, index) => {
        if (index === keys.length - 1) {
            node[key] = value;
        } else {
            node[key] = node[key] || {};
            node = node[key];
        }
    });
}

// Builds the plain object to hand to `new EnhancedChat(config)`. Optional
// fields are only included when the visitor actually set them, so unset
// fields fall through to the widget's own documented defaults rather than
// this form re-asserting them (e.g. an empty offsetX shouldn't send `0`).
export function buildConfig(values, contextRows, container) {
    const config = {};

    FIELD_GROUPS.forEach((group) => {
        group.fields.forEach((field) => {
            const raw = values[field.path];

            if (field.type === 'checkbox') {
                setPath(config, field.path, Boolean(raw));
                return;
            }

            if (raw === undefined || raw === null || String(raw).trim() === '') {
                return;
            }

            setPath(config, field.path, field.type === 'number' ? Number(raw) : String(raw).trim());
        });
    });

    const context = {};
    contextRows.forEach(({key, value}) => {
        const trimmedKey = key.trim();
        if (trimmedKey) {
            context[trimmedKey] = value;
        }
    });
    if (Object.keys(context).length > 0) {
        config.context = context;
    }

    if (container) {
        config.container = container;
    }

    return config;
}

function isValidHttpsUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && url.hostname.includes('.');
    } catch {
        return false;
    }
}

function isValidUrl(value) {
    try {
        // eslint-disable-next-line no-new
        new URL(value);
        return true;
    } catch {
        try {
            // eslint-disable-next-line no-new
            new URL(value, window.location.origin);
            return true;
        } catch {
            return false;
        }
    }
}

function isValidCssColor(value) {
    if (typeof window !== 'undefined' && window.CSS && typeof window.CSS.supports === 'function') {
        return window.CSS.supports('color', value);
    }
    // Can't validate in this environment - don't block submission over it.
    return true;
}

function isValidCssSize(value) {
    return /^[+-]?(\d+(\.\d+)?)(px|%|vw|vh|vmin|vmax|rem|em|ch|ex)$/.test(value.trim());
}

// Returns a map of field path -> error message. Empty object means valid.
export function validateConfig(values, contextRows) {
    const errors = {};

    const instance = (values.instance || '').trim();
    if (!instance) {
        errors.instance = 'Instance URL is required.';
    } else if (!isValidHttpsUrl(instance)) {
        errors.instance = 'Enter a valid HTTPS URL, e.g. https://yourco.service-now.com';
    }

    const portal = (values.portal || '').trim();
    if (!portal) {
        errors.portal = 'Portal is required.';
    }

    FIELD_GROUPS.forEach((group) => {
        group.fields.forEach((field) => {
            if (field.path === 'instance' || field.path === 'portal') {
                return;
            }

            const raw = values[field.path];
            if (raw === undefined || raw === null || String(raw).trim() === '') {
                return;
            }

            const trimmed = String(raw).trim();

            if (field.type === 'number' && !Number.isFinite(Number(trimmed))) {
                errors[field.path] = 'Must be a number.';
            } else if (field.type === 'url' && !isValidUrl(trimmed)) {
                errors[field.path] = 'Must be a valid URL.';
            } else if (field.type === 'color' && !isValidCssColor(trimmed)) {
                errors[field.path] = 'Not a recognized CSS color value.';
            } else if (field.type === 'size' && !isValidCssSize(trimmed)) {
                errors[field.path] = "Must be a CSS size, e.g. '85vh' or '600px'.";
            }
        });
    });

    const seenKeys = new Set();
    contextRows.forEach((row, index) => {
        const key = row.key.trim();
        if (!key) {
            return; // blank rows are just ignored, not errors
        }
        if (seenKeys.has(key)) {
            errors[`context.${index}`] = `Duplicate context key "${key}".`;
        }
        seenKeys.add(key);
    });

    return errors;
}