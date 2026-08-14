# Pre-Lamp-Style Core Sprite Backup

This directory contains the exact ten runtime sheets replaced by the 2026-08-14 Lamp-style core art migration. Paths below this directory mirror paths from the repository root.

## Restore

From the repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File assets/sprite-backups/pre-lamp-style-2026-08-14/restore.ps1
```

The restore script verifies that it is running inside the expected repository and copies only the ten listed files. It does not remove generated source art, prompts, or documentation.

After restoration, run:

```powershell
npm test
```

The SHA-256 values in `checksums.sha256` describe the backed-up files, not the new Lamp-style runtime files.
