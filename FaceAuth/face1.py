# import cv2
# import os
# import pickle
# import time
# import shutil
# import tempfile
# from deepface import DeepFace
# import numpy as np
# import dlib
# from scipy.spatial import distance

# # --- Constants and Initial Setup ---
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DATA_FILE = os.path.join(BASE_DIR, "user_data.pkl")
# DATASET_DIR = os.path.join(BASE_DIR, "dataset")
# HAAR_CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
# PREDICTOR_PATH = os.path.join(BASE_DIR, "shape_predictor_68_face_landmarks.dat")  # dlib landmark model

# os.makedirs(DATASET_DIR, exist_ok=True)

# # --- Pre-load Models for Efficiency ---
# print("Loading models, please wait...")
# try:
#     FACE_DETECTOR = cv2.CascadeClassifier(HAAR_CASCADE_PATH)
#     _ = DeepFace.represent(
#         img_path=np.zeros((100, 100, 3), dtype=np.uint8),
#         model_name="Facenet",
#         detector_backend='skip'
#     )
#     predictor = dlib.shape_predictor(PREDICTOR_PATH)
#     dlib_detector = dlib.get_frontal_face_detector()
#     print("Models loaded successfully.")
# except Exception as e:
#     print(f" Critical Error: Could not load models. Exiting. Error: {e}")
#     exit()

# # --- Liveness Detection Helpers ---
# def eye_aspect_ratio(eye):
#     A = distance.euclidean(eye[1], eye[5])
#     B = distance.euclidean(eye[2], eye[4])
#     C = distance.euclidean(eye[0], eye[3])
#     return (A + B) / (2.0 * C)

# def detect_blink(frame):
#     """Return True if blink detected in the given frame."""
#     gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#     rects = dlib_detector(gray, 0)
#     for rect in rects:
#         shape = predictor(gray, rect)
#         shape = np.array([[p.x, p.y] for p in shape.parts()])
#         leftEye = shape[36:42]
#         rightEye = shape[42:48]
#         leftEAR = eye_aspect_ratio(leftEye)
#         rightEAR = eye_aspect_ratio(rightEye)
#         ear = (leftEAR + rightEAR) / 2.0
#         if ear < 0.20:  # blink threshold
#             return True
#     return False

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
#                 # print(f"✅ Captured image {images_captured}/{num_images}")
#                 # cv2.putText(display_frame, "CAPTURED!", (x, y + h + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
#                 # cv2.imshow("Sign Up - Capturing Images...", display_frame)
#                 # cv2.waitKey(500)
#                 # continue
#                 print(f"✅ Captured image {images_captured}/{num_images}")
                
#                 # Overlay both CAPTURED! and progress (same as login style)
#                 cv2.putText(display_frame, f"SNAP {images_captured}/{num_images}", (x, y - 10),
#                             cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
#                 cv2.putText(display_frame, "CAPTURED!", (x, y + h + 30),
#                             cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
#                 cv2.imshow("Sign Up - Capturing Images...", display_frame)
#                 cv2.waitKey(500)
#                 continue

#             cv2.rectangle(display_frame, (x, y), (x + w, y + h), box_color, 2)
        
#         cv2.putText(display_frame, feedback, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, box_color, 2)
#         progress_text = f"Progress: {images_captured} / {num_images}"
#         cv2.putText(display_frame, progress_text, (20, frame_height - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
#         cv2.imshow("Sign Up - Capturing Images...", display_frame)

#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             print("✖ Capture cancelled by user.")
#             shutil.rmtree(user_dir)
#             return None

#     if images_captured != num_images:
#         print("⚠ Capture interrupted. Please try signing up again.")
#         shutil.rmtree(user_dir)
#         return None

#     print(f"✅ All {num_images} images captured!")
#     cap.release()
#     cv2.destroyAllWindows()
#     return user_dir

# def capture_multiple_images_for_login(num_images=10):
#     cap = cv2.VideoCapture(0)
#     temp_dir = tempfile.mkdtemp()
#     captured_image_paths = []
    
#     print(f"\n📸 Authenticating... We will snap up to {num_images} photos.")
#     print("👉 You must blink at least 2 times and also provide at least 2 normal images.")

#     images_captured = 0
#     start_time = time.time()
#     timeout = 25  # ~25 seconds
#     blink_count = 0
#     normal_count = 0
    
#     while images_captured < num_images and (time.time() - start_time) < timeout:
#         ret, frame = cap.read()
#         if not ret:
#             break

#         frame_height, frame_width, _ = frame.shape
#         display_frame = frame.copy()
#         gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#         faces = FACE_DETECTOR.detectMultiScale(
#             gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100)
#         )

#         if len(faces) == 1:
#             (x, y, w, h) = faces[0]
#             is_size_ok = (w > frame_width * 0.25) and (w < frame_width * 0.6)
#             face_center_x = x + w // 2
#             frame_center_x = frame_width // 2
#             is_centered = abs(face_center_x - frame_center_x) < (frame_width * 0.2)

