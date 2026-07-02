const flyoutWraps = Array.from(document.querySelectorAll(".flyout-wrap"));
const viewSwitchButtons = Array.from(document.querySelectorAll(".view-switch-btn"));
const viewPanels = Array.from(document.querySelectorAll("[data-view-panel]"));
const todayDate = document.querySelector("[data-today-date]");
const todayWeekday = document.querySelector("[data-today-weekday]");
const cardInputImage = document.querySelector("[data-card-input-image]");
const cardInputText = document.querySelector("[data-card-input-text]");
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
const foodCapturePanel = document.querySelector('[data-view-panel="food-capture"]');
const foodCapturePageBody = foodCapturePanel?.querySelector("[data-food-capture-page-body]");
const foodFlyoutWrap = foodCapturePanel?.querySelector("[data-food-flyout-wrap]");
const foodCaptureTimelineFeed = foodCapturePanel?.querySelector(".food-capture-timeline-feed");
const foodCaptureEntry = foodCapturePanel?.querySelector("[data-food-capture-entry]");
const foodCameraSheet = foodCapturePanel?.querySelector("[data-food-camera-sheet]");
const foodCameraBackground = foodCapturePanel?.querySelector(".food-camera-background");
const foodCameraRecognitionImage = foodCapturePanel?.querySelector(".food-camera-recognition-image");
const foodCameraAlbumButton = foodCapturePanel?.querySelector("[data-food-camera-album]");
const foodCameraCloseButton = foodCapturePanel?.querySelector("[data-food-camera-close]");
const foodCameraShutterButton = foodCapturePanel?.querySelector("[data-food-camera-shutter]");
const foodCameraRecognitionText = foodCapturePanel?.querySelector(".food-camera-recognition-text");
const foodCameraRecognitionScan = foodCapturePanel?.querySelector(".food-camera-recognition-scan");
const foodAlbumSheet = foodCapturePanel?.querySelector("[data-food-album-sheet]");
const foodAlbumCancelButton = foodCapturePanel?.querySelector("[data-food-album-cancel]");
const foodAlbumSelectButtons = Array.from(
  foodCapturePanel?.querySelectorAll("[data-food-album-select]") || [],
);
let foodCameraRevealTimer = null;
let foodCameraCaptureTimer = null;
let foodCameraRecognitionTextTimer = null;
let foodCameraScanStartTimer = null;
let foodCameraScanTimer = null;
let foodCameraCompletionTimer = null;
let foodAlbumSheetTimer = null;
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
let foodCaptureRevealScrollRaf = null;
const FEED_CHART_FULL_REVEAL_MS = 500;
const FEED_SUMMARY_AFTER_CHART_DELAY_MS = 0;
const FEED_SUMMARY_AFTER_LINE_REVEAL_MS = 700;
const FOOD_CHART_BASE_REVEAL_MS = 600;
const FOOD_CHART_BARS_REVEAL_MS = 1040;
const FEED_CARD_SHELL_EXPAND_MS = 250;
const FOOD_CARD_SHELL_EXPAND_MS = 250;
const MOOD_CARD_SHELL_EXPAND_MS = 250;
const CARD_OUTPUT_PRIMARY_REVEAL_MS = 250;
const CARD_INPUT_TEXT_STEP_1 = "点击发送，展示记心情动效";
const CARD_INPUT_TEXT_STEP_2 = "再次点击，展示记饮食动效";
const CARD_INPUT_TEXT_STEP_3 = "记录生活点滴";
const FOOD_CAMERA_IMAGE_DEFAULT = './assets/底图.png';
const FOOD_CAMERA_IMAGE_ALBUM = './assets/底图2.png';

const restoreElementOriginalContent = (element) => {
  if (!element) {
    return;
  }

  if (element.dataset.fullHtml) {
    element.innerHTML = element.dataset.fullHtml;
  }
};

const resetTypedElementState = (element) => {
  if (!element) {
    return;
  }

  clearTypedElementTimers(element);
  restoreElementOriginalContent(element);
  element.style.removeProperty("height");
  element.style.removeProperty("--summary-target-height");
};

