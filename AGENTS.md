# Architecture rules

- Keep the public storefront's Volcanic Fire & Gold identity scoped under `.volcanic`; this prevents its editorial theme from leaking into seller dashboards.
- Persist optional typography size and weight in the existing layout's globalStyles JSON, and apply shared scoped typography variables in editor previews and storefronts; this keeps per-store settings consistent without altering older layouts or dashboard typography.
- Render typography device samples at fixed CSS-pixel widths and scale the whole canvas only to fit the editor; this preserves each device's line wrapping without changing the saved font settings.