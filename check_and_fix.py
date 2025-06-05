import os
import json
from pathlib import Path

# Configuration
INPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok"
OUTPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok_unique"
FFMPEG_PATH = r"C:\Users\Romeo Burke\Downloads\ffmpeg-7.1.1-full_build\ffmpeg-7.1.1-full_build\bin\ffmpeg.exe"

def check_input_folder():
    """Check if the input folder exists and contains video files"""
    input_path = Path(INPUT_FOLDER)
    
    # Check if input folder exists
    if not input_path.exists():
        print(f"❌ Input folder does not exist: {INPUT_FOLDER}")
        create = input("Would you like to create it? (y/n): ")
        if create.lower() == 'y':
            input_path.mkdir(parents=True, exist_ok=True)
            print(f"✅ Created input folder: {INPUT_FOLDER}")
            print(f"Please add your TikTok videos to this folder and run the processor again.")
        return False
    
    # Check if input folder contains video files
    video_extensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp']
    video_files = []
    
    for ext in video_extensions:
        video_files.extend(input_path.glob(f"*{ext}"))
        video_files.extend(input_path.glob(f"*{ext.upper()}"))
    
    if not video_files:
        print(f"❌ No video files found in input folder: {INPUT_FOLDER}")
        print(f"Please add your TikTok videos to this folder and run the processor again.")
        return False
    
    print(f"✅ Found {len(video_files)} video files in input folder")
    for video in video_files:
        print(f"  - {video.name}")
    
    return True

def check_output_folder():
    """Check if the output folder exists and contains processed videos"""
    output_path = Path(OUTPUT_FOLDER)
    
    # Check if output folder exists
    if not output_path.exists():
        print(f"❌ Output folder does not exist: {OUTPUT_FOLDER}")
        create = input("Would you like to create it? (y/n): ")
        if create.lower() == 'y':
            output_path.mkdir(parents=True, exist_ok=True)
            print(f"✅ Created output folder: {OUTPUT_FOLDER}")
        return False
    
    # Check if output folder contains video files
    video_extensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp']
    video_files = []
    
    for ext in video_extensions:
        video_files.extend(output_path.glob(f"*{ext}"))
        video_files.extend(output_path.glob(f"*{ext.upper()}"))
    
    if not video_files:
        print(f"❌ No processed video files found in output folder: {OUTPUT_FOLDER}")
        
        # Check if there's a log file
        log_files = list(output_path.glob("processing_log_*.json"))
        if log_files:
            latest_log = max(log_files, key=lambda x: x.stat().st_mtime)
            print(f"📝 Found log file: {latest_log.name}")
            
            # Check log file for errors
            try:
                with open(latest_log, 'r') as f:
                    log_data = json.load(f)
                
                if log_data:
                    successful = [entry for entry in log_data if entry.get('status') == 'success']
                    failed = [entry for entry in log_data if entry.get('status') == 'failed']
                    
                    print(f"📊 Log summary: {len(successful)} successful, {len(failed)} failed")
                    
                    if failed:
                        print(f"❌ Found errors in log file:")
                        for entry in failed:
                            print(f"  - Error processing {Path(entry['input_file']).name}: {entry.get('error', 'Unknown error')[:100]}...")
            except Exception as e:
                print(f"❌ Error reading log file: {e}")
        
        return False
    
    print(f"✅ Found {len(video_files)} processed video files in output folder")
    for video in video_files:
        print(f"  - {video.name}")
    
    return True

def check_ffmpeg():
    """Check if FFmpeg exists at the specified path"""
    ffmpeg_path = Path(FFMPEG_PATH)
    
    if not ffmpeg_path.exists():
        print(f"❌ FFmpeg not found at: {FFMPEG_PATH}")
        return False
    
    print(f"✅ FFmpeg found at: {FFMPEG_PATH}")
    return True

def main():
    print("🔍 TikTok Video Processor Diagnostic Tool")
    print("="*50)
    
    # Check FFmpeg
    ffmpeg_ok = check_ffmpeg()
    print()
    
    # Check input folder
    input_ok = check_input_folder()
    print()
    
    # Check output folder
    output_ok = check_output_folder()
    print()
    
    # Summary
    print("📊 Summary:")
    print(f"  FFmpeg: {'✅ OK' if ffmpeg_ok else '❌ Not found'}")
    print(f"  Input folder: {'✅ OK' if input_ok else '❌ Issue detected'}")
    print(f"  Output folder: {'✅ OK' if output_ok else '❌ Issue detected'}")
    
    if not input_ok:
        print("\n⚠️ Please add video files to your input folder:")
        print(f"  {INPUT_FOLDER}")
        print("Then run the processor again using Run_TikTok_Processor.bat")
    
    print("\nPress Enter to exit...")
    input()

if __name__ == "__main__":
    main()