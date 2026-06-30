# Backend Deploy Runbook (Azure VM · pm2 + GitHub Actions)

CI/CD for the Yuca backend (spec: `yuca-orchestrator/specs/active/backend-cicd-azure-vm.md`, YL-003).

**Flow:** push to `master` → `ci` workflow (lint + syntax check) → on success, `deploy` workflow SSHes into the VM, pulls, installs, `pm2 reload`s, and health-checks `/health`.

---

## Verified environment (as of 2026-06-30)

| Thing | Value |
|---|---|
| VM | `azureuser@20.192.1.20` (host `YUCA`), SSH key `YUCA_key_0.pem` |
| App path (`DEPLOY_PATH`) | `/home/azureuser/YUCA_Backend_Service` |
| Node | v22.x (CI pinned to 22 to match) |
| Process manager | pm2 v7 (running) — **currently the app is misnamed `-a`; rename to `yuca-api` once, below** |
| API port | 5001 (nginx is also installed on the VM) |
| Health | `curl http://127.0.0.1:5001/health` → `{"status":"ok"}` |

---

## One-time setup

### 1. Rename the existing pm2 process to `yuca-api`

The app currently runs under pm2 as `-a`. The deploy workflow calls `pm2 reload yuca-api`, so do this once:

```bash
ssh -i YUCA_key_0.pem azureuser@20.192.1.20
cd ~/YUCA_Backend_Service
pm2 delete -a                                   # remove the mis-named process
pm2 start ecosystem.config.cjs --env production # start as "yuca-api" (instances:1, fork)
pm2 save                                        # persist the process list
pm2 startup systemd                             # run the sudo command it prints — survives reboot
pm2 status                                      # confirm "yuca-api" is online
```

### 2. Confirm the clone is deploy-ready

```bash
cd ~/YUCA_Backend_Service
git remote -v          # must point at origin (YUCA_Backend_Service)
git checkout master
git status              # the production .env must be present and git-ignored (never committed)
```

### 3. Create the SSH deploy key + add it to the VM

On a workstation:
```bash
ssh-keygen -t ed25519 -f yuca_deploy_key -C "github-actions-deploy" -N ""
# append the PUBLIC key to the VM:
ssh -i YUCA_key_0.pem azureuser@20.192.1.20 \
  "echo '$(cat yuca_deploy_key.pub)' >> ~/.ssh/authorized_keys"
```
(You may instead reuse `YUCA_key_0.pem` as the deploy key, but a dedicated, revocable key is better.)

### 4. Add GitHub repo secrets

Repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `AZURE_VM_HOST` | `20.192.1.20` |
| `AZURE_VM_USER` | `azureuser` |
| `AZURE_VM_SSH_KEY` | contents of the **private** deploy key (`yuca_deploy_key`) |
| `DEPLOY_PATH` | `/home/azureuser/YUCA_Backend_Service` |

After this, a push to `master` auto-deploys.

---

## Rollback

The deploy resets the VM to `origin/master`, so rollback = revert on GitHub (push reverts master → auto-redeploys), **or** on the VM directly:

```bash
ssh -i YUCA_key_0.pem azureuser@20.192.1.20
cd ~/YUCA_Backend_Service
git log --oneline -5            # find the last-good commit
git reset --hard <good-commit>
npm ci --omit=dev
pm2 reload yuca-api
curl -fsS http://127.0.0.1:5001/health
```

## Disable automation (kill switch)

Remove the `master` trigger from `.github/workflows/deploy.yml` (or delete the file). The pm2 service keeps running; deploy reverts to manual `git pull && pm2 reload yuca-api`.

## Operations

```bash
pm2 status            # process state
pm2 logs yuca-api     # live logs
pm2 monit             # cpu/mem
pm2 reload yuca-api   # zero-downtime restart (SIGTERM drain is wired in server.js)
```

## Post-October (Azure credits expire)

CI is unchanged; only the deploy job swaps. The Dockerfile already exists, so:
build the image in CI → push to GHCR → `fly deploy` (Fly.io reads the Dockerfile) or a Render deploy hook. Frontend stays on Cloudflare Pages; DB stays on Atlas. See spec §9.
