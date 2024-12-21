const zoom_factor = 1.15; // scroll
//const browserapi = window.chrome || browser; // firefox/chrome

// clone img to get rid of the browser listeners and behavior
const $img = (() => {
  const $img1 = document.querySelector('img');
  const $img2 = $img1.cloneNode(true);
  $img2.removeAttribute('transition');
  $img2.removeAttribute('width');
  $img2.removeAttribute('height');
  $img1.parentNode.replaceChild($img2, $img1);
  $img2.style.backgroundColor = 'black';
  return $img2;
})();

$img.addEventListener('load', () => {
  console.log(['simple image viewer extension started']);
  const height = $img.height;
  const width = $img.width;
  const imageRatio = width / height;

  let mouseDown = false, mouseDragStarted = false;
  let dragLastX, dragLastY;
  let imageX, imageY, imgRotation = 0;
  let scale = 1.0;

  const update_$img = () => {
    $img.style.transform = `translate(${imageX}px, ${imageY}px) scale(${scale}) rotate(${imgRotation}rad)`;
  };

  $img.style.position = 'absolute';
  $img.style.transformOrigin = 'center center';
  $img.style.cursor = "inherit";
  const center_$img = () => {
    imageX = (window.innerWidth  - width)/2;
    imageY = (window.innerHeight - height)/2;
  };
  const fit_$img = () => { // find perfect fit
    const displayRatio = window.innerWidth / window.innerHeight;
    const wideFit = imageRatio > displayRatio;
    scale = wideFit ? window.innerWidth / width : window.innerHeight / height;
  };
  fit_$img();
  center_$img();
  update_$img();

  $img.addEventListener('mousedown', function(event) {
    if (event.altKey) return; // system drag and drop
    if (event.button !== 0) return; // only left click
    event.preventDefault();
    mouseDown = true;
    dragLastX = event.clientX;
    dragLastY = event.clientY;
  });

  $img.addEventListener('mouseup', function(event) {
    if (!mouseDragStarted) { // simple click = toggle fullscreen
      if (scale == 1) {
        fit_$img();
        center_$img();
        update_$img();
      }
      else {
        // center on mouse position
        const rect = $img.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const midY = rect.top + rect.height / 2;
        const deltaX = event.clientX - midX;
        const deltaY = event.clientY - midY;
        console.log(['perfect fit pos', {midX, midY, deltaX, deltaY}]);
        center_$img();
        imageX -= deltaX/scale;
        imageY -= deltaY/scale;

        scale = 1;
        //center_$img();
        update_$img();
      }
    }

    mouseDown = false;
    mouseDragStarted = false;
  });

  on_move_drag = event => {
    event.preventDefault();
    imageX += event.clientX - dragLastX;
    imageY += event.clientY - dragLastY;
    update_$img();
  };
  on_move_rotate = event => {
    // compute 2 vectors: from image center to prev pos and to new pos
    const rect = $img.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const midY = rect.top + rect.height / 2;
    const vec1X = event.clientX - midX;
    const vec1Y = event.clientY - midY;
    const vec2X = dragLastX - midX;
    const vec2Y = dragLastY - midY;
    // compute angle between the two vectors (normalize)
    // dot product: |a|.|b|.cos a = a.b
    const norm1 = Math.sqrt(vec1X**2 + vec1Y**2)
    const norm2 = Math.sqrt(vec2X**2 + vec2Y**2);
    if (norm1 <= 0.01 || norm2 <= 0.01) return; // ignore if too small
    const dot0 = (vec1X*vec2X + vec1Y*vec2Y);
    const dot = Math.min(1.0, Math.max(0.0, dot0 / (norm1 * norm2))); // fix imprecisions
    const alpha = Math.acos(dot);
    // need to determine sign = direction: CW or CCW
    // cross product: |a|x|b|.sin b = a x b  (only need the sign of sin b)
    const cross0 = vec1X * vec2Y - vec2X * vec1Y;
    // signed angle in radians
    imgRotation += alpha * (cross0 > 0 ? -1 : +1);
    update_$img();
  };
  $img.addEventListener('mousemove', function(event) {
    if (!mouseDown) return;
    if (event.shiftKey)
      on_move_rotate(event);
    else
      on_move_drag(event);
    dragLastX = event.clientX;
    dragLastY = event.clientY;
    mouseDragStarted = true;
  });

  $img.addEventListener('wheel', function(event) {
    event.preventDefault();

    const rect = $img.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);

    let ratio = event.deltaY > 0 ? 1/zoom_factor : zoom_factor;
    scale *= ratio
    const adjustX = relX * (ratio - 1);
    const adjustY = relY * (ratio - 1);
    // Adjust translation to keep image centered on mouse
    imageX -= adjustX;
    imageY -= adjustY;
    update_$img();
  });
});
