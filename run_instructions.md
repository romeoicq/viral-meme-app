# How to Run the Automation Script

The script is currently located in: `C:\Users\Romeo Burke\Desktop\fresh-nextjs\`

## Option 1: Navigate to the script directory

1. Open PowerShell or Command Prompt
2. Navigate to the script directory:
   ```
   cd C:\Users\Romeo Burke\Desktop\fresh-nextjs
   ```
3. Run the script:
   ```
   python enhanced_pyautogui_automation.py
   ```

## Option 2: Copy the script to a more convenient location

1. Copy the script to your home directory or another preferred location:
   ```
   copy "C:\Users\Romeo Burke\Desktop\fresh-nextjs\enhanced_pyautogui_automation.py" "C:\Users\Romeo Burke\"
   ```
2. Also copy any related files:
   ```
   copy "C:\Users\Romeo Burke\Desktop\fresh-nextjs\*.md" "C:\Users\Romeo Burke\"
   ```
3. Run the script from your preferred location:
   ```
   cd C:\Users\Romeo Burke
   python enhanced_pyautogui_automation.py
   ```

## Option 3: Use the full path when running the script

You can also run the script using its full path:
```
python "C:\Users\Romeo Burke\Desktop\fresh-nextjs\enhanced_pyautogui_automation.py"
```

## Creating a Shortcut (Optional)

For easier access, you can create a batch file:

1. Open Notepad
2. Enter the following:
   ```
   @echo off
   cd "C:\Users\Romeo Burke\Desktop\fresh-nextjs"
   python enhanced_pyautogui_automation.py
   pause
   ```
3. Save as `run_automation.bat` in a convenient location
4. Double-click the batch file to run the script

## Troubleshooting

If you get "python not found" errors, try using the full path to Python:
```
C:\Python313\python.exe "C:\Users\Romeo Burke\Desktop\fresh-nextjs\enhanced_pyautogui_automation.py"
```

Make sure all required files are in the same directory:
- enhanced_pyautogui_automation.py
- button_screenshots folder (will be created by the script)
- button_coordinates.py (will be created by the script)