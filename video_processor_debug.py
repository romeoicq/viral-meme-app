import os
import subprocess
import random
import json
import time
from pathlib import Path
from datetime import datetime

class VideoUniquenessProcessor:
    def __init__(self, input_folder, output_folder, ffmediamaster_path="ffmediamaster"):
        self.input_folder = Path(input_folder)
        self.output_folder = Path(output_folder)
        self.ffmediamaster_path = ffmediamaster_path
        self.supported_formats = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm']
        self.processing_log = []
        
        # Create output folder if it doesn't exist
        self.output_folder.mkdir(parents=True, exist_ok=True)
        
        print(f"Initialized processor with:")
        print(f"- Input folder: {self.input_folder} (exists: {self.input_folder.exists()})")
        print(f"- Output folder: {self.output_folder} (exists: {self.output_folder.exists()})")
        print(f"- ffmediamaster path: {self.ffmediamaster_path}")
    
    def get_video_info(self, video_path):
        """Get video information using ffprobe"""
        try:
            print(f"Getting video info for: {video_path}")
            cmd = [
                'ffprobe', '-v', 'quiet', '-print_format', 'json',
                '-show_format', '-show_streams', str(video_path)
            ]
            print(f"Running command: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"ffprobe error: {result.stderr}")
                return None
            return json.loads(result.stdout)
        except Exception as e:
            print(f"Error getting video info for {video_path}: {e}")
            return None
    
    def generate_random_transformations(self, video_info):
        """Generate random transformation parameters"""
        print("Generating random transformations...")
        transformations = []
        
        # Get video stream info
        video_stream = None
        for stream in video_info.get('streams', []):
            if stream.get('codec_type') == 'video':
                video_stream = stream
                break
        
        if not video_stream:
            print("No video stream found in video info")
            return transformations
        
        print(f"Found video stream: {video_stream.get('width')}x{video_stream.get('height')}")
        
        # Random bitrate adjustment (±5-15%)
        if random.choice([True, False]):
            adjustment = random.uniform(0.85, 1.15)
            transformations.append(f"-b:v {int(2000 * adjustment)}k")
        
        # Random slight resolution change
        if random.choice([True, False]):
            width = int(video_stream.get('width', 1920))
            height = int(video_stream.get('height', 1080))
            # Adjust by 1-4 pixels (even numbers to avoid encoding issues)
            width_adj = random.choice([-4, -2, 0, 2, 4])
            height_adj = random.choice([-4, -2, 0, 2, 4])
            new_width = max(width + width_adj, 100)
            new_height = max(height + height_adj, 100)
            transformations.append(f"-s {new_width}x{new_height}")
        
        # Random frame rate adjustment
        if random.choice([True, False]):
            fps_options = ["23.976", "24", "25", "29.97", "30"]
            current_fps = video_stream.get('r_frame_rate', '30/1')
            new_fps = random.choice(fps_options)
            transformations.append(f"-r {new_fps}")
        
        # Random audio adjustments
        if random.choice([True, False]):
            # Slight volume adjustment
            volume_adj = random.uniform(0.95, 1.05)
            transformations.append(f"-af volume={volume_adj}")
        
        # Random encoding parameters
        if random.choice([True, False]):
            # Keyframe interval
            keyframe_interval = random.randint(24, 120)
            transformations.append(f"-g {keyframe_interval}")
        
        # Random quality adjustment (CRF)
        if random.choice([True, False]):
            crf_value = random.randint(18, 26)
            transformations.append(f"-crf {crf_value}")
        
        # Add timestamp metadata
        timestamp = datetime.now().isoformat()
        transformations.append(f'-metadata title="Processed_{timestamp}"')
        
        print(f"Generated transformations: {transformations}")
        return transformations
    
    def add_subtle_watermark(self, transformations):
        """Add a subtle, nearly invisible watermark"""
        print("Considering adding watermark...")
        if random.choice([True, False]):
            # Position options
            positions = ["10:10", "W-w-10:10", "10:H-h-10", "W-w-10:H-h-10"]
            position = random.choice(positions)
            
            # Create a very subtle text overlay
            timestamp = str(int(time.time()))[-6:]  # Last 6 digits of timestamp
            opacity = random.uniform(0.01, 0.05)  # Very low opacity
            
            watermark = f"drawtext=text='{timestamp}':fontsize=8:fontcolor=white@{opacity}:x={position.split(':')[0]}:y={position.split(':')[1]}"
            transformations.append(f'-vf "{watermark}"')
            print(f"Added watermark: {watermark}")
        else:
            print("No watermark added")
        
        return transformations
    
    def process_single_video(self, input_path):
        """Process a single video file"""
        try:
            print(f"\n==== Processing: {input_path.name} ====")
            
            # Get video information
            video_info = self.get_video_info(input_path)
            if not video_info:
                print(f"Could not get info for {input_path}")
                return False
            
            # Generate random transformations
            transformations = self.generate_random_transformations(video_info)
            
            # Add subtle watermark occasionally
            transformations = self.add_subtle_watermark(transformations)
            
            # Generate output filename
            stem = input_path.stem
            suffix = input_path.suffix
            timestamp = int(time.time())
            output_filename = f"{stem}_unique_{timestamp}{suffix}"
            output_path = self.output_folder / output_filename
            
            print(f"Output will be saved to: {output_path}")
            
            # Construct ffmediamaster command
            cmd = [self.ffmediamaster_path, "-i", str(input_path)]
            
            # Add transformations
            for transform in transformations:
                cmd.extend(transform.split())
            
            # Add output path
            cmd.append(str(output_path))
            
            print(f"Executing command: {' '.join(cmd)}")
            
            # Execute command
            start_time = time.time()
            
            # Try using subprocess.Popen for better visibility
            process = subprocess.Popen(
                cmd, 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            # Print output in real-time
            print("Command output:")
            stdout_data, stderr_data = "", ""
            
            for line in process.stdout:
                print(f"  STDOUT: {line.strip()}")
                stdout_data += line
            
            process.wait()
            
            # Get any remaining stderr
            stderr_data = process.stderr.read()
            if stderr_data:
                print(f"  STDERR: {stderr_data}")
            
            end_time = time.time()
            
            if process.returncode == 0:
                print(f"✅ Successfully processed: {output_filename}")
                print(f"⏱️  Processing time: {end_time - start_time:.2f} seconds")
                
                # Log successful processing
                self.processing_log.append({
                    'input_file': str(input_path),
                    'output_file': str(output_path),
                    'transformations': transformations,
                    'processing_time': end_time - start_time,
                    'status': 'success',
                    'timestamp': datetime.now().isoformat()
                })
                return True
            else:
                print(f"❌ Error processing {input_path}: {stderr_data}")
                self.processing_log.append({
                    'input_file': str(input_path),
                    'error': stderr_data,
                    'status': 'failed',
                    'timestamp': datetime.now().isoformat()
                })
                return False
                
        except Exception as e:
            print(f"❌ Exception processing {input_path}: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def process_all_videos(self):
        """Process all videos in the input folder"""
        # Find all video files
        video_files = []
        print(f"Looking for video files in: {self.input_folder}")
        
        if not self.input_folder.exists():
            print(f"❌ Input folder does not exist: {self.input_folder}")
            return
            
        for ext in self.supported_formats:
            found = list(self.input_folder.glob(f"*{ext}"))
            found_upper = list(self.input_folder.glob(f"*{ext.upper()}"))
            print(f"Found {len(found)} files with extension {ext}")
            print(f"Found {len(found_upper)} files with extension {ext.upper()}")
            video_files.extend(found)
            video_files.extend(found_upper)
        
        if not video_files:
            print("No video files found in the input folder!")
            print("Supported formats:", self.supported_formats)
            # List all files in the directory for debugging
            print("Files in directory:")
            for file in self.input_folder.iterdir():
                print(f"  {file.name} (is file: {file.is_file()})")
            return
        
        print(f"Found {len(video_files)} video files to process:")
        for video in video_files:
            print(f"  {video.name}")
        
        successful = 0
        failed = 0
        
        for video_file in video_files:
            if self.process_single_video(video_file):
                successful += 1
            else:
                failed += 1
            
            # Small delay between processing
            time.sleep(1)
        
        print(f"\n📊 Processing Summary:")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"📁 Output folder: {self.output_folder}")
        
        # Save processing log
        log_file = self.output_folder / f"processing_log_{int(time.time())}.json"
        with open(log_file, 'w') as f:
            json.dump(self.processing_log, f, indent=2)
        print(f"📝 Log saved to: {log_file}")

def main():
    # Configuration - MODIFY THESE PATHS
    INPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\tiktok"  # Change this to your input folder
    OUTPUT_FOLDER = r"C:\Users\Romeo Burke\Videos\output"  # Change this to your output folder
    FFMEDIAMASTER_PATH = r"C:\Program Files\ffMediaMaster\ffmediamaster.exe"  # Change if ffmediamaster is not in PATH
    
    print("🎬 Video Uniqueness Processor Starting...")
    print(f"📂 Input folder: {INPUT_FOLDER}")
    print(f"📁 Output folder: {OUTPUT_FOLDER}")
    
    # Check if input folder exists
    input_path = Path(INPUT_FOLDER)
    if not input_path.exists():
        print(f"❌ Input folder does not exist: {INPUT_FOLDER}")
        return
    
    # Check if output folder exists or can be created
    output_path = Path(OUTPUT_FOLDER)
    try:
        output_path.mkdir(parents=True, exist_ok=True)
        print(f"✅ Output folder ready: {OUTPUT_FOLDER}")
    except Exception as e:
        print(f"❌ Error creating output folder: {e}")
        return
    
    # Verify ffmediamaster is available
    ffmediamaster_path = Path(FFMEDIAMASTER_PATH)
    if not ffmediamaster_path.exists():
        print(f"❌ FFmediamaster not found at: {FFMEDIAMASTER_PATH}")
        print("Please check the path or install it.")
        return
    else:
        print(f"✅ FFmediamaster found at: {FFMEDIAMASTER_PATH}")
    
    # Try running ffmediamaster to check if it works
    try:
        print("Testing ffmediamaster...")
        result = subprocess.run([FFMEDIAMASTER_PATH, "-version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ FFmediamaster test successful: {result.stdout.strip() if result.stdout else 'Available'}")
        else:
            print(f"⚠️ FFmediamaster test returned non-zero exit code: {result.returncode}")
            print(f"Error: {result.stderr}")
    except Exception as e:
        print(f"❌ Error testing ffmediamaster: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Create processor and run
    try:
        processor = VideoUniquenessProcessor(INPUT_FOLDER, OUTPUT_FOLDER, FFMEDIAMASTER_PATH)
        processor.process_all_videos()
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n🎉 Processing complete!")

if __name__ == "__main__":
    main()