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

Chaque jour, une nouvelle grille est proposée : elle est générée dans le navigateur à partir de la date du jour (selon le calendrier de l'appareil), donc **la même pour tout le monde le même jour**, et toujours différente de celle de la veille. La date de la grille est affichée au-dessus de celle-ci. Aucune grille n'est enregistrée : actualiser la page relance la grille du jour.
Les cases au fond gris sont les **cases de départ** : elles sont déjà remplies avec un soleil ou une lune.

Règles de la grille :
- chaque ligne et chaque colonne contient 3 soleils et 3 lunes ;
- jamais plus de 2 symboles identiques côte à côte ;
- un signe « = » entre deux cases voisines indique qu'elles portent le même symbole ;
- un signe « × » entre deux cases voisines indique qu'elles portent des symboles différents.

Pour remplir la grille, cliquez (ou touchez sur mobile) une case blanche : elle passe à un soleil, puis à une lune, puis redevient vide.
Au clavier, Tab pour aller d'une case à l'autre, Entrée ou Espace pour changer son contenu.
Les cases de départ ne peuvent pas être modifiées.

Sous la grille :
- **« Undo »** annule le dernier coup (la case retrouve son contenu précédent) ; cliquez plusieurs fois pour annuler les coups un par un, du plus récent au plus ancien ;
- **« Reset »** vide toutes les cases que vous avez remplies : seules les cases de départ restent. L'historique des coups est alors effacé (un « Reset » ne peut pas être annulé).

Chaque grille a **une seule solution**, que l'on peut trouver **par la logique, sans jamais deviner**.
Elle contient toujours au moins une case de départ et au moins un signe « = » ou « × ».

Les règles non respectées sont signalées en direct, à chaque saisie :
- **trois symboles identiques côte à côte** (ligne ou colonne) : les trois cases s'affichent en rouge ;
- **plus de trois soleils ou plus de trois lunes** dans une ligne ou une colonne (même incomplète) : toute la ligne ou colonne est surlignée (fond rosé, bordure rouge en pointillés) ;
- **signe « = » ou « × » non respecté** (les deux cases étant remplies) : le signe passe en rouge et les deux cases aussi.

Dès que l'erreur est corrigée, le signalement disparaît. Les lecteurs d'écran annoncent aussi les règles non respectées après chaque saisie.

## Organisation du code

- `assets/js/solveur.js` : solveur (résolution logique pas à pas avec la règle qui justifie chaque case, et comptage exhaustif des solutions).
- `assets/js/grille.js` : logique (génération de la grille du jour à partir d'une graine tirée de la date, comparaison avec la grille de la veille, garantie d'unicité et de résolution logique, état de la partie, changement d'une case, historique des coups pour « Undo » et « Reset », recherche des règles non respectées).
- `assets/js/main.js` : affichage de la grille et saisie du joueur.
- `assets/css/style.css` : styles.
