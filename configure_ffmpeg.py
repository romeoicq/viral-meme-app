import os
import sys
import subprocess
from pathlib import Path

def find_ffmpeg():
    """Find existing FFmpeg installation"""
    print("🔍 Looking for existing FFmpeg installation...")
    
    # Check if FFmpeg is in PATH
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                               capture_output=True, 
                               text=True, 
                               timeout=10)
        
        if result.returncode == 0:
            # FFmpeg is in PATH, get its location
            if os.name == 'nt':  # Windows
                result = subprocess.run(['where', 'ffmpeg'], 
                                      capture_output=True, 
                                      text=True, 
                                      timeout=10)
                if result.returncode == 0:
                    ffmpeg_path = result.stdout.strip().split('\n')[0]
                    print(f"✅ Found FFmpeg in PATH: {ffmpeg_path}")
                    return Path(ffmpeg_path).parent
            else:  # Unix-like
                result = subprocess.run(['which', 'ffmpeg'], 
                                      capture_output=True, 
                                      text=True, 
                                      timeout=10)
                if result.returncode == 0:
                    ffmpeg_path = result.stdout.strip()
                    print(f"✅ Found FFmpeg in PATH: {ffmpeg_path}")
                    return Path(ffmpeg_path).parent
    except:
        pass
    
    # Check known locations
    known_locations = [
        # Windows
        Path(r"C:\Users\Romeo Burke\Downloads\ffmpeg-7.1.1-full_build\ffmpeg-7.1.1-full_build\bin"),
        Path(r"C:\ffmpeg\bin"),
        Path(r"C:\Program Files\ffmpeg\bin"),
        Path(r"C:\Program Files (x86)\ffmpeg\bin"),
        # Unix-like
        Path("/usr/bin"),
        Path("/usr/local/bin"),
        Path("/opt/ffmpeg/bin")
    ]
    
    for location in known_locations:
        ffmpeg_exe = location / ("ffmpeg.exe" if os.name == 'nt' else "ffmpeg")
        if ffmpeg_exe.exists():
            print(f"✅ Found FFmpeg at known location: {ffmpeg_exe}")
            return location
    
    # Ask user for FFmpeg location
    print("❓ Could not automatically find FFmpeg.")
    user_input = input("Please enter the full path to the directory containing ffmpeg executable: ")
    
    if user_input:
        user_path = Path(user_input)
        ffmpeg_exe = user_path / ("ffmpeg.exe" if os.name == 'nt' else "ffmpeg")
        
        if ffmpeg_exe.exists():
            print(f"✅ Found FFmpeg at user-specified location: {ffmpeg_exe}")
            return user_path
        else:
            print(f"❌ Could not find FFmpeg at {ffmpeg_exe}")
    
    return None

def test_ffmpeg(ffmpeg_dir):
    """Test if FFmpeg is working properly"""
    ffmpeg_exe = ffmpeg_dir / ("ffmpeg.exe" if os.name == 'nt' else "ffmpeg")
    
    if not ffmpeg_exe.exists():
        print(f"❌ FFmpeg executable not found at {ffmpeg_exe}")
        return False
    
    try:
        # Test FFmpeg
        result = subprocess.run([str(ffmpeg_exe), "-version"], 
                               capture_output=True, 
                               text=True, 
                               timeout=10)
        
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"✅ FFmpeg is working: {version_line}")
            return True
        else:
            print(f"❌ FFmpeg test failed with error code {result.returncode}")
            print(f"Error message: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ FFmpeg test failed: {e}")
        return False

def update_processor_script(ffmpeg_dir):
    """Update the FFmpeg path in the video processor script"""
    script_path = Path(__file__).parent / "ffmpeg_video_processor.py"
    
    if not script_path.exists():
        print("❌ Could not find ffmpeg_video_processor.py in the current directory")
        return False
    
    try:
        # Read the script content
        with open(script_path, 'r') as f:
            content = f.read()
        
        # Replace the FFmpeg path
        ffmpeg_path = str(ffmpeg_dir / ("ffmpeg.exe" if os.name == 'nt' else "ffmpeg")).replace('\\', '\\\\')
        updated_content = content.replace('FFMPEG_PATH = "ffmpeg"', f'FFMPEG_PATH = r"{ffmpeg_path}"')
        
        # Write the updated content
        with open(script_path, 'w') as f:
            f.write(updated_content)
        
        print("✅ Updated FFmpeg path in the video processor script")
        return True
    except Exception as e:
        print(f"❌ Failed to update the video processor script: {e}")
        return False

def main():
    print("=" * 60)
    print("FFmpeg Configuration for Video Uniqueness Processor")
    print("=" * 60)
    
    # Find existing FFmpeg installation
    ffmpeg_dir = find_ffmpeg()
    if not ffmpeg_dir:
        print("❌ Could not find FFmpeg installation")
        print("Please install FFmpeg or specify its location when prompted")
        return
    
    # Test FFmpeg
    if not test_ffmpeg(ffmpeg_dir):
        print("❌ FFmpeg test failed")
        return
    
    # Update the video processor script
    update_processor_script(ffmpeg_dir)
    
    print("\n" + "=" * 60)
    print("📝 Summary:")
    print(f"📁 FFmpeg found at: {ffmpeg_dir}")
    print(f"⚙️  FFmpeg executable: {ffmpeg_dir / ('ffmpeg.exe' if os.name == 'nt' else 'ffmpeg')}")
    print("🎬 The video processor script has been updated to use this FFmpeg installation")
    print("=" * 60)
    
    print("\n🎉 Configuration complete! You can now run the FFmpeg Video Uniqueness Processor.")
    print("Run 'run_ffmpeg_processor.bat' to start processing videos.")
    
    print("\nPress Enter to exit...")
    input()

if __name__ == "__main__":
    main()