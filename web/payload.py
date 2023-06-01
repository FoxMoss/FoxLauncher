def on_page_markdown(markdown, **kwargs):
    payload = open("../build/compiled.txt", "r").readline().split("\n")[0]
    str = markdown.replace('{payload}', payload)

    payload = open("../build/encodedc.txt", "r").readline().split("\n")[0]
    return str.replace('{encoded}', payload)

