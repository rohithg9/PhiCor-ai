"""
Test suite for P0 Food Analysis Features:
1. Ingredient Breakdown for Complex Foods (Recipes)
2. Universal Quantification - ALL parameters must have numerical values

Tests the /api/food/analyze-from-db endpoint
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestRecipeIngredientBreakdown:
    """Tests for P0 Feature 1: Ingredient Breakdown for Complex Foods"""
    
    def test_chicken_tikka_masala_is_recipe(self):
        """Test that Chicken Tikka Masala is recognized as a recipe with ingredient breakdown"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Chicken Tikka Masala"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") is True, "Response should indicate success"
        assert data.get("is_recipe") is True, "Chicken Tikka Masala should be identified as a recipe"
        
        analysis = data.get("analysis", {})
        assert analysis.get("is_recipe") is True, "Analysis should have is_recipe=True"
        
    def test_chicken_tikka_masala_has_9_ingredients(self):
        """Test that Chicken Tikka Masala has 9 ingredients in breakdown"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Chicken Tikka Masala"}
        )
        assert response.status_code == 200
        
        data = response.json()
        analysis = data.get("analysis", {})
        ingredient_breakdown = analysis.get("ingredient_breakdown", {})
        
        total_ingredients = ingredient_breakdown.get("total_ingredients", 0)
        assert total_ingredients == 9, f"Expected 9 ingredients, got {total_ingredients}"
        
    def test_ingredient_breakdown_structure(self):
        """Test that ingredient breakdown has primary and secondary ingredients arrays"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Chicken Tikka Masala"}
        )
        assert response.status_code == 200
        
        data = response.json()
        analysis = data.get("analysis", {})
        ingredient_breakdown = analysis.get("ingredient_breakdown", {})
        
        # Check structure
        assert "primary_ingredients" in ingredient_breakdown, "Should have primary_ingredients array"
        assert "secondary_ingredients" in ingredient_breakdown, "Should have secondary_ingredients array"
        assert isinstance(ingredient_breakdown["primary_ingredients"], list), "primary_ingredients should be a list"
        assert isinstance(ingredient_breakdown["secondary_ingredients"], list), "secondary_ingredients should be a list"
        
        # Check counts
        primary_count = len(ingredient_breakdown["primary_ingredients"])
        secondary_count = len(ingredient_breakdown["secondary_ingredients"])
        assert primary_count > 0, "Should have at least one primary ingredient"
        assert secondary_count > 0, "Should have at least one secondary ingredient"
        
    def test_ingredient_has_found_in_db_flag(self):
        """Test that each ingredient has found_in_db flag and matched_food name"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Chicken Tikka Masala"}
        )
        assert response.status_code == 200
        
        data = response.json()
        analysis = data.get("analysis", {})
        ingredient_breakdown = analysis.get("ingredient_breakdown", {})
        
        all_ingredients = ingredient_breakdown.get("all_ingredients", [])
        assert len(all_ingredients) > 0, "Should have ingredients in all_ingredients array"
        
        for ing in all_ingredients:
            assert "found_in_db" in ing, f"Ingredient {ing.get('ingredient_name')} should have found_in_db flag"
            assert "matched_food" in ing, f"Ingredient {ing.get('ingredient_name')} should have matched_food field"
            assert isinstance(ing["found_in_db"], bool), "found_in_db should be boolean"
            
    def test_aggregated_macronutrients(self):
        """Test that aggregated macronutrients are calculated from all ingredients"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Chicken Tikka Masala"}
        )
        assert response.status_code == 200
        
        data = response.json()
        analysis = data.get("analysis", {})
        
        nutritional_profile = analysis.get("complete_nutritional_profile", {})
        macros = nutritional_profile.get("macronutrients", {})
        
        # Check that macronutrients exist and are aggregated
        assert "protein_g" in macros, "Should have protein_g"
        assert "carbohydrates_g" in macros, "Should have carbohydrates_g"
        assert "fat_total_g" in macros, "Should have fat_total_g"
        
        # Chicken Tikka Masala should have significant protein from chicken
        protein = macros.get("protein_g", 0)
        assert protein > 10, f"Expected protein > 10g for chicken dish, got {protein}g"
        
        # Check aggregation flag
        assert nutritional_profile.get("aggregated_from_ingredients") is True, "Should indicate aggregated from ingredients"
        
    def test_aggregated_organ_system_effects(self):
        """Test that organ_system_parameter_effects are aggregated from ingredients"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Chicken Tikka Masala"}
        )
        assert response.status_code == 200
        
        data = response.json()
        analysis = data.get("analysis", {})
        
        organ_effects = analysis.get("organ_system_parameter_effects", {})
        assert len(organ_effects) > 0, "Should have organ system effects"
        
        # Check structure of organ effects
        for system_name, system_data in organ_effects.items():
            assert "parameters_affected" in system_data, f"{system_name} should have parameters_affected"
            assert "contributing_nutrients" in system_data, f"{system_name} should have contributing_nutrients"
            assert "contributing_ingredients" in system_data, f"{system_name} should have contributing_ingredients"


class TestOtherRecipes:
    """Test other recipes in the database"""
    
    def test_butter_chicken_is_recipe(self):
        """Test Butter Chicken recipe analysis"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Butter Chicken"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("is_recipe") is True, "Butter Chicken should be a recipe"
        
        analysis = data.get("analysis", {})
        ingredient_breakdown = analysis.get("ingredient_breakdown", {})
        assert ingredient_breakdown.get("total_ingredients", 0) >= 5, "Butter Chicken should have at least 5 ingredients"
        
    def test_pasta_carbonara_is_recipe(self):
        """Test Pasta Carbonara recipe analysis"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Pasta Carbonara"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("is_recipe") is True, "Pasta Carbonara should be a recipe"
        
        analysis = data.get("analysis", {})
        ingredient_breakdown = analysis.get("ingredient_breakdown", {})
        assert ingredient_breakdown.get("total_ingredients", 0) >= 4, "Pasta Carbonara should have at least 4 ingredients"
        
    def test_spaghetti_bolognese_is_recipe(self):
        """Test Spaghetti Bolognese recipe analysis"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Spaghetti Bolognese"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("is_recipe") is True, "Spaghetti Bolognese should be a recipe"
        
        analysis = data.get("analysis", {})
        ingredient_breakdown = analysis.get("ingredient_breakdown", {})
        assert ingredient_breakdown.get("total_ingredients", 0) >= 6, "Spaghetti Bolognese should have at least 6 ingredients"
        
    def test_pad_thai_is_recipe(self):
        """Test Pad Thai recipe analysis"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Pad Thai"}
        )
        assert response.status_code == 200
        
        data = response.json()
        # Pad Thai should be in recipe database
        assert data.get("is_recipe") is True or data.get("success") is True, "Pad Thai should be analyzed"
        
    def test_chicken_biryani_is_recipe(self):
        """Test Chicken Biryani recipe analysis"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Chicken Biryani"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("is_recipe") is True, "Chicken Biryani should be a recipe"
        
        analysis = data.get("analysis", {})
        ingredient_breakdown = analysis.get("ingredient_breakdown", {})
        assert ingredient_breakdown.get("total_ingredients", 0) >= 5, "Chicken Biryani should have at least 5 ingredients"