const setFoodCameraImage = (imagePath) => {
  if (foodCameraBackground) {
    foodCameraBackground.style.setProperty("--food-camera-image", `url("${imagePath}")`);
  }

  if (foodCameraRecognitionImage) {
    foodCameraRecognitionImage.style.setProperty("--food-camera-image", `url("${imagePath}")`);
  }
};

const resetFoodCameraScanPresentation = () => {
  if (!foodCameraRecognitionScan) {
    return;
  }

  foodCameraRecognitionScan.style.removeProperty("transform");
};

const resetFlyoutWrap = (wrap) => {
  if (!wrap) {
    return;
  }

  const flyoutBtn = wrap.querySelector(".flyout-btn");
  const flyout = wrap.querySelector(".flyout");
  const itemButtons = Array.from(wrap.querySelectorAll(".flyout > li button"));

  itemButtons.forEach((button) => button.classList.remove("clicked"));
  flyoutBtn?.classList.remove("btn-rotate");
  flyoutBtn?.setAttribute("aria-expanded", "false");
  flyout?.classList.remove("expand", "contract", "fade");
  flyout?.classList.add("flyout-init");
};

const resetCollapsibleCards = (scope) => {
  if (!scope) {
    return;
  }

  scope.querySelectorAll(".feed-card").forEach((card) => {
    card.classList.remove("is-collapsed");
  });

  scope.querySelectorAll("[data-card-collapse-toggle]").forEach((toggle) => {
    toggle.setAttribute("aria-expanded", "true");
  });

  scope.querySelectorAll("[data-card-collapse-content]").forEach((content) => {
    content.style.removeProperty("max-height");
  });
};

const resetQuickRecordView = () => {
  const quickRecordPanel = document.querySelector('[data-view-panel="quick-record"]');

  resetFlyoutWrap(quickRecordPanel?.querySelector(".flyout-wrap"));
};

const resetCardOutputView = () => {
  const cardOutputPanel = document.querySelector('[data-view-panel="card-output"]');

  if (summaryTypingTimer) {
    window.clearTimeout(summaryTypingTimer);
    summaryTypingTimer = null;
  }

  if (summaryStartTimer) {
    window.clearTimeout(summaryStartTimer);
    summaryStartTimer = null;
  }

  if (foodRevealScrollRaf) {
    window.cancelAnimationFrame(foodRevealScrollRaf);
    foodRevealScrollRaf = null;
  }

  cardInputClickCount = 0;

  if (feedEntry) {
    feedEntry.hidden = true;
    feedEntry.classList.remove(
      "is-entering",
      "is-card-shell-visible",
      "is-primary-visible",
      "is-tags-visible",
      "is-divider-visible",
      "is-green-visible",
      "is-summary-visible",
    );
    feedEntry.style.removeProperty("--chart-line-length");
  }

  if (feedEntryFood) {
    feedEntryFood.hidden = true;
    feedEntryFood.classList.remove(
      "is-entering",
      "is-food-shell-visible",
      "is-food-photo-visible",
      "is-food-content-visible",
      "is-food-total-visible",
      "is-food-divider-visible",
      "is-food-summary-visible",
      "is-food-chart-visible",
      "is-food-bars-visible",
      "is-food-summary-text-visible",
    );
  }

  if (cardInputImage) {
    cardInputImage.src = "./assets/文字输入框.png";
    cardInputImage.alt = "文字输入框";
  }

  if (cardInputText) {
    cardInputText.textContent = CARD_INPUT_TEXT_STEP_1;
    cardInputText.classList.remove("is-muted");
  }

  resetTypedElementState(feedCardContent);
  resetTypedElementState(feedCardSummary);
  resetTypedElementState(foodCardContent);
  resetTypedElementState(foodCardTotal);
  resetTypedElementState(foodCardSummary);

  feedChartContent?.style.removeProperty("max-height");
  feedCard?.style.removeProperty("--feed-card-expanded-height");
  cardPageBody?.scrollTo({ top: 0, behavior: "auto" });
  resetCollapsibleCards(cardOutputPanel);
};

