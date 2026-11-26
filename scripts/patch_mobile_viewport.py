def patch_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    target = '<meta name="viewport" content="width=device-width, initial-scale=1"/>'
    replacement = '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/><meta name="mobile-web-app-capable" content="yes"/><meta name="apple-mobile-web-app-capable" content="yes"/><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/><meta name="theme-color" content="#050507"/>'

    if target in content:
        content = content.replace(target, replacement)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Successfully patched viewport meta in {filepath}")
    else:
        print(f"Target not found in {filepath}")

patch_html('public/index.html')
patch_html('public/songs.html')
