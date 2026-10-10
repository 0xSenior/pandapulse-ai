"""Groq / OpenAI-compatible Cloud LLM Provider.

Enables zero-download execution locally and seamless deployment to Vercel/Render.
Supports high-performance streaming with models like llama-3.3-70b-versatile,
qwen-2.5-coder-32b, and deepseek-r1-distill-llama-70b.
"""

import json
import time
from collections.abc import AsyncIterator

import httpx

from app.core.config import settings
from app.domain.entities import LLMResponse
from app.domain.interfaces import ILLMProvider


class GroqProvider(ILLMProvider):
    """Integrates with Groq Cloud API for ultra-fast, zero-download LLM execution."""

    def __init__(
        self,
        api_key: str,
        model_name: str = "llama-3.3-70b-versatile",
        base_url: str = "https://api.groq.com/openai/v1",
        temperature: float = 0.65,
        max_tokens: int | None = None,
    ):
        self.api_key = api_key.strip()
        self.model_name = model_name
        self.base_url = base_url.rstrip("/")
        self.temperature = temperature
        self.max_tokens = max_tokens or getattr(settings, "LLM_MAX_TOKENS", 2048)
        self._client: httpx.AsyncClient | None = None

    def _get_client(self) -> httpx.AsyncClient:
        """Reuse persistent HTTP connection pool for optimal latency."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(60.0, connect=10.0),
                limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
            )
        return self._client

    async def aclose(self) -> None:
        """Close connection pool cleanly during application shutdown."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def is_available(self) -> bool:
        """Check if Groq API key is present and endpoint responds."""
        if not self.api_key:
            return False
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            client = self._get_client()
            res = await client.get(f"{self.base_url}/models", headers=headers)
            return res.status_code == 200
        except Exception:
            return False

    async def generate(
        self, prompt: str, system_prompt: str, model: str | None = None, api_key: str | None = None
    ) -> LLMResponse:
        """Execute non-streaming completion via Groq."""
        start_time = time.perf_counter()
        target_model = model or self.model_name
        effective_key = api_key.strip() if api_key else self.api_key
        headers = {
            "Authorization": f"Bearer {effective_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": target_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "stream": False,
        }

        try:
            client = self._get_client()
            res = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            if res.status_code == 429:
                return LLMResponse(
                    answer="⚠️ تم الوصول للحد الأقصى المؤقت لمعدل الطلبات في Groq Cloud (Rate Limit). يمكنك الانتظار بضع ثوانٍ أو إدخال مفتاحك الخاص مجاناً (BYOK) من أيقونة الإعدادات للاستمرار دون توقف.",
                    citations=[],
                    latency_ms=round((time.perf_counter() - start_time) * 1000, 2),
                    cached=False,
                    tokens_generated=10,
                    model_name=f"PandaPulse Neural Engine ({target_model})",
                )
            res.raise_for_status()
            data = res.json()
            answer = data["choices"][0]["message"]["content"]
            tokens_generated = data.get("usage", {}).get("completion_tokens", len(answer.split()))
            latency = (time.perf_counter() - start_time) * 1000

            return LLMResponse(
                answer=answer,
                citations=[],
                latency_ms=round(latency, 2),
                cached=False,
                tokens_generated=tokens_generated,
                model_name=f"PandaPulse Neural Engine ({target_model})",
            )
        except Exception as e:
            return LLMResponse(
                answer=f"⚠️ حدث خطأ أثناء معالجة الطلب في المحرك العصبي: {e!s}",
                citations=[],
                latency_ms=round((time.perf_counter() - start_time) * 1000, 2),
                cached=False,
                tokens_generated=10,
                model_name=f"PandaPulse Neural Engine ({target_model})",
            )

    async def generate_stream(
        self, prompt: str, system_prompt: str, model: str | None = None, api_key: str | None = None
    ) -> AsyncIterator[str]:
        """Stream generated tokens via Server-Sent Events from Groq."""
        target_model = model or self.model_name
        effective_key = api_key.strip() if api_key else self.api_key
        headers = {
            "Authorization": f"Bearer {effective_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": target_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "stream": True,
        }

        try:
            client = self._get_client()
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            ) as response:
                if response.status_code == 429:
                    yield "⚠️ تم الوصول للحد الأقصى المؤقت لمعدل الطلبات في Groq (Rate Limit). يمكنك الانتظار بضع ثوانٍ أو إدخال مفتاحك الخاص مجاناً (BYOK) من أيقونة الإعدادات للاستمرار دون توقف."
                    return
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    line_str = line.strip()
                    if line_str.startswith("data: "):
                        data_part = line_str[6:]
                        if data_part == "[DONE]":
                            break
                        try:
                            parsed = json.loads(data_part)
                            delta = parsed.get("choices", [{}])[0].get("delta", {})
                            content_piece = delta.get("content")
                            if content_piece:
                                yield content_piece
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            yield f"\n\n[خطأ في توليد الرد: {e!s}]"
