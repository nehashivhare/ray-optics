import os
import re

def replace_url_in_file(file_path, url, local_path):
    with open(file_path, 'r') as file:
        file_data = file.read()

    file_data = file_data.replace(url, local_path)

    with open(file_path, 'w') as file:
        file.write(file_data)

def main():
    url = 'https://phydemo.app/ray-optics/'
    local_path = 'local_files/'

    for root, dirs, files in os.walk('local_files'):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                replace_url_in_file(file_path, url, local_path)

if __name__ == "__main__":
    main()
