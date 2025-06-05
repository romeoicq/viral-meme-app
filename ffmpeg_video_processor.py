import os
import subprocess
import random
import json
import time
import hashlib
from pathlib import Path
from datetime import datetime

class FFmpegVideoProcessor:
    def __init__(self, input_folder, output_folder, ffmpeg_path="ffmpeg"):
        self.input_folder = Path(input_folder)
        self.output_folder = Path(output_folder)
        self.ffmpeg_path = ffmpeg_path
        self.supported_formats = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp']
        self.processing_log = []
        
        # Create output folder if it doesn't exist
        self.output_folder.mkdir(parents=True, exist_ok=True)
        
        # Transformation techniques available
        self.techniques = [
            'bitrate_adjustment',
            'resolution_tweak', 
            'framerate_change',
            'audio_adjustment',
            'color_adjustment',
            'noise_addition',
            'watermark_text',
            'metadata_change',
            'codec_parameters',
            'segment_processing'
        ]
    
    def get_video_info(self, video_path):
        """Get detailed video information using ffprobe"""
        try:
            cmd = [
                'ffprobe', '-v', 'quiet', '-print_format', 'json',
                '-show_format', '-show_streams', str(video_path)
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                return json.loads(result.stdout)
        except Exception as e:
            print(f"Error getting video info for {video_path}: {e}")
        return None
    
    def generate_unique_seed(self, video_path):
        """Generate a unique seed based on file and timestamp"""
        file_hash = hashlib.md5(str(video_path).encode()).hexdigest()[:8]
        time_hash = str(int(time.time() * 1000000))[-8:]
        return f"{file_hash}_{time_hash}"
    
    def build_ffmpeg_filters(self, video_info, unique_seed):
        """Build FFmpeg filter chains for uniqueness"""
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
        
        # Randomly select 3-5 techniques
        selected_techniques = random.sample(self.techniques, random.randint(3, 5))
        applied_changes = []
        
        for technique in selected_techniques:
            if technique == 'bitrate_adjustment':
                # Adjust bitrate by 5-20%
                adjustment = random.uniform(0.8, 1.2)
                bitrate = int(2000 * adjustment)
                filters.extend(['-b:v', f'{bitrate}k'])
                applied_changes.append(f'Bitrate: {bitrate}k')
            
            elif technique == 'resolution_tweak' and video_stream:
                # Minor resolution adjustment (1-8 pixels)
                width = int(video_stream.get('width', 1920))
                height = int(video_stream.get('height', 1080))
                
                width_adj = random.choice([-8, -6, -4, -2, 0, 2, 4, 6, 8])
                height_adj = random.choice([-8, -6, -4, -2, 0, 2, 4, 6, 8])
                
                new_width = max(width + width_adj, 100)
                new_height = max(height + height_adj, 100)
                
                # Ensure even numbers for better codec compatibility
                new_width = new_width if new_width % 2 == 0 else new_width + 1
                new_height = new_height if new_height % 2 == 0 else new_height + 1
                
                video_filters.append(f'scale={new_width}:{new_height}')
                applied_changes.append(f'Resolution: {new_width}x{new_height}')
            
            elif technique == 'framerate_change':
                # Slight framerate adjustment
                fps_options = [23.976, 24, 25, 29.97, 30, 30.303]
                new_fps = random.choice(fps_options)
                filters.extend(['-r', str(new_fps)])
                applied_changes.append(f'FPS: {new_fps}')
            
            elif technique == 'audio_adjustment' and audio_stream:
                # Audio volume adjustment (±5%)
                volume = random.uniform(0.95, 1.05)
                audio_filters.append(f'volume={volume:.3f}')
                applied_changes.append(f'Audio volume: {volume:.3f}')
            
            elif technique == 'color_adjustment':
                # Subtle color adjustments
                brightness = random.uniform(-0.02, 0.02)
                contrast = random.uniform(0.98, 1.02)
                saturation = random.uniform(0.98, 1.02)
                
                video_filters.append(f'eq=brightness={brightness:.3f}:contrast={contrast:.3f}:saturation={saturation:.3f}')
                applied_changes.append(f'Color: B{brightness:.3f} C{contrast:.3f} S{saturation:.3f}')
            
            elif technique == 'noise_addition':
                # Add very subtle noise
                noise_strength = random.randint(1, 3)
                video_filters.append(f'noise=alls={noise_strength}:allf=t')
                applied_changes.append(f'Noise: {noise_strength}')
            
            elif technique == 'watermark_text':
                # Invisible/barely visible text watermark
                watermark_text = unique_seed[:12]
                opacity = random.uniform(0.01, 0.05)
                x_pos = random.choice([10, 'W-w-10', 'W/2-w/2'])
                y_pos = random.choice([10, 'H-h-10', 'H/2-h/2'])
                fontsize = random.randint(8, 12)
                
                video_filters.append(f"drawtext=text='{watermark_text}':fontsize={fontsize}:fontcolor=white@{opacity:.3f}:x={x_pos}:y={y_pos}")
                applied_changes.append(f'Watermark: {watermark_text}')
            
            elif technique == 'metadata_change':
                # Add unique metadata
                timestamp = datetime.now().isoformat()
                filters.extend([
                    '-metadata', f'title=Processed_{unique_seed}',
                    '-metadata', f'comment=Generated_{timestamp}',
                    '-metadata', f'encoded_by=VideoProcessor_{unique_seed[:8]}'
                ])
                applied_changes.append(f'Metadata: {unique_seed[:8]}')
            
            elif technique == 'codec_parameters':
                # Adjust encoding parameters
                crf = random.randint(18, 25)
                keyint = random.randint(48, 120)
                
                filters.extend([
                    '-crf', str(crf),
                    '-g', str(keyint),
                    '-preset', random.choice(['medium', 'slow', 'fast'])
                ])
                applied_changes.append(f'Encoding: CRF{crf} KeyInt{keyint}')
        
        # Combine video filters
        if video_filters:
            filters.extend(['-vf', ','.join(video_filters)])
        
        # Combine audio filters
        if audio_filters:
            filters.extend(['-af', ','.join(audio_filters)])
        
        return filters, applied_changes
    
    def add_timing_modifications(self, filters, applied_changes):
        """Add subtle timing modifications"""
        if random.choice([True, False]):
            # Add a few milliseconds of black at start (0.1-0.5 seconds)
            pad_duration = random.uniform(0.1, 0.5)
            # This would require complex filter graphs, so we'll skip for now
            # to keep the script simpler
            pass
        
        return filters, applied_changes
    
    def process_single_video(self, input_path):
        """Process a single video file with FFmpeg"""
        try:
            print(f"\n🎬 Processing: {input_path.name}")
            
            # Get video information
            video_info = self.get_video_info(input_path)
            if not video_info:
                print(f"❌ Could not analyze {input_path}")
                return False
            
            # Generate unique seed
            unique_seed = self.generate_unique_seed(input_path)
            
            # Build FFmpeg filters
            filters, applied_changes = self.build_ffmpeg_filters(video_info, unique_seed)
            
            # Generate output filename
            stem = input_path.stem
            suffix = input_path.suffix
            output_filename = f"{stem}_unique_{unique_seed}{suffix}"
            output_path = self.output_folder / output_filename
            
            # Construct FFmpeg command
            cmd = [
                self.ffmpeg_path,
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
            
            print(f"🔧 Applied modifications: {', '.join(applied_changes)}")
            print(f"⚙️  Command: {' '.join(cmd[:8])}... [truncated]")
            
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
                    return False
            else:
                print(f"❌ FFmpeg error: {result.stderr[-200:] if result.stderr else 'Unknown error'}")
                self.processing_log.append({
                    'input_file': str(input_path),
                    'error': result.stderr,
                    'status': 'failed',
                    'timestamp': datetime.now().isoformat()
                })
                return False
                
        except subprocess.TimeoutExpired:
            print(f"⏰ Timeout processing {input_path}")
            return False
        except Exception as e:
            print(f"💥 Exception processing {input_path}: {e}")
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
        total_time = 0
        
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

def check_ffmpeg():
    """Check if FFmpeg is available"""
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"✅ {version_line}")
            return True
    except Exception as e:
        print(f"❌ FFmpeg not found: {e}")
        print("💡 Please install FFmpeg from https://ffmpeg.org/")
        return False
    return False

def main():
    print("🎬 FFmpeg Video Uniqueness Processor")
    print("="*50)
    
    # Check FFmpeg availability
    if not check_ffmpeg():
        return
    
    # Configuration - MODIFY THESE PATHS
    INPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok"    # ⬅️ Your TikTok videos
    OUTPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok_unique"  # ⬅️ Processed videos output
    FFMPEG_PATH = "ffmpeg"  # Change if ffmpeg is not in PATH
    
    print(f"📂 Input folder: {INPUT_FOLDER}")
    print(f"📁 Output folder: {OUTPUT_FOLDER}")
    
    # Verify folders exist
    input_path = Path(INPUT_FOLDER)
    if not input_path.exists():
        print(f"❌ Input folder does not exist: {INPUT_FOLDER}")
        return
    
    # Create and run processor
    processor = FFmpegVideoProcessor(INPUT_FOLDER, OUTPUT_FOLDER, FFMPEG_PATH)
    processor.process_all_videos()
    
    print("\n🎉 All done! Your videos are now unique!")

if __name__ == "__main__":
    main()