const resetMoodExpandView = () => {
  if (moodCardEnterTimer) {
    window.clearTimeout(moodCardEnterTimer);
    moodCardEnterTimer = null;
  }

  if (moodCardLeaveTimer) {
    window.clearTimeout(moodCardLeaveTimer);
    moodCardLeaveTimer = null;
  }

  if (moodRevealScrollRaf) {
    window.cancelAnimationFrame(moodRevealScrollRaf);
    moodRevealScrollRaf = null;
  }

  moodFeedEntryCount = 0;

  if (moodCard) {
    moodCard.hidden = true;
    moodCard.style.display = "none";
    moodCard.classList.remove("is-entering", "is-visible", "is-leaving");
  }

  if (moodFlyoutWrap) {
    moodFlyoutWrap.dataset.moodCardOpen = "false";
    resetFlyoutWrap(moodFlyoutWrap);
  }

  if (moodTimelineFeed && moodFeedEntry) {
    Array.from(moodTimelineFeed.children).forEach((entry) => {
      if (entry !== moodFeedEntry) {
        entry.remove();
      }
    });
  }

  if (moodFeedEntry) {
    moodFeedEntry.hidden = true;
    moodFeedEntry.classList.remove(
      "is-entering",
      "is-card-shell-visible",
      "is-primary-visible",
      "is-tags-visible",
      "is-divider-visible",
      "is-green-visible",
      "is-summary-visible",
    );
    moodFeedEntry.style.removeProperty("--chart-line-length");
  }

  if (moodFeedText) {
    moodFeedText.textContent = "挺开心";
  }

  resetTypedElementState(moodFeedSummary);
  moodFeedChartContent?.style.removeProperty("max-height");
  moodCardPageBody?.scrollTo({ top: 0, behavior: "auto" });
  resetCollapsibleCards(moodExpandPanel);
};

const resetFoodCaptureView = () => {
  if (foodCaptureRevealScrollRaf) {
    window.cancelAnimationFrame(foodCaptureRevealScrollRaf);
    foodCaptureRevealScrollRaf = null;
  }

  if (foodAlbumSheetTimer) {
    window.clearTimeout(foodAlbumSheetTimer);
    foodAlbumSheetTimer = null;
  }

  if (foodCaptureTimelineFeed && foodCaptureEntry) {
    Array.from(foodCaptureTimelineFeed.children).forEach((entry) => {
      if (entry !== foodCaptureEntry) {
        entry.remove();
      }
    });
  }

  if (foodCaptureEntry) {
    foodCaptureEntry.hidden = true;
    foodCaptureEntry.classList.remove(
      "is-entering",
      "is-food-shell-visible",
      "is-food-photo-visible",
      "is-food-content-visible",
      "is-food-total-visible",
      "is-food-divider-visible",
      "is-food-summary-visible",
      "is-food-chart-visible",
      "is-food-bars-visible",
      "is-food-summary-text-visible",
    );
  }

  resetTypedElementState(foodCardContent);
  resetTypedElementState(foodCardTotal);
  resetTypedElementState(foodCardSummary);
  foodCapturePageBody?.scrollTo({ top: 0, behavior: "auto" });
  resetCollapsibleCards(foodCapturePanel);
  resetFlyoutWrap(foodFlyoutWrap);
  setFoodCameraImage(FOOD_CAMERA_IMAGE_DEFAULT);
  resetFoodCameraScanPresentation();
  foodCameraSheet?.classList.remove("is-album-direct");
  if (foodAlbumSheet) {
    foodAlbumSheet.classList.remove("is-visible");
    foodAlbumSheet.hidden = true;
  }
  closeFoodCameraSheet({ immediate: true });
};

const resetAllViewsToInitialState = () => {
  resetQuickRecordView();
  resetCardOutputView();
  resetMoodExpandView();
  resetFoodCaptureView();
};

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

const scrollFoodCapturePageToBottom = (behavior = "auto") => {
  if (!foodCapturePageBody) {
    return;
  }

  foodCapturePageBody.scrollTo({
    top: foodCapturePageBody.scrollHeight,
    behavior,
  });
};

