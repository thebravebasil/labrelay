# LabRelay Change Log

## August 14, 2026 — Roadmap-aligned safety/product pass

### Added
- Structured task difficulty, topic, supervision, eligibility, and data-sensitivity fields.
- Safety confirmation when posting a task.
- Researcher verification status (`unverified` by default).
- School/lab/organization, skills, research interests, and availability fields on profiles.
- Board filters for difficulty and eligibility.
- Trust and safety labels on task cards.
- Duplicate-application prevention.
- Recommended Firestore Rules reference.

### Security improvements
- Added shared HTML escaping for database-sourced text rendered into HTML.
- Added URL validation for submission links.
- Escaped applicant, profile, task, and submission content before HTML insertion.

### Product direction
This pass prioritizes safety, trust, structured opportunities, and secure foundations before adding more advanced AI features.
