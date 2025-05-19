import pandas as pd

CURRENT_SHAKEUP_FOLDER = '2025-06'

# SOURCE_FILE = 'src/_data/' + CURRENT_SHAKEUP_FOLDER + '/dec-2023-translations.xlsx'

LINES_OUTPUT = 'src/data/lines.json'
UPDATES_OUTPUT = 'src/_data/' + CURRENT_SHAKEUP_FOLDER + '/updates.csv'
CONTENT_OUTPUT = 'src/_data/' + CURRENT_SHAKEUP_FOLDER + '/content.csv'

print("Running process-data.py\n")

# need to run pip3 install openpyxl
# try:
#     updates_df = pd.read_excel(SOURCE_FILE, 'updates', engine = 'openpyxl')
#     print("Read \"updates\" sheet from:", SOURCE_FILE)
# except Exception as e:
#     print("Couldn't read \"updates\" sheet from:", SOURCE_FILE)
#     print(str(e))

# try:
#     lines_df = pd.read_excel(SOURCE_FILE, 'lines', engine = 'openpyxl', 
#                         dtype={ 'line_label':str })
#     print("Read \"lines\" sheet from:", SOURCE_FILE)
# except Exception as e:
#     print("Couldn't read \"lines\" sheet from:", SOURCE_FILE)
#     print(str(e))

# try:
#     content_df = pd.read_excel(SOURCE_FILE, 'content', engine = 'openpyxl')
#     print("Read \"content\" sheet from:", SOURCE_FILE)
# except Exception as e:
#     print("Couldn't read \"content\" sheet from:", SOURCE_FILE)
#     print(str(e))

# print("")

try:
    lines_df.to_json(LINES_OUTPUT, orient='records')
    print("Wrote to:", LINES_OUTPUT)
except Exception as e:
    print("Couldn't write to:", LINES_OUTPUT)
    print(str(e))

try:
    updates_df.to_csv(UPDATES_OUTPUT)
    print("Wrote to:", UPDATES_OUTPUT)
except Exception as e:
    print("Couldn't write to:", UPDATES_OUTPUT)
    print(str(e))

try:
    content_df.to_csv(CONTENT_OUTPUT)
    print("Wrote to:", CONTENT_OUTPUT)
except Exception as e:
    print("Couldn't write to:", CONTENT_OUTPUT)
    print(str(e))

print("\n")