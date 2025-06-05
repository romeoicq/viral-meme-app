import os
import subprocess
import random
import json
import time
import hashlib
from pathlib import Path
from datetime import datetime

# CONFIGURATION - ALREADY SET UP FOR YOUR SYSTEM
FFMPEG_PATH = r"C:\Users\Romeo Burke\Downloads\ffmpeg-7.1.1-full_build\ffmpeg-7.1.1-full_build\bin\ffmpeg.exe"
FFPROBE_PATH = r"C:\Users\Romeo Burke\Downloads\ffmpeg-7.1.1-full_build\ffmpeg-7.1.1-full_build\bin\ffprobe.exe"
INPUT_VIDEO = r"C:\Users\Romeo Burke\Videos\tiktok\snaptik_7461326251853090081_hd.mp4"
OUTPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok_unique"

def check_paths():
    """Check if all paths exist"""
    print("🔍 Checking paths...")
    
    # Check FFmpeg
    if not Path(FFMPEG_PATH).exists():
        print(f"❌ FFmpeg not found at: {FFMPEG_PATH}")
        return False
    print(f"✅ FFmpeg found at: {FFMPEG_PATH}")
    
    # Check FFprobe
    if not Path(FFPROBE_PATH).exists():
        print(f"❌ FFprobe not found at: {FFPROBE_PATH}")
        return False
    print(f"✅ FFprobe found at: {FFPROBE_PATH}")
    
    # Check input video
    if not Path(INPUT_VIDEO).exists():
        print(f"❌ Input video not found at: {INPUT_VIDEO}")
        return False
    print(f"✅ Input video found at: {INPUT_VIDEO}")
    
    # Check output folder
    output_path = Path(OUTPUT_FOLDER)
    if not output_path.exists():
        print(f"❌ Output folder does not exist: {OUTPUT_FOLDER}")
        print(f"Creating output folder...")
        output_path.mkdir(parents=True, exist_ok=True)
    print(f"✅ Output folder: {OUTPUT_FOLDER}")
    
    return True

def get_video_info(video_path):
    """Get detailed video information using ffprobe"""
    try:
        cmd = [
            FFPROBE_PATH, '-v', 'quiet', '-print_format', 'json',
            '-show_format', '-show_streams', str(video_path)
        ]
        print(f"⚙️  Running command: {' '.join(cmd)}")
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            video_info = json.loads(result.stdout)
            print("✅ Successfully retrieved video information")
            
            # Print some basic info
            for stream in video_info.get('streams', []):
                if stream.get('codec_type') == 'video':
                    print(f"📹 Video: {stream.get('width')}x{stream.get('height')}, {stream.get('codec_name')}")
                elif stream.get('codec_type') == 'audio':
                    print(f"🔊 Audio: {stream.get('codec_name')}, {stream.get('channels')} channels")
            
            return video_info
        else:
            print(f"❌ FFprobe failed with error code {result.returncode}")
            print(f"Error: {result.stderr}")
            return None
    except Exception as e:
        print(f"❌ Error getting video info: {e}")
        return None

def generate_unique_seed(video_path):
    """Generate a unique seed based on file and timestamp"""
    file_hash = hashlib.md5(str(video_path).encode()).hexdigest()[:8]
    time_hash = str(int(time.time() * 1000000))[-8:]
    return f"{file_hash}_{time_hash}"