#             if is_size_ok and is_centered:
#                 box_color = (0, 255, 0)

#                 # --- Blink detection ---
#                 blink_now = detect_blink(frame)
#                 if blink_now:
#                     blink_count += 1
#                     cv2.putText(display_frame, "BLINK DETECTED ✅", (x, y - 40),
#                                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
#                 else:
#                     normal_count += 1

#                 if time.time() - start_time > images_captured:  
#                     # Capture ~1 image per second
#                     images_captured += 1
#                     img_path = os.path.join(temp_dir, f"{images_captured}.jpg")
#                     processed_frame = preprocess_frame(frame)
#                     cv2.imwrite(img_path, processed_frame)
#                     captured_image_paths.append(img_path)

#                     cv2.putText(display_frame, f"SNAP {images_captured}/{num_images}",
#                                 (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, box_color, 2)

#         cv2.imshow("Login...", display_frame)
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             print("✖ Login cancelled by user.")
#             break

#     cap.release()
#     cv2.destroyAllWindows()

#     # --- Validate blink & normal counts ---
#     if blink_count < 2:
#         print("❌ Liveness check failed: Need at least 2 blink frames.")
#         shutil.rmtree(temp_dir)
#         return None, None

#     if normal_count < 2:
#         print("❌ Liveness check failed: Need at least 2 normal frames.")
#         shutil.rmtree(temp_dir)
#         return None, None

#     if not captured_image_paths:
#         print("⚠ Timed out. Could not capture enough frames.")
#         shutil.rmtree(temp_dir)
#         return None, None

#     print(f"✅ Captured {images_captured} images ({blink_count} blink, {normal_count} normal).")
#     return captured_image_paths, temp_dir

# # --- Sign Up (unchanged, from your code) ---
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
#     image_files = sorted(os.listdir(user_dir_path))

#     for img_file in image_files:
#         img_path = os.path.join(user_dir_path, img_file)
#         try:
#             _ = DeepFace.represent(img_path, model_name="Facenet", enforce_detection=True)
#             valid_images_found += 1
#             print(f"✔ Image '{img_file}' is high quality.")
#         except ValueError:
#             print(f"❌ Image '{img_file}' is not clear enough. Discarding.")
#             os.remove(img_path)

#     if valid_images_found == 0:
#         # print("\n❌ Sign-up failed: None of the captured images were clear enough.")
#         shutil.rmtree(user_dir_path)
#         return False

#     db[username] = user_dir_path
#     with open(DATA_FILE, "wb") as f:
#         pickle.dump(db, f)
#     # print(f"\n✅ User '{username}' registered successfully with {valid_images_found} high-quality images!")
#     return True 


# # --- Login (with new liveness integration) ---
# def login(username):
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
#         registered_img_path = os.path.join(registered_user_dir, image_files[0])
#     except (FileNotFoundError, IndexError):
#         print(f"❌ Error: Registration data for '{username}' is corrupted. Please sign up again.")
#         return

#     print(f"👤 Welcome, {username}. Please look at the camera and blink for verification.")
    
#     login_image_paths, temp_dir = capture_multiple_images_for_login()
    
#     if not login_image_paths:
#         print("❌ Login failed: Liveness not verified or no images captured.")
#         return

#     is_login_successful = False
#     try:
#         for i, login_img_path in enumerate(login_image_paths):
#             print(f"🔄 Verifying image {i + 1}/{len(login_image_paths)}...")
#             try:
#                 result = DeepFace.verify(
#                     img1_path=registered_img_path,
#                     img2_path=login_img_path,
#                     model_name="Facenet"
#                 )
#                 if result["verified"]:
#                     print("--------------------")
#                     print("✅ Login successful!")
#                     print(f"Match found with image {i + 1}. Distance: {result['distance']:.4f}")
#                     print("--------------------")
#                     is_login_successful = True
#                     break
#             except ValueError as e:
#                 print(f"⚠ Could not process image {i + 1}. Trying next one. Error: {e}")
#                 continue
        
#         if not is_login_successful:
#             print("--------------------")
#             print("❌ Login failed: We couldn't verify your identity.")
#             print("--------------------")

#     finally:
#         if temp_dir and os.path.exists(temp_dir):
#             print("🧹 Cleaning up temporary files...")
#             shutil.rmtree(temp_dir)

# if __name__ == "__main__":
#     while True:
#         print("\n--- Face Recognition System ---")
#         print("1. Sign Up (Register a new user)")
#         print("2. Login (Verify an existing user with blink check)")
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
from deepface import DeepFace
import numpy as np
import dlib
from scipy.spatial import distance

# --- Constants ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "user_data.pkl")
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
HAAR_CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
PREDICTOR_PATH = os.path.join(BASE_DIR, "shape_predictor_68_face_landmarks.dat")

os.makedirs(DATASET_DIR, exist_ok=True)

