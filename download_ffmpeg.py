import os
import sys
import zipfile
import shutil
import subprocess
import tempfile
from pathlib import Path
import urllib.request
import platform
import ctypes
import time

def is_admin():
    """Check if the script is running with administrator privileges (Windows only)"""
    try:
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    except:
        return False

def download_progress(count, block_size, total_size):
    """Show download progress"""
    percent = int(count * block_size * 100 / total_size)
    sys.stdout.write(f"\rDownloading FFmpeg: {percent}% [{count * block_size}/{total_size} bytes]")
    sys.stdout.flush()

def download_ffmpeg():
    """Download and set up FFmpeg for Windows"""
    print("🔍 Detecting system information...")
    
    # Determine system architecture
    is_64bit = sys.maxsize > 2**32
    arch = "64" if is_64bit else "32"
    print(f"✓ System architecture: {'64-bit' if is_64bit else '32-bit'}")
    
    # Create a directory for FFmpeg
    script_dir = Path(__file__).parent.absolute()
    ffmpeg_dir = script_dir / "ffmpeg"
    
    # Check if FFmpeg is already downloaded
    ffmpeg_exe = ffmpeg_dir / "bin" / "ffmpeg.exe"
    if ffmpeg_exe.exists():
        print(f"✓ FFmpeg is already downloaded at {ffmpeg_exe}")
        return str(ffmpeg_dir)
    
    print(f"📁 Creating FFmpeg directory at {ffmpeg_dir}")
    ffmpeg_dir.mkdir(exist_ok=True)
    
    # FFmpeg download URL (using gyan.dev builds)
    # We're using a specific version to ensure stability
    if is_64bit:
        download_url = "https://github.com/GyanD/codexffmpeg/releases/download/5.1.2/ffmpeg-5.1.2-essentials_build.zip"
    else:
        download_url = "https://github.com/GyanD/codexffmpeg/releases/download/5.1.2/ffmpeg-5.1.2-essentials_build.zip"
    
    print(f"🌐 Downloading FFmpeg from {download_url}")
    
    # Create a temporary directory for the download
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_dir_path = Path(temp_dir)
        zip_path = temp_dir_path / "ffmpeg.zip"
        
        # Download the FFmpeg zip file
        try:
            urllib.request.urlretrieve(download_url, zip_path, reporthook=download_progress)
            print("\n✓ Download complete")
        except Exception as e:
            print(f"\n❌ Download failed: {e}")
            return None
        
        # Extract the zip file
        print("📦 Extracting FFmpeg...")
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir_path)
            print("✓ Extraction complete")
        except Exception as e:
            print(f"❌ Extraction failed: {e}")
            return None
        
        # Find the extracted directory (it might have a version number in the name)
        extracted_dirs = [d for d in temp_dir_path.iterdir() if d.is_dir() and "ffmpeg" in d.name.lower()]
        if not extracted_dirs:
            print("❌ Could not find extracted FFmpeg directory")
            return None
        
        extracted_dir = extracted_dirs[0]
        
        # Copy the contents to our FFmpeg directory
        print(f"📋 Copying FFmpeg files to {ffmpeg_dir}...")
        try:
            # Copy all files and directories
            for item in extracted_dir.iterdir():
                if item.is_dir():
                    shutil.copytree(item, ffmpeg_dir / item.name)
                else:
                    shutil.copy2(item, ffmpeg_dir / item.name)
            print("✓ Files copied successfully")
        except Exception as e:
            print(f"❌ Copy failed: {e}")
            return None
    
    # Verify the installation
    if not ffmpeg_exe.exists():
        print(f"❌ FFmpeg executable not found at expected location: {ffmpeg_exe}")
        return None
    
    print("✅ FFmpeg has been successfully downloaded and set up")
    return str(ffmpeg_dir)

def update_system_path(ffmpeg_bin_dir):
    """Add FFmpeg to the system PATH (requires admin privileges)"""
    if not is_admin():
        print("⚠️ Adding FFmpeg to system PATH requires administrator privileges")
        print("ℹ️ You can still use FFmpeg by specifying the full path in the video processor script")
        return False
    
    try:
        # Get the current PATH
        import winreg
        with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 0, winreg.KEY_ALL_ACCESS) as key:
            path = winreg.QueryValueEx(key, 'Path')[0]
            
            # Check if the directory is already in PATH
            if str(ffmpeg_bin_dir) in path:
                print("✓ FFmpeg is already in your system PATH")
                return True
            
            # Add the directory to PATH
            new_path = path + ';' + str(ffmpeg_bin_dir)
            winreg.SetValueEx(key, 'Path', 0, winreg.REG_EXPAND_SZ, new_path)
            
        print("✅ FFmpeg has been added to your system PATH")
        print("ℹ️ You may need to restart your command prompt or computer for the changes to take effect")
        return True
    except Exception as e:
        print(f"❌ Failed to update system PATH: {e}")
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
        ffmpeg_path = str(Path(ffmpeg_dir) / "bin" / "ffmpeg.exe").replace('\\', '\\\\')
        updated_content = content.replace('FFMPEG_PATH = "ffmpeg"', f'FFMPEG_PATH = r"{ffmpeg_path}"')
        
        # Write the updated content
        with open(script_path, 'w') as f:
            f.write(updated_content)
        
        print("✅ Updated FFmpeg path in the video processor script")
        return True
    except Exception as e:
        print(f"❌ Failed to update the video processor script: {e}")
        return False

def test_ffmpeg(ffmpeg_dir):
    """Test if FFmpeg is working properly"""
    ffmpeg_exe = Path(ffmpeg_dir) / "bin" / "ffmpeg.exe"
    
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

def main():
    print("=" * 60)
    print("FFmpeg Downloader and Setup for Video Uniqueness Processor")
    print("=" * 60)
    
    # Check if we're on Windows
    if platform.system() != "Windows":
        print("❌ This script is designed for Windows only")
        print("Please follow the manual installation instructions for your platform")
        return
    
    # Download and set up FFmpeg
    ffmpeg_dir = download_ffmpeg()
    if not ffmpeg_dir:
        print("❌ Failed to download and set up FFmpeg")
        return
    
    # Update the video processor script
    update_processor_script(ffmpeg_dir)
    
    # Test FFmpeg
    test_ffmpeg(ffmpeg_dir)
    
    # Try to add FFmpeg to system PATH (requires admin privileges)
    ffmpeg_bin_dir = Path(ffmpeg_dir) / "bin"
    update_system_path(str(ffmpeg_bin_dir))
    
    print("\n" + "=" * 60)
    print("📝 Summary:")
    print(f"📁 FFmpeg installed to: {ffmpeg_dir}")
    print(f"⚙️  FFmpeg executable: {Path(ffmpeg_dir) / 'bin' / 'ffmpeg.exe'}")
    print("🎬 The video processor script has been updated to use this FFmpeg installation")
    print("=" * 60)
    
    print("\n🎉 Setup complete! You can now run the FFmpeg Video Uniqueness Processor.")
    print("Run 'run_ffmpeg_processor.bat' to start processing videos.")
    
    print("\nPress Enter to exit...")
    input()

if __name__ == "__main__":
    main()