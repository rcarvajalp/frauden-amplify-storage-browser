import {
  componentsDefault,
  createAmplifyAuthAdapter,
  createStorageBrowser,
} from '@aws-amplify/ui-react-storage/browser';
import '@aws-amplify/ui-react/styles.css';
import '@aws-amplify/ui-react-storage/styles.css';
import './App.css';
import config from '../amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import { I18n } from 'aws-amplify/utils';
import { Authenticator, Button, translations } from '@aws-amplify/ui-react';
import fraudenLogo from './assets/frauden-logo.svg';

Amplify.configure(config);
I18n.putVocabularies(translations);
I18n.setLanguage('es');

const { StorageBrowser } = createStorageBrowser({
  config: createAmplifyAuthAdapter(),
  components: componentsDefault,
});

type StorageBrowserDisplayText = NonNullable<Parameters<typeof StorageBrowser>[0]['displayText']>;

const authenticatorComponents = {
  Header() {
    return (
      <div className="auth-brand">
        <img className="auth-brand-logo" src={fraudenLogo} alt="Frauden" />
      </div>
    );
  },
};

const storageBrowserDisplayText: StorageBrowserDisplayText = {
  LocationsView: {
    title: 'Inicio',
    searchPlaceholder: 'Filtrar carpetas y archivos',
    searchSubmitLabel: 'Buscar',
    searchClearLabel: 'Limpiar búsqueda',
    loadingIndicatorLabel: 'Cargando',
    tableColumnBucketHeader: 'Bucket',
    tableColumnFolderHeader: 'Carpeta',
    tableColumnPermissionsHeader: 'Permisos',
    tableColumnActionsHeader: 'Acciones',
    getPermissionName: (permissions) => {
      const canRead = permissions.includes('get') || permissions.includes('list');
      const canWrite = permissions.includes('write') || permissions.includes('delete');

      if (canRead && canWrite) return 'Lectura/Escritura';
      if (canRead) return 'Lectura';
      if (canWrite) return 'Escritura';

      return permissions.join('/');
    },
    getDownloadLabel: (fileName) => `Descargar ${fileName}`,
    getListLocationsResultMessage: (data) => {
      const { isLoading, items, hasExhaustedSearch, hasError = false, message } = data ?? {};

      if (isLoading) return undefined;
      if (hasError) {
        return {
          type: 'error',
          content: message ?? 'Ocurrió un error al cargar las ubicaciones.',
        };
      }
      if (items?.length === 0 && !hasExhaustedSearch) {
        return { type: 'info', content: 'No hay carpetas ni archivos.' };
      }
      if (hasExhaustedSearch) {
        return {
          type: 'info',
          content: 'Se muestran resultados de hasta los primeros 10,000 elementos.',
        };
      }

      return undefined;
    },
  },
  LocationDetailView: {
    loadingIndicatorLabel: 'Cargando',
    searchPlaceholder: 'Buscar en la carpeta actual',
    searchSubmitLabel: 'Buscar',
    searchClearLabel: 'Limpiar búsqueda',
    searchSubfoldersToggleLabel: 'Incluir subcarpetas',
    selectFileLabel: 'Seleccionar archivo',
    selectAllFilesLabel: 'Seleccionar todos los archivos',
    tableColumnLastModifiedHeader: 'Última modificación',
    tableColumnNameHeader: 'Nombre',
    tableColumnSizeHeader: 'Tamaño',
    tableColumnTypeHeader: 'Tipo',
    getTitle: ({ current, key }) => key || current?.bucket || '',
    getActionListItemLabel: (key = '') => {
      const labels: Record<string, string> = {
        Copy: 'Copiar',
        Delete: 'Eliminar',
        'Create folder': 'Crear carpeta',
        Upload: 'Subir',
      };

      return labels[key] ?? key;
    },
    getListItemsResultMessage: (data) => {
      const { items, hasExhaustedSearch, hasError = false, message, isLoading } = data ?? {};

      if (isLoading) return undefined;
      if (hasError) {
        return {
          type: 'error',
          content: message ?? 'Ocurrió un error al cargar los elementos.',
        };
      }
      if (!items?.length && hasExhaustedSearch) {
        return {
          type: 'info',
          content: 'No se encontraron resultados en los primeros 10,000 elementos.',
        };
      }
      if (!items?.length) return { type: 'info', content: 'No hay archivos.' };
      if (hasExhaustedSearch) {
        return {
          type: 'info',
          content: 'Se muestran resultados de hasta los primeros 10,000 elementos.',
        };
      }

      return undefined;
    },
  },
  UploadView: {
    title: 'Subir',
    actionStartLabel: 'Subir',
    actionCancelLabel: 'Cancelar',
    actionExitLabel: 'Salir',
    addFilesLabel: 'Agregar archivos',
    addFolderLabel: 'Agregar carpeta',
    overwriteToggleLabel: 'Sobrescribir archivos existentes',
    statusDisplayCanceledLabel: 'Cancelado',
    statusDisplayCompletedLabel: 'Completado',
    statusDisplayFailedLabel: 'Fallido',
    statusDisplayInProgressLabel: 'En progreso',
    statusDisplayOverwritePreventedLabel: 'Sobrescritura evitada',
    statusDisplayQueuedLabel: 'Sin iniciar',
    statusDisplayTotalLabel: 'Total',
    tableColumnFolderHeader: 'Carpeta',
    tableColumnNameHeader: 'Nombre',
    tableColumnTypeHeader: 'Tipo',
    tableColumnSizeHeader: 'Tamaño',
    tableColumnStatusHeader: 'Estado',
    tableColumnProgressHeader: 'Progreso',
    getActionCompleteMessage: () => ({
      content: 'Proceso de carga finalizado.',
      type: 'success',
    }),
  },
  DeleteView: {
    title: 'Eliminar',
    actionStartLabel: 'Eliminar',
    actionCancelLabel: 'Cancelar',
    actionExitLabel: 'Salir',
    statusDisplayCanceledLabel: 'Cancelado',
    statusDisplayCompletedLabel: 'Completado',
    statusDisplayFailedLabel: 'Fallido',
    statusDisplayInProgressLabel: 'En progreso',
    statusDisplayQueuedLabel: 'Sin iniciar',
    statusDisplayTotalLabel: 'Total',
    tableColumnFolderHeader: 'Carpeta',
    tableColumnNameHeader: 'Nombre',
    tableColumnTypeHeader: 'Tipo',
    tableColumnSizeHeader: 'Tamaño',
    tableColumnStatusHeader: 'Estado',
    getActionCompleteMessage: () => ({
      content: 'Proceso de eliminación finalizado.',
      type: 'success',
    }),
  },
  CopyView: {
    title: 'Copiar',
    actionStartLabel: 'Copiar',
    actionCancelLabel: 'Cancelar',
    actionExitLabel: 'Salir',
    actionDestinationLabel: 'Destino de la copia',
    loadingIndicatorLabel: 'Cargando' as 'Loading',
    overwriteWarningMessage:
      'Los archivos copiados sobrescribirán archivos existentes en el destino seleccionado.',
    searchPlaceholder: 'Buscar carpetas',
    searchSubmitLabel: 'Buscar',
    searchClearLabel: 'Limpiar búsqueda',
    statusDisplayCanceledLabel: 'Cancelado',
    statusDisplayCompletedLabel: 'Completado',
    statusDisplayFailedLabel: 'Fallido',
    statusDisplayInProgressLabel: 'En progreso',
    statusDisplayQueuedLabel: 'Sin iniciar',
    statusDisplayTotalLabel: 'Total',
    tableColumnFolderHeader: 'Carpeta',
    tableColumnNameHeader: 'Nombre',
    tableColumnTypeHeader: 'Tipo',
    tableColumnSizeHeader: 'Tamaño',
    tableColumnStatusHeader: 'Estado',
    tableColumnProgressHeader: 'Progreso',
    getListFoldersResultsMessage: ({ folders, query, hasError, message, hasExhaustedSearch }) => {
      if (!folders?.length) {
        return {
          content: query
            ? `No se encontraron carpetas que coincidan con "${query}".`
            : 'No se encontraron subcarpetas en la carpeta seleccionada.',
          type: 'info',
        };
      }
      if ((message && query) || hasError)
        return { content: 'Error al cargar carpetas.', type: 'error' };
      if (hasExhaustedSearch) {
        return {
          content: 'Se muestran resultados de hasta los primeros 10,000 elementos.',
          type: 'info',
        };
      }

      return undefined;
    },
    getActionCompleteMessage: () => ({
      content: 'Proceso de copia finalizado.',
      type: 'success',
    }),
  },
  CreateFolderView: {
    title: 'Crear carpeta',
    actionStartLabel: 'Crear carpeta',
    actionCancelLabel: 'Cancelar',
    actionExitLabel: 'Salir',
    actionDestinationLabel: 'Destino',
    folderNameLabel: 'Nombre de la carpeta',
    folderNamePlaceholder: 'No puede contener "/" ni empezar o terminar con "."',
    getValidationMessage: () => 'El nombre no puede contener "/" ni empezar o terminar con "."',
    getActionCompleteMessage: () => ({
      content: 'Carpeta creada.',
      type: 'success',
    }),
  },
};

function App() {
  return (
    <Authenticator components={authenticatorComponents} hideSignUp>
      {({ signOut, user }) => (
        <main className="app-shell">
          <header className="site-header">
            <a className="brand" href="/" aria-label="Frauden - Inicio">
              <img className="brand-logo" src={fraudenLogo} alt="Frauden" />
            </a>
            <div className="header-actions">
              <div className="user-card" aria-label="Usuario conectado">
                <span className="eyebrow">Sesión activa</span>
                <strong>{user?.username ?? 'Usuario'}</strong>
              </div>
              <Button className="sign-out-button" variation="primary" onClick={signOut}>
                Cerrar sesión
              </Button>
            </div>
          </header>

          <section className="hero-card" aria-labelledby="storage-title">
            <div>
              <span className="eyebrow">Panel seguro</span>
              <h1 id="storage-title">Gestor documental de Frauden</h1>
              <p>
                carga archivos y organiza de forma segura y sencilla el archivo documental de
                Frauden.
              </p>
            </div>
          </section>

          <section className="storage-card" aria-label="Explorador de almacenamiento">
            <StorageBrowser displayText={storageBrowserDisplayText} />
          </section>
        </main>
      )}
    </Authenticator>
  );
}

export default App;
