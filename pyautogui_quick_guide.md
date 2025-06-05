# Quick Guide for Using PyAutoGUI Automation

This guide will help you effectively use the `automate_ffmediamaster.py` script to automate ffMediaMaster.

## Getting Started

1. Make sure PyAutoGUI is installed:
   ```
   pip install pyautogui
   ```

2. Run the script in "coordinate finding" mode:
   ```
   python automate_ffmediamaster.py
   ```
   Then enter `1` when prompted.

3. The script will:
   - Launch ffMediaMaster
   - Take a screenshot (saved as `ffmediamaster_screenshot.png`)
   - Display mouse coordinates for 10 seconds

4. During those 10 seconds, move your mouse to each important button in ffMediaMaster and note the coordinates:
   - "Add Files" button
   - Settings/output button
   - Transform/effects buttons
   - Process/start button

## Updating the Script

Open `automate_ffmediamaster.py` in a text editor and update these coordinates:

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

Also adjust these timing values if needed:

```python
# Increase if application takes longer to start
time.sleep(5)  

# Increase if file dialog takes longer to appear
time.sleep(2)
```

## Running the Automation

1. Run the script in "automation" mode:
   ```
   python automate_ffmediamaster.py
   ```
   Then enter `2` when prompted.

2. Do not move your mouse or use your keyboard during the automation.

3. If you need to abort, quickly move your mouse to any corner of the screen.

## Making PyAutoGUI More Reliable

1. **Consistent Environment**: Run the script with the same:
   - Screen resolution
   - Window size
   - Monitor setup

2. **Add Verification Steps**: Add code to verify actions succeeded:
   ```python
   # Check if a specific pixel has the expected color
   if pyautogui.pixelMatchesColor(x, y, (r, g, b)):
       print("Button is visible")
   ```

3. **Use Image Recognition**: Instead of coordinates, use image recognition:
   ```python
   # Look for an image on screen
   location = pyautogui.locateOnScreen('add_files_button.png')
   if location:
       pyautogui.click(location)
   ```
   
   To use this approach:
   - Take screenshots of buttons using the screenshot tool
   - Crop them to just show the button
   - Save them as separate files
   - Update the script to use these images

4. **Add Error Recovery**: Add code to handle unexpected situations:
   ```python
   try:
       # Try to find and click a button
       location = pyautogui.locateOnScreen('add_files_button.png')
       if location:
           pyautogui.click(location)
       else:
           # Fallback to coordinates
           pyautogui.click(add_files_button_x, add_files_button_y)
   except Exception as e:
       print(f"Error: {e}")
       # Recovery action
   ```

## Common Issues and Solutions

1. **Script Clicks Wrong Location**
   - Cause: Screen resolution or window position changed
   - Solution: Re-run in coordinate finding mode and update coordinates

2. **Application Doesn't Respond**
   - Cause: Actions happening too quickly
   - Solution: Increase sleep times between actions

3. **File Dialog Navigation Issues**
   - Cause: Different dialog behavior
   - Solution: Use direct path input instead of navigation:
     ```python
     # Instead of navigating through folders
     pyautogui.write(INPUT_FOLDER)
     pyautogui.press('enter')
     ```

4. **Script Gets Stuck**
   - Cause: Missing element or unexpected dialog
   - Solution: Add timeouts and fallback actions:
     ```python
     start_time = time.time()
     while time.time() - start_time < 10:  # 10 second timeout
         if pyautogui.locateOnScreen('expected_element.png'):
             # Proceed with normal flow
             break
         time.sleep(0.5)
     else:
         # Timeout occurred, take fallback action
         print("Timeout occurred, taking fallback action")
     ```

## Customizing for Your Needs

1. **Processing Multiple Batches**:
   ```python
   input_folders = [
       r"C:\Users\Romeo Burke\Videos\tiktok",
       r"C:\Users\Romeo Burke\Videos\other_folder"
   ]

   for folder in input_folders:
       INPUT_FOLDER = folder
       # Run automation for this folder
   ```

2. **Adding Custom Transformations**:
   - Identify the coordinates of transformation controls
   - Add clicks and adjustments for each transformation
   - Example:
     ```python
     # Click resolution dropdown
     pyautogui.click(resolution_x, resolution_y)
     time.sleep(0.5)
     
     # Select 720p option
     pyautogui.click(resolution_720p_x, resolution_720p_y)
     time.sleep(0.5)
     ```

3. **Scheduling Automation**:
   - Use Windows Task Scheduler to run the script at specific times
   - Create a batch file (.bat) that runs the script:
     ```
     @echo off
     cd C:\Users\Romeo Burke\Desktop\fresh-nextjs
     python automate_ffmediamaster.py
     ```
   - Schedule this batch file to run automatically

## Safety Tips

1. Always have a way to abort the script (move mouse to corner)
2. Test with a small number of files first
3. Make backups of important files before processing
4. Monitor the first few runs to ensure everything works correctly