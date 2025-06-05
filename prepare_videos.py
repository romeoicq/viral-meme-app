import os
import shutil
import random
import time
from pathlib import Path
from datetime import datetime

def prepare_videos_for_processing():
    # Configuration
    INPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok"
    OUTPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\output"
    PREPARED_FOLDER = r"C:\Users\Romeo Burke\Videos\prepared"
    
    input_path = Path(INPUT_FOLDER)
    output_path = Path(OUTPUT_FOLDER)
    prepared_path = Path(PREPARED_FOLDER)
    
    # Create output and prepared folders if they don't exist
    output_path.mkdir(parents=True, exist_ok=True)
    prepared_path.mkdir(parents=True, exist_ok=True)
    
    print("🎬 Video Preparation Starting...")
    print(f"📂 Input folder: {INPUT_FOLDER}")
    print(f"📁 Prepared folder: {PREPARED_FOLDER}")
    print(f"📁 Output folder: {OUTPUT_FOLDER}")
    
    # Check if input folder exists
    if not input_path.exists():
        print(f"❌ Input folder does not exist: {INPUT_FOLDER}")
        return
    
    # Find all video files
    supported_formats = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm']
    video_files = []
    
    for ext in supported_formats:
        video_files.extend(input_path.glob(f"*{ext}"))
        video_files.extend(input_path.glob(f"*{ext.upper()}"))
    
    if not video_files:
        print("No video files found in the input folder!")
        print("Files in directory:")
        for file in input_path.iterdir():
            print(f"  {file.name}")
        return
    
    print(f"Found {len(video_files)} video files to prepare")
    
    # Copy files to prepared folder with unique names
    for video_file in video_files:
        try:
            # Generate a unique filename
            stem = video_file.stem
            suffix = video_file.suffix
            timestamp = int(time.time())
            random_suffix = random.randint(1000, 9999)
            new_filename = f"{stem}_unique_{timestamp}_{random_suffix}{suffix}"
            
            # Destination path
            dest_path = prepared_path / new_filename
            
            print(f"Copying {video_file.name} to {dest_path.name}")
            
            # Copy the file
            shutil.copy2(video_file, dest_path)
            
            print(f"✅ Successfully prepared: {new_filename}")
            
        except Exception as e:
            print(f"❌ Error preparing {video_file.name}: {e}")
    
    print("\n📋 Instructions for using ffMediaMaster:")
    print("1. Open ffMediaMaster application")
    print("2. Click 'Add Files' or drag and drop videos from the prepared folder:")
    print(f"   {PREPARED_FOLDER}")
    print("3. Configure your desired transformations in the ffMediaMaster interface")
    print("4. Set the output folder to:")
    print(f"   {OUTPUT_FOLDER}")
    print("5. Click the process/convert button to start processing")
    print("\n🎉 Preparation complete!")

if __name__ == "__main__":
    prepare_videos_for_processing()