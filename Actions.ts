import { ActionCallback } from './types.js';

/**
 * Callbacks for the API actions.
 */
export class Actions {
    /**
     * Generate a callback for a given integration
     */
    static addImageLink(selectorOrElement: string | HTMLFormElement, linkType: 'source' | 'risibank'): ActionCallback {
        return ({ media }) => {
            let formElement: HTMLFormElement | null;
            if (typeof selectorOrElement === 'string') {
                formElement = document.querySelector(selectorOrElement);
            } else {
                formElement = selectorOrElement;
            }

            const setReactInputValue = (element, value) => {
                const valueSetter = Object.getOwnPropertyDescriptor(element.__proto__, 'value')?.set;
                const prototype = Object.getPrototypeOf(element);
                const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
            
                if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
                    prototypeValueSetter.call(element, value);
                } else if (valueSetter) {
                    valueSetter.call(element, value);
                } else {
                    element.value = value;
                }
            
                element.dispatchEvent(new Event('input', { bubbles: true }));
            };


            if (!formElement) {
                throw new Error('Element not found');
            }
            const link = linkType === 'source' ? media.source_url : media.cache_url;

            // Get cursor position
            const cursorIndex = formElement.selectionStart;

            // Decide whether to append and prepend spaces
            const preprendSpace = formElement.value[cursorIndex - 1] && !formElement.value[cursorIndex - 1].match(/\s/);
            const appendSpace = typeof formElement.value[cursorIndex] === 'undefined' || !formElement.value[cursorIndex].match(/\s/);

            // Build text to add
            const added = `${preprendSpace ? ' ' : ''}${link}${appendSpace ? ' ' : ''}`;

            // Insert link where cursor is
            /*
            formElement.value =
                formElement.value.substring(0, formElement.selectionStart) +
                added +
                formElement.value.substring(formElement.selectionStart);
            */
            setReactInputValue(
                formElement,
                formElement.value.substring(0, cursorIndex) +
                added +
                formElement.value.substring(cursorIndex)
            );



            // Emit change event
            formElement.dispatchEvent(new Event('change'));
            formElement.dispatchEvent(new Event('input'));

            // Re-focus the text area
            formElement.focus();
        };
    }

    /**
     * Generate a callback to add a source image link (e.g. NoelShack) to a given text area
     */
    static addSourceImageLink(selectorOrElement: string | HTMLFormElement): ActionCallback {
        return Actions.addImageLink(selectorOrElement, 'source');
    }

    /**
     * Generate a callback to add a risibank image link to a given text area
     */
    static addRisiBankImageLink(selectorOrElement: string | HTMLFormElement): ActionCallback {
        return Actions.addImageLink(selectorOrElement, 'risibank');
    }

    /**
     * Paste the raw image data to the document
     */
    static pasteImage(): ActionCallback {
        return async ({ media }) => {
            const response = await fetch(media.cache_url);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);
            document.execCommand('paste');
        };
    }
}
