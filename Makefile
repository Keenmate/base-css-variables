# @keenmate/base-css-variables — Makefile
# Follows the devkit's Makefile template (`kmwc sync`, as in web-multiselect) — same targets,
# recipes and `## ` help — but is kept by hand (package.json#kmwc.sync.skippedFiles): this
# package has NO build step (base-variables.css is authored by hand and IS the published
# artifact), so build / package / publish differ, and the examples load the sibling components'
# local builds. Keep the shared recipes in step with the template when it changes.
#
# Repo-specific targets go in Makefile.local (included at the end; a target
# redefined there wins, with a make "overriding recipe" warning). Per-developer
# overrides (container runner, image name, port) go in .makefile.env.

.PHONY: help setup build dev kill-port build-examples preview-examples package verify sizes publish-dry publish publish-rc clean check-version doctor check-pages sync test test-check test-e2e test-e2e-ui test-e2e-headed test-headed test-e2e-install image-build image-run image-stop image-logs image-push image-clean

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

-include .makefile.env
DOCKER_RUNNER  ?= podman
IMAGE_NAME     ?= registry.keenmate.dev/base-css-variables-examples:prod
CONTAINER_NAME ?= base-css-variables-examples
IMAGE_PORT     ?= 15310
DEV_PORT       := 15300
PREVIEW_PORT   := 15301

# Sibling component repos the examples + e2e load from (override if checked out elsewhere,
# e.g. `make build WEB_TREEVIEW_DIR=/src/web-treeview`). vite.config.ts reads the same
# locations via WEB_TREEVIEW_DIST / WEB_MULTISELECT_DIST, exported below.
WEB_TREEVIEW_DIR    ?= ../web-treeview
WEB_MULTISELECT_DIR ?= ../web-multiselect
export WEB_TREEVIEW_DIST    = $(WEB_TREEVIEW_DIR)/dist
export WEB_MULTISELECT_DIST = $(WEB_MULTISELECT_DIR)/dist

help: ## Show this help message
	@echo "Available targets:"
	@grep -hE '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'

setup: ## Install dependencies + Playwright browsers, build the sibling components the examples load
	npm install
	npm run test:e2e:install
	$(MAKE) build

# The examples load the LOCAL builds of the sibling components, so they must be
# rebuilt to pick up token renames on their side. dist/ is gitignored in both.
build: ## Build ../web-treeview + ../web-multiselect for the examples (this package has nothing to build)
	cd "$(WEB_TREEVIEW_DIR)" && npm run build
	cd "$(WEB_MULTISELECT_DIR)" && npm run build

dev: ## Start the dev server (examples on http://localhost:15300)
	@rm -rf node_modules/.vite
	npm run dev

# Free the dev + preview ports. Vite runs with strictPort, so a stale server is
# the only thing that can hold them. On Windows a PowerShell one-liner covers
# IPv4 + IPv6 listeners; `$$_` escapes make's `$` and the single quotes stop sh
# from expanding `$_` before PowerShell sees it.
kill-port: ## Free the dev/preview ports (15300, 15301)
ifeq ($(OS),Windows_NT)
	-@powershell -NoProfile -Command '$(DEV_PORT),$(PREVIEW_PORT) | ForEach-Object { Get-NetTCPConnection -LocalPort $$_ -State Listen -ErrorAction SilentlyContinue } | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $$_ -Force -ErrorAction SilentlyContinue }'
else
	-@for p in $(DEV_PORT) $(PREVIEW_PORT); do lsof -ti tcp:$$p | xargs -r kill -9; done
endif
	@echo "Ports $(DEV_PORT), $(PREVIEW_PORT) are free"

build-examples: ## Build the static examples site (dist-examples/)
	npm run build:examples

preview-examples: build-examples ## Serve the built examples site (http://localhost:15301)
	npm run preview:examples

package: ## Create an npm tarball (no build — base-variables.css ships as-is)
	npm pack

