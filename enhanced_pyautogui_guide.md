# Enhanced PyAutoGUI Automation Guide

This guide explains how to use the `enhanced_pyautogui_automation.py` script, which provides a more reliable way to automate ffMediaMaster while still keeping the simplicity of PyAutoGUI.

## What's Improved in the Enhanced Script

The enhanced script includes several improvements over the original:

1. **Image Recognition**: Instead of relying solely on fixed coordinates, the script can recognize buttons by their appearance, making it more robust to interface changes.

2. **Fallback Mechanisms**: If image recognition fails, the script falls back to coordinates, ensuring it can still work even if the interface changes slightly.

3. **Better Error Handling**: The script includes try/except blocks and timeouts to prevent it from getting stuck.

4. **Interactive Setup**: The script includes an interactive setup process to capture button screenshots and coordinates.

5. **More Options**: Additional utilities like showing mouse position and taking full screenshots.

## How to Use the Enhanced Script

### First-Time Setup

1. Run the script and choose option 1:
   ```
   python enhanced_pyautogui_automation.py
   ```
   Then enter `1` when prompted.

2. The script will guide you through taking screenshots of important buttons:
   - Position your mouse over the "Add Files" button and press Enter
   - Position your mouse over the Settings button and press Enter
   - Position your mouse over the Transform button and press Enter
   - Position your mouse over the Process button and press Enter

3. The script will save:
   - Screenshots of each button in the `button_screenshots` folder
   - Coordinates of each button in `button_coordinates.py`

### Running the Automation

1. After setup, run the script again and choose option 2:
   ```
   python enhanced_pyautogui_automation.py
   ```
   Then enter `2` when prompted.

2. The script will:
   - Launch ffMediaMaster
   - Use image recognition to find and click buttons
   - Fall back to coordinates if image recognition fails
   - Process your videos
   - Close the application when done

3. Do not move your mouse or use your keyboard during the automation.

4. If you need to abort, quickly move your mouse to any corner of the screen.

### Additional Utilities

The script includes two additional utilities:

- **Option 3: Take Full Screenshot**: Takes a screenshot of your entire screen, useful for troubleshooting.

- **Option 4: Show Mouse Position**: Continuously displays your mouse coordinates, helpful for identifying positions of elements not captured during setup.

## How Image Recognition Works

The enhanced script uses PyAutoGUI's image recognition capabilities:

1. During setup, it takes screenshots of buttons when you position your mouse over them.

2. During automation, it searches the screen for images that match these screenshots.

3. When it finds a match, it clicks at the center of the matched region.

4. If it can't find a match after several attempts, it falls back to using the coordinates recorded during setup.

This approach is more robust because:
- It can find buttons even if they move slightly on the screen
- It's less sensitive to changes in window position or screen resolution
- It can adapt to minor interface changes

## Customizing the Script

### Adjusting Timeouts

If the script moves too quickly or too slowly:

```python
# Default timeout in seconds
DEFAULT_TIMEOUT = 30  # Increase if operations take longer

# Wait time after launching application
time.sleep(5)  # Increase if application takes longer to start
```

### Adjusting Image Recognition Confidence

If image recognition is too strict or too lenient:

```python
# Confidence level for image recognition (0-1)
BUTTON_CONFIDENCE = 0.7  # Lower for more lenient matching, higher for stricter
```

### Adding Custom Transformations

To add specific transformations:

1. Take screenshots of the transformation controls during setup
2. Add code to click these controls and adjust settings
3. Example:

```python
# Take screenshot of resolution dropdown during setup
resolution_x, resolution_y, resolution_img = take_button_screenshot("resolution")

# In the automation function
click_button_with_fallback(resolution_img, resolution_x, resolution_y, "Resolution")
time.sleep(0.5)
pyautogui.click(resolution_x, resolution_y + 50)  # Click an option in the dropdown
```

### Processing Multiple Batches

To process multiple folders:

```python
input_folders = [
    r"C:\Users\Romeo Burke\Videos\tiktok",
    r"C:\Users\Romeo Burke\Videos\other_folder"
]

for folder in input_folders:
    INPUT_FOLDER = folder
    automate_ffmediamaster(coordinates)
```

## Troubleshooting

### Image Recognition Not Working

If the script can't recognize buttons:

1. **Check Screenshots**: Look in the `button_screenshots` folder to ensure the screenshots are clear and show the buttons properly.

2. **Adjust Confidence**: Lower the `BUTTON_CONFIDENCE` value (e.g., to 0.6) to make matching less strict.

3. **Retake Screenshots**: Run option 1 again to retake button screenshots under the same conditions you'll run the automation.

4. **Check for Interface Changes**: If ffMediaMaster has been updated, the interface might have changed. Retake screenshots.

### Script Gets Stuck

If the script seems to get stuck:

1. **Increase Timeouts**: Adjust the `DEFAULT_TIMEOUT` value and individual `time.sleep()` values.

2. **Check for Dialogs**: The script might be waiting for a dialog that doesn't appear. Add code to handle unexpected dialogs.

3. **Add Debugging**: Add print statements to see where the script is getting stuck.

### Fallback Coordinates Not Working

If the fallback coordinates aren't working:

1. **Check Window Position**: Ensure ffMediaMaster opens in the same position each time.

2. **Update Coordinates**: Run option 1 again to update the coordinates.

3. **Use Relative Coordinates**: Modify the script to use coordinates relative to the window position rather than absolute screen coordinates.

## Advanced Customization

### Adding Verification Steps

To verify actions succeeded:

```python
# After clicking a button, check if the expected result appeared
if wait_for_image("expected_result.png", timeout=5):
    print("Action succeeded")
else:
    print("Action failed, trying alternative approach")
    # Alternative action
```

### Handling Dynamic Content

For interfaces with dynamic content:

```python
# Instead of looking for a specific image
# Look for a pattern or color that indicates success
x, y = 500, 300  # Position to check
if pyautogui.pixelMatchesColor(x, y, (0, 255, 0)):  # Green pixel indicates success
    print("Operation successful")
```

### Creating a Log File

To keep track of processing:

```python
# Add to the beginning of the script
import logging
logging.basicConfig(filename='automation.log', level=logging.INFO, 
                    format='%(asctime)s - %(message)s')

# Replace print statements with logging
logging.info("Starting automation")
```

## Final Tips

1. **Run During Quiet Times**: Run the automation when you're not using your computer for other tasks.

2. **Start Small**: Test with just a few videos before processing your entire collection.

3. **Monitor First Runs**: Watch the first few runs to ensure everything works correctly.

4. **Keep Screenshots Updated**: If you update ffMediaMaster or change your screen resolution, retake the button screenshots.

5. **Safety First**: Remember you can always abort by moving your mouse to any corner of the screen.