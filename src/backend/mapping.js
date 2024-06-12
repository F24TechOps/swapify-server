import { 
    extractBackgrounds, 
    extractButton, 
    extractFontColour, 
    extractFontSize, 
    extractFonts, 
    extractImage, 
    extractBackgroundImg, 
    extractLinks 
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

export async function createMapping(html, type) {
    const linkElements = extractLinks(html, type);
    const backgrounds = extractBackgrounds(html, type);
    const fonts = extractFonts(html, type);
    const fontSizes = extractFontSize(html, type);
    const fontColors = extractFontColour(html, type);
    const imageElements = extractImage(html);
    const backgroundImgElement = extractBackgroundImg(html);
    const buttonElements = extractButton(html, type);

    const links = linkElements.reduce((mapper, link, idx) => mapFeature(mapper, link, idx, 'Link'), {});
    const backgroundColors = backgrounds.reduce((mapper, background, idx) => mapFeature(mapper, background, idx, 'Background'), {});
    const fontFamily = fonts.reduce((mapper, font, idx) => mapFeature(mapper, font, idx, 'FontFamily'), {});
    const fontSize = fontSizes.reduce((mapper, font, idx) => mapFeature(mapper, font, idx, 'FontSize'), {});
    const fontColor = fontColors.reduce((mapper, font, idx) => mapFeature(mapper, font, idx, 'FontColor'), {});
    const images = imageElements.reduce((mapper, background, idx) => mapFeature(mapper, background, idx, 'ImageLink'), {});
    const backgroundImg = backgroundImgElement.reduce((mapper, background, idx) => mapFeature(mapper, background, idx, 'BackgroundImage'), {});
    const buttons = buttonElements.reduce((buttonMapper, button, idx) => mapButton(buttonMapper, button, idx, type), {});

    const allButtons = type === 'microsite' ? emptyButton : 
        {
            innerButton: emptyButton,
            outerButton: emptyOuterButton
        }
    ;

    return {links, backgroundColors, fontFamily, fontColor, fontSize, images, buttons, allButtons, backgroundImg};
}
