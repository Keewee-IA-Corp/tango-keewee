/*
 * main.js — Affichage de la grille et saisie du joueur (aucune règle du jeu ici).
 * Dépend de solveur.js (explication des indices), grille.js et chrono.js, chargés avant ce fichier.
 */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  /* Dessine un soleil (disque) ou une lune (croissant) en SVG. */
  function creerSymbole(valeur) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    var forme;
    if (valeur === Grille.SOLEIL) {
      svg.setAttribute("class", "symbole symbole--soleil");
      forme = document.createElementNS(SVG_NS, "circle");
      forme.setAttribute("cx", "12");
      forme.setAttribute("cy", "12");
      forme.setAttribute("r", "8");
    } else {
      svg.setAttribute("class", "symbole symbole--lune");
      forme = document.createElementNS(SVG_NS, "path");
      /* Croissant : grand cercle (centre 12,12 ; rayon 8) privé d'un cercle décalé en haut à droite. */
      forme.setAttribute("d", "M11.31 4.03 A8 8 0 1 0 19.77 13.9 A6.5 6.5 0 0 1 11.31 4.03 Z");
    }
    svg.appendChild(forme);
    return svg;
  }

  function nomSymbole(valeur) {
    if (valeur === Grille.SOLEIL) return "soleil";
    if (valeur === Grille.LUNE) return "lune";
    return "vide";
  }

  /*
   * Crée le petit signe « = » ou « × » posé à cheval sur la bordure entre
   * une case et sa voisine (à droite ou en dessous). Purement visuel :
   * il est décrit dans l'aria-label des cases et ne capte pas les clics.
   */
  function creerSigne(signe, index) {
    var el = document.createElement("span");
    el.className = "signe signe--" + signe.direction;
    el.dataset.index = String(index);
    el.setAttribute("aria-hidden", "true");
    el.textContent = signe.type === Grille.EGAL ? "=" : "×";
    return el;
  }

  function texteSigne(signe) {
    return signe.type === Grille.EGAL ? "signe égal" : "signe opposé";
  }

  /* Tableau 6×6 de listes vides : les descriptions des signes de chaque case. */
  function creerTextesSignes(taille) {
    var textes = [];
    for (var l = 0; l < taille; l++) {
      var ligne = [];
      for (var c = 0; c < taille; c++) ligne.push([]);
      textes.push(ligne);
    }
    return textes;
  }

  /* Texte lu par les lecteurs d'écran pour une case. */
  function libelleCase(l, c, valeur, depart, textesSignes, enErreur) {
    var texte = "Ligne " + (l + 1) + ", colonne " + (c + 1) + " : " + nomSymbole(valeur);
    if (depart) texte += " (case de départ)";
    var signes = textesSignes[l][c];
    for (var i = 0; i < signes.length; i++) texte += ", " + signes[i];
    if (enErreur) texte += ", règle non respectée";
    return texte;
  }

  function trouverCase(conteneur, l, c) {
    return conteneur.querySelector('.case[data-ligne="' + l + '"][data-colonne="' + c + '"]');
  }

  /* Élément qui porte l'aria-label : le bouton pour une case à remplir, la case elle-même sinon. */
  function elementLibelle(caseEl) {
    return caseEl.querySelector(".case__bouton") || caseEl;
  }

  /* Ajoute un signe à la grille affichée et mémorise sa description pour les deux cases. */
  function afficherSigne(conteneur, signe, index, textesSignes) {
    var l2 = signe.direction === Grille.BAS ? signe.ligne + 1 : signe.ligne;
    var c2 = signe.direction === Grille.DROITE ? signe.colonne + 1 : signe.colonne;
    var caseA = trouverCase(conteneur, signe.ligne, signe.colonne);
    var caseB = trouverCase(conteneur, l2, c2);
    if (!caseA || !caseB) return;

    caseA.appendChild(creerSigne(signe, index));

    var versB = signe.direction === Grille.DROITE ? "la case à droite" : "la case en dessous";
    var versA = signe.direction === Grille.DROITE ? "la case à gauche" : "la case au-dessus";
    textesSignes[signe.ligne][signe.colonne].push(texteSigne(signe) + " avec " + versB);
    textesSignes[l2][c2].push(texteSigne(signe) + " avec " + versA);
  }

  /* Remplace le symbole affiché dans un bouton de case par celui de « valeur ». */
  function afficherValeurBouton(bouton, valeur) {
    var ancien = bouton.querySelector(".symbole");
    if (ancien) bouton.removeChild(ancien);
    if (valeur !== Grille.VIDE) bouton.appendChild(creerSymbole(valeur));
  }

  function annoncer(zone, texte) {
    if (zone) zone.textContent = texte;
  }

  /*
   * Signale en direct les règles non respectées (calculées par Grille.trouverViolations) :
   *   - case--erreur : case en rouge (trois symboles identiques côte à côte, ou signe non respecté) ;
   *   - case--exces  : case d'une ligne ou d'une colonne qui a plus de 3 soleils ou de 3 lunes (surlignage) ;
   *   - signe--erreur : signe « = » ou « × » non respecté, en rouge.
   * Tous les signalements sont recalculés à chaque fois : une erreur corrigée disparaît.
   * Met aussi à jour les libellés accessibles des cases. Renvoie les violations trouvées.
   */
  function afficherViolations(conteneur, partie, etat, textesSignes) {
    var violations = Grille.trouverViolations(partie, etat);

    for (var l = 0; l < partie.taille; l++) {
      for (var c = 0; c < partie.taille; c++) {
        var caseEl = trouverCase(conteneur, l, c);
        if (!caseEl) continue;
        var enErreur = violations.cases[l][c];
        var enExces = violations.lignes[l] || violations.colonnes[c];
        caseEl.classList.toggle("case--erreur", enErreur);
        caseEl.classList.toggle("case--exces", enExces);
        elementLibelle(caseEl).setAttribute(
          "aria-label",
          libelleCase(l, c, etat[l][c], Grille.estCaseDepart(partie, l, c), textesSignes, enErreur || enExces)
        );
      }
    }

    var signesEl = conteneur.querySelectorAll(".signe");
    for (var s = 0; s < signesEl.length; s++) {
      var index = Number(signesEl[s].dataset.index);
      signesEl[s].classList.toggle("signe--erreur", violations.signes[index] === true);
    }

    return violations;
  }

  /* Phrase qui résume les règles non respectées, pour la zone aria-live. */
  function texteViolations(violations) {
    var morceaux = [];
    if (violations.nbTriplets > 0) morceaux.push("trois symboles identiques côte à côte");
    if (violations.nbExces > 0) morceaux.push("plus de trois soleils ou de trois lunes dans une ligne ou une colonne");
    if (violations.nbSignes > 0) morceaux.push("signe égal ou opposé non respecté");
    if (morceaux.length === 0) return "";
    return "Règle non respectée : " + morceaux.join(" ; ") + ".";
  }

  /*
   * Dessine la grille et gère la saisie. « evenements » (facultatif) :
   *   surCoup()     : appelé à chaque case changée par le joueur (démarre le chronomètre) ;
   *   surVictoire() : appelé une fois, quand la grille est résolue (la grille est alors verrouillée).
   * « messageIndice » (facultatif) : paragraphe visible où s'affiche le résultat du bouton « Hint ».
   */
  function afficherGrille(conteneur, partie, etat, zoneAnnonce, evenements, messageIndice) {
    evenements = evenements || {};
    if (messageIndice) {
      messageIndice.textContent = "";
      messageIndice.hidden = true;
    }
    var textesSignes = creerTextesSignes(partie.taille);
    conteneur.textContent = "";

    for (var l = 0; l < partie.taille; l++) {
      var ligne = document.createElement("div");
      ligne.className = "grille__ligne";
      ligne.setAttribute("role", "row");

      for (var c = 0; c < partie.taille; c++) {
        var caseEl = document.createElement("div");
        caseEl.className = "case";
        caseEl.setAttribute("role", "gridcell");
        caseEl.dataset.ligne = String(l);
        caseEl.dataset.colonne = String(c);

        if (Grille.estCaseDepart(partie, l, c)) {
          /* Case de départ : non modifiable, donc pas de bouton. */
          caseEl.classList.add("case--depart");
          caseEl.appendChild(creerSymbole(partie.depart[l][c]));
        } else {
          /* Case à remplir : un bouton, utilisable à la souris, au doigt et au clavier. */
          var bouton = document.createElement("button");
          bouton.type = "button";
          bouton.className = "case__bouton";
          afficherValeurBouton(bouton, etat[l][c]);
          caseEl.appendChild(bouton);
        }
        ligne.appendChild(caseEl);
      }
      conteneur.appendChild(ligne);
    }

    var signes = partie.signes || [];
    for (var s = 0; s < signes.length; s++) {
      afficherSigne(conteneur, signes[s], s, textesSignes);
    }

    /* Signalements et libellés accessibles, une fois les signes connus. */
    afficherViolations(conteneur, partie, etat, textesSignes);

    /* Historique des coups, pour « Undo ». */
    var historique = Grille.creerHistorique();

    /* Vrai si des règles étaient non respectées avant la dernière saisie. */
    var avaitErreurs = false;

    /* Redessine le symbole d'une case à remplir. */
    function rafraichirCase(l, c) {
      var caseEl = trouverCase(conteneur, l, c);
      var bouton = caseEl ? caseEl.querySelector(".case__bouton") : null;
      if (bouton) afficherValeurBouton(bouton, etat[l][c]);
    }

    /*
     * Marque laissée par le dernier indice (« Hint ») sur une case :
     * case--indice-erreur (case erronée) ou case--indice (case remplie par l'indice).
     * Elle disparaît, avec le message de l'indice, au changement suivant de la grille.
     */
    function effacerMarqueIndice() {
      var marquees = conteneur.querySelectorAll(".case--indice-erreur, .case--indice");
      for (var i = 0; i < marquees.length; i++) {
        marquees[i].classList.remove("case--indice-erreur", "case--indice");
      }
      afficherMessageIndice("");
    }

    /* « marque » : { ligne, colonne, type } renvoyé par Grille.demanderIndice. */
    function appliquerMarqueIndice(marque) {
      var caseEl = trouverCase(conteneur, marque.ligne, marque.colonne);
      if (!caseEl) return;
      caseEl.classList.add(marque.type === "erreur" ? "case--indice-erreur" : "case--indice");
      var cible = elementLibelle(caseEl);
      var precision = marque.type === "erreur" ? ", signalée erronée par l'indice" : ", remplie par l'indice";
      cible.setAttribute("aria-label", cible.getAttribute("aria-label") + precision);
    }

    function afficherMessageIndice(texte) {
      if (!messageIndice) return;
      messageIndice.textContent = texte;
      messageIndice.hidden = texte === "";
    }

    /* Recalcule les signalements et annonce le message, complété par l'état des règles. */
    function terminerChangement(message) {
      effacerMarqueIndice();
      var violations = afficherViolations(conteneur, partie, etat, textesSignes);
      var erreurs = texteViolations(violations);
      if (erreurs) {
        message += " " + erreurs;
      } else if (avaitErreurs) {
        message += " Plus aucune règle non respectée.";
      }
      avaitErreurs = erreurs !== "";
      annoncer(zoneAnnonce, message);
      verifierVictoire();
    }

    /* Vrai une fois la grille résolue : plus aucune saisie n'est possible. */
    var termine = false;

    function verifierVictoire() {
      if (termine || !Grille.estResolue(partie, etat)) return;
      termine = true;
      var boutons = conteneur.querySelectorAll(".case__bouton");
      for (var i = 0; i < boutons.length; i++) boutons[i].disabled = true;
      if (evenements.surVictoire) evenements.surVictoire();
    }

    /* Un seul écouteur pour toute la grille : clic souris, tap mobile ou Entrée/Espace au clavier. */
    function surClic(evenement) {
      if (termine) return;
      var bouton = evenement.target.closest ? evenement.target.closest(".case__bouton") : null;
      if (!bouton || !conteneur.contains(bouton)) return;
      var caseCliquee = bouton.parentNode;
      var lc = Number(caseCliquee.dataset.ligne);
      var cc = Number(caseCliquee.dataset.colonne);

      var nouvelle = Grille.jouerCoup(partie, etat, historique, lc, cc);
      if (nouvelle === null) return; /* case de départ : rien ne change */

      if (evenements.surCoup) evenements.surCoup();
      afficherValeurBouton(bouton, nouvelle);
      terminerChangement("Ligne " + (lc + 1) + ", colonne " + (cc + 1) + " : " + nomSymbole(nouvelle) + ".");
    }
    conteneur.addEventListener("click", surClic);

    return {
      /* Détache la saisie de cette grille (avant d'en afficher une nouvelle dans le même conteneur). */
      arreter: function () {
        conteneur.removeEventListener("click", surClic);
      },
      /* « Undo » : annule le dernier coup joué. */
      annuler: function () {
        if (termine) return;
        var coup = Grille.annulerCoup(etat, historique);
        if (coup === null) {
          annoncer(zoneAnnonce, "Aucun coup à annuler.");
          return;
        }
        rafraichirCase(coup.ligne, coup.colonne);
        terminerChangement(
          "Coup annulé. Ligne " + (coup.ligne + 1) + ", colonne " + (coup.colonne + 1) + " : " + nomSymbole(coup.valeur) + "."
        );
      },
      /*
       * « Hint » : signale une case erronée, sinon remplit une case qui se déduit
       * logiquement, sinon indique qu'il n'y a ni l'un ni l'autre (grille inchangée).
       */
      indice: function () {
        if (termine) return;
        var indice = Grille.demanderIndice(partie, etat);
        var position = "ligne " + (indice.ligne + 1) + ", colonne " + (indice.colonne + 1);
        var message;

        if (indice.type === "erreur") {
          effacerMarqueIndice();
          message = "Indice : la case " + position + " est erronée. Changez son symbole.";
          appliquerMarqueIndice(indice);
        } else if (indice.type === "deduction") {
          Grille.poserIndice(partie, etat, historique, indice.ligne, indice.colonne, indice.valeur);
          if (evenements.surCoup) evenements.surCoup();
          rafraichirCase(indice.ligne, indice.colonne);
          message = "Indice : " + position + " : " + nomSymbole(indice.valeur) + ". " + (Solveur.REGLES[indice.regle] || "");
          terminerChangement(message);
          if (termine) return; /* dernière case : le message de victoire prend le relais */
          appliquerMarqueIndice(indice);
        } else {
          effacerMarqueIndice();
          message = "Indice : aucune case ne peut être déduite pour l'instant, et aucune erreur n'a été trouvée.";
        }

        afficherMessageIndice(message);
        annoncer(zoneAnnonce, message);
      },
      /* « Reset » : vide toutes les cases saisies, seules les cases de départ restent. */
      reinitialiser: function () {
        if (termine) return;
        Grille.reinitialiser(partie, etat, historique);
        for (var l = 0; l < partie.taille; l++) {
          for (var c = 0; c < partie.taille; c++) rafraichirCase(l, c);
        }
        terminerChangement("Grille réinitialisée : seules les cases de départ restent.");
      }
    };
  }

  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
    "septembre", "octobre", "novembre", "décembre"];

  /* « vendredi 27 novembre 2026 » (sans dépendre de la langue du navigateur). */
  function texteDate(date) {
    var jour = date.getDate() === 1 ? "1er" : String(date.getDate());
    return JOURS[date.getDay()] + " " + jour + " " + MOIS[date.getMonth()] + " " + date.getFullYear();
  }

  /*
   * Affichage du chronomètre (la logique est dans chrono.js).
   * Il démarre au premier changement de la grille, pas au chargement de la page.
   */
  function creerAffichageChrono(chronoEl) {
    var chrono = Chrono.creer();
    var minuterie = null;

    function rafraichir() {
      if (chronoEl) chronoEl.textContent = Chrono.formater(Chrono.secondesEcoulees(chrono, Date.now()));
    }

    function arreterMinuterie() {
      if (minuterie !== null) {
        clearInterval(minuterie);
        minuterie = null;
      }
    }

    return {
      /* Démarre au premier appel ; les appels suivants sont sans effet. */
      demarrer: function () {
        if (Chrono.estDemarre(chrono)) return;
        Chrono.demarrer(chrono, Date.now());
        rafraichir();
        minuterie = setInterval(rafraichir, 250);
      },
      /* Arrête le chronomètre et renvoie le temps final, en secondes. */
      arreter: function () {
        Chrono.arreter(chrono, Date.now());
        arreterMinuterie();
        rafraichir();
        return Chrono.secondesEcoulees(chrono, Date.now());
      },
      /* Remet le chronomètre à zéro (0:00), arrêté jusqu'au prochain changement de la grille. */
      remettreAZero: function () {
        arreterMinuterie();
        chrono = Chrono.creer();
        rafraichir();
      }
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    var conteneur = document.getElementById("grille");
    if (!conteneur) return;
    var aujourdhui = new Date();
    var zoneAnnonce = document.getElementById("annonce-grille");
    var dateEl = document.getElementById("date-grille");
    var victoireEl = document.getElementById("victoire");
    var tempsFinalEl = document.getElementById("temps-final");
    var boutonRejouer = document.getElementById("bouton-rejouer");
    var boutonAnnuler = document.getElementById("bouton-annuler");
    var boutonReinitialiser = document.getElementById("bouton-reinitialiser");
    var boutonIndice = document.getElementById("bouton-indice");
    var messageIndice = document.getElementById("message-indice");
    var chrono = creerAffichageChrono(document.getElementById("chrono"));

    var partie = null;
    var jeu = null;
    var numeroBonus = 0;

    function activerCommandes(actives) {
      if (boutonAnnuler) boutonAnnuler.disabled = !actives;
      if (boutonReinitialiser) boutonReinitialiser.disabled = !actives;
      if (boutonIndice) boutonIndice.disabled = !actives;
    }

    /* Grille résolue : chronomètre arrêté, message de félicitations avec le temps final. */
    function afficherVictoire() {
      var secondes = chrono.arreter();
      if (tempsFinalEl) tempsFinalEl.textContent = Chrono.formater(secondes);
      activerCommandes(false);
      if (victoireEl) victoireEl.hidden = false;
      annoncer(
        zoneAnnonce,
        "Félicitations, grille résolue en " + Chrono.texteDuree(secondes) + " ! Bouton « Rejouer » pour lancer une nouvelle grille."
      );
      if (boutonRejouer) boutonRejouer.focus();
    }

    /* Affiche une partie toute neuve : grille vierge, chronomètre à 0:00, message de victoire masqué. */
    function lancerPartie(nouvellePartie, libelleDate) {
      if (jeu) jeu.arreter();
      partie = nouvellePartie;
      chrono.remettreAZero();
      if (victoireEl) victoireEl.hidden = true;
      activerCommandes(true);

      /* Date de la grille affichée : permet de vérifier qu'on joue la même grille que ses proches. */
      if (dateEl) {
        dateEl.textContent = libelleDate;
        if (partie.cle) {
          dateEl.setAttribute("datetime", partie.cle);
        } else {
          dateEl.removeAttribute("datetime"); /* grille aléatoire : liée à aucune date */
        }
      }

      jeu = afficherGrille(conteneur, partie, Grille.creerEtatJeu(partie), zoneAnnonce, {
        surCoup: chrono.demarrer,
        surVictoire: afficherVictoire
      }, messageIndice);
    }

    lancerPartie(Grille.creerPartieDuJour(aujourdhui), "Grille du " + texteDate(aujourdhui));

    if (boutonAnnuler) boutonAnnuler.addEventListener("click", function () { jeu.annuler(); });
    if (boutonReinitialiser) boutonReinitialiser.addEventListener("click", function () { jeu.reinitialiser(); });
    if (boutonIndice) boutonIndice.addEventListener("click", function () { jeu.indice(); });

    /* Après le lancement d'une nouvelle grille : annonce et focus sur la première case à remplir. */
    function signalerNouvelleGrille(texte) {
      annoncer(zoneAnnonce, texte + " Le chronomètre est à zéro et démarrera à votre premier coup.");
      var premiereCase = conteneur.querySelector(".case__bouton");
      if (premiereCase) premiereCase.focus();
    }

    /* « Rejouer » : nouvelle grille (grille bonus suivante du jour) et chronomètre à zéro. */
    if (boutonRejouer) {
      boutonRejouer.addEventListener("click", function () {
        numeroBonus++;
        lancerPartie(
          Grille.creerPartieBonus(aujourdhui, numeroBonus, partie),
          "Grille bonus n°" + numeroBonus + " du " + texteDate(aujourdhui)
        );
        signalerNouvelleGrille("Nouvelle grille lancée.");
      });
    }

    /*
     * « Nouvelle grille aléatoire » : utilisable à tout moment (même grille résolue).
     * La graine est tirée au hasard ; la grille garde les garanties de grille.js
     * (solution unique, résoluble sans deviner). Chronomètre, historique des coups
     * et signalements repartent de zéro (lancerPartie).
     */
    var numeroAleatoire = 0;
    var boutonAleatoire = document.getElementById("bouton-aleatoire");
    if (boutonAleatoire) {
      boutonAleatoire.addEventListener("click", function () {
        numeroAleatoire++;
        var graine = Math.floor(Math.random() * 4294967296);
        lancerPartie(Grille.creerPartieAleatoire(graine, partie), "Grille aléatoire n°" + numeroAleatoire);
        signalerNouvelleGrille("Nouvelle grille aléatoire affichée.");
      });
    }
  });
})();
