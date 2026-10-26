#!/usr/bin/env bash
# Monthly sync for the Thunder Linter fork.
# This script documents and checks the sync. It does NOT push on its own.
# The monthly agent reviews its output, resolves any conflict, runs the
# tests, and only then pushes and triggers the Thunder Release workflow.
#
# Usage, from the fork checkout on branch thunder:
#   bash scripts/thunder-monthly-sync.sh
#
# Custom files (Thunder's, keep ours on conflict):
#   src/rules/thunder-*.ts
#   __tests__/thunder-*.test.ts
#   thunder-preset.json, THUNDER.md, thunder-sync-state.json
#   .github/workflows/thunder-release.yml, scripts/thunder-monthly-sync.sh
#   src/lang/locale/en.ts is shared: keep only the thunder-* entries
#   from ours, take everything else from upstream on conflict.
set -euo pipefail

echo "Upstream remote (must be platers/obsidian-linter):"
git remote -v | grep upstream || echo "No upstream remote. Add it with: git remote add upstream https://github.com/platers/obsidian-linter.git"
echo
echo "Last synced upstream version (thunder-sync-state.json):"
cat thunder-sync-state.json
echo
echo "Fetching upstream:"
git fetch upstream master
echo
echo "Upstream master now at:"
git rev-parse upstream/master
git log -1 --oneline upstream/master
echo
echo "Commits upstream has that thunder does not:"
git log --oneline thunder..upstream/master || true
echo
echo "To sync (review before pushing):"
echo "  git checkout thunder"
echo "  git merge upstream/master"
echo "  # conflicts in custom files: keep ours; conflicts elsewhere: take upstream, then re-check custom files"
echo "  npx jest __tests__/thunder-heading-table-spacing.test.ts"
echo "  npm run build"
echo "  # only then: git push origin thunder, and trigger Thunder Release"
echo "  # then update thunder-sync-state.json with the new upstream version and date"
