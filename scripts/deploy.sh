#!/usr/bin/env bash
#
# Deploy Plexus (frontend + backend) to production.
#
# Model: build Docker images locally -> push to Docker Hub -> server pulls & restarts.
# Auth:  SSH KEYS ONLY. There are no passwords in this script (that was the security fix).
#        Set up keys once:  ssh-copy-id ubuntu@51.255.204.71   then  PasswordAuthentication no.
#
# Remote docker: this server has NO 'docker' group; the socket is root-only, so remote
# docker runs via `sudo docker` (REMOTE_DOCKER_CMD). For that to work non-interactively,
# grant the ubuntu user passwordless sudo for docker ONCE:
#   ssh -t ubuntu@51.255.204.71 'D=$(command -v docker); \
#     echo "ubuntu ALL=(ALL) NOPASSWD: $D" | sudo tee /etc/sudoers.d/deploy-docker && \
#     sudo chmod 440 /etc/sudoers.d/deploy-docker && sudo visudo -c'
#
# Two things differ from a "build everything in Docker" flow, because the Dockerfiles
# copy pre-built artifacts:
#   - backend/Dockerfile does `COPY target/*.jar`  -> Maven runs LOCALLY first.
#   - Dockerfile (frontend) copies `.next/standalone` -> `yarn build` runs LOCALLY first.
#
# Usage:
#   ./scripts/deploy.sh            # build + push + deploy BOTH (asks before touching the server)
#   ./scripts/deploy.sh frontend   # only the frontend
#   ./scripts/deploy.sh backend    # only the backend
#   ./scripts/deploy.sh --no-deploy         # build + push only, don't touch the server
#   ./scripts/deploy.sh --build-only        # build only, don't push or deploy
#   SKIP_MVN=1 ./scripts/deploy.sh backend  # reuse the existing backend/target/*.jar
#
# Which backend gets it (production, the api-dev sandbox, or both):
#   ./scripts/deploy.sh backend             # both  — same build, tagged :latest and :dev
#   ./scripts/deploy.sh backend --dev       # the sandbox only; :latest is left untouched
#   ./scripts/deploy.sh backend --prod      # production only
# The two run the same image from the same source; only the tag and the Business Central
# company differ. So "try it on dev, then promote" is the same build pushed twice — and
# --dev deliberately never pushes :latest, which is what production pulls.
#
# After deploying, this script syncs PARTNER_API_KEY into AutoReport's own .env
# (as PLEXUS_API_KEY) and recreates its container if the value changed. AutoReport
# calls this backend's partner API, and a rotation here used to break it silently.
# Skip that step with AUTOREPORT_DIR="" ./scripts/deploy.sh
#
# Override any config via env vars, e.g.:
#   SERVERS="51.255.204.71 51.255.204.70" ./scripts/deploy.sh
#   REMOTE_DOCKER_CMD="sudo docker" ./scripts/deploy.sh   # if ubuntu isn't in the docker group
#   AUTOREPORT_DIR="" ./scripts/deploy.sh                 # don't touch AutoReport
#
set -euo pipefail

# ------------------------------------------------------------------ config ---
SERVERS="${SERVERS:-51.255.204.71}"            # space-separated list; add more if needed
SSH_USER="${SSH_USER:-ubuntu}"
DEPLOY_DIR="${DEPLOY_DIR:-/home/ubuntu/piece-app}"  # remote dir holding docker-compose.yml + .env
# AutoReport (repo: Plexus-automative/app-plexus-tec) is a separate compose project that
# calls this backend's partner API. It holds a COPY of PARTNER_API_KEY as PLEXUS_API_KEY,
# so rotating the key here silently breaks it until that copy is updated too — which is
# exactly what happened on 2026-08-06. See the sync step at the end of the deploy loop.
# Set AUTOREPORT_DIR="" to skip the sync entirely.
AUTOREPORT_DIR="${AUTOREPORT_DIR-/home/ubuntu/autoreport}"
AUTOREPORT_COMPOSE="${AUTOREPORT_COMPOSE:-docker-compose.prod.yml}"
DOCKER_USERNAME="${DOCKER_USERNAME:-plexusauto}"
DOCKER_CMD="${DOCKER_CMD:-docker}"             # local docker command (Docker Desktop, no sudo)
# Remote docker runs as ROOT: this server has no 'docker' group and the socket is root-only.
# docker is a snap; use the FULL path (/snap/bin isn't in sudo's secure_path, and this
# matches the NOPASSWD sudoers rule exactly). Needs passwordless sudo (see header notes).
REMOTE_DOCKER_CMD="${REMOTE_DOCKER_CMD:-sudo /snap/bin/docker}"
MVN_CMD="${MVN_CMD:-mvn}"                       # local Maven, used to build the backend jar
# Frontend build command. This repo is maintained with npm (package-lock.json is the live
# lockfile); yarn.lock is stale, and package.json pins packageManager:yarn@4 so a bare
# `yarn build` triggers a strict lockfile check that fails. So build with npm.
BUILD_CMD="${BUILD_CMD:-npm run build}"
TAG="${TAG:-latest}"

