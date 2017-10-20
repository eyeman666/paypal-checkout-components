/* @flow */

export function getComponentScript() : () => void {

    /* istanbul ignore next */
    return () => {

        const STYLE = {
            BLOCK:        'block',
            INLINE_BLOCK: 'inline-block',
            NONE:         'none',
            VISIBLE:      'visible',
            HIDDEN:       'hidden'
        };

        function getElements(selector, parent) : Array<HTMLElement> {
            parent = parent || document;
            return Array.prototype.slice.call(parent.querySelectorAll(selector));
        }

        function showElement(el : HTMLElement, displayType : string = STYLE.INLINE_BLOCK) {
            el.style.display = displayType;
        }

        function hideElement(el : HTMLElement) {
            el.style.display = STYLE.NONE;
        }

        function makeElementVisible(el : HTMLElement) {
            el.style.visibility = STYLE.VISIBLE;
        }

        function makeElementInvisible(el : HTMLElement) {
            el.style.visibility = STYLE.HIDDEN;
        }

        function hasDimensions(el : HTMLElement) : boolean {
            let rect = el.getBoundingClientRect();
            return Boolean(rect.height && rect.width);
        }

        function isHidden(el : HTMLElement) : boolean {
            let computedStyle = window.getComputedStyle(el);
            return (!computedStyle || computedStyle.display === STYLE.NONE);
        }

        function displayedElementsHaveDimensions(elements : Array<HTMLElement>) : boolean {
            return elements.every(el => {
                return hasDimensions(el) || isHidden(el);
            });
        }

        function onDisplay(elements, method) {
            if (displayedElementsHaveDimensions(elements)) {
                method();
                return;
            }

            let interval = setInterval(() => {
                if (displayedElementsHaveDimensions(elements)) {
                    clearInterval(interval);
                    method();
                }
            }, 5);
        }

        function isOverflowing(el : HTMLElement) : boolean {

            if (el.offsetWidth < el.scrollWidth || el.offsetHeight < el.scrollHeight) {
                return true;
            }

            let parent = el.parentNode;

            if (!parent) {
                return false;
            }

            let e = el.getBoundingClientRect();
            // $FlowFixMe
            let p = parent.getBoundingClientRect();

            if (e.top < p.top || e.left < p.left || e.right > p.right || e.bottom > p.bottom) {
                return true;
            }

            if (e.left < 0 || e.top < 0 || (e.left + e.width) > window.innerWidth || (e.top + e.height) > window.innerHeight) {
                return true;
            }

            return false;
        }

        let images    = getElements('.{ CLASS.BUTTON } .{ CLASS.LOGO }');
        let text      = getElements('.{ CLASS.BUTTON } .{ CLASS.TEXT }');
        let tagline   = getElements('.{ CLASS.TAGLINE }');
        let cards     = getElements('.{ CLASS.FUNDINGICONS } .{ CLASS.CARD }');
        let optionals = getElements('.{ CLASS.BUTTON }-label-credit .{ CLASS.BUTTON }-logo-paypal');

        function toggleOptionals() {

            if (tagline.some(isOverflowing)) {
                tagline.forEach(makeElementInvisible);
            } else {
                tagline.forEach(makeElementVisible);
            }

            cards.forEach(el => showElement(el));
            cards.filter(isOverflowing).forEach(hideElement);

            text.forEach(el => showElement(el));
            optionals.forEach(el => showElement(el));

            if (images.some(isOverflowing) || text.some(isOverflowing)) {
                text.forEach(hideElement);
                optionals.forEach(hideElement);
                
            } else {
                text.forEach(makeElementVisible);
                optionals.forEach(el => showElement(el));
            }
        }

        onDisplay(images, () => {
            images.forEach(makeElementVisible);
            toggleOptionals();

            window.addEventListener('resize', () => {
                toggleOptionals();
            });
        });

        /* eslint-disable flowtype/require-return-type, unicorn/catch-error-name */

        try {
            let val = window.setupButton;
            // $FlowFixMe
            Object.defineProperty(window, 'setupButton', {
                // $FlowFixMe
                get() {
                    return val;
                },
                set(value) {
                    val = function () {

                        try {

                            if (window.paypal && window.paypal.Promise) {
                                let resolve = window.paypal.Promise.prototype.resolve;
                                window.paypal.Promise.prototype.resolve = function res(obj) {
                                    try {
                                        if (obj && obj.responseHeaders) {
                                            obj.headers = obj.responseHeaders;
                                        }
                                    } catch (err2) {
                                        // pass
                                    }

                                    return resolve.apply(this, arguments);
                                };
                            }

                            if (window.paypal && window.paypal.Checkout && window.paypal.Checkout.props) {
                                let props = window.paypal.Checkout.props;

                                props.style = props.style || { type: 'object', required: false };
                                props.fundingSource = props.fundingSource || { type: 'string', required: false };
                            }

                        } catch (err3) {
                            // pass
                        }

                        return value.apply(this, arguments);
                    };
                }
            });

        } catch (err) {
            // pass
        }

        /* eslint-enable flowtype/require-return-type, unicorn/catch-error-name */
    };
}
