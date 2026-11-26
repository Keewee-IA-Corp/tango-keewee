/*
 * chrono.js — Logique du chronomètre (aucun affichage ici).
 *
 * Le chronomètre ne lit pas l'heure lui-même : on lui passe l'instant
 * « maintenant » (en millisecondes, par exemple Date.now()). Cela le rend
 * simple à tester et indépendant de l'affichage.
 *
 * Un chronomètre est un objet { debut, fin } :
 *   - debut : instant du démarrage, ou null s'il n'a pas encore démarré ;
 *   - fin   : instant de l'arrêt, ou null s'il tourne encore.
 */
var Chrono = (function () {
  "use strict";

  /* Chronomètre à zéro, pas encore démarré. */
  function creer() {
    return { debut: null, fin: null };
  }

  function estDemarre(chrono) {
    return chrono.debut !== null;
  }

  function estArrete(chrono) {
    return chrono.fin !== null;
  }

  /* Démarre le chronomètre (sans effet s'il a déjà démarré). */
  function demarrer(chrono, maintenant) {
    if (!estDemarre(chrono)) chrono.debut = maintenant;
  }

  /* Arrête le chronomètre (sans effet s'il n'a pas démarré ou s'il est déjà arrêté). */
  function arreter(chrono, maintenant) {
    if (estDemarre(chrono) && !estArrete(chrono)) chrono.fin = maintenant;
  }

  /* Nombre de secondes entières écoulées (figé une fois le chronomètre arrêté). */
  function secondesEcoulees(chrono, maintenant) {
    if (!estDemarre(chrono)) return 0;
    var reference = estArrete(chrono) ? chrono.fin : maintenant;
    return Math.max(0, Math.floor((reference - chrono.debut) / 1000));
  }

  /* Format « m:ss » : 7 → « 0:07 », 83 → « 1:23 », 600 → « 10:00 ». */
  function formater(secondes) {
    var minutes = Math.floor(secondes / 60);
    var reste = secondes % 60;
    return minutes + ":" + (reste < 10 ? "0" : "") + reste;
  }

  /* Durée en toutes lettres, pour les lecteurs d'écran : « 1 minute et 7 secondes ». */
  function texteDuree(secondes) {
    var minutes = Math.floor(secondes / 60);
    var reste = secondes % 60;
    var texteSecondes = reste + (reste > 1 ? " secondes" : " seconde");
    if (minutes === 0) return texteSecondes;
    var texteMinutes = minutes + (minutes > 1 ? " minutes" : " minute");
    return reste === 0 ? texteMinutes : texteMinutes + " et " + texteSecondes;
  }

  return {
    creer: creer,
    estDemarre: estDemarre,
    estArrete: estArrete,
    demarrer: demarrer,
    arreter: arreter,
    secondesEcoulees: secondesEcoulees,
    formater: formater,
    texteDuree: texteDuree
  };
})();
