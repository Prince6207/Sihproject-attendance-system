import cv2
import base64
import requests
import time

# --- Configuration ---
API_BASE_URL = "http://127.0.0.1:8000"
NUM_IMAGES_TO_CAPTURE = 5  # Number of photos to take for signup/login
TIME_BETWEEN_CAPTURES = 0.5 # Seconds

def capture_images(num_images):
    """Captures a set number of images from the webcam and returns them as a list of base64 strings."""
    cap = cv2.VideoCapture(0)
    images_base64 = []
    
    print(f"Get ready! Capturing {num_images} images...")

    for i in range(num_images):
        print(f"Capturing image {i + 1}/{num_images}...")
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to capture image.")
            continue
        
        # --- NEW: Resize the image to a smaller resolution ---
        # This reduces the payload size significantly.
        small_frame = cv2.resize(frame, (640, 480))
        # --------------------------------------------------------
        
        # Display the frame to the user
        display_frame = frame.copy()
        cv2.putText(display_frame, f"SNAP {i+1}/{num_images}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.imshow("Capturing...", display_frame)
        cv2.waitKey(1) # Necessary to display the window

        # Encode the SMALLER frame to JPEG format, then to base64
        _, buffer = cv2.imencode('.jpg', small_frame)
        base64_image = base64.b64encode(buffer).decode('utf-8')
        images_base64.append(base64_image)
        
        time.sleep(TIME_BETWEEN_CAPTURES)

    cap.release()
    cv2.destroyAllWindows()
    return images_base64

def send_request(endpoint, username, images):
    """Sends a POST request to the specified API endpoint."""
    url = f"{API_BASE_URL}/{endpoint}"
    payload = {"username": username, "images": images}
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status() # Raises an exception for bad status codes (4xx or 5xx)
        print("✅ Success:")
        print(response.json())
    except requests.exceptions.HTTPError as err:
        print("❌ Error:")
        print(f"Status Code: {err.response.status_code}")
        # Check if the response has content before trying to parse it as JSON
        if err.response.text:
            print(f"Response: {err.response.json()}")
        else:
            print("Response: (empty)")
    except requests.exceptions.RequestException as e:
        print(f"❌ A connection error occurred: {e}")

if __name__ == "__main__":
    while True:
        print("\n--- API Test Client ---")
        choice = input("Enter '1' to Sign Up, '2' to Login, or '3' to Exit: ").strip()

        if choice in ["1", "2"]:
            username = input("Enter username: ").strip()
            if not username:
                print("Username cannot be empty.")
                continue
            
            images = capture_images(NUM_IMAGES_TO_CAPTURE)
            if not images:
                print("No images were captured. Aborting.")
                continue
            
            endpoint = "signup" if choice == "1" else "login"
            send_request(endpoint, username, images)
            
        elif choice == "3":
            print("👋 Goodbye!")
            break
        else:
            print("Invalid choice. Please enter 1, 2, or 3.")