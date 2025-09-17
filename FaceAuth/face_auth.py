# import cv2
# import os
# import pickle
# import time
# import shutil
# import tempfile
# from deepface import DeepFace
# import numpy as np

# # --- Constants and Initial Setup ---
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DATA_FILE = os.path.join(BASE_DIR, "user_data.pkl")
# DATASET_DIR = os.path.join(BASE_DIR, "dataset")
# HAAR_CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
# os.makedirs(DATASET_DIR, exist_ok=True)


# # --- Pre-load Models for Efficiency ---
# print("🚀 Loading models, please wait...")
# try:
#     FACE_DETECTOR = cv2.CascadeClassifier(HAAR_CASCADE_PATH)
#     _ = DeepFace.represent(
#         img_path=np.zeros((100, 100, 3), dtype=np.uint8),
#         model_name="Facenet",
#         detector_backend='skip'
#     )
#     print("✅ Models loaded successfully.")
# except Exception as e:
#     print(f"❌ Critical Error: Could not load models. Exiting. Error: {e}")
#     exit()


# # --- Image Preprocessing Function ---
# def preprocess_frame(frame):
#     lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
#     l, a, b = cv2.split(lab)
#     clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
#     l_clahe = clahe.apply(l)
#     lab_clahe = cv2.merge((l_clahe, a, b))
#     processed_frame = cv2.cvtColor(lab_clahe, cv2.COLOR_LAB2BGR)
#     return processed_frame


# # --- Capture function for sign-up ---
# def capture_multiple_images_for_signup(username, num_images=10):
#     cap = cv2.VideoCapture(0)
#     user_dir = os.path.join(DATASET_DIR, username)
#     os.makedirs(user_dir, exist_ok=True)
    
#     print(f"\n📸 Get ready, {username}! We need {num_images} high-quality photos.")
#     print("Please position your face inside the box. It will turn green when ready.")

#     images_captured = 0
#     while images_captured < num_images:
#         ret, frame = cap.read()
#         if not ret: break

#         frame_height, frame_width, _ = frame.shape
#         display_frame = frame.copy()
#         gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#         faces = FACE_DETECTOR.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100))

#         feedback = "Position your face in the frame"
#         box_color = (0, 0, 255) # Red

#         if len(faces) > 1:
#             feedback = "Multiple faces detected. Only one person, please."
#         elif len(faces) == 1:
#             (x, y, w, h) = faces[0]
#             is_size_ok = (w > frame_width * 0.25) and (w < frame_width * 0.6)
#             face_center_x = x + w // 2
#             frame_center_x = frame_width // 2
#             is_centered = abs(face_center_x - frame_center_x) < (frame_width * 0.2)

#             if not is_size_ok: feedback = "Please move closer or further away."
#             elif not is_centered: feedback = "Please center your face."
#             else:
#                 feedback = "Position OK! Capturing..."
#                 box_color = (0, 255, 0) # Green
#                 images_captured += 1
#                 img_path = os.path.join(user_dir, f"{images_captured}.jpg")
#                 processed_frame = preprocess_frame(frame)
#                 cv2.imwrite(img_path, processed_frame)
#                 print(f"✅ Captured image {images_captured}/{num_images}")
#                 cv2.putText(display_frame, "CAPTURED!", (x, y + h + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
#                 cv2.imshow("Sign Up - Capturing Images...", display_frame)
#                 cv2.waitKey(500)
#                 continue
#             cv2.rectangle(display_frame, (x, y), (x + w, y + h), box_color, 2)
        
#         cv2.putText(display_frame, feedback, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, box_color, 2)
#         progress_text = f"Progress: {images_captured} / {num_images}"
#         cv2.putText(display_frame, progress_text, (20, frame_height - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
#         cv2.imshow("Sign Up - Capturing Images...", display_frame)

#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             print("✖️ Capture cancelled by user.")
#             shutil.rmtree(user_dir)
#             return None

