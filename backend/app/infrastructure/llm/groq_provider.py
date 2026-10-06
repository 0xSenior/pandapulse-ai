"""Groq / OpenAI-compatible Cloud LLM Provider.

Enables zero-download execution locally and seamless deployment to Vercel/Render.
Supports high-performance streaming with models like llama-3.3-70b-versatile,
qwen-2.5-coder-32b, and deepseek-r1-distill-llama-70b.
"""

import json
import time
from typing import AsyncIterator, Optional
import httpx
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
    ):
        self.api_key = api_key.strip()
        self.model_name = model_name
        self.base_url = base_url.rstrip("/")
        self.temperature = temperature

    async def is_available(self) -> bool:
        """Check if Groq API key is present and endpoint responds."""
        if not self.api_key:
            return False
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/models", headers=headers)
                return res.status_code == 200
        except Exception:
            return False

    async def generate(self, prompt: str, system_prompt: str) -> LLMResponse:
        """Execute non-streaming completion via Groq."""
        start_time = time.perf_counter()
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": self.temperature,
            "max_tokens": 700,
            "stream": False,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                if res.status_code == 429:
                    err_json = res.json().get("error", {}).get("message", "Rate limit exceeded")
                    return LLMResponse(
                        answer=f"⚠️ تجاوزت حصة الاستخدام المؤقتة لـ Groq: {err_json}. يرجى الانتظار ثوانٍ قليلة.",
                        citations=[],
                        latency_ms=round((time.perf_counter() - start_time) * 1000, 2),
                        cached=False,
                        tokens_generated=10,
                        model_name=f"{self.model_name} (Groq-Cloud)",
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
                    model_name=f"{self.model_name} (Groq-Cloud)",
                )
        except Exception as e:
            return LLMResponse(
                answer=f"⚠️ خطأ في الاتصال بسحابة Groq: {str(e)}",
                citations=[],
                latency_ms=round((time.perf_counter() - start_time) * 1000, 2),
                cached=False,
                tokens_generated=10,
                model_name=f"{self.model_name} (Groq-Cloud)",
            )

    async def generate_stream(self, prompt: str, system_prompt: str) -> AsyncIterator[str]:
        """Stream generated tokens via Server-Sent Events from Groq."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": self.temperature,
            "max_tokens": 700,
            "stream": True,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                ) as response:
                    if response.status_code == 429:
                        yield "⚠️ تجاوزت حصة الاستخدام المؤقتة لموديل Groq المجاني (Rate Limit). يرجى الانتظار ثوانٍ وإعادة المحاولة."
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
                                chunk = json.loads(data_part)
                                delta = chunk.get("choices", [{}])[0].get("delta", {})
                                token = delta.get("content", "")
                                if token:
                                    yield token
                            except json.JSONDecodeError:
                                continue
        except Exception as e:
            yield f"⚠️ خطأ أثناء تدفق البيانات من Groq: {str(e)}"
