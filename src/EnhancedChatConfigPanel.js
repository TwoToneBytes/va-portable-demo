import {useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';
import './EnhancedChatConfigPanel.css';
import {destroyEnhancedVA, loadEnhancedVAWithConfig} from './enhanced-va-loader';
import {FIELD_GROUPS, buildConfig, createDefaultValues, validateConfig} from './enhancedChatConfigFields';

// Lets a visitor override the full EnhancedChat config schema
// (docs/enhanced-chat-docs.md) on top of whichever Enhanced Chat page is
// currently active. Root folds this into its single "⚙️ Configure" toggle
// alongside the instance URL config - rather than a toggle of its own - and
// controls this panel's open/closed state via the isOpen/onClose props
// below, rather than a dedicated page/route.
//
// Root only renders this panel while an Enhanced Chat route is active (see
// isEnhancedChatRoute), so this component's mount/unmount lines up with
// entering/leaving that route family, independent of isOpen. Unmounting
// tears down whatever custom config is currently applied, the same
// lifecycle contract useEnhancedChatContainer's pages use for their own
// default widget - so navigating away cleans up exactly like it did when
// this was its own page.
//
// Per the docs, almost none of this is reactive once the widget is
// constructed. So "Apply" validates the form first, and only on success
// destroys the current EnhancedChat instance and constructs a new one with
// the full config via loadEnhancedVAWithConfig.
function EnhancedChatConfigPanel({instanceUrl, onChatInstanceChange, isOpen, onClose}) {
    const location = useLocation();
    // Mount point for the widget this panel constructs - kept outside the
    // isOpen-gated form markup below (rendered unconditionally, same as
    // useEnhancedChatContainer's pages) so the widget's DOM isn't torn down
    // just because the form collapses after a successful Apply. Header
    // title color, if set, comes from the branding.header.titleColor field
    // below rather than page CSS.
    const containerRef = useRef(null);
    const [values, setValues] = useState(() => createDefaultValues(instanceUrl));
    const [contextRows, setContextRows] = useState([]);
    const [errors, setErrors] = useState({});
    const [loadError, setLoadError] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [appliedConfig, setAppliedConfig] = useState(null);

    // Switching between Enhanced Chat pages doesn't unmount this panel, but
    // it does hand the widget back to that new page's own default config
    // (via useEnhancedChatContainer) - clear the stale "applied" banner so
    // it doesn't keep claiming a custom config that's no longer active.
    useEffect(() => {
        setAppliedConfig(null);
        setLoadError(null);
    }, [location.pathname]);

    // Tears down whatever custom config is currently applied when this
    // panel unmounts - i.e. when the active route leaves the Enhanced Chat
    // family entirely, since Root only renders this panel while
    // isEnhancedChatRoute is true.
    useEffect(() => {
        return () => {
            destroyEnhancedVA();
            onChatInstanceChange(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function apply(currentValues, currentContextRows) {
        const validationErrors = validateConfig(currentValues, currentContextRows);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const config = buildConfig(currentValues, currentContextRows, containerRef.current);
        setIsApplying(true);
        setLoadError(null);

        loadEnhancedVAWithConfig(config)
            .then((instance) => {
                onChatInstanceChange(instance);
                setAppliedConfig(config);
                onClose();
            })
            .catch((error) => {
                console.error('Failed to load Enhanced Chat with custom config:', error);
                setLoadError(error?.message || String(error));
                onChatInstanceChange(null);
            })
            .finally(() => {
                setIsApplying(false);
            });
    }

    const handleFieldChange = (path, value) => {
        setValues((prev) => ({...prev, [path]: value}));
    };

    const handleContextRowChange = (index, key, value) => {
        setContextRows((prev) => prev.map((row, i) => (i === index ? {key, value} : row)));
    };

    const handleAddContextRow = () => {
        setContextRows((prev) => [...prev, {key: '', value: ''}]);
    };

    const handleRemoveContextRow = (index) => {
        setContextRows((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        apply(values, contextRows);
    };

    const handleResetToDefaults = () => {
        const defaults = createDefaultValues(instanceUrl);
        setValues(defaults);
        setContextRows([]);
        apply(defaults, []);
    };

    const renderField = (field) => {
        const inputId = `field-${field.path}`;
        const value = values[field.path];
        const error = errors[field.path];

        if (field.type === 'checkbox') {
            return (
                <div className="field checkbox-field" key={field.path}>
                    <label htmlFor={inputId}>
                        <input
                            id={inputId}
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) => handleFieldChange(field.path, e.target.checked)}
                        />
                        {field.label}
                    </label>
                </div>
            );
        }

        if (field.type === 'select') {
            return (
                <div className="field" key={field.path}>
                    <label htmlFor={inputId}>{field.label}</label>
                    <select id={inputId} value={value} onChange={(e) => handleFieldChange(field.path, e.target.value)}>
                        {field.options.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            );
        }

        return (
            <div className="field" key={field.path}>
                <label htmlFor={inputId}>{field.label}</label>
                <div className={field.type === 'color' ? 'color-field-row' : undefined}>
                    <input
                        id={inputId}
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(e) => handleFieldChange(field.path, e.target.value)}
                        className={error ? 'invalid' : ''}
                    />
                    {field.type === 'color' && value && (
                        <span className="color-swatch" style={{backgroundColor: value}} aria-hidden="true"/>
                    )}
                </div>
                {error && <div className="field-error">{error}</div>}
            </div>
        );
    };

    return (
        <>
            {/* Enhanced Chat mounts here once Apply succeeds - kept outside
                the isOpen-gated form below so collapsing the form doesn't
                unmount (and destroy) the widget's own DOM. */}
            <div ref={containerRef} style={{display: 'contents'}}/>

            {loadError && (
                <div className="warning-message">
                    <strong>Failed to apply config:</strong> {loadError}
                </div>
            )}

            {appliedConfig && !isOpen && (
                <div className="applied-config-hint">
                    Custom widget config applied.
                </div>
            )}

            {isOpen && (
                <div className="instance-config">
                    <h4 className="config-section-title">Enhanced Chat Widget Config</h4>
                    <form className="config-lab-form" onSubmit={handleSubmit}>
                        {FIELD_GROUPS.map((group, index) => (
                            <details className="field-group" key={group.title} open={index === 0}>
                                <summary>{group.title}</summary>
                                <div className="field-grid">
                                    {group.fields.map(renderField)}
                                </div>
                            </details>
                        ))}

                        <details className="field-group">
                            <summary>Context params</summary>
                            <p className="field-group-hint">
                                Flat sysparm-style params appended to the embed URL as-is (sent through with{' '}
                                <code>String(value)</code>).
                            </p>
                            <div className="context-rows">
                                {contextRows.map((row, index) => (
                                    <div className="context-row" key={index}>
                                        <input
                                            type="text"
                                            placeholder="key"
                                            value={row.key}
                                            onChange={(e) => handleContextRowChange(index, e.target.value, row.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="value"
                                            value={row.value}
                                            onChange={(e) => handleContextRowChange(index, row.key, e.target.value)}
                                        />
                                        <button type="button" className="cancel-button" onClick={() => handleRemoveContextRow(index)}>
                                            Remove
                                        </button>
                                        {errors[`context.${index}`] && (
                                            <div className="field-error">{errors[`context.${index}`]}</div>
                                        )}
                                    </div>
                                ))}
                                <button type="button" className="config-button" onClick={handleAddContextRow}>
                                    + Add context param
                                </button>
                            </div>
                        </details>

                        <div className="config-buttons">
                            <button type="submit" className="apply-button" disabled={isApplying}>
                                {isApplying ? 'Applying…' : 'Apply Config'}
                            </button>
                            <button type="button" className="reset-button" onClick={handleResetToDefaults} disabled={isApplying}>
                                Reset to Defaults
                            </button>
                            <button type="button" className="cancel-button" onClick={onClose}>
                                Cancel
                            </button>
                        </div>
                    </form>

                    {appliedConfig && (
                        <div className="config-preview-wrap">
                            <h4>Currently Applied Config</h4>
                            <pre className="config-preview">{JSON.stringify(appliedConfig, (key, val) => (
                                val instanceof HTMLElement ? `<${val.tagName.toLowerCase()}>` : val
                            ), 2)}</pre>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default EnhancedChatConfigPanel;