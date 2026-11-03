# Architecture rules

- Platform surfaces (landing, auth, seller dashboard) share Volcanic tokens via their canvas scopes in index.css; the editorial storefront classes stay scoped under `.volcanic`, so per-store themes never leak into dashboards.
- Persist optional typography size and weight in the existing layout's globalStyles JSON, and apply shared scoped typography variables in editor previews and storefronts; this keeps per-store settings consistent without altering older layouts or dashboard typography.
- Render typography device samples at fixed CSS-pixel widths and scale the whole canvas only to fit the editor; this preserves each device's line wrapping without changing the saved font settings.
- Store optional per-device typography overrides in globalStyles.responsiveTypography, falling back to legacy global values; select mobile below 640px, tablet below 1024px and desktop above via scoped container queries, with explicit device overrides in editor previews.