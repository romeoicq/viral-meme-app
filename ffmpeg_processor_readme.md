# FFmpeg Video Uniqueness Processor

This script processes video files to create unique versions by applying subtle modifications using FFmpeg. These modifications are designed to be minimally perceptible while making each video file unique.

## Features

- Processes multiple video formats (.mp4, .avi, .mkv, .mov, .wmv, .flv, .webm, .m4v, .3gp)
- Applies 3-5 random subtle modifications from a set of techniques:
  - Bitrate adjustment
  - Minor resolution tweaks
  - Framerate changes
  - Audio volume adjustments
  - Subtle color adjustments
  - Noise addition
  - Nearly invisible watermarks
  - Metadata changes
  - Codec parameter adjustments
- Creates detailed processing logs
- Preserves video quality while ensuring uniqueness

## Requirements

- Python 3.6+
- FFmpeg installed and available in PATH (or specified in the script)

## Quick Start

### Using Existing FFmpeg Installation

1. Run `configure_ffmpeg.bat` to configure the video processor to use your existing FFmpeg installation
2. The script will:
   - Detect your existing FFmpeg installation (at `C:\Users\Romeo Burke\Downloads\ffmpeg-7.1.1-full_build\ffmpeg-7.1.1-full_build\bin`)
   - Update the video processor script to use the detected FFmpeg
   - Test if the FFmpeg installation is working correctly

3. Once FFmpeg is configured, edit the input and output folders in `ffmpeg_video_processor.py`:
   ```python
   # Configuration - MODIFY THESE PATHS
   INPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok"    # Your videos
   OUTPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok_unique"  # Processed videos output
   ```

4. Run `run_ffmpeg_processor.bat` to start processing your videos

### Alternative: Automatic FFmpeg Download

If you need to install FFmpeg on another system, you can use the included downloader:

1. Run `download_ffmpeg.bat` to automatically download and set up FFmpeg
2. The script will:
   - Download the appropriate FFmpeg build for the system
   - Extract it to a local folder
   - Update the video processor script to use the downloaded FFmpeg
   - Attempt to add FFmpeg to the system PATH (requires admin privileges)

### Manual FFmpeg Setup

If you prefer to install FFmpeg manually:

1. Follow the instructions in `ffmpeg_installation_guide.md` to install FFmpeg
2. Run `test_ffmpeg.bat` to verify your FFmpeg installation is working correctly
3. Edit the input and output folder paths in `ffmpeg_video_processor.py`
4. Run `run_ffmpeg_processor.bat` to process your videos

## Usage

The script will:
- Check if FFmpeg is available
- Scan for video files in the input folder
- Process each video with random modifications
- Save processed videos to the output folder
- Generate a detailed processing log

## How It Works

For each video, the script:

1. Analyzes the video to get information about its streams
2. Generates a unique seed based on the file and current timestamp
3. Randomly selects 3-5 modification techniques
4. Builds FFmpeg filter chains based on the selected techniques
5. Processes the video with FFmpeg using the generated filters
6. Verifies the output and logs the results

## Modification Techniques

- **Bitrate Adjustment**: Adjusts video bitrate by ±5-20%
- **Resolution Tweak**: Makes minor adjustments to width/height (1-8 pixels)
- **Framerate Change**: Slightly adjusts the framerate
- **Audio Adjustment**: Modifies audio volume by ±5%
- **Color Adjustment**: Makes subtle changes to brightness, contrast, and saturation
- **Noise Addition**: Adds very subtle noise
- **Watermark Text**: Adds a nearly invisible text watermark
- **Metadata Change**: Adds unique metadata to the file
- **Codec Parameters**: Adjusts encoding parameters like CRF and keyframe interval

## Files Included

- `ffmpeg_video_processor.py` - Main video processing script
- `configure_ffmpeg.py` - Script to configure the processor to use your existing FFmpeg
- `download_ffmpeg.py` - Script to automatically download and set up FFmpeg (if needed)
- `test_ffmpeg.py` - Script to test FFmpeg functionality
- `ffmpeg_installation_guide.md` - Guide for manual FFmpeg installation
- `configure_ffmpeg.bat` - Batch file to run the FFmpeg configuration script
- `download_ffmpeg.bat` - Batch file to run the FFmpeg downloader
- `test_ffmpeg.bat` - Batch file to run the FFmpeg test
- `run_ffmpeg_processor.bat` - Batch file to run the main processor