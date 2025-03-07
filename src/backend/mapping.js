import { 
    extractBackgrounds, 
    extractButton, 
    extractFontColour, 
    extractFontSize, 
    extractFonts, 
    extractImage, 
    extractBackgroundImg, 
    extractLinks,
    extractColor
} from "./extractor.js";

const buttonKeys = [
    'background',
    'background-color',
    'border-radius',
    'border-color',
    'color',
    'display',
    'font-family',
    'font-size',
    'font-style',
    'font-weight',
    'line-height',
    'text-align',
    'text-decoration',
    'text-transform'
];

const emptyButton = buttonKeys.reduce((mapper, key) => {
    mapper[key] = null;
    return mapper;
}, {});

const outerButtonKeys = [
    "background",
    "border-radius",
    "border",
    "padding",
    "background-color"
];

const emptyOuterButton = outerButtonKeys.reduce((mapper, key) => {
    mapper[key] = null;
    return mapper;
}, {});

const mapFeature = (featureMapper, feature, idx, type) => {
    featureMapper[`${type}${idx}`] = {};
    featureMapper[`${type}${idx}`][`old${type}`] = feature;
    featureMapper[`${type}${idx}`][`new${type}`] = null;

    return featureMapper;
}

const mapButton = (buttonMapper, button, idx, type) => {

    const oldButton = JSON.parse(button);

    const newButton = emptyButton;

    if (type === 'microsite') {
        buttonMapper[`Button${idx}`] = {oldButton, newButton};
    }
    else {
        const { innerButton , outerButton } = oldButton;

        buttonMapper[`Button${idx}`] = { innerButton , outerButton }
        buttonMapper[`Button${idx}`].newInnerButton = newButton;
        buttonMapper[`Button${idx}`].newOuterButton = emptyOuterButton;
    }

    return buttonMapper;
}

/*
This function returns the mapping JSON to be stored for swapify to use
Depending on the type, the function will find all features necessary.
For example linkElements will return an array that looks like ["https://www.force24.com", "https://www.spacejam.com", "https://www.blockbuster.com"]
The variable links will be an object that contains these links yet formatted for the output JSON
{
    Link0: {
      oldLink: "https://www.force24.co.uk",
      newLink: null,
    },
    Link1: {
      oldLink: "https://www.spacejam.com",
      newLink: null,
    },
    Link2: {
      oldLink: "https://www.blockbuster.com",
      newLink: null,
    },
}
All the new links will be null at this point of the code. The function mapFeature will organise each link this way to be sent to the frontend.
*/
export async function createMapping(html, type) {

    const linkElements = extractLinks(html, type);
    const imageElements = extractImage(html);

    const links = linkElements.reduce((mapper, link, idx) => mapFeature(mapper, link, idx, 'Link'), {});
    
    
    if (type === "templates") {
        const firstImage = imageElements[0];
        const images = firstImage ? mapFeature({}, firstImage, 0, 'ImageLink') : {};

        const colorElements = extractColor(html);
        const color = colorElements.reduce((mapper, colour, idx) => mapFeature(mapper, colour, idx, 'Color'), {});

        return {links, images, color}
    }
    else {
        const images = imageElements.reduce((mapper, background, idx) => mapFeature(mapper, background, idx, 'ImageLink'), {});

        const buttonElements = extractButton(html, type);
        const backgrounds = extractBackgrounds(html, type);
        const fonts = extractFonts(html, type);
        const fontSizes = extractFontSize(html, type);
        const fontColors = extractFontColour(html, type);
        const backgroundImgElement = extractBackgroundImg(html);

        const fontColor = fontColors.reduce((mapper, font, idx) => mapFeature(mapper, font, idx, 'FontColor'), {});
        const backgroundImg = backgroundImgElement.reduce((mapper, background, idx) => mapFeature(mapper, background, idx, 'BackgroundImage'), {});
        const buttons = buttonElements.reduce((buttonMapper, button, idx) => mapButton(buttonMapper, button, idx, type), {});
        const backgroundColors = backgrounds.reduce((mapper, background, idx) => mapFeature(mapper, background, idx, 'Background'), {});
        const fontFamily = fonts.reduce((mapper, font, idx) => mapFeature(mapper, font, idx, 'FontFamily'), {});
        const fontSize = fontSizes.reduce((mapper, font, idx) => mapFeature(mapper, font, idx, 'FontSize'), {});

        const allButtons = type === 'microsite' ? emptyButton : 
            {
                innerButton: emptyButton,
                outerButton: emptyOuterButton
            }
        ;

        return {links, backgroundColors, fontColor, images, fontSize, fontFamily, buttons, allButtons, backgroundImg};
    }
}
