// types
enum SpeedOp {
  Inc,
  Dec
}
type Handler = (x: Event) => void;
type CMapIterator<T> = (x: T) => Array<T>;

// globals
const RED_LETTER_OFFSET: number = 5;
let WPM: number = 320;
let RUNNING: boolean = false;
let WORDS: string[] = [];
let IDX: number = 0;

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
  const p2 = `<span class="red-letter">${word.charAt(idx)}</span>`;
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
  [...document.querySelector('#spritz-container').shadowRoot.querySelectorAll('.vert-bar')]
    .forEach((node: HTMLElement) => node.style.width = `${offset}px`);
  elem.innerHTML = ' ';
  elem.style.visibility = 'initial';
}

function modWPM(op: SpeedOp): Handler  {
  return (e) => {
    e.preventDefault();
    if (op === SpeedOp.Inc) {
      WPM += 10;
    } else if (op === SpeedOp.Dec) {
      WPM -= 10;
    }
    document.querySelector('#spritz-container').shadowRoot
      .querySelector('.wpm-count').textContent = `${WPM}`;
  }
}

async function cycleWords(display: HTMLElement): Promise<void> {
  while (IDX < WORDS.length && RUNNING) {
    const word = makeWord(WORDS[IDX]);
    display.innerHTML = word;
    await sleep(calcSleepTime(word, WPM));
    IDX++;
  }
}

async function readerSetup() {
  // inject reader modal into current page
  const div: HTMLElement = document.createElement('div');
  div.setAttribute('id', 'spritz-container');
  div.attachShadow({mode: 'open'});

  const html = await fetch('https://branweb1.github.io/reader/dist/reader.html').then(resp => resp.text());
  const style: HTMLElement = document.createElement('link');
  style.setAttribute('rel', 'stylesheet');
  style.setAttribute('type', 'text/css');
  style.setAttribute('href', 'https://branweb1.github.io/reader/dist/style.css');

  div.shadowRoot.innerHTML = html;
  div.shadowRoot.insertBefore(style, div.shadowRoot.firstChild);
  document.body.appendChild(div);

  // add event listeners
  div.shadowRoot.querySelector('.close-btn').addEventListener('click', readerStop);
  div.shadowRoot.querySelector('.wpm-increase').addEventListener('click', modWPM(SpeedOp.Inc));
  div.shadowRoot.querySelector('.wpm-decrease').addEventListener('click', modWPM(SpeedOp.Dec));
  div.shadowRoot.querySelector('.pause').addEventListener('click', togglePause);

  // ui setup
  div.shadowRoot.querySelector('.wpm-count').textContent = `${WPM}`;
  const display: HTMLElement = div.shadowRoot.querySelector('#display-area');
  setBarOffset(display);
}

async function readerInit() {
  let exists: HTMLElement = document.querySelector('#spritz-container');
  if (!exists) {
    await readerSetup();
    exists = document.querySelector('#spritz-container');
  } else {
    exists.style.display = 'initial';
  }
  const display: HTMLElement = exists.shadowRoot.querySelector('#display-area');
  const foo: HTMLElement = exists.shadowRoot.querySelector('.container');
  foo.style.top = `${window.scrollY + 45}px`;
//  RUNNING = true;
  WORDS = splitter(extractText());
  IDX = 0;
  cycleWords(display);
}

function togglePause(e: Event): void {
  e.preventDefault();
  RUNNING = !RUNNING;
  const container: HTMLElement = document.querySelector('#spritz-container');
  const display: HTMLElement = container.shadowRoot.querySelector('#display-area');
  container.shadowRoot.querySelector('.pause').textContent = RUNNING ? 'pause' : 'start'; 
  cycleWords(display);
}


function readerStop() {
  const container: HTMLElement = document.querySelector('#spritz-container');
  RUNNING = false;
  container.style.display = 'none';
}