def build_ffmpeg_filters(video_info, unique_seed):
    """Build FFmpeg filter chains for uniqueness"""
    print("🔧 Building FFmpeg filters...")
    
    filters = []
    video_filters = []
    audio_filters = []
    
    # Get video stream info
    video_stream = None
    audio_stream = None
    
    for stream in video_info.get('streams', []):
        if stream.get('codec_type') == 'video' and not video_stream:
            video_stream = stream
        elif stream.get('codec_type') == 'audio' and not audio_stream:
            audio_stream = stream
    
    # Select just 2 techniques for simplicity
    techniques = ['bitrate_adjustment', 'metadata_change']
    applied_changes = []
    
    for technique in techniques:
        if technique == 'bitrate_adjustment':
            # Adjust bitrate by 5-20%
            adjustment = random.uniform(0.8, 1.2)
            bitrate = int(2000 * adjustment)
            filters.extend(['-b:v', f'{bitrate}k'])
            applied_changes.append(f'Bitrate: {bitrate}k')
            print(f"  - Applied bitrate adjustment: {bitrate}k")
        
        elif technique == 'metadata_change':
            # Add unique metadata
            timestamp = datetime.now().isoformat()
            filters.extend([
                '-metadata', f'title=Processed_{unique_seed}',
                '-metadata', f'comment=Generated_{timestamp}',
                '-metadata', f'encoded_by=VideoProcessor_{unique_seed[:8]}'
            ])
            applied_changes.append(f'Metadata: {unique_seed[:8]}')
            print(f"  - Applied metadata change: {unique_seed[:8]}")
    
    # Combine video filters
    if video_filters:
        filters.extend(['-vf', ','.join(video_filters)])
    
    # Combine audio filters
    if audio_filters:
        filters.extend(['-af', ','.join(audio_filters)])
    
    return filters, applied_changes

def process_video():
    """Process the video file with FFmpeg"""
    try:
        print(f"\n🎬 Processing video: {Path(INPUT_VIDEO).name}")
        
        # Get video information
        video_info = get_video_info(INPUT_VIDEO)
        if not video_info:
            print(f"❌ Could not analyze video")
            return False
        
        # Generate unique seed
        unique_seed = generate_unique_seed(INPUT_VIDEO)
        print(f"🔑 Generated unique seed: {unique_seed}")
        
        # Build FFmpeg filters
        filters, applied_changes = build_ffmpeg_filters(video_info, unique_seed)
        
        # Generate output filename
        input_path = Path(INPUT_VIDEO)
        stem = input_path.stem
        suffix = input_path.suffix
        output_filename = f"{stem}_unique_{unique_seed}{suffix}"
        output_path = Path(OUTPUT_FOLDER) / output_filename
        
        print(f"📁 Output will be saved to: {output_path}")
        
        # Construct FFmpeg command
        cmd = [
            FFMPEG_PATH,
            '-i', str(INPUT_VIDEO),
            '-c:v', 'libx264',  # Use H.264 codec
            '-c:a', 'aac',      # Use AAC audio codec
        ]
        
        # Add generated filters
        cmd.extend(filters)
        
        # Add output optimizations
        cmd.extend([
            '-avoid_negative_ts', 'make_zero',
            '-fflags', '+genpts',
            '-movflags', '+faststart',
            str(output_path)
        ])
        
        print(f"🔧 Applied modifications: {', '.join(applied_changes)}")
        print(f"⚙️  Running command: {' '.join(cmd)}")
        
        # Execute FFmpeg command
        start_time = time.time()
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            timeout=600  # 10 minute timeout
        )
        end_time = time.time()
        processing_time = end_time - start_time
        
        if result.returncode == 0:
            # Verify output file exists and has reasonable size
            if output_path.exists() and output_path.stat().st_size > 1000:
                file_size_mb = output_path.stat().st_size / (1024 * 1024)
                print(f"✅ Success: {output_filename}")
                print(f"📁 Size: {file_size_mb:.1f} MB")
                print(f"⏱️  Time: {processing_time:.1f} seconds")
                return True
            else:
                print(f"❌ Output file invalid or too small")
                return False
        else:
            print(f"❌ FFmpeg error: {result.stderr}")
            return False
                
    except subprocess.TimeoutExpired:
        print(f"⏰ Timeout processing video")
        return False
    except Exception as e:
        print(f"💥 Exception processing video: {e}")
        return False

def main():
    print("🎬 Single Video Processor")
    print("="*50)
    
    # Check paths
    if not check_paths():
        print("❌ Path check failed. Please fix the issues and try again.")
        input("Press Enter to exit...")
        return
    
    # Process video
    success = process_video()
    
    if success:
        print("\n🎉 Video processing complete!")
        print(f"✅ Processed video saved to: {OUTPUT_FOLDER}")
    else:
        print("\n❌ Video processing failed.")
        print("Please check the error messages above for details.")
    
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()