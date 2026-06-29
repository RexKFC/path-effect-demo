const flyoutWraps = Array.from(document.querySelectorAll(".flyout-wrap"));
const viewSwitchButtons = Array.from(document.querySelectorAll(".view-switch-btn"));
const viewPanels = Array.from(document.querySelectorAll("[data-view-panel]"));
const todayDate = document.querySelector("[data-today-date]");
const todayWeekday = document.querySelector("[data-today-weekday]");
const cardInputImage = document.querySelector("[data-card-input-image]");
const cardInputToggle = document.querySelector("[data-card-input-toggle]");
const cardPageBody = document.querySelector(".card-page-body");
const feedEntry = document.querySelector("[data-feed-entry]");
const feedEntryFood = document.querySelector("[data-feed-entry-food]");
const feedCard = document.querySelector("[data-feed-card]");
const feedChartHeader = document.querySelector("[data-feed-chart-header]");
const feedChartToggle = document.querySelector("[data-feed-chart-toggle]");
const feedChartContent = document.querySelector("[data-feed-chart-content]");
const feedChartPanel = document.querySelector("[data-feed-chart-panel]");
const feedCardSummary = document.querySelector("[data-feed-card-summary]");
const feedCardTime = document.querySelector("[data-feed-card-time]");
const feedCardContent = document.querySelector("[data-feed-card-content]");
const feedCardTags = document.querySelector("[data-feed-card-tags]");
const feedCardTagItems = Array.from(document.querySelectorAll("[data-feed-tag]"));
const foodCardContent = document.querySelector("[data-food-card-content]");
const foodCardTotal = document.querySelector("[data-food-card-total]");
const foodCardSummary = document.querySelector("[data-food-card-summary]");
const foodCardPhoto = document.querySelector("[data-food-card-photo]");
const foodCardDivider = document.querySelector("[data-food-card-divider]");
const feedChartLine = document.querySelector(".feed-chart-line");
const feedChartDots = Array.from(document.querySelectorAll(".feed-chart-dots circle"));
const moodExpandPanel = document.querySelector('[data-view-panel="mood-expand"]');
const moodCardPageBody = moodExpandPanel?.querySelector(".card-page-body");
const moodFlyoutWrap = moodExpandPanel?.querySelector("[data-mood-flyout-wrap]");
const moodCard = moodExpandPanel?.querySelector("[data-mood-card]");
const moodCardInner = moodCard?.querySelector(".mood-expand-card-inner");
const moodOptionButtons = Array.from(moodExpandPanel?.querySelectorAll(".mood-option") || []);
const moodTimelineFeed = moodExpandPanel?.querySelector(".mood-timeline-feed");
const moodFeedEntry = moodExpandPanel?.querySelector("[data-mood-feed-entry]");
const moodFeedSummary = moodExpandPanel?.querySelector("[data-mood-feed-summary]");
const moodFeedTime = moodExpandPanel?.querySelector("[data-mood-feed-time]");
const moodFeedIcon = moodExpandPanel?.querySelector("[data-mood-feed-icon]");
const moodFeedText = moodExpandPanel?.querySelector("[data-mood-feed-text]");
const moodFeedChartContent = moodExpandPanel?.querySelector("[data-mood-feed-chart-content]");
const moodFeedChartLine = moodExpandPanel?.querySelector("[data-mood-feed-chart-line]");
let moodCardEnterTimer = null;
let moodCardLeaveTimer = null;
let moodFeedEntryCount = 0;

const weekdayMap = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

if (todayDate && todayWeekday) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  todayDate.textContent = `${month}月${day}日`;
  todayWeekday.textContent = weekdayMap[now.getDay()];
}

const syncChartLineLength = (lineElement, entryElement) => {
  if (!lineElement || !entryElement) {
    return;
  }

  const chartLineLength = lineElement.getTotalLength();
  entryElement.style.setProperty("--chart-line-length", String(chartLineLength));
};

syncChartLineLength(feedChartLine, feedEntry);
syncChartLineLength(moodFeedChartLine, moodFeedEntry);

