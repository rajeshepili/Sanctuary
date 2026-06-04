# Privacy

Sanctuary is built for **one person on one machine**. This document describes how data is handled.

## Summary

| Topic         | Sanctuary behavior                                           |
| ------------- | ------------------------------------------------------------ |
| Accounts      | None — no sign-up or login server                            |
| Cloud sync    | None by default                                              |
| Analytics     | No third-party analytics in the app                          |
| Data location | SQLite database and media files on your device               |
| Network       | Used only when you run the dev server or desktop app locally |

## What is stored locally

- Journal entries, habits, prompts usage, and preferences
- Optional media attachments (images) on disk
- Optional 4-digit PIN hash in the local database (not sent anywhere)

## Desktop vs browser development

- **Development (`pnpm dev`)**: database defaults to `dev.db` in the project directory unless configured otherwise.
- **Desktop (Electron)**: data is stored in OS-specific application data paths (e.g. `~/.config/sanctuary/` on Linux).

## Your responsibilities

- Back up your database and media folders if entries are important.
- Anyone with access to your user account on the device can read local files unless you use full-disk encryption and a strong OS password.
- Export folders (e.g. `Documents/Sanctuary Exports`) contain plain-text or file copies you create explicitly.

## Open source

Source code is public; running Sanctuary does not transmit your journal content to the project maintainers.

For security issues, see [SECURITY.md](../SECURITY.md).