#     if images_captured != num_images:
#         print("⚠️ Capture interrupted. Please try signing up again.")
#         shutil.rmtree(user_dir)
#         return None

#     print(f"✅ All {num_images} images captured!")
#     cap.release()
#     cv2.destroyAllWindows()
#     return user_dir

# # --- Capture function for login ---
# def capture_multiple_images_for_login(num_images=10):
#     cap = cv2.VideoCapture(0)
#     temp_dir = tempfile.mkdtemp()
#     captured_image_paths = []
    
#     print(f"\n📸 Authenticating... We will snap up to {num_images} photos.")
#     print("Position your face in the green box to proceed.")

#     images_captured = 0
#     start_time = time.time()
#     timeout = 20
    
#     while images_captured < num_images and (time.time() - start_time) < timeout:
#         ret, frame = cap.read()
#         if not ret: break

#         frame_height, frame_width, _ = frame.shape
#         display_frame = frame.copy()
#         gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#         faces = FACE_DETECTOR.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100))

#         if len(faces) == 1:
#             (x, y, w, h) = faces[0]
#             is_size_ok = (w > frame_width * 0.25) and (w < frame_width * 0.6)
#             face_center_x = x + w // 2
#             frame_center_x = frame_width // 2
#             is_centered = abs(face_center_x - frame_center_x) < (frame_width * 0.2)

#             if is_size_ok and is_centered:
#                 box_color = (0, 255, 0)
#                 images_captured += 1
#                 img_path = os.path.join(temp_dir, f"{images_captured}.jpg")
#                 processed_frame = preprocess_frame(frame)
#                 cv2.imwrite(img_path, processed_frame)
#                 captured_image_paths.append(img_path)
                
#                 cv2.putText(display_frame, f"SNAP {images_captured}/{num_images}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, box_color, 2)
#                 cv2.imshow("Login...", display_frame)
#                 cv2.waitKey(200)
#             else:
#                 cv2.rectangle(display_frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
        
#         cv2.imshow("Login...", display_frame)
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             print("✖️ Login cancelled by user.")
#             break
            
#     if not captured_image_paths:
#         print("⚠️ Timed out. Could not get a clear picture of your face.")

#     cap.release()
#     cv2.destroyAllWindows()
#     return captured_image_paths, temp_dir


# # --- Sign-up function with validation ---
# def sign_up(username):
#     if not username:
#         print("❌ Username cannot be empty.")
#         return

#     if os.path.exists(DATA_FILE):
#         with open(DATA_FILE, "rb") as f:
#             db = pickle.load(f)
#     else:
#         db = {}

#     if username in db:
#         print(f"🤷 User '{username}' already exists. Please choose another name.")
#         return

#     user_dir_path = capture_multiple_images_for_signup(username)
#     if not user_dir_path:
#         print("❌ Sign-up failed: Image capture was cancelled or failed.")
#         return

#     print("\n🧐 Verifying image quality with the recognition model...")
    
#     valid_images_found = 0
#     image_files = sorted(os.listdir(user_dir_path), key=lambda x: int(os.path.splitext(x)[0]))

#     for img_file in image_files:
#         img_path = os.path.join(user_dir_path, img_file)
#         try:
#             _ = DeepFace.represent(img_path, model_name="Facenet", enforce_detection=True)
#             valid_images_found += 1
#             print(f"✔️ Image '{img_file}' is high quality.")
#         except ValueError:
#             print(f"❌ Image '{img_file}' is not clear enough. Discarding.")
#             os.remove(img_path)

#     if valid_images_found == 0:
#         print("\n❌ Sign-up failed: None of the captured images were clear enough.")
#         print("Please try again in better lighting and with a clearer view of your face.")
#         shutil.rmtree(user_dir_path)
#         return

#     db[username] = user_dir_path
#     with open(DATA_FILE, "wb") as f:
#         pickle.dump(db, f)
#     print(f"\n✅ User '{username}' registered successfully with {valid_images_found} high-quality images!")


