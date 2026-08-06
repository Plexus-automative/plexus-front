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
# Override any config via env vars, e.g.:
#   SERVERS="51.255.204.71 51.255.204.70" ./scripts/deploy.sh
#   REMOTE_DOCKER_CMD="sudo docker" ./scripts/deploy.sh   # if ubuntu isn't in the docker group
#
set -euo pipefail

# ------------------------------------------------------------------ config ---
SERVERS="${SERVERS:-51.255.204.71}"            # space-separated list; add more if needed
SSH_USER="${SSH_USER:-ubuntu}"
DEPLOY_DIR="${DEPLOY_DIR:-/home/ubuntu/piece-app}"  # remote dir holding docker-compose.yml + .env
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
TARGET="all"; DO_PUSH=1; DO_DEPLOY=1
for a in "$@"; do
  case "$a" in
    frontend|backend|all) TARGET="$a" ;;
    --no-deploy)          DO_DEPLOY=0 ;;
    --build-only)         DO_DEPLOY=0; DO_PUSH=0 ;;
    -h|--help)            sed -n '2,30p' "$0"; exit 0 ;;
    *) die "unknown arg: $a (use frontend|backend|all|--no-deploy|--build-only)" ;;
  esac
done
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
  if [ "$build_be" = 1 ]; then c "Pushing $BE_IMAGE"; $DOCKER_CMD push "$BE_IMAGE"; ok "pushed backend"; fi
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

# Which compose services to pull/refresh based on the target
PULL_SERVICES=""
if [ "$build_be" = 1 ]; then PULL_SERVICES="$PULL_SERVICES backend"; fi
if [ "$build_fe" = 1 ]; then PULL_SERVICES="$PULL_SERVICES frontend"; fi

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
    $REMOTE_DOCKER_CMD compose up -d
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
done

echo
c "Done. Verify:"
echo "    - https://plexus-tec.com loads and login works"
echo "    - curl -sI https://plexus-tec.com | grep -i strict-transport-security   # HSTS header present"
