# Embedded Enhanced Chat

A `<now-enhanced-chat>` Seismic (ServiceNow Next Experience UI Framework) component,
built with `createCustomElement` + `@servicenow/ui-renderer-snabbdom`, that wraps
ServiceNow's Enhanced Chat experience in a floating launcher + panel, for embedding on
any third-party page. You configure it once with a plain JS object and get back an
`EnhancedChat` instance with a small imperative API (`open()`, `close()`, events, etc).

This doc is written for **third-party embedders** — teams who don't own this repo but
need to drop the widget into their own site and configure it.

## Quick start

```html
<script type="module">
  import { EnhancedChat } from './path/to/index.js';

  const chat = new EnhancedChat({
    instance: 'https://yourco.service-now.com',
    portal: 'esc', // your portal's suffix, e.g. esc, sp, or a custom portal
  });
</script>
```

That's it — the widget appends itself as a fixed-position launcher button in the
bottom-right of the page and mounts its panel (an iframe pointed at your instance) the
first time a visitor opens it.

### Getting `index.js`

This package isn't published to a registry yet. From this repo:

```sh
pnpm install
pnpm --filter embedded-enhanced-chat run build
```

This runs `tectonic pack --type application` (always in `STANDALONE` mode -- no
`@servicenow/ui-*` externals are assumed on the host page) and outputs the bundle to:

```
target/com.glide.cs.embedded-enhanced-chat/ui.html/scripts/externals/embedded-enhanced-chat/index.js
```

mirroring the Seismic app build convention used by sibling chat component packages in
this monorepo (`target/<plugin id>/ui.html/scripts/externals/<package name>/`).

Host `index.js` wherever your page can reach it — your own static assets, a CDN,
whatever your deploy pipeline is — then `import { EnhancedChat } from '<that URL>'` as
above. No build step or framework is required on the consuming page; it's a plain ES
module.

## Before you embed

- **`instance` and `portal` are required.** The constructor throws if either is
  missing.
- **`instance`** should be the ServiceNow instance's origin your users are meant to
  reach — the widget builds the embed URL and, when `manageNowLogin` is enabled, the
  SSO redirect target directly from it. It's addressed by other ServiceNow embed docs
  as needing to share a domain relationship with the host page (e.g. a subdomain of the
  same parent domain) so the instance's session cookies aren't treated as third-party
  cookies inside the iframe — worth confirming with whoever owns your instance's domain
  setup before you rely on `manageNowLogin`.

## Config schema

Pass this shape to `new EnhancedChat(config)`. Everything except `instance` and
`portal` is optional.

