import os
import random
import time
from pathlib import Path
from datetime import datetime

def prepare_for_ffmediamaster():
    # Configuration
    INPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok"
    OUTPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\output"
    
    input_path = Path(INPUT_FOLDER)
    output_path = Path(OUTPUT_FOLDER)
    
    print("🎬 Video Processing Preparation")
    print(f"📂 Input folder: {INPUT_FOLDER}")
    print(f"📁 Output folder: {OUTPUT_FOLDER}")
    
    # Create output folder if it doesn't exist
    try:
        output_path.mkdir(parents=True, exist_ok=True)
        print(f"✅ Output folder ready: {OUTPUT_FOLDER}")
    except Exception as e:
        print(f"❌ Error creating output folder: {e}")
        return
    
    # Check if input folder exists
    if not input_path.exists():
        print(f"❌ Input folder does not exist: {INPUT_FOLDER}")
        return
    print(f"✅ Input folder exists: {INPUT_FOLDER}")
    
    # Find all video files
    supported_formats = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm']
    video_files = []
    
    for ext in supported_formats:
        video_files.extend(input_path.glob(f"*{ext}"))
        video_files.extend(input_path.glob(f"*{ext.upper()}"))
    
    if not video_files:
        print("❌ No video files found in the input folder!")
        print("Files in directory:")
        for file in input_path.iterdir():
            print(f"  {file.name}")
        return
    
    print(f"✅ Found {len(video_files)} video files:")
    for video in video_files:
        print(f"  {video.name}")
        # Check if file exists and is readable
        try:
            with open(video, 'rb') as f:
                f.read(1024)  # Read first 1KB to check if file is accessible
            print(f"    ✅ File is accessible and readable")
        except Exception as e:
            print(f"    ❌ Error accessing file: {e}")
    
    # Generate suggested output filenames
    print("\n📋 Suggested output filenames:")
    for video in video_files:
        stem = video.stem
        suffix = video.suffix
        timestamp = int(time.time())
        random_suffix = random.randint(1000, 9999)
        suggested_filename = f"{stem}_unique_{timestamp}_{random_suffix}{suffix}"
        suggested_path = output_path / suggested_filename
        print(f"  {video.name} → {suggested_filename}")
    
    print("\n📋 Instructions for using ffMediaMaster:")
    print("1. Open ffMediaMaster application")
    print("2. Click 'Add Files' or drag and drop videos from:")
    print(f"   {INPUT_FOLDER}")
    print("3. Configure your desired transformations in the ffMediaMaster interface")
    print("4. Set the output folder to:")
    print(f"   {OUTPUT_FOLDER}")
    print("5. Click the process/convert button to start processing")
    print("\n🎉 Preparation complete!")

if __name__ == "__main__":
    prepare_for_ffmediamaster()