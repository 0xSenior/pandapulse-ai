"""Ollama LLM Provider with asynchronous streaming.

Integrates directly with local Ollama server (Llama 3 / Qwen) for genuine neural reasoning.
No hardcoded answers: the model dynamically generates all responses based on RAG context and system prompt.
"""

import json
import re
import time
from collections.abc import AsyncIterator

import httpx

from app.domain.entities import LLMResponse
from app.domain.interfaces import ILLMProvider


class OllamaProvider(ILLMProvider):
    """Integrates with local Ollama server for dynamic neural text generation."""

    def __init__(
        self,
        base_url: str = "http://localhost:11434",
        model_name: str = "qwen2.5-coder:1.5b",
        temperature: float = 0.65,
    ):
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name
        self.temperature = temperature

    async def is_available(self) -> bool:
        """Check if Ollama daemon is reachable and responding."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    async def _check_model_exists(self) -> bool:
        """Verify if the requested model has been pulled into Ollama."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    models = res.json().get("models", [])
                    return any(m.get("name", "").startswith(self.model_name.split(":")[0]) for m in models)
        except Exception:
            pass
        return False

    def _sanitize_output(self, text: str) -> str:
        """Strip accidental Cyrillic or CJK linguistic bleed from small local models."""
        if not text:
            return text
        text = re.sub(r'[\u0400-\u04FF]+', '', text)
        text = re.sub(r'[\u4E00-\u9FFF]+', '', text)
        return text

    async def generate(self, prompt: str, system_prompt: str) -> LLMResponse:
        """Generate response dynamically using local Ollama model."""
        start_time = time.perf_counter()

        has_ollama = await self.is_available()
        if not has_ollama:
            msg = (
                "⚠️ **تنبيه:** تعذر الاتصال بمحرك الذكاء الاصطناعي المحلي.\n\n"
                "يرجى التأكد من تشغيل المحرك المحلي أو إدخال مفتاح الذكاء الاصطناعي السحابي في إعدادات البيئة."
            )
            return LLMResponse(
                answer=msg,
                citations=[],
                latency_ms=round((time.perf_counter() - start_time) * 1000, 2),
                cached=False,
                tokens_generated=len(msg.split()),
                model_name=self.model_name,
            )

        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "keep_alive": "60m",
            "options": {
                "temperature": self.temperature,
                "top_p": 0.9,
                "num_predict": 1024,
                "num_ctx": 2048,
                "num_thread": 8,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    raw_answer = data.get("response", "")
                    answer = self._sanitize_output(raw_answer)
                    latency = (time.perf_counter() - start_time) * 1000
                    return LLMResponse(
                        answer=answer,
                        citations=[],
                        latency_ms=round(latency, 2),
                        cached=False,
                        tokens_generated=data.get("eval_count", len(answer.split())),
                        model_name=self.model_name,
                    )
        except Exception as e:
            err_msg = f"⚠️ حدث خطأ أثناء التوليد من نموذج Ollama: {e!s}"
            return LLMResponse(
                answer=err_msg,
                citations=[],
                latency_ms=round((time.perf_counter() - start_time) * 1000, 2),
                cached=False,
                tokens_generated=len(err_msg.split()),
                model_name=self.model_name,
            )

    async def generate_stream(self, prompt: str, system_prompt: str) -> AsyncIterator[str]:
        """Stream tokens in real-time from Ollama."""
        has_ollama = await self.is_available()
        if not has_ollama:
            yield "⚠️ **تنبيه:** المحرك العصبي غير متصل حالياً. يرجى تفعيل مفتاح الربط السحابي في الإعدادات أو تشغيل المحرك المحلي."
            return

        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "system": system_prompt,
            "stream": True,
            "keep_alive": "60m",
            "options": {
                "temperature": self.temperature,
                "top_p": 0.9,
                "num_predict": 1024,
                "num_ctx": 2048,
                "num_thread": 8,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", f"{self.base_url}/api/generate", json=payload) as response:
                    if response.status_code == 200:
                        async for line in response.aiter_lines():
                            if not line:
                                continue
                            try:
                                chunk_data = json.loads(line)
                                token = chunk_data.get("response", "")
                                if token:
                                    sanitized_token = self._sanitize_output(token)
                                    if sanitized_token:
                                        yield sanitized_token
                                if chunk_data.get("done", False):
                                    break
                            except json.JSONDecodeError:
                                continue
                    else:
                        yield f"⚠️ خطأ من Ollama (كود {response.status_code})"
        except Exception as e:
            yield f"⚠️ انقطع الاتصال بـ Ollama: {e!s}"
