"""
Test suite for Expert Dashboard Equations Browser feature
Tests the /api/expert/mathematical-models endpoint and related functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://bodylogic.preview.emergentagent.com')

class TestExpertLogin:
    """Test expert authentication"""
    
    def test_expert_login_success(self):
        """Test expert login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/experts/login", json={
            "email": "admin@phicor.ai",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "expert" in data
        assert data["expert"]["email"] == "admin@phicor.ai"
        assert data["expert"]["name"] == "Dr. Super Admin"
        print(f"Login successful: {data['expert']['name']}")
        return data["access_token"]
    
    def test_expert_login_invalid_credentials(self):
        """Test expert login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/experts/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401


class TestMathematicalModelsEndpoint:
    """Test /api/expert/mathematical-models endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/experts/login", json={
            "email": "admin@phicor.ai",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_get_mathematical_models_basic(self, auth_token):
        """Test basic retrieval of mathematical models"""
        response = requests.get(
            f"{BASE_URL}/api/expert/mathematical-models",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "models" in data
        assert "total_models" in data
        assert "category_summary" in data
        assert "organ_system_summary" in data
        
        # Verify we have models
        assert data["total_models"] >= 967, f"Expected 967+ models, got {data['total_models']}"
        print(f"Total models: {data['total_models']}")
    
    def test_get_mathematical_models_with_limit(self, auth_token):
        """Test retrieval with limit parameter"""
        response = requests.get(
            f"{BASE_URL}/api/expert/mathematical-models?limit=10",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["models"]) <= 10
        print(f"Returned {len(data['models'])} models with limit=10")
    
    def test_get_mathematical_models_filter_by_organ(self, auth_token):
        """Test filtering by organ system"""
        response = requests.get(
            f"{BASE_URL}/api/expert/mathematical-models?organ_system=cardiovascular",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # All returned models should be cardiovascular
        for model in data["models"]:
            assert model["organ_system"] == "cardiovascular", f"Expected cardiovascular, got {model['organ_system']}"
        print(f"Filtered cardiovascular models: {len(data['models'])}")
    
    def test_get_mathematical_models_filter_by_category(self, auth_token):
        """Test filtering by category"""
        response = requests.get(
            f"{BASE_URL}/api/expert/mathematical-models?category=organ",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # All returned models should be organ category
        for model in data["models"]:
            assert model["category"] == "organ", f"Expected organ, got {model['category']}"
        print(f"Filtered organ category models: {len(data['models'])}")
    
    def test_get_mathematical_models_search(self, auth_token):
        """Test search functionality"""
        response = requests.get(
            f"{BASE_URL}/api/expert/mathematical-models?search=Windkessel",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should find Windkessel model
        assert len(data["models"]) > 0, "Should find at least one Windkessel model"
        
        # Verify search results contain Windkessel
        found_windkessel = False
        for model in data["models"]:
            if "windkessel" in model["name"].lower():
                found_windkessel = True
                break
        assert found_windkessel, "Should find Windkessel model in search results"
        print(f"Search 'Windkessel' returned {len(data['models'])} models")
    
    def test_model_structure(self, auth_token):
        """Test that models have correct structure"""
        response = requests.get(
            f"{BASE_URL}/api/expert/mathematical-models?limit=5",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        for model in data["models"]:
            # Required fields
            assert "id" in model, "Model should have id"
            assert "name" in model, "Model should have name"
            assert "category" in model, "Model should have category"
            assert "organ_system" in model, "Model should have organ_system"
            
            # Optional but expected fields
            if "equation" in model:
                assert isinstance(model["equation"], str)
            if "description" in model:
                assert isinstance(model["description"], str)
            if "variables" in model:
                # Variables can be array, dict, or string
                assert model["variables"] is not None
            if "evidence_sources" in model:
                assert isinstance(model["evidence_sources"], list)
            if "normal_values" in model:
                assert isinstance(model["normal_values"], dict)
            if "abnormal_conditions" in model:
                assert isinstance(model["abnormal_conditions"], list)
        
        print(f"Verified structure of {len(data['models'])} models")
    
    def test_category_summary(self, auth_token):
        """Test category summary in response"""
        response = requests.get(
            f"{BASE_URL}/api/expert/mathematical-models",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        category_summary = data["category_summary"]
        assert "organ" in category_summary or "disease" in category_summary or "food" in category_summary
        
        # Verify counts
        total_from_categories = sum(category_summary.values())
        assert total_from_categories > 0, "Category summary should have counts"
        print(f"Category summary: {category_summary}")
    
    def test_organ_system_summary(self, auth_token):
        """Test organ system summary in response"""
        response = requests.get(
            f"{BASE_URL}/api/expert/mathematical-models",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        organ_summary = data["organ_system_summary"]
        assert len(organ_summary) > 0, "Should have organ system summary"
        
        # Verify we have expected organ systems
        expected_organs = ["cardiovascular", "renal", "heart", "brain", "lungs"]
        found_organs = [org for org in expected_organs if org in organ_summary]
        assert len(found_organs) > 0, f"Should find some expected organs, got {list(organ_summary.keys())[:10]}"
        print(f"Organ systems found: {len(organ_summary)}")


class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self):
        """Test API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("Health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
