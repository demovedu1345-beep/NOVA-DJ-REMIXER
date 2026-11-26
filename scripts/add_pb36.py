with open('public/js/ui/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

old_sec = '<section class="mt-[4vh] flex flex-1 flex-col md:mt-[6vh]">'
new_sec = '<section class="mt-[4vh] flex flex-1 flex-col md:mt-[6vh] pb-36">'

count = text.count(old_sec)
text = text.replace(old_sec, new_sec)
print(f"Replaced {count} occurrences with pb-36")

with open('public/js/ui/app.js', 'w', encoding='utf-8') as f:
    f.write(text)