let summaryTypingTimer = null;
let summaryStartTimer = null;
let cardInputClickCount = 0;
const typingTimers = new WeakMap();
const startTimers = new WeakMap();
let foodRevealScrollRaf = null;
let moodRevealScrollRaf = null;
const FEED_CHART_FULL_REVEAL_MS = 1280;
const FEED_SUMMARY_AFTER_CHART_DELAY_MS = 0;
const FOOD_CHART_BASE_REVEAL_MS = 600;
const FOOD_CHART_BARS_REVEAL_MS = 1040;

const scrollCardPageToBottom = (behavior = "auto") => {
  if (!cardPageBody) {
    return;
  }

  cardPageBody.scrollTo({
    top: cardPageBody.scrollHeight,
    behavior,
  });
};

const keepCardPageBottomVisible = (duration = 2400) => {
  if (!cardPageBody) {
    return;
  }

  if (foodRevealScrollRaf) {
    window.cancelAnimationFrame(foodRevealScrollRaf);
    foodRevealScrollRaf = null;
  }

  const startTime = performance.now();

  const tick = (now) => {
    scrollCardPageToBottom();

    if (now - startTime < duration) {
      foodRevealScrollRaf = window.requestAnimationFrame(tick);
      return;
    }

    foodRevealScrollRaf = null;
  };

  foodRevealScrollRaf = window.requestAnimationFrame(tick);
};

const scrollMoodPageToBottom = (behavior = "auto") => {
  if (!moodCardPageBody) {
    return;
  }

  moodCardPageBody.scrollTo({
    top: moodCardPageBody.scrollHeight,
    behavior,
  });
};

const keepMoodPageBottomVisible = (duration = 2400) => {
  if (!moodCardPageBody) {
    return;
  }

  if (moodRevealScrollRaf) {
    window.cancelAnimationFrame(moodRevealScrollRaf);
    moodRevealScrollRaf = null;
  }

  const startTime = performance.now();

  const tick = (now) => {
    scrollMoodPageToBottom();

    if (now - startTime < duration) {
      moodRevealScrollRaf = window.requestAnimationFrame(tick);
      return;
    }

    moodRevealScrollRaf = null;
  };

  moodRevealScrollRaf = window.requestAnimationFrame(tick);
};