# # --- THE ONLY FUNCTION THAT CHANGED ---
# def login(username):
#     # This is the number of successful matches required to log in.
#     # You can increase this for higher security (e.g., 4 or 5).
#     MIN_MATCH_COUNT = 7

#     if not os.path.exists(DATA_FILE):
#         print("❌ No users registered. Please sign up first.")
#         return

#     with open(DATA_FILE, "rb") as f:
#         db = pickle.load(f)

#     if username not in db:
#         print(f"❌ User '{username}' not found.")
#         return

#     registered_user_dir = db[username]
#     try:
#         image_files = os.listdir(registered_user_dir)
#         if not image_files:
#              print(f"❌ Error: No valid images found for user '{username}'. Please sign up again.")
#              return
#         # We still use the first registered image as the reference.
#         registered_img_path = os.path.join(registered_user_dir, image_files[0])
#     except (FileNotFoundError, IndexError):
#         print(f"❌ Error: Registration data for '{username}' is corrupted. Please sign up again.")
#         return

#     print(f"👤 Welcome, {username}. Please look at the camera for verification.")
    
#     login_image_paths, temp_dir = capture_multiple_images_for_login()
    
#     if not login_image_paths:
#         print("❌ Login failed: No images were captured for verification.")
#         shutil.rmtree(temp_dir)
#         return

#     # --- NEW CONSENSUS LOGIC ---
#     successful_matches = 0
#     try:
#         # Loop through each captured login image to count matches
#         for i, login_img_path in enumerate(login_image_paths):
#             print(f"🔄 Verifying image {i + 1}/{len(login_image_paths)}...")
#             try:
#                 result = DeepFace.verify(
#                     img1_path=registered_img_path,
#                     img2_path=login_img_path,
#                     model_name="Facenet"
#                 )
#                 if result["verified"]:
#                     successful_matches += 1
#                     print(f"✔️ Match found! (Total: {successful_matches})")
#                 else:
#                     print("✖️ No match.")
#             except ValueError as e:
#                 print(f"⚠️ Could not process image {i + 1}. Skipping. Error: {e}")
#                 continue
        
#         # After checking all images, make the final decision
#         print("\n--- Verification Complete ---")
#         print(f"Found {successful_matches} successful matches out of {len(login_image_paths)} attempts.")
        
#         if successful_matches >= MIN_MATCH_COUNT:
#             print(f"✅ Login successful! (Required: {MIN_MATCH_COUNT})")
#         else:
#             print(f"❌ Login failed: Insufficient matches. (Required: {MIN_MATCH_COUNT})")
#         print("---------------------------")

#     finally:
#         # Clean up the temporary directory and its contents
#         print("🧹 Cleaning up temporary files...")
#         shutil.rmtree(temp_dir)

# # --- Main Execution Block ---
# if __name__ == "__main__":
#     while True:
#         print("\n--- Face Recognition System ---")
#         print("1. Sign Up (Register a new user)")
#         print("2. Login (Verify an existing user)")
#         print("3. Exit")
#         choice = input("Enter your choice (1/2/3): ").strip()

#         if choice == "1":
#             username = input("Enter a username to register: ").strip()
#             sign_up(username)
#         elif choice == "2":
#             username = input("Enter your username to log in: ").strip()
#             login(username)
#         elif choice == "3":
#             print("👋 Goodbye!")
#             break
#         else:
#             print("Invalid choice. Please enter 1, 2, or 3.")
import cv2
import os
import pickle
import time
import shutil
import tempfile
import json
import sys
from deepface import DeepFace
import numpy as np

# --- Constants ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "user_data.pkl")
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
HAAR_CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
os.makedirs(DATASET_DIR, exist_ok=True)

