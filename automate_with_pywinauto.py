import os
import time
import subprocess
from pathlib import Path

# Configuration
FFMEDIAMASTER_PATH = r"C:\Program Files\ffMediaMaster\ffmediamaster.exe"
INPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok"
OUTPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\output"

def install_pywinauto():
    """Install pywinauto if not already installed"""
    try:
        import pywinauto
        print("✅ Pywinauto is already installed")
    except ImportError:
        print("⏳ Installing pywinauto...")
        subprocess.run(["pip", "install", "pywinauto"], check=True)
        print("✅ Pywinauto installed successfully")

def automate_ffmediamaster():
    """Automate ffMediaMaster using pywinauto"""
    # Import here after ensuring it's installed
    from pywinauto.application import Application
    from pywinauto.keyboard import send_keys
    import pywinauto.mouse as mouse
    
    print("🤖 Starting ffMediaMaster automation with pywinauto")
    
    # Create output folder if it doesn't exist
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    
    # Launch ffMediaMaster
    print("📱 Launching ffMediaMaster...")
    app = Application(backend="win32").start(FFMEDIAMASTER_PATH)
    
    # Wait for application to start
    print("⏳ Waiting for application to start...")
    time.sleep(5)  # Adjust this time based on how long it takes to start
    
    try:
        # Connect to the main window
        main_window = app.window(title_re=".*ffMediaMaster.*")
        main_window.wait('visible', timeout=10)
        print(f"✅ Connected to main window: {main_window.window_text()}")
        
        # Print all controls to help identify them
        print("\n📋 Available controls in the main window:")
        main_window.print_control_identifiers()
        
        # Click "Add Files" button
        # The exact identifier will depend on the application
        # This is a placeholder and needs to be updated based on the output above
        print("🖱️ Clicking 'Add Files' button...")
        try:
            add_button = main_window.child_window(title="Add Files", control_type="Button")
            add_button.click()
        except Exception as e:
            print(f"⚠️ Could not find 'Add Files' button by title, trying by coordinates: {e}")
            # Fallback to coordinates if control can't be found
            # These coordinates are relative to the main window
            main_window.click_input(coords=(82, 98))  # Adjust these coordinates
        
        time.sleep(2)
        
        # In the file dialog, navigate to the input folder
        print("📂 Navigating to input folder...")
        # Try to find the file dialog window
        file_dialog = app.window(title_re="Open")
        file_dialog.wait('visible', timeout=10)
        
        # Type the path in the file name field
        file_dialog.Edit.set_text(INPUT_FOLDER)
        send_keys("{ENTER}")
        time.sleep(2)
        
        # Select all files
        send_keys("^a")  # Ctrl+A
        time.sleep(1)
        
        # Click Open
        file_dialog.Open.click()
        time.sleep(2)
        
        # Now we need to configure the output settings
        # This part is highly dependent on the ffMediaMaster interface
        print("⚙️ Configuring output settings...")
        
        # Try to find settings button or menu
        # This is a placeholder and needs to be updated
        try:
            settings_button = main_window.child_window(title_re=".*Settings.*|.*Output.*", control_type="Button")
            settings_button.click()
        except Exception as e:
            print(f"⚠️ Could not find settings button by title, trying by coordinates: {e}")
            # Fallback to coordinates
            main_window.click_input(coords=(800, 100))  # Adjust these coordinates
        
        time.sleep(1)
        
        # Try to find output folder field
        # This is a placeholder and needs to be updated
        try:
            output_edit = main_window.child_window(control_type="Edit")
            output_edit.set_text(OUTPUT_FOLDER)
        except Exception as e:
            print(f"⚠️ Could not find output field, trying keyboard input: {e}")
            # Fallback to keyboard input
            send_keys(OUTPUT_FOLDER)
            send_keys("{ENTER}")
        
        time.sleep(1)
        
        # Apply random transformations
        print("🔄 Applying random transformations...")
        # This is highly dependent on the ffMediaMaster interface
        # and will need to be customized based on the actual controls
        
        # Start processing
        print("▶️ Starting processing...")
        try:
            process_button = main_window.child_window(title_re=".*Process.*|.*Start.*|.*Convert.*", control_type="Button")
            process_button.click()
        except Exception as e:
            print(f"⚠️ Could not find process button by title, trying by coordinates: {e}")
            # Fallback to coordinates
            main_window.click_input(coords=(450, 500))  # Adjust these coordinates
        
        # Wait for processing to complete
        print("⏳ Waiting for processing to complete...")
        time.sleep(60)  # Adjust based on expected processing time
        
        # Close the application
        print("🚪 Closing application...")
        main_window.close()
        
        print("✅ Automation completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during automation: {e}")
        import traceback
        traceback.print_exc()

def analyze_application():
    """Analyze the ffMediaMaster application to help with automation"""
    from pywinauto.application import Application
    
    print("🔍 Analyzing ffMediaMaster application...")
    
    # Launch ffMediaMaster
    subprocess.Popen([FFMEDIAMASTER_PATH])
    time.sleep(5)  # Wait for application to start
    
    # Connect to the running application
    app = Application(backend="win32").connect(path=FFMEDIAMASTER_PATH)
    
    # Get the main window
    main_window = app.window(title_re=".*ffMediaMaster.*")
    main_window.wait('visible', timeout=10)
    
    # Print information about the window
    print(f"\n📋 Main window information:")
    print(f"Title: {main_window.window_text()}")
    print(f"Handle: {main_window.handle}")
    print(f"Rectangle: {main_window.rectangle()}")
    
    # Print all controls in the window
    print("\n📋 All controls in the main window:")
    main_window.print_control_identifiers()
    
    print("\n⚠️ Please take note of the control identifiers above.")
    print("You will need to update the script with the correct identifiers for buttons and fields.")
    
    # Keep the window open for manual inspection
    input("\nPress Enter to close the application and continue...")
    main_window.close()

if __name__ == "__main__":
    # Install pywinauto if needed
    install_pywinauto()
    
    print("This script will automate ffMediaMaster using pywinauto.")
    print("Options:")
    print("1. Analyze ffMediaMaster (run this first to identify controls)")
    print("2. Run the automation (after updating the script with correct identifiers)")
    
    choice = input("Enter your choice (1 or 2): ")
    
    if choice == "1":
        analyze_application()
    elif choice == "2":
        automate_ffmediamaster()
    else:
        print("Invalid choice. Please enter 1 or 2.")