const flattenSummaryNodes = (node, activeClassName = "") => {
  if (node.nodeType === Node.TEXT_NODE) {
    return Array.from(node.textContent || "").map((character) => ({
      character,
      className: activeClassName,
    }));
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const currentClassName = node.classList?.length ? Array.from(node.classList).join(" ") : "";
  const nextClassName = currentClassName || activeClassName;

  return Array.from(node.childNodes).flatMap((childNode) =>
    flattenSummaryNodes(childNode, nextClassName),
  );
};

const appendSummaryToken = (summaryElement, token) => {
  const lastWrapper = summaryElement.lastElementChild;
  const wrapperClassName = token.className || "";

  let targetWrapper = lastWrapper;

  if (!targetWrapper || (targetWrapper.dataset.wrapperClassName || "") !== wrapperClassName) {
    targetWrapper = document.createElement("span");
    targetWrapper.dataset.wrapperClassName = wrapperClassName;

    if (wrapperClassName) {
      targetWrapper.className = wrapperClassName;
    }

    summaryElement.appendChild(targetWrapper);
  }

  const characterNode = document.createElement("span");
  characterNode.className = "summary-char";
  characterNode.textContent = token.character;
  targetWrapper.appendChild(characterNode);
};

const clearTypedElementTimers = (element) => {
  if (!element) {
    return;
  }

  const typingTimer = typingTimers.get(element);
  const startTimer = startTimers.get(element);

  if (typingTimer) {
    window.clearTimeout(typingTimer);
    typingTimers.delete(element);
  }

  if (startTimer) {
    window.clearTimeout(startTimer);
    startTimers.delete(element);
  }
};

const prepareTypedElement = (element) => {
  if (!element) {
    return;
  }

  if (!element.dataset.fullHtml) {
    element.dataset.fullHtml = element.innerHTML;
  }

  if (!element.dataset.fullText) {
    const tokens = Array.from(element.childNodes).flatMap((childNode) =>
      flattenSummaryNodes(childNode),
    );
    element.dataset.fullText = JSON.stringify(tokens);
  }
};

const setTypedElementHeight = (element, height) => {
  if (!element) {
    return;
  }

  element.style.height = typeof height === "number" ? `${height}px` : height;
};

const syncTypedElementHeight = (element) => {
  if (!element) {
    return;
  }

  setTypedElementHeight(element, element.scrollHeight);
};

const getElementFirstLineHeight = (element, fallbackMultiplier = 1.6) => {
  if (!element) {
    return 0;
  }

  const computedStyle = window.getComputedStyle(element);
  const parsedLineHeight = Number.parseFloat(computedStyle.lineHeight);

  if (Number.isFinite(parsedLineHeight)) {
    return parsedLineHeight;
  }

  const parsedFontSize = Number.parseFloat(computedStyle.fontSize);
  return Number.isFinite(parsedFontSize) ? parsedFontSize * fallbackMultiplier : 28;
};

const startTypewriterForElement = (element, options = {}) => {
  if (!element) {
    return;
  }

  const { onCharacter, onDone } = options;

  prepareTypedElement(element);
  clearTypedElementTimers(element);

  const tokens = JSON.parse(element.dataset.fullText || "[]");
  let index = 0;

  element.innerHTML = "";
  syncTypedElementHeight(element);

  const typeNextCharacter = () => {
    appendSummaryToken(element, tokens[index]);
    syncTypedElementHeight(element);
    onCharacter?.();
    index += 1;

    if (index >= tokens.length) {
      setTypedElementHeight(element, "auto");
      typingTimers.delete(element);
      onDone?.();
      return;
    }

    const currentCharacter = tokens[index - 1]?.character || "";
    const delay = /[，。,；：！？]/.test(currentCharacter)
      ? 90
      : /\s/.test(currentCharacter)
        ? 18
        : 28;

    const nextTimer = window.setTimeout(typeNextCharacter, delay);
    typingTimers.set(element, nextTimer);
  };

  typeNextCharacter();
};

const syncSummaryHeightToContent = () => {
  if (!feedCardSummary) {
    return;
  }

  feedCardSummary.style.setProperty("--summary-target-height", `${feedCardSummary.scrollHeight}px`);

  if (feedChartContent) {
    feedChartContent.style.maxHeight = `${feedChartContent.scrollHeight}px`;
  }
};

const expandFeedChartContent = () => {
  if (!feedChartContent) {
    return;
  }

  feedChartContent.style.maxHeight = `${feedChartContent.scrollHeight}px`;
};

const collapseFeedChartContent = () => {
  if (!feedChartContent) {
    return;
  }

  feedChartContent.style.maxHeight = `${feedChartContent.scrollHeight}px`;

  window.requestAnimationFrame(() => {
    feedChartContent.style.maxHeight = "0px";
  });
};

const getSummaryFirstLineHeight = () => {
  return getElementFirstLineHeight(feedCardSummary);
};

const startSummaryTypewriter = () => {
  if (!feedCardSummary) {
    return;
  }

  prepareTypedElement(feedCardSummary);
  clearTypedElementTimers(feedCardSummary);

  startTypewriterForElement(feedCardSummary, {
    onCharacter: syncSummaryHeightToContent,
    onDone: () => {
      summaryTypingTimer = null;
    },
  });
};

const runMoodFeedEntryReveal = (entryElement, options = {}) => {
  const { withDetail = true } = options;

  if (!entryElement) {
    return;
  }

  const entrySummary = entryElement.querySelector(".feed-card-summary");
  const entryChartContent = entryElement.querySelector(".feed-chart-content");
  const entryChartLine = entryElement.querySelector(".feed-chart-line");

  if (withDetail && (!entryChartContent || !entrySummary)) {
    return;
  }

  prepareTypedElement(entrySummary);
  clearTypedElementTimers(entrySummary);
  syncChartLineLength(entryChartLine, entryElement);

  entryElement.classList.remove("is-primary-visible");
  entryElement.classList.remove("is-tags-visible");
  entryElement.classList.remove("is-divider-visible");
  entryElement.classList.remove("is-summary-visible");
  entryElement.classList.remove("is-green-visible");
  entryElement.classList.add("is-entering");

  if (!withDetail) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        entryElement.classList.add("is-primary-visible");
        scrollMoodPageToBottom("smooth");
      });
    });
    return;
  }

  entrySummary.style.setProperty("--summary-target-height", "0px");
  entrySummary.innerHTML = "";
  entryChartContent.style.maxHeight = "";

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      entryElement.classList.add("is-primary-visible");
      scrollMoodPageToBottom("smooth");
    });
  });

  window.setTimeout(() => {
    entryElement.classList.add("is-divider-visible");
    scrollMoodPageToBottom();
  }, 300);

  window.setTimeout(() => {
    entryElement.classList.add("is-green-visible");
    scrollMoodPageToBottom();

    window.setTimeout(() => {
      entrySummary.style.setProperty(
        "--summary-target-height",
        `${getElementFirstLineHeight(entrySummary)}px`,
      );
      entryElement.classList.add("is-summary-visible");
      entrySummary.style.setProperty("--summary-target-height", `${entrySummary.scrollHeight}px`);
      entryChartContent.style.maxHeight = `${entryChartContent.scrollHeight}px`;
      keepMoodPageBottomVisible();

      startTypewriterForElement(entrySummary, {
        onCharacter: () => {
          entrySummary.style.setProperty(
            "--summary-target-height",
            `${entrySummary.scrollHeight}px`,
          );
          entryChartContent.style.maxHeight = `${entryChartContent.scrollHeight}px`;
          scrollMoodPageToBottom();
        },
      });
    }, FEED_CHART_FULL_REVEAL_MS);
  }, 540);
};

