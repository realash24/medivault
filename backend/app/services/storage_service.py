import logging
from typing import Optional

logger = logging.getLogger(__name__)


async def upload_file(
    file_path: str,
    content: bytes,
    content_type: str = "application/octet-stream",
) -> Optional[str]:
    """
    Upload a file to Supabase Storage.
    Returns the public URL on success, or None if Supabase is not configured.
    """
    from app.core.config import settings

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        logger.warning("Supabase not configured; skipping file upload for %s", file_path)
        return None

    try:
        from supabase import create_client, Client

        client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        bucket = settings.STORAGE_BUCKET

        # Upsert the file
        client.storage.from_(bucket).upload(
            file_path,
            content,
            file_options={"content-type": content_type, "upsert": "true"},
        )

        # Get public URL
        response = client.storage.from_(bucket).get_public_url(file_path)
        return response

    except Exception as exc:
        logger.error("File upload failed for %s: %s", file_path, exc)
        return None


async def delete_file(file_path: str) -> bool:
    """Delete a file from Supabase Storage. Returns True on success."""
    from app.core.config import settings

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return False

    try:
        from supabase import create_client

        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        client.storage.from_(settings.STORAGE_BUCKET).remove([file_path])
        return True
    except Exception as exc:
        logger.error("File delete failed for %s: %s", file_path, exc)
        return False
