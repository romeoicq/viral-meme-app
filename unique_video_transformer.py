import os
import subprocess
import random
import json
import time
import hashlib
import shutil
import tempfile
from pathlib import Path
from datetime import datetime, timedelta

# CONFIGURATION - ALREADY SET UP FOR YOUR SYSTEM
FFMPEG_PATH = r"C:\Users\Romeo Burke\Downloads\ffmpeg-7.1.1-full_build\ffmpeg-7.1.1-full_build\bin\ffmpeg.exe"
FFPROBE_PATH = r"C:\Users\Romeo Burke\Downloads\ffmpeg-7.1.1-full_build\ffmpeg-7.1.1-full_build\bin\ffprobe.exe"
INPUT_VIDEO = r"C:\Users\Romeo Burke\Videos\tiktok\snaptik_7461326251853090081_hd.mp4"
OUTPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok_unique"

# Transformation options
TRANSFORMATION_LEVELS = {
    "minimal": {
        "description": "Subtle changes that are nearly imperceptible",
        "visual_strength": 0.3,
        "audio_strength": 0.3,
        "technical_strength": 0.3
    },
    "balanced": {
        "description": "Moderate changes that balance uniqueness and quality",
        "visual_strength": 0.6,
        "audio_strength": 0.6,
        "technical_strength": 0.6
    },
    "aggressive": {
        "description": "Stronger changes that maximize uniqueness",
        "visual_strength": 0.9,
        "audio_strength": 0.8,
        "technical_strength": 0.9
    }
}

# Output format options
OUTPUT_FORMATS = {
    "mp4": {
        "extension": ".mp4",
        "video_codec": "libx264",
        "audio_codec": "aac",
        "container_options": ["-movflags", "+faststart"]
    },
    "mkv": {
        "extension": ".mkv",
        "video_codec": "libx264",
        "audio_codec": "aac",
        "container_options": []
    },
    "webm": {
        "extension": ".webm",
        "video_codec": "libvpx-vp9",
        "audio_codec": "libopus",
        "container_options": []
    },
    "mov": {
        "extension": ".mov",
        "video_codec": "libx264",
        "audio_codec": "aac",
        "container_options": ["-movflags", "+faststart"]
    }
}

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

