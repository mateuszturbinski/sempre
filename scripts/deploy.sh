#!/usr/bin/env bash
# Wdrożenie landingu na VPS (62.238.118.20): rsync → bun install → build → restart usługi.
# Adres tunelu się NIE zmienia (restartujemy tylko sempre.service, nie sempre-tunnel).
set -euo pipefail
cd "$(dirname "$0")/.."
caffeinate -dimsu rsync -a --partial --delete \
  --exclude=node_modules --exclude=.next --exclude=figma-export --exclude=.git --exclude=.claude \
  -e "ssh -o BatchMode=yes" ./ root@62.238.118.20:/root/sempre/
ssh -o BatchMode=yes root@62.238.118.20 'cd /root/sempre && bun install && bun run build && systemctl restart sempre.service && sleep 3 && systemctl is-active sempre.service'
echo "Adres: $(ssh -o BatchMode=yes root@62.238.118.20 "journalctl -u sempre-tunnel --no-pager | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1")"