const keepFoodCapturePageBottomVisible = (duration = 2400) => {
  if (!foodCapturePageBody) {
    return;
  }

  if (foodCaptureRevealScrollRaf) {
    window.cancelAnimationFrame(foodCaptureRevealScrollRaf);
    foodCaptureRevealScrollRaf = null;
  }

  const startTime = performance.now();

  const tick = (now) => {
    scrollFoodCapturePageToBottom();

    if (now - startTime < duration) {
      foodCaptureRevealScrollRaf = window.requestAnimationFrame(tick);
      return;
    }

    foodCaptureRevealScrollRaf = null;
  };

  foodCaptureRevealScrollRaf = window.requestAnimationFrame(tick);
};

const createFoodTimelineEntry = () => {
  if (!foodCaptureEntry) {
    return null;
  }

  const entryElement = foodCaptureEntry.cloneNode(true);
  entryElement.hidden = true;
  entryElement.classList.add("timeline-generated-food-entry");
  entryElement.removeAttribute("data-food-capture-entry");
  return entryElement;
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
  entryElement.classList.remove("is-card-shell-visible");
  entryElement.classList.remove("is-tags-visible");
  entryElement.classList.remove("is-divider-visible");
  entryElement.classList.remove("is-summary-visible");
  entryElement.classList.remove("is-green-visible");
  entryElement.classList.add("is-entering");
  entryElement.hidden = false;

  if (!withDetail) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        entryElement.classList.add("is-card-shell-visible");
        scrollMoodPageToBottom();
      });
    });

    window.setTimeout(() => {
      entryElement.classList.add("is-primary-visible");
      scrollMoodPageToBottom("smooth");
    }, MOOD_CARD_SHELL_EXPAND_MS);

    return;
  }

  entrySummary.style.setProperty("--summary-target-height", "0px");
  entrySummary.innerHTML = "";
  entryChartContent.style.maxHeight = "";

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      entryElement.classList.add("is-card-shell-visible");
    });
  });

  window.setTimeout(() => {
    entryElement.classList.add("is-primary-visible");
    scrollMoodPageToBottom("smooth");
  }, MOOD_CARD_SHELL_EXPAND_MS);

  window.setTimeout(() => {
    entryElement.classList.add("is-divider-visible");
    scrollMoodPageToBottom();
  }, MOOD_CARD_SHELL_EXPAND_MS + 300);

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
    }, FEED_SUMMARY_AFTER_LINE_REVEAL_MS);
  }, MOOD_CARD_SHELL_EXPAND_MS + 540);
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

  entryElement.hidden = true;
  return entryElement;
};

const runFeedEntryReveal = () => {
  if (!feedEntry || !feedChartHeader || !feedChartPanel || !feedCardSummary) {
    return;
  }

  syncChartLineLength(feedChartLine, feedEntry);
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
  feedEntry.classList.remove("is-card-shell-visible");
  feedEntry.classList.remove("is-tags-visible");
  feedEntry.classList.remove("is-divider-visible");
  feedEntry.classList.remove("is-summary-visible");
  feedEntry.classList.remove("is-green-visible");
  feedEntry.classList.add("is-entering");
  feedEntry.hidden = false;
  feedCardSummary.style.setProperty("--summary-target-height", "0px");
  feedCardSummary.innerHTML = "";

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      feedEntry.classList.add("is-card-shell-visible");
    });
  });

  window.setTimeout(() => {
    window.requestAnimationFrame(() => {
      feedEntry.classList.add("is-primary-visible");
    });
  }, CARD_OUTPUT_PRIMARY_REVEAL_MS);

  window.setTimeout(() => {
    feedEntry.classList.add("is-tags-visible");
  }, CARD_OUTPUT_PRIMARY_REVEAL_MS + 300);

  summaryStartTimer = window.setTimeout(() => {
    feedEntry.classList.add("is-divider-visible");
  }, CARD_OUTPUT_PRIMARY_REVEAL_MS + 840);

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
    }, FEED_SUMMARY_AFTER_LINE_REVEAL_MS);
  }, CARD_OUTPUT_PRIMARY_REVEAL_MS + 1080);
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
    "is-food-shell-visible",
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
    feedEntryFood.classList.add("is-food-shell-visible");
    scrollCardPageToBottom();
  }, 0);

  const photoStartTimer = window.setTimeout(() => {
    feedEntryFood.classList.add("is-food-photo-visible");
    scrollCardPageToBottom();
  }, FOOD_CARD_SHELL_EXPAND_MS);

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
  }, FOOD_CARD_SHELL_EXPAND_MS + 300);

  startTimers.set(foodCardContent, primaryStartTimer);
  startTimers.set(foodCardPhoto, photoStartTimer);
  startTimers.set(foodCardTotal, textStartTimer);
};

