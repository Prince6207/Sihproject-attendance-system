#!/usr/bin/env python3
"""
Test script to verify the attendance system setup
"""

import requests
import json
import time
import sys

def test_express_backend():
    """Test Express backend endpoints"""
    print("Testing Express Backend (Port 5000)...")
    
    try:
        # Test health check
        response = requests.get("http://localhost:5000/", timeout=5)
        if response.status_code == 200:
            print("✅ Express Backend is running")
        else:
            print("❌ Express Backend health check failed")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Express Backend is not running: {e}")
        return False
    
    try:
        # Test QR generation
        response = requests.get("http://localhost:5000/api/qr/generate?sessionId=test123", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if 'qrImage' in data and 'qrData' in data:
                print("✅ QR generation endpoint working")
            else:
                print("❌ QR generation response format incorrect")
                return False
        else:
            print("❌ QR generation endpoint failed")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ QR generation test failed: {e}")
        return False
    
    return True

def test_fastapi_backend():
    """Test FastAPI backend endpoints"""
    print("\nTesting FastAPI Backend (Port 8001)...")
    
    try:
        # Test health check
        response = requests.get("http://localhost:8001/", timeout=5)
        if response.status_code == 200:
            print("✅ FastAPI Backend is running")
        else:
            print("❌ FastAPI Backend health check failed")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ FastAPI Backend is not running: {e}")
        return False
    
    return True

def test_react_frontend():
    """Test React frontend"""
    print("\nTesting React Frontend (Port 3000)...")
    
    try:
        response = requests.get("http://localhost:3000/", timeout=5)
        if response.status_code == 200:
            print("✅ React Frontend is running")
            return True
        else:
            print("❌ React Frontend is not accessible")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ React Frontend is not running: {e}")
        return False

def main():
    print("🔍 Testing Attendance System Setup...")
    print("=" * 50)
    
    results = []
    
    # Test all components
    results.append(("Express Backend", test_express_backend()))
    results.append(("FastAPI Backend", test_fastapi_backend()))
    results.append(("React Frontend", test_react_frontend()))
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    
    all_passed = True
    for component, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{component}: {status}")
        if not passed:
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All components are working correctly!")
        print("\nYou can now:")
        print("1. Open http://localhost:3000 in your browser")
        print("2. Scan the QR code with your camera")
        print("3. Complete face authentication")
    else:
        print("⚠️  Some components are not working.")
        print("\nPlease check:")
        print("1. All servers are running (use start_servers.bat or start_servers.sh)")
        print("2. No port conflicts (5000, 8001, 3000)")
        print("3. All dependencies are installed")
        print("4. Check the SETUP_INSTRUCTIONS.md file")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