# --- Pre-load Models for Efficiency ---
try:
    FACE_DETECTOR = cv2.CascadeClassifier(HAAR_CASCADE_PATH)
    _ = DeepFace.represent(
        img_path=np.zeros((100, 100, 3), dtype=np.uint8),
        model_name="Facenet",
        detector_backend='skip'
    )
except Exception as e:
    print(json.dumps({"status": "error", "message": f"Could not load models: {e}"}))
    sys.exit(1)

# --- Image Preprocessing ---
def preprocess_frame(frame):
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l_clahe = clahe.apply(l)
    lab_clahe = cv2.merge((l_clahe, a, b))
    return cv2.cvtColor(lab_clahe, cv2.COLOR_LAB2BGR)

# --- Capture for Login ---
def capture_multiple_images_for_login(num_images=10):
    cap = cv2.VideoCapture(0)
    temp_dir = tempfile.mkdtemp()
    captured_image_paths = []
    
    images_captured = 0
    start_time = time.time()
    timeout = 20

    while images_captured < num_images and (time.time() - start_time) < timeout:
        ret, frame = cap.read()
        if not ret:
            break

        frame_height, frame_width, _ = frame.shape
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = FACE_DETECTOR.detectMultiScale(
            gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100)
        )

        if len(faces) == 1:
            (x, y, w, h) = faces[0]
            is_size_ok = (w > frame_width * 0.25) and (w < frame_width * 0.6)
            face_center_x = x + w // 2
            frame_center_x = frame_width // 2
            is_centered = abs(face_center_x - frame_center_x) < (frame_width * 0.2)

            if is_size_ok and is_centered:
                images_captured += 1
                img_path = os.path.join(temp_dir, f"{images_captured}.jpg")
                processed_frame = preprocess_frame(frame)
                cv2.imwrite(img_path, processed_frame)
                captured_image_paths.append(img_path)
                cv2.waitKey(200)
    cap.release()
    cv2.destroyAllWindows()
    return captured_image_paths, temp_dir

# --- Login ---
def login(username):
    MIN_MATCH_COUNT = 1  # required successful matches

    if not os.path.exists(DATA_FILE):
        return {"status": "error", "message": "No users registered"}

    with open(DATA_FILE, "rb") as f:
        db = pickle.load(f)

    if username not in db:
        return {"status": "error", "message": f"User '{username}' not found"}

    registered_user_dir = db[username]
    try:
        image_files = os.listdir(registered_user_dir)
        if not image_files:
            return {"status": "error", "message": f"No valid images for '{username}'"}
        registered_img_path = os.path.join(registered_user_dir, image_files[0])
    except Exception:
        return {"status": "error", "message": f"Corrupted registration for '{username}'"}

    login_image_paths, temp_dir = capture_multiple_images_for_login()
    if not login_image_paths:
        shutil.rmtree(temp_dir)
        return {"status": "error", "message": "No images captured for verification"}

    successful_matches = 0
    total_attempts = len(login_image_paths)

    try:
        for login_img_path in login_image_paths:
            try:
                result = DeepFace.verify(
                    img1_path=registered_img_path,
                    img2_path=login_img_path,
                    model_name="Facenet"
                )
                if result["verified"]:
                    successful_matches += 1
            except ValueError:
                continue
    finally:
        shutil.rmtree(temp_dir)

    return {
        "status": "ok",
        "action": "login",
        "username": username,
        "matches": successful_matches,
        "attempts": total_attempts,
        "success": successful_matches >= MIN_MATCH_COUNT
    }

# --- CLI Entrypoint ---
def run_from_cli():
    if len(sys.argv) < 3:
        print(json.dumps({"status": "error", "message": "Usage: python main.py login <username>"}))
        return
    
    action = sys.argv[1]
    username = sys.argv[2]

    if action == "login":
        result = login(username)
        print(json.dumps(result))
    else:
        print(json.dumps({"status": "error", "message": "Unknown action"}))

if __name__ == "__main__":
    run_from_cli()
