import subprocess
import sys
import os
from pathlib import Path

def check_ffmpeg():
    """Check if FFmpeg is installed and working properly"""
    print("🔍 Testing FFmpeg installation...")
    
    try:
        # Test basic FFmpeg availability
        result = subprocess.run(['ffmpeg', '-version'], 
                               capture_output=True, 
                               text=True, 
                               timeout=10)
        
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"✅ FFmpeg is installed: {version_line}")
        else:
            print(f"❌ FFmpeg command failed with error code {result.returncode}")
            print(f"Error message: {result.stderr}")
            return False
            
        # Test FFprobe availability
        result = subprocess.run(['ffprobe', '-version'], 
                               capture_output=True, 
                               text=True, 
                               timeout=10)
        
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"✅ FFprobe is installed: {version_line}")
        else:
            print(f"❌ FFprobe command failed with error code {result.returncode}")
            print(f"Error message: {result.stderr}")
            return False
        
        # Test basic functionality by creating a test video
        print("\n🎬 Testing basic FFmpeg functionality...")
        test_output = Path("ffmpeg_test_output.mp4")
        
        # Create a 3-second test video with a color pattern
        cmd = [
            'ffmpeg',
            '-y',  # Overwrite output file if it exists
            '-f', 'lavfi',  # Use libavfilter virtual input
            '-i', 'testsrc=duration=3:size=640x480:rate=30',  # Generate test pattern
            '-c:v', 'libx264',  # Use H.264 codec
            '-pix_fmt', 'yuv420p',  # Pixel format for compatibility
            str(test_output)
        ]
        
        print(f"⚙️  Running command: {' '.join(cmd)}")
        
        result = subprocess.run(cmd, 
                               capture_output=True, 
                               text=True, 
                               timeout=30)
        
        if result.returncode == 0 and test_output.exists():
            file_size = test_output.stat().st_size / 1024  # Size in KB
            print(f"✅ Successfully created test video ({file_size:.1f} KB)")
            
            # Clean up test file
            test_output.unlink()
            print("🧹 Removed test file")
            
            print("\n🎉 All tests passed! FFmpeg is working correctly.")
            return True
        else:
            print(f"❌ Failed to create test video")
            print(f"Error message: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("❌ FFmpeg not found. Make sure it's installed and in your PATH.")
        print("💡 See ffmpeg_installation_guide.md for installation instructions.")
        return False
    except subprocess.TimeoutExpired:
        print("❌ FFmpeg command timed out.")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    print("=" * 50)
    print("FFmpeg Installation Tester")
    print("=" * 50)
    
    success = check_ffmpeg()
    
    if success:
        print("\n✅ Your FFmpeg installation is working correctly!")
        print("🚀 You can now use the FFmpeg Video Uniqueness Processor.")
    else:
        print("\n❌ There were issues with your FFmpeg installation.")
        print("📚 Please check the ffmpeg_installation_guide.md for help.")
    
    print("\nPress Enter to exit...")
    input()

if __name__ == "__main__":
    main()