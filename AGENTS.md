# Architecture rules
- Gate the shared website layout with a session-dismissed welcome screen driven by customAuth's initialization listener; keep direct sign-in and registration pages accessible and avoid flashing the splash for valid sessions.
- Store request post photo URLs in `requests.images`, separately from close-out photos, and upload files to the existing donation-images bucket to reuse the post media flow.
- Share the request photo upload control and gallery across create/edit forms and detail/modal views so limits and empty states stay consistent.
- Load request poster profiles in the shared creator-info component, keyed by creator ID, so detail and modal views show consistent real information without placeholder identities.