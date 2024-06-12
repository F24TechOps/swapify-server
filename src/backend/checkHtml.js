export function isFullHtml(html) {
    return /^<html[\s>]/i.test(html.trim()) || /^<!DOCTYPE html>\s*<html[\s>]/i.test(html.trim());
}
