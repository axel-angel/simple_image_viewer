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

//document.addEventListener('DOMContentLoaded', function() {
//(() => {
$img.addEventListener('load', () => {
  console.log(['simple image viewer extension started']);
  let isDragging = false;
  let dragLastX, dragLastY;
  let scale = 1.0;
  let height = $img.height;
  let width = $img.width;

  const update_$img = () => {
    //$img.style.transformOrigin = `${(offsetX / rect.width) * 100}% ${(offsetY / rect.height) * 100}%`;
    $img.style.transform = `translate(${imgX}px, ${imgY}px) scale(${scale})`;
  };

  $img.style.position = 'absolute';
  // centering ourself
  let imgX = (window.innerWidth  - width)/2;
  let imgY = (window.innerHeight - height)/2;
  update_$img();

  $img.addEventListener('mousedown', function(event) {
    event.stopImmediatePropagation(); // prevent zoom
    isDragging = true;
    dragLastX = event.clientX;
    dragLastY = event.clientY;
  });

  document.addEventListener('mousemove', function(event) {
    if (!isDragging) return;
    event.preventDefault(); // TODO: allows to drag drop outside window
    imgX += event.clientX - dragLastX;
    imgY += event.clientY - dragLastY;
    dragLastX = event.clientX;
    dragLastY = event.clientY;
    update_$img();
  });

  document.addEventListener('mouseup', function() {
    isDragging = false;
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
})();
