# Recommended Firestore Rules for LabRelay

These rules are a **starting point for review**, not a substitute for testing in the Firebase Rules Simulator. They are intentionally conservative around researcher verification and task safety.

Before publishing them, test your existing app in Firebase Console with a test student and test researcher account.

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return signedIn() && request.auth.uid == uid;
    }

    match /users/{uid} {
      // Users can read and edit only their own profile.
      // The client should never be able to promote itself to "verified".
      allow read: if isOwner(uid);
      allow create: if isOwner(uid)
        && (!request.resource.data.keys().hasAny(['verificationStatus'])
            || request.resource.data.verificationStatus == 'unverified');
      allow update: if isOwner(uid)
        && (!resource.data.keys().hasAny(['verificationStatus'])
            || request.resource.data.verificationStatus == resource.data.verificationStatus);
    }

    match /tasks/{taskId} {
      // Task listings are public in the current LabRelay prototype.
      allow read: if true;

      allow create: if signedIn()
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.safetyConfirmed == true
        && request.resource.data.dataSensitivity in [
          'Public / non-sensitive',
          'De-identified / approved'
        ]
        && request.resource.data.researcherVerification == 'unverified';

      allow update, delete: if signedIn()
        && resource.data.createdBy == request.auth.uid;
    }

    match /tasks/{taskId}/applications/{applicationId} {
      // A student can read their own application. A task owner can read
      // applications submitted to that task.
      allow read: if signedIn() && (
        resource.data.studentId == request.auth.uid
        || get(/databases/$(database)/documents/tasks/$(taskId)).data.createdBy == request.auth.uid
      );

      allow create: if signedIn()
        && request.resource.data.studentId == request.auth.uid;

      allow update: if signedIn() && (
        resource.data.studentId == request.auth.uid
        || get(/databases/$(database)/documents/tasks/$(taskId)).data.createdBy == request.auth.uid
      );

      allow delete: if signedIn() && (
        resource.data.studentId == request.auth.uid
        || get(/databases/$(database)/documents/tasks/$(taskId)).data.createdBy == request.auth.uid
      );
    }
  }
}
```

## Important limitation

These rules still allow task descriptions and researcher emails to be publicly readable because the current LabRelay board is designed as a public listing. For a production version—especially one used by minors—the next architectural step should be separating public task information from private researcher contact information and handling accepted-contact exchange through a controlled backend workflow.
