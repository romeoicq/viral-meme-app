# ffMediaMaster Automation Options

I've created several approaches to help you automate ffMediaMaster. Each has different advantages and complexity levels.

## Option 1: Manual Process with Preparation Script

**Script**: `prepare_for_ffmediamaster.py`

This is the simplest approach that:
- Verifies your input/output folders exist
- Checks that video files are accessible
- Generates suggested unique output filenames
- Provides step-by-step instructions for manual processing

**Advantages**:
- Most reliable (no automation failures)
- No dependencies required
- Works regardless of ffMediaMaster interface changes

**Disadvantages**:
- Requires manual interaction with ffMediaMaster
- Not fully automated

**When to use**: When you want a reliable solution and don't mind the manual steps.

## Option 2: PyAutoGUI Automation

**Script**: `automate_ffmediamaster.py`

This approach uses PyAutoGUI to control your mouse and keyboard to interact with ffMediaMaster:
- Takes screenshots to help determine button coordinates
- Automates clicking buttons and entering text
- Handles the entire process from start to finish

**Advantages**:
- Fully automated solution
- Relatively simple to understand and modify
- Works with any GUI application

**Disadvantages**:
- Relies on screen coordinates which can break if:
  - Screen resolution changes
  - ffMediaMaster interface changes
  - Window position changes
- May require adjustments for different systems

**When to use**: When you want full automation and are willing to adjust coordinates as needed.

## Option 3: Pywinauto Automation

**Script**: `automate_with_pywinauto.py`

This approach uses Pywinauto, which is specifically designed for Windows GUI automation:
- Identifies controls by their properties rather than coordinates
- More robust to interface changes
- Provides detailed information about the application's controls

**Advantages**:
- More robust than PyAutoGUI
- Less dependent on screen resolution or window position
- Better error handling and control identification

**Disadvantages**:
- More complex to set up and understand
- Requires more technical knowledge to customize
- May still need adjustments for different versions of ffMediaMaster

**When to use**: When you need a more robust automation solution that's less likely to break with minor interface changes.

## Getting Started

1. **For the manual approach**:
   ```
   python prepare_for_ffmediamaster.py
   ```
   Then follow the instructions provided.

2. **For PyAutoGUI automation**:
   First, determine the coordinates:
   ```
   python automate_ffmediamaster.py
   ```
   Enter `1` when prompted, then note the coordinates of important buttons.
   
   Update the script with these coordinates, then run it again and enter `2` to start the automation.

3. **For Pywinauto automation**:
   First, analyze the application:
   ```
   python automate_with_pywinauto.py
   ```
   Enter `1` when prompted, then note the control identifiers.
   
   Update the script with these identifiers, then run it again and enter `2` to start the automation.

## Recommended Approach

I recommend starting with the simplest approach (Option 1) to ensure everything works correctly. Then, if you need full automation, try Option 2 (PyAutoGUI) for a quick solution or Option 3 (Pywinauto) for a more robust solution.

For detailed instructions on each approach, refer to:
- `ffmediamaster_guide.md` - Manual process guide
- `gui_automation_guide.md` - PyAutoGUI automation guide

## Troubleshooting

If you encounter issues with any of the automation approaches:

1. **For PyAutoGUI**:
   - Ensure the ffMediaMaster window is fully visible and not minimized
   - Try increasing the wait times between actions
   - Verify the coordinates are correct for your screen resolution

2. **For Pywinauto**:
   - Make sure you've updated the script with the correct control identifiers
   - Try using the fallback coordinate-based approach if control identification fails
   - Increase wait times between actions

Remember that GUI automation can be fragile and may require adjustments based on your specific environment and the version of ffMediaMaster you're using.