# GUI Automation Guide for ffMediaMaster

This guide explains how to use the `automate_ffmediamaster.py` script to automate the ffMediaMaster GUI application.

## Prerequisites

1. Python installed on your system
2. PyAutoGUI library installed (`pip install pyautogui`)
3. ffMediaMaster installed at the default location (or update the path in the script)

## How the Script Works

The script uses PyAutoGUI to control your mouse and keyboard to interact with the ffMediaMaster application. It:

1. Launches ffMediaMaster
2. Clicks on buttons and inputs text to navigate the interface
3. Adds video files from your input folder
4. Configures output settings
5. Starts the processing
6. Waits for completion and closes the application

## Step 1: Determine Correct Coordinates

GUI automation requires knowing the exact screen coordinates of buttons and interface elements. The script includes a function to help you determine these coordinates:

1. Run the script and choose option 1:
   ```
   python automate_ffmediamaster.py
   ```
   Then enter `1` when prompted.

2. The script will:
   - Launch ffMediaMaster
   - Take a screenshot (saved as `ffmediamaster_screenshot.png`)
   - Display the current mouse coordinates for 10 seconds

3. During those 10 seconds, move your mouse to each important button or element in the ffMediaMaster interface and note the coordinates displayed in the terminal.

4. Important elements to locate:
   - "Add Files" button
   - Settings or output configuration button
   - Transform/effects buttons
   - Process/start button

## Step 2: Update the Script with Correct Coordinates

Open `automate_ffmediamaster.py` in a text editor and update these lines with the coordinates you noted:

```python
# Add Files button
add_files_button_x, add_files_button_y = 82, 98  # Replace with your coordinates

# Settings button
settings_button_x, settings_button_y = 800, 100  # Replace with your coordinates

# Transform button
transform_button_x, transform_button_y = 500, 300  # Replace with your coordinates

# Process button
process_button_x, process_button_y = 450, 500  # Replace with your coordinates
```

Also update any other coordinates or timing values as needed.

## Step 3: Run the Automation

1. Run the script again and choose option 2:
   ```
   python automate_ffmediamaster.py
   ```
   Then enter `2` when prompted.

2. The script will start automating ffMediaMaster. Do not move your mouse or use your keyboard during this process.

3. If you need to abort the automation at any point, quickly move your mouse to any corner of the screen (this is a safety feature of PyAutoGUI).

## Customizing the Script

### Adjusting Wait Times

If the script moves too quickly or too slowly for your system, adjust the `time.sleep()` values:

```python
# Increase this value if the application takes longer to start
time.sleep(5)  

# Increase this if file dialog takes longer to appear
time.sleep(2)
```

### Modifying Transformations

The current script includes placeholder actions for applying transformations. You'll need to update these based on the actual interface of ffMediaMaster:

```python
# Example: Click on various settings and adjust them
transform_button_x, transform_button_y = 500, 300
pyautogui.click(transform_button_x, transform_button_y)
```

### Processing Multiple Batches

To process multiple batches of videos, you can modify the script to loop through different input folders:

```python
input_folders = [
    r"C:\Users\Romeo Burke\Videos\tiktok",
    r"C:\Users\Romeo Burke\Videos\other_folder"
]

for folder in input_folders:
    INPUT_FOLDER = folder
    automate_ffmediamaster()
```

## Troubleshooting

### Script Not Clicking in the Right Places

- Screen resolution affects coordinates. The script must be run at the same screen resolution used when determining coordinates.
- Some applications scale differently on high-DPI displays. Try running in compatibility mode.

### Application Not Responding as Expected

- Increase the wait times (`time.sleep()` values) to give the application more time to respond.
- Some applications have dynamic layouts that can change. The script may need adjustments.

### Safety Features

- PyAutoGUI has a failsafe feature: quickly moving the mouse to any corner of the screen will abort the script.
- The script includes error handling to prevent it from getting stuck.

## Alternative Approaches

If PyAutoGUI doesn't work well with ffMediaMaster, consider these alternatives:

1. **Pywinauto**: More powerful for Windows applications but more complex to use
2. **AutoIt**: Dedicated scripting language for Windows automation
3. **RPA Tools**: UiPath or Power Automate for more robust automation

## Disclaimer

GUI automation is inherently fragile and depends on screen resolution, application version, and system configuration. The script may need adjustments for your specific environment.