const createMoodFeedEntry = (optionLabel, withDetail) => {
  if (!moodFeedEntry) {
    return null;
  }

  const entryElement = moodFeedEntry.cloneNode(true);
  const entryText = entryElement.querySelector("[data-mood-feed-text]");

  if (entryText) {
    entryText.textContent = optionLabel;
  }

  if (!withDetail) {
    entryElement.querySelector(".feed-card-divider")?.remove();
    entryElement.querySelector(".feed-chart-header")?.remove();
    entryElement.querySelector(".feed-chart-content")?.remove();
    entryElement.querySelector(".feed-card-summary")?.remove();
  }

  entryElement.hidden = false;
  return entryElement;
};

const runFeedEntryReveal = () => {
  if (!feedEntry || !feedChartHeader || !feedChartPanel || !feedCardSummary) {
    return;
  }

  prepareTypedElement(feedCardSummary);

  if (summaryTypingTimer) {
    window.clearTimeout(summaryTypingTimer);
    summaryTypingTimer = null;
  }

  if (summaryStartTimer) {
    window.clearTimeout(summaryStartTimer);
    summaryStartTimer = null;
  }

  feedEntry.classList.remove("is-primary-visible");
  feedEntry.classList.remove("is-tags-visible");
  feedEntry.classList.remove("is-divider-visible");
  feedEntry.classList.remove("is-summary-visible");
  feedEntry.classList.remove("is-green-visible");
  feedEntry.classList.add("is-entering");
  feedCardSummary.style.setProperty("--summary-target-height", "0px");
  feedCardSummary.innerHTML = "";

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      feedEntry.classList.add("is-primary-visible");
    });
  });

  window.setTimeout(() => {
    feedEntry.classList.add("is-tags-visible");
  }, 300);

  summaryStartTimer = window.setTimeout(() => {
    feedEntry.classList.add("is-divider-visible");
  }, 840);

  summaryStartTimer = window.setTimeout(() => {
    feedEntry.classList.add("is-green-visible");

    summaryStartTimer = window.setTimeout(() => {
      feedCardSummary.style.setProperty(
        "--summary-target-height",
        `${getSummaryFirstLineHeight()}px`,
      );
      feedEntry.classList.add("is-summary-visible");
      syncSummaryHeightToContent();

      summaryStartTimer = window.setTimeout(() => {
        startSummaryTypewriter();
        summaryStartTimer = null;
      }, FEED_SUMMARY_AFTER_CHART_DELAY_MS);
    }, FEED_CHART_FULL_REVEAL_MS);
  }, 1080);
};