const runFoodFeedEntryRevealFor = (entryElement, options = {}) => {
  if (!entryElement) {
    return;
  }

  const { scrollToBottom = () => {}, keepBottomVisible = () => {} } = options;
  const entryPhoto = entryElement.querySelector(".food-card-photo");
  const entryContent = entryElement.querySelector("[data-food-card-content]");
  const entryTotal = entryElement.querySelector("[data-food-card-total]");
  const entrySummary = entryElement.querySelector(".food-card-summary");

  if (!entryPhoto || !entryContent || !entryTotal || !entrySummary) {
    return;
  }

  [entryContent, entryTotal, entrySummary].forEach((element) => {
    prepareTypedElement(element);
    clearTypedElementTimers(element);
    element.innerHTML = "";
    setTypedElementHeight(element, 0);
  });

  entryElement.classList.remove(
    "is-food-shell-visible",
    "is-food-photo-visible",
    "is-food-content-visible",
    "is-food-total-visible",
    "is-food-divider-visible",
    "is-food-summary-visible",
    "is-food-chart-visible",
    "is-food-bars-visible",
    "is-food-summary-text-visible",
  );
  entryElement.classList.add("is-entering");
  entryElement.hidden = false;
  keepBottomVisible();

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      entryElement.classList.add("is-food-shell-visible");
      scrollToBottom();
    });
  });

  window.setTimeout(() => {
    entryElement.classList.add("is-food-photo-visible");
    scrollToBottom();
  }, FOOD_CARD_SHELL_EXPAND_MS);

  window.setTimeout(() => {
    entryElement.classList.add("is-food-content-visible");
    setTypedElementHeight(entryContent, getElementFirstLineHeight(entryContent, 1.45));
    scrollToBottom();

    startTypewriterForElement(entryContent, {
      onCharacter: () => {
        scrollToBottom();
      },
      onDone: () => {
        entryElement.classList.add("is-food-total-visible");
        setTypedElementHeight(entryTotal, getElementFirstLineHeight(entryTotal, 1.2));
        scrollToBottom();

        startTypewriterForElement(entryTotal, {
          onCharacter: () => {
            scrollToBottom();
          },
          onDone: () => {
            window.setTimeout(() => {
              entryElement.classList.add("is-food-divider-visible");
              scrollToBottom();

              window.setTimeout(() => {
                entryElement.classList.add("is-food-summary-visible");
                scrollToBottom();

                window.setTimeout(() => {
                  entryElement.classList.add("is-food-chart-visible");
                  scrollToBottom();
                }, 0);

                window.setTimeout(() => {
                  entryElement.classList.add("is-food-bars-visible");
                  scrollToBottom();
                }, FOOD_CHART_BASE_REVEAL_MS);

                window.setTimeout(() => {
                  entryElement.classList.add("is-food-summary-text-visible");
                  setTypedElementHeight(
                    entrySummary,
                    getElementFirstLineHeight(entrySummary, 1.5),
                  );
                  scrollToBottom();

                  startTypewriterForElement(entrySummary, {
                    onCharacter: () => {
                      scrollToBottom();
                    },
                  });
                }, FOOD_CHART_BARS_REVEAL_MS);
              }, 240);
            }, 120);
          },
        });
      },
    });
  }, FOOD_CARD_SHELL_EXPAND_MS + 300);
};

