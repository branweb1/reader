var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// constants
const RED_LETTER_OFFSET = 6;
// word display
function calcRedIdx(word) {
    let redIdx;
    const wordlen = word.length;
    // handle if wordlen is 0!!
    if (wordlen === 1) {
        redIdx = 0;
    }
    else if (wordlen <= 3) {
        redIdx = 1;
    }
    else if (wordlen < 8) {
        redIdx = 2;
    }
    else {
        redIdx = 3;
    }
    return redIdx;
}
function splitter(text) {
    return concatMap(a => a.split(/(\w+\-)/), text.split(/\s+/))
        .filter(idFunc);
}
function makeWord(word) {
    const idx = calcRedIdx(word);
    const p1 = leftpad(word.substring(0, idx), ' ', RED_LETTER_OFFSET - idx);
    const p2 = `<span style="color:red;">${word.charAt(idx)}</span>`;
    const p3 = word.substring(idx + 1);
    return p1 + p2 + p3;
}
function calcSleepTime(word, wpm) {
    let base = 60000 / wpm;
    const lastChar = word.slice(-1);
    if (/[\.\!\;]/.test(lastChar)) {
        base += 230;
    }
    else if (/[\-\,\:]/.test(lastChar)) {
        base += 100;
    }
    return base;
}
function concatMap(f, arr) {
    return arr.reduce((acc, a) => {
        return [...acc, ...f(a)];
    }, []);
}
function idFunc(a) { return a; }
function leftpad(word, char, n) {
    let padding = '';
    for (let i = 0; i < n; i++) {
        padding += char;
    }
    return padding + word;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// text-select
function extractTextArea() {
    const txtarea = document.querySelector('textArea');
    return txtarea ? txtarea.value : '';
}
function extractTextAreaSelection() {
    const txtarea = document.querySelector('textArea');
    const start = txtarea.selectionStart;
    const finish = txtarea.selectionEnd;
    return txtarea
        ? txtarea.value.substring(start, finish)
        : "";
}
function extractPageSelection() {
    return window.getSelection().toString(); // returns "" if nothing selected
}
function extractText() {
    const pageSel = extractPageSelection();
    // ordered from most -> least specific;
    // each extract method returns a string;
    // if string is empty, this function tries
    // a more generic method
    if (pageSel) {
        return pageSel;
    }
    else {
        return extractTextAreaSelection() || extractTextArea();
    }
}
// ui stuff
function setBarOffset(elem) {
    elem.style.visibility = 'hidden';
    elem.innerHTML = makeWord('dummyword');
    const charLen = elem.querySelector('span').getBoundingClientRect().width;
    const offset = (charLen / 2) + (charLen * (RED_LETTER_OFFSET));
    [...document.querySelectorAll('.spritz-vert-bar')].forEach((node) => node.style.width = `${offset}px`);
    elem.innerHTML = ' ';
    elem.style.visibility = 'initial';
}
function showWords(words, display) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < words.length; i++) {
            const word = makeWord(words[i]);
            display.innerHTML = word;
            yield sleep(calcSleepTime(word, 300));
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // e.preventDefault();
        const div = document.createElement('div');
        div.setAttribute('id', 'spritz-container');
        const foo = yield fetch('./index.html').then(resp => resp.text());
        div.innerHTML = foo;
        // div.innerHTML = '<div> \
        //     <div id="spritz-top-border"> \
        //       <div class="spritz-vert-bar"></div> \
        //     </div> \
        //     <pre id="spritz-display-area"></pre> \
        //     <div id="spritz-bottom-border"> \
        //       <div class="spritz-vert-bar"></div> \
        //     </div> \
        //   </div>';
        document.body.appendChild(div);
        const display = document.querySelector('#spritz-display-area');
        setBarOffset(display);
        const words = splitter(extractText());
        showWords(words, display);
    });
}
main();
// document.querySelector('button').addEventListener('click', main);
// make modal dragabble
// pause/resume
// adjust wpm
// close btn
// put js,css,html on gh-pages
// write a bookmarklet that inserts script tag on page and loads js into it, which then builds the window
// better monospace font
// tone down colors