```
instance: <string> - required. Origin of your ServiceNow instance, e.g.
    'https://yourco.service-now.com'.
portal: <string> - required. ServiceNow portal suffix (e.g. 'esc', 'sp', or a
    custom portal's suffix). Sent as the embed URL's `portal_suffix` param.
manageNowLogin: <boolean> - default false. When true, listens for the iframe's
    SESSION_CREATED (unauthenticated) and SESSION_LOGGED_OUT postMessages and
    redirects the *host page* to the instance's SSO login when either fires.
showSupportAndSettingsMenu: <boolean> - default false. Shows the chat's built-in
    support/settings menu.
context: <object> - flat map of sysparm-style query params appended as-is to the
    embed URL, e.g. { skip_load_history: 1, sysparm_debug: true }. Keys/values are
    not validated or transformed - sent through with String(value).
pinnable: <boolean> - default true. Shows/hides the header's pin button, which
    docks the panel full-height along the screen edge (position: 'pinned').
expandable: <boolean> - default true. Shows/hides the header's expand button,
    which blows the panel up into a centered modal (position: 'modal').
position: <'modal' | 'pinned' | undefined> - initial docking state of the panel.
    Leave undefined for the default floating panel. Also changes at runtime when a
    visitor clicks the pin/expand buttons (see Events, below) - this is docking
    state, not which side of the screen the launcher sits on (there's currently no
    config for that; the launcher is fixed bottom-right).
container: <HTMLElement> - default document.body. Where the widget's root element
    is appended.
title: <string> - default 'Now Assist'. Header title text and the iframe's
    accessible title.

unread: <object> - unread-message badge and proactive nudges. See "Unread
    messages and proactive nudges" below for what this does and its limits.
    enabled: <boolean> - default true. Set false to disable all of it.
    notificationSoundUrl: <string> - URL of a chime played when a new unread
        message arrives. No sound plays if omitted; there's no bundled default.

branding: <object> - colors accept any valid CSS color value (hex, rgb(), a named
    color, etc), not just rgb tuples or hex codes. Grouped by which part of the
    widget each field paints, so it's always explicit whether a color applies to
    just the launcher button, just the chat panel, just its header, or both.
    launcher: <object> - the always-visible floating button that opens/closes
        the panel.
        bgColor: <string> - background color, default state (default: a
            green-to-blue gradient; set this to any solid color to replace it).
        bgColorHover: <string> - background color on hover. The button also
            scales up slightly on hover (not configurable).
        bgColorActive: <string> - background color while pressed/active.
        color: <string> - icon color, default state.
        colorHover: <string> - icon color on hover.
        colorActive: <string> - icon color while pressed/active.
        openIcon: <string> - URL of a custom icon for the closed state (default: a sparkle).
        sizeMultiplier: <number> - scales the button and its icon uniformly
            (default is a 60px button with a 24px icon).
    panel: <object> - the chat panel/window itself, not including its header.
        bgColor: <string> - background color.
        border: <string> - full CSS `border` shorthand, e.g. '1px solid #d1d5db'.
            Whole-property override, not separate color/width/style fields.
        shadow: <string> - full CSS `box-shadow` value, e.g.
            '0 4px 12px rgba(0,0,0,0.2)'.
    header: <object> - the header bar inside the panel (title, and its
        expand/pin/close buttons).
        titleColor: <string> - title text color.
        iconColor: <string> - title icon color.
        titleIcon: <string> - URL of a custom title icon (default: a sparkle).
        buttonColor: <string> - expand/pin/close buttons' icon color, default
            state.
        buttonColorActive: <string> - buttons' icon color while aria-pressed
            (i.e. the expand button when position is 'modal', or the pin
            button when position is 'pinned').
        buttonBgColorHover: <string> - buttons' background on hover.
        buttonBgColorActive: <string> - buttons' background while aria-pressed.
        expandIcon: <string> - URL of a custom icon for the expand button,
            default state.
        collapseIcon: <string> - URL of a custom icon for the expand button,
            expanded (position: 'modal') state.
        pinIcon: <string> - URL of a custom icon for the pin button, default
            state.
        pinnedIcon: <string> - URL of a custom icon for the pin button, pinned
            (position: 'pinned') state.
    closeIcon: <string> - URL of a custom icon shared by the launcher's open
        state and the header's close button (both mean "close this widget").
    focusRing: <string> - full CSS `box-shadow` value for the focus-visible ring,
        shared by both the launcher and header buttons.

offsetX: <number> - default 25. Distance in pixels the widget is offset from its
    default right edge.
offsetY: <number> - default 25. Distance in pixels the widget is offset from its
    default bottom edge.

zIndex: <number> - default 1000. Stacking order of the widget while not in modal
    position.
modalZIndex: <number> - default 4000. Stacking order while position is 'modal'.
modalWidth: <string> - default '95vw'. Any valid CSS size (e.g. '900px', '80%').
modalHeight: <string> - default '85vh'. Any valid CSS size.

translations: <object> - overrides for the widget's built-in English aria-labels.
    Every button in the widget is icon-only, so these are its accessible names, not
    visible tooltip text.
    openLabel: <string> - launcher, closed state. Default 'Open chat'.
    closeLabel: <string> - launcher opened state, and the header's close button.
        Default 'Close chat'.
    pinLabel: <string> - header's pin button, default state. Default 'Pin'.
    unpinLabel: <string> - header's pin button, pinned state. Default 'Unpin'.
    expandLabel: <string> - header's expand button, default state. Default
        'Expand'.
    contractLabel: <string> - header's expand button, expanded state. Default
        'Contract'.
```

## Public API

