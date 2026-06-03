const flyoutBtn = document.querySelector(".flyout-btn");
const flyout = document.querySelector(".flyout");
const itemButtons = Array.from(document.querySelectorAll(".flyout > li button"));

const closeMenu = (animationClass = "contract") => {
  flyoutBtn.classList.remove("btn-rotate");
  flyout.classList.remove("expand", "contract", "fade");
  flyout.classList.add(animationClass);
  flyoutBtn.setAttribute("aria-expanded", "false");
};

flyoutBtn.addEventListener("click", () => {
  const isOpen = flyout.classList.contains("expand");

  itemButtons.forEach((button) => button.classList.remove("clicked"));
  flyout.classList.remove("flyout-init", "contract", "fade");

  if (isOpen) {
    closeMenu();
    return;
  }

  flyoutBtn.classList.add("btn-rotate");
  flyout.classList.add("expand");
  flyoutBtn.setAttribute("aria-expanded", "true");
});

itemButtons.forEach((button) => {
  button.addEventListener("click", () => {
    itemButtons.forEach((item) => item.classList.remove("clicked"));
    button.classList.add("clicked");
    closeMenu("fade");
  });
});
