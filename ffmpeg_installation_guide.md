# FFmpeg Installation Guide

The FFmpeg Video Uniqueness Processor requires FFmpeg to be installed on your system. This guide will help you install FFmpeg on Windows.

## Windows Installation

### Method 1: Using the Official Build

1. Visit the official FFmpeg download page: https://ffmpeg.org/download.html
2. Under "Get packages & executable files," click on "Windows"
3. Choose one of the download links (e.g., gyan.dev or BtbN)
4. Download the latest release build (typically a .zip file)
5. Extract the downloaded zip file to a location on your computer (e.g., `C:\ffmpeg`)
6. Add FFmpeg to your system PATH:
   - Right-click on "This PC" or "My Computer" and select "Properties"
   - Click on "Advanced system settings"
   - Click on "Environment Variables"
   - Under "System variables," find the "Path" variable, select it, and click "Edit"
   - Click "New" and add the path to the FFmpeg `bin` folder (e.g., `C:\ffmpeg\bin`)
   - Click "OK" on all dialogs to save the changes
7. Restart any open command prompts or PowerShell windows

### Method 2: Using Chocolatey Package Manager

If you have Chocolatey installed, you can use it to install FFmpeg:

1. Open PowerShell as Administrator
2. Run the following command:
   ```
   choco install ffmpeg
   ```
3. Wait for the installation to complete

### Method 3: Using Scoop Package Manager

If you have Scoop installed, you can use it to install FFmpeg:

1. Open PowerShell
2. Run the following command:
   ```
   scoop install ffmpeg
   ```
3. Wait for the installation to complete

## Verifying the Installation

To verify that FFmpeg is installed correctly:

1. Open a new Command Prompt or PowerShell window
2. Run the following command:
   ```
   ffmpeg -version
   ```
3. You should see information about the FFmpeg version

## Updating the Script

If you've installed FFmpeg but it's not in your system PATH, you can update the script to point directly to the FFmpeg executable:

1. Open `ffmpeg_video_processor.py` in a text editor
2. Find the following line in the `main()` function:
   ```python
   FFMPEG_PATH = "ffmpeg"  # Change if ffmpeg is not in PATH
   ```
3. Change it to point to your FFmpeg executable:
   ```python
   FFMPEG_PATH = r"C:\path\to\ffmpeg\bin\ffmpeg.exe"  # Full path to ffmpeg executable
   ```
4. Save the file

## Additional Resources

- FFmpeg Documentation: https://ffmpeg.org/documentation.html
- FFmpeg Wiki: https://trac.ffmpeg.org/wiki