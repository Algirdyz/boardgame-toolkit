export function getDPI() {
    if (typeof window === 'undefined') {
        return 96; // Default DPI for server-side rendering
    }
    const div = document.createElement('div');
    div.style.width = '1in';
    div.style.position = 'absolute';
    div.style.left = '-100%';
    document.body.appendChild(div);
    const dpi = div.offsetWidth;
    document.body.removeChild(div);
    return dpi;
}
