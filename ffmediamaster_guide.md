# Guide for Processing Videos with ffMediaMaster

## Files to Process
- Video file: `C:\Users\Romeo Burke\Videos\tiktok\snaptik_7461326251853090081_hd.mp4`
- Output folder: `C:\Users\Romeo Burke\Videos\output`

## Steps to Process Videos

1. **Open ffMediaMaster**
   - Launch the ffMediaMaster application from your Start menu or desktop shortcut

2. **Add Video Files**
   - Click the "Add Files" button in the top left corner
   - Navigate to `C:\Users\Romeo Burke\Videos\tiktok`
   - Select the video file(s) you want to process
   - Alternatively, you can drag and drop the files from File Explorer into the ffMediaMaster window

3. **Configure Processing Options**
   - After adding files, ffMediaMaster should show options for processing
   - You can apply various transformations:
     - Adjust bitrate (±5-15%)
     - Slightly change resolution (by a few pixels)
     - Modify frame rate
     - Adjust audio volume
     - Change keyframe interval
     - Adjust quality (CRF value)
     - Add subtle watermark

4. **Set Output Location**
   - Ensure the output location is set to `C:\Users\Romeo Burke\Videos\output`
   - Make sure the output folder exists (create it if it doesn't)

5. **Process the Videos**
   - Click the process/convert button to start processing
   - Wait for the processing to complete

6. **Verify Results**
   - Check the output folder to ensure the processed videos are there
   - Play the videos to verify they work correctly

## Notes
- ffMediaMaster is a GUI application and doesn't support command-line automation in the way attempted in the script
- The original script failed because it was trying to use ffprobe to get video information, but ffprobe might not be installed
- For batch processing of multiple videos, you can add all videos at once to ffMediaMaster

## Troubleshooting
- If ffMediaMaster doesn't recognize your video files, check if you have the necessary codecs installed
- If the output files are not created, check if you have write permissions to the output folder
- If the application crashes, try processing one video at a time with simpler settings