if (cardInputImage && cardInputToggle) {
  cardInputToggle.addEventListener("click", () => {
    if (!feedEntry || !feedEntryFood) {
      return;
    }

    cardInputClickCount += 1;

    if (cardInputClickCount === 1) {
      cardInputImage.src = "./assets/文字输入框.png";
      cardInputImage.alt = "文字输入框";
      if (cardInputText) {
        cardInputText.textContent = CARD_INPUT_TEXT_STEP_2;
        cardInputText.classList.remove("is-muted");
      }
      runFeedEntryReveal();

      if (cardPageBody) {
        window.setTimeout(() => {
          scrollCardPageToBottom("smooth");
        }, CARD_OUTPUT_PRIMARY_REVEAL_MS);
      }

      return;
    }

    if (cardInputClickCount === 2) {
      feedEntryFood.hidden = false;
      if (cardInputText) {
        cardInputText.textContent = CARD_INPUT_TEXT_STEP_3;
        cardInputText.classList.add("is-muted");
      }
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

const openFoodAlbumSheet = () => {
  if (!foodAlbumSheet) {
    return;
  }

  if (foodAlbumSheetTimer) {
    window.clearTimeout(foodAlbumSheetTimer);
    foodAlbumSheetTimer = null;
  }

  foodAlbumSheet.hidden = false;

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      foodAlbumSheet.classList.add("is-visible");
    });
  });
};

const closeFoodAlbumSheet = (options = {}) => {
  const { immediate = false, onDone } = options;

  if (!foodAlbumSheet) {
    onDone?.();
    return;
  }

  if (foodAlbumSheetTimer) {
    window.clearTimeout(foodAlbumSheetTimer);
    foodAlbumSheetTimer = null;
  }

  if (immediate) {
    foodAlbumSheet.classList.remove("is-visible");
    foodAlbumSheet.hidden = true;
    onDone?.();
    return;
  }

  foodAlbumSheet.classList.remove("is-visible");
  foodAlbumSheetTimer = window.setTimeout(() => {
    foodAlbumSheet.hidden = true;
    foodAlbumSheetTimer = null;
    onDone?.();
  }, 320);
};

const finalizeFoodRecognition = () => {
  closeFoodCameraSheet({
    onDone: () => {
      if (!foodCaptureTimelineFeed) {
        return;
      }

      const foodTimelineEntry = createFoodTimelineEntry();

      if (!foodTimelineEntry) {
        return;
      }

      foodCaptureTimelineFeed.appendChild(foodTimelineEntry);
      scrollFoodCapturePageToBottom();
      runFoodFeedEntryRevealFor(foodTimelineEntry, {
        scrollToBottom: () => scrollFoodCapturePageToBottom(),
        keepBottomVisible: () => keepFoodCapturePageBottomVisible(4200),
      });
    },
  });
  foodCameraCompletionTimer = null;
};

const startFoodRecognitionFlow = (options = {}) => {
  const { directFromAlbum = false } = options;
  const scanStartDelay = directFromAlbum ? 300 : 0;

  if (!foodCameraSheet || foodCameraSheet.hidden || foodCameraSheet.classList.contains("is-capturing")) {
    return;
  }

  if (foodCameraCaptureTimer) {
    window.clearTimeout(foodCameraCaptureTimer);
    foodCameraCaptureTimer = null;
  }

  if (foodCameraRecognitionTextTimer) {
    window.clearTimeout(foodCameraRecognitionTextTimer);
    foodCameraRecognitionTextTimer = null;
  }

  if (foodCameraScanStartTimer) {
    window.clearTimeout(foodCameraScanStartTimer);
    foodCameraScanStartTimer = null;
  }

  if (foodCameraScanTimer) {
    window.clearTimeout(foodCameraScanTimer);
    foodCameraScanTimer = null;
  }

  if (foodCameraCompletionTimer) {
    window.clearTimeout(foodCameraCompletionTimer);
    foodCameraCompletionTimer = null;
  }

  foodCameraSheet.classList.remove("is-album-direct");

  if (directFromAlbum) {
    foodCameraSheet.classList.add("is-album-direct");
    foodCameraSheet.classList.add("is-photo-visible", "is-capturing", "is-recognizing");
  } else {
    foodCameraSheet.classList.add("is-photo-visible", "is-capturing");
  }

  if (foodCameraRecognitionText) {
    foodCameraRecognitionText.textContent = "正在识别食物...";
  }

  resetFoodCameraScanPresentation();
  foodCameraSheet.classList.remove("is-scan-paused");

  foodCameraScanStartTimer = window.setTimeout(() => {
    foodCameraSheet?.classList.add("is-scan-active");
    foodCameraScanStartTimer = null;
  }, scanStartDelay);

  foodCameraRecognitionTextTimer = window.setTimeout(() => {
    if (foodCameraRecognitionText) {
      foodCameraRecognitionText.textContent = "正在分析食物...";
    }
    foodCameraRecognitionTextTimer = null;
  }, 2000 + scanStartDelay);

  if (directFromAlbum) {
    foodCameraCaptureTimer = null;
  } else {
    foodCameraCaptureTimer = window.setTimeout(() => {
      foodCameraSheet?.classList.add("is-recognizing");
      foodCameraCaptureTimer = null;
    }, 420);
  }

  foodCameraScanTimer = window.setTimeout(() => {
    foodCameraSheet?.classList.add("is-scan-paused");
    foodCameraScanTimer = null;
  }, 4250 + scanStartDelay);

  foodCameraCompletionTimer = window.setTimeout(() => {
    finalizeFoodRecognition();
  }, 4300 + scanStartDelay);
};

