# Tango - Keewee

Projet TKA, créé par le système multi-agents (DeveloppeurIA).

Jeu de logique « Tango » : remplir une grille 6×6 avec des soleils et des lunes.
Le jeu fonctionne entièrement dans le navigateur, sans serveur.

## Ouvrir le jeu

Ouvrir `index.html` directement dans un navigateur (double-clic).

## Pages

- `index.html` : écran du jeu (grille du jour).

## Comment jouer

Les règles sont rappelées dans le panneau dépliable **« How to play »**, sous la grille (cliquez sur le titre pour le déplier ou le replier).

Chaque jour, une nouvelle grille est proposée (la même pour tout le monde, générée à partir de la date).
Les cases au fond gris sont les **cases de départ** : elles sont déjà remplies avec un soleil ou une lune.

Règles de la grille :
- chaque ligne et chaque colonne contient 3 soleils et 3 lunes ;
- jamais plus de 2 symboles identiques côte à côte ;
- un signe « = » entre deux cases voisines indique qu'elles portent le même symbole ;
- un signe « × » entre deux cases voisines indique qu'elles portent des symboles différents.

Pour remplir la grille, cliquez (ou touchez sur mobile) une case blanche : elle passe à un soleil, puis à une lune, puis redevient vide.
Au clavier, Tab pour aller d'une case à l'autre, Entrée ou Espace pour changer son contenu.
Les cases de départ ne peuvent pas être modifiées.

Chaque grille a **une seule solution**, que l'on peut trouver **par la logique, sans jamais deviner**.
Elle contient toujours au moins une case de départ et au moins un signe « = » ou « × ».

La vérification des contraintes arrivera dans une prochaine version.

## Organisation du code

- `assets/js/solveur.js` : solveur (résolution logique pas à pas avec la règle qui justifie chaque case, et comptage exhaustif des solutions).
- `assets/js/grille.js` : logique (génération de la grille du jour, garantie d'unicité et de résolution logique, état de la partie, changement d'une case).
- `assets/js/main.js` : affichage de la grille et saisie du joueur.
- `assets/css/style.css` : styles.