# Baked into the frontend build (next.config.ts reads these at build time). NOT secrets.
export NEXTAUTH_URL="${NEXTAUTH_URL:-https://plexus-tec.com}"
export NEXT_PUBLIC_BACKEND_URL="${NEXT_PUBLIC_BACKEND_URL:-https://plexus-tec.com}"
export NEXT_APP_API_URL="${NEXT_APP_API_URL:-https://plexus-tec.com}"

# Node 20 is required to build the Next.js frontend.
NODE_BIN="${NODE_BIN:-$HOME/.nvm/versions/node/v20.19.3/bin}"

BE_IMAGE="${DOCKER_USERNAME}/plexus-backend:${TAG}"
FE_IMAGE="${DOCKER_USERNAME}/plexus-frontend:${TAG}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ----------------------------------------------------------------- helpers ---
c()  { printf '\033[1;36m==> %s\033[0m\n' "$*"; }        # cyan step
ok() { printf '\033[1;32m    ✓ %s\033[0m\n' "$*"; }
err(){ printf '\033[1;31m    ✗ %s\033[0m\n' "$*" >&2; }
die(){ err "$*"; exit 1; }

# ------------------------------------------------------------------ args -----
# SCOPE picks which backend gets the build: production, the api-dev sandbox, or both.
# They run the SAME image built from the same source — only the tag and the BC company
# differ — so "test on dev first, then promote" is just pushing the same build twice.
TARGET="all"; DO_PUSH=1; DO_DEPLOY=1; SCOPE="both"
for a in "$@"; do
  case "$a" in
    frontend|backend|all) TARGET="$a" ;;
    --dev)                SCOPE="dev" ;;
    --prod)               SCOPE="prod" ;;
    --no-deploy)          DO_DEPLOY=0 ;;
    --build-only)         DO_DEPLOY=0; DO_PUSH=0 ;;
    -h|--help)            sed -n '2,34p' "$0"; exit 0 ;;
    *) die "unknown arg: $a (use frontend|backend|all|--dev|--prod|--no-deploy|--build-only)" ;;
  esac
done

# --dev only concerns the backend: there is no frontend sandbox. Refuse rather than quietly
# build something else — `deploy.sh frontend --dev` reads like a request this cannot honour.
if [ "$SCOPE" = "dev" ]; then
  case "$TARGET" in
    frontend) die "--dev applies to the backend only (there is no frontend sandbox)" ;;
    all)      TARGET="backend" ;;
  esac
fi

BACKEND_DEV_TAG="${BACKEND_DEV_TAG:-dev}"
BE_DEV_IMAGE="${DOCKER_USERNAME}/plexus-backend:${BACKEND_DEV_TAG}"
build_fe=0; build_be=0
case "$TARGET" in
  all)      build_fe=1; build_be=1 ;;
  frontend) build_fe=1 ;;
  backend)  build_be=1 ;;
esac

# --------------------------------------------------------------- preflight ---
c "Preflight checks"
command -v docker >/dev/null || die "docker not found"
$DOCKER_CMD info >/dev/null 2>&1 || die "docker daemon not running (start Docker Desktop)"
if [ "$build_be" = 1 ] && [ "${SKIP_MVN:-0}" != 1 ]; then
  command -v "$MVN_CMD" >/dev/null || die "mvn not found; install Maven or set SKIP_MVN=1 to reuse backend/target/*.jar"
fi
if [ "$DO_PUSH" = 1 ]; then
  $DOCKER_CMD info 2>/dev/null | grep -qi "Username" || cat <<EOF
    (!) You may not be logged in to Docker Hub. If push fails, run:  docker login -u $DOCKER_USERNAME
EOF
fi
ok "docker ready"