```
new EnhancedChat(config)  - throws if instance or portal is missing.
chat.open()               - opens the panel. Safe to call whether or not it's open.
chat.close()              - closes the panel. Safe to call whether or not it's open.
chat.opened                - boolean, current open/closed state.
chat.position               - 'modal' | 'pinned' | undefined, current docking state.
chat.element                - the underlying <now-enhanced-chat> element, for
                                advanced DOM access.
chat.destroy()               - removes the element and every listener the widget
                                registered (on itself and on `window`). Call this
                                before discarding an instance - e.g. on an SPA route
                                change - to avoid leaks.
```

## Events

The widget dispatches namespaced `CustomEvent`s that bubble and compose through its
shadow DOM, so you can listen on `document` (or `chat.element`) without importing
anything from this package:

```
now-embedded.open-change     - detail: { opened: boolean, actionSysId?: string }.
    Fires whenever the panel opens or closes - launcher click, header close
    button, or chat.open()/close(). `actionSysId`, when present, points the
    iframe at the topic of a pending proactive-trigger nudge.
now-embedded.position-change - detail: { position: 'modal' | 'pinned' | undefined }.
    Fires when a visitor toggles the header's pin/expand buttons. `position`
    is a preference that persists across close/reopen (closing a pinned
    panel does NOT fire this event or reset `chat.position` -- reopening
    comes back pinned), so don't drive pinned-layout CSS off this event
    alone: also recompute on `open-change`, and gate on `chat.opened` too,
    or a closed-but-still-"pinned" chat will leave layout space (e.g. a
    reserved margin) reserved for a panel that isn't on screen.
```

```js
const updatePinnedLayout = () => {
  document.body.classList.toggle('has-pinned-chat', chat.position === 'pinned' && chat.opened);
};
document.addEventListener('now-embedded.position-change', updatePinnedLayout);
document.addEventListener('now-embedded.open-change', updatePinnedLayout);
```

## Advanced: CSS custom properties

`branding` and the layout options above are applied once, at construction time, as
inline CSS custom properties scoped to the widget's own element — they aren't
reactive after that, and they can't leak into the rest of your page. Every one of
these has a corresponding `branding`/layout config field; you don't need to touch
CSS directly to reach any of them. You *can* still target these same custom
properties from your own stylesheet if you'd rather manage theming as CSS instead of
JS config — just be aware that any value also set via `branding`/layout config takes
precedence over your CSS: the config-driven inline style wins.

| Custom property | Default | Set by |
| --- | --- | --- |
| `--now-embedded-chat-launcher-bg-color` | `linear-gradient(135deg, rgb(134, 246, 115) 5%, rgb(113, 213, 254) 95%)` | `branding.launcher.bgColor` |
| `--now-embedded-chat-launcher-bg-color-hover` | `rgb(134, 246, 115)` | `branding.launcher.bgColorHover` |
| `--now-embedded-chat-launcher-bg-color-active` | current bg color | `branding.launcher.bgColorActive` |
| `--now-embedded-chat-launcher-color` | `#fff` | `branding.launcher.color` |
| `--now-embedded-chat-launcher-color-hover` | `#fff` | `branding.launcher.colorHover` |
| `--now-embedded-chat-launcher-color-active` | `#fff` | `branding.launcher.colorActive` |
| `--now-embedded-chat-launcher-size` | `3.75rem` | `branding.launcher.sizeMultiplier` |
| `--now-embedded-chat-launcher-icon-size` | `1.5rem` | `branding.launcher.sizeMultiplier` |
| `--now-embedded-chat-bg-color` | `#f4f5f7` (`#fff` in modal) | `branding.panel.bgColor` |
| `--now-embedded-chat-panel-border` | `1px solid rgb(209, 213, 219)` | `branding.panel.border` |
| `--now-embedded-chat-panel-shadow` | `0 0.75rem 1.5rem 0 rgba(0,0,0,0.25)` | `branding.panel.shadow` |
| `--now-embedded-chat-header-title-color` | `#1c2124` | `branding.header.titleColor` |
| `--now-embedded-chat-header-icon-color` | `#6a3bff` | `branding.header.iconColor` |
| `--now-embedded-chat-header-button-color` | `#4a4f54` | `branding.header.buttonColor` |
| `--now-embedded-chat-header-button-color-active` | `#1c2124` | `branding.header.buttonColorActive` |
| `--now-embedded-chat-header-button-bg-color-hover` | `rgba(0, 0, 0, 0.06)` | `branding.header.buttonBgColorHover` |
| `--now-embedded-chat-header-button-bg-color-active` | `rgba(0, 0, 0, 0.1)` | `branding.header.buttonBgColorActive` |
| `--now-embedded-chat-focus-ring` | `0 0 0 2px #0b5fff` | `branding.focusRing` (shared: launcher + header buttons) |
| `--now-embedded-chat-badge-bg-color` | `#c02828` | not yet config-driven; set via CSS |
| `--now-embedded-chat-badge-color` | `#fff` | not yet config-driven; set via CSS |
| `--now-embedded-chat-badge-border-color` | `#fff` | not yet config-driven; set via CSS |
| `--now-embedded-chat-z-index` | `1000` | `zIndex` |
| `--now-embedded-chat-modal-z-index` | `4000` | `modalZIndex` |
| `--now-embedded-chat-modal-width` | `95vw` | `modalWidth` |
| `--now-embedded-chat-modal-height` | `85vh` | `modalHeight` |
| `--now-embedded-chat-offset-x` | `1.5625rem` | `offsetX` |
| `--now-embedded-chat-offset-y` | `1.5625rem` | `offsetY` |

