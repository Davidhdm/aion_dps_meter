let filterMenuIsOpen = false;
const filterClassBtn = document.querySelector(".filter-label");
const filterClassOptions = document.querySelector(".filter-class-options");
const filterClassLabelImg = document.querySelector(
  ".filter-label > .filter-class-img"
);
const filterClassChildImg = filterClassLabelImg.children[0];
const filterClassName = document.querySelector(
  ".filter-label > .filter-class-name"
);
const filterClassRemoveBtn = document.querySelector(".filter-class-remove");

function openFilterClassMenu() {
  filterClassOptions.classList.add("open");
  filterMenuIsOpen = true;
  hideOnClickOutside(filterClassOptions);
}

function closeFilterClassMenu() {
  filterClassOptions.classList.remove("open");
  filterMenuIsOpen = false;
  controller.abort();
}

filterClassBtn.addEventListener("click", () => {
  /* console.log("%c##########################################", "color: red");
  console.log(
    "IsOpen before handling: " + `%c${filterMenuIsOpen}`,
    `color: ${filterMenuIsOpen ? "lime" : "#dd01dd"}`
  ); */
  if (filterMenuIsOpen) {
    closeFilterClassMenu();
  } else {
    openFilterClassMenu();
  }
  /* console.log(
    "IsOpen after handling: " + `%c${filterMenuIsOpen}`,
    `color: ${filterMenuIsOpen ? "lime" : "#dd01dd"}`
  ); */
});

document.querySelectorAll(".filter-class-option").forEach((option) => {
  option.addEventListener("click", () => {
    closeFilterClassMenu();
    filterDpsByClass(option.classList[1], option.innerText);
  });
});

function filterDpsByClass(playerClass, classText) {
  globalThis.activeClassFilter = playerClass;
  document.querySelectorAll(".player-element").forEach((playerElement) => {
    if (playerElement.classList.contains(`player-${playerClass}`)) {
      playerElement.classList.remove("hidden");
    } else {
      playerElement.classList.add("hidden");
    }
  });
  filterClassLabelImg.classList.remove("none");
  filterClassChildImg.attributes.src.value = `images/${playerClass}.png`;
  filterClassName.innerText = classText.trim();
  filterClassRemoveBtn.style.display = "flex";
}

filterClassRemoveBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  if (filterMenuIsOpen) {
    closeFilterClassMenu();
  }
  removeClassFilter();
});

function removeClassFilter() {
  globalThis.activeClassFilter = "none";
  closeFilterClassMenu();
  filterClassRemoveBtn.style.display = "none";
  filterClassName.innerText = "Filter by class";
  filterClassChildImg.attributes.src.value = "svgs/filter.svg";
  filterClassLabelImg.classList.add("none");

  document.querySelectorAll(".player-element").forEach((playerElement) => {
    playerElement.classList.remove("hidden");
  });
}

let controller;

function hideOnClickOutside(element) {
  /* console.log("hi!"); */
  const outsideClickListener = (event) => {
    if (
      event.target.contains(filterClassName) ||
      event.target.contains(filterClassLabelImg) ||
      event.target.contains(filterClassRemoveBtn)
    ) {
      event.stopPropagation();
      /* console.log("clicked on label"); */
    }

    if (!element.contains(event.target)) {
      closeFilterClassMenu();
      /* console.log("clicked outside!"); */
    }
  };

  controller = new AbortController();
  document.addEventListener("click", outsideClickListener, {
    capture: true,
    signal: controller.signal,
  });
}