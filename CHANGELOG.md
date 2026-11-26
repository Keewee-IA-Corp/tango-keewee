# Changelog

## TKA-20261126-230511 — Afficher la grille 6×6 avec ses cases de départ

- Création de la structure du projet (`index.html`, `assets/css/style.css`, `assets/js/`, `assets/img/`).
- `assets/js/grille.js` : génération déterministe de la grille du jour à partir de la date (3 soleils et 3 lunes par ligne et colonne, jamais 3 symboles identiques côte à côte) et choix de 10 cases de départ.
- `assets/js/main.js` : affichage des 36 cases (6 lignes × 6 colonnes) ; cases de départ sur fond gris clair avec un soleil (disque orange #F5A623, contour orange foncé) ou une lune (croissant bleu #2F6FD6, contour bleu foncé) en SVG ; autres cases sur fond blanc.
- Grille centrée dans une carte blanche aux coins arrondis sur fond gris très clair, qui se redimensionne pour tenir sans défilement horizontal dès 360 px de large.
- Mise à jour du `README.md`.
