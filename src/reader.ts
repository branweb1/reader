// constants
const RED_LETTER_OFFSET = 6;

// word display
function calcRedIdx(word: string): number {
  let redIdx: number;
  const wordlen: number = word.length;
  // handle if wordlen is 0!!

  if (wordlen === 1) {
    redIdx = 0;
  } else if (wordlen <= 3) {
    redIdx = 1;
  } else if (wordlen < 8) {
    redIdx = 2;
  } else {
    redIdx = 3;
  }

  return redIdx;
}

function splitter(text: string): string[] {
  return concatMap(a => a.split(/(\w+\-)/), text.split(/\s+/))
    .filter(idFunc);
}

function makeWord(word: string): string {
  const idx = calcRedIdx(word);
  const p1 = leftpad(word.substring(0,idx), ' ', RED_LETTER_OFFSET-idx);
  const p2 = `<span style="color:#CC0033;">${word.charAt(idx)}</span>`;
  const p3 = word.substring(idx+1);
  return p1 + p2 + p3;
}

function calcSleepTime(word: string, wpm: number): number {
  let base = 60000 / wpm;
  const lastChar = word.slice(-1);
  if (/[\.\!\;]/.test(lastChar)) {
    base += 230;
  } else if (/[\-\,\:]/.test(lastChar)) {
    base += 100;
  }
  return base;
}

// helpers
type CMapIterator<T> = (x: T) => Array<T>;
function concatMap<T>(f: CMapIterator<T>, arr: Array<T>): Array<T> {
  return arr.reduce((acc, a) => {
    return [...acc, ...f(a)];
  }, [])
}

function idFunc<T>(a: T): T {return a;}

function leftpad(word: string, char: string, n: number): string {
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
function extractTextArea(): string {
  const txtarea: HTMLInputElement = document.querySelector('textArea');
  return txtarea ? txtarea.value : '';
}

function extractTextAreaSelection(): string {
  const txtarea: HTMLInputElement = document.querySelector('textArea');
  const start: number = txtarea.selectionStart;
  const finish: number = txtarea.selectionEnd;
  return txtarea
    ? txtarea.value.substring(start, finish)
    : "";
}

function extractPageSelection(): string {
  return window.getSelection().toString(); // returns "" if nothing selected
}

function extractText(): string {
  const pageSel = extractPageSelection();
  // ordered from most -> least specific;
  // each extract method returns a string;
  // if string is empty, this function tries
  // a more generic method
  if (pageSel) {
    return pageSel;
  } else {
    return extractTextAreaSelection() || extractTextArea();
  }
}

// ui stuff
function setBarOffset(elem: HTMLElement): void {
  elem.style.visibility = 'hidden';
  elem.innerHTML = makeWord('dummyword');
  const charLen = elem.querySelector('span').getBoundingClientRect().width;
  const offset = (charLen / 2) + (charLen * (RED_LETTER_OFFSET));
  [...document.querySelectorAll('.spritz-vert-bar')].forEach((node: HTMLElement) =>
                                                             node.style.width = `${offset}px`);
  elem.innerHTML = ' ';
  elem.style.visibility = 'initial';
}

async function showWords(words: string[], display: HTMLElement): Promise<void> {
  for (let i = 0; i < words.length; i++) {
    const word = makeWord(words[i]);
    display.innerHTML = word;
    await sleep(calcSleepTime(word, 300));
  }
}

function toggleReaderVisibility(): void {
  const container: HTMLElement = document.querySelector('#spritz-container');
  if (container.style.display === 'none') {
    container.style.display = 'initial';
  } else {
    container.style.display = 'none';
  }
}

async function readerMain() {
  const div: HTMLElement = document.createElement('div');
  const html = await fetch('https://branweb1.github.io/reader/dist/reader.html').then(resp => resp.text());
  const style: HTMLElement = document.createElement('link');
  div.setAttribute('id', 'spritz-container');
  style.setAttribute('rel', 'stylesheet');
  style.setAttribute('type', 'text/css');
  style.setAttribute('href', 'https://branweb1.github.io/reader/dist/style.css');
  document.querySelector('head').appendChild(style);
  div.innerHTML = html;
  document.body.appendChild(div);
  const display: HTMLElement = document.querySelector('#spritz-display-area');
  setBarOffset(display);
  const words = splitter(extractText());
  showWords(words, display);
}

readerMain();