const openFoodCameraSheet = () => {
  if (!foodCameraSheet) {
    return;
  }

  if (foodCameraRevealTimer) {
    window.clearTimeout(foodCameraRevealTimer);
    foodCameraRevealTimer = null;
  }

  if (foodCameraCaptureTimer) {
    window.clearTimeout(foodCameraCaptureTimer);
    foodCameraCaptureTimer = null;
  }

  if (foodCameraRecognitionTextTimer) {
    window.clearTimeout(foodCameraRecognitionTextTimer);
    foodCameraRecognitionTextTimer = null;
  }

  if (foodCameraScanStartTimer) {
    window.clearTimeout(foodCameraScanStartTimer);
    foodCameraScanStartTimer = null;
  }

  if (foodCameraScanTimer) {
    window.clearTimeout(foodCameraScanTimer);
    foodCameraScanTimer = null;
  }

  if (foodCameraCompletionTimer) {
    window.clearTimeout(foodCameraCompletionTimer);
    foodCameraCompletionTimer = null;
  }

  if (foodAlbumSheetTimer) {
    window.clearTimeout(foodAlbumSheetTimer);
    foodAlbumSheetTimer = null;
  }

  closeMenu(foodFlyoutWrap, "fade");
  setFoodCameraImage(FOOD_CAMERA_IMAGE_DEFAULT);
  resetFoodCameraScanPresentation();
  foodCameraSheet.classList.remove("is-album-direct");
  if (foodAlbumSheet) {
    foodAlbumSheet.classList.remove("is-visible");
    foodAlbumSheet.hidden = true;
  }
  foodCameraSheet.classList.remove(
    "is-photo-visible",
    "is-capturing",
    "is-recognizing",
    "is-scan-paused",
    "is-scan-active",
  );
  if (foodCameraRecognitionText) {
    foodCameraRecognitionText.textContent = "正在识别食物...";
  }
  foodCameraSheet.hidden = false;

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      foodCameraSheet.classList.add("is-visible");
    });
  });

  foodCameraRevealTimer = window.setTimeout(() => {
    foodCameraSheet.classList.add("is-photo-visible");
    foodCameraRevealTimer = null;
  }, 380);
};

