const log = console.log;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const show = (selector) => $(selector).classList.remove("d-none");
const hide = (selector) => $(selector).classList.add("d-none");

const toggleActiveBtn = (buttons) => {
  buttons.forEach((button) =>

    button.classList.toggle("active", button == event.currentTarget)
  );
};

const addNavToggleBtns = () => {
  $$("nav").forEach((navbar) =>
    navbar
      .querySelectorAll("button")
      .forEach((button) =>
        button.addEventListener("click", () =>
          toggleActiveBtn(navbar.querySelectorAll("button"))
        )
      )
  );
};

const notification = async (message) => {
  await new Promise(resolve => {
    const el = document.createElement('dialog');
    $('body').append(el);

    el.outerHTML = /*html*/`
        <dialog type="modal" class="dlg-notification">
            <div class="notification grid-center">
                <span data-lang="${message}"></span>
            </div>
        </dialog>
    `
    LANG_load();
    $('.dlg-notification').openModal();
    $('.dlg-notification').addEventListener("close", () => {
      resolve();
    });
  });
}

const debounce = (cb, delay = 1000) => {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

function throttle (cb, delay = 1000) {
  let shouldWait = false;

  return (...args) => {
      if (shouldWait) return;

      cb(...args);
      shouldWait = true;

      setTimeout(() => {
          shouldWait = false;
      }, delay);
  }
}

const includeTemplates = async () => {
  $$('[include-template]').forEach(
    async (templateContainer) => await includeTemplate(templateContainer)
  );
  
  LANG_load();
  return;
}

const includeTemplate = async (templateContainer) => {
  const url = templateContainer.getAttribute('include-template');
  const template = await getTemplate(url);
  templateContainer.innerHTML = template;
  return;
}

const getTemplate = async (url) => (await fetch(url)).text();

const goTo = (page) => {
  location.href = page;
}

const parse = (evalString) => Function(`'use strict'; return (${evalString}) ?? false`)();

const getFraction = (numerator, denominator, range = 1) => numerator / (denominator / range);

const searchParams = () => new URLSearchParams(document.location.search);

const HSLToRGB = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)),Math.round( 255 * f(4))];
};

function HSLToHex(hsl) {
  if (!hsl) return;
  const h = Number(hsl.match(/(?<=\()\d+/g)[0]);
  const s = Number(hsl.match(/(?<=,[\s]{0,1})\d+/g)[0]);
  const l = Number(hsl.match(/(?<=,[\s]{0,1})\d+/g)[1]);
  const alpha = (hsl.includes('hsla')) ? Math.roundTo(Number(hsl.match(/[\d\.]+(?=\)$)/g)[0]), 2) : 1;
  const hDecimal = l / 100;
  const a = (s * Math.min(hDecimal, 1 - hDecimal)) / 100;
  const hexAlpha = Math.round(255 * alpha).toString(16).toUpperCase();
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = hDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

    // Convert to Hex and prefix with "0" if required
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  };
  return `#${f(0)}${f(8)}${f(4)}${(alpha < 1) ? hexAlpha : ''}`;
}

const luma = (r, g, b) => Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);

function getCubicBezierPoint(t, p1, p2, p0 = {x: 0, y: 0}, p3 = {x: 1, y: 1}) {
  // Calculate the blending functions
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  // Calculate the x and y coordinates
  const x =
      mt3 * p0.x +
      3 * mt2 * t * p1.x +
      3 * mt * t2 * p2.x +
      t3 * p3.x;
  const y =
      mt3 * p0.y +
      3 * mt2 * t * p1.y +
      3 * mt * t2 * p2.y +
      t3 * p3.y;

  // Round the coordinates to 2 decimal places
  const roundedX = Math.roundTo(x, 2);
  const roundedY = Math.roundTo(y, 2);

  // Return the rounded coordinates
  return { x: roundedX, y: roundedY };
}

const getRGBfromString = (colorString) => {
  if (!(typeof colorString == 'string')) return colorString;
  const a = document.createElement('div');
  a.style.color = colorString;
  $('body').append(a);
  const rgb = (getComputedStyle(a).color)
  a.remove();
  return rgb;
}

const getRGBA = (color) => {
  if (!color.includes("rgb")) {
    if (getRGBfromString(color)) {
      color = getRGBfromString(color);
    }
  };
  const r = Number(color.match(/(?<=\()\d+(?=,)/g)[0]);
  const g = Number(color.match(/(?<=,\s{0,1})\d+(?=,)/g)[0]);
  const b = (color.includes("rgba")) ? Number(color.match(/(?<=,\s{0,1})\d+(?=,)/g)[1]) : Number(color.match(/(?<=,\s{0,1})\d+(?=\))/g)[0]);
  const a = (color.includes("rgba")) ? Number(color.match(/(?<=,\s{0,1})[\d\.]+(?=\))/g)[0]) : 1;
  return {r, g, b, a}; 
}