# --- Preload Models ---
FACE_DETECTOR = cv2.CascadeClassifier(HAAR_CASCADE_PATH)
_ = DeepFace.represent(img_path=np.zeros((100, 100, 3), dtype=np.uint8),
                       model_name="Facenet", detector_backend='skip')
predictor = dlib.shape_predictor(PREDICTOR_PATH)
dlib_detector = dlib.get_frontal_face_detector()

# --- Helpers ---
def eye_aspect_ratio(eye):
    A = distance.euclidean(eye[1], eye[5])
    B = distance.euclidean(eye[2], eye[4])
    C = distance.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

def detect_blink(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rects = dlib_detector(gray, 0)
    for rect in rects:
        shape = predictor(gray, rect)
        shape = np.array([[p.x, p.y] for p in shape.parts()])
        leftEye = shape[36:42]
        rightEye = shape[42:48]
        ear = (eye_aspect_ratio(leftEye) + eye_aspect_ratio(rightEye)) / 2.0
        if ear < 0.20:  # blink threshold
            return True
    return False

def preprocess_frame(frame):
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l_clahe = clahe.apply(l)
    lab_clahe = cv2.merge((l_clahe, a, b))
    return cv2.cvtColor(lab_clahe, cv2.COLOR_LAB2BGR)

# --- Capture Images ---
def capture_multiple_images_for_signup(username, num_images=10):
    cap = cv2.VideoCapture(0)
    user_dir = os.path.join(DATASET_DIR, username)
    os.makedirs(user_dir, exist_ok=True)

    images_captured = 0
    while images_captured < num_images:
        ret, frame = cap.read()
        if not ret: break

        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = FACE_DETECTOR.detectMultiScale(gray_frame, 1.1, 5, minSize=(100, 100))

        if len(faces) == 1:
            (x, y, w, h) = faces[0]
            processed_frame = preprocess_frame(frame)
            img_path = os.path.join(user_dir, f"{images_captured + 1}.jpg")
            cv2.imwrite(img_path, processed_frame)
            images_captured += 1
            time.sleep(0.5)

        cv2.imshow("Sign Up", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            shutil.rmtree(user_dir)
            return None

    cap.release()
    cv2.destroyAllWindows()
    return user_dir if images_captured == num_images else None

def capture_multiple_images_for_login(num_images=10):
    cap = cv2.VideoCapture(0)
    temp_dir = tempfile.mkdtemp()
    captured_image_paths = []

    blink_count, normal_count = 0, 0
    start_time = time.time()
    timeout = 25

    while len(captured_image_paths) < num_images and (time.time() - start_time) < timeout:
        ret, frame = cap.read()
        if not ret: break

        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = FACE_DETECTOR.detectMultiScale(gray_frame, 1.1, 5, minSize=(100, 100))

        if len(faces) == 1:
            if detect_blink(frame):
                blink_count += 1
            else:
                normal_count += 1

            img_path = os.path.join(temp_dir, f"{len(captured_image_paths) + 1}.jpg")
            cv2.imwrite(img_path, preprocess_frame(frame))
            captured_image_paths.append(img_path)
            time.sleep(1)

        cv2.imshow("Login", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            shutil.rmtree(temp_dir)
            return None, None

    cap.release()
    cv2.destroyAllWindows()

    if blink_count < 2 or normal_count < 2:
        shutil.rmtree(temp_dir)
        return None, None

    return captured_image_paths, temp_dir

# --- API-friendly Sign Up ---
def sign_up(username):
    if not username: return False

    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "rb") as f:
            db = pickle.load(f)
    else:
        db = {}

    if username in db:
        return False

    user_dir = capture_multiple_images_for_signup(username)
    if not user_dir: return False

    # Validate with DeepFace
    valid = 0
    for img in os.listdir(user_dir):
        img_path = os.path.join(user_dir, img)
        try:
            DeepFace.represent(img_path, model_name="Facenet", enforce_detection=True)
            valid += 1
        except ValueError:
            os.remove(img_path)

    if valid == 0:
        shutil.rmtree(user_dir)
        return False

    db[username] = user_dir
    with open(DATA_FILE, "wb") as f:
        pickle.dump(db, f)
    return True

# --- API-friendly Login ---
def login(username):
    if not os.path.exists(DATA_FILE): return False

    with open(DATA_FILE, "rb") as f:
        db = pickle.load(f)

    if username not in db: return False

    registered_user_dir = db[username]
    try:
        reg_img = os.path.join(registered_user_dir, os.listdir(registered_user_dir)[0])
    except:
        return False

    login_imgs, temp_dir = capture_multiple_images_for_login()
    if not login_imgs: return False

    try:
        for img in login_imgs:
            result = DeepFace.verify(img1_path=reg_img, img2_path=img, model_name="Facenet")
            if result["verified"]:
                shutil.rmtree(temp_dir)
                return True
        return False
    finally:
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
