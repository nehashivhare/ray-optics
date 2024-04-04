import os
import shutil

def main():
    directory = 'local_files/phydemo.app/ray-optics/pl/gallery'

    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    first_line = f.readline().strip()
                    if file_path.endswith(".html"):
                        print(f'Correcting file {file_path}')
                        new_file_path = file_path[:-5]
                        print(f'Moving file {file_path} to {new_file_path}')
                        shutil.move(file_path, new_file_path)
            except UnicodeDecodeError:
                print(f'Skipped file {file_path} due to UnicodeDecodeError')

if __name__ == "__main__":
    main()
