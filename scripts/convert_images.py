from PIL import Image
from pathlib import Path
sizes=[400,800,1200]
assets=Path('assets')
for p in assets.glob('service-*.jpg'):
    img=Image.open(p).convert('RGB')
    name=p.stem
    for w in sizes:
        h=int(w*img.height/img.width)
        out=assets/(f"{name}-{w}.webp")
        img.resize((w,h), Image.LANCZOS).save(out,'WEBP',quality=80)
print('webp generation done')
