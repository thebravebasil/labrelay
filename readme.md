# LabRelay

LabRelay connects professors and doctors who need help with manageable research tasks — literature reviews, data entry, survey outreach — with students who want real experience and a way in.

**Live at:** https://thebravebasil.github.io/labrelay/

---

## The Problem

Researchers are bottlenecked by tedious busywork. Literature reviews, data entry, participant recruitment, survey administration — these tasks are essential but consume time that could go toward actual science. Meanwhile, students want to break into research but lack connections and experience.

LabRelay bridges this gap. It's a task exchange where:
- **Researchers post small, defined tasks** (literature review, data entry, survey outreach)
- **Students browse and apply** with a short note on why it interests them
- **Researchers pick who to work with** and the student completes the task
- **Both get value**: researchers offload work, students get real experience and a contact in the field

No fees. No middle layers. Just direct connection.

---

## Features

- **Task Board** — Browse open research tasks, filter by time commitment and location
- **Post a Task** — Researchers can post tasks in under 5 minutes
- **Applications** — Students apply with a short note; researchers review and pick
- **My Tasks** — Researchers track posted tasks and manage applicants
- **My Applications** — Students track applications and accepted work
- **LabRelay AI** — In-browser chatbot powered by WebGPU (no server calls, runs locally)
- **No Fees** — Completely free for both researchers and students

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Hosting:** GitHub Pages (static)
- **Backend:** Firebase (Firestore, Firebase Auth, Hosting)
- **AI:** WebLLM (SmolLM2-360M, runs in the browser)
- **Fonts:** Inter, Space Grotesk, JetBrains Mono

---

## How to Get Started

### For Researchers
1. Sign up or log in
2. Go to "Post a Task"
3. Describe what needs doing, estimate time, and list required skills
4. Submit — it's live on the board instantly
5. Review applications as students apply
6. Pick who you'd like to work with and get their contact info

### For Students
1. Sign up or log in
2. Go to "Browse Tasks"
3. Search or filter by time commitment and type
4. Click "I'm interested" on a task
5. Write a short note on why it interests you
6. If accepted, connect directly with the researcher

---

## Project Structure

```
labrelay/
├── index.html              Home page / hero
├── board.html              Task board (students browse)
├── post.html               Post a task (researchers)
├── my-tasks.html           Manage posted tasks (researchers)
├── my-applications.html    Track applications (students)
├── profile.html            Edit profile and role
├── about.html              About page, privacy info
├── devlog.html             Development log
├── style.css               Main styles
├── chatbot.css             AI chatbot styles
├── chatbot.js              AI chatbot logic (WebLLM)
├── firebase-init.js        Firebase config and utilities
└── favicon.svg             Favicon
```

---

## Data Flow

1. **User signs up** → Firebase Auth (email/password or Google)
2. **User profile created** → Firestore `users` collection
3. **Researcher posts task** → Firestore `tasks` collection
4. **Student applies** → Firestore `tasks/{taskId}/applications` subcollection
5. **Researcher accepts** → Application status updates, both users see contact info
6. **Student completes work** → Optional submission link for proof

---

## Development

### Local Setup (Manual)
1. Clone the repo
2. Open any `.html` file directly in your browser
3. Sign up to test (uses real Firebase, so data persists)

### Building / Deployment
- Push to `main` branch
- GitHub Pages automatically deploys from `/` (root)
- Changes live at https://thebravebasil.github.io/labrelay/

### Environment
Firebase config is embedded in `firebase-init.js`. If you fork, update:
- `apiKey`
- `authDomain`
- `projectId`
- `databaseURL`

---

## Privacy

Your data is only shared between the two people working on a task:
- Researchers see an applicant's name and email only after they apply
- Students see a researcher's contact info only after being accepted
- No data is sold, shared with third parties, or used for marketing
- We use Firebase, which is SOC 2 compliant

Full details on the [About page](./about.html).

---

## Roadmap

- [ ] Email notifications when tasks are posted / applications arrive
- [ ] User ratings and reviews
- [ ] Advanced search (department, research area, etc.)
- [ ] Task completion verification
- [ ] Direct messaging between researcher and student
- [ ] Payment/compensation tracking (if needed)
- [ ] Mobile app
- [ ] University partnerships

---

## Contributing

Found a bug? Have a feature idea? Send feedback to **mobasil2023@gmail.com** or open an issue.

---

## License

MIT

---

## Built By

**Mohammad Basil** — a high school student in Montgomery County, Maryland.

> "I'm building this because I want to work in healthcare technology someday, and I figured the best way to learn what researchers actually need was to build something that makes their work easier."

---

## FAQ

**Is LabRelay free?**
Yes. Completely free for researchers and students. No hidden fees.

**Do I need credentials to post a task?**
No credentials required to sign up. We recommend being truthful about who you are, since students will research you before applying.

**How long does a task typically take?**
Tasks range from 1–2 hours (quick literature review) to 10+ hours (data entry, ongoing work). Researchers specify the time commitment when posting.

**What if a student doesn't finish the task?**
Direct communication is key — both researcher and student should agree on scope, timeline, and expectations before work starts. We're exploring ways to verify completion.

**Can I post tasks on behalf of someone else?**
Not yet. In the future, we may add PI-level accounts that manage multiple users.

**How is this different from other platforms?**
- **No fees** (Upwork, Fiverr charge 10–20%)
- **For research specifically** (tailored to lit reviews, data entry, participant recruitment)
- **Direct connection** (no middleman, no marketplace algorithm)
- **Beginner-friendly** (no portfolio required, only a note on why you're interested)

---

Made with ❤️ by a student, for students and researchers.

## Firebase deployment order

1. Upload the updated site files.
2. Test sign-in, task posting, task editing, applications, and My Applications.
3. Back up the current Firestore rules.
4. Paste the rules from `FIRESTORE_RULES_RECOMMENDED.md`.
5. Use Firebase Rules Playground to test reads and writes.
6. Publish only after the tests pass.
