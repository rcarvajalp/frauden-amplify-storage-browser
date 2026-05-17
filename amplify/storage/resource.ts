import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'frauden',
  isDefault: true,
  access: (allow) => ({
    'doctrina/*': [
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write']),
      allow.groups(['eliminadores']).to(['delete']),
    ],
    'medios/*': [
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write']),
      allow.groups(['eliminadores']).to(['delete']),
    ],
    'jurisprudencia/*': [
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write']),
      allow.groups(['eliminadores']).to(['delete']),
    ],
    'legislacion/*': [
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write']),
      allow.groups(['eliminadores']).to(['delete']),
    ],
  }),
});

export const secondaryStorage = defineStorage({
  name: 'frauden-expedientes',
  access: (allow) => ({
    'publico/*': [
      allow.authenticated.to(['read', 'write']),
      allow.groups(['eliminadores']).to(['delete']),
    ],
    'confidencial/*': [
      allow.groups(['admin']).to(['read', 'write']),
      allow.groups(['eliminadores']).to(['delete']),
    ],
    'privado/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write']),
      allow.groups(['eliminadores']).to(['delete']),
    ],
  }),
});