const runFoodFeedEntryReveal = () => {
  if (
    !feedEntryFood ||
    !foodCardPhoto ||
    !foodCardContent ||
    !foodCardTotal ||
    !foodCardSummary ||
    !foodCardDivider
  ) {
    return;
  }

  [foodCardContent, foodCardTotal, foodCardSummary].forEach((element) => {
    prepareTypedElement(element);
    clearTypedElementTimers(element);
    element.innerHTML = "";
    setTypedElementHeight(element, 0);
  });

  feedEntryFood.classList.remove(
    "is-food-photo-visible",
    "is-food-content-visible",
    "is-food-total-visible",
    "is-food-divider-visible",
    "is-food-summary-visible",
    "is-food-chart-visible",
    "is-food-bars-visible",
    "is-food-summary-text-visible",
  );
  feedEntryFood.classList.add("is-entering");
  keepCardPageBottomVisible();

  const primaryStartTimer = window.setTimeout(() => {
    feedEntryFood.classList.add("is-food-photo-visible");
    scrollCardPageToBottom();
  }, 0);

  const textStartTimer = window.setTimeout(() => {
    feedEntryFood.classList.add("is-food-content-visible");
    setTypedElementHeight(foodCardContent, getElementFirstLineHeight(foodCardContent, 1.45));
    scrollCardPageToBottom();

    startTypewriterForElement(foodCardContent, {
      onCharacter: () => {
        scrollCardPageToBottom();
      },
      onDone: () => {
        feedEntryFood.classList.add("is-food-total-visible");
        setTypedElementHeight(foodCardTotal, getElementFirstLineHeight(foodCardTotal, 1.2));
        scrollCardPageToBottom();

        startTypewriterForElement(foodCardTotal, {
          onCharacter: () => {
            scrollCardPageToBottom();
          },
          onDone: () => {
            const summaryRevealTimer = window.setTimeout(() => {
              feedEntryFood.classList.add("is-food-divider-visible");
              scrollCardPageToBottom();

              window.setTimeout(() => {
                feedEntryFood.classList.add("is-food-summary-visible");
                scrollCardPageToBottom();

                window.setTimeout(() => {
                  feedEntryFood.classList.add("is-food-chart-visible");
                  scrollCardPageToBottom();
                }, 0);

                window.setTimeout(() => {
                  feedEntryFood.classList.add("is-food-bars-visible");
                  scrollCardPageToBottom();
                }, FOOD_CHART_BASE_REVEAL_MS);

                window.setTimeout(() => {
                  feedEntryFood.classList.add("is-food-summary-text-visible");
                  setTypedElementHeight(
                    foodCardSummary,
                    getElementFirstLineHeight(foodCardSummary, 1.5),
                  );
                  scrollCardPageToBottom();

                  startTypewriterForElement(foodCardSummary, {
                    onCharacter: () => {
                      scrollCardPageToBottom();
                    },
                  });
                  startTimers.delete(foodCardSummary);
                }, FOOD_CHART_BARS_REVEAL_MS);
              }, 240);
            }, 120);

            startTimers.set(foodCardSummary, summaryRevealTimer);
          },
        });
      },
    });

    startTimers.delete(foodCardContent);
    startTimers.delete(foodCardTotal);
  }, 300);

  startTimers.set(foodCardContent, primaryStartTimer);
  startTimers.set(foodCardTotal, textStartTimer);
};

if (cardInputImage && cardInputToggle) {
  cardInputToggle.addEventListener("click", () => {
    if (!feedEntry || !feedEntryFood) {
      return;
    }

    cardInputClickCount += 1;

    if (cardInputClickCount === 1) {
      feedEntry.hidden = false;
      cardInputImage.src = "./assets/文字输入框.png";
      cardInputImage.alt = "文字输入框";
      runFeedEntryReveal();

      if (cardPageBody) {
        cardPageBody.scrollTo({ top: cardPageBody.scrollHeight, behavior: "smooth" });
      }

      return;
    }

    if (cardInputClickCount === 2) {
      feedEntryFood.hidden = false;
      runFoodFeedEntryReveal();

      if (cardPageBody) {
        window.requestAnimationFrame(() => {
          scrollCardPageToBottom();
        });
      }

      return;
    }
  });
}

