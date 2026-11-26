/*
 * grille.js — Logique de la grille (aucun affichage ici).
 *
 * Valeurs d'une case :
 *   VIDE   = 0
 *   SOLEIL = 1
 *   LUNE   = 2
 *
 * Règles respectées par la solution générée :
 *   - chaque ligne et chaque colonne contient 3 soleils et 3 lunes ;
 *   - jamais plus de 2 symboles identiques côte à côte (ligne ou colonne).
 *
 * La grille du jour est générée à partir de la date : même graine,
 * donc même grille pour tout le monde le même jour.
 *
 * Chaque grille générée admet une seule solution et se résout par la
 * logique, sans deviner (voir fabriquerEnigme et solveur.js, chargé avant).
 */
var Grille = (function () {
  "use strict";

  var TAILLE = 6;
  var VIDE = 0;
  var SOLEIL = 1;
  var LUNE = 2;
  /* Signes candidats au départ de la fabrication ; les signes inutiles sont ensuite retirés. */
  var NB_SIGNES = 12;
  /* Nombre maximal de tentatives de fabrication d'une grille conforme. */
  var NB_ESSAIS_MAX = 5;

  /* Signes entre cases voisines. */
  var EGAL = "egal";
  var OPPOSE = "oppose";
  var DROITE = "droite";
  var BAS = "bas";

  /* Générateur pseudo-aléatoire déterministe (mulberry32). */
  function creerAleatoire(graine) {
    var etat = graine >>> 0;
    return function () {
      etat = (etat + 0x6d2b79f5) >>> 0;
      var t = etat;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Graine à partir d'une date : AAAAMMJJ (heure locale). */
  function graineDuJour(date) {
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  }

  function melanger(tableau, aleatoire) {
    for (var i = tableau.length - 1; i > 0; i--) {
      var j = Math.floor(aleatoire() * (i + 1));
      var tmp = tableau[i];
      tableau[i] = tableau[j];
      tableau[j] = tmp;
    }
    return tableau;
  }

  function grilleVide() {
    var g = [];
    for (var l = 0; l < TAILLE; l++) {
      var ligne = [];
      for (var c = 0; c < TAILLE; c++) {
        ligne.push(VIDE);
      }
      g.push(ligne);
    }
    return g;
  }

  /* Vérifie qu'on peut poser « valeur » en (l, c), la grille étant remplie ligne par ligne. */
  function placementPossible(g, l, c, valeur) {
    var moitie = TAILLE / 2;
    var nbLigne = 0;
    var nbColonne = 0;
    for (var i = 0; i < TAILLE; i++) {
      if (g[l][i] === valeur) nbLigne++;
      if (g[i][c] === valeur) nbColonne++;
    }
    if (nbLigne >= moitie || nbColonne >= moitie) return false;
    if (c >= 2 && g[l][c - 1] === valeur && g[l][c - 2] === valeur) return false;
    if (l >= 2 && g[l - 1][c] === valeur && g[l - 2][c] === valeur) return false;
    return true;
  }

  function remplir(g, index, aleatoire) {
    if (index === TAILLE * TAILLE) return true;
    var l = Math.floor(index / TAILLE);
    var c = index % TAILLE;
    var choix = melanger([SOLEIL, LUNE], aleatoire);
    for (var k = 0; k < choix.length; k++) {
      if (placementPossible(g, l, c, choix[k])) {
        g[l][c] = choix[k];
        if (remplir(g, index + 1, aleatoire)) return true;
        g[l][c] = VIDE;
      }
    }
    return false;
  }

  function copierGrille(g) {
    var copie = [];
    for (var l = 0; l < g.length; l++) copie.push(g[l].slice());
    return copie;
  }

  function compterCasesRemplies(g) {
    var n = 0;
    for (var l = 0; l < g.length; l++) {
      for (var c = 0; c < g[l].length; c++) {
        if (g[l][c] !== VIDE) n++;
      }
    }
    return n;
  }

  /* Vrai si la grille se résout entièrement par déductions logiques (sans deviner). */
  function resolubleSansDeviner(depart, signes) {
    return Solveur.resoudreLogiquement(TAILLE, depart, signes).resolue;
  }

  /*
   * Fabrique l'énigme à partir de la solution :
   *   1. on part de la grille entièrement révélée et de NB_SIGNES signes candidats ;
   *   2. on retire une à une les cases de départ (dans un ordre aléatoire),
   *      puis les signes, en n'acceptant un retrait que si la grille reste
   *      résoluble par la seule logique (Solveur.resoudreLogiquement) ;
   *   3. on garde toujours au moins une case de départ et au moins un signe.
   * Les déductions logiques étant toutes certaines, une grille résoluble
   * ainsi n'admet qu'une solution ; c'est vérifié en plus par recherche
   * exhaustive (Solveur.compterSolutions).
   */
  function fabriquerEnigme(solution, aleatoire) {
    var depart = copierGrille(solution);
    var signes = choisirSignes(solution, aleatoire);

    var indices = [];
    for (var i = 0; i < TAILLE * TAILLE; i++) indices.push(i);
    melanger(indices, aleatoire);

    for (var k = 0; k < indices.length; k++) {
      if (compterCasesRemplies(depart) <= 1) break;
      var l = Math.floor(indices[k] / TAILLE);
      var c = indices[k] % TAILLE;
      var valeur = depart[l][c];
      depart[l][c] = VIDE;
      if (!resolubleSansDeviner(depart, signes)) depart[l][c] = valeur;
    }

    var ordreSignes = melanger(signes.slice(), aleatoire);
    for (var s = 0; s < ordreSignes.length; s++) {
      if (signes.length <= 1) break;
      var essai = signes.filter(function (signe) {
        return signe !== ordreSignes[s];
      });
      if (resolubleSansDeviner(depart, essai)) signes = essai;
    }

    return { depart: depart, signes: signes };
  }

  /*
   * Contrôle complet d'une partie (critères de la user story) :
   * une seule solution, résoluble sans deviner, au moins une case de départ
   * et au moins un signe.
   */
  function verifierPartie(partie) {
    var logique = Solveur.resoudreLogiquement(partie.taille, partie.depart, partie.signes);
    var nbSolutions = Solveur.compterSolutions(partie.taille, partie.depart, partie.signes, 2);
    var identique = true;
    for (var l = 0; l < partie.taille; l++) {
      for (var c = 0; c < partie.taille; c++) {
        if (logique.grille[l][c] !== partie.solution[l][c]) identique = false;
      }
    }
    return {
      solutionUnique: nbSolutions === 1,
      resolubleSansDeviner: logique.resolue && identique,
      aCaseDepart: compterCasesRemplies(partie.depart) >= 1,
      aSigne: partie.signes.length >= 1,
      etapes: logique.etapes
    };
  }

  function partieConforme(partie) {
    var v = verifierPartie(partie);
    return v.solutionUnique && v.resolubleSansDeviner && v.aCaseDepart && v.aSigne;
  }

  /*
   * Choisit des signes entre cases voisines, cohérents avec la solution :
   *   « = »  (EGAL)   : les deux cases portent le même symbole ;
   *   « × »  (OPPOSE) : les deux cases portent des symboles différents.
   * Chaque signe : { ligne, colonne, direction, type } où « direction »
   * vaut DROITE (case voisine à droite) ou BAS (case voisine en dessous).
   */
  function choisirSignes(solution, aleatoire) {
    var paires = [];
    for (var l = 0; l < TAILLE; l++) {
      for (var c = 0; c < TAILLE; c++) {
        if (c < TAILLE - 1) paires.push({ ligne: l, colonne: c, direction: DROITE });
        if (l < TAILLE - 1) paires.push({ ligne: l, colonne: c, direction: BAS });
      }
    }
    melanger(paires, aleatoire);

    var signes = [];
    for (var k = 0; k < NB_SIGNES && k < paires.length; k++) {
      var p = paires[k];
      var l2 = p.direction === BAS ? p.ligne + 1 : p.ligne;
      var c2 = p.direction === DROITE ? p.colonne + 1 : p.colonne;
      p.type = solution[p.ligne][p.colonne] === solution[l2][c2] ? EGAL : OPPOSE;
      signes.push(p);
    }
    return signes;
  }

  /*
   * Crée la partie du jour.
   * Renvoie { taille, solution, depart, signes } où « depart » ne contient
   * que les cases de départ (les autres valent VIDE) et « signes » la liste
   * des contraintes « = » / « × » entre cases voisines.
   */
  function creerPartieDuJour(date) {
    var aleatoire = creerAleatoire(graineDuJour(date || new Date()));
    var partie = null;
    for (var essai = 0; essai < NB_ESSAIS_MAX; essai++) {
      var solution = grilleVide();
      remplir(solution, 0, aleatoire);
      var enigme = fabriquerEnigme(solution, aleatoire);
      partie = {
        taille: TAILLE,
        solution: solution,
        depart: enigme.depart,
        signes: enigme.signes
      };
      if (partieConforme(partie)) return partie;
    }
    /*
     * Filet de sécurité (ne devrait jamais servir) : grille entièrement
     * révélée, donc forcément unique et sans supposition.
     */
    partie.depart = copierGrille(partie.solution);
    return partie;
  }

  /* Valeur suivante d'une case saisie par le joueur : vide → soleil → lune → vide. */
  function valeurSuivante(valeur) {
    if (valeur === VIDE) return SOLEIL;
    if (valeur === SOLEIL) return LUNE;
    return VIDE;
  }

  function estCaseDepart(partie, l, c) {
    return partie.depart[l][c] !== VIDE;
  }

  /*
   * État de jeu initial : copie de la grille de départ, que le joueur
   * complète ensuite. Les cases de départ n'y sont jamais modifiées.
   */
  function creerEtatJeu(partie) {
    var etat = [];
    for (var l = 0; l < partie.taille; l++) {
      etat.push(partie.depart[l].slice());
    }
    return etat;
  }

  /*
   * Fait passer la case (l, c) à sa valeur suivante.
   * Renvoie la nouvelle valeur, ou null si la case est une case de départ
   * (son contenu ne change pas).
   */
  function changerCase(partie, etat, l, c) {
    if (estCaseDepart(partie, l, c)) return null;
    etat[l][c] = valeurSuivante(etat[l][c]);
    return etat[l][c];
  }

  return {
    TAILLE: TAILLE,
    VIDE: VIDE,
    SOLEIL: SOLEIL,
    LUNE: LUNE,
    EGAL: EGAL,
    OPPOSE: OPPOSE,
    DROITE: DROITE,
    BAS: BAS,
    creerPartieDuJour: creerPartieDuJour,
    verifierPartie: verifierPartie,
    valeurSuivante: valeurSuivante,
    estCaseDepart: estCaseDepart,
    creerEtatJeu: creerEtatJeu,
    changerCase: changerCase
  };
})();
