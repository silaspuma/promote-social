# Extension Icons

The Chrome extension requires icon files in PNG format at three sizes:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Creating Icons

You can create these icons using any image editor. Here are some options:

### Option 1: Online Tools
- Use [Figma](https://figma.com) or [Canva](https://canva.com) to design the icon
- Export at 128x128 and scale down for smaller sizes
- Use a "PS" logo or social media themed design

### Option 2: Command Line (ImageMagick)
If you have ImageMagick installed:
```bash
# Create a simple placeholder (replace with your design)
convert -size 128x128 xc:blue -fill white -pointsize 72 -gravity center -annotate +0+0 "P" icon128.png
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png
```

### Option 3: Simple SVG Template
Use the icon.svg file in this directory as a template, then convert to PNG.

## Temporary Workaround

For development, you can use simple colored square icons:
1. Create a 128x128 blue square in any image editor
2. Add white text "PS" in the center
3. Save as PNG at all three sizes

The extension will work without custom icons (Chrome will show a default icon).
