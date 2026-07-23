# PostHog post-wizard report

The wizard integrated PostHog client-side analytics into this Next.js App Router project. It installed `posthog-js`, initialized the SDK in `instrumentation-client.ts`, and configured `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` in `.env.local`. Autocapture, session recording defaults, and exception capture remain enabled.

Custom events are captured only for meaningful interactions and use non-PII properties. The demo form capture does not include submitted form values.

| Event name | Description | File |
| --- | --- | --- |
| `demo_cta_clicked` | A visitor selects a call to action that leads to the demo request form. | `components/landing-page.tsx` |
| `pricing_plan_requested` | A visitor requests pricing for a selected plan. | `components/landing-page.tsx` |
| `demo_request_submitted` | A visitor submits the demo request form. | `components/landing-page.tsx` |
| `dashboard_navigation_clicked` | A manager navigates to a dashboard area from the sidebar. | `components/dashboard/sidebar.tsx` |
| `conversation_selected` | A manager selects a resident conversation to review. | `components/dashboard/conversations-view.tsx` |
| `manager_reply_sent` | A manager sends a reply in a resident conversation. | `components/dashboard/conversations-view.tsx` |
| `request_filters_changed` | A manager changes the service request filter or category selection. | `app/dashboard/requests/page.tsx` |
| `building_add_clicked` | A manager starts the workflow to add a building. | `app/dashboard/buildings/page.tsx` |

## Next steps

- [Analytics basics (wizard) dashboard](https://us.posthog.com/project/517763/dashboard/1867672)

The dashboard was created successfully. The new custom events have not yet appeared in this project's event schema, so no event-specific insights were created. Generate production or preview traffic through the instrumented flows, then add insights based on the now-observed event taxonomy.

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add the exact PostHog env var names added here to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.

### Agent skill

An agent skill folder remains in this project for future agent development. It provides the current integration workflow and framework guidance.