document.querySelectorAll("[data-card-collapse-toggle]").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const card = toggle.closest(".feed-card");
    const content = card?.querySelector("[data-card-collapse-content]");

    if (!card || !content) {
      return;
    }

    const willCollapse = !card.classList.contains("is-collapsed");

    if (willCollapse) {
      content.style.maxHeight = `${content.scrollHeight}px`;
      window.requestAnimationFrame(() => {
        content.style.maxHeight = "0px";
      });
      card.classList.add("is-collapsed");
      toggle.setAttribute("aria-expanded", "false");
      return;
    }

    card.classList.remove("is-collapsed");
    toggle.setAttribute("aria-expanded", "true");

    window.requestAnimationFrame(() => {
      content.style.maxHeight = `${content.scrollHeight}px`;
    });
  });
});

const closeMenu = (wrap, animationClass = "contract") => {
  const flyoutBtn = wrap.querySelector(".flyout-btn");
  const flyout = wrap.querySelector(".flyout");

  if (!flyoutBtn || !flyout) {
    return;
  }

  flyoutBtn.classList.remove("btn-rotate");
  flyout.classList.remove("expand", "contract", "fade");
  flyout.classList.add(animationClass);
  flyoutBtn.setAttribute("aria-expanded", "false");
};

const openMoodCard = (triggerButton) => {
  if (!moodFlyoutWrap || !moodCard || !moodCardInner) {
    return;
  }

  const flyoutBtn = moodFlyoutWrap.querySelector(".flyout-btn");
  const flyout = moodFlyoutWrap.querySelector(".flyout");
  const triggerTarget = triggerButton?.querySelector(".option-bg") || triggerButton;

  if (moodCardEnterTimer) {
    window.clearTimeout(moodCardEnterTimer);
    moodCardEnterTimer = null;
  }

  if (moodCardLeaveTimer) {
    window.clearTimeout(moodCardLeaveTimer);
    moodCardLeaveTimer = null;
  }

  moodCard.hidden = false;
  moodCard.style.display = "block";
  moodCard.classList.remove("is-entering", "is-visible", "is-leaving");

  const cardRect = moodCard.getBoundingClientRect();
  const innerRect = moodCardInner.getBoundingClientRect();
  const triggerRect = triggerTarget?.getBoundingClientRect();
  const startWidth = triggerRect?.width || 56;
  const startHeight = triggerRect?.height || 56;
  const startX = triggerRect ? triggerRect.left - cardRect.left : innerRect.width - startWidth;
  const startY = triggerRect ? triggerRect.top - cardRect.top : innerRect.height - startHeight;

  moodCardInner.style.setProperty("--mood-enter-x", `${startX}px`);
  moodCardInner.style.setProperty("--mood-enter-y", `${startY}px`);
  moodCardInner.style.setProperty("--mood-enter-scale-x", `${startWidth / innerRect.width}`);
  moodCardInner.style.setProperty("--mood-enter-scale-y", `${startHeight / innerRect.height}`);

  flyout?.classList.remove("expand", "contract", "fade");
  flyout?.classList.add("flyout-init");
  flyoutBtn?.classList.add("btn-rotate");
  flyoutBtn?.setAttribute("aria-expanded", "true");
  moodFlyoutWrap.dataset.moodCardOpen = "true";

  void moodCard.offsetWidth;
  moodCard.classList.add("is-entering");

  moodCardEnterTimer = window.setTimeout(() => {
    moodCard.classList.remove("is-entering");
    moodCard.classList.add("is-visible");
    moodCardEnterTimer = null;
  }, 500);
};