verify: ## Show what the tarball would contain
	npm pack --dry-run

sizes: ## Show the size of base-variables.css
	@ls -l base-variables.css | awk '{printf "  %8d  %s\n", $$5, $$9}'

publish-dry: ## Publish dry run
	npm publish --dry-run

# Release gates (publish-command.md): the version must fit the dist-tag
# (latest = no pre-release suffix, rc = -rcN), must not be on npm yet, and the
# tests must pass. `kmwc check-release` does the first two. No clean / build:
# base-variables.css is the artifact.
publish: ## Publish to npm as 'latest' (release versions only)
	npx kmwc check-release --tag latest
	@echo "WARNING: publishing to npm under the 'latest' dist-tag. Use 'make publish-rc' for pre-releases."
	@$(CONFIRM)
	npm test
	npm publish

publish-rc: ## Publish to npm under the 'rc' dist-tag (does NOT touch 'latest')
	npx kmwc check-release --tag rc
	@echo "WARNING: publishing to npm under the 'rc' dist-tag."
	@$(CONFIRM)
	npm test
	npm publish --tag rc

clean: ## Clean build artifacts
	npm run clean

check-version: ## Show the current package version
	@node -p "require('./package.json').version"

doctor: ## Check this repo against the Keenmate component standard
	npx kmwc doctor

check-pages: ## Load every example page at 1440/390/320px: errors, undefined elements, overflow
	npx kmwc check-pages

sync: ## Regenerate devkit-owned files (Dockerfile, nginx.conf, … — not this Makefile)
	npx kmwc sync

test: ## Run the base-contract-check unit tests + the e2e suite
	npm test

test-check: ## Run the base-contract-check unit tests
	npm run test:check

test-e2e: ## Run Playwright e2e tests (headless)
	npm run test:e2e

test-e2e-ui: ## Run Playwright e2e tests in UI mode
	npx playwright test --ui

test-e2e-headed: ## Run Playwright e2e tests headed
	npm run test:e2e:headed

test-headed: test-e2e-headed ## Alias of test-e2e-headed

test-e2e-install: ## Install the browser binaries (chromium, firefox, webkit; one-time)
	npm run test:e2e:install

# ── Container image (examples site) ──────────────────────────────────────────

image-build: ## Build the examples container image
	$(DOCKER_RUNNER) build --build-arg BUILD_TIME=$$(date -u +%Y-%m-%dT%H:%MZ) -t $(IMAGE_NAME) .

image-run: ## Run the examples image on IMAGE_PORT (default 15310)
	-@$(DOCKER_RUNNER) rm -f $(CONTAINER_NAME) >/dev/null 2>&1
	$(DOCKER_RUNNER) run -d --name $(CONTAINER_NAME) -p $(IMAGE_PORT):80 $(IMAGE_NAME)
	@echo "Serving examples at http://localhost:$(IMAGE_PORT)"

image-stop: ## Stop and remove the examples container
	-@$(DOCKER_RUNNER) rm -f $(CONTAINER_NAME) >/dev/null 2>&1

image-logs: ## Follow the examples container logs
	$(DOCKER_RUNNER) logs -f $(CONTAINER_NAME)

image-push: ## Push the examples image to the registry (log in first: $(DOCKER_RUNNER) login <registry>)
	$(DOCKER_RUNNER) push $(IMAGE_NAME)

image-clean: image-stop ## Remove the examples container and image
	-@$(DOCKER_RUNNER) rmi $(IMAGE_NAME) >/dev/null 2>&1

ifeq ($(OS),Windows_NT)
CONFIRM = powershell -NoProfile -Command "Write-Host 'Press Enter to continue, Ctrl+C to cancel...'; Read-Host | Out-Null"
else
CONFIRM = read -p "Press Enter to continue, Ctrl+C to cancel... " _
endif

-include Makefile.local

.DEFAULT_GOAL := help
