# Changelog

## TKA-20261126-230511-6 — Annuler le dernier coup et réinitialiser la grille

- `assets/js/grille.js` (logique seule) : historique des coups (`creerHistorique`, `jouerCoup` qui enregistre la case et sa valeur précédente), `annulerCoup` (rétablit la valeur précédente du dernier coup, coups annulés un par un en ordre inverse) et `reinitialiser` (vide toutes les cases saisies, garde les cases de départ, efface l'historique).
- `assets/js/main.js` : les saisies passent par `Grille.jouerCoup` ; boutons « Undo » et « Reset » branchés sur la grille ; après chaque annulation ou réinitialisation, les cases et les signalements de règles sont redessinés et le changement est annoncé dans la zone `aria-live` (« Coup annulé… », « Aucun coup à annuler. », « Grille réinitialisée… »).
- `index.html` : boutons « Undo » et « Reset » sous la grille, consigne complétée.
- `assets/css/style.css` : style des boutons (`.commandes`, `.commande`), avec survol et contour de focus clavier.
- Mise à jour du `README.md`.

## TKA-20261126-230511-4 — Signaler en direct les violations de règle

- `assets/js/grille.js` : nouvelle fonction `Grille.trouverViolations(partie, etat)` (logique seule) qui repère dans l'état de jeu les trois symboles identiques côte à côte, les lignes et colonnes avec plus de 3 soleils ou plus de 3 lunes, et les signes « = » / « × » non respectés (cases vides ignorées).
- `assets/js/main.js` : après chaque saisie, tous les signalements sont recalculés (`afficherViolations`) : cases en rouge (`case--erreur`), lignes/colonnes en excès surlignées (`case--exces`), signes non respectés en rouge (`signe--erreur`). Une erreur corrigée n'est donc plus signalée. Les cases signalées ont « règle non respectée » dans leur `aria-label`, et la zone `aria-live` annonce les règles non respectées (puis « Plus aucune règle non respectée » une fois corrigées).
- `assets/css/style.css` : variables `--couleur-erreur`, `--couleur-erreur-fond`, `--couleur-exces-fond` et styles des signalements ; survol d'une case signalée en voile léger pour que le rouge reste visible.
- `index.html` : consigne complétée (« Les règles non respectées s'affichent en rouge »).
- Mise à jour du `README.md`.

## TKA-20261126-230511-11 — Afficher le panneau « How to play »

- `index.html` : panneau dépliable « How to play » sous la grille et sa consigne (élément natif `<details>`/`<summary>` : se déplie et se replie au clic, au toucher ou au clavier, état annoncé par les lecteurs d'écran, sans JavaScript). Il rappelle les règles : trois soleils et trois lunes par ligne et colonne, pas plus de deux symboles identiques côte à côte, signification des signes « = » et « × ». Replié par défaut.
- `assets/css/style.css` : style du panneau (titre en gras avec chevron qui pivote selon l'état, survol, contour de focus clavier, signes « = » et « × » en pastille comme sur la grille), réutilisant les variables existantes.
- Mise à jour du `README.md`.

## TKA-20261126-230511-8 — Garantir une solution unique et une logique résoluble

- Nouveau `assets/js/solveur.js` (logique seule, chargé avant `grille.js`) :
  - `resoudreLogiquement` : résolution pas à pas, uniquement par règles logiques sur une ligne ou une colonne (signes « = »/« × » avec une case connue, paire, sandwich, paire « = » qui touche un symbole, comptage tenant compte des paires « × » et « = »), sans supposition ni retour en arrière ; chaque case posée est accompagnée de la règle qui la justifie (`Solveur.REGLES`) ;
  - `compterSolutions` : recherche exhaustive qui compte les solutions respectant toutes les règles (arrêt à 2) ;
  - `prochaineDeduction` : première déduction logique possible (réutilisable pour l'indice).
- `assets/js/grille.js` : la grille du jour n'a plus un nombre fixe de cases de départ et de signes. On part de la solution entièrement révélée et de 12 signes candidats, puis on retire cases et signes un à un tant que la grille reste résoluble par la seule logique ; il reste toujours au moins une case de départ et au moins un signe. La partie est ensuite contrôlée (`Grille.verifierPartie`) : solution unique, résoluble sans deviner, au moins une case de départ et un signe.
- `index.html` : chargement de `solveur.js`.
- La grille d'une date donnée est différente de celle des versions précédentes (nouvelle méthode de fabrication), mais reste la même pour tout le monde le même jour.
- Mise à jour du `README.md`.

## TKA-20261126-230511-3 — Saisir un soleil ou une lune dans une case vide

- `assets/js/grille.js` : état de jeu séparé de la grille de départ (`creerEtatJeu`), cycle d'une case vide → soleil → lune → vide (`valeurSuivante`, `changerCase`) ; les cases de départ ne sont jamais modifiées (`changerCase` renvoie `null`).
- `assets/js/main.js` : chaque case à remplir contient un `<button>` qui occupe toute la case (clic souris, tap mobile, Entrée/Espace au clavier) ; les cases de départ n'ont pas de bouton et ne réagissent pas. L'`aria-label` de la case est mis à jour à chaque changement et le nouveau contenu est annoncé dans une zone `aria-live`.
- `assets/css/style.css` : style du bouton de case (survol, contour de focus clavier, `touch-action: manipulation` pour un tap immédiat sans zoom au double-tap).
- `index.html` : courte consigne sous la grille et zone d'annonce `aria-live`.
- Mise à jour du `README.md`.

## TKA-20261126-230511-2 — Afficher les signes « = » et « × » entre les cases

- `assets/js/grille.js` : génération de 8 signes entre cases voisines (à droite ou en dessous), cohérents avec la solution du jour : « = » si les deux cases portent le même symbole, « × » sinon. Ils sont renvoyés dans `partie.signes`. Les cases de départ restent identiques à la version précédente.
- `assets/js/main.js` : affichage de chaque signe à cheval sur la bordure entre les deux cases, et ajout de sa description (« signe égal / opposé avec la case à droite… ») dans l'`aria-label` des deux cases concernées.
- `assets/css/style.css` : signes petits (pastille de 1rem) en gris foncé (`--couleur-signe`), centrés sur l'écart entre les cases, avec `pointer-events: none` pour ne jamais gêner le clic sur les cases.
- Mise à jour du `README.md`.

## TKA-20261126-230511 — Afficher la grille 6×6 avec ses cases de départ

- Création de la structure du projet (`index.html`, `assets/css/style.css`, `assets/js/`, `assets/img/`).
- `assets/js/grille.js` : génération déterministe de la grille du jour à partir de la date (3 soleils et 3 lunes par ligne et colonne, jamais 3 symboles identiques côte à côte) et choix de 10 cases de départ.
- `assets/js/main.js` : affichage des 36 cases (6 lignes × 6 colonnes) ; cases de départ sur fond gris clair avec un soleil (disque orange #F5A623, contour orange foncé) ou une lune (croissant bleu #2F6FD6, contour bleu foncé) en SVG ; autres cases sur fond blanc.
- Grille centrée dans une carte blanche aux coins arrondis sur fond gris très clair, qui se redimensionne pour tenir sans défilement horizontal dès 360 px de large.
- Mise à jour du `README.md`.
