/**
 * create another canvas to invert the mask color
 * @param {*} image
 */
export const invertMask = (image) => {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, image.width, image.height);

  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const data = imageData.data;

  for (let i = 0, n = data.length; i < n; i += 4) {
    data[i] = 0; // red
    data[i + 1] = 0; // green
    data[i + 2] = 0; // blue
    data[i + 3] = 255 - data[i + 3]; // alpha
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
};
