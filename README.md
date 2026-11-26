# Tango - Keewee

Projet TKA, créé par le système multi-agents (DeveloppeurIA).

Jeu de logique « Tango » : remplir une grille 6×6 avec des soleils et des lunes.
Le jeu fonctionne entièrement dans le navigateur, sans serveur.

## Ouvrir le jeu

Ouvrir `index.html` directement dans un navigateur (double-clic).

## Pages

- `index.html` : écran du jeu (grille du jour).

## Comment jouer

Chaque jour, une nouvelle grille est proposée (la même pour tout le monde, générée à partir de la date).
Les cases au fond gris sont les **cases de départ** : elles sont déjà remplies avec un soleil ou une lune.

Règles de la grille :
- chaque ligne et chaque colonne contient 3 soleils et 3 lunes ;
- jamais plus de 2 symboles identiques côte à côte ;
- un signe « = » entre deux cases voisines indique qu'elles portent le même symbole ;
- un signe « × » entre deux cases voisines indique qu'elles portent des symboles différents.

La saisie des cases et la vérification des contraintes arriveront dans les prochaines versions.

## Organisation du code

- `assets/js/grille.js` : logique (génération de la grille du jour, règles).
- `assets/js/main.js` : affichage de la grille.
- `assets/css/style.css` : styles.