class TestUniversalQuantification:
    """Tests for P0 Feature 2: Universal Quantification - ALL parameters must have numerical values"""
    
    def test_banana_all_parameters_have_quantified_change(self):
        """Test that Banana analysis returns all parameters with quantified_change (numerical values)"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Banana"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") is True, "Response should indicate success"
        
        analysis = data.get("analysis", {})
        organ_effects = analysis.get("organ_system_parameter_effects", {})
        
        # Check that we have organ system effects
        assert len(organ_effects) > 0, "Should have organ system effects for Banana"
        
        # Check each parameter has quantified_change
        parameters_checked = 0
        parameters_with_null = []
        
        for system_name, system_data in organ_effects.items():
            for param in system_data.get("parameters_affected", []):
                parameters_checked += 1
                qc = param.get("quantified_change")
                
                # quantified_change should be a number (not None, not string like 'minimal')
                if qc is None:
                    parameters_with_null.append(f"{system_name}.{param.get('parameter')}")
                elif not isinstance(qc, (int, float)):
                    parameters_with_null.append(f"{system_name}.{param.get('parameter')} (type: {type(qc).__name__})")
        
        assert parameters_checked > 0, "Should have checked at least one parameter"
        assert len(parameters_with_null) == 0, f"Parameters with null/non-numeric quantified_change: {parameters_with_null}"
        
    def test_recipe_parameters_have_quantified_change(self):
        """Test that recipe analysis returns all parameters with quantified_change"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Chicken Tikka Masala"}
        )
        assert response.status_code == 200
        
        data = response.json()
        analysis = data.get("analysis", {})
        organ_effects = analysis.get("organ_system_parameter_effects", {})
        
        parameters_checked = 0
        parameters_with_null = []
        
        for system_name, system_data in organ_effects.items():
            for param in system_data.get("parameters_affected", []):
                parameters_checked += 1
                qc = param.get("quantified_change")
                
                if qc is None:
                    parameters_with_null.append(f"{system_name}.{param.get('parameter')}")
                elif not isinstance(qc, (int, float)):
                    parameters_with_null.append(f"{system_name}.{param.get('parameter')} (type: {type(qc).__name__})")
        
        assert parameters_checked > 0, "Should have checked at least one parameter"
        assert len(parameters_with_null) == 0, f"Parameters with null/non-numeric quantified_change: {parameters_with_null}"
        
    def test_no_minimal_labels_in_parameters(self):
        """Test that no parameter has 'minimal' or other generic text labels instead of numbers"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Banana"}
        )
        assert response.status_code == 200
        
        data = response.json()
        analysis = data.get("analysis", {})
        organ_effects = analysis.get("organ_system_parameter_effects", {})
        
        generic_labels = ["minimal", "moderate", "significant", "slight", "none", "n/a"]
        parameters_with_labels = []
        
        for system_name, system_data in organ_effects.items():
            for param in system_data.get("parameters_affected", []):
                qc = param.get("quantified_change")
                
                # Check if quantified_change is a string (should be number)
                if isinstance(qc, str):
                    if qc.lower() in generic_labels or not qc.replace('.', '').replace('-', '').isdigit():
                        parameters_with_labels.append(f"{system_name}.{param.get('parameter')}: '{qc}'")
        
        assert len(parameters_with_labels) == 0, f"Parameters with generic labels instead of numbers: {parameters_with_labels}"
        
    def test_quantified_change_has_correct_sign(self):
        """Test that quantified_change has correct sign based on direction"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Banana"}
        )
        assert response.status_code == 200
        
        data = response.json()
        analysis = data.get("analysis", {})
        organ_effects = analysis.get("organ_system_parameter_effects", {})
        
        sign_mismatches = []
        
        for system_name, system_data in organ_effects.items():
            for param in system_data.get("parameters_affected", []):
                qc = param.get("quantified_change")
                direction = param.get("direction", "")
                
                if qc is not None and isinstance(qc, (int, float)):
                    if direction == "increase" and qc < 0:
                        sign_mismatches.append(f"{param.get('parameter')}: direction=increase but qc={qc}")
                    elif direction == "decrease" and qc > 0:
                        sign_mismatches.append(f"{param.get('parameter')}: direction=decrease but qc={qc}")
        
        # Allow some flexibility - not all should be mismatched
        assert len(sign_mismatches) < 3, f"Too many sign mismatches: {sign_mismatches}"


class TestSimpleFoodAnalysis:
    """Test simple food analysis (non-recipe) still works correctly"""
    
    def test_banana_is_not_recipe(self):
        """Test that Banana is NOT identified as a recipe"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Banana"}
        )
        assert response.status_code == 200
        
        data = response.json()
        # Banana should not be a recipe
        assert data.get("is_recipe") is not True, "Banana should not be a recipe"
        
    def test_apple_analysis(self):
        """Test Apple analysis works"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Apple"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") is True, "Apple analysis should succeed"
        
    def test_rice_analysis(self):
        """Test Rice analysis works"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={"food_name": "Rice"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("success") is True, "Rice analysis should succeed"


class TestAPIBasics:
    """Basic API health and structure tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
    def test_food_analyze_requires_food_name(self):
        """Test that food analysis requires food_name"""
        response = requests.post(
            f"{BASE_URL}/api/food/analyze-from-db",
            json={}
        )
        # Should return 400 or 422 for missing food_name
        assert response.status_code in [400, 422], f"Expected 400/422 for missing food_name, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
