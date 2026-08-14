# LabRelay Firestore Rules — recommended next version

These rules are designed to match the updated LabRelay code while remaining compatible with existing accounts and older task documents.

## Before publishing

1. Keep the current working rules backed up.
2. Paste these rules into Firebase Console → Firestore → Rules.
3. Wait for Firebase to report that the rules are valid.
4. Use the Rules Playground to test reads/writes before clicking Publish.

## Rules

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

    function userVerificationStatus() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.keys().hasAny(['verificationStatus'])
        ? get(/databases/$(database)/documents/users/$(request.auth.uid)).data.verificationStatus
        : 'unverified';
    }

    function taskOwner(taskId) {
      return signedIn()
        && get(/databases/$(database)/documents/tasks/$(taskId)).data.createdBy == request.auth.uid;
    }

    match /users/{userId} {
      // Users can only read their own profile.
      allow read: if isOwner(userId);

      // New profiles belong to the signed-in user and start unverified.
      allow create: if isOwner(userId)
        && (!request.resource.data.keys().hasAny(['verificationStatus'])
            || request.resource.data.verificationStatus == 'unverified');

      // Users may edit their own profile, but the browser may not promote
      // an account to a verified status.
      allow update: if isOwner(userId)
        && (
          (
            !resource.data.keys().hasAny(['verificationStatus'])
            && request.resource.data.verificationStatus == 'unverified'
          )
          || (
            resource.data.keys().hasAny(['verificationStatus'])
            && request.resource.data.verificationStatus == resource.data.verificationStatus
          )
        );
    }

    match /tasks/{taskId} {
      // The task board is public in this prototype.
      allow read: if true;

      // Every newly created task must include the safety metadata.
      allow create: if signedIn()
        && request.resource.data.createdBy == request.auth.uid
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Researcher'
        && request.resource.data.safetyConfirmed == true
        && request.resource.data.dataSensitivity in [
          'Public / non-sensitive',
          'De-identified / approved'
        ]
        && request.resource.data.researcherVerification
           == userVerificationStatus();

      // Owners may update their own task. The browser cannot turn an
      // unverified account into a verified researcher.
      allow update: if signedIn()
        && resource.data.createdBy == request.auth.uid
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Researcher'
        && request.resource.data.createdBy == resource.data.createdBy
        && request.resource.data.safetyConfirmed == true
        && request.resource.data.dataSensitivity in [
          'Public / non-sensitive',
          'De-identified / approved'
        ]
        && request.resource.data.researcherVerification
           == userVerificationStatus();

      allow delete: if signedIn()
        && resource.data.createdBy == request.auth.uid;
    }

    match /tasks/{taskId}/applications/{applicationId} {
      // A student can read their own application; the task owner can read
      // applications for their task.
      allow read: if signedIn() && (
        resource.data.studentId == request.auth.uid
        || taskOwner(taskId)
      );

      // Only the signed-in student can create an application for themselves,
      // and the task owner cannot apply to their own task.
      allow create: if signedIn()
        && request.resource.data.studentId == request.auth.uid
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Student'
        && get(/databases/$(database)/documents/tasks/$(taskId)).data.createdBy != request.auth.uid;

      // Students may update only their submission link. Researchers may update
      // only application status.
      allow update: if signedIn() && (
        (
          resource.data.studentId == request.auth.uid
          && request.resource.data.studentId == resource.data.studentId
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['submissionLink'])
        )
        ||
        (
          taskOwner(taskId)
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status'])
        )
      );

      allow delete: if signedIn() && (
        resource.data.studentId == request.auth.uid
        || taskOwner(taskId)
      );
    }

    // Required for the student's "My Applications" collection-group query.
    match /{path=**}/applications/{applicationId} {
      allow list: if signedIn()
        && resource.data.studentId == request.auth.uid;
    }
  }
}
```

## Important note

The current prototype still keeps `createdByEmail` on public task documents. For a production LabRelay aimed at minors, that should eventually be moved behind a controlled communication workflow.
