import sys
import asyncio
import edge_tts

VOICE_MAP = {
    "Antoine": "fr-CA-AntoineNeural",
    "Sylvie": "fr-CA-SylvieNeural",
    "Jean": "fr-CA-JeanNeural",
    "Vivienne": "fr-FR-VivienneMultilingualNeural",
    "Aoede": "fr-CA-SylvieNeural",
    "Fenrir": "fr-CA-AntoineNeural",
    "Kore": "fr-FR-VivienneMultilingualNeural"
}

async def run():
    voice_key = sys.argv[1] if len(sys.argv) > 1 else "Antoine"
    voice = VOICE_MAP.get(voice_key, "fr-CA-AntoineNeural")
    
    text = sys.stdin.read().strip()
    if not text:
        return
    text = text.replace("24/7", "en continu").replace("24 / 7", "en continu").replace(": ", ". ").replace(":", ". ")

    try:
        communicate = edge_tts.Communicate(text, voice)
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                try:
                    sys.stdout.buffer.write(chunk["data"])
                    sys.stdout.buffer.flush()
                except (BrokenPipeError, IOError):
                    break
    except Exception as e:
        sys.stderr.write(f"TTS Error: {e}\n")

if __name__ == "__main__":
    try:
        asyncio.run(run())
    except (KeyboardInterrupt, BrokenPipeError):
        pass
