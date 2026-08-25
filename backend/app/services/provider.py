import httpx
from app.core.config import settings


class OpenAICompatibleProvider:
    """Small adapter for chat-completions compatible hosted LLM endpoints."""

    @property
    def configured(self) -> bool:
        return bool(settings.openai_api_key)

    def answer(self, question: str, context: str) -> str:
        if not self.configured:
            raise RuntimeError("No LLM API key configured")
        payload = {"model": settings.openai_chat_model, "temperature": 0,
                   "messages": [{"role": "system", "content": "Answer only from the supplied archive context. If it is insufficient, say so. Do not invent facts or citations."}, {"role": "user", "content": f"Question: {question}\n\nArchive context:\n{context}"}]}
        response = httpx.post(f"{settings.openai_base_url.rstrip('/')}/chat/completions", headers={"Authorization": f"Bearer {settings.openai_api_key}"}, json=payload, timeout=25)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()


provider = OpenAICompatibleProvider()
