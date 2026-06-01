"""
trace.ai 데모 TTS — OpenAI gpt-4o-mini-tts / onyx (남성)
실행: python3 scripts/demo/tts-openai.py
출력: docs/demo-tts.mp3
"""

import os
import subprocess
from pathlib import Path
from openai import OpenAI

client = OpenAI()

MODEL = "gpt-4o-mini-tts"
VOICE = "onyx"          # 남성, 차분하고 신뢰감 있는 톤
DOCS  = Path(__file__).parent.parent.parent / "docs"
TMP   = Path("/tmp/tts_segments")
TMP.mkdir(exist_ok=True)

INSTRUCTIONS = (
    "당신은 한국의 AI 스타트업 데모 영상 나레이터입니다. "
    "차분하고 신뢰감 있는 남성 목소리로, 너무 빠르지 않게 또렷하게 읽어주세요. "
    "영어 단어(SDK, API, UID, EAS, DR 등)는 자연스럽게 영어 발음으로 읽고, "
    "문장 사이에 적절한 호흡을 넣어 버벅임 없이 읽어주세요."
)

# 발음 자연스럽게 정리한 구간별 대사
SEGMENTS = [
    ("s01",
     "AI가 내린 결정 — 왜, 언제, 어떤 근거였는지, 지금 증명할 수 있으신가요?"),

    ("s02",
     "고객 응대, 대출 심사, 콘텐츠 모더레이션. "
     "AI의 모든 결정에는 감사 추적이 없고, "
     "규제 대응도, 분쟁 대응도 불가능합니다. "
     "trace AI는 모든 AI 의사결정에 변조 불가능한 영수증을 발급합니다."),

    ("s03",
     "세 단계면 끝납니다."),

    ("s04",
     "먼저 SDK를 설치합니다. 복사 버튼 하나면 됩니다. "
     "워크스페이스 이름을 입력하면 API 키가 즉시 발급됩니다. 신용카드 불필요. "
     "코드는 이게 전부입니다."),

    ("s05",
     "Anthropic 클라이언트를 trace Claude로 감쌉니다. "
     "기존 코드는 변경 없습니다. "
     "이제 매 API 호출마다 DR 1 레코드가 자동 생성되고 블록체인에 앵커링됩니다."),

    ("s06",
     "앵커링이 완료되면 이렇게 출력됩니다. "
     "이게 실제 온체인 데이터입니다. "
     "베이스 세폴리아에 올라간 트랜잭션 — "
     "누구든 이 UID를 EAS 스캔에 붙여넣으면 독립적으로 검증할 수 있습니다. "
     "trace AI 서버 없이도."),

    ("s07",
     "검증 페이지에서는 두 가지 증거를 확인합니다. "
     "블록체인 앵커링 기록과, 고객 서명 기록. "
     "두 서명이 일치할 때, 그 결정은 증거가 됩니다. "
     "판단은 여러분이 합니다. 우리는 증거만 제공합니다."),

    ("s08",
     "AI의 모든 결정을, 기록 위에. trace AI."),
]


def generate(name: str, text: str) -> Path:
    out = TMP / f"{name}.mp3"
    print(f"  {name}: {text[:45]}…")
    with client.audio.speech.with_streaming_response.create(
        model=MODEL,
        voice=VOICE,
        input=text,
        instructions=INSTRUCTIONS,
        response_format="mp3",
    ) as resp:
        resp.stream_to_file(out)
    return out


def duration(path: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)],
        capture_output=True, text=True,
    )
    return float(r.stdout.strip() or 0)


def main():
    if not os.environ.get("OPENAI_API_KEY"):
        raise SystemExit("❌ OPENAI_API_KEY 없음.  export OPENAI_API_KEY=sk-...")

    print(f"▶  모델: {MODEL}  /  목소리: {VOICE}\n")

    total_s = 0.0
    paths = []
    for name, text in SEGMENTS:
        p = generate(name, text)
        d = duration(p)
        total_s += d
        print(f"     → {d:.1f}s")
        paths.append(p)

    concat = TMP / "concat.txt"
    concat.write_text("\n".join(f"file '{p}'" for p in paths))

    out = DOCS / "demo-tts.mp3"
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0",
         "-i", str(concat), "-c:a", "libmp3lame", "-b:a", "192k", str(out)],
        check=True, capture_output=True,
    )

    total = duration(out)
    print(f"\n✅  docs/demo-tts.mp3  ({total:.1f}초)")
    print("\n합치기:")
    print("  ffmpeg -i screen.mov -i docs/demo-tts.mp3 \\")
    print("    -c:v libx264 -crf 22 -c:a copy -shortest docs/demo.mp4")


if __name__ == "__main__":
    main()
