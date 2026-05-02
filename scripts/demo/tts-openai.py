"""
trace.ai 데모 TTS 생성 — OpenAI TTS API
실행: python3 scripts/demo/tts-openai.py

출력: docs/demo-tts.mp3 (77초)

사전 준비:
  export OPENAI_API_KEY=sk-...
  pip3 install openai
"""

import os
import subprocess
from pathlib import Path
from openai import OpenAI

client = OpenAI()  # OPENAI_API_KEY 환경변수 자동 사용

# 목소리: nova (여성, 자연스러운 한국어), alloy, echo, fable, onyx, shimmer 중 선택
VOICE = "nova"
MODEL = "tts-1-hd"  # tts-1 (빠름) or tts-1-hd (고품질)

DOCS = Path(__file__).parent.parent.parent / "docs"
TMP  = Path("/tmp/tts_segments")
TMP.mkdir(exist_ok=True)

# ── 구간별 대사 ────────────────────────────────────────────────
SEGMENTS = [
    ("s01", "AI가 내린 결정 — 왜, 언제, 어떤 근거였는지, 지금 증명할 수 있으신가요?"),

    ("s02",
     "고객 응대, 대출 심사, 콘텐츠 모더레이션. "
     "AI의 모든 결정에는 감사 추적이 없고, 규제 대응도, 분쟁 대응도 불가능합니다. "
     "trace.ai는 모든 AI 의사결정에 변조 불가능한 영수증을 발급합니다."),

    ("s03", "세 단계면 끝납니다."),

    ("s04",
     "먼저 SDK를 설치합니다. copy 버튼 하나면 됩니다. "
     "워크스페이스 이름을 입력하면 API 키가 즉시 발급됩니다. 신용카드 불필요. "
     "코드는 이게 전부입니다."),

    ("s05",
     "Anthropic 클라이언트를 traceClaude로 감쌉니다. "
     "기존 코드는 변경 없습니다. "
     "이제 매 API 호출마다 DR-1 레코드가 자동 생성되고 블록체인에 앵커링됩니다."),

    ("s06",
     "앵커링이 완료되면 이렇게 출력됩니다. "
     "이게 실제 온체인 데이터입니다. "
     "Base Sepolia에 올라간 트랜잭션 — 누구든 이 UID를 easscan에 붙여넣으면 "
     "독립적으로 검증할 수 있습니다. trace.ai 서버 없이도."),

    ("s07",
     "검증 페이지에서는 두 가지 증거를 확인합니다. "
     "블록체인 앵커링 기록과 고객 서명 기록. "
     "두 서명이 일치할 때, 그 결정은 증거가 됩니다. "
     "판단은 여러분이 합니다. 우리는 증거만 제공합니다."),

    ("s08", "AI의 모든 결정을, 기록 위에. trace.ai"),
]

def generate_segment(name: str, text: str) -> Path:
    out = TMP / f"{name}.mp3"
    print(f"  생성 중: {name} ─ {text[:40]}…")
    with client.audio.speech.with_streaming_response.create(
        model=MODEL,
        voice=VOICE,
        input=text,
        response_format="mp3",
    ) as resp:
        resp.stream_to_file(out)
    return out

def get_duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)],
        capture_output=True, text=True,
    )
    return float(result.stdout.strip() or 0)

def main():
    if not os.environ.get("OPENAI_API_KEY"):
        raise SystemExit("❌ OPENAI_API_KEY 환경변수가 없습니다.\n   export OPENAI_API_KEY=sk-...")

    print(f"▶  OpenAI TTS 생성 중 (voice={VOICE}, model={MODEL})…\n")

    files = []
    for name, text in SEGMENTS:
        path = generate_segment(name, text)
        dur = get_duration(path)
        print(f"     {name}: {dur:.1f}s")
        files.append(path)

    # ffmpeg concat
    concat_list = TMP / "concat.txt"
    concat_list.write_text("\n".join(f"file '{f}'" for f in files))

    out = DOCS / "demo-tts.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_list),
        "-c:a", "libmp3lame", "-b:a", "128k",
        str(out),
    ], check=True, capture_output=True)

    total = get_duration(out)
    print(f"\n✅  완성: {out}  (총 {total:.1f}초)")
    print(f"\n합치기 명령어:")
    print(f"  ffmpeg -i screen.mov -i docs/demo-tts.mp3 \\")
    print(f"    -c:v libx264 -crf 22 -c:a copy \\")
    print(f"    -shortest docs/demo.mp4")

if __name__ == "__main__":
    main()
