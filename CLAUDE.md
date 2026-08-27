# CLAUDE.md

## Reference docs

See `docs/` for reference material on third-party/embedded widgets used by this app:

- `docs/enhanced-chat-docs.md` — API reference for the `EnhancedChat` widget
  (`embedded-enhanced-chat`) used by `src/enhanced-va-loader.js` and the
  Public/Authenticated Enhanced Chat pages. Covers the config schema, public API
  (`open()`/`close()`/`destroy()`), the `manageNowLogin` auto-redirect behavior, and
  events. Check here before changing enhanced-chat loading/config logic.

Check `docs/` for any other doc added later before assuming widget behavior — treat it
as the source of truth over guesses made in code comments.

## Enhanced Chat Config Panel

`src/EnhancedChatConfigPanel.js` is a live test harness for the full `EnhancedChat`
config schema in `docs/enhanced-chat-docs.md` — branding, layout, translations,
unread/nudges, and arbitrary `context` params — via a form instead of code edits. It's
not a page/route: `Root.js` mounts it whenever an Enhanced Chat route (Public or
Authenticated) is active, folded into the same single "⚙️ Configure" toggle that also
opens the instance URL config above it — there's no separate "Configure Widget" button.
Root owns the open/closed state and passes it down as `isOpen`/`onClose`; the panel
itself renders its form only while `isOpen` is true and calls `onClose()` on Apply/Reset
success or Cancel, same as the instance URL form. Field metadata, defaults, and
validation live in `src/enhancedChatConfigFields.js`. Because most config is applied
once at construction and isn't reactive (per the docs), "Apply" validates the form first
and only on success destroys the current instance and constructs a new one via
`loadEnhancedVAWithConfig()` in `src/enhanced-va-loader.js` — the full-config sibling of
`loadEnhancedVA()` used by the Public/Authenticated Enhanced Chat pages. The panel is
only mounted while an Enhanced Chat route is active (independent of `isOpen`), so its
unmount (leaving that route family) tears down whatever custom config is applied — the
same lifecycle contract `useEnhancedChatContainer`'s pages use for their own default
widget. Update `enhancedChatConfigFields.js`'s `FIELD_GROUPS` when the widget's config
schema changes, rather than hand-editing form JSX.