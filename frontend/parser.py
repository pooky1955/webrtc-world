import json
with open("./servers.txt","r") as f:
    lines = [line for line in f.read().split('\n') if len(line) > 0]
    lines = ["stun:" + line for line in lines]
    lines = [{"url" : line} for line in lines]

print("lines",lines)
with open("./servers.json","w") as f:
    f.write(json.dumps(lines))

