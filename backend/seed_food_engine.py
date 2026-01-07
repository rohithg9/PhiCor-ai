"""
PhiCor Food Engine - Database Seeder
Seeds the nutrients database into MongoDB and creates indexes
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Import our comprehensive nutrients database
from data.nutrients_database import NUTRIENTS_DATABASE

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')


async def seed_nutrients_database():
    """Seed the nutrients collection with comprehensive nutrient data"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("=" * 60)
    print("PhiCor Food Engine - Database Seeder")
    print("=" * 60)
    
    # Create nutrients collection
    nutrients_collection = db.nutrients
    
    # Clear existing data (optional - comment out to preserve)
    existing = await nutrients_collection.count_documents({})
    if existing > 0:
        print(f"Found {existing} existing nutrients. Updating...")
    
    # Insert/update nutrients
    inserted = 0
    updated = 0
    
    for nutrient_id, nutrient_data in NUTRIENTS_DATABASE.items():
        # Add metadata
        nutrient_doc = {
            **nutrient_data,
            "updated_at": datetime.utcnow(),
            "source": "PhiCor Comprehensive Database v1.0"
        }
        
        # Upsert (insert or update)
        result = await nutrients_collection.update_one(
            {"id": nutrient_id},
            {"$set": nutrient_doc},
            upsert=True
        )
        
        if result.upserted_id:
            inserted += 1
        else:
            updated += 1
    
    print(f"✓ Nutrients: {inserted} inserted, {updated} updated")
    
    # Create indexes
    print("\nCreating indexes...")
    await nutrients_collection.create_index("id", unique=True)
    await nutrients_collection.create_index("category")
    await nutrients_collection.create_index("name")
    await nutrients_collection.create_index([("name", "text"), ("description", "text")])
    print("✓ Indexes created")
    
    # Verify
    total = await nutrients_collection.count_documents({})
    print(f"\n✓ Total nutrients in database: {total}")
    
    # Print categories
    categories = await nutrients_collection.distinct("category")
    print(f"\nCategories: {categories}")
    
    # Print sample
    sample = await nutrients_collection.find_one({"id": "potassium"}, {"_id": 0, "id": 1, "name": 1, "daily_value": 1, "disease_interactions": 1})
    print(f"\nSample (Potassium):")
    print(f"  ID: {sample['id']}")
    print(f"  Name: {sample['name']}")
    print(f"  Daily Value: {sample['daily_value']} mg")
    print(f"  Beneficial for: {len(sample['disease_interactions'].get('beneficial', []))} conditions")
    print(f"  Caution in: {len(sample['disease_interactions'].get('caution', []))} conditions")
    
    client.close()
    print("\n✓ Database seeding complete!")
    return total


async def create_foods_collection_schema():
    """Create the foods collection with proper schema and indexes"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    foods_collection = db.foods
    
    # Create indexes for foods
    print("\nSetting up foods collection...")
    await foods_collection.create_index("id", unique=True)
    await foods_collection.create_index("name")
    await foods_collection.create_index("category")
    await foods_collection.create_index("fdc_id")  # USDA FoodData Central ID
    await foods_collection.create_index([("name", "text"), ("description", "text"), ("aliases", "text")])
    
    # Check existing foods
    count = await foods_collection.count_documents({})
    print(f"✓ Foods collection ready. Current items: {count}")
    
    client.close()


async def main():
    """Main entry point"""
    # Seed nutrients
    await seed_nutrients_database()
    
    # Setup foods collection
    await create_foods_collection_schema()
    
    print("\n" + "=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print("1. Run `python3 usda_food_importer.py` to import USDA foods")
    print("2. Foods will be automatically linked to nutrients via nutrient IDs")
    print("3. Analysis will use database instead of AI for basic lookups")


if __name__ == "__main__":
    asyncio.run(main())
