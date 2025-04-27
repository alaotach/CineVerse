import socket
import requests
import time
import sys

def check_port(host, port):
    """Check if port is open on host"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    result = sock.connect_ex((host, port))
    sock.close()
    return result == 0

def check_api(url):
    """Check if API responds"""
    try:
        response = requests.get(url, timeout=5)
        return response.status_code, response.text
    except requests.RequestException as e:
        return None, str(e)

if __name__ == "__main__":
    host = "localhost"
    port = 8080
    api_url = f"http://{host}:{port}/api/status"
    bridge_port = 5000
    
    print(f"Diagnostic tool for CookMyShow backend connections")
    print(f"================================================")
    
    # Check if port is open
    print(f"\nChecking if port {port} is open on {host}...")
    if check_port(host, port):
        print(f"✓ Port {port} is OPEN on {host}")
    else:
        print(f"✗ Port {port} is CLOSED on {host}")
        print(f"  This suggests the backend server is not running.")
        print(f"  Please start the backend with: cd ../backend && cinema_backend.exe --port=8080")
    
    # Check API connection
    print(f"\nTrying to connect to API at {api_url}...")
    status_code, response = check_api(api_url)
    if status_code:
        print(f"✓ API responded with status code: {status_code}")
        print(f"  Response: {response[:100]}...")
    else:
        print(f"✗ Failed to connect to API: {response}")
    
    # Check if bridge port is available
    print(f"\nChecking if bridge port {bridge_port} is available...")
    if check_port(host, bridge_port):
        print(f"✗ Port {bridge_port} is already in use. Another instance may be running.")
    else:
        print(f"✓ Port {bridge_port} is available for the bridge.")
    
    print("\nSuggested actions:")
    if not check_port(host, port):
        print("1. Start the C++ backend server")
        print("2. Run the bridge with: python app.py")
    elif not status_code:
        print("1. Check if the C++ backend API is configured correctly")
        print("2. Verify the URL path is correct (/api/status)")
    else:
        print("1. The backend appears to be running correctly")
        print("2. Start the bridge with: python app.py")
    
    input("\nPress Enter to exit...")
