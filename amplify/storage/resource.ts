import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'frauden-bucket',
  isDefault: true,
  access: (allow) => ({
    'doctrina/*': [
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],
    'medios/*': [
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],
    'jurisprudencia/*': [
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],
    'legislacion/*': [
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],
  }),
});

export const secondaryStorage = defineStorage({
  name: 'frauden-expedientes',
  access: (allow) => ({
    'publico/*': [allow.authenticated.to(['read', 'write', 'delete'])],
    'confidencial/*': [allow.groups(['admin']).to(['read', 'write', 'delete'])],
    'privado/{entity_id}/*': [allow.entity('identity').to(['read', 'write', 'delete'])],
  }),
});
