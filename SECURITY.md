# 🔒 Politique de Sécurité

## Versions Supportées

| Version | Supportée          |
| ------- | ------------------ |
| 1.0.x   | ✅ Oui             |
| < 1.0   | ❌ Non             |

## Signaler une Vulnérabilité

Si vous découvrez une vulnérabilité de sécurité, **NE PAS** créer d'issue publique.

### Procédure

1. **Envoyez un email** à : security@ascartel.com
2. **Incluez** :
   - Description détaillée de la vulnérabilité
   - Étapes pour reproduire
   - Impact potentiel
   - Suggestions de correction (si possible)

3. **Délai de réponse** : 48 heures maximum

### Ce que nous faisons

- ✅ Accusé de réception sous 48h
- ✅ Évaluation de la vulnérabilité
- ✅ Développement d'un correctif
- ✅ Publication d'un patch
- ✅ Crédit au découvreur (si souhaité)

## Bonnes Pratiques de Sécurité

### Pour les Développeurs

1. **Variables d'environnement**
   - Ne jamais commiter `.env`
   - Utiliser des clés JWT fortes (64+ caractères)
   - Changer les identifiants par défaut

2. **Dépendances**
   - Mettre à jour régulièrement : `npm audit fix`
   - Vérifier les vulnérabilités : `npm audit`

3. **Code**
   - Valider toutes les entrées utilisateur
   - Utiliser des requêtes préparées (SQL)
   - Limiter les tentatives de connexion

### Pour les Déploiements

1. **HTTPS obligatoire** en production
2. **Firewall** configuré (ports 80, 443 uniquement)
3. **Backups** automatiques quotidiens
4. **Monitoring** actif (Uptime Robot, etc.)
5. **Logs** sécurisés et surveillés

## Checklist de Sécurité

Avant de déployer en production :

- [ ] JWT_SECRET changé et fort
- [ ] Identifiants admin modifiés
- [ ] HTTPS activé
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] Helmet configuré
- [ ] Logs activés
- [ ] Backups configurés
- [ ] Monitoring en place
- [ ] Variables sensibles dans .env

## Vulnérabilités Connues

Aucune vulnérabilité connue actuellement.

Dernière mise à jour : 2025-01-XX
