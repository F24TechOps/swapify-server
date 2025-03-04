import * as cheerio from "cheerio";
const HEX_CHARS = [
	'0', '1', '2', '3',
	'4', '5', '6', '7',
	'8', '9', 'A', 'B',
	'C', 'D', 'E', 'F'
];

export function extractId(html) {
  const $ = cheerio.load(html);

  const f24IdElements = $("[data-f24-id]");

  return f24IdElements
    .map((_, element) => $(element).attr("data-f24-id"))
    .get();
}
const hexToRGB = (hexStr) => {

	if (typeof(hexStr) !== 'string' || hexStr.length !== 7 || hexStr[0] !== '#') 
		return hexStr;

	// 1, 3 and 5 are the indexes for the first characters in the hexStr representing a colour 
	const rgbStr = [1,3,5].reduce((rgb, num) => {
		const hex = hexStr.slice(num, num + 2).toUpperCase();

		if (!HEX_CHARS.includes(hex[0]) || !HEX_CHARS.includes(hex[1]))
			throw new Error('hexStr must only contain hexadecimal characters');

		rgb += parseInt(hex, 16).toString();

		if (num - 5) rgb += ', '

		return rgb;
	}, 'rgb(');

	return rgbStr + ')';
};

/*
The getSomething functions read the HTML string to extract the div containing the feature.
For example getBackgrounds extract the <div> or <td> elements that contain a background we want to change
*/

export const getBackgrounds = ($, type) =>
  type === "microsite" ? $("div") : $('[align="center"]:not(.mceNonEditable)');

export const getText = ($) =>
  $("div, span, strong, p, h1, h2, h3, h4, h5, h6, li");

export const getBackgroundImg = ($) => $("bck-img");

export const getImage = ($) => $("img");

export const getLink = ($) => $("[href]");

/*
The extractSomething function all return the features. For example extractBackgrounds returns a list of background colours.
They all call the extractFeature function as it works the same way.
html is the html string
getFeature is an input function for extractFeature that finds the feature in the element.
The nonExistent is an array of features not to include. For example we don't want to extract the black text or white background.
The type is email, microsite or templates
*/

export const extractBackgrounds = (html, type) =>
  extractFeature(
    html,
    ($element) => hexToRGB($element.css("background-color")),
    ["rgba(0, 0, 0, 0)", "inherit", "rgb(255, 255, 255)", "rgba(0, 0, 0, 0.1)"],
    getBackgrounds,
    type
  );

export const extractLinks = (html, type) =>
  extractFeature(
    html,
    ($element) => $element.attr("href"),
    ["", "[nonTrackingLink]", "#"],
    getLink,
    type
  );

export const extractFonts = (html, type) =>
  extractFeature(
    html,
    ($element) => $element.css("font-family"),
    [""],
    getText,
    type
  );

export const extractFontSize = (html, type) =>
  extractFeature(
    html,
    ($element) => $element.css("font-size"),
    [""],
    getText,
    type
  );

export const extractFontColour = (html, type) =>
  extractFeature(
    html,
    ($element) => hexToRGB($element.css("color")),
    [
      "",
      "rgb(232, 232, 232)",
      "rgb(125, 125, 125)",
      "rgb(57, 48, 48)",
      "rgb(0, 0, 0)",
      "rgb(68, 68, 68)",
      "rgb(255, 255, 255)",
    ],
    getText,
    type
  );

export const extractBackgroundImg = (html) =>
  extractFeature(
    html,
    ($element) => {
      const bgImage = $element.css("background-image");
      return bgImage.replace(/url\(["']?(.*?)["']?\)/i, "$1");
    },
    [],
    getBackgroundImg
  );

export const extractImage = (html) =>
  extractFeature(html, ($element) => $element.attr("src"), [], getImage);

export const extractColor = (html, type) => {
  const backgrounds = extractBackgrounds(html, type);
  const fontColor = extractFontColour(html, type);
  const buttonString = extractButton(html, type);
  const allColors = buttonString.reduce((modifier, buttonS) => {
    const button = JSON.parse(buttonS);

    modifier.push(button.innerButton.background?.replaceAll(",", ", ").replaceAll("  ", " "));
    modifier.push(button.innerButton.color?.replaceAll(",", ", ").replaceAll("  ", " "));
    modifier.push(
      button.outerButton["background-color"]?.replaceAll(",", ", ").replaceAll("  ", " ")
    );

    return modifier;
  }, []);

  return Array.from(
    new Set(...[backgrounds.concat(fontColor).concat(allColors)])
  ).filter((color) => !!color);
};

function extractFeature(html, getFeature, nonExistent, getElement, type) {
  const $ = cheerio.load(html);
  const allElements = getElement($, type).toArray();
  const allFeatures = allElements.map((element) => getFeature($(element)));
  return Array.from(new Set(allFeatures)).filter(
    (a) => !nonExistent.includes(a)
  );
}

export const getButtonInfo = ($, element) => {
  const styles = $(element)
    .attr("style")
    .split(";")
    .filter((str) => str.includes(":"))
    .sort();
  const styleObject = {};

  styles.forEach((style) => {
    const [key, value] = style
      .split(":")
      .map((prop) => prop.trim().replace("\n", ""));
    styleObject[key] = hexToRGB(value.replace(/\s+/g, ""));
  });

  return JSON.stringify(styleObject, null, 2);
};

export function extractButton(html, type) {
  const $ = cheerio.load(html);

  let allStyles;

  if (type === "microsite") {
    const allElements = $(".btn").toArray();

    allStyles = allElements.map((element) => getButtonInfo($, element));
  } else {
    const allButtonContainers = $("td.mceNonEditable").toArray();

    allStyles = allButtonContainers.map((container) => {
      const innerButton = $(container).find("a").get(0);
      if (!innerButton) return;

      const outerButtonInfo = getButtonInfo($, container);
      const innerButtonInfo = getButtonInfo($, innerButton);

      const inner = JSON.parse(innerButtonInfo);
      const outer = JSON.parse(outerButtonInfo);

      return JSON.stringify(
        { innerButton: inner, outerButton: outer },
        null,
        2
      );
    });
  }

  return Array.from(new Set(allStyles));
}
