#!/usr/bin/env bash
# Vitrini canlıya alır. CI kaynağı /opt/deprem/ci-staging/storefront'a
# kopyalar, bu betik sunucuda çalışır:
#
#   ssh <sunucu> "SHA=<commit> bash /opt/deprem/ci-staging/storefront-sunucu.sh"
#
# DOSYADAN çalışır: stdin'den (bash -s) verilince içerideki docker compose
# komutları betiğin kalanını yutar ve dağıtım sessizce yarıda kalır (2026-10-20).
#
# Sıra: kaynak yedeği + önceki imaja etiket → derleme → aday konteyner sınanır
# → yayına alınır → yayındaki sınanır. Derleme ya da aday tutmazsa canlıya hiç
# dokunulmaz; yayından sonra tutmazsa önceki imaj ve kaynak geri gelir.
#
# Etiket derlemeden ÖNCE atılır: sunucu containerd snapshotter kullanıyor ve
# latest yeni imaja taşınınca etiketsiz eski imajın kaydı kayboluyor.
set -euo pipefail
[ -f "${BASH_SOURCE[0]:-}" ] || { echo "::error::sunucu.sh dosyadan çalıştırılmalı (bash -s değil)"; exit 1; }
exec </dev/null

SVC=storefront
PORT=8000
IMG=deploy-$SVC
SRC_ROOT=/opt/deprem/gobit-src
STAGE=/opt/deprem/ci-staging/$SVC
TS=$(date -u +%Y%m%d-%H%M%S)
ONCEKI=$IMG:ci-onceki-$TS
YEDEK=/opt/deprem/deploy/backups/$SVC-src-ci-$TS.tgz
ADAY=$SVC-aday-$TS

# Uygulamanın ayakta olduğunu söyleyen istekler (nginx konteynerinden).
kontrol() {
  local host=$1 urun
  ag -O /dev/null "http://$host:$PORT/tr" || return 1
  # Ürün sayfaları kesintide 500 vermişti (DYNAMIC_SERVER_USAGE): biri de sınanır.
  urun=$(ag -O - "http://$host:$PORT/sitemap.xml" | grep -oE "<loc>[^<]*/products/[^<]*</loc>" | head -1 |
    sed -E "s#<loc>https?://[^/]+##; s#</loc>##") || true
  [ -n "$urun" ] || { echo "site haritasında ürün yok"; return 1; }
  ag -O /dev/null "http://$host:$PORT$urun"
}

ag() { docker compose exec -T nginx wget -q -T 30 "$@"; }

bekle() { # host
  for _ in $(seq 1 45); do
    ag -O /dev/null "http://$1:$PORT/tr" 2>/dev/null && return 0
    sleep 2
  done
  return 1
}

# compose "up -d" yeni imajı her zaman fark etmiyor (2026-10-20: gobit
# "Running" deyip eski imajda kaldı); yayından sonra bu doğrulanır.
yeni_imajda() {
  [ "$(docker inspect --format '{{.Image}}' "$(docker compose ps -q "$SVC")")" = \
    "$(docker image inspect --format '{{.Id}}' "$IMG:latest")" ]
}

kaynagi_geri_yukle() {
  rm -rf "${SRC_ROOT:?}/$SVC"
  tar xzf "$YEDEK" -C "$SRC_ROOT"
}

aday_kaldir() { docker rm -f "$ADAY" >/dev/null 2>&1 || true; }

exec 9>/tmp/deprem-deploy.lock
flock 9
cd /opt/deprem/deploy
trap aday_kaldir EXIT

echo "== yedek ($TS, ${SHA:-?})"
mkdir -p backups
tar czf "$YEDEK" -C "$SRC_ROOT" "$SVC"
docker tag "$IMG:latest" "$ONCEKI"

echo "== kaynak"
rsync -a --delete "$STAGE/" "$SRC_ROOT/$SVC/"

echo "== derleme"
if ! docker compose build "$SVC"; then
  kaynagi_geri_yukle
  docker rmi "$ONCEKI" >/dev/null
  echo "::error::Derleme başarısız; kaynak geri yüklendi, canlıya dokunulmadı."
  exit 1
fi

echo "== aday"
docker compose run -d --no-deps --name "$ADAY" "$SVC" >/dev/null
if ! { bekle "$ADAY" && kontrol "$ADAY"; }; then
  docker logs --tail 60 "$ADAY" 2>&1 || true
  docker tag "$ONCEKI" "$IMG:latest"
  kaynagi_geri_yukle
  echo "::error::Aday konteyner sınamayı geçmedi; canlıya dokunulmadı."
  exit 1
fi
# Adayın ağdaki adı nginx'in çözümlemesine karışmasın diye yayından önce kalkar.
aday_kaldir

echo "== yayın"
docker compose up -d --no-deps --force-recreate "$SVC"
# nginx upstream adresini yüklenirken çözer; yeni konteynerin adresi için yeniden yüklenir.
if ! { yeni_imajda && bekle "$SVC" && docker compose exec -T nginx nginx -s reload && kontrol "$SVC"; }; then
  docker compose logs --tail 60 "$SVC" 2>&1 || true
  docker tag "$ONCEKI" "$IMG:latest"
  kaynagi_geri_yukle
  docker compose up -d --no-deps --force-recreate "$SVC"
  bekle "$SVC" || true
  docker compose exec -T nginx nginx -s reload
  echo "::error::Yayındaki sürüm sınamayı geçmedi; önceki sürüme dönüldü ($ONCEKI)."
  exit 1
fi

echo "== temizlik"
docker images --format '{{.Tag}}' "$IMG" | { grep '^ci-onceki-' || true; } | sort -r | tail -n +4 |
  while read -r t; do docker rmi "$IMG:$t" >/dev/null || true; done
ls -1t backups/"$SVC"-src-ci-*.tgz | tail -n +6 | xargs -r rm -f
echo "$TS $SVC ${SHA:-?}" >> backups/ci-deploys.log
docker compose ps "$SVC"
echo "== tamam"
