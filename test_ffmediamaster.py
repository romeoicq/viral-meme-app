import subprocess
import os
from pathlib import Path

def main():
    # Configuration
    FFMEDIAMASTER_PATH = r"C:\Program Files\ffMediaMaster\ffmediamaster.exe"
    INPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok"
    OUTPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\output"
    
    # Ensure output folder exists
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    
    # Check if ffmediamaster exists
    if not Path(FFMEDIAMASTER_PATH).exists():
        print(f"❌ FFmediamaster not found at: {FFMEDIAMASTER_PATH}")
        return
    
    print(f"✅ FFmediamaster found at: {FFMEDIAMASTER_PATH}")
    
    # Check if input folder exists and list files
    input_path = Path(INPUT_FOLDER)
    if not input_path.exists():
        print(f"❌ Input folder does not exist: {INPUT_FOLDER}")
        return
    
    print(f"✅ Input folder exists: {INPUT_FOLDER}")
    
    # List video files
    video_files = list(input_path.glob("*.mp4")) + list(input_path.glob("*.MP4"))
    video_files += list(input_path.glob("*.avi")) + list(input_path.glob("*.AVI"))
    video_files += list(input_path.glob("*.mkv")) + list(input_path.glob("*.MKV"))
    video_files += list(input_path.glob("*.mov")) + list(input_path.glob("*.MOV"))
    
    if not video_files:
        print("❌ No video files found in the input folder")
        # List all files in the directory
        print("Files in directory:")
        for file in input_path.iterdir():
            print(f"  {file.name}")
        return
    
    print(f"✅ Found {len(video_files)} video files:")
    for video in video_files:
        print(f"  {video.name}")
    
    # Try to process the first video file with minimal parameters
    if video_files:
        input_file = video_files[0]
        output_file = Path(OUTPUT_FOLDER) / f"test_output_{input_file.stem}.mp4"
        
        print(f"\nTesting with file: {input_file}")
        print(f"Output will be: {output_file}")
        
        # Simple command with minimal parameters
        cmd = [
            FFMEDIAMASTER_PATH,
            "-i", str(input_file),
            "-c:v", "libx264",
            "-crf", "23",
            str(output_file)
        ]
        
        print(f"\nExecuting command: {' '.join(cmd)}")
        
        try:
            # Run with real-time output
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            print("\nCommand output:")
            for line in process.stdout:
                print(f"  {line.strip()}")
            
            # Wait for process to complete
            process.wait(timeout=30)  # 30 second timeout
            
            # Get any stderr
            stderr = process.stderr.read()
            if stderr:
                print(f"\nErrors:\n{stderr}")
            
            if process.returncode == 0:
                print(f"\n✅ Test successful! Output file created: {output_file}")
            else:
                print(f"\n❌ Test failed with return code: {process.returncode}")
                
        except subprocess.TimeoutExpired:
            print("\n⚠️ Command timed out after 30 seconds")
            process.kill()
        except Exception as e:
            print(f"\n❌ Error executing command: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    main()