# ASCII Background for ChatGPT & Gemini

Chrome extension: living ASCII animals (butterflies, koi, jellyfish, dragonflies, frogs, cranes, crabs) as the background of chatgpt.com and gemini.google.com.
The animation engine is extracted from `ascii-animals-extension` (Apache-2.0 / MIT, see LICENSE files).

## Telepítés
1. Csomagold ki a zip-et.
2. Chrome: `chrome://extensions` → jobb felül **Developer mode** be → **Load unpacked** → válaszd ezt a mappát.
3. Nyisd meg a chatgpt.com-ot vagy a gemini.google.com-ot (már nyitott fület frissíts újra).

## Tweaks panel
A chatgpt.com jobb alsó sarkában lévő kerek gombbal (vagy az eszköztár ikon → *Open Tweaks panel*) nyílik.
- **Scene**: állat legördülő menü, láthatóság, mód (**Background** a chat mögött / **Overlay** tartalék)
- **Movement / állat-specifikus / Look** csúszkák, mint az eredeti bővítményben; a címsorra kattintva szakaszok nyithatók/zárhatók
- A név dupla kattintására az érték visszaáll; **Copy** vágólapra másolja a beállításokat, **Reset** visszaállítja az aktuális állatot
- A beállítások állatonként megmaradnak
- Az eszköztár ikonon a be/ki kapcsoló van

## Ha nem látszanak az állatok
Háttér módban a bővítmény megkeresi a képernyőt kitöltő, átlátszatlan rétegeket, és ezeket átlátszóvá teszi (`scan()` a `content.js`-ben). Ha egy oldal megváltozik és mégsem látszik semmi, válts a panelben **Overlay** módra: az osztálynevektől függetlenül mindig működik.

Kattintás bárhol az oldalon megriasztja az állatokat.