const averageColor = (c1, c2, factor = 0.5) => {
  let { r: r1, b: b1, g: g1, a: a1} = getRGBA(c1); 
  let { r: r2, b: b2, g: g2, a: a2} = getRGBA(c2);

  if (a1 == 0) {
    r1 = r2;
    g1 = g2;
    b1 = b2;
  } else if (a2 == 0) {
    r2 = r1;
    g2 = g1;
    b2 = b1;
  }

  const r = Math.round(getRange(r1, r2, factor));
  const g = Math.round(getRange(g1, g2, factor));
  const b = Math.round(getRange(b1, b2, factor));
  const a = Math.roundTo(getRange(a1, a2, factor), 2);

  return `rgba(${r}, ${g}, ${b}, ${a})`
} 

const getAverage = (...args) => args.reduce((total, current) => total += current, 0) / args.length;

const getRange = (min, max, factor) => min + (factor * max - factor * min)

const bezierGradient = ({colors: [...colors], resolution = 10}) => {
  let bg = [getRGBfromString(colors[0])];
  colors.slice(0, -1).for(
    (c1, i) => {
      const c2 = colors[i+1];
      for (let j = 1; j <= resolution; j++) {
        const t = j / resolution;
        let p1 = { x: 0.5, y: 0 };
        let p2 = { x: 0.5, y: 1 };
        if (i == 0) {
          p1 = { x: .25, y: .75 };
          p2 = { x:1, y: 1 };
        } else if (i == colors.length - 1) {
          p1 = { x: 0, y: 0 };
          p2 = { x:.75, y: .25 };
        }
        let { x, y } = getCubicBezierPoint(t, p1, p2);
        const colorStop = Math.round((x * 100) / (colors.length - 1) + (100 / (colors.length - 1)) * i);
        bg.push(`${averageColor(c1, c2, y)} ${colorStop}%`)
      }
    }
  )
  return bg.join(', ');
}

const linearGradient = ([...colors], resolutionFactor = 5) => {
  let bg = [];
  const resolution = resolutionFactor * colors.length;
  colors.slice(0, -1).for(
    (c1, i) => {
      const c2 = colors[i + 1];
      for (let i = 1; i <= resolution / colors.length; i++) {
        const progress = i / resolutionFactor;
        log(progress);
        bg.push(`${averageColor(c1, c2, progress)}`);
      }
    }
  )
  return bg.join(', ');
}

const getIp = async () => {
  return await (await fetch('../php/getIp.php')).text();
}

const isLetterOrNumber = (input) => input.length == 1 && /([a-z]|[A-Z]|[0-9])/.test(input);

const getDeviceData = async () => {
  const {city: {name: city}, country: {name: country}} = await (await fetch("https://api.geoapify.com/v1/ipinfo?&apiKey=58aa476deefd4ea69553d253e4063d6a")).json();
  const platform = navigator.userAgent.match(/(?<=\()[^;\s]*/)[0];
  return {city, country, platform};
}

removeMethods = (obj) => {
  if (obj.hasOwn("password")) delete obj.password;
  return JSON.parse(JSON.stringify(obj));
}

// const fetchData = async (url, fetchOptions = {method: "GET", dataType: "json"}) => {
//   let response;
//   let data;

//   if (method == "GET") {
//     response = await fetch(url);
//   } else if (method == "POST") {
//     response = await fetch(url, fetchOptions);
    
//   }

//   if (response?.ok) {
//     if (dataType == "json") data = await response.json();
//     else if (dataType == "text") data = await response.text();
//   }
// }

// async function fetch2 (url = '../php/tst.php', options) {
//   let requestOptions = {
//     method: options?.method ?? "GET",
//     load: options?.load ?? undefined,
//     body: options?.body ?? undefined
//   }
//   return await new Promise((resolve, reject) => {

//     const xhr = new XMLHttpRequest();
//     xhr.open(requestOptions.method, url);
//     // if (typeof requestOptions.load == "function") xhr.onload = requestOptions.load();
//     // (!!requestOptions.body && requestOptions.method == "POST") ? xhr.send(requestOptions.body) : xhr.send();
//     // xhr.responseType = "json";

//     const headerInit = JSON.parse(`{${xhr.getAllResponseHeaders().replaceAll(/[a-z\-]+(?=\:)/g, i => `"${i}"`).replaceAll(/(?<=[^\S\n\r])[^\r]*/g, i => `"${i}"`).replaceAll(/\r\n(?!$)/g, ', ')}}`)
    
    
//     xhr.onload = () => {
//       const stream = new ReadableStream({
//         start(controller) {
//           log('starting')
//           controller.enqueue(xhr.response);
//           controller.close();
//         }
//       });
//       const response = new Response(stream, {statusText: xhr.statusText, status: xhr.status, headers: new Headers(headerInit)});
//       resolve(response);
//     }

//     xhr.onerror = (e) => {
//       reject('failed');
//     }

//     xhr.send();
//   })
// }