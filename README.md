# Haladó programozás beadandó

## Függőségek

- TypeScript (build-eléshez)
- Ollama *(qwen3.5:4b model)*

## Feladat bemutatása

A projekt feladata egy minta/képfelismerő applikáció megvalósítása AI model segítségével, webes felületen.
A projekt a **Flask keretrendszert** használja, a felületi logika TypeScript-ben készült.
A felhasznált AI model lokálisan fut. Ehhez szükség van az **Ollama szoftverre** és ezen belül a **qwen3.5:4b** model-re.

## Használat

A projekt build-elése, futtatása:

1. Az Ollama-nak futnia kell a számítógépen
2. A projekt mappáját megnyitjuk parancssorban
3. Telepítjük a szükséges függőségeket
4. `tsc -p src` vagy `npm run tsc -p src` paranccsal compile-oljuk a TypeScript projektet
5. `flask --app app run` paranccsal elindítjuk a webapplikációt
