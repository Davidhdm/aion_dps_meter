export function groupBy(list, givenKey) {
  return list.reduce((prev, curr) => {
    const key = curr[givenKey];
    if (!prev[key]) {
      prev[key] = [];
    }
    prev[key].push(curr);
    return prev;
  }, {});
}

export function addAutoScroll(parent, child) {
  const scrollAmount = child.offsetWidth - child.parentElement.offsetWidth;
  const duration = scrollAmount * 20;

  const autoScrollAnimation = child.animate(
    {
      transform: ["translateX(0)", `translateX(-${scrollAmount}px)`],
    },
    {
      fill: "forwards",
      easing: "linear",
      duration,
    }
  );
  autoScrollAnimation.pause();

  let mouseHasLeft = false;
  parent.addEventListener("mouseenter", () => {
    mouseHasLeft = false;
    autoScrollAnimation.play();
    autoScrollAnimation.onfinish = () => {
      setTimeout(() => {
        if (!mouseHasLeft) {
          autoScrollAnimation.play();
        }
      }, 2000);
    };
  });
  parent.addEventListener("mouseleave", () => {
    console.log("leave");
    autoScrollAnimation.cancel();
    mouseHasLeft = true;
  });
}