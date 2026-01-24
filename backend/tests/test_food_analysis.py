"""
Test suite for Food Analysis and Food Browser features
Tests:
1. Food analysis for recipes (Lasagne, Chicken Tikka Masala)
2. Food analysis for simple foods (Banana, Salmon)
3. Food Browser API endpoint (/api/food/browse-all)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestFoodAnalysisAPI:
    """Test food analysis endpoint for various food types"""
    
    def test_analyze_lasagne(self):
        """Test that Lasagne analysis returns nutritional data (not zeros)"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze",
            json={"food_name": "Lasagne"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        
        # Check analysis structure
        analysis = data.get("analysis", {})
        food = analysis.get("food", {})
        
        assert food.get("name") is not None, "Food name should not be None"
        
        # Check nutrients exist and are not all zeros
        nutrients = food.get("nutrients", {})
        assert nutrients, "Nutrients should not be empty"
        
        # Check for energy/calories
        energy = nutrients.get("energy", {})
        if energy:
            assert energy.get("value", 0) > 0, f"Energy should be > 0, got {energy.get('value')}"
        
        # Check for protein
        protein = nutrients.get("protein", {})
        if protein:
            assert protein.get("value", 0) > 0, f"Protein should be > 0, got {protein.get('value')}"
        
        print(f"✓ Lasagne analysis: {food.get('name')} - Energy: {energy.get('value')} kcal, Protein: {protein.get('value')}g")
    
    def test_analyze_chicken_tikka_masala(self):
        """Test that Chicken Tikka Masala analysis returns nutritional data"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze",
            json={"food_name": "Chicken Tikka Masala"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        
        analysis = data.get("analysis", {})
        food = analysis.get("food", {})
        
        assert food.get("name") is not None, "Food name should not be None"
        
        nutrients = food.get("nutrients", {})
        assert nutrients, "Nutrients should not be empty"
        
        # Check for energy/calories
        energy = nutrients.get("energy", {})
        if energy:
            assert energy.get("value", 0) > 0, f"Energy should be > 0, got {energy.get('value')}"
        
        # Check for protein (chicken dish should have protein)
        protein = nutrients.get("protein", {})
        if protein:
            assert protein.get("value", 0) > 0, f"Protein should be > 0, got {protein.get('value')}"
        
        print(f"✓ Chicken Tikka Masala analysis: {food.get('name')} - Energy: {energy.get('value')} kcal, Protein: {protein.get('value')}g")
    
    def test_analyze_banana(self):
        """Test that Banana analysis returns correct nutritional data"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze",
            json={"food_name": "Banana"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        
        analysis = data.get("analysis", {})
        food = analysis.get("food", {})
        
        assert food.get("name") is not None, "Food name should not be None"
        assert "banana" in food.get("name", "").lower(), f"Expected 'banana' in name, got {food.get('name')}"
        
        nutrients = food.get("nutrients", {})
        assert nutrients, "Nutrients should not be empty"
        
        # Banana should have calories
        calories = nutrients.get("calories", {})
        if calories:
            assert calories.get("value", 0) > 0, f"Calories should be > 0, got {calories.get('value')}"
        
        # Banana should have potassium
        potassium = nutrients.get("potassium", {})
        if potassium:
            assert potassium.get("value", 0) > 0, f"Potassium should be > 0, got {potassium.get('value')}"
        
        print(f"✓ Banana analysis: {food.get('name')} - Calories: {calories.get('value')} kcal, Potassium: {potassium.get('value')}mg")
    
    def test_analyze_salmon(self):
        """Test that Salmon analysis returns correct nutritional data"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze",
            json={"food_name": "Salmon"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        
        analysis = data.get("analysis", {})
        food = analysis.get("food", {})
        
        assert food.get("name") is not None, "Food name should not be None"
        assert "salmon" in food.get("name", "").lower(), f"Expected 'salmon' in name, got {food.get('name')}"
        
        nutrients = food.get("nutrients", {})
        assert nutrients, "Nutrients should not be empty"
        
        # Salmon should have protein
        protein = nutrients.get("protein", {})
        if protein:
            assert protein.get("value", 0) > 0, f"Protein should be > 0, got {protein.get('value')}"
        
        # Salmon should have omega-3
        omega3 = nutrients.get("omega_3", {})
        if omega3:
            assert omega3.get("value", 0) > 0, f"Omega-3 should be > 0, got {omega3.get('value')}"
        
        print(f"✓ Salmon analysis: {food.get('name')} - Protein: {protein.get('value')}g, Omega-3: {omega3.get('value')}mg")


class TestFoodBrowserAPI:
    """Test Food Browser API endpoint"""
    
    def test_browse_all_foods_endpoint(self):
        """Test /api/food/browse-all returns categorized foods"""
        response = requests.get(f"{BASE_URL}/api/food/browse-all")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        
        # Check total foods count (should be 17,709)
        total_foods = data.get("total_foods", 0)
        assert total_foods > 17000, f"Expected > 17000 foods, got {total_foods}"
        
        print(f"✓ Total foods in database: {total_foods}")
    
    def test_browse_all_foods_has_categories(self):
        """Test that browse-all returns proper category structure"""
        response = requests.get(f"{BASE_URL}/api/food/browse-all")
        assert response.status_code == 200
        
        data = response.json()
        categories = data.get("categories", {})
        
        assert len(categories) > 0, "Should have at least one category"
        
        # Check expected categories exist
        expected_categories = ["Fruits", "Vegetables", "Meats", "Seafood", "Dairy", "Grains"]
        for cat in expected_categories:
            assert cat in categories, f"Expected category '{cat}' not found"
        
        print(f"✓ Found {len(categories)} categories: {list(categories.keys())}")
    
    def test_browse_all_foods_category_structure(self):
        """Test that each category has proper structure (icon, foods, count)"""
        response = requests.get(f"{BASE_URL}/api/food/browse-all")
        assert response.status_code == 200
        
        data = response.json()
        categories = data.get("categories", {})
        
        for cat_name, cat_data in categories.items():
            assert "icon" in cat_data, f"Category '{cat_name}' missing icon"
            assert "foods" in cat_data, f"Category '{cat_name}' missing foods"
            assert "count" in cat_data, f"Category '{cat_name}' missing count"
            
            # Verify count matches foods length
            assert cat_data["count"] == len(cat_data["foods"]), \
                f"Category '{cat_name}' count mismatch: {cat_data['count']} vs {len(cat_data['foods'])}"
            
            # Verify foods is a list
            assert isinstance(cat_data["foods"], list), f"Category '{cat_name}' foods should be a list"
        
        print("✓ All categories have proper structure (icon, foods, count)")
    
    def test_browse_all_foods_category_counts(self):
        """Test that category counts sum to total"""
        response = requests.get(f"{BASE_URL}/api/food/browse-all")
        assert response.status_code == 200
        
        data = response.json()
        categories = data.get("categories", {})
        total_foods = data.get("total_foods", 0)
        
        sum_counts = sum(cat_data["count"] for cat_data in categories.values())
        assert sum_counts == total_foods, f"Sum of category counts ({sum_counts}) != total_foods ({total_foods})"
        
        print(f"✓ Category counts sum correctly: {sum_counts} = {total_foods}")
    
    def test_browse_all_foods_has_icons(self):
        """Test that categories have emoji icons"""
        response = requests.get(f"{BASE_URL}/api/food/browse-all")
        assert response.status_code == 200
        
        data = response.json()
        categories = data.get("categories", {})
        
        expected_icons = {
            "Fruits": "🍎",
            "Vegetables": "🥬",
            "Meats": "🥩",
            "Seafood": "🐟",
            "Dairy": "🥛",
            "Grains": "🌾"
        }
        
        for cat, expected_icon in expected_icons.items():
            if cat in categories:
                actual_icon = categories[cat].get("icon", "")
                assert actual_icon == expected_icon, f"Category '{cat}' icon mismatch: expected {expected_icon}, got {actual_icon}"
        
        print("✓ Categories have correct emoji icons")


class TestFoodAnalysisEdgeCases:
    """Test edge cases for food analysis"""
    
    def test_analyze_empty_food_name(self):
        """Test that empty food name returns appropriate error"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze",
            json={"food_name": ""}
        )
        # Should return 400, 404, or 422 for validation error
        assert response.status_code in [400, 404, 422], f"Expected 400, 404, or 422 for empty food name, got {response.status_code}"
    
    def test_analyze_nonexistent_food(self):
        """Test analysis of a made-up food name"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze",
            json={"food_name": "XyzNonexistentFood123"}
        )
        # Should return 200 with success=false or 404
        if response.status_code == 200:
            data = response.json()
            # Either success=false or analysis with no data
            print(f"Response for nonexistent food: {data.get('success')}")
        else:
            assert response.status_code in [404, 400], f"Unexpected status code: {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
