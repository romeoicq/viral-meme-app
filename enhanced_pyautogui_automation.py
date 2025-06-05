import os
import time
import subprocess
import pyautogui
import sys
from pathlib import Path

# Configuration
FFMEDIAMASTER_PATH = r"C:\Program Files\ffMediaMaster\ffmediamaster.exe"
INPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok"
OUTPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\output"
SCREENSHOTS_FOLDER = r"./button_screenshots"  # Folder to store button screenshots

# Safety feature - move mouse to corner to abort
pyautogui.FAILSAFE = True

# Timeout settings
DEFAULT_TIMEOUT = 30  # Default timeout in seconds
BUTTON_CONFIDENCE = 0.7  # Confidence level for image recognition (0-1)

def create_screenshots_folder():
    """Create folder for button screenshots if it doesn't exist"""
    os.makedirs(SCREENSHOTS_FOLDER, exist_ok=True)
    print(f"✅ Screenshots folder ready: {SCREENSHOTS_FOLDER}")

def take_button_screenshot(name, region=None):
    """Take a screenshot of a button for later recognition"""
    print(f"📸 Position your mouse over the {name} button and press Enter...")
    input()
    
    # Get current mouse position
    x, y = pyautogui.position()
    print(f"Mouse position: {x}, {y}")
    
    # Take screenshot of region around mouse
    if region is None:
        region = (x - 50, y - 20, 100, 40)  # Default region around mouse
    
    screenshot = pyautogui.screenshot(region=region)
    
    # Save screenshot
    screenshot_path = os.path.join(SCREENSHOTS_FOLDER, f"{name}_button.png")
    screenshot.save(screenshot_path)
    print(f"✅ Saved {name} button screenshot to {screenshot_path}")
    
    return x, y, screenshot_path

def click_button_with_fallback(button_image, fallback_x, fallback_y, button_name, timeout=DEFAULT_TIMEOUT):
    """Try to click a button using image recognition with fallback to coordinates"""
    print(f"🖱️ Looking for {button_name} button...")
    
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            # Try to find the button by image
            button_location = pyautogui.locateOnScreen(button_image, confidence=BUTTON_CONFIDENCE)
            if button_location:
                button_x, button_y = pyautogui.center(button_location)
                print(f"✅ Found {button_name} button at {button_x}, {button_y}")
                pyautogui.click(button_x, button_y)
                return True
        except Exception as e:
            print(f"⚠️ Error looking for {button_name} button: {e}")
        
        # Wait a bit before trying again
        time.sleep(0.5)
    
    # Fallback to coordinates if image recognition fails
    print(f"⚠️ Could not find {button_name} button by image, using fallback coordinates")
    pyautogui.click(fallback_x, fallback_y)
    return False

def wait_for_image(image_path, timeout=DEFAULT_TIMEOUT, confidence=BUTTON_CONFIDENCE):
    """Wait for an image to appear on screen"""
    print(f"⏳ Waiting for image {image_path} to appear...")
    
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            location = pyautogui.locateOnScreen(image_path, confidence=confidence)
            if location:
                print(f"✅ Image found at {location}")
                return location
        except Exception as e:
            pass
        
        time.sleep(0.5)
    
    print(f"⚠️ Timeout waiting for image {image_path}")
    return None

def setup_button_screenshots():
    """Set up button screenshots for image recognition"""
    print("📸 Let's take screenshots of important buttons for more reliable automation")
    print("Please follow the instructions to position your mouse over each button")
    
    create_screenshots_folder()
    
    # Take screenshots of important buttons
    add_files_x, add_files_y, add_files_img = take_button_screenshot("add_files")
    settings_x, settings_y, settings_img = take_button_screenshot("settings")
    transform_x, transform_y, transform_img = take_button_screenshot("transform")
    process_x, process_y, process_img = take_button_screenshot("process")
    
    # Save coordinates to a file for future use
    coordinates = {
        "add_files": (add_files_x, add_files_y, add_files_img),
        "settings": (settings_x, settings_y, settings_img),
        "transform": (transform_x, transform_y, transform_img),
        "process": (process_x, process_y, process_img)
    }
    
    # Save coordinates to a file
    with open("button_coordinates.py", "w") as f:
        f.write("# Button coordinates and screenshot paths\n")
        f.write("COORDINATES = {\n")
        for name, (x, y, img) in coordinates.items():
            f.write(f'    "{name}": ({x}, {y}, "{img}"),\n')
        f.write("}\n")
    
    print("✅ Button coordinates and screenshots saved")
    return coordinates

