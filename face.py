import cv2
import os
import pickle
from deepface import DeepFace

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "face_embeddings.pkl")
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

os.makedirs(DATASET_DIR, exist_ok=True)


def capture_image(username=None):
    """Capture one frame from webcam and save (optional: into dataset)."""
    cap = cv2.VideoCapture(0)
    print("Press 's' to capture, 'q' to quit.")

    img_path = None
    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        cv2.imshow("Capture Face", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord("s"):
            if username:
                user_dir = os.path.join(DATASET_DIR, username)
                os.makedirs(user_dir, exist_ok=True)
                img_path = os.path.join(user_dir, f"{username}.jpg")
            else:
                img_path = os.path.join(BASE_DIR, "temp.jpg")

            cv2.imwrite(img_path, frame)
            print(f"✅ Image saved at {img_path}")
            break

        elif key == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    return img_path


def sign_up(username):
    """Register new user with DeepFace embedding."""
    img_path = capture_image(username)
    if not img_path:
        print("❌ No image captured.")
        return

    # Create embedding
    embedding = DeepFace.represent(img_path=img_path, model_name="Facenet")[0]["embedding"]

    # Save to pickle
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "rb") as f:
            db = pickle.load(f)
    else:
        db = {}

    db[username] = embedding
    with open(DATA_FILE, "wb") as f:
        pickle.dump(db, f)

    print(f"✅ {username} registered successfully.")


def login(username):
    """Login user by comparing embeddings."""
    if not os.path.exists(DATA_FILE):
        print("❌ No users found. Please sign up first.")
        return

    with open(DATA_FILE, "rb") as f:
        db = pickle.load(f)

    if username not in db:
        print("❌ User not registered.")
        return

    stored_embedding = db[username]
    img_path = capture_image()  # capture fresh image

    if not img_path:
        print("❌ No image captured.")
        return

    new_embedding = DeepFace.represent(img_path=img_path, model_name="Facenet")[0]["embedding"]

    # Compare embeddings (cosine similarity)
    from numpy import dot
    from numpy.linalg import norm

    cos_sim = dot(stored_embedding, new_embedding) / (norm(stored_embedding) * norm(new_embedding))
    match_percentage = (cos_sim + 1) / 2 * 100  # scale [-1,1] → [0,100]

    print(f"Match confidence: {match_percentage:.2f}%")

    if match_percentage > 50:  # adjustable threshold
        print("✅ Login successful")
    else:
        print("❌ Login failed")


if __name__ == "__main__":
    print("Choose option:\n1. Sign Up\n2. Login")
    choice = input("Enter choice (1/2): ").strip()

    if choice == "1":
        username = input("Enter your name: ").strip()
        sign_up(username)
    elif choice == "2":
        username = input("Enter your name: ").strip()
        login(username)
    else:
        print("Invalid choice.")