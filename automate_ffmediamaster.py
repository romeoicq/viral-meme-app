import os
import time
import subprocess
import pyautogui
from pathlib import Path

# Configuration
FFMEDIAMASTER_PATH = r"C:\Program Files\ffMediaMaster\ffmediamaster.exe"
INPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok"
OUTPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\output"

# Safety feature - move mouse to corner to abort
pyautogui.FAILSAFE = True

def automate_ffmediamaster():
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
        # Click "Add Files" button (coordinates based on the screenshot)
        # These coordinates are approximate and may need adjustment
        print("🖱️ Clicking 'Add Files' button...")
        add_files_button_x, add_files_button_y = 82, 98  # Adjust these coordinates
        pyautogui.click(add_files_button_x, add_files_button_y)
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
        
        # Now we need to configure the output settings
        # This part is highly dependent on the ffMediaMaster interface
        # and may need significant adjustments
        
        # Assume there's a settings or output button
        print("⚙️ Configuring output settings...")
        settings_button_x, settings_button_y = 800, 100  # Adjust these coordinates
        pyautogui.click(settings_button_x, settings_button_y)
        time.sleep(1)
        
        # Type output folder path
        print("📁 Setting output folder...")
        pyautogui.write(OUTPUT_FOLDER)
        pyautogui.press('enter')
        time.sleep(1)
        
        # Apply random transformations
        # This part is highly dependent on the ffMediaMaster interface
        print("🔄 Applying random transformations...")
        # Example: Click on various settings and adjust them
        # These are placeholder actions and will need to be adjusted
        transform_button_x, transform_button_y = 500, 300  # Adjust these coordinates
        pyautogui.click(transform_button_x, transform_button_y)
        time.sleep(1)
        
        # Start processing
        print("▶️ Starting processing...")
        process_button_x, process_button_y = 450, 500  # Adjust these coordinates
        pyautogui.click(process_button_x, process_button_y)
        
        # Wait for processing to complete
        # This is a placeholder - you might need to detect when processing is done
        print("⏳ Waiting for processing to complete...")
        time.sleep(60)  # Adjust based on expected processing time
        
        # Close the application
        print("🚪 Closing application...")
        pyautogui.hotkey('alt', 'f4')
        
        print("✅ Automation completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during automation: {e}")
        print("Move mouse to corner of screen to abort if stuck")

def take_screenshot_for_coordinates():
    """Take screenshots to help determine coordinates"""
    print("📸 Taking screenshots to help determine coordinates...")
    
    # Launch ffMediaMaster
    subprocess.Popen([FFMEDIAMASTER_PATH])
    time.sleep(5)  # Wait for application to start
    
    # Take screenshot of the whole screen
    screenshot = pyautogui.screenshot()
    screenshot_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ffmediamaster_screenshot.png")
    screenshot.save(screenshot_path)
    
    print(f"📸 Screenshot saved to: {screenshot_path}")
    print("Use this screenshot to determine the correct coordinates for buttons")
    
    # Get current mouse position for 10 seconds to help determine coordinates
    print("🖱️ Move your mouse to buttons and note the coordinates:")
    end_time = time.time() + 10
    while time.time() < end_time:
        x, y = pyautogui.position()
        position_str = f"X: {x}, Y: {y}"
        print(position_str, end='\r')
        time.sleep(0.1)
    
    print("\nUse these coordinates to update the script")

if __name__ == "__main__":
    # First run this to get coordinates
    print("This script will automate ffMediaMaster to process videos.")
    print("Options:")
    print("1. Take screenshot and get coordinates (run this first)")
    print("2. Run the automation (after updating coordinates)")
    
    choice = input("Enter your choice (1 or 2): ")
    
    if choice == "1":
        take_screenshot_for_coordinates()
    elif choice == "2":
        automate_ffmediamaster()
    else:
        print("Invalid choice. Please enter 1 or 2.")