def build_advanced_filters(video_info, unique_seed, transformation_level="balanced", output_format="mp4"):
    """Build advanced FFmpeg filter chains to make content more unique"""
    print(f"🔧 Building advanced FFmpeg filters (Level: {transformation_level})...")
    
    # Get transformation strength parameters
    level_params = TRANSFORMATION_LEVELS.get(transformation_level, TRANSFORMATION_LEVELS["balanced"])
    visual_strength = level_params["visual_strength"]
    audio_strength = level_params["audio_strength"]
    technical_strength = level_params["technical_strength"]
    
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
    
    applied_changes = []
    
    # ===== BASIC VIDEO MODIFICATIONS =====
    
    # 1. Crop slightly (removes a few pixels from edges)
    crop_percent = 1.0 - (random.uniform(0.01, 0.05) * visual_strength)
    if video_stream:
        width = int(video_stream.get('width', 1920))
        height = int(video_stream.get('height', 1080))
        
        new_width = int(width * crop_percent)
        new_height = int(height * crop_percent)
        
        # Ensure even numbers for better codec compatibility
        new_width = new_width if new_width % 2 == 0 else new_width - 1
        new_height = new_height if new_height % 2 == 0 else new_height - 1
        
        # Calculate crop position (center crop)
        x_offset = (width - new_width) // 2
        y_offset = (height - new_height) // 2
        
        video_filters.append(f"crop={new_width}:{new_height}:{x_offset}:{y_offset}")
        applied_changes.append(f"Crop: {new_width}x{new_height}")
        print(f"  - Applied crop: {new_width}x{new_height}")
    
    # 2. Slight rotation (0.1-1.5 degrees based on strength)
    max_rotation = 1.5 * visual_strength
    rotation = random.uniform(0.1, max_rotation) * random.choice([-1, 1])
    video_filters.append(f"rotate={rotation*3.14159/180}:bilinear=1")
    applied_changes.append(f"Rotation: {rotation:.2f}°")
    print(f"  - Applied rotation: {rotation:.2f}°")
    
    # 3. Scale back to original size with slight adjustment
    if video_stream:
        width = int(video_stream.get('width', 1920))
        height = int(video_stream.get('height', 1080))
        
        # Adjust resolution slightly
        width_adjust = width - (random.randint(0, 4) * 2 * int(visual_strength * 2))
        height_adjust = height - (random.randint(0, 4) * 2 * int(visual_strength * 2))
        
        # Ensure even numbers
        width_adjust = width_adjust if width_adjust % 2 == 0 else width_adjust - 1
        height_adjust = height_adjust if height_adjust % 2 == 0 else height_adjust - 1
        
        video_filters.append(f"scale={width_adjust}:{height_adjust}")
        applied_changes.append(f"Scale: {width_adjust}x{height_adjust}")
        print(f"  - Applied scale: {width_adjust}x{height_adjust}")
    
    # 4. Adjust colors
    brightness = random.uniform(-0.05, 0.05) * visual_strength
    contrast = 1.0 + random.uniform(-0.05, 0.05) * visual_strength
    saturation = 1.0 + random.uniform(-0.05, 0.05) * visual_strength
    gamma = 1.0 + random.uniform(-0.05, 0.05) * visual_strength
    
    video_filters.append(f"eq=brightness={brightness:.3f}:contrast={contrast:.3f}:saturation={saturation:.3f}:gamma={gamma:.3f}")
    applied_changes.append(f"Color: B{brightness:.3f} C{contrast:.3f} S{saturation:.3f} G{gamma:.3f}")
    print(f"  - Applied color adjustment: B{brightness:.3f} C{contrast:.3f} S{saturation:.3f} G{gamma:.3f}")
    
    # 5. Add subtle noise
    if random.random() < 0.7:  # 70% chance to apply noise
        noise_strength = int(random.randint(1, 5) * visual_strength)
        video_filters.append(f"noise=alls={noise_strength}:allf=t")
        applied_changes.append(f"Noise: {noise_strength}")
        print(f"  - Applied noise: {noise_strength}")
    
    # 6. Add subtle border
    if random.random() < 0.6:  # 60% chance to apply border
        border_size = int(random.randint(1, 8) * visual_strength)
        border_color = f"0x{random.randint(0, 255):02x}{random.randint(0, 255):02x}{random.randint(0, 255):02x}"
        border_opacity = random.uniform(0.2, 0.5) * visual_strength
        video_filters.append(f"pad=iw+{border_size*2}:ih+{border_size*2}:{border_size}:{border_size}:{border_color}@{border_opacity:.2f}")
        applied_changes.append(f"Border: {border_size}px")
        print(f"  - Applied border: {border_size}px")
    
    # 7. Add subtle overlay instead of text watermark (to avoid fontconfig issues)
    if random.random() < 0.5:  # 50% chance to apply overlay
        # Create a simple box overlay instead of text
        overlay_size = int(random.randint(5, 15) * visual_strength)
        overlay_opacity = random.uniform(0.02, 0.08) * visual_strength
        overlay_color = f"0x{random.randint(0, 255):02x}{random.randint(0, 255):02x}{random.randint(0, 255):02x}"
        overlay_x = random.randint(10, 50)
        overlay_y = random.randint(10, 50)
        
        video_filters.append(f"drawbox=x={overlay_x}:y={overlay_y}:w={overlay_size}:h={overlay_size}:color={overlay_color}@{overlay_opacity:.3f}:t=fill")
        applied_changes.append(f"Overlay: {overlay_size}px box")
        print(f"  - Applied overlay: {overlay_size}px box")
    
    # 8. Flip horizontally or vertically (if random choice)
    if random.random() < 0.3 * visual_strength:  # Chance based on strength
        if random.choice([True, False]):
            video_filters.append("hflip")
            applied_changes.append("Horizontal flip")
            print(f"  - Applied horizontal flip")
        else:
            video_filters.append("vflip")
            applied_changes.append("Vertical flip")
            print(f"  - Applied vertical flip")
    
    # ===== AUDIO TRANSFORMATIONS =====
    
    if audio_stream:
        # 1. Slight tempo change
        tempo_range = 0.02 * audio_strength
        tempo = 1.0 + random.uniform(-tempo_range, tempo_range)
        audio_filters.append(f"atempo={tempo:.3f}")
        applied_changes.append(f"Tempo: {tempo:.3f}x")
        print(f"  - Applied tempo change: {tempo:.3f}x")
        
        # 2. Pitch shift (very subtle)
        pitch_shift = random.uniform(-0.5, 0.5) * audio_strength
        audio_filters.append(f"asetrate=44100*{1+pitch_shift/100},aresample=44100")
        applied_changes.append(f"Pitch: {pitch_shift:+.2f}%")
        print(f"  - Applied pitch shift: {pitch_shift:+.2f}%")
        
        # 3. Add very subtle echo
        if random.random() < 0.7:  # 70% chance to apply echo
            echo_delay = random.uniform(0.05, 0.2) * audio_strength
            echo_decay = random.uniform(0.1, 0.3) * audio_strength
            audio_filters.append(f"aecho=0.6:{echo_delay}:{echo_decay}:0.5")
            applied_changes.append(f"Echo: {echo_delay:.2f}s")
            print(f"  - Applied echo: {echo_delay:.2f}s")
        
        # 4. Equalization (boost or cut certain frequencies)
        eq_freq = random.choice([100, 500, 1000, 3000, 5000])
        eq_gain = random.uniform(-2, 2) * audio_strength
        audio_filters.append(f"equalizer=f={eq_freq}:t=q:w=1:g={eq_gain}")
        applied_changes.append(f"EQ: {eq_freq}Hz {eq_gain:+.1f}dB")
        print(f"  - Applied equalization: {eq_freq}Hz {eq_gain:+.1f}dB")
        
        # 5. Volume adjustment
        volume_range = 0.05 * audio_strength
        volume = 1.0 + random.uniform(-volume_range, volume_range)
        audio_filters.append(f"volume={volume:.3f}")
        applied_changes.append(f"Volume: {volume:.3f}")
        print(f"  - Applied volume adjustment: {volume:.3f}")
    
    # ===== TECHNICAL TRANSFORMATIONS =====
    
    # 1. Adjust bitrate
    bitrate_factor = 1.0 + random.uniform(-0.2, 0.2) * technical_strength
    bitrate = int(2000 * bitrate_factor)
    filters.extend(['-b:v', f'{bitrate}k'])
    applied_changes.append(f'Bitrate: {bitrate}k')
    print(f"  - Applied bitrate adjustment: {bitrate}k")
    
    # 2. Adjust encoding parameters
    crf_min = 18
    crf_max = 25
    crf_range = crf_max - crf_min
    crf = crf_min + int(crf_range * random.random() * technical_strength)
    
    keyint_min = 48
    keyint_max = 120
    keyint_range = keyint_max - keyint_min
    keyint = keyint_min + int(keyint_range * random.random() * technical_strength)
    
    filters.extend([
        '-crf', str(crf),
        '-g', str(keyint),
        '-preset', random.choice(['medium', 'slow'])
    ])
    applied_changes.append(f'Encoding: CRF{crf} KeyInt{keyint}')
    print(f"  - Applied encoding parameters: CRF{crf} KeyInt{keyint}")
    
    # 3. Add unique metadata
    timestamp = datetime.now().isoformat()
    creation_date = (datetime.now() - timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%dT%H:%M:%S")
    
    filters.extend([
        '-metadata', f'title=Processed_{unique_seed}',
        '-metadata', f'comment=Generated_{timestamp}',
        '-metadata', f'encoded_by=VideoProcessor_{unique_seed[:8]}',
        '-metadata', f'creation_time={creation_date}'
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
def add_black_frames(input_path, output_path, duration_start=0, duration_end=0):
    """Add black frames at the beginning and/or end of the video"""
    try:
        # Get video dimensions and framerate
        cmd = [
            FFPROBE_PATH,
            '-v', 'error',
            '-select_streams', 'v:0',
            '-show_entries', 'stream=width,height,r_frame_rate',
            '-of', 'csv=p=0',
            str(input_path)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode != 0:
            print(f"❌ Error getting video dimensions: {result.stderr}")
            return False
        
        # Parse dimensions and framerate
        try:
            width, height, framerate = result.stdout.strip().split(',')
            width = int(width)
            height = int(height)
            # Handle fractional framerates like "30000/1001"
            if '/' in framerate:
                num, den = framerate.split('/')
                framerate = int(float(num) / float(den))
            else:
                framerate = int(float(framerate))
        except Exception as e:
            print(f"❌ Error parsing video info: {e}")
            # Use default values if parsing fails
            width, height, framerate = 1280, 720, 30
        
        # Create a simpler approach - create a temporary file with black frames at start
        if duration_start > 0:
            temp_start = os.path.join(os.path.dirname(output_path), "temp_start.mp4")
            cmd = [
                FFMPEG_PATH,
                '-f', 'lavfi',
                '-i', f'color=c=black:s={width}x{height}:r={framerate}:d={duration_start}',
                '-c:v', 'libx264',
                '-t', str(duration_start),
                temp_start,
                '-y'
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode != 0:
                print(f"❌ Error creating start black frames: {result.stderr}")
                return False
            
            # Now concatenate with the input file
            concat_file = os.path.join(os.path.dirname(output_path), "concat.txt")
            with open(concat_file, 'w') as f:
                f.write(f"file '{temp_start}'\n")
                f.write(f"file '{input_path}'\n")
            
            cmd = [
                FFMPEG_PATH,
                '-f', 'concat',
                '-safe', '0',
                '-i', concat_file,
                '-c', 'copy',
                output_path,
                '-y'
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            # Clean up temporary files
            try:
                os.remove(temp_start)
                os.remove(concat_file)
            except:
                pass
            
            if result.returncode != 0:
                print(f"❌ Error concatenating videos: {result.stderr}")
                return False
            
            return True
        else:
            # If no black frames needed, just copy the input
            shutil.copy2(input_path, output_path)
            return True
    except Exception as e:
        print(f"❌ Exception adding black frames: {e}")
        return False

def adjust_playback_speed(input_path, output_path, speed_factor):
    """Adjust the playback speed of the video"""
    try:
        cmd = [
            FFMPEG_PATH,
            '-i', str(input_path),
            '-filter_complex', f'[0:v]setpts={1/speed_factor}*PTS[v];[0:a]atempo={speed_factor}[a]',
            '-map', '[v]',
            '-map', '[a]',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            str(output_path),
            '-y'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            return True
        else:
            print(f"❌ Error adjusting playback speed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Exception adjusting playback speed: {e}")
        return False

def split_and_rejoin(input_path, output_path, num_segments=3):
    """Split the video into segments and rejoin them"""
    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        
        # Get video duration
        cmd = [
            FFPROBE_PATH,
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            str(input_path)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode != 0:
            print(f"❌ Error getting video duration: {result.stderr}")
            return False
        
        duration = float(result.stdout.strip())
        segment_duration = duration / num_segments
        
        # Split video into segments
        segment_files = []
        for i in range(num_segments):
            segment_file = os.path.join(temp_dir, f"segment_{i}.mp4")
            segment_files.append(segment_file)
            
            cmd = [
                FFMPEG_PATH,
                '-i', str(input_path),
                '-ss', str(i * segment_duration),
                '-t', str(segment_duration),
                '-c', 'copy',
                segment_file,
                '-y'
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode != 0:
                print(f"❌ Error creating segment {i}: {result.stderr}")
                shutil.rmtree(temp_dir)
                return False
        
        # Create file list for concat
        concat_file = os.path.join(temp_dir, "concat.txt")
        with open(concat_file, 'w') as f:
            for segment in segment_files:
                f.write(f"file '{segment}'\n")
        
        # Concatenate segments
        cmd = [
            FFMPEG_PATH,
            '-f', 'concat',
            '-safe', '0',
            '-i', concat_file,
            '-c', 'copy',
            str(output_path),
            '-y'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        # Clean up temporary directory
        shutil.rmtree(temp_dir)
        
        if result.returncode == 0:
            return True
        else:
            print(f"❌ Error rejoining segments: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Exception in split and rejoin: {e}")
        # Clean up temporary directory if it exists
        if 'temp_dir' in locals():
            shutil.rmtree(temp_dir)
        return False
def process_video(transformation_level="balanced", output_format="mp4", advanced_techniques=True):
    """Process the video file with FFmpeg using advanced filters and techniques"""
    try:
        print(f"\n🎬 Processing video: {Path(INPUT_VIDEO).name}")
        print(f"🔧 Transformation level: {transformation_level}")
        print(f"📦 Output format: {output_format}")
        
        # Get video information
        video_info = get_video_info(INPUT_VIDEO)
        if not video_info:
            print(f"❌ Could not analyze video")
            return False
        
        # Generate unique seed
        unique_seed = generate_unique_seed(INPUT_VIDEO)
        print(f"🔑 Generated unique seed: {unique_seed}")
        
        # Create temporary directory for intermediate files
        temp_dir = tempfile.mkdtemp()
        print(f"📁 Created temporary directory: {temp_dir}")
        
        # Generate output filename
        input_path = Path(INPUT_VIDEO)
        stem = input_path.stem
        format_info = OUTPUT_FORMATS.get(output_format, OUTPUT_FORMATS["mp4"])
        suffix = format_info["extension"]
        output_filename = f"{stem}_unique_{unique_seed}{suffix}"
        final_output_path = Path(OUTPUT_FOLDER) / output_filename
        
        # Intermediate files
        temp_output_path = Path(temp_dir) / f"temp_output{suffix}"
        
        # Build advanced FFmpeg filters
        filters, applied_changes = build_advanced_filters(
            video_info, 
            unique_seed, 
            transformation_level,
            output_format
        )
        
        # Construct FFmpeg command
        cmd = [
            FFMPEG_PATH,
            '-i', str(INPUT_VIDEO),
            '-c:v', format_info["video_codec"],
            '-c:a', format_info["audio_codec"],
        ]
        
        # Add generated filters
        cmd.extend(filters)
        
        # Add output format-specific options
        cmd.extend(format_info["container_options"])
        
        # Add output optimizations
        cmd.extend([
            '-avoid_negative_ts', 'make_zero',
            '-fflags', '+genpts',
            str(temp_output_path)
        ])
        
        print(f"🔧 Applied {len(applied_changes)} basic modifications")
        print(f"⚙️  Running FFmpeg command...")
        
        # Execute FFmpeg command
        start_time = time.time()
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            timeout=600  # 10 minute timeout
        )
        
        if result.returncode != 0:
            print(f"❌ FFmpeg error: {result.stderr}")
            shutil.rmtree(temp_dir)
            return False
        
        current_file = temp_output_path
        
        # Apply advanced techniques if enabled
        if advanced_techniques:
            print("\n🔍 Applying advanced techniques...")
            
            # 1. Add black frames (30% chance, reduced probability due to potential issues)
            if random.random() < 0.3:
                black_frames_output = Path(temp_dir) / f"black_frames{suffix}"
                # Only add frames at the start to simplify
                start_duration = random.uniform(0.1, 0.3)
                
                print(f"  - Adding black frames: {start_duration:.2f}s at start")
                if add_black_frames(current_file, black_frames_output, start_duration, 0):
                    current_file = black_frames_output
                    applied_changes.append(f"Black frames: {start_duration:.2f}s at start")
                else:
                    print("    ⚠️ Failed to add black frames, continuing with previous file")
            
            # 2. Adjust playback speed (30% chance)
            if random.random() < 0.3:
                speed_output = Path(temp_dir) / f"speed{suffix}"
                speed_factor = random.uniform(0.98, 1.02)  # Very subtle speed change
                
                print(f"  - Adjusting playback speed: {speed_factor:.3f}x")
                if adjust_playback_speed(current_file, speed_output, speed_factor):
                    current_file = speed_output
                    applied_changes.append(f"Playback speed: {speed_factor:.3f}x")
                else:
                    print("    ⚠️ Failed to adjust playback speed, continuing with previous file")
            
            # 3. Split and rejoin (20% chance)
            if random.random() < 0.2:
                split_output = Path(temp_dir) / f"split{suffix}"
                num_segments = random.randint(3, 5)
                
                print(f"  - Splitting into {num_segments} segments and rejoining")
                if split_and_rejoin(current_file, split_output, num_segments):
                    current_file = split_output
                    applied_changes.append(f"Split and rejoin: {num_segments} segments")
                else:
                    print("    ⚠️ Failed to split and rejoin, continuing with previous file")
        
        # Copy the final processed file to the output folder
        shutil.copy2(current_file, final_output_path)
        
        # Clean up temporary directory
        shutil.rmtree(temp_dir)
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        # Verify output file exists and has reasonable size
        if final_output_path.exists() and final_output_path.stat().st_size > 1000:
            file_size_mb = final_output_path.stat().st_size / (1024 * 1024)
            print(f"\n✅ Success: {output_filename}")
            print(f"📁 Size: {file_size_mb:.1f} MB")
            print(f"⏱️  Time: {processing_time:.1f} seconds")
            print(f"🔧 Applied {len(applied_changes)} total modifications")
            return True
        else:
            print(f"❌ Output file invalid or too small")
            return False
                
    except subprocess.TimeoutExpired:
        print(f"⏰ Timeout processing video")
        # Clean up temporary directory if it exists
        if 'temp_dir' in locals():
            shutil.rmtree(temp_dir)
        return False
    except Exception as e:
        print(f"💥 Exception processing video: {e}")
        # Clean up temporary directory if it exists
        if 'temp_dir' in locals():
            shutil.rmtree(temp_dir)
        return False

def main():
    print("🎬 Advanced Video Uniqueness Processor")
    print("="*60)
    print("This processor applies sophisticated transformations to make")
    print("videos unique while maintaining quality and appearance.")
    print("="*60)
    
    # Check paths
    if not check_paths():
        print("❌ Path check failed. Please fix the issues and try again.")
        input("Press Enter to exit...")
        return
    
    # Ask for transformation level
    print("\n🔧 Select transformation level:")
    print("  1. Minimal - Subtle changes that are nearly imperceptible")
    print("  2. Balanced - Moderate changes that balance uniqueness and quality")
    print("  3. Aggressive - Stronger changes that maximize uniqueness")
    
    level_choice = input("Enter choice (1-3) [2]: ").strip() or "2"
    level_map = {"1": "minimal", "2": "balanced", "3": "aggressive"}
    transformation_level = level_map.get(level_choice, "balanced")
    
    # Ask for output format
    print("\n📦 Select output format:")
    print("  1. MP4 (H.264/AAC) - Most compatible")
    print("  2. MKV (H.264/AAC) - Better for higher quality")
    print("  3. WebM (VP9/Opus) - More modern codecs")
    print("  4. MOV (H.264/AAC) - Better for Apple devices")
    
    format_choice = input("Enter choice (1-4) [1]: ").strip() or "1"
    format_map = {"1": "mp4", "2": "mkv", "3": "webm", "4": "mov"}
    output_format = format_map.get(format_choice, "mp4")
    
    # Ask for advanced techniques
    advanced_choice = input("\n🔍 Apply advanced techniques? (y/n) [y]: ").strip().lower() or "y"
    advanced_techniques = advanced_choice.startswith("y")
    
    # Process video
    success = process_video(
        transformation_level=transformation_level,
        output_format=output_format,
        advanced_techniques=advanced_techniques
    )
    
    if success:
        print("\n🎉 Video processing complete!")
        print(f"✅ Processed video saved to: {OUTPUT_FOLDER}")
        print("\nThe video has been transformed with multiple techniques:")
        print("- Video: Cropping, rotation, color adjustment, noise, border, overlay")
        print("- Audio: Tempo change, pitch shift, echo, equalization, volume adjustment")
        print("- Technical: Bitrate adjustment, encoding parameters, metadata changes")
        if advanced_techniques:
            print("- Advanced: Black frames, playback speed, segmentation")
        print("\nThese changes should help avoid content ID detection while")
        print("maintaining reasonable quality and appearance.")
    else:
        print("\n❌ Video processing failed.")
        print("Please check the error messages above for details.")
    
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()