# ------------------------------------------------------------ build backend --
if [ "$build_be" = 1 ]; then
  if [ "${SKIP_MVN:-0}" != 1 ]; then
    c "Building backend jar  (Maven, local)"
    $MVN_CMD -f backend/pom.xml clean package -DskipTests
    ok "jar built"
  else
    c "Skipping Maven (SKIP_MVN=1) — reusing existing jar"
  fi
  ls backend/target/*.jar >/dev/null 2>&1 || die "no backend/target/*.jar — run Maven (unset SKIP_MVN)"
  c "Building backend image  ($BE_IMAGE)"
  $DOCKER_CMD build -t "$BE_IMAGE" ./backend
  # One build, tagged for whichever side is being served. Tagging is free — the layers are
  # shared — and it guarantees dev and prod run byte-identical code when both are deployed.
  if [ "$SCOPE" != "prod" ]; then
    $DOCKER_CMD tag "$BE_IMAGE" "$BE_DEV_IMAGE"
    ok "also tagged $BE_DEV_IMAGE"
  fi
  ok "backend image built"
fi

# ----------------------------------------------------------- build frontend --
if [ "$build_fe" = 1 ]; then
  c "Building frontend (Next.js standalone, Node 20)"
  if [ -x "$NODE_BIN/node" ]; then PATH="$NODE_BIN:$PATH"; fi
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  [ "$NODE_MAJOR" -ge 18 ] || die "Node >=18 required for the build; got $(node -v 2>/dev/null). Set NODE_BIN=/path/to/node20/bin"
  [ -d node_modules ] || die "node_modules missing — install deps first (this repo uses: npm install --legacy-peer-deps)"
  echo "    node $(node -v) | build: '$BUILD_CMD' | NEXTAUTH_URL=$NEXTAUTH_URL | NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL"
  $BUILD_CMD
  [ -d ".next/standalone" ] || die ".next/standalone missing — is output:'standalone' set in next.config.ts?"
  c "Building frontend image  ($FE_IMAGE)"
  $DOCKER_CMD build -t "$FE_IMAGE" .
  ok "frontend image built"
fi

# ------------------------------------------------------------------- push ----
if [ "$DO_PUSH" = 1 ]; then
  if [ "$build_be" = 1 ]; then
    # --dev must NOT touch :latest. That tag is what production pulls, and pushing it here
    # would hand the sandbox's build to prod on its next restart.
    if [ "$SCOPE" != "dev" ]; then c "Pushing $BE_IMAGE"; $DOCKER_CMD push "$BE_IMAGE"; ok "pushed backend"; fi
    if [ "$SCOPE" != "prod" ]; then c "Pushing $BE_DEV_IMAGE"; $DOCKER_CMD push "$BE_DEV_IMAGE"; ok "pushed backend (dev)"; fi
  fi
  if [ "$build_fe" = 1 ]; then c "Pushing $FE_IMAGE"; $DOCKER_CMD push "$FE_IMAGE"; ok "pushed frontend"; fi
else
  c "Skipping push (--build-only)"
fi

# ----------------------------------------------------------------- deploy ----
if [ "$DO_DEPLOY" = 0 ]; then
  c "Done (no deploy)."; exit 0
fi

echo
c "About to deploy to: $SERVERS  (user: $SSH_USER, dir: $DEPLOY_DIR)"
read -r -p "    Proceed? [y/N] " ans
[ "$ans" = "y" ] || [ "$ans" = "Y" ] || { echo "    aborted."; exit 0; }

# Which compose services to pull/refresh based on the target and the scope
PULL_SERVICES=""
if [ "$build_be" = 1 ] && [ "$SCOPE" != "dev" ];  then PULL_SERVICES="$PULL_SERVICES backend"; fi
if [ "$build_be" = 1 ] && [ "$SCOPE" != "prod" ]; then PULL_SERVICES="$PULL_SERVICES backend-dev"; fi
if [ "$build_fe" = 1 ]; then PULL_SERVICES="$PULL_SERVICES frontend"; fi

# With a scope, recreate ONLY the services concerned — a bare `up -d` would also recreate
# the other backend, which is exactly what --dev and --prod exist to avoid. Without one,
# keep the old behaviour: bring the whole file up, so anything missing gets started.
UP_SERVICES=""
if [ "$SCOPE" != "both" ]; then UP_SERVICES="$PULL_SERVICES"; fi

for host in $SERVERS; do
  c "Deploying to $host"
  # Ship the infra config (compose + nginx). Uses SSH keys — no password.
  # NOTE: the server's .env (prod secrets) is NOT touched — only compose + nginx conf.
  ssh "$SSH_USER@$host" "mkdir -p $DEPLOY_DIR/nginx"
  scp docker-compose.yml   "$SSH_USER@$host:$DEPLOY_DIR/docker-compose.yml"
  scp nginx/nginx.conf     "$SSH_USER@$host:$DEPLOY_DIR/nginx/nginx.conf"
  ok "config uploaded"

  # Pull the new images, recreate changed services, reload nginx for its mounted conf.
  ssh "$SSH_USER@$host" bash -s <<REMOTE
    set -e
    cd $DEPLOY_DIR
    # SAFETY: refuse to touch containers if there's no .env here — 'compose up' would
    # otherwise recreate prod containers with BLANK secrets. If this fires, DEPLOY_DIR
    # is pointing at the wrong directory.
    [ -f .env ] || { echo "    !! no .env in \$(pwd) — refusing to deploy (wrong DEPLOY_DIR?)"; exit 1; }
    echo "    pulling:${PULL_SERVICES:- (none)}"
    [ -n "${PULL_SERVICES// /}" ] && $REMOTE_DOCKER_CMD compose pull$PULL_SERVICES || true
    echo "    recreating:${UP_SERVICES:- (all services)}"
    $REMOTE_DOCKER_CMD compose up -d$UP_SERVICES
    # Apply nginx.conf changes (mounted file — container isn't recreated on its own)
    if $REMOTE_DOCKER_CMD compose exec -T nginx nginx -t; then
      $REMOTE_DOCKER_CMD compose exec -T nginx nginx -s reload
      echo "    nginx reloaded"
    else
      echo "    !! nginx config test FAILED — not reloading; check nginx/nginx.conf"
    fi
    $REMOTE_DOCKER_CMD compose ps
REMOTE
  ok "deployed to $host"

  # --- keep AutoReport's copy of the partner key in sync -----------------------
  # PARTNER_API_KEY lives here; AutoReport reads the same secret as PLEXUS_API_KEY
  # from its own .env. Nothing linked the two, so a rotation broke dossier
  # submission silently — the API kept answering 200 and only the partner call
  # 401'd, which is invisible until someone submits a dossier.
  #
  # Docker bakes env vars in at container CREATION, so editing .env is not enough:
  # the container must be recreated. `compose up -d` does that; `restart` does not.
  # Keys are compared and reported by sha256 prefix — the value is never printed.
  if [ -n "$AUTOREPORT_DIR" ]; then
    c "Syncing partner key to AutoReport on $host"
    ssh "$SSH_USER@$host" bash -s <<REMOTE
      set -euo pipefail
      if [ ! -f "$AUTOREPORT_DIR/.env" ] || [ ! -f "$AUTOREPORT_DIR/$AUTOREPORT_COMPOSE" ]; then
        echo "    AutoReport not installed here — skipping"
        exit 0
      fi
      NEW=\$(sed -n 's/^PARTNER_API_KEY=//p' "$DEPLOY_DIR/.env" | head -1)
      CUR=\$(sed -n 's/^PLEXUS_API_KEY=//p' "$AUTOREPORT_DIR/.env" | head -1)
      if [ -z "\$NEW" ]; then
        echo "    !! PARTNER_API_KEY is empty in $DEPLOY_DIR/.env — refusing to overwrite AutoReport's key"
        exit 1
      fi
      if [ "\$NEW" = "\$CUR" ]; then
        echo "    already in sync (\$(printf %s "\$NEW" | sha256sum | cut -c1-12))"
        exit 0
      fi
      echo "    key changed: \$(printf %s "\$CUR" | sha256sum | cut -c1-12) -> \$(printf %s "\$NEW" | sha256sum | cut -c1-12)"
      cd "$AUTOREPORT_DIR"
      cp .env ".env.bak-keysync-\$(date +%Y%m%d-%H%M%S)"
      # printf %s keeps the value literal; no shell or sed interpretation of its characters.
      grep -v '^PLEXUS_API_KEY=' .env > .env.tmp
      printf 'PLEXUS_API_KEY=%s\n' "\$NEW" >> .env.tmp
      mv .env.tmp .env
      chmod 600 .env
      $REMOTE_DOCKER_CMD compose -f "$AUTOREPORT_COMPOSE" up -d
      # Prove the new key actually authenticates, rather than assuming it does.
      for i in \$(seq 1 24); do
        [ "\$($REMOTE_DOCKER_CMD inspect -f '{{.State.Health.Status}}' autoreport-api 2>/dev/null)" = healthy ] && break
        sleep 5
      done
      K=\$($REMOTE_DOCKER_CMD exec autoreport-api printenv PLEXUS_API_KEY)
      CODE=\$($REMOTE_DOCKER_CMD exec autoreport-api curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
        -H "X-API-Key: \$K" https://www.plexus-tec.com/api/partner/v1/ping)
      if [ "\$CODE" = 200 ]; then
        echo "    AutoReport partner auth OK (200)"
      else
        echo "    !! AutoReport partner auth returned \$CODE — dossier submission will fail"
        exit 1
      fi
REMOTE
    ok "AutoReport key in sync on $host"
  fi
done

echo
c "Done. Verify:"
echo "    - https://plexus-tec.com loads and login works"
echo "    - curl -sI https://plexus-tec.com | grep -i strict-transport-security   # HSTS header present"
if [ -n "$AUTOREPORT_DIR" ]; then
echo "    - ssh $SSH_USER@${SERVERS%% *} 'curl -fsS -o /dev/null https://mobile.plexus-tec.com/api/garages && echo AutoReport OK'"
fi
