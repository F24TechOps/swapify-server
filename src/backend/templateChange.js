import { JSDOM } from "jsdom";
import { isFullHtml } from "./checkHtml.js";
import { normalizeUrl } from "./normalizeURL.js";
import {
  getBackgrounds,
  getButtonInfo,
  getImage,
  getText,
  getBackgroundImg,
  getLink,
} from "./extractor.js";

export function updateHtmlContent(html, allUpdatesObj, type = "email") {
  const full = isFullHtml(html);
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Update hyperlinks
  function changeLink(allUpdatesObj) {
    const linkElements = getLink(document);

    for (const link in allUpdatesObj.links) {
      for (let i = 0; i < linkElements.length; i++) {
        let element = linkElements[i];

        const { newLink } = allUpdatesObj.links[link];

        if (newLink === null) continue;

        if (element.getAttribute("href") === allUpdatesObj.links[link].oldLink)
          element.setAttribute("href", newLink);
      }
    }
  }

  changeLink(allUpdatesObj);

  //   Update colors
  function changeBackgroundColour(allUpdatesObj) {
    const allElements = getBackgrounds(document, type);

    for (const colorType in allUpdatesObj.backgroundColors) {
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];

        if (element.getAttribute("data-background-updated") === "true") {
          continue;
        }

        if (element.hasAttribute("data-f24-editor-cta-button-td")) {
          continue;
        }

        const { newBackground } = allUpdatesObj.backgroundColors[colorType];

        if (newBackground === null || newBackground === "") continue;

        if (
          dom.window.getComputedStyle(element, null).backgroundColor ===
          allUpdatesObj.backgroundColors[colorType].oldBackground
        ) {
          element.style.backgroundColor = newBackground;
          element.setAttribute("data-background-updated", "true");
        }
      }
    }
  }

  changeBackgroundColour(allUpdatesObj);

  function changeAllColors(allUpdatesObj) {
    if (type !== "templates") return;

    const backgrounds = [...getBackgrounds(document, type)];
    const text = [...getText(document, type)];
    const allButtonContainers = document.querySelectorAll("td.mceNonEditable");

    const allElements = backgrounds.concat(text);

    allButtonContainers.forEach((container) => {
      const innerButton = container.querySelector("a");
      if (!innerButton) return;

      allElements.push(container, innerButton);
    });

    allElements.forEach((element) => {
      Object.values(allUpdatesObj.color || {}).forEach(
        ({ oldColor, newColor }) => {
          if (!newColor) return;

          const computedStyle = dom.window.getComputedStyle(element, null);

          if (computedStyle.backgroundColor === oldColor) {
            element.style.backgroundColor = newColor;
            element.setAttribute("data-background-updated", "true");
          }

          if (computedStyle.color === oldColor) {
            element.style.color = newColor;
          }

          if (
            element.tagName.toLowerCase() === "td" &&
            element.hasAttribute("bgcolor")
          ) {
            element.setAttribute("bgcolor", newColor);
          }
        }
      );
    });
  }

  changeAllColors(allUpdatesObj);

  function changeBackgroundImg(allUpdatesObj) {
    const backgroundImgElement = getBackgroundImg(document);

    for (const backgroundType in allUpdatesObj.backgroundImg) {
      for (let i = 0; i < backgroundImgElement.length; i++) {
        let element = backgroundImgElement[i];

        const { newBackgroundImage } =
          allUpdatesObj.backgroundImg[backgroundType];

        if (newBackgroundImage === null || newBackgroundImage === "") continue;

        const extractUrl = (urlStyle) => {
          const match = /url\(["']?(.*?)["']?\)/i.exec(urlStyle);
          return match ? match[1] : null;
        };

        if (
          extractUrl(
            dom.window.getComputedStyle(element, null).backgroundImage
          ) === allUpdatesObj.backgroundImg[backgroundType].oldBackgroundImage
        ) {
          element.style.backgroundImage = `url(${newBackgroundImage})`;
        }
      }
    }
  }

  changeBackgroundImg(allUpdatesObj);

  // Update fonts
  function changeFont(allUpdatesObj) {
    const allElements = getText(document, type);

    for (const fontType in allUpdatesObj.fontFamily) {
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const { newFontFamily } = allUpdatesObj.fontFamily[fontType];

        if (newFontFamily === null || newFontFamily === "") continue;

        if (
          dom.window
            .getComputedStyle(element, null)
            .fontFamily.toLowerCase()
            .includes(
              allUpdatesObj.fontFamily[fontType].oldFontFamily.toLowerCase()
            )
        ) {
          element.style.fontFamily = newFontFamily;
        }
      }
    }

    const allText = getText(document);

    for (const fontType in allUpdatesObj.fontSize) {
      for (let i = 0; i < allText.length; i++) {
        const element = allText[i];
        const { newFontSize } = allUpdatesObj.fontSize[fontType];

        if (newFontSize === null || newFontSize === "") continue;

        if (
          dom.window.getComputedStyle(element, null).fontSize ===
          allUpdatesObj.fontSize[fontType].oldFontSize
        ) {
          element.style.fontSize = newFontSize;
        }
      }
    }

    for (const fontType in allUpdatesObj.fontColor) {
      for (let i = 0; i < allText.length; i++) {
        const element = allText[i];
        const { newFontColor } = allUpdatesObj.fontColor[fontType];

        if (newFontColor === null || newFontColor === "") continue;

        if (
          dom.window.getComputedStyle(element, null).color ===
          allUpdatesObj.fontColor[fontType].oldFontColor
        ) {
          element.style.color = newFontColor;
        }
      }
    }
  }

  changeFont(allUpdatesObj);

  // Update Images
  function changeImgSrc(allUpdatesObj) {
    const allElements = getImage(document, type);

    for (const imgType in allUpdatesObj.images) {
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];

        const normalURL = normalizeUrl(element.src);
        const oldURL = normalizeUrl(allUpdatesObj.images[imgType].oldImageLink);

        const { newImageLink } = allUpdatesObj.images[imgType];

        if (normalURL === oldURL) {
          if (newImageLink === null || newImageLink === "") continue;

          element.src = newImageLink;
        }
      }
    }
  }

  changeImgSrc(allUpdatesObj);

  // Update All Buttons
  function changeButtonEmail(allUpdatesObj) {
    const allButtonContainers = document.querySelectorAll("td.mceNonEditable");

    allButtonContainers.forEach((container) => {
      const innerButton = container.querySelector("a");
      if (!innerButton) return;

      const outerButtonInfo = getButtonInfo(container);
      const innerButtonInfo = getButtonInfo(innerButton);

      for (const buttonType in allUpdatesObj.buttons) {
        const buttonData = allUpdatesObj.buttons[buttonType];
        const outerMatch =
          outerButtonInfo === JSON.stringify(buttonData.outerButton, null, 2);
        const innerMatch =
          innerButtonInfo === JSON.stringify(buttonData.innerButton, null, 2);

        if (outerMatch && innerMatch) {
          Object.entries(buttonData.newOuterButton).forEach(
            ([attribute, value]) => {
              if (value !== null && value !== "") {
                container.style[attribute] = value;

                if (
                  attribute === "background-color" ||
                  attribute === "background"
                ) {
                  container.setAttribute("bgcolor", value);
                }
              }
            }
          );

          if (
            buttonData.newOuterButton["background-color"] === null &&
            container.style["background-color"]
          ) {
            container.setAttribute(
              "bgcolor",
              container.style["background-color"]
            );
          }

          Object.entries(buttonData.newInnerButton).forEach(
            ([attribute, value]) => {
              if (value !== null && value !== "")
                innerButton.style[attribute] = value;
            }
          );
        }

        if (allUpdatesObj.allButtons) {
          for (const attribute in allUpdatesObj.allButtons.innerButton) {
            const newVal = allUpdatesObj.allButtons.innerButton[attribute];
            if (newVal !== null && newVal !== "")
              innerButton.style[attribute] = newVal;
          }

          for (const attribute in allUpdatesObj.allButtons.outerButton) {
            const newVal = allUpdatesObj.allButtons.outerButton[attribute];
            if (newVal !== null && newVal !== "") {
              container.style[attribute] = newVal;

              if (
                attribute === "background-color" ||
                attribute === "background"
              ) {
                container.setAttribute("bgcolor", newVal);
              }
            }
          }
          if (
            allUpdatesObj.allButtons.outerButton["background-color"] === null &&
            container.style["background-color"]
          ) {
            container.setAttribute(
              "bgcolor",
              container.style["background-color"]
            );
          }
        }
      }
    });
  }

  function changeButtonMicrosite(allUpdatesObj) {
    const allButtons = document.getElementsByClassName("btn");

    for (const buttonType in allUpdatesObj.buttons) {
      for (let i = 0; i < allButtons.length; i++) {
        const element = allButtons[i];

        const info = getButtonInfo(element);

        if (
          info ===
          JSON.stringify(allUpdatesObj.buttons[buttonType].oldButton, null, 2)
        ) {
          for (const attribute in allUpdatesObj.buttons[buttonType].newButton) {
            const newVal =
              allUpdatesObj.buttons[buttonType].newButton[attribute];

            if (newVal === null || newVal === "") continue;

            element.style[attribute] = newVal;
          }
        }
      }
    }

    if (allUpdatesObj.allButtons) {
      for (let i = 0; i < allButtons.length; i++) {
        const element = allButtons[i];
        for (const attribute in allUpdatesObj.allButtons) {
          const newVal = allUpdatesObj.allButtons[attribute];
          if (newVal !== null && newVal !== "")
            element.style[attribute] = newVal;
        }
      }
    }
  }

  if (type === "microsite") changeButtonMicrosite(allUpdatesObj);
  else changeButtonEmail(allUpdatesObj);

  return full ? dom.serialize() : document.body.innerHTML;
}