def load_button_coordinates():
    """Load button coordinates from file if available"""
    try:
        # Try to import the coordinates module
        sys.path.append(os.getcwd())
        from button_coordinates import COORDINATES
        print("✅ Loaded button coordinates from file")
        return COORDINATES
    except ImportError:
        print("⚠️ Button coordinates file not found, need to set up screenshots first")
        return None

def automate_ffmediamaster(coordinates):
    """Automate ffMediaMaster GUI to process videos"""
    print("🤖 Starting ffMediaMaster automation")
    
    # Create output folder if it doesn't exist
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    
    # Launch ffMediaMaster
    print("📱 Launching ffMediaMaster...")
    subprocess.Popen([FFMEDIAMASTER_PATH])
    
    # Wait for application to start
    print("⏳ Waiting for application to start...")
    time.sleep(5)  # Adjust this time based on how long it takes to start
    
    try:
        # Get button coordinates and images
        add_files_x, add_files_y, add_files_img = coordinates["add_files"]
        settings_x, settings_y, settings_img = coordinates["settings"]
        transform_x, transform_y, transform_img = coordinates["transform"]
        process_x, process_y, process_img = coordinates["process"]
        
        # Click "Add Files" button
        print("🖱️ Clicking 'Add Files' button...")
        click_button_with_fallback(add_files_img, add_files_x, add_files_y, "Add Files")
        time.sleep(2)
        
        # In the file dialog, navigate to the input folder
        print("📂 Navigating to input folder...")
        # Type the path in the file name field
        pyautogui.write(INPUT_FOLDER)
        pyautogui.press('enter')
        time.sleep(2)
        
        # Select all files (Ctrl+A)
        print("🖱️ Selecting all files...")
        pyautogui.hotkey('ctrl', 'a')
        time.sleep(1)
        
        # Click Open
        print("🖱️ Clicking 'Open'...")
        pyautogui.press('enter')
        time.sleep(2)
        
        # Configure output settings
        print("⚙️ Configuring output settings...")
        click_button_with_fallback(settings_img, settings_x, settings_y, "Settings")
        time.sleep(1)
        
        # Type output folder path
        print("📁 Setting output folder...")
        pyautogui.write(OUTPUT_FOLDER)
        pyautogui.press('enter')
        time.sleep(1)
        
        # Apply transformations
        print("🔄 Applying transformations...")
        click_button_with_fallback(transform_img, transform_x, transform_y, "Transform")
        time.sleep(1)
        
        # Start processing
        print("▶️ Starting processing...")
        click_button_with_fallback(process_img, process_x, process_y, "Process")
        
        # Wait for processing to complete
        print("⏳ Waiting for processing to complete...")
        # This is a placeholder - you might need to detect when processing is done
        # For example, by looking for a "Complete" dialog or checking if CPU usage drops
        processing_time = 60  # Adjust based on expected processing time
        print(f"⏳ Waiting {processing_time} seconds for processing to complete...")
        time.sleep(processing_time)
        
        # Check if processing is complete
        # This is a placeholder - you would need to implement actual detection
        print("✅ Processing appears to be complete")
        
        # Close the application
        print("🚪 Closing application...")
        pyautogui.hotkey('alt', 'f4')
        
        print("✅ Automation completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during automation: {e}")
        import traceback
        traceback.print_exc()
        print("Move mouse to corner of screen to abort if stuck")

def take_full_screenshot():
    """Take a full screenshot of the screen"""
    screenshot = pyautogui.screenshot()
    screenshot_path = "full_screen.png"
    screenshot.save(screenshot_path)
    print(f"📸 Full screenshot saved to: {screenshot_path}")

def show_mouse_position():
    """Show the current mouse position for 30 seconds"""
    print("🖱️ Move your mouse to buttons and note the coordinates:")
    print("Press Ctrl+C to stop")
    try:
        while True:
            x, y = pyautogui.position()
            position_str = f"X: {x}, Y: {y}"
            print(position_str, end='\r')
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\nMouse position tracking stopped")

if __name__ == "__main__":
    print("This script will automate ffMediaMaster to process videos.")
    print("Options:")
    print("1. Set up button screenshots (do this first time)")
    print("2. Run the automation (after setting up)")
    print("3. Take a full screenshot")
    print("4. Show mouse position")
    
    choice = input("Enter your choice (1-4): ")
    
    if choice == "1":
        coordinates = setup_button_screenshots()
    elif choice == "2":
        coordinates = load_button_coordinates()
        if coordinates:
            automate_ffmediamaster(coordinates)
        else:
            print("Please run option 1 first to set up button screenshots")
    elif choice == "3":
        take_full_screenshot()
    elif choice == "4":
        show_mouse_position()
    else:
        print("Invalid choice. Please enter 1-4.")