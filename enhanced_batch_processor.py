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
INPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok"
OUTPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok_unique"

class EnhancedVideoProcessor:
    def __init__(self):
        self.input_folder = Path(INPUT_FOLDER)
        self.output_folder = Path(OUTPUT_FOLDER)
        self.supported_formats = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp']
        self.processing_log = []
        
        # Create output folder if it doesn't exist
        self.output_folder.mkdir(parents=True, exist_ok=True)
    
    def check_paths(self):
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
        
        # Check input folder
        if not self.input_folder.exists():
            print(f"❌ Input folder does not exist: {self.input_folder}")
            return False
        print(f"✅ Input folder found at: {self.input_folder}")
        
        # Check output folder
        if not self.output_folder.exists():
            print(f"❌ Output folder does not exist: {self.output_folder}")
            print(f"Creating output folder...")
            self.output_folder.mkdir(parents=True, exist_ok=True)
        print(f"✅ Output folder: {self.output_folder}")
        
        return True
    
    def get_video_info(self, video_path):
        """Get detailed video information using ffprobe"""
        try:
            cmd = [
                FFPROBE_PATH, '-v', 'quiet', '-print_format', 'json',
                '-show_format', '-show_streams', str(video_path)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                return json.loads(result.stdout)
            else:
                print(f"❌ FFprobe failed with error code {result.returncode}")
                print(f"Error: {result.stderr}")
                return None
        except Exception as e:
            print(f"❌ Error getting video info: {e}")
            return None
    
    def generate_unique_seed(self, video_path):
        """Generate a unique seed based on file and timestamp"""
        file_hash = hashlib.md5(str(video_path).encode()).hexdigest()[:8]
        time_hash = str(int(time.time() * 1000000))[-8:]
        return f"{file_hash}_{time_hash}"
    
    def build_enhanced_filters(self, video_info, unique_seed):
        """Build enhanced FFmpeg filter chains to make content more unique"""
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
        
        # ===== VIDEO TRANSFORMATIONS =====
        
        # 1. Crop slightly (removes a few pixels from edges)
        crop_percent = random.uniform(0.95, 0.98)
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
        
        # 2. Slight rotation (0.5-1.5 degrees)
        rotation = random.uniform(0.5, 1.5) * random.choice([-1, 1])
        video_filters.append(f"rotate={rotation*3.14159/180}:bilinear=1")
        applied_changes.append(f"Rotation: {rotation:.2f}°")
        
        # 3. Scale back to original size
        if video_stream:
            width = int(video_stream.get('width', 1920))
            height = int(video_stream.get('height', 1080))
            video_filters.append(f"scale={width}:{height}")
            applied_changes.append(f"Scale: {width}x{height}")
        
        # 4. Adjust colors more significantly
        brightness = random.uniform(-0.05, 0.05)
        contrast = random.uniform(0.95, 1.05)
        saturation = random.uniform(0.95, 1.05)
        gamma = random.uniform(0.95, 1.05)
        
        video_filters.append(f"eq=brightness={brightness:.3f}:contrast={contrast:.3f}:saturation={saturation:.3f}:gamma={gamma:.3f}")
        applied_changes.append(f"Color: B{brightness:.3f} C{contrast:.3f} S{saturation:.3f} G{gamma:.3f}")
        
        # 5. Add subtle noise
        noise_strength = random.randint(2, 5)
        video_filters.append(f"noise=alls={noise_strength}:allf=t")
        applied_changes.append(f"Noise: {noise_strength}")
        
        # 6. Add subtle border
        border_size = random.randint(2, 8)
        border_color = f"0x{random.randint(0, 255):02x}{random.randint(0, 255):02x}{random.randint(0, 255):02x}"
        video_filters.append(f"pad=iw+{border_size*2}:ih+{border_size*2}:{border_size}:{border_size}:{border_color}@0.4")
        applied_changes.append(f"Border: {border_size}px")
        
        # 7. Add very subtle text watermark
        watermark_text = unique_seed[:12]
        opacity = random.uniform(0.03, 0.08)
        x_pos = random.choice([10, 'W-w-10', 'W/2-w/2'])
        y_pos = random.choice([10, 'H-h-10', 'H/2-h/2'])
        fontsize = random.randint(10, 16)
        
        video_filters.append(f"drawtext=text='{watermark_text}':fontsize={fontsize}:fontcolor=white@{opacity:.3f}:x={x_pos}:y={y_pos}")
        applied_changes.append(f"Watermark: {watermark_text}")
        
        # ===== AUDIO TRANSFORMATIONS =====
        
        if audio_stream:
            # 1. Slight tempo change (0.98-1.02x)
            tempo = random.uniform(0.98, 1.02)
            audio_filters.append(f"atempo={tempo:.3f}")
            applied_changes.append(f"Tempo: {tempo:.3f}x")
            
            # 2. Pitch shift (very subtle)
            pitch_shift = random.uniform(-0.5, 0.5)
            audio_filters.append(f"asetrate=44100*{1+pitch_shift/100},aresample=44100")
            applied_changes.append(f"Pitch: {pitch_shift:+.2f}%")
            
            # 3. Add very subtle echo
            echo_delay = random.uniform(0.05, 0.2)
            echo_decay = random.uniform(0.1, 0.3)
            audio_filters.append(f"aecho=0.6:{echo_delay}:{echo_decay}:0.5")
            applied_changes.append(f"Echo: {echo_delay:.2f}s")
            
            # 4. Equalization (boost or cut certain frequencies)
            eq_freq = random.choice([100, 500, 1000, 3000, 5000])
            eq_gain = random.uniform(-2, 2)
            audio_filters.append(f"equalizer=f={eq_freq}:t=q:w=1:g={eq_gain}")
            applied_changes.append(f"EQ: {eq_freq}Hz {eq_gain:+.1f}dB")
            
            # 5. Volume adjustment
            volume = random.uniform(0.95, 1.05)
            audio_filters.append(f"volume={volume:.3f}")
            applied_changes.append(f"Volume: {volume:.3f}")
        
        # ===== OTHER SETTINGS =====
        
        # Adjust bitrate
        adjustment = random.uniform(0.8, 1.2)
        bitrate = int(2000 * adjustment)
        filters.extend(['-b:v', f'{bitrate}k'])
        applied_changes.append(f'Bitrate: {bitrate}k')
        
        # Adjust encoding parameters
        crf = random.randint(18, 25)
        keyint = random.randint(48, 120)
        
        filters.extend([
            '-crf', str(crf),
            '-g', str(keyint),
            '-preset', random.choice(['medium', 'slow'])
        ])
        applied_changes.append(f'Encoding: CRF{crf} KeyInt{keyint}')
        
        # Add unique metadata
        timestamp = datetime.now().isoformat()
        filters.extend([
            '-metadata', f'title=Processed_{unique_seed}',
            '-metadata', f'comment=Generated_{timestamp}',
            '-metadata', f'encoded_by=VideoProcessor_{unique_seed[:8]}'
        ])
        applied_changes.append(f'Metadata: {unique_seed[:8]}')
        
        # Combine video filters
        if video_filters:
            filters.extend(['-vf', ','.join(video_filters)])
        
        # Combine audio filters
        if audio_filters:
            filters.extend(['-af', ','.join(audio_filters)])
        
        return filters, applied_changes
    
    def process_single_video(self, input_path):
        """Process a single video file with FFmpeg using enhanced filters"""
        try:
            print(f"\n🎬 Processing: {input_path.name}")
            
            # Get video information
            video_info = self.get_video_info(input_path)
            if not video_info:
                print(f"❌ Could not analyze {input_path}")
                return False
            
            # Generate unique seed
            unique_seed = self.generate_unique_seed(input_path)
            
            # Build enhanced FFmpeg filters
            filters, applied_changes = self.build_enhanced_filters(video_info, unique_seed)
            
            # Generate output filename
            stem = input_path.stem
            suffix = input_path.suffix
            output_filename = f"{stem}_unique_{unique_seed}{suffix}"
            output_path = self.output_folder / output_filename
            
            # Construct FFmpeg command
            cmd = [
                FFMPEG_PATH,
                '-i', str(input_path),
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
            
            print(f"🔧 Applied {len(applied_changes)} modifications")
            print(f"⚙️  Running FFmpeg...")
            
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
                    
                    # Log successful processing
                    self.processing_log.append({
                        'input_file': str(input_path),
                        'output_file': str(output_path),
                        'unique_seed': unique_seed,
                        'applied_changes': applied_changes,
                        'processing_time': processing_time,
                        'output_size_mb': file_size_mb,
                        'status': 'success',
                        'timestamp': datetime.now().isoformat()
                    })
                    return True
                else:
                    print(f"❌ Output file invalid or too small")
                    
                    # Log failure
                    self.processing_log.append({
                        'input_file': str(input_path),
                        'error': "Output file invalid or too small",
                        'status': 'failed',
                        'timestamp': datetime.now().isoformat()
                    })
                    return False
            else:
                print(f"❌ FFmpeg error: {result.stderr}")
                
                # Log failure
                self.processing_log.append({
                    'input_file': str(input_path),
                    'error': result.stderr,
                    'status': 'failed',
                    'timestamp': datetime.now().isoformat()
                })
                return False
                
        except subprocess.TimeoutExpired:
            print(f"⏰ Timeout processing {input_path}")
            
            # Log failure
            self.processing_log.append({
                'input_file': str(input_path),
                'error': "Processing timeout",
                'status': 'failed',
                'timestamp': datetime.now().isoformat()
            })
            return False
        except Exception as e:
            print(f"💥 Exception processing {input_path}: {e}")
            
            # Log failure
            self.processing_log.append({
                'input_file': str(input_path),
                'error': str(e),
                'status': 'failed',
                'timestamp': datetime.now().isoformat()
            })
            return False
    
    def process_all_videos(self):
        """Process all videos in the input folder"""
        print("🔍 Scanning for video files...")
        
        # Find all video files
        video_files = []
        for ext in self.supported_formats:
            video_files.extend(self.input_folder.glob(f"*{ext}"))
            video_files.extend(self.input_folder.glob(f"*{ext.upper()}"))
        
        # Remove duplicates and sort
        video_files = sorted(list(set(video_files)))
        
        if not video_files:
            print("❌ No video files found in the input folder!")
            print(f"📂 Searched in: {self.input_folder}")
            print(f"🎯 Looking for: {', '.join(self.supported_formats)}")
            return
        
        print(f"✅ Found {len(video_files)} video files")
        print(f"📂 Input: {self.input_folder}")
        print(f"📁 Output: {self.output_folder}")
        print("="*50)
        
        successful = 0
        failed = 0
        
        for i, video_file in enumerate(video_files, 1):
            print(f"\n[{i}/{len(video_files)}] Starting: {video_file.name}")
            
            if self.process_single_video(video_file):
                successful += 1
            else:
                failed += 1
            
            # Small delay between files
            time.sleep(1)
        
        print("\n" + "="*50)
        print(f"📊 PROCESSING COMPLETE")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"📁 Output folder: {self.output_folder}")
        
        # Save detailed processing log
        log_file = self.output_folder / f"processing_log_{int(time.time())}.json"
        with open(log_file, 'w') as f:
            json.dump(self.processing_log, f, indent=2)
        print(f"📝 Detailed log: {log_file}")

def main():
    print("🎬 Enhanced Batch Video Processor for Content ID Avoidance")
    print("="*60)
    print("This processor applies significant transformations to both")
    print("audio and video to help avoid content ID detection systems.")
    print("="*60)
    
    # Create processor
    processor = EnhancedVideoProcessor()
    
    # Check paths
    if not processor.check_paths():
        print("❌ Path check failed. Please fix the issues and try again.")
        input("Press Enter to exit...")
        return
    
    # Process all videos
    processor.process_all_videos()
    
    print("\n🎉 Batch processing complete!")
    print("\nAll videos have been transformed with multiple techniques:")
    print("- Video: Cropping, rotation, color adjustment, noise, border, watermark")
    print("- Audio: Tempo change, pitch shift, echo, equalization, volume adjustment")
    print("\nThese changes should help avoid content ID detection while")
    print("maintaining reasonable quality and appearance.")
    
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()