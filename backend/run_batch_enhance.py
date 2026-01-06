"""
Run batch enhancement to add mathematical models to diseases.
This runs in small batches to avoid timeouts.
"""
import asyncio
import os
import sys
import logging
from batch_enhancer import BatchEnhancer

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def main():
    llm_key = os.environ.get("EMERGENT_LLM_KEY")
    mongo_url = os.environ.get("MONGO_URL")
    
    if not llm_key or not mongo_url:
        logger.error("Missing EMERGENT_LLM_KEY or MONGO_URL")
        return
    
    enhancer = BatchEnhancer(llm_key, mongo_url)
    
    # Get current progress
    report = await enhancer.get_progress_report()
    logger.info(f"Current progress: {report}")
    
    # Run enhancement in batches (10 at a time to avoid timeouts)
    categories = ["cardiovascular", "respiratory", "gastrointestinal", "infectious", "neurological", "renal"]
    
    for category in categories:
        logger.info(f"Starting enhancement for {category}...")
        try:
            stats = await enhancer.run_batch(category=category, limit=20, delay=1.5)
            logger.info(f"Completed {category}: {stats}")
        except Exception as e:
            logger.error(f"Error enhancing {category}: {e}")
        
        # Check progress
        report = await enhancer.get_progress_report()
        logger.info(f"Progress: {report}")

if __name__ == "__main__":
    asyncio.run(main())
