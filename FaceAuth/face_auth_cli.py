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

# --- Constants and Initial Setup ---
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

# --- Image Preprocessing Function ---
def preprocess_frame(frame):
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l_clahe = clahe.apply(l)
    lab_clahe = cv2.merge((l_clahe, a, b))
    processed_frame = cv2.cvtColor(lab_clahe, cv2.COLOR_LAB2BGR)
    return processed_frame

# --- Capture function for sign-up ---
def capture_multiple_images_for_signup(username, num_images=10):
    cap = cv2.VideoCapture(0)
    user_dir = os.path.join(DATASET_DIR, username)
    os.makedirs(user_dir, exist_ok=True)
    
    images_captured = 0
    while images_captured < num_images:
        ret, frame = cap.read()
        if not ret: break

        frame_height, frame_width, _ = frame.shape
        display_frame = frame.copy()
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = FACE_DETECTOR.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100))

        if len(faces) == 1:
            (x, y, w, h) = faces[0]
            is_size_ok = (w > frame_width * 0.25) and (w < frame_width * 0.6)
            face_center_x = x + w // 2
            frame_center_x = frame_width // 2
            is_centered = abs(face_center_x - frame_center_x) < (frame_width * 0.2)

            if is_size_ok and is_centered:
                images_captured += 1
                img_path = os.path.join(user_dir, f"{images_captured}.jpg")
                processed_frame = preprocess_frame(frame)
                cv2.imwrite(img_path, processed_frame)
                cv2.waitKey(500)
                continue
            cv2.rectangle(display_frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
        
        cv2.imshow("Sign Up - Capturing Images...", display_frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            shutil.rmtree(user_dir)
            return None

    if images_captured != num_images:
        shutil.rmtree(user_dir)
        return None

    cap.release()
    cv2.destroyAllWindows()
    return user_dir

# --- Capture function for login ---
def capture_multiple_images_for_login(num_images=10):
    cap = cv2.VideoCapture(0)
    temp_dir = tempfile.mkdtemp()
    captured_image_paths = []
    
    images_captured = 0
    start_time = time.time()
    timeout = 20
    
    while images_captured < num_images and (time.time() - start_time) < timeout:
        ret, frame = cap.read()
        if not ret: break

        frame_height, frame_width, _ = frame.shape
        display_frame = frame.copy()
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = FACE_DETECTOR.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100))

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
            else:
                cv2.rectangle(display_frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
        
        cv2.imshow("Login...", display_frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    if not captured_image_paths:
        cap.release()
        cv2.destroyAllWindows()
        return [], temp_dir

    cap.release()
    cv2.destroyAllWindows()
    return captured_image_paths, temp_dir

# --- Sign-up function with validation ---
def sign_up(username):
    if not username:
        return {"status": "error", "message": "Username cannot be empty"}

    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "rb") as f:
            db = pickle.load(f)
    else:
        db = {}

    if username in db:
        return {"status": "error", "message": f"User '{username}' already exists"}

    user_dir_path = capture_multiple_images_for_signup(username)
    if not user_dir_path:
        return {"status": "error", "message": "Sign-up failed: Image capture was cancelled or failed"}

    valid_images_found = 0
    image_files = sorted(os.listdir(user_dir_path), key=lambda x: int(os.path.splitext(x)[0]))

    for img_file in image_files:
        img_path = os.path.join(user_dir_path, img_file)
        try:
            _ = DeepFace.represent(img_path, model_name="Facenet", enforce_detection=True)
            valid_images_found += 1
        except ValueError:
            os.remove(img_path)

    if valid_images_found == 0:
        shutil.rmtree(user_dir_path)
        return {"status": "error", "message": "Sign-up failed: None of the captured images were clear enough"}

    db[username] = user_dir_path
    with open(DATA_FILE, "wb") as f:
        pickle.dump(db, f)
    
    return {"status": "ok", "action": "signup", "username": username, "images": valid_images_found}

# --- Login function ---
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
        print(json.dumps({"status": "error", "message": "Usage: python face_auth_cli.py <action> <username>"}))
        return
    
    action = sys.argv[1]
    username = sys.argv[2]

    if action == "login":
        result = login(username)
        print(json.dumps(result))
    elif action == "signup":
        result = sign_up(username)
        print(json.dumps(result))
    else:
        print(json.dumps({"status": "error", "message": "Unknown action. Use 'login' or 'signup'"}))

if __name__ == "__main__":
    run_from_cli()
