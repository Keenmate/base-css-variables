# @keenmate/base-css-variables - Makefile
# Ship the canonical --base-* CSS custom-property contract.
#
# This package has NO build step: base-variables.css is authored by hand and IS
# the published artifact (no SCSS, no compile, no dist/). The targets below wrap
# npm's pack/publish so releases match pure-css's ergonomics.
#
# Usage:
#   make sizes          Show the size of base-variables.css
#   make package        Create npm tarball
#   make verify         Create tarball and confirm contents
#   make publish-dry    Dry-run publish as 'latest' (verify what would be published)
#   make publish-dry-rc Dry-run publish under --tag rc (for pre-releases)
#   make publish        Publish to npm as 'latest'
#   make publish-rc     Publish under --tag rc (canonical for X.Y.Z-rcN)
#   make publish TAG=<x> Publish under arbitrary dist-tag (e.g. TAG=beta, TAG=next)

# --- Windows recipe-shell fix -------------------------------------------------
# GNU make on Windows picks Git's bare `usr/bin/sh.exe` as the recipe shell,
# which breaks npm/npx's Unix shell-shims. Pin the recipe shell to Git's full
# bash launcher so `env bash` resolves to MSYS bash. Guarded so it's a no-op
# when Git isn't at the default location. (Mirrors pure-css.)
ifeq ($(OS),Windows_NT)
  ifneq ($(wildcard C:/Program?Files/Git/bin/bash.exe),)
    SHELL := C:/Program Files/Git/bin/bash.exe
  endif
endif
# -----------------------------------------------------------------------------

# NPM publish tag (empty for latest, use TAG=rc for pre-releases)
TAG ?=
NPM_TAG = $(if $(TAG),--tag $(TAG),)

.PHONY: help sizes package verify publish-dry publish-dry-rc publish publish-rc

help:
	@echo "@keenmate/base-css-variables - Available Commands:"
	@echo ""
	@echo "  (no build — base-variables.css is authored directly and shipped as-is)"
	@echo ""
	@echo "  Package:"
	@echo "    make sizes          - Show base-variables.css size"
	@echo "    make package        - Create npm tarball"
	@echo "    make verify         - Create tarball and confirm contents"
	@echo "    make publish-dry    - Dry-run publish as 'latest'"
	@echo "    make publish-dry-rc - Dry-run publish under --tag rc"
	@echo "    make publish        - Publish to npm as 'latest'"
	@echo "    make publish-rc     - Publish under --tag rc (canonical for X.Y.Z-rcN)"
	@echo "    make publish TAG=x  - Publish under arbitrary dist-tag"
	@echo ""

sizes:
	@ls -l base-variables.css | awk '{printf "  %8d  %s\n", $$5, $$9}'

# Create package tarball
package:
	npm pack

# Verify what would be published
verify:
	npm pack --dry-run
	@echo "Package verified and ready!"

# Dry-run publish as 'latest' (verify what would be published)
publish-dry:
	npm publish --dry-run $(NPM_TAG)

# Dry-run publish under --tag rc (for pre-release versions like X.Y.Z-rcN)
publish-dry-rc:
	npm publish --dry-run --tag rc

# Publish to npm as 'latest'
publish:
	npm publish $(NPM_TAG)

# Publish under --tag rc (canonical for X.Y.Z-rcN pre-releases). Keeps the
# 'latest' dist-tag untouched; consumers opt in via @rc or by pinning the exact
# version. Equivalent to `make publish TAG=rc` but harder to forget.
publish-rc:
	npm publish --tag rc
