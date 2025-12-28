# Photo to SVG Converter

A beautiful, modern web application that converts raster images (PNG, JPG, JPEG) into scalable vector graphics (SVG) format.

## Features

- 🖼️ **Drag & Drop Upload** - Easy file upload with drag and drop support
- 🎨 **Customizable Settings** - Adjust conversion parameters:
  - Color Count: Control the number of colors in the output SVG
  - Smoothness: Adjust the smoothness of the vector paths
- 👀 **Live Preview** - See both original and converted images side by side
- 💾 **Download SVG** - Download your converted SVG file with one click
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## How to Use

1. **Open the Application**
   - Simply open `index.html` in your web browser
   - No installation or build process required!

2. **Upload an Image**
   - Click the upload area or drag and drop an image file
   - Supported formats: PNG, JPG, JPEG
   - Maximum file size: 10MB

3. **Adjust Settings** (Optional)
   - **Color Count**: Number of colors in the SVG (2-256)
     - Lower values = simpler, more stylized output
     - Higher values = more detailed, closer to original
   - **Smoothness**: Path smoothness (0-10)
     - Lower values = sharper, more angular paths
     - Higher values = smoother, more curved paths

4. **Convert**
   - Click "Convert to SVG" button
   - Wait for the conversion to complete

5. **Download**
   - Preview the SVG result
   - Click "Download SVG" to save the file

## Technical Details

- **Frontend**: Pure HTML, CSS, and JavaScript
- **Vectorization Library**: [ImageTracer.js](https://github.com/jankovicsandras/imagetracerjs)
- **No Backend Required**: All processing happens in the browser
- **No Dependencies**: Uses CDN for the ImageTracer library

## Browser Compatibility

Works in all modern browsers that support:
- File API
- Canvas API
- ES6 JavaScript features

## File Structure

```
svg converter/
├── index.html      # Main HTML file
├── styles.css      # Styling
├── app.js          # Application logic
└── README.md       # This file
```

## License

This project is open source and available for personal and commercial use.

## Credits

- Uses [ImageTracer.js](https://github.com/jankovicsandras/imagetracerjs) for image vectorization

