Thanks for your application and your interest in a career at Goji Labs. We would like to proceed to the next step in our process, which is a take-home test. Please do not spend more than 8 hours working on it. Scaffolding time that you spent on setting up your development environment doesn't count. Imagine this app is an MVP for a big project and you’ll have to support it in future.

Overview
Build PetWatch — a mobile application for pet owners who need trusted people to look after their pets while they’re away.

The app lets users manage their pets, set up care routines, and invite other registered users to take on watching duties for a specific pet. “Owner” and “watcher” are not global roles — they describe a user’s relationship to a particular pet. The same user can be an owner of one pet and a watcher of another.

This is a greenfield project. You are free to make your own architectural and technical decisions. There is no single “right” answer — we’re interested in how you think, how you structure your work, and the tradeoffs you make.

User Stories
Authentication
As a new user, I want to register with my email address and a password so I can create an account.

As a returning user, I want to log in with my email and password so I can access my account.

As a user who has forgotten my password, I want to request a password reset link sent to my email so I can regain access.

Pet Management
As an owner, I want to add a pet to my profile (name, species, breed, age, notes) so I can manage their care.

As an owner, I want to upload a photo for each pet so watchers can easily identify them.

As an owner, I want to edit or remove a pet from my profile as my situation changes.

Care Schedule
As an owner, I want to create a daily or weekly routine for my pet (e.g. feeding times, walks, medication, playtime) so watchers know exactly what to do.

As an owner, I want to edit or delete schedule entries so the routine stays accurate.

As an owner or watcher, I want to view the pet’s care schedule clearly so I can follow or manage the routine.

As an owner or watcher, I want to switch between a “Today” view (all tasks due today) and a “Weekly” view (tasks grouped day by day across the current week) so I can choose the level of detail I need.

As an owner or watcher, I want to filter either view by pet so I can focus on a specific animal’s tasks.

Inviting Watchers
As an owner, I want to invite another registered PetWatch user to watch my pet by entering their email address.

The invitee must already have a PetWatch account — inviting unregistered users is not supported.

When an invite is sent, the invitee receives an email with a link. They must click that link to accept the invitation and have the pet added to their watching list.

As an owner, I want to see who is currently watching each of my pets so I have visibility over who has access.

As an owner, I want to revoke a watcher’s access to my pet if needed.

Scope & Expectations
This is intentionally an open brief. You are not expected to build a production-ready system, but your submission should demonstrate:

All features above implemented to a reasonable degree

Clean, readable, and well-organised code

Thoughtful handling of edge cases and errors

A README explaining how to run the project, any assumptions you made, and anything you’d do differently with more time

Using AI
We expect and encourage the use of AI tools during this exercise. That said, you are responsible for everything you submit — you should be able to explain any piece of code, understand the decisions made, and reason about how it works. During the review we will ask questions about your implementation, so treat AI as a collaborator, not a replacement for understanding.

Please commit your AI configuration to the repository alongside your code — this includes any setup files your tool uses (e.g. .claude, .cursor, or similar). We’re interested in how you work with AI, not just the output it produces.

Submission
Please share a link to your repository. Include a short README with:

Setup and run instructions

A brief description of your technical choices

Known limitations or things you’d improve given more time

Platform
Build PetWatch as a React Native mobile application using Expo. You do not need to submit a built binary; a development build running on a local simulator/emulator is sufficient.

Backend
No API is provided — build the backend yourself as part of this exercise. Do not use third-party BaaS solutions (Firebase, Supabase, etc.) or mock the server in the app.

Keep the backend lightweight: implement only the endpoints your app actually needs. The following are required:

NestJS with TypeScript, organised into modules

PostgreSQL, accessed through an ORM or query builder of your choice (Prisma, TypeORM, Drizzle) with migrations committed to the repo

Token-based authentication (JWT) — on the client, handle token storage and automatic attachment to requests in a clean, reusable way

DTO validation on every endpoint (e.g. class-validator or Zod) with sensible error responses

Access rules enforced server-side — a user may only read or modify pets they own or watch

Docker Compose (or equivalent) for the database, and setup/run instructions in the README

Email delivery (watcher invites, password reset) and S3 uploads may be stubbed or pointed at a local dev service — logging the link or writing to a local bucket is fine. Note in the README what is stubbed and how you would wire it up for real.

React Native-Specific Requirements
Invitation Link
The invitation email sent to the invitee contains a deep link. That link should open the app directly on the accept-invite screen, where the invitee — who is already a registered user — can review and accept the invitation to become a watcher for the pet. There is no store fallback; the link is only intended for users who already have the app installed.

State Management
Use Jotai or the Context API for local/UI state. Use TanStack Query for all server state — data fetching, caching, mutations, and synchronisation with the API. Do not manage server responses in component state or a global store directly.

Forms
Use React Hook Form with Zod for validation on all forms.

Photo Upload
Use the device camera or photo library to let owners add a pet photo. Pet photos should be uploaded directly to S3 via a presigned URL provided by the API.

Styling
Use Gluestack UI (gluestack.io) as the component library. The app should work on both iOS and Android (simulators are fine).

Code Quality
TypeScript is required — the project must be fully typed, no any escapes

Keep components focused and reasonably sized — avoid monolithic components

Separate concerns where it makes sense (e.g. TanStack Query hooks vs. presentation components)

Nice to Have (Optional)
These are not required but will be positively noted if present:

Unit or integration tests for at least one non-trivial component or utility

Smooth loading states and skeleton screens while data is fetching

Offline-aware behaviour (e.g. graceful messaging when the device has no connectivity)

Clear feedback after sending a watcher invite — e.g. distinguishing between “added to their list” and “invite email sent”