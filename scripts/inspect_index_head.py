with open('public/index.html', encoding='utf-8') as f:
    text = f.read()
idx = text.find('</head>')
print(text[idx-300:idx+50])
