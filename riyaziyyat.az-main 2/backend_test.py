import requests
import sys
import json
from datetime import datetime

class MathExamAPITester:
    def __init__(self, base_url="https://mathtest-login.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {response_data}")
                    elif isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:300]}...")

            return success, response.json() if response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_teacher_login(self):
        """Test teacher login"""
        success, response = self.run_test(
            "Teacher Login",
            "POST",
            "auth/login",
            200,
            data={"email": "Anar", "password": "Anar2025"}
        )
        return success and response.get('success') and response.get('userType') == 'teacher'

    def test_student_login(self):
        """Test student login"""
        success, response = self.run_test(
            "Student Login (correct credentials)",
            "POST", 
            "auth/login",
            200,
            data={"email": "nicat", "password": "1234"}
        )
        return success and response.get('success') and response.get('userType') == 'student'

    def test_invalid_login(self):
        """Test invalid login credentials"""
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login", 
            200,
            data={"email": "invalid", "password": "invalid"}
        )
        return success and not response.get('success')

    def test_disabled_student_login(self):
        """Test disabled student login"""
        success, response = self.run_test(
            "Disabled Student Login",
            "POST",
            "auth/login",
            200,
            data={"email": "fuad.aliyev", "password": "fuad123"}
        )
        return success and not response.get('success') and "deaktiv" in response.get('message', '')

    def test_data_initialization(self):
        """Test data initialization"""
        success, response = self.run_test(
            "Data Initialization",
            "POST",
            "init-data",
            200
        )
        return success

    def test_get_students(self):
        """Test getting all students"""
        success, response = self.run_test(
            "Get Students",
            "GET",
            "students",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} students:")
            for student in response:
                print(f"   - {student.get('name')} {student.get('surname')}: {student.get('email')}")
        return success and isinstance(response, list)

    def test_get_groups(self):
        """Test getting all groups"""
        success, response = self.run_test(
            "Get Groups",
            "GET", 
            "groups",
            200
        )
        return success and isinstance(response, list)

    def test_get_exams(self):
        """Test getting all exams"""
        success, response = self.run_test(
            "Get Exams",
            "GET",
            "exams", 
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} exams:")
            for exam in response:
                print(f"   - {exam.get('id')}: {exam.get('title')} ({exam.get('status')})")
        return success and isinstance(response, list)

    def test_get_exam_by_id(self):
        """Test getting specific exam"""
        success, response = self.run_test(
            "Get Exam by ID",
            "GET",
            "exams/eca01f76-a452-4c39-adfd-997e11a32285",
            200
        )
        return success and response.get('id') == 'eca01f76-a452-4c39-adfd-997e11a32285'

    def test_get_submissions(self):
        """Test getting all submissions"""
        success, response = self.run_test(
            "Get Submissions",
            "GET",
            "submissions",
            200
        )
        return success and isinstance(response, list)

    def test_get_exam_submissions(self):
        """Test getting submissions for specific exam"""
        success, response = self.run_test(
            "Get Exam Submissions",
            "GET",
            "submissions/exam/exam1",
            200
        )
        return success and isinstance(response, list)

    def test_get_cheating_reports(self):
        """Test getting cheating reports"""
        success, response = self.run_test(
            "Get Cheating Reports",
            "GET",
            "cheating-reports",
            200
        )
        return success and isinstance(response, list)

    def test_create_student(self):
        """Test creating a new student"""
        test_student = {
            "name": "Test",
            "surname": "Student",
            "email": "test.student@test.com",
            "pass": "test123",
            "group": "10(1,3)",
            "class": "10a",
            "parentContact": "+994501234999",
            "status": "active"
        }
        success, response = self.run_test(
            "Create Student",
            "POST",
            "students",
            200,
            data=test_student
        )
        return success, response.get('id') if success else None

    def test_create_exam(self):
        """Test creating a new exam"""
        test_exam = {
            "title": "Test Exam",
            "description": "Test exam description",
            "questionsCount": 1,
            "groups": ["10(1,3)"],
            "startTime": "2025-12-25T10:00:00",
            "endTime": "2025-12-25T12:00:00", 
            "pointsPerQuestion": 10,
            "status": "upcoming",
            "questions": [
                {
                    "question": "Test question?",
                    "type": "multiple-choice",
                    "options": ["A", "B", "C", "D"],
                    "correctAnswer": "A"
                }
            ]
        }
        success, response = self.run_test(
            "Create Exam",
            "POST",
            "exams",
            200,
            data=test_exam
        )
        return success, response.get('id') if success else None

    def test_create_submission(self):
        """Test creating a submission"""
        test_submission = {
            "examId": "exam1",
            "studentId": "1", 
            "answers": {"0": "x = -2, x = -3"},
            "submittedAt": datetime.now().isoformat(),
            "cheatingDetected": False
        }
        success, response = self.run_test(
            "Create Submission",
            "POST",
            "submissions",
            200,
            data=test_submission
        )
        return success, response.get('id') if success else None

def main():
    print("🚀 Starting Math Exam System API Tests")
    print("=" * 50)
    
    tester = MathExamAPITester()
    
    # Initialize data first
    print("\n📊 INITIALIZATION TESTS")
    tester.test_data_initialization()
    
    # Authentication tests
    print("\n🔐 AUTHENTICATION TESTS")
    tester.test_teacher_login()
    tester.test_student_login()
    tester.test_invalid_login()
    tester.test_disabled_student_login()
    
    # Data retrieval tests
    print("\n📋 DATA RETRIEVAL TESTS")
    tester.test_get_students()
    tester.test_get_groups()
    tester.test_get_exams()
    tester.test_get_exam_by_id()
    tester.test_get_submissions()
    tester.test_get_exam_submissions()
    tester.test_get_cheating_reports()
    
    # Data creation tests
    print("\n➕ DATA CREATION TESTS")
    student_success, student_id = tester.test_create_student()
    exam_success, exam_id = tester.test_create_exam()
    submission_success, submission_id = tester.test_create_submission()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Backend API is working correctly.")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed. Check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())