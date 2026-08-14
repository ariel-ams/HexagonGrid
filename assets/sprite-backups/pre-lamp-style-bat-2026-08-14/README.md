# Pre-Lamp-Style Bat Backup

This immutable batch preserves the Bat runtime sprite that existed before its Lamp-style migration on 2026-08-14.

## Restore

From the repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File assets/sprite-backups/pre-lamp-style-bat-2026-08-14/restore.ps1
```

The script verifies the repository shape and restores only `assets/bat-alpha.png`. Run `npm test` after restoring.
