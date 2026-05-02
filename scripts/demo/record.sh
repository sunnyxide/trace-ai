#!/usr/bin/env bash
# =============================================================
# trace.ai 데모 자동화 스크립트
# 실행: bash scripts/demo/record.sh
#
# 결과물:
#   docs/demo-tts.m4a   — 한국어 TTS 오디오 (90초)
#   docs/demo-timed.txt — 각 구간 타이밍 참고용
#
# 화면녹화는 별도로 QuickTime으로 진행하고 아래 ffmpeg 명령으로 합칩니다.
# =============================================================

set -e
OUT_DIR="$(cd "$(dirname "$0")/../.." && pwd)/docs"
mkdir -p "$OUT_DIR"

VOICE="Yuna"
RATE=185   # 속도 조정 (175→185 으로 올려 전체 길이를 90초 이하로)

echo "▶  TTS 오디오 생성 중..."

# 구간 01 — 0:00–0:07  Hook  (목표 7초)
say -v $VOICE --rate $RATE -o /tmp/s01.aiff \
  "AI가 내린 결정 — 왜, 언제, 어떤 근거였는지, 지금 증명할 수 있으신가요?"

# 구간 02 — 0:07–0:20  Problem  (목표 13초)
say -v $VOICE --rate $RATE -o /tmp/s02.aiff \
  "고객 응대, 대출 심사, 콘텐츠 모더레이션. AI의 모든 결정에는 감사 추적이 없고, 규제 대응도, 분쟁 대응도 불가능합니다. trace dot ai는 모든 AI 의사결정에 변조 불가능한 영수증을 발급합니다."

# 구간 03 — 0:20–0:22  transition  (목표 2초)
say -v $VOICE --rate $RATE -o /tmp/s03.aiff \
  "세 단계면 끝납니다."

# 구간 04 — 0:22–0:35  Quickstart  (목표 13초)
say -v $VOICE --rate $RATE -o /tmp/s04.aiff \
  "먼저 SDK를 설치합니다. copy 버튼 하나면 됩니다. 워크스페이스 이름을 입력하면 API 키가 즉시 발급됩니다. 신용카드 불필요. 코드는 이게 전부입니다."

# 구간 05 — 0:35–0:50  Code  (목표 15초)
say -v $VOICE --rate $RATE -o /tmp/s05.aiff \
  "Anthropic 클라이언트를 traceClaude로 감쌉니다. 기존 코드는 변경 없습니다. 이제 매 API 호출마다 DR-1 레코드가 자동 생성되고 블록체인에 앵커링됩니다."

# 구간 06 — 0:50–1:07  easscan  (목표 17초)
say -v $VOICE --rate $RATE -o /tmp/s06.aiff \
  "앵커링이 완료되면 이렇게 출력됩니다. 이게 실제 온체인 데이터입니다. Base Sepolia에 올라간 트랜잭션 — 누구든 이 UID를 easscan에 붙여넣으면 독립적으로 검증할 수 있습니다. trace dot ai 서버 없이도."

# 구간 07 — 1:07–1:23  Verify  (목표 16초)
say -v $VOICE --rate $RATE -o /tmp/s07.aiff \
  "검증 페이지에서는 두 가지 증거를 확인합니다. 블록체인 앵커링 기록과 고객 서명 기록. 두 서명이 일치할 때, 그 결정은 증거가 됩니다. 판단은 여러분이 합니다. 우리는 증거만 제공합니다."

# 구간 08 — 1:23–1:30  Tagline  (목표 4초)
say -v $VOICE --rate $RATE -o /tmp/s08.aiff \
  "AI의 모든 결정을, 기록 위에. trace dot ai."

echo "▶  구간 길이 측정..."

# aiff → mp3 변환 후 길이 측정
for i in 01 02 03 04 05 06 07 08; do
  DUR=$(ffprobe -v quiet -show_entries format=duration \
    -of csv=p=0 /tmp/s${i}.aiff 2>/dev/null)
  printf "  구간 %s: %.1fs\n" "$i" "$DUR"
done

echo ""
echo "▶  구간 이어붙이기..."

# concat list 생성
cat > /tmp/concat.txt << 'EOF'
file '/tmp/s01.aiff'
file '/tmp/s02.aiff'
file '/tmp/s03.aiff'
file '/tmp/s04.aiff'
file '/tmp/s05.aiff'
file '/tmp/s06.aiff'
file '/tmp/s07.aiff'
file '/tmp/s08.aiff'
EOF

# 이어붙여서 m4a로 인코딩
ffmpeg -y -f concat -safe 0 -i /tmp/concat.txt \
  -c:a aac -b:a 128k \
  "$OUT_DIR/demo-tts.m4a" 2>/dev/null

TOTAL=$(ffprobe -v quiet -show_entries format=duration \
  -of csv=p=0 "$OUT_DIR/demo-tts.m4a" 2>/dev/null)

printf "\n✅  TTS 오디오 완성: %s/demo-tts.m4a  (총 %.1f초)\n" "$OUT_DIR" "$TOTAL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "다음 단계:"
echo "1. QuickTime으로 화면녹화 시작"
echo "2. 아래 브라우저 자동화 스크립트 실행 (별도 터미널):"
echo "   node scripts/demo/browser-nav.js"
echo "3. 녹화 완료 후:"
echo "   ffmpeg -i screen.mov -i docs/demo-tts.m4a \\"
echo "     -c:v libx264 -crf 22 -c:a copy \\"
echo "     -shortest docs/demo.mp4"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
