from PIL import Image

im = Image.open(r'C:\Users\PC1\AppData\Local\Temp\cert_new.png')
w, h = im.size
# scan 46-58% in slices of 2% to find the exact name line
for a in [x/100 for x in range(46, 57, 2)]:
    c = im.crop((int(0.2*w), int(h*a), int(0.8*w), int(h*(a+0.02))))
    c = c.resize((1900, int(c.height*1900/c.width)), Image.LANCZOS)
    c.save(r'C:\Users\PC1\AppData\Local\Temp' + '\\scan_' + str(int(a*100)) + '.png')
print('done')
