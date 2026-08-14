# LabRelay Changelog

## Next safety pass — August 2026

### Fixed
- Fixed the task-posting page's missing Firestore `doc` / `getDoc` imports.
- Made existing task editing and status changes compatible with the new safety fields.
- Added data-sensitivity and safety confirmation controls to task editing.
- Added server-enforced researcher verification consistency to the recommended Firestore rules.
- Added a collection-group rule required by the My Applications page.
- Prevented task owners from applying to their own tasks at the Firestore layer.
- Limited application updates so students can only change their submission link and researchers can only change application status.
- Kept verification status protected from browser-side promotion.

### Important deployment note
Do not publish the recommended Firestore rules until the updated site files have been deployed and the rules have been tested with a student account and a researcher account.
