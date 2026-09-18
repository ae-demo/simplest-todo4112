# simplest-todo — PRD

## Problem Statement

People juggling small day-to-day tasks lose track of what needs doing when
they rely on memory, sticky notes, or scattered chat messages. They need one
simple, always-available place to jot a task down and check it off once done.

## Solution

A minimal shared todo list web app: signed-in users can add tasks, see the
full list, mark tasks done, and remove tasks they no longer need — nothing
more.

## Actors

- **User** — any person signed in via SSO; can view the shared list, add a
todo, mark any todo done or not done, and delete any todo.

## User Stories

1. As a User, I want to sign in, so that I can access the shared todo list.
2. As a User, I want to add a new todo with a short text description, so that
it appears on the shared list for everyone to see.
3. As a User, I want to view the full list of todos, so that I know what
needs doing.
4. As a User, I want to mark a todo as done (or back to not done), so that
the list reflects current progress.
5. As a User, I want to delete a todo, so that the list stays free of items
nobody needs anymore.

## Product Decisions

- Sign-in: every user authenticates via SSO through Thunder, the platform
IDP (org default).
- List scope: there is one shared todo list visible to all signed-in users —
no private per-user lists.
- Todo fields: a todo has only its text and a done/not-done status — no due
dates, priorities, or categories.
- Permissions: any signed-in user may add, complete/uncomplete, or delete any
todo on the shared list — there is no ownership restriction on the shared
list.
- Completed todos remain visible in the list (shown as done) rather than
being hidden or archived.

## Out of Scope

- Private per-user todo lists.
- Due dates, priorities, categories, or tags on todos.
- Notifications or reminders.
- Editing a todo's text after creation.
- Multiple separate lists or boards.

## Open Questions

None at this time.

