const zoom_factor = 1.15; // scroll
//const browserapi = window.chrome || browser; // firefox/chrome

// clone img to get rid of the browser listeners and behavior
const $img = (() => {
  const $img1 = document.querySelector('img');
  const $img2 = $img1.cloneNode(true);
  $img1.parentNode.replaceChild($img2, $img1);
  $img2.style.cursor = "inherit";
  return $img2;
})();

$img.addEventListener('load', () => {
  console.log(['simple image viewer extension started']);
  const height = $img.height;
  const width = $img.width;
  const imageRatio = width / height;

  let mouseDown = false, mouseDragStarted = false;
  let dragLastX, dragLastY;
  let scale = 1.0;

  const update_$img = () => {
    //$img.style.transformOrigin = `${(offsetX / rect.width) * 100}% ${(offsetY / rect.height) * 100}%`;
    $img.style.transform = `translate(${imgX}px, ${imgY}px) scale(${scale})`;
  };

  $img.style.position = 'absolute';
  $img.style.transformOrigin = 'center center';
  // centering ourself
  let imgX, imgY;
  const center_$img = () => {
    imgX = (window.innerWidth  - width)/2;
    imgY = (window.innerHeight - height)/2;
  };
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
        const displayRatio = window.innerWidth / window.innerHeight;
        const wideFit = imageRatio > displayRatio;
        scale = wideFit ? window.innerWidth / width : window.innerHeight / height;
        center_$img();
        update_$img();
      }
      else {
        scale = 1;
        center_$img();
        update_$img();
      }
    }

    mouseDown = false;
    mouseDragStarted = false;
  });

  $img.addEventListener('mousemove', function(event) {
    if (!mouseDown) return;
    event.preventDefault();
    imgX += event.clientX - dragLastX;
    imgY += event.clientY - dragLastY;
    dragLastX = event.clientX;
    dragLastY = event.clientY;
    update_$img();
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
    imgX -= adjustX;
    imgY -= adjustY;
    update_$img();
  });
});