const closeFoodCameraSheet = (options = {}) => {
  const { immediate = false, onDone } = options;

  if (!foodCameraSheet) {
    return;
  }

  if (foodCameraRevealTimer) {
    window.clearTimeout(foodCameraRevealTimer);
    foodCameraRevealTimer = null;
  }

  if (foodCameraCaptureTimer) {
    window.clearTimeout(foodCameraCaptureTimer);
    foodCameraCaptureTimer = null;
  }

  if (foodCameraRecognitionTextTimer) {
    window.clearTimeout(foodCameraRecognitionTextTimer);
    foodCameraRecognitionTextTimer = null;
  }

  if (foodCameraScanStartTimer) {
    window.clearTimeout(foodCameraScanStartTimer);
    foodCameraScanStartTimer = null;
  }

  if (foodCameraScanTimer) {
    window.clearTimeout(foodCameraScanTimer);
    foodCameraScanTimer = null;
  }

  if (foodCameraCompletionTimer) {
    window.clearTimeout(foodCameraCompletionTimer);
    foodCameraCompletionTimer = null;
  }

  if (foodAlbumSheetTimer) {
    window.clearTimeout(foodAlbumSheetTimer);
    foodAlbumSheetTimer = null;
  }

  if (immediate) {
    foodCameraSheet.classList.remove(
      "is-visible",
      "is-photo-visible",
      "is-album-direct",
      "is-capturing",
      "is-recognizing",
      "is-scan-paused",
      "is-scan-active",
    );
    if (foodCameraRecognitionText) {
      foodCameraRecognitionText.textContent = "正在识别食物...";
    }
    foodCameraSheet.hidden = true;
    resetFoodCameraScanPresentation();
    if (foodAlbumSheet) {
      foodAlbumSheet.classList.remove("is-visible");
      foodAlbumSheet.hidden = true;
    }
    onDone?.();
    return;
  }

  foodCameraSheet.classList.remove(
    "is-visible",
    "is-photo-visible",
    "is-album-direct",
    "is-capturing",
    "is-recognizing",
    "is-scan-paused",
    "is-scan-active",
  );
  if (foodCameraRecognitionText) {
    foodCameraRecognitionText.textContent = "正在识别食物...";
  }
  resetFoodCameraScanPresentation();

  window.setTimeout(() => {
    if (!foodCameraSheet.classList.contains("is-visible")) {
      foodCameraSheet.hidden = true;
      onDone?.();
    }
  }, 380);
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

      if (button.hasAttribute("data-food-trigger") && wrap === foodFlyoutWrap) {
        itemButtons.forEach((item) => item.classList.remove("clicked"));
        button.classList.add("clicked");
        openFoodCameraSheet();
        return;
      }

      itemButtons.forEach((item) => item.classList.remove("clicked"));
      button.classList.add("clicked");
      closeMenu(wrap, "fade");
    });
  });
});

foodCameraCloseButton?.addEventListener("click", () => {
  closeFoodCameraSheet();
});

foodCameraAlbumButton?.addEventListener("click", () => {
  if (
    !foodCameraSheet ||
    foodCameraSheet.hidden ||
    !foodCameraSheet.classList.contains("is-photo-visible") ||
    foodCameraSheet.classList.contains("is-capturing")
  ) {
    return;
  }

  openFoodAlbumSheet();
});

foodAlbumCancelButton?.addEventListener("click", () => {
  closeFoodAlbumSheet();
});

foodAlbumSelectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setFoodCameraImage(FOOD_CAMERA_IMAGE_ALBUM);
    startFoodRecognitionFlow({ directFromAlbum: true });
    closeFoodAlbumSheet();
  });
});

foodCameraShutterButton?.addEventListener("click", () => {
  if (
    !foodCameraSheet ||
    foodCameraSheet.hidden ||
    !foodCameraSheet.classList.contains("is-photo-visible") ||
    foodCameraSheet.classList.contains("is-capturing")
  ) {
    return;
  }
  startFoodRecognitionFlow();
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

if (moodFlyoutWrap) {
  moodFlyoutWrap.addEventListener("click", (event) => {
    if (moodFlyoutWrap.dataset.moodCardOpen !== "true") {
      return;
    }

    if (event.target.closest("[data-mood-card]") || event.target.closest(".flyout > li button")) {
      return;
    }

    closeMoodCard();
  });
}

viewSwitchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetView = button.dataset.viewTarget;

    resetAllViewsToInitialState();

    viewSwitchButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    viewPanels.forEach((panel) => {
      panel.hidden = panel.dataset.viewPanel !== targetView;
      panel.classList.toggle("is-active", panel.dataset.viewPanel === targetView);
    });
  });
});