const closeMoodCard = (onDone) => {
  if (!moodFlyoutWrap || !moodCard) {
    onDone?.();
    return;
  }

  if (moodCardEnterTimer) {
    window.clearTimeout(moodCardEnterTimer);
    moodCardEnterTimer = null;
  }

  if (moodCardLeaveTimer) {
    window.clearTimeout(moodCardLeaveTimer);
    moodCardLeaveTimer = null;
  }

  moodCard.classList.remove("is-entering", "is-visible");
  moodCard.classList.add("is-leaving");
  moodFlyoutWrap.dataset.moodCardOpen = "false";
  closeMenu(moodFlyoutWrap);

  moodCardLeaveTimer = window.setTimeout(() => {
    moodCard.classList.remove("is-leaving");
    moodCard.hidden = true;
    moodCard.style.display = "none";
    moodCardLeaveTimer = null;
    onDone?.();
  }, 300);
};

moodOptionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!moodFeedEntry || !moodFeedText || !moodTimelineFeed) {
      closeMoodCard();
      return;
    }

    const optionLabel = button.querySelector(".mood-option-label")?.textContent?.trim() || "";
    closeMoodCard(() => {
      moodFeedEntryCount += 1;

      if (moodFeedEntryCount === 1) {
        moodFeedText.textContent = optionLabel;
        syncChartLineLength(moodFeedChartLine, moodFeedEntry);
        moodFeedEntry.hidden = false;
        runMoodFeedEntryReveal(moodFeedEntry, { withDetail: true });
        return;
      }

      const compactEntry = createMoodFeedEntry(optionLabel, false);

      if (!compactEntry) {
        return;
      }

      moodTimelineFeed.appendChild(compactEntry);
      scrollMoodPageToBottom("smooth");
      runMoodFeedEntryReveal(compactEntry, { withDetail: false });
    });
  });
});

flyoutWraps.forEach((wrap) => {
  const flyoutBtn = wrap.querySelector(".flyout-btn");
  const flyout = wrap.querySelector(".flyout");
  const itemButtons = Array.from(wrap.querySelectorAll(".flyout > li button"));

  if (!flyoutBtn || !flyout) {
    return;
  }

  flyoutBtn.addEventListener("click", () => {
    if (wrap === moodFlyoutWrap && moodFlyoutWrap?.dataset.moodCardOpen === "true") {
      closeMoodCard();
      return;
    }

    const isOpen = flyout.classList.contains("expand");

    itemButtons.forEach((button) => button.classList.remove("clicked"));
    flyout.classList.remove("flyout-init", "contract", "fade");

    if (isOpen) {
      closeMenu(wrap);
      return;
    }

    flyoutBtn.classList.add("btn-rotate");
    flyout.classList.add("expand");
    flyoutBtn.setAttribute("aria-expanded", "true");
  });

  itemButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.hasAttribute("data-mood-trigger") && wrap === moodFlyoutWrap) {
        openMoodCard(button);
        return;
      }

      itemButtons.forEach((item) => item.classList.remove("clicked"));
      button.classList.add("clicked");
      closeMenu(wrap, "fade");
    });
  });
});

document.addEventListener("click", (event) => {
  if (
    moodFlyoutWrap &&
    moodCard &&
    moodFlyoutWrap.dataset.moodCardOpen === "true" &&
    !event.target.closest("[data-mood-card]") &&
    event.target.closest(".flyout-wrap") !== moodFlyoutWrap
  ) {
    closeMoodCard();
  }

  flyoutWraps.forEach((wrap) => {
    const flyout = wrap.querySelector(".flyout");

    if (!flyout || !flyout.classList.contains("expand")) {
      return;
    }

    if (event.target.closest(".flyout-wrap") === wrap) {
      return;
    }

    closeMenu(wrap);
  });
});

viewSwitchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetView = button.dataset.viewTarget;

    viewSwitchButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    viewPanels.forEach((panel) => {
      panel.hidden = panel.dataset.viewPanel !== targetView;
      panel.classList.toggle("is-active", panel.dataset.viewPanel === targetView);
    });

    if (targetView !== "quick-record") {
      flyoutWraps.forEach((wrap) => {
        const flyout = wrap.querySelector(".flyout");
        const itemButtons = Array.from(wrap.querySelectorAll(".flyout > li button"));

        itemButtons.forEach((item) => item.classList.remove("clicked"));
        flyout?.classList.add("flyout-init");
        closeMenu(wrap);
      });
    }
  });
});
