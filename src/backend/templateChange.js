import * as cheerio from "cheerio";
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
import Color from "color";

export function updateHtmlContent(html, allUpdatesObj, type = "email") {
  const full = isFullHtml(html);
  const $ = cheerio.load(html);

  // Update hyperlinks
  function changeLink(allUpdatesObj) {
    const linkElements = getLink($);

    for (const link in allUpdatesObj.links) {
      linkElements.each((i, element) => {
        const $element = $(element);
        const { newLink } = allUpdatesObj.links[link];

        if (newLink === null) return;
      
        if ($element.attr("href") === allUpdatesObj.links[link].oldLink) {
          $element.attr("href", newLink);
        }
      });
    }
  }

  changeLink(allUpdatesObj);

  //   Update colors
  function changeBackgroundColour(allUpdatesObj) {
    const allElements = getBackgrounds($, type).toArray();

    for (const colorType in allUpdatesObj.backgroundColors) {
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const $element = $(element);

        if ($element.attr("data-background-updated") === "true") {
          continue;
        }

        if ($element.attr("data-f24-editor-cta-button-td")) {
          continue;
        }

        const { newBackground } = allUpdatesObj.backgroundColors[colorType];

        if (newBackground === null || newBackground === "") continue;

        if (
          Color($element.css("background-color")).rgb().string() ===
          allUpdatesObj.backgroundColors[colorType].oldBackground
        ) {
          $element.css("background-color", newBackground);
          $element.attr("data-background-updated", "true");
        }
      }
    }
  }

  changeBackgroundColour(allUpdatesObj);

  function changeAllColors(allUpdatesObj) {
    if (type !== "templates") return;
    const backgrounds = [...getBackgrounds($, type)];
    const text = [...getText($, type)];
    const allButtonContainers = $("td.mceNonEditable").toArray();

    const allElements = backgrounds.concat(text);

    allButtonContainers.forEach((container) => {
      const innerButton = $(container).find("a").get(0);
      if (!innerButton) return;

      allElements.push(container, innerButton);
    });

    allElements.forEach((element) => {
      const $element = $(element);
      Object.values(allUpdatesObj.color || {}).forEach(
        ({ oldColor, newColor }) => {
          if (!newColor) return;

          if (Color($element.css("background-color")).rgb().string() === oldColor) {
            $element.css("background-color", newColor);
            $element.attr("data-background-updated", "true");
          }

          if (Color($element.css("color")).rgb().string() === oldColor) {
            $element.css("color", newColor);
          }

          if (
            element.tagName.toLowerCase() === "td" &&
            $element.attr("bgcolor")
          ) {
            $element.attr("bgcolor", newColor);
          }
        }
      );
    });
  }

  changeAllColors(allUpdatesObj);

  function changeBackgroundImg(allUpdatesObj) {
    const backgroundImgElements = getBackgroundImg($).toArray();

    for (const backgroundType in allUpdatesObj.backgroundImg) {
      for (let i = 0; i < backgroundImgElements.length; i++) {
        let element = backgroundImgElements[i];
        const $element = $(element);

        const { newBackgroundImage } =
          allUpdatesObj.backgroundImg[backgroundType];

        if (newBackgroundImage === null || newBackgroundImage === "") continue;

        const extractUrl = (urlStyle) => {
          const match = /url\(["']?(.*?)["']?\)/i.exec(urlStyle);
          return match ? match[1] : null;
        };

        if (
          extractUrl($element.css("background-image")) ===
          allUpdatesObj.backgroundImg[backgroundType].oldBackgroundImage
        ) {
          $element.css("background-image", `url(${newBackgroundImage})`);
        }
      }
    }
  }

  changeBackgroundImg(allUpdatesObj);

  // Update fonts
  function changeFont(allUpdatesObj) {
    const allElements = getText($, type).toArray();
  
    for (const fontType in allUpdatesObj.fontFamily) {
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const $element = $(element);
        const { newFontFamily } = allUpdatesObj.fontFamily[fontType];
        
        if (newFontFamily === null || newFontFamily === "") continue;
        
        if (
          $element.css("font-family")?.toLowerCase().includes(
            allUpdatesObj.fontFamily[fontType].oldFontFamily.toLowerCase()
          )
        ) {
          $element.css("font-family", newFontFamily);
        }
      }
    }

    const allText = getText($, type).toArray();

    for (const fontType in allUpdatesObj.fontSize) {
      for (let i = 0; i < allText.length; i++) {
        const element = allText[i];
        const $element = $(element);
        const { newFontSize } = allUpdatesObj.fontSize[fontType];

        if (newFontSize === null || newFontSize === "") continue;
        
        if (
          $element.css("font-size") ===
          allUpdatesObj.fontSize[fontType].oldFontSize
        ) {
          $element.css("font-size", newFontSize);
        }
      }
    }

    for (const fontType in allUpdatesObj.fontColor) {
      for (let i = 0; i < allText.length; i++) {
        const element = allText[i];
        const $element = $(element);
        const { newFontColor } = allUpdatesObj.fontColor[fontType];

        if (newFontColor === null || newFontColor === "") continue;

        if (
          Color($element.css("color")).rgb().string() ===
          allUpdatesObj.fontColor[fontType].oldFontColor
        ) {
          $element.css("color", newFontColor);
        }
      }
    }
  }

  changeFont(allUpdatesObj);

  // Update Images
  function changeImgSrc(allUpdatesObj) {
    const allElements = getImage($, type).toArray();

    for (const imgType in allUpdatesObj.images) {
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const $element = $(element);

        const normalURL = normalizeUrl($element.attr("src"));
        const oldURL = normalizeUrl(allUpdatesObj.images[imgType].oldImageLink);

        const { newImageLink } = allUpdatesObj.images[imgType];
        
        
        if (normalURL === oldURL) {
          if (newImageLink === null || newImageLink === "") continue;
          
          $element.attr("src", newImageLink);
        }
      }
    }
  }

  changeImgSrc(allUpdatesObj);

  // Update All Buttons
  function changeButtonEmail(allUpdatesObj) {
    const allButtonContainers = $("td.mceNonEditable").toArray();

    allButtonContainers.forEach((container) => {
      const $container = $(container);
      const innerButton = $container.find("a").get(0);
      if (!innerButton) return;

      const outerButtonInfo = getButtonInfo($, container);
      const innerButtonInfo = getButtonInfo($, innerButton);

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
                $container.css(attribute, value);

                if (
                  attribute === "background-color" ||
                  attribute === "background"
                ) {
                  $container.attr("bgcolor", value);
                }
              }
            }
          );

          if (
            buttonData.newOuterButton["background-color"] === null &&
            $container.css("background-color")
          ) {
            $container.attr("bgcolor", $container.css("background-color"));
          }

          Object.entries(buttonData.newInnerButton).forEach(
            ([attribute, value]) => {
              if (value !== null && value !== "")
                $(innerButton).css(attribute, value);
            }
          );
        }

        if (allUpdatesObj.allButtons) {
          for (const attribute in allUpdatesObj.allButtons.innerButton) {
            const newVal = allUpdatesObj.allButtons.innerButton[attribute];
            if (newVal !== null && newVal !== "")
              $(innerButton).css(attribute, newVal);
          }

          for (const attribute in allUpdatesObj.allButtons.outerButton) {
            const newVal = allUpdatesObj.allButtons.outerButton[attribute];
            if (newVal !== null && newVal !== "") {
              $container.css(attribute, newVal);

              if (
                attribute === "background-color" ||
                attribute === "background"
              ) {
                $container.attr("bgcolor", newVal);
              }
            }
          }
          if (
            allUpdatesObj.allButtons.outerButton["background-color"] === null &&
            $container.css("background-color")
          ) {
            $container.attr("bgcolor", $container.css("background-color"));
          }
        }
      }
    });
  }

  function changeButtonMicrosite(allUpdatesObj) {
    const allButtons = $(".btn").toArray();

    for (const buttonType in allUpdatesObj.buttons) {
      for (let i = 0; i < allButtons.length; i++) {
        const element = allButtons[i];
        const $element = $(element);

        const info = getButtonInfo($, element);

        if (
          info ===
          JSON.stringify(allUpdatesObj.buttons[buttonType].oldButton, null, 2)
        ) {
          for (const attribute in allUpdatesObj.buttons[buttonType].newButton) {
            const newVal =
              allUpdatesObj.buttons[buttonType].newButton[attribute];

            if (newVal === null || newVal === "") continue;

            $element.css(attribute, newVal);
          }
        }
      }
    }

    if (allUpdatesObj.allButtons) {
      for (let i = 0; i < allButtons.length; i++) {
        const element = allButtons[i];
        const $element = $(element);
        for (const attribute in allUpdatesObj.allButtons) {
          const newVal = allUpdatesObj.allButtons[attribute];
          if (newVal !== null && newVal !== "") $element.css(attribute, newVal);
        }
      }
    }
  }

  if (type === "microsite") changeButtonMicrosite(allUpdatesObj);
  else changeButtonEmail(allUpdatesObj);

  return full ? $.html() : $("body").html();
}
