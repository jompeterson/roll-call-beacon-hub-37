# Architecture rules
- Store request post photo URLs in `requests.images`, separately from close-out photos, and upload files to the existing donation-images bucket to reuse the post media flow.
- Share the request photo upload control and gallery across create/edit forms and detail/modal views so limits and empty states stay consistent.