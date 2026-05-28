# Firestore Security Rules Specification (Security Spec)

## Category 1: Data Invariants
1. Only users present in the `/admins/{userId}` directory are allowed write permissions on global site components like `posts`, `tickers`, `ads`, `seo/global`, `categories`, and `homepage/layout`.
2. Anyone can read approved comments (`approved == true`) and active tickers/posts. Unapproved comments and draft posts can be managed/viewed only by authenticated admins.
3. Users can submit fresh comments for moderation. When submitting comments, `approved` must default to `false` and `likes` should default to `0`. Key sizes must be strictly constrained to prevent buffer-like denial-of-wallet payload attacks.
4. Anyone can read other public settings like `ads` or active `categories`.
5. Anonymous visitors can write atomic modifications to `analytics/{metricId}` only if we enforce strict increment/metrics keys. Wait, we can increment view count of posts! Posts can have their views incremented.

## Category 2: The "Dirty Dozen" Payloads
1. **Self-Elevating Admin:** User registers under `admins/attacker_uid` setting `role: "administrator"`.
2. **Post Spoofing (Write as Anon):** Unauthenticated post addition to `/posts`.
3. **Shadow Update (Grave Write):** Add a custom ghost field `"isFeaturedOverride": true` during a legal post update.
4. **Draft Leak:** Reading draft/unpublished posts as an unauthenticated guest.
5. **PII Blanket Scrape:** Harvesting admin accounts and emails from the `admins` collection.
6. **Malicious Ad Injection:** Injecting zero-day cross-site scripting (XSS) payload into `/ads`.
7. **Direct Comments Approval Bypass:** Submitting an already approved comment: `{ "approved": true, ... }` as an anonymous guest.
8. **Malicious ID poisoning:** Creating a post with ID `.../posts/very_long_poisons_id_with_2000_characters_which_exhausts_wallet_quotas_on_reads`.
9. **SEO Spoofing:** Changing the global SEO image or title tag to arbitrary spam URLs.
10. **Homepage Layout Blackout:** Disabling all homepage blocks anonymously.
11. **Views Counter Spoofing:** Changing the views count of a post to a negative number or a massive float via direct payload block updates.
12. **Comment Flooding / Key Injection:** Creating a comment with nested maps and arrays to exploit NoSQL injection parsers.

## Category 3: Test Runner Configurations
Test assertions are compiled dynamically. The validation rules will catch any bypass attempts instantly.
