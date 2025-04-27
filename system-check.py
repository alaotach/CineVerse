import socket
import requests
import sys
import time
import os

def check_port_open(host, port):
    """Check if a port is open on the host"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    result = sock.connect_ex((host, port))
    sock.close()
    return result == 0

def check_service(url):
    """Check if a service is responding at the URL"""
    try:
        response = requests.get(url, timeout=5)
        return response.status_code == 200, response.text
    except requests.RequestException as e:
        return False, str(e)

def print_status(service, status, details=None):
    """Print status with color coding"""
    status_text = "✅ RUNNING" if status else "❌ NOT RUNNING"
    
    # Use color depending on status (Windows CMD doesn't support ANSI colors by default)
    if os.name != 'nt':
        status_text = f"\033[92m{status_text}\033[0m" if status else f"\033[91m{status_text}\033[0m"
        
    print(f"{service}: {status_text}")
    if details and not status:
        print(f"  Details: {details}")

def main():
    print("\n=== CookMyShow System Status Check ===\n")
    
    # Check backend server (C++)
    backend_port_open = check_port_open('localhost', 8080)
    backend_status, backend_details = check_service('http://localhost:8080/api/status')
    print_status("C++ Backend Server (Port 8080)", backend_port_open and backend_status, 
                 None if backend_port_open and backend_status else backend_details)
    
    # Check bridge server (Python)
    bridge_port_open = check_port_open('localhost', 5000)
    bridge_status, bridge_details = check_service('http://localhost:5000/status')
    print_status("Python Bridge (Port 5000)", bridge_port_open and bridge_status, 
                 None if bridge_port_open and bridge_status else bridge_details)
    
    # Check frontend server
    frontend_port_open = check_port_open('localhost', 3000)
    print_status("Frontend Development Server (Port 3000)", frontend_port_open)
    
    print("\n=== Recommendations ===\n")
    
    if not backend_port_open:
        print("- C++ Backend is not running. Start it with:")
        print("  cd backend && cinema_backend.exe --port=8080")
    elif not backend_status:
        print("- C++ Backend is running but not responding correctly. Check logs.")
        
    if not bridge_port_open:
        print("- Python Bridge is not running. Start it with:")
        print("  cd bridge && python app.py")
    elif not bridge_status:
        print("- Python Bridge is running but not responding correctly. Check logs.")
    
    if not frontend_port_open:
        print("- Frontend server is not running. Start it with:")
        print("  cd project && npm run dev")
        
    if backend_status and bridge_status:
        print("✅ All backend systems are running correctly.")
        print("   The application should be fully functional!")
    
    print("\nRun the full stack with: start-system.bat")

if __name__ == "__main__":
    main()