## Unread messages and proactive nudges

When `unread` isn't disabled, the widget shows an unread-count badge on the
launcher, and can surface REST/timer-driven proactive nudges (deep-linking the
iframe into a specific topic on next open via `actionSysId` -- see Events, below)
-- all sourced by the host page polling the instance directly (credentialed
cross-origin `fetch`, the same trust boundary `manageNowLogin` already relies on).
Feature availability (message preview vs. count-only, proactive triggers on/off,
poll interval) is itself server-driven per instance/portal config.

This deliberately does **not** use ServiceNow's AMB/CometD real-time push -- AMB's
transport is hardcoded to the calling page's own origin, so from a third-party host
page it can never reach the ServiceNow instance. Everything here is REST polling and
client-side timers instead, which is also what the legacy popover this widget
supersedes falls back to for third-party embeds.

If the unread/feature-status/proactive-trigger endpoints reject the request (CORS or
auth failures are possible depending on your instance's cross-origin setup), that
polling loop just stops silently -- the rest of the widget is unaffected, you simply
won't see a badge.

## Full example

```html
<button id="chat-open-btn">Open chat</button>
<button id="chat-close-btn">Close chat</button>

<script type="module">
  import { EnhancedChat } from './path/to/index.js';

  const chat = new EnhancedChat({
    instance: 'https://yourco.service-now.com',
    portal: 'esc',
    manageNowLogin: true,
    showSupportAndSettingsMenu: true,
    title: 'Support Chat',
    branding: {
      launcher: {
        bgColor: '#2563eb',
        bgColorHover: '#1d4ed8',
      },
    },
    translations: {
      openLabel: 'Chat with support',
    },
  });

  document.getElementById('chat-open-btn').addEventListener('click', () => chat.open());
  document.getElementById('chat-close-btn').addEventListener('click', () => chat.close());

  // Gate on both `position` and `opened` -- see the `position-change` note
  // above -- so closing a pinned chat releases the reserved layout space.
  const updatePinnedLayout = () => {
    document.body.classList.toggle('has-pinned-chat', chat.position === 'pinned' && chat.opened);
  };
  document.addEventListener('now-embedded.position-change', updatePinnedLayout);
  document.addEventListener('now-embedded.open-change', updatePinnedLayout);
</script>
```

## Accessibility

Every button in the widget is icon-only, so `translations` (see above) controls their
accessible names. The header's expand, pin, and close buttons also render that same
string as a native `title` tooltip on hover — there's no separate field for visible
vs. accessible text, so `translations` covers both for those three. The launcher
button has no tooltip; its `translations` value is accessible-name-only.