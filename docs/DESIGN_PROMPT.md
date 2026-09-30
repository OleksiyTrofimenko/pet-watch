# Claude Design prompt: PetWatch

Paste everything below the line into Claude Design.

---

Design the mobile UI for **PetWatch**, an iOS/Android app. Pet owners use it to set up care routines for their pets and invite people they trust to look after them. A user's role is set per pet: the same person can **own** one pet and **watch** another. Design every screen so it works in both views: an owner can manage the pet, and a watcher can only read.

## Constraints (the design will be built with these, so stay inside them)
- Canvas: phone portrait, 390×844 (iPhone 14/15). Safe areas respected. It must also read well on Android at 360 width.
- Components: only the **Gluestack UI v3** set: Box, VStack/HStack, Heading, Text, Button (solid/outline/link; primary/secondary/negative), Input, Textarea, FormControl (label, helper, error), Select, Checkbox, Radio, Switch, Badge, Avatar, Image, Card, Divider, Pressable, Fab, Actionsheet, AlertDialog, Modal, Toast, Skeleton, Spinner, Icon. Gluestack has no tabs component, so build segmented controls from a ButtonGroup or Pressables. The time picker is the native OS picker, so show only the field that opens it.
- Styling is Tailwind/NativeWind with Gluestack's token scales. Express colors as these scales (each has steps 0, 50, 100 … 950): `primary`, `secondary`, `tertiary`, `error`, `success`, `warning`, `info`, `typography`, `outline`, `background`. Spacing is on a 4-pt grid. Use at most 3 radii.
- Keep it simple enough to build in about 2 hours of UI work. Reuse patterns: one list-row pattern, one card pattern, one form layout, one empty state, one error state.

## Brand & tone
Warm, calm and trustworthy. The feel is a reliable pet-sitter's notebook, not a toy. Use one friendly accent color and neutral surfaces. Copy is short, human, and second-person ("Rex's dinner is at 18:00"). Give light mode first. Dark mode tokens are a bonus.

## Accessibility
- Text contrast of at least 4.5:1 and touch targets of at least 44pt.
- Never use color alone to carry meaning. Each care-task type gets **an icon + label + color**: Feeding, Walk, Medication, Play, Grooming, Other.
- Dynamic type must not break layouts (test at 1.3×).

## Screens and states

### Auth
1. **Log in**: email, password (show/hide), "Forgot password?", link to Register. States: inline field errors, and a form-level error ("Email or password is incorrect").
2. **Register**: email, password (hint: 8+ characters). Error: "An account with this email already exists."
3. **Forgot password**: email field, then a confirmation screen: "If an account exists for this email, we've sent a reset link." The confirmation looks the same whether or not the account exists.
4. **Reset password**, opened from the email link: new password + confirm. Error state: "This link has expired or was already used", with a "Request a new link" action.

### Main app: bottom navigation with 3 tabs (Schedule, Pets, Account)
5. **Schedule: Today**
   - Segmented control at the top: **Today | This week**.
   - Below it, a horizontal **pet filter**: "All pets" plus avatar chips. The selected chip must be obvious.
   - Tasks are listed by time. Each row shows the time, a type icon and label, the title, the pet's avatar and name, and a notes preview.
   - A task whose time has passed looks visually "past".
   - Show the header date ("Wednesday, 30 September").
6. **Schedule: This week**
   - Seven day sections, Mon–Sun, each with the weekday, date and task count.
   - Today is highlighted. Empty days show a compact "Nothing scheduled".
   - Uses the same row component as Today.
7. **Pets list**
   - Cards with photo (or species placeholder), name, species · breed · age.
   - A relationship badge: **Owner** or **Watching**.
   - Owned pets also show "2 watchers".
   - Sections: "My pets", then "Pets I'm watching".
   - A Fab to add a pet.
8. **Pet detail**
   - Hero photo, name, and details (species, breed, age, notes).
   - An "Owned by ana@example.com" line when watching.
   - **Care routine** section: rule rows such as "Breakfast · 08:00 · Every day" or "Walk · 18:30 · Mon, Wed, Fri". The owner sees edit/delete actions and an "Add task" button.
   - **Watchers** section (owner only):
     - Rows with email and "Watching since 12 Sep".
     - Pending invites shown with a **Pending** badge and "Expires in 5 days".
     - A revoke action (AlertDialog: "Remove Sam's access to Rex?").
     - An "Invite watcher" button.
   - A watcher sees the same screen read-only, with no edit affordances.
9. **Add / Edit pet form**
   - Photo picker area: tap opens an Actionsheet with "Take photo", "Choose from library", and "Remove photo" when a photo is set. Show an upload-progress state.
   - Fields: name (required), species (Select: Dog, Cat, Bird, Rabbit, Fish, Reptile, Other), breed, age in years (numeric), notes.
   - Save button with a loading state.
   - Edit mode has a destructive "Delete pet" button with confirmation copy that explains the routine and watcher access will be removed.
10. **Add / Edit care task form**
    - Type selector: 6 icon chips.
    - Title field.
    - Time field that opens the native picker.
    - Repeat: Daily | Weekly.
    - When Weekly is chosen, 7 day toggles (M T W T F S S) appear. Error state: "Pick at least one day".
    - Notes field.
11. **Invite watcher**: a bottom sheet or modal with one email field and a "Send invite" button. Design each result state as its own frame, since these distinctions matter:
    - Success: "Invite sent to sam@example.com. They'll appear as a watcher once they accept."
    - Success: "Invite re-sent to sam@example.com."
    - Info: "sam@example.com is already watching Rex."
    - Error: "There's no PetWatch account for this email. Ask them to sign up first."
    - Error: "You can't invite yourself."
12. **Accept invitation**. This is where the email deep link lands, so it must be clear and trustworthy.
    - Pet photo, "Ana invited you to help look after **Rex**", the expiry, and a primary "Accept" plus a secondary "Not now".
    - States, each as its own frame:
      - loading (skeleton)
      - accepted: "Rex is now in your pets", with a "View Rex's schedule" button
      - expired
      - already accepted
      - invite was cancelled
      - pet no longer available
      - "This invite is for sam@example.com, and you're signed in as ana@example.com", with a "Switch account" action
13. **Account**: email, "Log out".

### Global patterns (design once, as a component sheet)
- **Skeletons** for the pet card, task row and pet detail.
- **Empty states**:
  - no pets yet (CTA "Add your first pet")
  - no tasks today
  - no watchers yet
  - watching nothing ("When someone invites you, their pets appear here")
- **Error state** with a "Try again" action.
- **Offline banner**: "You're offline. Showing saved data." Disabled buttons need a reason.
- **Toasts**: success, error, info.
- **Confirm dialog**: destructive variant.

## Deliverables
1. A **token sheet**: the color scales mapped to the Gluestack names above (hex for key steps 50/100/500/600/700/900), plus the type scale, spacing and radii.
2. A **component sheet**: task row, pet card, pet filter chip, segmented control, role badge, watcher row, section header, form field (default/focus/error/disabled), empty state, error state, offline banner, toasts.
3. **One frame per screen state listed above**, named like `08-pet-detail/owner`, `08-pet-detail/watcher`, `11-invite/already-watching`.
4. Short annotations on anything that isn't obvious: owner-vs-watcher differences, disabled logic, what's tappable.

Use realistic sample data: pets "Rex" (dog, Labrador, 4) and "Miso" (cat, 2); users ana@example.com (owner) and sam@example.com (watcher); 5–7 tasks spread across the week.
