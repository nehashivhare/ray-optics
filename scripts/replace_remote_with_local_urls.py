import os
import re

def replace_links(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                content = re.sub(r'https://phydemo.app/ray-optics/([^"\']*)', r'../../\1', content)

                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)

# Replace 'local_files' with the path to your local files directory
replace_links('local_files')
